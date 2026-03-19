<?php
session_start();
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_reports_db");

if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

$reports = [];

// ✅ ONLY THESE TABLES WILL BE USED
$allowedTables = [
    "3ydp",
    "cnacr",
    "coordinator_cnacr",
    "mar_header",
    "pd_main"
];

foreach ($allowedTables as $tableName) {

    // ✅ CHECK IF TABLE EXISTS (SAFE)
    $checkTable = $conn->query("SHOW TABLES LIKE '$tableName'");
    if ($checkTable->num_rows == 0) continue;

    // ✅ CHECK COLUMNS
    $hasStatus   = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'status'")->num_rows > 0;
    $hasRole     = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'role'")->num_rows > 0;
    $hasArchived = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'archived'")->num_rows > 0;

    // ✅ BUILD QUERY
    $query = "SELECT * FROM `$tableName`";
    if ($hasArchived) {
        $query .= " WHERE archived = 'not archived'";
    }

    $result = $conn->query($query);

    if ($result) {
        while ($row = $result->fetch_assoc()) {

            // ✅ TITLE DETECTION
            $title = $row['title'] ??
                     $row['title_act'] ??
                     $row['title_of_project'] ??
                     $row['title_of_activity'] ??
                     $row['title_of_program'] ??
                     "N/A";

            // ✅ DEPARTMENT DETECTION
            $department = $row['department'] ??
                          $row['office'] ??
                          "N/A";

            // ✅ DATE DETECTION
            $created_at = $row['created_at'] ??
                          $row['date_created'] ??
                          null;

            // ✅ ROLE FIX
            $role = $hasRole ? strtolower($row['role']) : 'admin';

            // ✅ STATUS FIX
            $status = $hasStatus ? strtolower($row['status']) : 'pending';

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

echo json_encode($reports);
$conn->close();
?>