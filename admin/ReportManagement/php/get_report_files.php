<?php
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
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

$report_id = $_GET['report_id'] ?? null;

if (!$report_id) {
    echo json_encode(["success" => false, "error" => "Missing report ID"]);
    exit;
}

// Validate that report_id is a number
if (!is_numeric($report_id)) {
    echo json_encode(["success" => false, "error" => "Invalid report ID"]);
    exit;
}

// Get files for this report
$sql = "SELECT id, file_name, file_path, created_at FROM admin_report_files WHERE report_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "error" => "Database prepare error: " . $conn->error]);
    exit;
}

$stmt->bind_param("i", $report_id);
if (!$stmt->execute()) {
    echo json_encode(["success" => false, "error" => "Database execute error: " . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$files = [];

while ($row = $result->fetch_assoc()) {
    // Ensure file exists on disk
    $full_path = $_SERVER['DOCUMENT_ROOT'] . "/admin/ReportManagement/" . $row['file_path'];
    $file_exists = file_exists($full_path);
    
    $files[] = [
        'id' => (int)$row['id'],
        'file_name' => $row['file_name'],
        'file_path' => $row['file_path'],
        'uploaded_at' => $row['created_at'],
        'file_exists' => $file_exists,
        'file_size' => $file_exists ? filesize($full_path) : 0
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    "success" => true, 
    "files" => $files,
    "count" => count($files)
]);
?>