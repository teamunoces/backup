<?php
// Prevent any accidental whitespace or HTML errors from breaking JSON
error_reporting(0); 
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_reports_db");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Ensure ID is an integer
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$table = $_GET['table'] ?? '3ydp';

$allowedTables = ['3ydp', '3ydp_programs'];
if (!in_array($table, $allowedTables)) {
    echo json_encode(["error" => "Invalid table"]);
    exit;
}

// Inside the if ($table === '3ydp') block of get.php
if ($table === '3ydp') {
    $stmt = $conn->prepare("SELECT * FROM `3ydp` WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    // The $result array now contains all columns, including your feedback column
    echo json_encode($result ? $result : new stdClass());

} elseif ($table === '3ydp_programs') {
    // Updated from '3ydp_id' to 'report_id' to match your database
    $stmt = $conn->prepare("SELECT * FROM `3ydp_programs` WHERE report_id = ?");
    
    if (!$stmt) {
        echo json_encode(["error" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();

    $programs = [];
    while ($row = $res->fetch_assoc()) {
        $programs[] = $row;
    }

    // Always returns an array [] so the JavaScript loop functions correctly
    echo json_encode($programs);
}
$conn->close();
?>