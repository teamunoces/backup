<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_database");

if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

$reports = [];
$allowedStatuses = ['approve', 'approved', 'rejected'];
$allowedTables = [
    "report_3ydp",
    "report_cert_appearance",
    "report_coordinator_cnacr",
    "report_mar_header",
    "report_narrative",
    "report_program_monitoring_form",
    "report_reflection_paper",
    "report_evaluation",
    "report_pd_main"
];

foreach ($allowedTables as $tableName) {
    $tableLike = $conn->real_escape_string($tableName);
    $checkTable = $conn->query("SHOW TABLES LIKE '$tableLike'");
    if (!$checkTable || $checkTable->num_rows === 0) {
        continue;
    }

    $hasStatus = tableHasColumn($conn, $tableName, 'status');
    $hasRole = tableHasColumn($conn, $tableName, 'role');
    $hasArchived = tableHasColumn($conn, $tableName, 'archived');
    $hasUserId = tableHasColumn($conn, $tableName, 'user_id');
    $hasCreatedAt = tableHasColumn($conn, $tableName, 'created_at');

    if (!$hasStatus || !$hasRole) {
        continue;
    }

    $escapedTable = '`' . str_replace('`', '``', $tableName) . '`';
    $query = "SELECT r.* FROM $escapedTable r";

    if ($hasUserId) {
        $query .= " INNER JOIN `accounts`.`users` u
                    ON CAST(u.`id` AS CHAR) = CAST(r.`user_id` AS CHAR)";
    }

    $statusList = "'" . implode("','", $allowedStatuses) . "'";
    $where = [
        "LOWER(TRIM(r.`status`)) IN ($statusList)",
        "LOWER(TRIM(r.`role`)) = 'coordinator'"
    ];

    if ($hasArchived) {
        $where[] = "r.`archived` = 'not archived'";
    }

    if ($hasUserId) {
        $where[] = "u.`is_active` = 1";
    }

    $query .= " WHERE " . implode(" AND ", $where);

    if ($hasCreatedAt) {
        $query .= " ORDER BY r.`created_at` DESC";
    }

    $result = $conn->query($query);
    if (!$result) {
        continue;
    }

    while ($row = $result->fetch_assoc()) {
        $status = strtolower(trim($row['status'] ?? ''));
        if ($status === 'approved') {
            $status = 'approve';
        }

        $reports[] = [
            "id" => $row['id'] ?? null,
            "title" => getReportTitle($row),
            "department" => $row['department'] ?? $row['office'] ?? "N/A",
            "created_at" => $row['created_at'] ?? $row['date_created'] ?? null,
            "type" => $row['type'] ?? '',
            "status" => $status,
            "role" => strtolower(trim($row['role'] ?? '')),
            "source_table" => $tableName
        ];
    }
}

usort($reports, function ($first, $second) {
    $firstTime = strtotime($first['created_at'] ?? '') ?: 0;
    $secondTime = strtotime($second['created_at'] ?? '') ?: 0;

    if ($firstTime !== $secondTime) {
        return $secondTime <=> $firstTime;
    }

    return (int)($second['id'] ?? 0) <=> (int)($first['id'] ?? 0);
});

echo json_encode($reports);
$conn->close();

function tableHasColumn(mysqli $conn, string $table, string $column): bool
{
    $escapedTable = '`' . str_replace('`', '``', $table) . '`';
    $escapedColumn = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM $escapedTable LIKE '$escapedColumn'");
    if (!$result) {
        return false;
    }

    $hasColumn = $result->num_rows > 0;
    $result->free();

    return $hasColumn;
}

function getReportTitle(array $row): string
{
    foreach ([
        'title',
        'title_act',
        'title_of_project',
        'title_of_activity',
        'title_of_program',
        'program_title',
        'activity_name',
        'beneficiary_name',
        'implementing_department',
        'department'
    ] as $field) {
        if (isset($row[$field]) && trim((string)$row[$field]) !== '') {
            return $row[$field];
        }
    }

    return "N/A";
}
?>
