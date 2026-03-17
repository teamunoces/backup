<?php
session_start();
header('Content-Type: application/json');

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ces_reports_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Validate session first - user MUST be logged in
if (!isset($_SESSION['department']) || !isset($_SESSION['name'])) {
    echo json_encode(['success' => false, 'error' => 'User session not found. Please log in again.']);
    exit();
}

// Get JSON data from AJAX request
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Get data from JSON - but department and created_by come from SESSION
$type = $data['type'] ?? '';
$department = $_SESSION['department']; // From session, not from $data
$date_submitted = $data['date_submitted'] ?? date('Y-m-d');
$assessment_date = $data['assessment_date'] ?? '';
$participant_name = $data['participant_name'] ?? ''; // This comes from the form
$location = $data['location'] ?? '';
$family_profile = $data['family_profile'] ?? '';
$communtiy_concern = $data['communtiy_concern'] ?? '';
$identified_needs = $data['identified_needs'] ?? '';
$prevailing_needs = $data['prevailing_needs'] ?? '';
$title_of_program = $data['title_of_program'] ?? '';
$objectives = $data['objectives'] ?? '';
$beneficiaries = $data['beneficiaries'] ?? '';
$resources_needed = $data['resources_needed'] ?? '';
$created_by_name = $_SESSION['name']; // From session, not from $data
$status = 'pending';

// Debug log
error_log("Report submitted - Participant: $participant_name, Submitted by: $created_by_name, Dept: $department");

// Validate required fields
if (empty($participant_name)) {
    echo json_encode(['success' => false, 'error' => 'Participant name is required']);
    exit();
}

// FIXED: Corrected SQL statement - removed 'feedback' column since it doesn't exist in your table
$stmt = $conn->prepare("INSERT INTO dpir 
(type, department, date_submitted, assessment_date, participant_name, location, family_profile, communtiy_concern, identified_needs, prevailing_needs, title_of_program, objectives, beneficiaries, resources_needed, created_by_name, status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit();
}

// FIXED: Removed 'feedback' from bind_param to match the number of placeholders (16)
$stmt->bind_param("ssssssssssssssss", 
    $type, $department, $date_submitted, $assessment_date, $participant_name, 
    $location, $family_profile, $communtiy_concern, $identified_needs, $prevailing_needs, 
    $title_of_program, $objectives, $beneficiaries, $resources_needed, $created_by_name, $status
);

// Execute and return JSON response
if ($stmt->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => 'Report submitted successfully!',
        'id' => $stmt->insert_id
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Execute failed: ' . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>