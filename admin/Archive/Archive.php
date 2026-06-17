<?php
header('Content-Type: application/json');

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

// Handle restore action if POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'restore') {
    handleRestore();
    exit;
}

// Otherwise, handle GET request to fetch archive data
fetchArchiveData();

function fetchArchiveData() {
    global $reportTables;

    $response = ['inactive_users' => [], 'archived_reports' => []];

    // Connect to ces_database for user and report data
    $accounts_conn = new mysqli("localhost", "root", "", "ces_database");
    if ($accounts_conn->connect_error) {
        die(json_encode(['error' => 'Accounts DB connection failed']));
    }

    $reports_conn = new mysqli("localhost", "root", "", "ces_database");
    if ($reports_conn->connect_error) {
        $accounts_conn->close();
        die(json_encode(['error' => 'Reports DB connection failed']));
    }

    // 1. Fetch Inactive Users from users table
    $user_res = $accounts_conn->query("SELECT id, username, email, department, created_at FROM users WHERE is_active = 0");
    if ($user_res) {
        while ($row = $user_res->fetch_assoc()) {
            $row['created_at'] = date("F j, Y", strtotime($row['created_at']));
            $response['inactive_users'][] = $row;
        }
    }

    // 2. Fetch Archived Reports from the approved report tables
    foreach ($reportTables as $tableName) {
        $tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $tableName);
        if (empty($tableName)) continue;

        $checkTable = $reports_conn->query("SHOW TABLES LIKE '$tableName'");
        if (!$checkTable || $checkTable->num_rows === 0) continue;

        // Check if table has archived column
        $checkColumn = $reports_conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'archived'");
        if ($checkColumn && $checkColumn->num_rows > 0) {
            // Query for archived records (where archived = 'archived')
            $sql = "SELECT * FROM `$tableName` WHERE archived = 'archived'";
            $reportRes = $reports_conn->query($sql);

            if ($reportRes && $reportRes->num_rows > 0) {
                while ($row = $reportRes->fetch_assoc()) {
                    // Handle different column names across tables
                    $title = $row['title'] ??
                            $row['title_act'] ??
                            $row['title_of_project'] ??
                            $row['title_of_activity'] ??
                            $row['title_of_program'] ??
                            "N/A";

                    $department = $row['department'] ??
                                 $row['office'] ??
                                 "N/A";

                    $created_at = isset($row['created_at']) ? date("F j, Y", strtotime($row['created_at'])) : "N/A";
                    $type = $row['type'] ?? $row['report_type'] ?? $tableName;

                    $response['archived_reports'][] = [
                        "id" => $row['id'] ?? null,
                        "type" => $type,
                        "title" => $title,
                        "department" => $department,
                        "created_at" => $created_at,
                        "source_table" => $tableName
                    ];
                }
            }
        }
    }

    // Add counts to response
    $response['counts'] = [
        'inactive_users' => count($response['inactive_users']),
        'archived_reports' => count($response['archived_reports'])
    ];

    // Output JSON
    echo json_encode($response);

    $accounts_conn->close();
    $reports_conn->close();
}

function handleRestore() {
    $response = ['success' => false, 'message' => ''];
    
    if (!isset($_POST['id']) || !isset($_POST['type'])) {
        $response['message'] = 'Missing required parameters';
        echo json_encode($response);
        return;
    }
    
    $id = intval($_POST['id']);
    $type = $_POST['type'];
    
    if ($type === 'user') {
        // Restore user account
        $conn = new mysqli("localhost", "root", "", "ces_database");
        if ($conn->connect_error) {
            $response['message'] = 'Database connection failed';
            echo json_encode($response);
            return;
        }
        
        $stmt = $conn->prepare("UPDATE users SET is_active = 1 WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'User account restored successfully';
        } else {
            $response['message'] = 'User not found or already active';
        }
        
        $stmt->close();
        $conn->close();
        
    } else if ($type === 'report') {
        global $reportTables;

        // Restore report - set archived to 'not archived' instead of NULL
        if (!isset($_POST['table'])) {
            $response['message'] = 'Table name not provided';
            echo json_encode($response);
            return;
        }
        
        $tableName = preg_replace('/[^a-zA-Z0-9_]/', '', $_POST['table']);

        if (!in_array($tableName, $reportTables, true)) {
            $response['message'] = 'Invalid report table';
            echo json_encode($response);
            return;
        }
        
        $conn = new mysqli("localhost", "root", "", "ces_database");
        if ($conn->connect_error) {
            $response['message'] = 'Database connection failed';
            echo json_encode($response);
            return;
        }
        
        // Check if the table has an 'archived' column
        $checkColumn = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'archived'");
        if (!$checkColumn || $checkColumn->num_rows === 0) {
            $response['message'] = 'Table does not have archived column';
            echo json_encode($response);
            $conn->close();
            return;
        }
        
        // Set archived to 'not archived' instead of NULL
        $stmt = $conn->prepare("UPDATE `$tableName` SET archived = 'not archived' WHERE id = ? AND archived = 'archived'");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            $response['success'] = true;
            $response['message'] = 'Report restored successfully';
        } else {
            $response['message'] = 'Report not found or already restored';
        }
        
        $stmt->close();
        $conn->close();
    } else {
        $response['message'] = 'Invalid restore type';
    }
    
    echo json_encode($response);
}
?>
