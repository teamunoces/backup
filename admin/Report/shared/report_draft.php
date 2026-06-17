<?php
function draft_pdo(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $pdo = new PDO(
        "mysql:host=localhost;dbname=ces_database;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
    return $pdo;
}

function draft_json(array $payload, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function draft_table(string $table): string {
    $aliases = [
        '3ydp' => 'report_3ydp',
        '3ydp_programs' => 'report_3ydp_programs',
        'cert_appearance' => 'report_cert_appearance',
        'coordinator_cnacr' => 'report_coordinator_cnacr',
        'cnacr' => 'report_cnacr',
        'mar_header' => 'report_mar_header',
        'mar_table' => 'report_mar_table',
        'narrative_report' => 'report_narrative',
        'program_monitoring_form' => 'report_program_monitoring_form',
        'reflection_paper' => 'report_reflection_paper',
        'evaluation_reports' => 'report_evaluation',
        'pd_main' => 'report_pd_main',
        'pd_detail' => 'report_pd_detail'
    ];

    $allowed = [
        'report_3ydp',
        'report_3ydp_programs',
        'report_cert_appearance',
        'report_cnacr',
        'report_coordinator_cnacr',
        'report_mar_header',
        'report_mar_table',
        'report_narrative',
        'report_program_monitoring_form',
        'report_reflection_paper',
        'report_evaluation',
        'report_pd_main',
        'report_pd_detail'
    ];

    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $table = $aliases[$table] ?? $table;

    if (!in_array($table, $allowed, true)) {
        draft_json(['success' => false, 'message' => 'Invalid report table.'], 400);
    }

    return $table;
}

function draft_require_user(): array {
    if (!isset($_SESSION['user_id'])) {
        draft_json(['success' => false, 'message' => 'User not logged in'], 401);
    }

    return [
        'user_id' => (string) ($_SESSION['user_id'] ?? ''),
        'name' => $_SESSION['name'] ?? 'Unknown User',
        'role' => $_SESSION['role'] ?? '',
        'department' => $_SESSION['department'] ?? '',
        'dean' => $_SESSION['dean'] ?? ''
    ];
}

function draft_input(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

function draft_ensure_status(PDO $pdo, string $table): void {
    $table = draft_table($table);
    $stmt = $pdo->query("SHOW COLUMNS FROM `$table` LIKE 'status'");
    $column = $stmt->fetch();
    if (!$column || stripos($column['Type'], 'enum(') !== 0 || strpos($column['Type'], "'draft'") !== false) {
        return;
    }

    preg_match_all("/'((?:[^'\\\\]|\\\\.)*)'/", $column['Type'], $matches);
    $values = array_map(fn($value) => $pdo->quote(stripslashes($value)), $matches[1]);
    $values[] = $pdo->quote('draft');
    $nullSql = strtoupper($column['Null']) === 'YES' ? 'NULL' : 'NOT NULL';
    $defaultSql = $column['Default'] !== null ? " DEFAULT " . $pdo->quote($column['Default']) : '';
    $pdo->exec("ALTER TABLE `$table` MODIFY `status` ENUM(" . implode(',', $values) . ") $nullSql$defaultSql");
}

function draft_columns(PDO $pdo, string $table): array {
    $table = draft_table($table);
    $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
    $columns = [];
    foreach ($stmt->fetchAll() as $column) {
        $columns[] = $column['Field'];
    }
    return $columns;
}

function draft_meta(PDO $pdo, array $user): array {
    $approval = [
        'dean' => $user['dean'],
        'ces_head' => '',
        'ces_head_suffix' => '',
        'vp_acad' => '',
        'vp_acad_suffix' => '',
        'vp_admin' => '',
        'vp_admin_suffix' => '',
        'school_president' => '',
        'school_president_suffix' => ''
    ];

    $stmt = $pdo->query("
        SELECT ces_head, ces_head_suffix, vp_acad, vp_acad_suffix,
               vp_admin, vp_admin_suffix, school_president, school_president_suffix
        FROM approvals_admin
        ORDER BY updated_at DESC
        LIMIT 1
    ");
    if ($row = $stmt->fetch()) {
        $approval = array_merge($approval, $row);
    }

    $document = [
        'issue_status' => '',
        'revision_number' => '',
        'date_effective' => '',
        'approved_by' => ''
    ];
    $stmt = $pdo->query("
        SELECT issue_status, revision_number, date_effective, approved_by
        FROM approvals_document_info
        ORDER BY updated_at DESC
        LIMIT 1
    ");
    if ($row = $stmt->fetch()) {
        $document = array_merge($document, $row);
    }

    return array_merge([
        'created_by_name' => $user['name'],
        'role' => $user['role'],
        'user_id' => $user['user_id'],
        'department' => $user['department'],
        'archived' => 'not archived',
        'feedback' => ''
    ], $approval, $document);
}

function draft_find_id(PDO $pdo, string $table, string $userId, string $type): ?int {
    $table = draft_table($table);
    $stmt = $pdo->prepare("SELECT id FROM `$table` WHERE user_id = :user_id AND type = :type AND status = 'draft' ORDER BY id DESC LIMIT 1");
    $stmt->execute([':user_id' => $userId, ':type' => $type]);
    $row = $stmt->fetch();
    return $row ? (int) $row['id'] : null;
}

function draft_save_main(PDO $pdo, string $table, array $data, array $options = []): int {
    $table = draft_table($table);
    $user = draft_require_user();
    draft_ensure_status($pdo, $table);

    $status = ($data['action'] ?? '') === 'save_draft' ? 'draft' : 'pending';
    $typeKey = $options['type_key'] ?? 'type';
    $type = $data[$typeKey] ?? $data['report_type'] ?? $data['reportType'] ?? $options['default_type'] ?? '';
    $requestedDraftId = isset($data['draft_id']) ? (int) $data['draft_id'] : 0;

    $payload = array_merge($data, draft_meta($pdo, $user), [
        'type' => $type,
        'status' => $status
    ]);
    unset($payload['action'], $payload['draft_id'], $payload['report_type'], $payload['reportType']);

    $columns = draft_columns($pdo, $table);
    $payload = array_intersect_key($payload, array_flip($columns));
    unset($payload['id'], $payload['created_at']);

    $reportId = null;
    if ($requestedDraftId > 0) {
        $stmt = $pdo->prepare("SELECT id FROM `$table` WHERE id = :id AND user_id = :user_id AND status = 'draft' LIMIT 1");
        $stmt->execute([':id' => $requestedDraftId, ':user_id' => $user['user_id']]);
        $row = $stmt->fetch();
        $reportId = $row ? (int) $row['id'] : null;
    }
    if (!$reportId && $status === 'draft') {
        $reportId = draft_find_id($pdo, $table, $user['user_id'], $type);
    }

    if ($reportId) {
        $sets = [];
        $params = [':id' => $reportId, ':where_user_id' => $user['user_id']];
        foreach ($payload as $column => $value) {
            $sets[] = "`$column` = :$column";
            $params[":$column"] = is_array($value) ? json_encode($value) : $value;
        }
        $sql = "UPDATE `$table` SET " . implode(', ', $sets) . " WHERE id = :id AND user_id = :where_user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $reportId;
    }

    $columnNames = array_keys($payload);
    $placeholders = array_map(fn($column) => ":$column", $columnNames);
    $params = [];
    foreach ($payload as $column => $value) {
        $params[":$column"] = is_array($value) ? json_encode($value) : $value;
    }
    $sql = "INSERT INTO `$table` (`" . implode('`, `', $columnNames) . "`) VALUES (" . implode(', ', $placeholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return (int) $pdo->lastInsertId();
}

function draft_get_main(PDO $pdo, string $table, array $options = []): ?array {
    $table = draft_table($table);
    $user = draft_require_user();
    draft_ensure_status($pdo, $table);
    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE user_id = :user_id AND status = 'draft' ORDER BY id DESC LIMIT 1");
    $stmt->execute([':user_id' => $user['user_id']]);
    $draft = $stmt->fetch();
    return $draft ?: null;
}
?>
