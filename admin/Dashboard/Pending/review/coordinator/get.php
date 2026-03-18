<?php
header('Content-Type: application/json');

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'ces_reports_db';

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed']);
    exit;
}

$conn->set_charset("utf8");

if (isset($_GET['id'])) {
    $reportId = intval($_GET['id']);
    // Replace 'cnacr_reports' with your actual table name if different
    $stmt = $conn->prepare("SELECT * FROM coordinator_cnacr WHERE id = ?"); 
    $stmt->bind_param("i", $reportId);
    $stmt->execute();
    $result = $stmt->get_result();

        // In get.php, after $result = $stmt->get_result();
    if ($report = $result->fetch_assoc()) {
        // Add debug line to see what's being returned
        error_log("Report data: " . print_r($report, true));
        echo json_encode(['success' => true, 'report' => $report]);
    } else {
        error_log("Report not found for ID: " . $reportId);
        echo json_encode(['success' => false, 'message' => 'Report not found']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'No ID provided']);
}
$conn->close();
?>