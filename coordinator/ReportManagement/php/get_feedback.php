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
$dbname = "ces_database";

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

// Sanitize and map table name to prevent SQL injection
$tableAliases = [
    '3ydp' => 'report_3ydp',
    'cert_appearance' => 'report_cert_appearance',
    'cnacr' => 'report_cnacr',
    'coordinator_cnacr' => 'report_coordinator_cnacr',
    'mar_header' => 'report_mar_header',
    'narrative_report' => 'report_narrative',
    'program_monitoring_form' => 'report_program_monitoring_form',
    'reflection_paper' => 'report_reflection_paper',
    'evaluation_reports' => 'report_evaluation',
    'pd_main' => 'report_pd_main'
];

$allowedTables = [
    'report_3ydp',
    'report_cert_appearance',
    'report_cnacr',
    'report_coordinator_cnacr',
    'report_mar_header',
    'report_narrative',
    'report_program_monitoring_form',
    'report_reflection_paper',
    'report_evaluation',
    'report_pd_main'
];

$originalTable = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
$table = $tableAliases[$originalTable] ?? $originalTable;

if (!in_array($table, $allowedTables, true)) {
    echo json_encode(["success" => false, "error" => "Invalid table"]);
    exit;
}

$checkTable = $conn->query("SHOW TABLES LIKE '$table'");
if (!$checkTable || $checkTable->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Table not found"]);
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
        WHERE report_id = ? AND report_table IN (?, ?)
        ORDER BY created_at DESC
    ");
    if ($stmt) {
        $stmt->bind_param("iss", $reportId, $table, $originalTable);
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
