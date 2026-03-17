<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database configuration
$host = 'localhost'; // or your database host
$username = 'root'; // your database username
$password = ''; // your database password
$database = 'ces_reports_db';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Set charset to UTF-8
$conn->set_charset("utf8");

// Check if ID parameter is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    die(json_encode(['error' => 'No ID provided']));
}

$id = $conn->real_escape_string($_GET['id']);

// Query to fetch data from dpir table
$sql = "SELECT * FROM dpir WHERE id = '$id'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    
    // Map database columns to form field names
    $response = [
        'success' => true,
        'data' => [
            'department' => $data['department'] ?? '',
            'date_submitted' => $data['date_submitted'] ?? '',
            'assessment_date' => $data['assessment_date'] ?? '',
            'participant_name' => $data['participant_name'] ?? '',
            'location' => $data['location'] ?? '',
            'family_profile' => $data['family_profile'] ?? '',
            'communtiy_concern' => $data['communtiy_concern'] ?? '',
            'identified_needs' => $data['identified_needs'] ?? '',
            'prevailing_needs' => $data['prevailing_needs'] ?? '',
            'title_of_program' => $data['title_of_program'] ?? '',
            'objectives' => $data['objectives'] ?? '',
            'beneficiaries' => $data['beneficiaries'] ?? '',
            'resources_needed' => $data['resources_needed'] ?? ''
        ]
    ];
    
    echo json_encode($response);
} else {
    echo json_encode(['error' => 'No record found with ID: ' . $id]);
}

$conn->close();
?>