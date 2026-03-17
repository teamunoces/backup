<?php
session_start();
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0); // Turn off display errors for production
ini_set('log_errors', 1);

// Database connection
$conn = new mysqli("localhost", "root", "", "ces_reports_db");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Validate session
if (!isset($_SESSION['name'], $_SESSION['role'], $_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User session not found. Please log in again.']);
    exit();
}

// Get JSON data from JS
$input = file_get_contents('php://input');
error_log("Raw input: " . $input);

$data = json_decode($input, true);
if(!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input', 'received' => $input]);
    exit();
}

// Add session info (these will override any values sent from JS)
$data['created_by_name'] = $_SESSION['name'];
$data['role'] = $_SESSION['role'];
$data['user_id'] = $_SESSION['user_id'];

// Set defaults for required fields if not present
$defaults = [
    'status' => 'pending',
    'archived' => 'not archived',
    'feedback' => ''
];

foreach ($defaults as $field => $value) {
    if (!isset($data[$field]) || empty($data[$field])) {
        $data[$field] = $value;
    }
}

// Remove any fields that might cause issues (like empty strings for required fields)
$data = array_filter($data, function($value) {
    return $value !== null && $value !== '';
});

// Check if data is empty
if (empty($data)) {
    echo json_encode(['success' => false, 'error' => 'No data to insert']);
    exit();
}

// Check if table exists
$table_check = $conn->query("SHOW TABLES LIKE 'coordinator_cnacr'");
if ($table_check->num_rows == 0) {
    echo json_encode(['success' => false, 'error' => 'Table coordinator_cnacr does not exist']);
    exit();
}

// Get table columns to verify and filter data
$columns_result = $conn->query("SHOW COLUMNS FROM coordinator_cnacr");
$table_columns = [];
while($column = $columns_result->fetch_assoc()) {
    $table_columns[] = $column['Field'];
}

// Filter data to only include columns that exist in the table
$filtered_data = array_intersect_key($data, array_flip($table_columns));

if (empty($filtered_data)) {
    echo json_encode(['success' => false, 'error' => 'No valid columns to insert']);
    exit();
}

error_log("Filtered data keys: " . print_r(array_keys($filtered_data), true));

// Prepare columns and placeholders dynamically
$columns = implode(", ", array_keys($filtered_data));
$placeholders = implode(", ", array_fill(0, count($filtered_data), "?"));

// Prepare statement
$sql = "INSERT INTO coordinator_cnacr ($columns) VALUES ($placeholders)";
error_log("SQL: " . $sql);

$stmt = $conn->prepare($sql);
if(!$stmt){
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit();
}

// Bind parameters dynamically (all strings)
$types = str_repeat("s", count($filtered_data));
$values = array_values($filtered_data);
$stmt->bind_param($types, ...$values);

// Execute
if($stmt->execute()){
    echo json_encode(['success' => true, 'message' => 'Report submitted successfully!', 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'error' => 'Execute failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>