<?php
session_start();
header('Content-Type: application/json');

// 1. Connection
$host = "localhost";
$user = "root";
$pass = "";
$db   = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit;
}

// 2. Auth Check
if (!isset($_SESSION['username'])) {
    echo json_encode(["status" => "error", "message" => "Session expired. Please login again."]);
    exit;
}

// 3. Get JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received from browser"]);
    exit;
}

// 4. Inject Session Data (Make sure these keys match your login.php exactly)
$data['created_by_name'] = $_SESSION['name'] ?? 'Unknown'; 
$data['department']      = $_SESSION['department'] ?? 'No Dept';

// 5. Build Dynamic SQL with Backticks
$columnNames = array_keys($data);
// This part is critical for the column named "type"
$escapedColumns = implode(", ", array_map(function($col) { return "`$col`"; }, $columnNames));
$placeholders = implode(", ", array_fill(0, count($data), "?"));
$types = str_repeat("s", count($data));
$values = array_values($data);

$sql = "INSERT INTO cnacr ($escapedColumns) VALUES ($placeholders)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param($types, ...$values);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Report Saved!"]);
    } else {
        // This tells you if a value is too long or a constraint failed
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
    }
} else {
    // THIS IS THE MOST IMPORTANT ERROR: It tells you if a column name is missing in DB
    echo json_encode(["status" => "error", "message" => "SQL Error: Check if all JS keys match DB columns. System says: " . $conn->error]);
}

$conn->close();
?>