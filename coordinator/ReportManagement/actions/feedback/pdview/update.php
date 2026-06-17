<?php
// Enable error reporting for debugging, but catch them
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    // Database configuration
    $host = 'localhost';
    $dbname = 'ces_reports_db';
    $username = 'root';
    $password = '';

    // Get database connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get the raw POST data
    $input = file_get_contents('php://input');
    if (!$input) {
        sendResponse(false, 'No data received');
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data['id'])) {
        sendResponse(false, 'No report ID provided');
    }

    $reportId = intval($data['id']);
    $status = 'pending'; // Set status back to pending for re-submission

    // Validate required fields
    $requiredFields = ['department', 'title_of_activity', 'participants', 'location'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            sendResponse(false, "Field '$field' is required");
        }
    }

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Update pd_main table - Removed updated_at field
        $headerStmt = $pdo->prepare("UPDATE pd_main SET 
            department = :department,
            title_of_activity = :title_of_activity,
            participants = :participants,
            location = :location,
            status = :status
            WHERE id = :id");
        
        $headerResult = $headerStmt->execute([
            ':department' => $data['department'],
            ':title_of_activity' => $data['title_of_activity'],
            ':participants' => $data['participants'],
            ':location' => $data['location'],
            ':status' => $status,
            ':id' => $reportId
        ]);

        if (!$headerResult) {
            throw new Exception("Failed to update main table");
        }

        // Delete existing details
        $deleteStmt = $pdo->prepare("DELETE FROM pd_detail WHERE report_id = :report_id");
        $deleteStmt->execute([':report_id' => $reportId]);

       // Insert new details
        if (isset($data['details']) && is_array($data['details']) && count($data['details']) > 0) {
            $detailStmt = $pdo->prepare("INSERT INTO pd_detail 
                (report_id, program, objectives, program_content_and_activities, service_delivery, 
                partnerships_and_stakeholders, facilitators_and_trainers, program_start_and_end_dates, 
                frequency_of_activities, community_resources, school_resources, 
                risk_management_and_contingency_plans, sustainability_and_follow_up, promotion_and_awareness) 
                VALUES 
                (:report_id, :program, :objectives, :program_content_and_activities, :service_delivery, 
                :partnerships_and_stakeholders, :facilitators_and_trainers, :program_start_and_end_dates, 
                :frequency_of_activities, :community_resources, :school_resources, 
                :risk_management_and_contingency_plans, :sustainability_and_follow_up, :promotion_and_awareness)");

            $insertCount = 0;
            
            foreach ($data['details'] as $row) {
                // Only insert if at least one field has data
                $hasData = false;
                foreach ($row as $value) {
                    if (!empty(trim($value))) {
                        $hasData = true;
                        break;
                    }
                }
                
                if ($hasData) {
                    $detailResult = $detailStmt->execute([
                        ':report_id' => $reportId,
                        ':program' => $row['program'] ?? '',
                        ':objectives' => $row['objectives'] ?? '',
                        ':program_content_and_activities' => $row['program_content_and_activities'] ?? '',
                        ':service_delivery' => $row['service_delivery'] ?? '',
                        ':partnerships_and_stakeholders' => $row['partnerships_and_stakeholders'] ?? '',
                        ':facilitators_and_trainers' => $row['facilitators_and_trainers'] ?? '',
                        ':program_start_and_end_dates' => $row['program_start_and_end_dates'] ?? '',
                        ':frequency_of_activities' => $row['frequency_of_activities'] ?? '',
                        ':community_resources' => $row['community_resources'] ?? '',
                        ':school_resources' => $row['school_resources'] ?? '',
                        ':risk_management_and_contingency_plans' => $row['risk_management_and_contingency_plans'] ?? '',
                        ':sustainability_and_follow_up' => $row['sustainability_and_follow_up'] ?? '',
                        ':promotion_and_awareness' => $row['promotion_and_awareness'] ?? ''
                    ]);

                    if (!$detailResult) {
                        throw new Exception("Failed to insert detail");
                    }
                    $insertCount++;
                }
            }

            
            // Optional: Check if at least one row was inserted
            if ($insertCount === 0) {
                throw new Exception("No valid detail rows found to insert");
            }
        } else {
            throw new Exception("No details provided");
        }

        // Commit transaction
        $pdo->commit();
        
        sendResponse(true, "Report re-submitted successfully and status set to pending", [
            'report_id' => $reportId,
            'status' => $status,
            'details_count' => $insertCount ?? 0
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(false, "Database error: " . $e->getMessage());
    }

} catch (PDOException $e) {
    sendResponse(false, "Connection failed: " . $e->getMessage());
} catch (Exception $e) {
    sendResponse(false, "Server error: " . $e->getMessage());
}
?>