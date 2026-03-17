<?php
/* ==========================================
   FINAL APPROVAL.PHP - Get data from session
========================================== */

session_start();
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Database connection
$host = 'localhost';
$dbname = 'approval_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Check session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

// DEBUG: Log session data to PHP error log
error_log('=== SESSION DATA ===');
error_log('Name: "' . ($_SESSION['name'] ?? 'NOT SET') . '"');
error_log('Dean: "' . ($_SESSION['dean'] ?? 'NOT SET') . '"');
error_log('===================');

// IMPORTANT: Get session data FIRST and preserve it
$session_dean = $_SESSION['dean'] ?? '';
$session_name = $_SESSION['name'] ?? $_SESSION['username'] ?? '';

// Initialize response with session data
$response = [
    // Session data - THESE ARE THE MOST IMPORTANT and will NOT be overwritten
    'user_name' => $session_name,
    'dean' => $session_dean,
    
    // Approval data - will be filled from database if available
    'ces_head' => '',
    'ces_head_suffix' => '',
    'vp_acad' => '',
    'vp_acad_suffix' => '',
    'vp_admin' => '',
    'vp_admin_suffix' => '',
    'school_president' => '',
    'school_president_suffix' => '',
    
    // Document info - will be filled from database if available
    'issue_status' => '',
    'revision_number' => '',
    'date_effective' => '',
    'approved_by' => ''
];

// Get approvals from database (for approvers only)
try {
    $stmt = $pdo->query("
        SELECT 
            ces_head, ces_head_suffix,
            vp_acad, vp_acad_suffix,
            vp_admin, vp_admin_suffix,
            school_president, school_president_suffix
        FROM approvals 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    $approvals = $stmt->fetch();
    
    if ($approvals) {
        // Only update approval fields, NOT user_name or dean
        $response['ces_head'] = $approvals['ces_head'] ?? '';
        $response['ces_head_suffix'] = $approvals['ces_head_suffix'] ?? '';
        $response['vp_acad'] = $approvals['vp_acad'] ?? '';
        $response['vp_acad_suffix'] = $approvals['vp_acad_suffix'] ?? '';
        $response['vp_admin'] = $approvals['vp_admin'] ?? '';
        $response['vp_admin_suffix'] = $approvals['vp_admin_suffix'] ?? '';
        $response['school_president'] = $approvals['school_president'] ?? '';
        $response['school_president_suffix'] = $approvals['school_president_suffix'] ?? '';
        
        error_log('Approvals loaded from database');
    }
} catch (Exception $e) {
    error_log('Error fetching approvals: ' . $e->getMessage());
}

// Get document info from database
try {
    $stmt = $pdo->query("
        SELECT 
            issue_status, revision_number, date_effective, approved_by
        FROM document_info 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    $docInfo = $stmt->fetch();
    
    if ($docInfo) {
        $response['issue_status'] = $docInfo['issue_status'] ?? '';
        $response['revision_number'] = $docInfo['revision_number'] ?? '';
        $response['date_effective'] = $docInfo['date_effective'] ?? '';
        $response['approved_by'] = $docInfo['approved_by'] ?? '';
        
        error_log('Document info loaded from database');
    }
} catch (Exception $e) {
    error_log('Error fetching document info: ' . $e->getMessage());
}

// Final check before sending
error_log('Final response - user_name: "' . $response['user_name'] . '", dean: "' . $response['dean'] . '"');

// Return the response
echo json_encode($response);
?>