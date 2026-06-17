<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
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

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Only POST method is allowed']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }

    if (!isset($input['id']) || empty($input['id'])) {
        echo json_encode(['success' => false, 'message' => 'Report ID is required']);
        exit;
    }

    $reportId = intval($input['id']);
    
    // Check if report exists
    $checkStmt = $conn->prepare("SELECT id FROM cert_appearance WHERE id = ?");
    $checkStmt->bind_param("i", $reportId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Report not found']);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // Prepare update fields (Certificate of Appearance only)
    $updateFields = [];
    $updateValues = [];
    $bindTypes = "";
    
    // Only these fields are part of Certificate of Appearance
    $allowedFields = [
        'participant', 'cert_department', 'activity_name', 'location', 
        'date_held', 'month_held', 'year_held', 'location_two', 'monitored_by', 
        'verified_by'
    ];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = ?";
            $updateValues[] = $input[$field];
            $bindTypes .= "s";
        }
    }
    
    // Set status to 'pending' on update
    $updateFields[] = "status = 'pending'";
    
    // updated_at removed - no longer included
    
    if (empty($updateFields)) {
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        $conn->close();
        exit;
    }
    
    $updateQuery = "UPDATE cert_appearance SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $updateValues[] = $reportId;
    $bindTypes .= "i";
    
    $stmt = $conn->prepare($updateQuery);
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param($bindTypes, ...$updateValues);
    
    if ($stmt->execute()) {
        // Fetch updated report
        $selectStmt = $conn->prepare("SELECT * FROM cert_appearance WHERE id = ?");
        $selectStmt->bind_param("i", $reportId);
        $selectStmt->execute();
        $result = $selectStmt->get_result();
        $updatedReport = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Certificate of Appearance updated successfully and set to pending',
            'data' => $updatedReport
        ]);
        $selectStmt->close();
    } else {
        throw new Exception('Update failed: ' . $stmt->error);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>