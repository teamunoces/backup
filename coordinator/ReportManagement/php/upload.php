<?php
session_start();
header('Content-Type: application/json');

// Turn off error reporting
error_reporting(0);
ini_set('display_errors', 0);

// Check login session
if (!isset($_SESSION['name']) || !isset($_SESSION['role'])) {
    echo json_encode(["success" => false, "error" => "Unauthorized access"]);
    exit;
}

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "error" => "No file uploaded or upload error"]);
    exit;
}

$report_id = $_POST['report_id'] ?? null;
$report_table = $_POST['report_table'] ?? null;
$existing_file_id = $_POST['existing_file_id'] ?? null;

if (!$report_id || !$report_table) {
    echo json_encode(["success" => false, "error" => "Missing report information"]);
    exit;
}

$file = $_FILES['file'];
$file_name = $file['name'];
$file_tmp = $file['tmp_name'];
$file_size = $file['size'];

// Validate file type
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
if ($file_ext !== 'pdf') {
    echo json_encode(["success" => false, "error" => "Only PDF files are allowed"]);
    exit;
}

// Validate file size (max 10MB)
if ($file_size > 10 * 1024 * 1024) {
    echo json_encode(["success" => false, "error" => "File size must be less than 10MB"]);
    exit;
}

// Create upload directory if it doesn't exist
$upload_dir = "../uploads/report_files/";
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Generate unique filename
$unique_filename = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", $file_name);
$file_path = $upload_dir . $unique_filename;

// Move uploaded file
if (!move_uploaded_file($file_tmp, $file_path)) {
    echo json_encode(["success" => false, "error" => "Failed to save file"]);
    exit;
}

// Store relative path without leading slash
$relative_path = "uploads/report_files/" . $unique_filename;

// Check if this is a reupload (existing file)
if ($existing_file_id && $existing_file_id !== '') {
    // Get old file path
    $get_old_sql = "SELECT file_path FROM report_files WHERE id = ?";
    $get_old_stmt = $conn->prepare($get_old_sql);
    $get_old_stmt->bind_param("i", $existing_file_id);
    $get_old_stmt->execute();
    $old_result = $get_old_stmt->get_result();
    $old_file = $old_result->fetch_assoc();
    
    if ($old_file) {
        // Delete old physical file
        $old_file_path = "../" . $old_file['file_path'];
        if (file_exists($old_file_path)) {
            unlink($old_file_path);
        }
    }
    
    // Update existing record with new file
    $sql = "UPDATE report_files SET file_name = ?, file_path = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $file_name, $relative_path, $existing_file_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "File reuploaded successfully", 
            "file_id" => $existing_file_id,
            "file_path" => $relative_path
        ]);
    } else {
        // Delete new file if database update fails
        unlink($file_path);
        echo json_encode(["success" => false, "error" => "Database error: " . $conn->error]);
    }
    
    $get_old_stmt->close();
} else {
    // Insert new record
    $sql = "INSERT INTO report_files (report_id, file_name, file_path) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iss", $report_id, $file_name, $relative_path);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "File uploaded successfully", 
            "file_id" => $stmt->insert_id,
            "file_path" => $relative_path
        ]);
    } else {
        // Delete file if database insert fails
        unlink($file_path);
        echo json_encode(["success" => false, "error" => "Database error: " . $conn->error]);
    }
}

$stmt->close();
$conn->close();
?>