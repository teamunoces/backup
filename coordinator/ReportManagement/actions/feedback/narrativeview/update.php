<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

// Get report ID
$reportId = isset($input['report_id']) ? intval($input['report_id']) : null;

if (!$reportId) {
    echo json_encode(['success' => false, 'message' => 'Report ID is required']);
    exit;
}

// Get fields to update
$narrate_success = isset($input['narrate_success']) ? htmlspecialchars($input['narrate_success']) : null;
$provide_data = isset($input['provide_data']) ? htmlspecialchars($input['provide_data']) : null;
$identify_problems = isset($input['identify_problems']) ? htmlspecialchars($input['identify_problems']) : null;
$propose_solutions = isset($input['propose_solutions']) ? htmlspecialchars($input['propose_solutions']) : null;

// Database connection
$host = 'localhost';
$dbname = 'ces_reports_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Build update query
    $updateFields = [];
    $params = [':id' => $reportId];
    
    if ($narrate_success !== null) {
        $updateFields[] = "narrate_success = :narrate_success";
        $params[':narrate_success'] = $narrate_success;
    }
    
    if ($provide_data !== null) {
        $updateFields[] = "provide_data = :provide_data";
        $params[':provide_data'] = $provide_data;
    }
    
    if ($identify_problems !== null) {
        $updateFields[] = "identify_problems = :identify_problems";
        $params[':identify_problems'] = $identify_problems;
    }
    
    if ($propose_solutions !== null) {
        $updateFields[] = "propose_solutions = :propose_solutions";
        $params[':propose_solutions'] = $propose_solutions;
    }
    
    // Always set status to pending when updating
    $updateFields[] = "status = 'pending'";
    
    if (empty($updateFields)) {
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }
    
    $sql = "UPDATE narrative_report SET " . implode(", ", $updateFields) . " WHERE id = :id";
    
    // Restrict users from updating reports that don't belong to them
    $role = $_SESSION['role'] ?? '';
    if ($role != 'admin' && $role != 'dean') {
        $sql .= " AND user_id = :user_id";
        $params[':user_id'] = $_SESSION['user_id'];
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Report updated successfully',
            'report_id' => $reportId,
            'status' => 'pending'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No changes made or report not found'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
}
?>