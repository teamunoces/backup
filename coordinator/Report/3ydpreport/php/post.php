<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../shared/report_draft.php';

const THREE_YEAR_REPORT_TYPE = '3-year Development Plan';

function clean_3ydp_value($value): string {
    return trim((string) ($value ?? ''));
}

function transform_3ydp_payload(array $input): array {
    return [
        'action' => $input['action'] ?? 'submit',
        'draft_id' => $input['draft_id'] ?? null,
        'type' => clean_3ydp_value($input['report_type'] ?? $input['type'] ?? THREE_YEAR_REPORT_TYPE),
        'title_of_project' => clean_3ydp_value($input['title_of_project'] ?? ''),
        'description_of_project' => clean_3ydp_value($input['description_of_project'] ?? ''),
        'general_objectives' => clean_3ydp_value($input['general_objectives'] ?? ''),
        'program_justification' => clean_3ydp_value($input['program_justification'] ?? ''),
        'beneficiaries' => clean_3ydp_value($input['beneficiaries'] ?? ''),
        'program_plan_text' => clean_3ydp_value($input['program_plan_text'] ?? ''),
        'programPlanTable' => is_array($input['programPlanTable'] ?? null) ? $input['programPlanTable'] : []
    ];
}

function find_3ydp_draft_id(PDO $pdo, string $userId, string $type): ?int {
    $stmt = $pdo->prepare("SELECT id FROM `report_3ydp` WHERE user_id = :user_id AND type = :type AND status = 'draft' ORDER BY id DESC LIMIT 1");
    $stmt->execute([':user_id' => $userId, ':type' => $type]);
    $row = $stmt->fetch();
    return $row ? (int) $row['id'] : null;
}

function save_3ydp_main(PDO $pdo, array $data): int {
    $user = draft_require_user();
    draft_ensure_status($pdo, 'report_3ydp');

    $status = ($data['action'] ?? '') === 'save_draft' ? 'draft' : 'pending';
    $requestedDraftId = isset($data['draft_id']) ? (int) $data['draft_id'] : 0;
    $reportId = null;

    if ($requestedDraftId > 0) {
        $stmt = $pdo->prepare("SELECT id FROM `report_3ydp` WHERE id = :id AND user_id = :user_id AND status = 'draft' LIMIT 1");
        $stmt->execute([':id' => $requestedDraftId, ':user_id' => $user['user_id']]);
        $row = $stmt->fetch();
        $reportId = $row ? (int) $row['id'] : null;
    }

    if (!$reportId && $status === 'draft') {
        $reportId = find_3ydp_draft_id($pdo, $user['user_id'], $data['type']);
    }

    $payload = array_merge([
        'type' => $data['type'],
        'title_of_project' => $data['title_of_project'],
        'description_of_project' => $data['description_of_project'],
        'general_objectives' => $data['general_objectives'],
        'program_justification' => $data['program_justification'],
        'beneficiaries' => $data['beneficiaries'],
        'program_plan_text' => $data['program_plan_text'],
        'status' => $status
    ], draft_meta($pdo, $user));

    $columns = draft_columns($pdo, 'report_3ydp');
    $payload = array_intersect_key($payload, array_flip($columns));
    unset($payload['id'], $payload['created_at']);

    if ($reportId) {
        $sets = [];
        $params = [':id' => $reportId, ':where_user_id' => $user['user_id']];

        foreach ($payload as $column => $value) {
            $sets[] = "`$column` = :$column";
            $params[":$column"] = $value;
        }

        $sql = "UPDATE `report_3ydp` SET " . implode(', ', $sets) . " WHERE id = :id AND user_id = :where_user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $reportId;
    }

    $columnNames = array_keys($payload);
    $placeholders = array_map(fn($column) => ":$column", $columnNames);
    $params = [];

    foreach ($payload as $column => $value) {
        $params[":$column"] = $value;
    }

    $sql = "INSERT INTO `report_3ydp` (`" . implode('`, `', $columnNames) . "`) VALUES (" . implode(', ', $placeholders) . ")";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return (int) $pdo->lastInsertId();
}

function replace_3ydp_program_rows(PDO $pdo, int $reportId, array $rows): int {
    $deleteStmt = $pdo->prepare("DELETE FROM `report_3ydp_programs` WHERE report_id = :report_id");
    $deleteStmt->execute([':report_id' => $reportId]);

    if (!$rows) {
        return 0;
    }

    $stmt = $pdo->prepare("
        INSERT INTO `report_3ydp_programs`
            (report_id, program, objectives, strategies, persons_agencies_involved, resources_needed, budget, means_of_verification, time_frame)
        VALUES
            (:report_id, :program, :objectives, :strategies, :persons_agencies_involved, :resources_needed, :budget, :means_of_verification, :time_frame)
    ");
    $inserted = 0;

    foreach ($rows as $row) {
        $programRow = [
            'program' => clean_3ydp_value($row['program'] ?? ''),
            'objectives' => clean_3ydp_value($row['objectives'] ?? ''),
            'strategies' => clean_3ydp_value($row['strategies'] ?? ''),
            'persons_agencies_involved' => clean_3ydp_value($row['persons_agencies_involved'] ?? ''),
            'resources_needed' => clean_3ydp_value($row['resources_needed'] ?? ''),
            'budget' => clean_3ydp_value($row['budget'] ?? ''),
            'means_of_verification' => clean_3ydp_value($row['means_of_verification'] ?? ''),
            'time_frame' => clean_3ydp_value($row['time_frame'] ?? '')
        ];

        if (implode('', $programRow) === '') {
            continue;
        }

        $stmt->execute(array_merge([':report_id' => $reportId], array_combine(
            array_map(fn($column) => ":$column", array_keys($programRow)),
            array_values($programRow)
        )));
        $inserted++;
    }

    return $inserted;
}

function load_3ydp_draft(PDO $pdo): ?array {
    $user = draft_require_user();
    draft_ensure_status($pdo, 'report_3ydp');

    $stmt = $pdo->prepare("SELECT * FROM `report_3ydp` WHERE user_id = :user_id AND status = 'draft' ORDER BY id DESC LIMIT 1");
    $stmt->execute([':user_id' => $user['user_id']]);
    $draft = $stmt->fetch();

    if (!$draft) {
        return null;
    }

    $programStmt = $pdo->prepare("
        SELECT program, objectives, strategies, persons_agencies_involved, resources_needed, budget, means_of_verification, time_frame
        FROM `report_3ydp_programs`
        WHERE report_id = :report_id
        ORDER BY id ASC
    ");
    $programStmt->execute([':report_id' => $draft['id']]);
    $draft['programPlanTable'] = $programStmt->fetchAll();
    $draft['report_type'] = $draft['type'] ?? THREE_YEAR_REPORT_TYPE;

    return $draft;
}

try {
    $pdo = draft_pdo();
    $data = transform_3ydp_payload(draft_input());
    $action = $data['action'];

    if ($action === 'get_draft') {
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => load_3ydp_draft($pdo)
        ]);
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $pdo->beginTransaction();
        $reportId = save_3ydp_main($pdo, $data);
        $inserted = replace_3ydp_program_rows($pdo, $reportId, $data['programPlanTable']);
        $pdo->commit();

        draft_json([
            'success' => true,
            'message' => $action === 'save_draft'
                ? 'Draft saved successfully.'
                : "Report submitted with $inserted program row(s).",
            'draft_id' => $reportId,
            'report_id' => $reportId,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'program_rows' => $inserted
        ]);
    }

    draft_json(['success' => false, 'message' => 'Invalid action.'], 400);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    draft_json(['success' => false, 'message' => $e->getMessage()], 500);
}
?>
