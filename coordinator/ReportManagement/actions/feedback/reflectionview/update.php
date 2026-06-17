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

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Only POST method allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// If no JSON data, try standard POST
if (!$input) {
    $input = $_POST;
}

// Validate required fields
$reportId = isset($input['id']) ? (int)$input['id'] : null;
$beneficiaryName = isset($input['beneficiary_name']) ? trim($input['beneficiary_name']) : '';
$implementingDepartment = isset($input['implementing_department']) ? trim($input['implementing_department']) : '';
$extensionServices = isset($input['extension_services']) ? $input['extension_services'] : [];
$answerOne = isset($input['answer_one']) ? trim($input['answer_one']) : '';
$answerTwo = isset($input['answer_two']) ? trim($input['answer_two']) : '';
$answerThree = isset($input['answer_three']) ? trim($input['answer_three']) : '';
$beneficiarySignature = isset($input['beneficiary_signature']) ? trim($input['beneficiary_signature']) : '';

if (!$reportId) {
    echo json_encode(['success' => false, 'error' => 'Report ID is required for update']);
    exit;
}

if (empty($beneficiaryName)) {
    echo json_encode(['success' => false, 'error' => 'Beneficiary name is required']);
    exit;
}

if (empty($implementingDepartment)) {
    echo json_encode(['success' => false, 'error' => 'Implementing department is required']);
    exit;
}

// Convert extension services array to JSON for storage
$extensionServicesJson = json_encode($extensionServices);

try {
    // First, check if the report exists
    $checkStmt = $pdo->prepare("SELECT id FROM reflection_paper WHERE id = :id");
    $checkStmt->execute([':id' => $reportId]);
    
    if (!$checkStmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Report not found with ID: ' . $reportId]);
        exit;
    }
    
    // Update the report and set status to 'pending'
    $stmt = $pdo->prepare("
        UPDATE reflection_paper 
        SET beneficiary_name = :beneficiary_name,
            implementing_department = :implementing_department,
            extension_services = :extension_services,
            answer_one = :answer_one,
            answer_two = :answer_two,
            answer_three = :answer_three,
            beneficiary_signature = :beneficiary_signature,
            status = 'pending'
        WHERE id = :id
    ");
    
    $stmt->execute([
        ':beneficiary_name' => $beneficiaryName,
        ':implementing_department' => $implementingDepartment,
        ':extension_services' => $extensionServicesJson,
        ':answer_one' => $answerOne,
        ':answer_two' => $answerTwo,
        ':answer_three' => $answerThree,
        ':beneficiary_signature' => $beneficiarySignature,
        ':id' => $reportId
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Report updated successfully and status changed to pending',
        'data' => [
            'id' => $reportId,
            'beneficiary_name' => $beneficiaryName,
            'implementing_department' => $implementingDepartment,
            'extension_services' => $extensionServices,
            'answer_one' => $answerOne,
            'answer_two' => $answerTwo,
            'answer_three' => $answerThree,
            'beneficiary_signature' => $beneficiarySignature,
            'status' => 'pending'
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Update failed: ' . $e->getMessage()]);
}
?>