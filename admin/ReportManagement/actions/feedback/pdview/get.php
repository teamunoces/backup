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
            (report_id, program, milestones, duration, objectives, persons_involved, 
            school_resources, community_resources, collaborating_agencies, budget, 
            means_of_verification, remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        foreach ($data['details'] as $row) {
            $stmt->bind_param("isssssssssss", 
                $reportId,
                $row['program'],
                $row['milestones'],
                $row['duration'],
                $row['objectives'],
                $row['persons_involved'],
                $row['school_resources'],
                $row['community_resources'],
                $row['collaborating_agencies'],
                $row['budget'],
                $row['means_of_verification'],
                $row['remarks']
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