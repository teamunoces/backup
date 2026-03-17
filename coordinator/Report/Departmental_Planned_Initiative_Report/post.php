<?php
session_start();
header('Content-Type: application/json');

// Database connection
$conn = new mysqli("localhost", "root", "", "ces_reports_db");
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Validate session
if (!isset($_SESSION['department'], $_SESSION['name'], $_SESSION['role'], $_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User session not found. Please log in again.']);
    exit();
}

// Session variables
$department = $_SESSION['department'];
$created_by_name = $_SESSION['name'];
$role = $_SESSION['role'] ?? 'N/A';
$user_id = $_SESSION['user_id'] ?? '0';

// Get JSON data
$data = json_decode(file_get_contents('php://input'), true);

// Form fields
$type = $data['type'] ?? '';
$date_submitted = $data['date_submitted'] ?? date('Y-m-d');
$assessment_date = $data['assessment_date'] ?? '';
$participant_name = $data['participant_name'] ?? '';
$location = $data['location'] ?? '';
$family_profile = $data['family_profile'] ?? '';
$communtiy_concern = $data['communtiy_concern'] ?? '';
$identified_needs = $data['identified_needs'] ?? '';
$prevailing_needs = $data['prevailing_needs'] ?? '';
$title_of_program = $data['title_of_program'] ?? '';
$objectives = $data['objectives'] ?? '';
$beneficiaries = $data['beneficiaries'] ?? '';
$resources_needed = $data['resources_needed'] ?? '';
$status = 'pending';

// Debug
error_log("Submitting report by $created_by_name, role: $role, user_id: $user_id");

// Validate
if (empty($participant_name)) {
    echo json_encode(['success' => false, 'error' => 'Participant name is required']);
    exit();
}

// Prepare insert
$stmt = $conn->prepare("INSERT INTO dpir 
(type, department, date_submitted, assessment_date, participant_name, location, family_profile, communtiy_concern, identified_needs, prevailing_needs, title_of_program, objectives, beneficiaries, resources_needed, created_by_name, status, role, user_id) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    exit();
}

// Bind parameters
$stmt->bind_param(
    "ssssssssssssssssss",
    $type, $department, $date_submitted, $assessment_date, $participant_name,
    $location, $family_profile, $communtiy_concern, $identified_needs, $prevailing_needs,
    $title_of_program, $objectives, $beneficiaries, $resources_needed, $created_by_name,
    $status, $role, $user_id
);

// Execute
if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Report submitted successfully!',
        'id' => $stmt->insert_id
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Execute failed: ' . $stmt->error]);
}

// Close
$stmt->close();
$conn->close();
?>