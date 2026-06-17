<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Clear any output buffering
while (ob_get_level()) {
    ob_end_clean();
}

header('Content-Type: application/json');

function sendJsonResponse($success, $message, $data = null) {
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

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

    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('No data received or invalid JSON');
    }

    // Log received data for debugging
    error_log('Update request received: ' . print_r($input, true));

    $reportId = isset($input['id']) ? intval($input['id']) : 0;

    if ($reportId <= 0) {
        throw new Exception('Invalid report ID');
    }

    // Extract form data with proper escaping
    $venue = isset($input['venue']) ? $conn->real_escape_string(trim($input['venue'])) : '';
    $implementingDepartment = isset($input['implementing_department']) ? $conn->real_escape_string(trim($input['implementing_department'])) : '';
    $serviceTypes = isset($input['service_types']) && is_array($input['service_types']) ? implode(', ', array_map([$conn, 'real_escape_string'], $input['service_types'])) : '';
    $evaluatedBy = isset($input['evaluated_by']) ? $conn->real_escape_string(trim($input['evaluated_by'])) : '';
    $signature = isset($input['signature']) ? $conn->real_escape_string(trim($input['signature'])) : '';
    $evaluationDate = isset($input['date']) ? $conn->real_escape_string(trim($input['date'])) : '';

    // Get ratings - handle null values properly
    $q1 = isset($input['q1']) && $input['q1'] !== null && $input['q1'] !== '' ? intval($input['q1']) : null;
    $q2 = isset($input['q2']) && $input['q2'] !== null && $input['q2'] !== '' ? intval($input['q2']) : null;
    $q3 = isset($input['q3']) && $input['q3'] !== null && $input['q3'] !== '' ? intval($input['q3']) : null;
    $q4 = isset($input['q4']) && $input['q4'] !== null && $input['q4'] !== '' ? intval($input['q4']) : null;
    $q5 = isset($input['q5']) && $input['q5'] !== null && $input['q5'] !== '' ? intval($input['q5']) : null;
    $q6 = isset($input['q6']) && $input['q6'] !== null && $input['q6'] !== '' ? intval($input['q6']) : null;
    $q7 = isset($input['q7']) && $input['q7'] !== null && $input['q7'] !== '' ? intval($input['q7']) : null;
    $q8 = isset($input['q8']) && $input['q8'] !== null && $input['q8'] !== '' ? intval($input['q8']) : null;
    $q9 = isset($input['q9']) && $input['q9'] !== null && $input['q9'] !== '' ? intval($input['q9']) : null;
    $q10 = isset($input['q10']) && $input['q10'] !== null && $input['q10'] !== '' ? intval($input['q10']) : null;
    $q11 = isset($input['q11']) && $input['q11'] !== null && $input['q11'] !== '' ? intval($input['q11']) : null;
    $q12 = isset($input['q12']) && $input['q12'] !== null && $input['q12'] !== '' ? intval($input['q12']) : null;
    $q13 = isset($input['q13']) && $input['q13'] !== null && $input['q13'] !== '' ? intval($input['q13']) : null;
    $q14 = isset($input['q14']) && $input['q14'] !== null && $input['q14'] !== '' ? intval($input['q14']) : null;
    $q15 = isset($input['q15']) && $input['q15'] !== null && $input['q15'] !== '' ? intval($input['q15']) : null;

    // First, check if report exists
    $checkStmt = $conn->prepare("SELECT id, status FROM evaluation_reports WHERE id = ?");
    if (!$checkStmt) {
        throw new Exception('Prepare failed for check: ' . $conn->error);
    }
    
    $checkStmt->bind_param("i", $reportId);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        $checkStmt->close();
        throw new Exception('Report not found with ID: ' . $reportId);
    }
    
    $report = $result->fetch_assoc();
    $oldStatus = $report['status'];
    $checkStmt->close();

    // Update query - NOW INCLUDING STATUS
    // We're updating all fields plus setting status to 'pending'
    $sql = "UPDATE evaluation_reports SET 
                venue = ?,
                implementing_department = ?,
                service_types = ?,
                q1_rating = ?,
                q2_rating = ?,
                q3_rating = ?,
                q4_rating = ?,
                q5_rating = ?,
                q6_rating = ?,
                q7_rating = ?,
                q8_rating = ?,
                q9_rating = ?,
                q10_rating = ?,
                q11_rating = ?,
                q12_rating = ?,
                q13_rating = ?,
                q14_rating = ?,
                q15_rating = ?,
                evaluated_by = ?,
                signature = ?,
                evaluation_date = ?,
                status = ?  -- Set status to pending
            WHERE id = ?";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Prepare failed for update: ' . $conn->error);
    }

    // Set status to 'pending'
    $status = 'pending';
    
    // Create type string with proper types
    // We have: 3 strings (venue, dept, types) + 15 integers (ratings) + 3 strings (evaluated_by, signature, date) + 1 string (status) + 1 integer (id)
    // Total: 23 parameters
    $types = "sss";
    for ($i = 1; $i <= 15; $i++) {
        $types .= "i";
    }
    $types .= "ssssi"; // evaluated_by (s), signature (s), evaluation_date (s), status (s), id (i)
    
    error_log("Types string: $types");
    error_log("Number of parameters: " . strlen($types));
    
    // Bind all parameters
    $stmt->bind_param(
        $types,
        $venue,
        $implementingDepartment,
        $serviceTypes,
        $q1, $q2, $q3, $q4, $q5,
        $q6, $q7, $q8, $q9, $q10,
        $q11, $q12, $q13, $q14, $q15,
        $evaluatedBy,
        $signature,
        $evaluationDate,
        $status,  // New status parameter
        $reportId
    );

    if ($stmt->execute()) {
        $affectedRows = $stmt->affected_rows;
        error_log("Update executed successfully. Affected rows: $affectedRows");
        error_log("Status changed from '$oldStatus' to '$status' for report ID: $reportId");
        
        sendJsonResponse(true, 'Report updated successfully and status set to pending', [
            'id' => $reportId, 
            'affected_rows' => $affectedRows,
            'old_status' => $oldStatus,
            'new_status' => $status
        ]);
    } else {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log('Update error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(false, $e->getMessage());
} catch (Error $e) {
    error_log('Fatal error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    sendJsonResponse(false, 'System error: ' . $e->getMessage());
}
?>