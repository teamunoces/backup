<?php
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check login session
if (!isset($_SESSION['name']) || !isset($_SESSION['role'])) {
    echo json_encode(["success" => false, "error" => "Unauthorized access"]);
    exit;
}

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get parameters
$reportId = isset($_GET['report_id']) ? $_GET['report_id'] : '';
$table = isset($_GET['table']) ? $_GET['table'] : '';

if (empty($reportId) || empty($table)) {
    echo json_encode(["success" => false, "error" => "Missing parameters"]);
    exit;
}

// Sanitize table name to prevent SQL injection
$allowedTables = ['coordinator_cnacr', '3ydp', 'pd_main', 'mar_header', 'dpir'];
if (!in_array($table, $allowedTables)) {
    echo json_encode(["success" => false, "error" => "Invalid table"]);
    exit;
}

$feedback = [];

// Check if the table has a feedback column
$checkFeedback = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'feedback'");
$hasFeedback = $checkFeedback && $checkFeedback->num_rows > 0;

if ($hasFeedback) {
    // Try to get feedback from the main table
    $stmt = $conn->prepare("SELECT feedback FROM `$table` WHERE id = ?");
    if ($stmt) {
        $stmt->bind_param("i", $reportId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            if (!empty($row['feedback'])) {
                $feedback[] = [
                    'feedback_text' => $row['feedback'],
                    'created_at' => $row['updated_at'] ?? null
                ];
            }
        }
        $stmt->close();
    }
}

// Also check in feedback_history table if it exists
$checkHistoryTable = $conn->query("SHOW TABLES LIKE 'feedback_history'");
if ($checkHistoryTable && $checkHistoryTable->num_rows > 0) {
    $stmt = $conn->prepare("
        SELECT feedback_text, created_at 
        FROM feedback_history 
        WHERE report_id = ? AND report_table = ? 
        ORDER BY created_at DESC
    ");
    if ($stmt) {
        $stmt->bind_param("is", $reportId, $table);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $feedback[] = [
                'feedback_text' => $row['feedback_text'],
                'created_at' => $row['created_at']
            ];
        }
        $stmt->close();
    }
}

// If no feedback found in either place
if (empty($feedback)) {
    echo json_encode(["success" => true, "feedback" => []]);
} else {
    echo json_encode(["success" => true, "feedback" => $feedback]);
}

$conn->close();
?>