<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_reports_db");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "No report ID provided"]);
    exit;
}

$reportId = intval($data['id']);
$status = 'pending'; // Set status back to pending for re-submission
$feedback = $data['feedback'] ?? '';

// Start transaction
$conn->begin_transaction();

try {
    // Update pd_main table
    $stmt = $conn->prepare("UPDATE pd_main SET 
        department = ?, 
        title_of_activity = ?, 
        participants = ?, 
        location = ?, 
        feedback = ?,
        status = ? 
        WHERE id = ?");
    
    $stmt->bind_param("ssssssi", 
        $data['department'],
        $data['title_of_activity'],
        $data['participants'],
        $data['location'],
        $feedback,
        $status,
        $reportId
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update main table: " . $stmt->error);
    }
    $stmt->close();
    
    // Delete existing details
    $stmt = $conn->prepare("DELETE FROM pd_detail WHERE report_id = ?");
    $stmt->bind_param("i", $reportId);
    if (!$stmt->execute()) {
        throw new Exception("Failed to delete old details: " . $stmt->error);
    }
    $stmt->close();
    
// Insert new details
if (isset($data['details']) && is_array($data['details'])) {
    $stmt = $conn->prepare("INSERT INTO pd_detail 
        (report_id, program, objectives, program_content_and_activities, service_delivery, 
        partnerships_and_stakeholders, facilitators_and_trainers, program_start_and_end_dates, 
        frequency_of_activities, community_resources, school_resources, 
        risk_management_and_contingency_plans, sustainability_and_follow_up, promotion_and_awareness) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($data['details'] as $row) {
        $stmt->bind_param("isssssssssssss", 
            $reportId,
            $row['program'],
            $row['objectives'],
            $row['program_content_and_activities'],
            $row['service_delivery'],
            $row['partnerships_and_stakeholders'],
            $row['facilitators_and_trainers'],
            $row['program_start_and_end_dates'],
            $row['frequency_of_activities'],
            $row['community_resources'],
            $row['school_resources'],
            $row['risk_management_and_contingency_plans'],
            $row['sustainability_and_follow_up'],
            $row['promotion_and_awareness']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Failed to insert detail: " . $stmt->error);
        }
    }
    $stmt->close();
}
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true, 
        "message" => "Report updated successfully and status set to pending"
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>