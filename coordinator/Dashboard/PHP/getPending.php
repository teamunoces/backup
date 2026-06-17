<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'pending_errors.log');

session_start();

// Set JSON header
header('Content-Type: application/json');

// Start output buffering
ob_start();

try {
    // Check login
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Unauthorized - No user_id in session");
    }

    $currentUserId = $_SESSION['user_id'];
    error_log("Current User ID: " . $currentUserId);

    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "ces_database";

    $conn = new mysqli($host, $user, $pass, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    error_log("Database connected successfully");

    // Status filter
    $allowedStatuses = ['pending', 'need fix'];
    $statusParam = $_GET['status'] ?? 'pending';
    $statusArray = array_map(
        fn($status) => strtolower(trim($status)),
        explode(',', $statusParam)
    );
    $statusArray = array_values(array_intersect($allowedStatuses, $statusArray));
    if (empty($statusArray)) {
        $statusArray = ['pending'];
    }
    $placeholders = implode(',', array_fill(0, count($statusArray), '?'));

    error_log("Status filter: " . $statusParam);
    error_log("Status array: " . print_r($statusArray, true));

    $tables = [
        'report_3ydp' => ['id','type','title_of_project AS title','created_by_name AS name','department','created_at AS date','status'],
        'report_pd_main' => ['id','type','title_of_activity AS title','created_by_name AS name','department','created_at AS date','status'],
        'report_mar_header' => ['id','type','title_act AS title','created_by_name AS name','department','created_at AS date','status'],
        'report_coordinator_cnacr' => ['id','type','title_of_program AS title','created_by_name AS name','department','created_at AS date','status'],
        'report_program_monitoring_form' => ['id', 'type', 'program_title AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_evaluation' => ['id', 'type', 'implementing_department AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_cert_appearance' => ['id', 'type', 'activity_name AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_reflection_paper' => ['id', 'type', 'beneficiary_name AS title', 'created_by_name AS name', 'department', 'created_at AS date','status'],
        'report_narrative' => ['id', 'type', 'department AS title', 'created_by_name AS name', 'department', 'created_at AS date','status']
    ];

    $allReports = [];
    $errors = [];

    foreach ($tables as $table => $columns) {
        error_log("Processing table: " . $table);
        
        // Check if table exists
        $tableLike = $conn->real_escape_string($table);
        $tableCheck = $conn->query("SHOW TABLES LIKE '$tableLike'");
        if (!$tableCheck) {
            $errors[] = "Error checking table $table: " . $conn->error;
            $allReports[$table] = [];
            continue;
        }
        
        if ($tableCheck->num_rows === 0) {
            $errors[] = "Table '$table' does not exist";
            $allReports[$table] = [];
            continue;
        }

        $columnList = implode(', ', $columns);

        $escapedTable = "`" . str_replace("`", "``", $table) . "`";

        $query = "
        SELECT $columnList
        FROM $escapedTable
        WHERE status IN ($placeholders)
        AND status <> 'draft'
        AND user_id = ?
        ";

        error_log("Query for $table: " . $query);

        $stmt = $conn->prepare($query);

        if (!$stmt) {
            $errors[] = "Failed to prepare query for table $table: " . $conn->error;
            $allReports[$table] = [];
            continue;
        }

        // Use 's' for string since user_id is TEXT
        $types = str_repeat('s', count($statusArray)) . 's';
        $params = [...$statusArray, $currentUserId];

        error_log("Binding parameters - types: $types, params: " . print_r($params, true));

        $stmt->bind_param($types, ...$params);

        if (!$stmt->execute()) {
            $errors[] = "Failed to execute query for table $table: " . $stmt->error;
            $stmt->close();
            $allReports[$table] = [];
            continue;
        }
        
        $result = $stmt->get_result();
        $reports = [];

        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }

        error_log("Found " . count($reports) . " records in $table");
        $allReports[$table] = $reports;

        $stmt->close();
    }

    // Clear the output buffer
    ob_clean();

    // Add errors to response if any
    if (!empty($errors)) {
        $allReports['_debug'] = [
            'errors' => $errors,
            'user_id' => $currentUserId,
            'status_filter' => $statusParam
        ];
    }

    error_log("Sending response with " . count($allReports) . " tables");
    echo json_encode($allReports);

} catch (Exception $e) {
    // Clear output buffer
    ob_clean();
    
    // Log the error
    error_log("ERROR in getPending.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Send error response
    echo json_encode([
        "error" => $e->getMessage(),
        "debug" => [
            "file" => $e->getFile(),
            "line" => $e->getLine()
        ]
    ]);
}

// Close connection if it exists
if (isset($conn) && $conn) {
    $conn->close();
}
?>
