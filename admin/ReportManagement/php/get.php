<?php
session_start();
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

$reports = [];

$tablesResult = $conn->query("SHOW TABLES");

while ($tableRow = $tablesResult->fetch_array()) {
    $tableName = $tableRow[0];

    // Check if table has status column
    $checkColumn = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'status'");

    if ($checkColumn && $checkColumn->num_rows > 0) {
        // Also check for role column
        $roleColumn = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'role'");
        $hasRole = $roleColumn && $roleColumn->num_rows > 0;

        $result = $conn->query("
            SELECT * FROM `$tableName`
            WHERE archived = 'not archived'
        ");

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                // Detect title column
                $title = $row['title'] ??
                        $row['title_act'] ??
                        $row['title_of_project'] ??
                        $row['title_of_activity'] ??
                        $row['title_of_program'] ??
                        "N/A";

                // Detect department column
                $department = $row['department'] ??
                             $row['office'] ??
                             "N/A";

                // Detect date column
                $created_at = $row['created_at'] ??
                             $row['date_created'] ??
                             null;

                // Get role if exists
                $role = $hasRole ? ($row['role'] ?? 'admin') : 'admin';

                // Get status
                $status = $row['status'] ?? 'pending';

                $reports[] = [
                    "id" => $row['id'] ?? null,
                    "title" => $title,
                    "department" => $department,
                    "created_at" => $created_at,
                    "status" => $status,
                    "role" => $role,
                    "source_table" => $tableName
                ];
            }
        }
    }
}

echo json_encode($reports);
$conn->close();
?>