<?php
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check login session
if (!isset($_SESSION['name']) || !isset($_SESSION['role'])) {
    echo json_encode(["error" => "Unauthorized access", "session_debug" => $_SESSION]);
    exit;
}

$currentUser = $_SESSION['name'];
$currentRole = $_SESSION['role']; // e.g., "coordinator", "admin"

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

$reports = [];

// Get all tables
$tablesResult = $conn->query("SHOW TABLES");
if (!$tablesResult) {
    echo json_encode(["error" => "Failed to get tables: " . $conn->error]);
    exit;
}

// Define tables allowed for coordinators
$coordinatorTables = [
    "coordinator_cnacr",
    "3ydp",
    "pd_main",
    "mar_header",
    "dpir",
];

while ($tableRow = $tablesResult->fetch_array()) {
    $tableName = $tableRow[0];

    // Skip tables that don't have a status column
    $checkStatus = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'status'");
    if (!$checkStatus || $checkStatus->num_rows === 0) continue;

    // If user is coordinator, skip tables not assigned to them
    if ($currentRole === "coordinator" && !in_array($tableName, $coordinatorTables)) {
        continue;
    }

    // Check for archived column
    $checkArchived = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'archived'");
    $hasArchived = $checkArchived && $checkArchived->num_rows > 0;

    // Build SQL for approved/rejected reports
   $sql = "SELECT * FROM `$tableName` WHERE LOWER(status) IN ('approve','approved','reject','rejected','need fix')";
    if ($hasArchived) {
        $sql .= " AND archived = 'not archived'";
    }

    // If created_by_name exists, filter by current coordinator
    $checkCreatedBy = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'created_by_name'");
    if ($checkCreatedBy && $checkCreatedBy->num_rows > 0 && $currentRole === "coordinator") {
        $sql .= " AND created_by_name = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) continue;
        $stmt->bind_param("s", $currentUser);
    } else {
        $stmt = $conn->prepare($sql);
    }

    if (!$stmt) continue;

    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        // Detect title
        $title = "N/A";
        foreach (['title', 'title_of_project', 'title_of_activity', 'title_of_program', 'title_act', 'report_title', 'project_title'] as $field) {
            if (isset($row[$field]) && !empty($row[$field])) {
                $title = $row[$field];
                break;
            }
        }

        // Detect department
        $department = "N/A";
        foreach (['department', 'office', 'department_name', 'office_name'] as $field) {
            if (isset($row[$field]) && !empty($row[$field])) {
                $department = $row[$field];
                break;
            }
        }

        // Detect created_at
        $created_at = null;
        foreach (['created_at', 'date_created', 'created_date'] as $field) {
            if (isset($row[$field])) {
                $created_at = $row[$field];
                break;
            }
        }

        $reports[] = [
            "id" => $row['id'] ?? null,
            "title" => $title,
            "department" => $department,
            "created_at" => $created_at,
            "status" => $row['status'] ?? 'unknown',
            "source_table" => $tableName
        ];
    }

    $stmt->close();
}

// Return reports (empty array if none)
echo json_encode($reports);

$conn->close();
?>