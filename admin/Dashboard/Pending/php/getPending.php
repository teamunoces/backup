<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_reports_db"; 

try {
    $conn = new mysqli($host, $user, $pass, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $statusParam = $_GET['status'] ?? 'pending,need fix';
    $statusArray = array_map('trim', explode(',', $statusParam));
    $placeholders = implode(',', array_fill(0, count($statusArray), '?'));

    // Fixed: Added title column for coordinator_cnacr
    $tables = [
        'cnacr' => ['id', 'type', 'title', 'created_by_name AS name', 'department', 'created_at AS date'],
        '3ydp'  => ['id', 'type', 'title_of_project AS title', 'created_by_name AS name', 'department', 'created_at AS date'],
        'pd_main' => ['id', 'type', 'title_of_activity AS title', 'created_by_name AS name', 'department', 'created_at AS date'],
        'dpir' => ['id', 'type', 'title_of_program AS title', 'created_by_name AS name', 'department', 'created_at AS date'],
        'mar_header' => ['id', 'type', 'title_act AS title', 'created_by_name AS name', 'department', 'created_at AS date'],
        'coordinator_cnacr' => ['id', 'type', 'title_of_program AS title', 'created_by_name AS name', 'department', 'created_at AS date']
    ];

    $allReports = [];
    foreach ($tables as $table => $columns) {
    $columnList = implode(', ', $columns);
    
    // For tables that should only have coordinator data
    if ($table === 'coordinator_cnacr') {
        $query = "SELECT $columnList 
                FROM $table 
                WHERE status IN ($placeholders)";
    } else {
        // For all other tables, check for role column
        $checkRoleQuery = "SHOW COLUMNS FROM $table LIKE 'role'";
        $roleCheck = $conn->query($checkRoleQuery);
        $hasRoleColumn = $roleCheck && $roleCheck->num_rows > 0;
        
        if ($hasRoleColumn) {
            // If role column exists, filter by coordinator
            $query = "SELECT $columnList 
                    FROM $table 
                    WHERE status IN ($placeholders) 
                    AND role = 'coordinator'";
        } else {
            // If no role column exists, SKIP this table
            // (assuming it contains all roles data)
            continue;
        }
    }

    $stmt = $conn->prepare($query);
    if (!$stmt) {
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
?>