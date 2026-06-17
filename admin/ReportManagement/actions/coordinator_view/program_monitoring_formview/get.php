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
    
    // First, get the main report
    $stmt = $conn->prepare("SELECT * FROM program_monitoring_form WHERE id = ?");
    $stmt->bind_param("i", $reportId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($report = $result->fetch_assoc()) {
        // Decode JSON fields if they exist and are strings
        if (isset($report['issues_data']) && is_string($report['issues_data'])) {
            $report['issues_data'] = json_decode($report['issues_data'], true);
        }
        if (isset($report['feedback_data']) && is_string($report['feedback_data'])) {
            $report['feedback_data'] = json_decode($report['feedback_data'], true);
        }
        if (isset($report['recommendations_data']) && is_string($report['recommendations_data'])) {
            $report['recommendations_data'] = json_decode($report['recommendations_data'], true);
        }
        
        echo json_encode(['success' => true, 'report' => $report]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Report not found']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'No ID provided']);
}
$conn->close();
?>