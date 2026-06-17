<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

$reportsDb = new mysqli("localhost", "root", "", "ces_database");
$accountsDb = new mysqli("localhost", "root", "", "ces_database");

$department = trim($_GET['department'] ?? '');
$coordinatorId = trim($_GET['coordinator_id'] ?? '');

$allowedDepartments = ["ELEMENTARY", "JHS", "SHS", "CBMA", "CBM", "CTHM", "CCIS", "CCJE", "CAS", "CTE", "CSF", "CCF", "LRC"];
$departmentAliases = [
    "ELEMENTARY" => ["ELEMENTARY", "ELEM"],
    "CBMA" => ["CBMA", "CBM"],
    "CBM" => ["CBMA", "CBM"],
    "CTHM" => ["CTHM"],
    "CSF" => ["CSF", "CCF"],
    "CCF" => ["CSF", "CCF"]
];

function sendPlanResponse($payload, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

if ($reportsDb->connect_error || $accountsDb->connect_error) {
    sendPlanResponse([
        "success" => false,
        "message" => "Database connection failed.",
        "plans" => []
    ], 500);
}

$reportsDb->set_charset("utf8mb4");
$accountsDb->set_charset("utf8mb4");

if ($department === '' || !in_array($department, $allowedDepartments, true) || $coordinatorId === '' || !ctype_digit($coordinatorId)) {
    sendPlanResponse([
        "success" => false,
        "message" => "Invalid department or coordinator selected.",
        "plans" => []
    ], 400);
}

try {
    $coordinatorStmt = $accountsDb->prepare("
        SELECT id, name, department
        FROM users
        WHERE id = ?
            AND LOWER(role) = 'coordinator'
            AND is_active = 1
        LIMIT 1
    ");

    if (!$coordinatorStmt) {
        throw new Exception("Failed to prepare coordinator query.");
    }

    $coordinatorIdInt = (int) $coordinatorId;
    $coordinatorStmt->bind_param("i", $coordinatorIdInt);
    $coordinatorStmt->execute();
    $coordinator = $coordinatorStmt->get_result()->fetch_assoc();
    $coordinatorStmt->close();

    if (!$coordinator) {
        sendPlanResponse([
            "success" => false,
            "message" => "Coordinator was not found or is inactive.",
            "plans" => []
        ], 404);
    }

    $tableCheck = $reportsDb->query("SHOW TABLES LIKE 'report_3ydp'");
    $programTableCheck = $reportsDb->query("SHOW TABLES LIKE 'report_3ydp_programs'");

    if (!$tableCheck || $tableCheck->num_rows === 0 || !$programTableCheck || $programTableCheck->num_rows === 0) {
        sendPlanResponse([
            "success" => true,
            "plans" => []
        ]);
    }

    $hasUserId = $reportsDb->query("SHOW COLUMNS FROM `report_3ydp` LIKE 'user_id'")->num_rows > 0;
    $hasProgress = $reportsDb->query("SHOW COLUMNS FROM `report_3ydp_programs` LIKE 'progress'")->num_rows > 0;

    $departmentsToMatch = $departmentAliases[$department] ?? [$department];
    $departmentPlaceholders = implode(",", array_fill(0, count($departmentsToMatch), "?"));
    $where = [
        "LOWER(p.status) IN ('approve', 'approved')",
        "p.department IN ($departmentPlaceholders)"
    ];
    $types = str_repeat("s", count($departmentsToMatch));
    $params = $departmentsToMatch;

    if ($hasUserId) {
        $where[] = "(p.user_id = ? OR p.created_by_name = ?)";
        $types .= "is";
        $params[] = $coordinatorIdInt;
        $params[] = $coordinator['name'];
    } else {
        $where[] = "p.created_by_name = ?";
        $types .= "s";
        $params[] = $coordinator['name'];
    }

    $whereSql = "WHERE " . implode(" AND ", $where);
    $query = "
        SELECT
            p.id AS plan_id,
            p.title_of_project AS plan_title,
            p.department,
            p.status,
            p.created_at
        FROM `report_3ydp` p
        $whereSql
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 1
    ";

    $stmt = $reportsDb->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare development plan query.");
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    $plan = $result->fetch_assoc();
    $stmt->close();

    if (!$plan) {
        sendPlanResponse([
            "success" => true,
            "plans" => []
        ]);
    }

    $progressColumn = $hasProgress ? "progress" : "NULL AS progress";
    $programStmt = $reportsDb->prepare("
        SELECT
            id,
            report_id,
            program,
            objectives,
            $progressColumn,
            program_status
        FROM `report_3ydp_programs`
        WHERE report_id = ?
        ORDER BY id ASC
        LIMIT 3
    ");

    if (!$programStmt) {
        throw new Exception("Failed to prepare development plan programs query.");
    }

    $planId = (int) $plan['plan_id'];
    $programStmt->bind_param("i", $planId);
    $programStmt->execute();
    $programResult = $programStmt->get_result();
    $programs = [];

    while ($programRow = $programResult->fetch_assoc()) {
        $programs[] = [
            "id" => $programRow['id'],
            "program" => $programRow['program'] ?: "Untitled Program",
            "objectives" => $programRow['objectives'] ?: "No objective provided.",
            "progress" => $programRow['progress'] ?: ($programRow['program_status'] ?: "Not Started"),
            "program_status" => $programRow['program_status'] ?: null
        ];
    }

    $programStmt->close();
    $reportsDb->close();
    $accountsDb->close();

    sendPlanResponse([
        "success" => true,
        "plans" => [[
            "id" => $plan['plan_id'],
            "title" => $plan['plan_title'] ?: "Untitled 3-Year Development Plan",
            "department" => $plan['department'] ?: "N/A",
            "status" => $plan['status'] ?: "N/A",
            "created_at" => $plan['created_at'],
            "coordinator" => $coordinator['name'],
            "programs" => $programs
        ]]
    ]);
} catch (Exception $e) {
    sendPlanResponse([
        "success" => false,
        "message" => $e->getMessage(),
        "plans" => []
    ], 500);
}
?>
