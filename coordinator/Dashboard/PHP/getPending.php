<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1); // Temporarily show errors
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
    $dbname = "ces_reports_db";

    $conn = new mysqli($host, $user, $pass, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    error_log("Database connected successfully");

    // Status filter
    $statusParam = $_GET['status'] ?? 'pending';
    $statusArray = array_map('trim', explode(',', $statusParam));
    $placeholders = implode(',', array_fill(0, count($statusArray), '?'));

    error_log("Status filter: " . $statusParam);
    error_log("Status array: " . print_r($statusArray, true));

    $tables = [
        '3ydp' => ['id','type','title_of_project AS title','created_by_name AS name','department','created_at AS date','status'],
        'pd_main' => ['id','type','title_of_activity AS title','created_by_name AS name','department','created_at AS date','status'],
        'dpir' => ['id','type','title_of_program AS title','created_by_name AS name','department','created_at AS date','status'],
        'mar_header' => ['id','type','title_act AS title','created_by_name AS name','department','created_at AS date','status'],
        'coordinator_cnacr' => ['id','type','title_of_program AS title','created_by_name AS name','department','created_at AS date','status']
    ];

    $allReports = [];
    $errors = [];

    foreach ($tables as $table => $columns) {
        error_log("Processing table: " . $table);
        
        // Check if table exists
        $tableCheck = $conn->query("SHOW TABLES LIKE '$table'");
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

        $query = "
        SELECT $columnList
        FROM $table
        WHERE status IN ($placeholders)
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