<?php
session_start();
header('Content-Type: application/json');

/* Ensure user is logged in */
if (!isset($_SESSION['name'])) {
    echo json_encode(["error" => "Unauthorized access"]);
    exit;
}

$currentUser = $_SESSION['name']; // logged-in user
$currentRole = $_SESSION['role']; // user role
$currentDepartment = $_SESSION['department']; // user department

$reportTables = [
    'report_3ydp',
    'report_3ydp_programs',
    'report_cert_appearance',
    'report_cnacr',
    'report_coordinator_cnacr',
    'report_evaluation',
    'report_mar_header',
    'report_mar_table',
    'report_narrative',
    'report_pd_detail',
    'report_pd_main',
    'report_program_monitoring_form',
    'report_reflection_paper'
];

// Handle restore request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'restore') {
    handleRestore();
    exit;
}

fetchArchiveData();

function fetchArchiveData() {

    global $currentUser, $currentRole, $currentDepartment, $reportTables;

    $response = [
        'archived_reports' => []
    ];

    $conn = new mysqli("localhost", "root", "", "ces_database");

    if ($conn->connect_error) {
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }

    foreach ($reportTables as $tableName) {
        $tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $tableName);

        if (empty($tableName)) continue;

        $checkTable = $conn->query("SHOW TABLES LIKE '$tableName'");
        if (!$checkTable || $checkTable->num_rows === 0) continue;

        /* Check archived column exists */
        $checkColumn = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'archived'");

        if ($checkColumn && $checkColumn->num_rows > 0) {

            /* Apply role-based filtering */
            if ($currentRole === 'admin') {
                // Admin sees ALL archived reports
                $sql = "SELECT * FROM `$tableName` WHERE archived='archived'";
                $result = $conn->query($sql);
            } else {
                // Regular users see only their department's archived reports
                // Using prepared statement to prevent SQL injection
                $sql = "SELECT * FROM `$tableName` 
                        WHERE archived='archived' 
                        AND department = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("s", $currentDepartment);
                $stmt->execute();
                $result = $stmt->get_result();
            }

            if ($result && $result->num_rows > 0) {

                while ($row = $result->fetch_assoc()) {

                    $title =
                        $row['title'] ??
                        $row['title_of_project'] ??
                        $row['title_of_activity'] ??
                        $row['title_of_program'] ??
                        "N/A";

                    $department =
                        $row['department'] ??
                        $row['office'] ??
                        "N/A";

                    $created_at =
                        isset($row['created_at'])
                            ? date("F j, Y", strtotime($row['created_at']))
                            : "N/A";

                    $type =
                        $row['type'] ??
                        $row['report_type'] ??
                        $tableName;

                    $response['archived_reports'][] = [
                        "id" => $row['id'],
                        "type" => $type,
                        "title" => $title,
                        "department" => $department,
                        "created_at" => $created_at,
                        "source_table" => $tableName,
                        "created_by" => $row['username'] ?? $row['created_by'] ?? "N/A" // Optional: show who created it
                    ];
                }
            }
            
            // Close statement if it was used
            if (isset($stmt)) {
                $stmt->close();
            }
        }
    }

    $response['counts'] = [
        "archived_reports" => count($response['archived_reports'])
    ];

    echo json_encode($response);
    $conn->close();
}


function handleRestore() {

    $response = ['success' => false];

    if (!isset($_POST['id']) || !isset($_POST['table'])) {
        $response['message'] = "Missing parameters";
        echo json_encode($response);
        return;
    }

    $id = intval($_POST['id']);
    $tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $_POST['table']);

    global $reportTables;

    if (!in_array($tableName, $reportTables, true)) {
        $response['message'] = "Invalid report table";
        echo json_encode($response);
        return;
    }

    $conn = new mysqli("localhost", "root", "", "ces_database");

    if ($conn->connect_error) {
        $response['message'] = "Database connection failed";
        echo json_encode($response);
        return;
    }

    // Check if user has permission to restore this report
    global $currentRole, $currentDepartment;
    
    if ($currentRole === 'admin') {
        // Admin can restore any report
        $stmt = $conn->prepare("UPDATE `$tableName` SET archived='not archived' WHERE id=? AND archived='archived'");
        $stmt->bind_param("i", $id);
    } else {
        // Regular users can only restore reports from their department
        $stmt = $conn->prepare("UPDATE `$tableName` SET archived='not archived' 
                                WHERE id=? AND archived='archived' AND department=?");
        $stmt->bind_param("is", $id, $currentDepartment);
    }

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = "Report restored successfully";
    } else {
        $response['message'] = "Report not found or you don't have permission to restore it";
    }

    $stmt->close();
    $conn->close();

    echo json_encode($response);
}
?>
