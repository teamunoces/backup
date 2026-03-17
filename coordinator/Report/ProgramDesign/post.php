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

    // 1. Insert into pd_main with role and user_id
    $sqlMain = "INSERT INTO pd_main 
    (type, department, title_of_activity, participants, location, created_by_name, feedback, status, role, user_id) 
    VALUES (:type, :department, :title_of_activity, :participants, :location, :created_by_name, :feedback, :status, :role, :user_id)";
    
    $stmtMain = $pdo->prepare($sqlMain);
    $stmtMain->execute([
        ':type'              => $_POST['type'] ?? 'Program Design',
        ':department'        => $_POST['department'] ?? '',
        ':title_of_activity' => $_POST['title_of_activity'] ?? '',
        ':participants'      => $_POST['participants'] ?? 0,
        ':location'          => $_POST['location'] ?? '',
        ':created_by_name'   => $createdBy,
        ':feedback'          => $_POST['feedback'] ?? '',
        ':status'            => $_POST['status'] ?? 'pending',
        ':role'              => $role,
        ':user_id'           => $user_id
    ]);

    $reportId = $pdo->lastInsertId();

    // 2. Insert into pd_detail
    if (!empty($_POST['program'])) {
        $sqlDetail = "INSERT INTO pd_detail
        (report_id, program, milestones, duration, objectives, persons_involved, school_resources, community_resources, collaborating_agencies, budget, means_of_verification, remarks)
        VALUES
        (:report_id, :program, :milestones, :duration, :objectives, :persons_involved, :school_resources, :community_resources, :collaborating_agencies, :budget, :means_of_verification, :remarks)";
        
        $stmtDetail = $pdo->prepare($sqlDetail);

        foreach ($_POST['program'] as $i => $progName) {
            if (empty($progName) && empty($_POST['milestones'][$i])) continue;

            $stmtDetail->execute([
                ':report_id'             => $reportId,
                ':program'               => $progName,
                ':milestones'            => $_POST['milestones'][$i] ?? '',
                ':duration'              => $_POST['duration'][$i] ?? '',
                ':objectives'            => $_POST['objectives'][$i] ?? '',
                ':persons_involved'      => $_POST['persons_involved'][$i] ?? '',
                ':school_resources'      => $_POST['school_resources'][$i] ?? '',
                ':community_resources'   => $_POST['community_resources'][$i] ?? '',
                ':collaborating_agencies'=> $_POST['collaborating_agencies'][$i] ?? '',
                ':budget'                => $_POST['budget'][$i] ?? '',
                ':means_of_verification' => $_POST['means_of_verification'][$i] ?? '',
                ':remarks'               => $_POST['remarks'][$i] ?? ''
            ]);
        }
    }

    echo "Data successfully inserted! Report ID: $reportId";

} catch (\PDOException $e) {
    http_response_code(500);
    echo "Database error: " . $e->getMessage();
}
?>