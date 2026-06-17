<?php
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 for production, 1 for debugging
header('Content-Type: application/json');

try {
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $database = 'ces_reports_db';

    $conn = new mysqli($host, $username, $password, $database);

    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    $conn->set_charset("utf8");

    if (isset($_GET['id'])) {
        $reportId = intval($_GET['id']);
        
        // Get the main report
        $stmt = $conn->prepare("SELECT * FROM cert_appearance WHERE id = ?");
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("i", $reportId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($report = $result->fetch_assoc()) {
            // Format ratings into a single object for easier frontend consumption
            $ratings = [];
            for ($i = 1; $i <= 15; $i++) {
                $ratings["q$i"] = $report["q{$i}_rating"] ?? null;
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
        $stmt = $conn->prepare("SELECT * FROM cert_appearance WHERE type = ? AND archived = 'not archived' ORDER BY id DESC");
        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $conn->error);
        }
        $stmt->bind_param("s", $reportType);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reports = [];
        while ($report = $result->fetch_assoc()) {
            // Format ratings for each report
            $ratings = [];
            for ($i = 1; $i <= 15; $i++) {
                $ratings["q$i"] = $report["q{$i}_rating"] ?? null;
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
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>