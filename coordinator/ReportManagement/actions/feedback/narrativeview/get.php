<?php
session_start();
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'ces_reports_db';
$username = 'root'; // change if needed
$password = ''; // change if needed

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Get parameters
$reportId = isset($_GET['id']) ? (int)$_GET['id'] : null;
$reportType = isset($_GET['type']) ? $_GET['type'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;
$userDepartment = $_SESSION['department'] ?? '';
$userId = $_SESSION['user_id'] ?? '';

try {
    // Build query for narrative_report table
    $sql = "SELECT * FROM narrative_report WHERE 1=1";
    $params = [];
    
    if ($reportId) {
        $sql .= " AND id = :id";
        $params[':id'] = $reportId;
    } 
    
    if ($reportType) {
        $sql .= " AND type = :type";
        $params[':type'] = $reportType;
    }
    
    if ($status) {
        $sql .= " AND status = :status";
        $params[':status'] = $status;
    }
    
    // If user is not admin/dean, show only their department reports
    $role = $_SESSION['role'] ?? '';
    if ($role != 'admin' && $role != 'dean') {
        $sql .= " AND department = :department";
        $params[':department'] = $userDepartment;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    // If specific ID, get single record, otherwise get latest for the type
    if (!$reportId && $reportType && $userDepartment) {
        $sql .= " LIMIT 1";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($results) {
        echo json_encode([
            'success' => true,
            'data' => $results
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'data' => [],
            'message' => 'No existing record found'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Query failed: ' . $e->getMessage()]);
}
?>