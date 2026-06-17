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
    
    // Get the main report
    $stmt = $conn->prepare("SELECT * FROM evaluation_reports WHERE id = ?");
    $stmt->bind_param("i", $reportId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($report = $result->fetch_assoc()) {
        // Format ratings into a single object for easier frontend consumption
        $ratings = [];
        for ($i = 1; $i <= 15; $i++) {
            $ratings["q$i"] = $report["q{$i}_rating"];
        }
        $report['ratings'] = $ratings;
        
        echo json_encode(['success' => true, 'data' => [$report]]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Report not found']);
    }
    $stmt->close();
} elseif (isset($_GET['type'])) {
    $reportType = $conn->real_escape_string($_GET['type']);
    
    // Get reports by type - fetch all matching reports
    $stmt = $conn->prepare("SELECT * FROM evaluation_reports WHERE type = ? AND archived = 'not archived' ORDER BY id DESC");
    $stmt->bind_param("s", $reportType);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reports = [];
    while ($report = $result->fetch_assoc()) {
        // Format ratings for each report
        $ratings = [];
        for ($i = 1; $i <= 15; $i++) {
            $ratings["q$i"] = $report["q{$i}_rating"];
        }
        $report['ratings'] = $ratings;
        $reports[] = $report;
    }
    
    if (count($reports) > 0) {
        echo json_encode(['success' => true, 'data' => $reports]);
    } else {
        echo json_encode(['success' => true, 'data' => [], 'message' => 'No reports found']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'No ID or type provided']);
}
$conn->close();
?>