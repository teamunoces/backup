<?php
// Enable error reporting for debugging, but catch them
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to output

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

// Try to catch any errors
try {
    $host = 'localhost';
    $username = 'root';
    $password = '';
    $database = 'ces_reports_db';

    $conn = new mysqli($host, $username, $password, $database);

    if ($conn->connect_error) {
        sendResponse(false, 'Connection failed: ' . $conn->connect_error);
    }

    $conn->set_charset("utf8");

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
    $status = 'pending';
    $feedback = $data['feedback'] ?? '';

    // Log the received data for debugging
    error_log("Updating report ID: " . $reportId);
    error_log("Data received: " . print_r($data, true));

    // Prepare the SQL statement
    $stmt = $conn->prepare("UPDATE coordinator_cnacr SET 
        department = ?,
        date_submitted = ?,
        date_conduct = ?,
        participants = ?,
        location = ?,
        family_profile = ?,
        community_concern = ?,
        other_identified_needs = ?,
        kabayani_ng_panginoon = ?,
        kabayani_ng_kalikasan = ?,
        kabayani_ng_buhay = ?,
        kabayani_ng_turismo = ?,
        kabayani_ng_kultura = ?,
        title_of_program = ?,
        objectives = ?,
        beneficiaries = ?,
        from_school = ?,
        from_community = ?,
        feedback = ?,
        status = ?
        WHERE id = ?");

    if (!$stmt) {
        sendResponse(false, 'Prepare statement failed: ' . $conn->error);
    }

    $stmt->bind_param("ssssssssssssssssssssi", 
        $data['department'],
        $data['date'],
        $data['date_conduct'],
        $data['participants'],
        $data['location'],
        $data['family_profile'],
        $data['community_concern'],
        $data['other_identified_needs'],
        $data['kabayani_ng_panginoon'],
        $data['kabayani_ng_kalikasan'],
        $data['kabayani_ng_buhay'],
        $data['kabayani_ng_turismo'],
        $data['kabayani_ng_kultura'],
        $data['title_of_program'],
        $data['objectives'],
        $data['beneficiaries'],
        $data['from_school'],
        $data['from_community'],
        $feedback,
        $status,
        $reportId
    );

    if ($stmt->execute()) {
        sendResponse(true, 'Report updated successfully and status set to pending');
    } else {
        sendResponse(false, 'Failed to update report: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    sendResponse(false, 'Exception: ' . $e->getMessage());
} catch (Error $e) {
    sendResponse(false, 'Error: ' . $e->getMessage());
}
?>