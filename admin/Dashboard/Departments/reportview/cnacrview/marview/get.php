<?php
// Database configuration
$host = 'localhost';
$dbname = 'ces_reports_db';
$username = 'root'; // Change this to your actual username
$password = '';     // Change this to your actual password

// Function to get database connection
function getDBConnection() {
    global $host, $dbname, $username, $password;
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// Check if mar_id is provided
if (isset($_GET['mar_id']) && !empty($_GET['mar_id'])) {
    $mar_id = $_GET['mar_id'];
    
    // Get database connection
    $pdo = getDBConnection();
    
    if ($pdo) {
        try {
            // Fetch header data from mar_header table - using correct column names
            $headerStmt = $pdo->prepare("SELECT * FROM mar_header WHERE id = :mar_id");
            $headerStmt->execute([':mar_id' => $mar_id]);
            $headerData = $headerStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($headerData) {
                // Fetch detail data from mar_table - using correct column names
                // Note: report_id in mar_table references id in mar_header
                $detailStmt = $pdo->prepare("SELECT * FROM mar_table WHERE report_id = :mar_id");
                $detailStmt->execute([':mar_id' => $mar_id]);
                $detailData = $detailStmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Prepare response with mapped column names
                $response = [
                    'success' => true,
                    'header' => $headerData,
                    'details' => $detailData
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'No record found with the provided MAR ID'
                ];
            }
        } catch(PDOException $e) {
            $response = [
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ];
        }
    } else {
        $response = [
            'success' => false,
            'message' => 'Database connection failed'
        ];
    }
} else {
    $response = [
        'success' => false,
        'message' => 'MAR ID is required'
    ];
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>