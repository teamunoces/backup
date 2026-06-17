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
$userDepartment = $_SESSION['department'] ?? '';

try {
    $sql = "SELECT * FROM reflection_paper WHERE 1=1";
    $params = [];
    
    if ($reportId) {
        $sql .= " AND id = :id";
        $params[':id'] = $reportId;
    } else if ($reportType && $userDepartment) {
        $sql .= " AND type = :type AND implementing_department = :department ORDER BY id DESC LIMIT 1";
        $params[':type'] = $reportType;
        $params[':department'] = $userDepartment;
    } else if ($userDepartment) {
        $sql .= " AND implementing_department = :department ORDER BY id DESC";
        $params[':department'] = $userDepartment;
    } else {
        echo json_encode(['success' => false, 'error' => 'No valid parameters provided']);
        exit;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($results) {
        // Process each result to decode extension_services
        foreach ($results as &$row) {
            if (!empty($row['extension_services'])) {
                $decoded = json_decode($row['extension_services'], true);
                if (is_array($decoded)) {
                    $row['extension_services'] = $decoded;
                } else {
                    // If stored as comma-separated string
                    $row['extension_services'] = array_map('trim', explode(',', $row['extension_services']));
                }
            } else {
                $row['extension_services'] = [];
            }
        }
        
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