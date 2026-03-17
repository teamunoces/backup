<?php

session_start();
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'ces_reports_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // ===== Get logged-in user's info =====
    $createdBy = $_SESSION['name'] ?? 'Unknown User';
    $role = $_SESSION['role'] ?? 'N/A';
    $user_id = $_SESSION['user_id'] ?? '0'; // Ensure it matches your login session key

    // 1. Insert into main_header with role and user_id
    $sqlMain = "INSERT INTO mar_header 
    (type, department, month, title_act, location, benefeciaries, created_by_name, feedback, status, role, user_id) 
    VALUES (:type, :department, :month, :title_act, :location, :benefeciaries, :created_by_name, :feedback, :status, :role, :user_id)";
    
    $stmtMain = $pdo->prepare($sqlMain);
    $stmtMain->execute([
        ':type'              => $_POST['type'] ?? 'Monthly Accomplishment Report',
        ':department'        => $_POST['department'] ?? '',
        ':month'             => $_POST['month'] ?? '',
        ':title_act'         => $_POST['title_act'] ?? '',
        ':location'          => $_POST['location'] ?? '',
        ':benefeciaries'     => $_POST['benefeciaries'] ?? '',     
        ':created_by_name'   => $createdBy,
        ':feedback'          => $_POST['feedback'] ?? '',
        ':status'            => $_POST['status'] ?? 'pending',
        ':role'              => $role,
        ':user_id'           => $user_id
    ]);

    $reportId = $pdo->lastInsertId();

    // 2. Insert into mar_table
    if (!empty($_POST['date_of_act'])) {
        $sqlDetail = "INSERT INTO mar_table
        (report_id, date_of_act, activities_conducted, objectives, act_status, issues_or_concerns, financial_report, recommendations, plans_for_next_months)
        VALUES
        (:report_id, :date_of_act, :activities_conducted, :objectives, :act_status, :issues_or_concerns, :financial_report, :recommendations, :plans_for_next_months)";
        
        $stmtDetail = $pdo->prepare($sqlDetail);

        foreach ($_POST['date_of_act'] as $i => $date) {
            if (empty($_POST['date_of_act'][$i]) && empty($_POST['activities_conducted'][$i])) continue;

            $stmtDetail->execute([
                ':report_id'            => $reportId,
                ':date_of_act'          => $_POST['date_of_act'][$i] ?? '',
                ':activities_conducted' => $_POST['activities_conducted'][$i] ?? '',
                ':objectives'           => $_POST['objectives'][$i] ?? '',
                ':act_status'           => $_POST['act_status'][$i] ?? '',
                ':issues_or_concerns'   => $_POST['issues_or_concerns'][$i] ?? '',
                ':financial_report'     => $_POST['financial_report'][$i] ?? '',
                ':recommendations'      => $_POST['recommendations'][$i] ?? '',
                ':plans_for_next_months'=> $_POST['plans_for_next_months'][$i] ?? ''
            ]);
        }
    }

    echo "Data successfully inserted! Report ID: $reportId";

} catch (\PDOException $e) {
    http_response_code(500);
    echo "Database error: " . $e->getMessage();
}
?>