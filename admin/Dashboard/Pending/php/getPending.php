<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_database"; 

try {
    $conn = new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $allowedStatuses = ['pending', 'need fix'];
    $statusParam = $_GET['status'] ?? 'pending,need fix';
    $statusArray = array_map(
        fn($status) => strtolower(trim($status)),
        explode(',', $statusParam)
    );
    $statusArray = array_values(array_intersect($allowedStatuses, $statusArray));

    if (empty($statusArray)) {
        $statusArray = $allowedStatuses;
    }

    $placeholders = implode(',', array_fill(0, count($statusArray), '?'));

    // Define tables and their column mappings
    $tables = [
        'report_3ydp'  => ['id', 'type', 'title_of_project AS title', 'created_by_name AS name', 'department', 'created_at AS date', 'status'],
        'report_pd_main' => ['id', 'type', 'title_of_activity AS title', 'created_by_name AS name', 'department', 'created_at AS date', 'status'],
        'report_mar_header' => ['id', 'type', 'title_act AS title', 'created_by_name AS name', 'department', 'created_at AS date', 'status'],
        'report_cnacr' => ['id', 'type', 'title_of_program AS title', 'created_by_name AS name', 'department', 'created_at AS date', 'status'],
        'report_coordinator_cnacr' => ['id', 'type', 'title_of_program AS title', 'created_by_name AS name', 'department', 'created_at AS date', 'status'],
        'report_program_monitoring_form' => ['id', 'type', 'program_title AS title', 'created_by_name AS name', 'department', 'created_at AS date', 'status'],
        'report_evaluation' => ['id', 'type', 'implementing_department AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_cert_appearance' => ['id', 'type', 'activity_name AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_reflection_paper' => ['id', 'type', 'beneficiary_name AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_narrative' => ['id', 'type', 'department AS title', 'created_by_name AS name', 'department', 'created_at AS date','status']
    ];

    $allReports = [];
    foreach ($tables as $table => $columns) {
        $columnList = implode(', ', array_map(function ($column) {
            $parts = preg_split('/\s+AS\s+/i', $column);
            $source = $parts[0];
            $alias = $parts[1] ?? null;

            if (strpos($source, '(') !== false || strpos($source, '.') !== false) {
                return $column;
            }

            $prefixed = 'r.`' . str_replace('`', '``', trim($source)) . '`';
            return $alias ? $prefixed . ' AS ' . $alias : $prefixed;
        }, $columns));
        
        $escapedTable = '`' . str_replace('`', '``', $table) . '`';
        $hasRoleColumn = tableHasColumn($conn, $table, 'role');
        $hasUserIdColumn = tableHasColumn($conn, $table, 'user_id');

        if (!$hasUserIdColumn) {
            continue;
        }
        
        $query = "SELECT $columnList
                FROM $escapedTable r
                INNER JOIN `accounts`.`users` u
                    ON CAST(u.`id` AS CHAR) = CAST(r.`user_id` AS CHAR)
                WHERE r.`status` IN ($placeholders)
                AND r.`status` <> 'draft'
                AND r.`type` IS NOT NULL
                AND TRIM(r.`type`) <> ''
                AND r.`department` IS NOT NULL
                AND TRIM(r.`department`) <> ''
                AND u.`is_active` = 1";

        if ($hasRoleColumn) {
            $query .= " AND LOWER(TRIM(r.`role`)) IN ('admin', 'coordinator')";
        } elseif (strpos($table, 'coordinator') === false) {
            continue;
        }

        $query .= " ORDER BY r.`created_at` DESC";

        $stmt = $conn->prepare($query);
        if (!$stmt) {
            // Log error if needed
            continue;
        }

        $types = str_repeat('s', count($statusArray));
        $stmt->bind_param($types, ...$statusArray);

        $stmt->execute();
        $result = $stmt->get_result();

        $tableReports = [];
        while ($row = $result->fetch_assoc()) {
            $tableReports[] = $row;
        }

        // Only add table if it has reports
        if (!empty($tableReports)) {
            $allReports[$table] = $tableReports;
        }
        
        $stmt->close();
    }

    echo json_encode($allReports);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

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
?>
