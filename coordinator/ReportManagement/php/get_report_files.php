<?php
session_start();
header('Content-Type: application/json');

// Turn off error reporting to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

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

$report_id = $_GET['report_id'] ?? null;
$report_table = $_GET['report_table'] ?? null;

if (!$report_id || !$report_table) {
    echo json_encode(["success" => false, "error" => "Missing report ID or report table"]);
    exit;
}

// Validate that report_id is a number
if (!is_numeric($report_id)) {
    echo json_encode(["success" => false, "error" => "Invalid report ID"]);
    exit;
}

// Get files for this report - filter by both report_id and report_table
$sql = "SELECT id, file_name, file_path, created_at FROM coordinator_report_files WHERE report_id = ? AND report_table = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Database prepare error: " . $conn->error]);
    exit;
}

$stmt->bind_param("is", $report_id, $report_table);
if (!$stmt->execute()) {
    echo json_encode(["success" => false, "error" => "Database execute error: " . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$files = [];

while ($row = $result->fetch_assoc()) {
    $files[] = [
        'id' => (int)$row['id'],
        'file_name' => $row['file_name'],
        'file_path' => $row['file_path'],
        'uploaded_at' => $row['created_at']
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true, 
    "files" => $files
]);
?>
