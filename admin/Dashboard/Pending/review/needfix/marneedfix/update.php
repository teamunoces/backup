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

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Update mar_header table (EXCLUDING feedback field)
        $headerStmt = $pdo->prepare("UPDATE mar_header SET 
            department = :department,
            month = :month,
            title_act = :title_act,
            location = :location,
            benefeciaries = :benefeciaries,
            date_submitted = :date_submitted,
            status = :status
            WHERE id = :id");

        $headerResult = $headerStmt->execute([
            ':department' => $data['department'],
            ':month' => $data['month'],
            ':title_act' => $data['title_act'],
            ':location' => $data['location'],
            ':benefeciaries' => $data['benefeciaries'],
            ':date_submitted' => $data['date_submitted'],
            ':status' => $status,
            ':id' => $reportId
        ]);

        if (!$headerResult) {
            throw new Exception("Failed to update header");
        }

        // Delete existing details
        $deleteStmt = $pdo->prepare("DELETE FROM mar_table WHERE report_id = :report_id");
        $deleteStmt->execute([':report_id' => $reportId]);

        // Insert new details
        if (isset($data['details']) && is_array($data['details']) && count($data['details']) > 0) {
            $detailStmt = $pdo->prepare("INSERT INTO mar_table 
                (report_id, date_of_act, activities_conducted, objectives, act_status, 
                issues_or_concerns, financial_report, recommendations, plans_for_next_months) 
                VALUES 
                (:report_id, :date_of_act, :activities_conducted, :objectives, :act_status, 
                :issues_or_concerns, :financial_report, :recommendations, :plans_for_next_months)");

            foreach ($data['details'] as $detail) {
                // Only insert if at least one field has data
                if (!empty($detail['date_of_act']) || !empty($detail['activities_conducted']) || 
                    !empty($detail['objectives']) || !empty($detail['act_status']) || 
                    !empty($detail['issues_or_concerns']) || !empty($detail['financial_report']) || 
                    !empty($detail['recommendations']) || !empty($detail['plans_for_next_months'])) {
                    
                    $detailResult = $detailStmt->execute([
                        ':report_id' => $reportId,
                        ':date_of_act' => $detail['date_of_act'] ?? '',
                        ':activities_conducted' => $detail['activities_conducted'] ?? '',
                        ':objectives' => $detail['objectives'] ?? '',
                        ':act_status' => $detail['act_status'] ?? '',
                        ':issues_or_concerns' => $detail['issues_or_concerns'] ?? '',
                        ':financial_report' => $detail['financial_report'] ?? '',
                        ':recommendations' => $detail['recommendations'] ?? '',
                        ':plans_for_next_months' => $detail['plans_for_next_months'] ?? ''
                    ]);

                    if (!$detailResult) {
                        throw new Exception("Failed to insert detail");
                    }
                }
            }
        }

        // Commit transaction
        $pdo->commit();
        sendResponse(true, "Report updated successfully and status set to pending");

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