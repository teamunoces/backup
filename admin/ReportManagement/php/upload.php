<?php
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    $error_message = "No file uploaded or upload error";
    if (isset($_FILES['file']['error'])) {
        $upload_errors = [
            UPLOAD_ERR_INI_SIZE => "File exceeds upload_max_filesize directive in php.ini",
            UPLOAD_ERR_FORM_SIZE => "File exceeds MAX_FILE_SIZE directive in HTML form",
            UPLOAD_ERR_PARTIAL => "File was only partially uploaded",
            UPLOAD_ERR_NO_FILE => "No file was uploaded",
            UPLOAD_ERR_NO_TMP_DIR => "Missing temporary folder",
            UPLOAD_ERR_CANT_WRITE => "Failed to write file to disk",
            UPLOAD_ERR_EXTENSION => "File upload stopped by extension"
        ];
        $error_message = $upload_errors[$_FILES['file']['error']] ?? "Unknown upload error";
    }
    echo json_encode(["success" => false, "error" => $error_message]);
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
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $file_tmp);
finfo_close($finfo);

$allowed_mime_types = ['application/pdf', 'application/x-pdf'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

if (!in_array($mime_type, $allowed_mime_types) || $file_ext !== 'pdf') {
    echo json_encode(["success" => false, "error" => "Only PDF files are allowed"]);
    exit;
}

// Validate file size (max 10MB)
if ($file_size > 10 * 1024 * 1024) {
    echo json_encode(["success" => false, "error" => "File size must be less than 10MB"]);
    exit;
}

// Create upload directory if it doesn't exist
$upload_dir = $_SERVER['DOCUMENT_ROOT'] . "/admin/ReportManagement/uploads/report_files/";
if (!file_exists($upload_dir)) {
    if (!mkdir($upload_dir, 0755, true)) {
        echo json_encode(["success" => false, "error" => "Failed to create upload directory"]);
        exit;
    }
}

// Sanitize filename and generate unique name
$safe_filename = preg_replace("/[^a-zA-Z0-9.-]/", "_", $file_name);
$unique_filename = uniqid() . '_' . $safe_filename;
$file_path = $upload_dir . $unique_filename;

// Move uploaded file
if (!move_uploaded_file($file_tmp, $file_path)) {
    echo json_encode(["success" => false, "error" => "Failed to save file. Check directory permissions."]);
    exit;
}

// Store relative path for database
$relative_path = "uploads/report_files/" . $unique_filename;

// Check if this is a reupload (existing file)
if ($existing_file_id && $existing_file_id !== '') {
    // Get old file path
    $get_old_sql = "SELECT file_path FROM admin_report_files WHERE id = ?";
    $get_old_stmt = $conn->prepare($get_old_sql);
    $get_old_stmt->bind_param("i", $existing_file_id);
    $get_old_stmt->execute();
    $old_result = $get_old_stmt->get_result();
    $old_file = $old_result->fetch_assoc();
    
    if ($old_file) {
        // Delete old physical file
        $old_file_path = $_SERVER['DOCUMENT_ROOT'] . "/admin/ReportManagement/" . $old_file['file_path'];
        if (file_exists($old_file_path)) {
            unlink($old_file_path);
        }
    }
    
    // Update existing record with new file
    $sql = "UPDATE admin_report_files SET file_name = ?, file_path = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssi", $file_name, $relative_path, $existing_file_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "File reuploaded successfully", 
            "file_id" => $existing_file_id,
            "file_path" => $relative_path,
            "file_name" => $file_name
        ]);
    } else {
        // Delete new file if database update fails
        unlink($file_path);
        echo json_encode(["success" => false, "error" => "Database error: " . $conn->error]);
    }
    
    $get_old_stmt->close();
} else {
    // Insert new record
    $sql = "INSERT INTO admin_report_files (report_id, file_name, file_path) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iss", $report_id, $file_name, $relative_path);
    
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "File uploaded successfully", 
            "file_id" => $stmt->insert_id,
            "file_path" => $relative_path,
            "file_name" => $file_name
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