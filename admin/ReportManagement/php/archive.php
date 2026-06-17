<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_database";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data) || empty($data['id']) || empty($data['table'])) {
    echo json_encode(["success" => false, "error" => "Missing required parameters"]);
    exit;
}

$id = (int) $data['id'];
$requestedTable = preg_replace('/[^a-zA-Z0-9_]/', '', $data['table']);

$tableAliases = [
    '3ydp' => 'report_3ydp',
    'cert_appearance' => 'report_cert_appearance',
    'cnacr' => 'report_cnacr',
    'coordinator_cnacr' => 'report_coordinator_cnacr',
    'mar_header' => 'report_mar_header',
    'narrative_report' => 'report_narrative',
    'program_monitoring_form' => 'report_program_monitoring_form',
    'reflection_paper' => 'report_reflection_paper',
    'evaluation_reports' => 'report_evaluation',
    'pd_main' => 'report_pd_main'
];

$allowedTables = [
    'report_3ydp',
    'report_cert_appearance',
    'report_cnacr',
    'report_coordinator_cnacr',
    'report_mar_header',
    'report_narrative',
    'report_program_monitoring_form',
    'report_reflection_paper',
    'report_evaluation',
    'report_pd_main'
];

$table = $tableAliases[$requestedTable] ?? $requestedTable;

if (!in_array($table, $allowedTables, true)) {
    echo json_encode(["success" => false, "error" => "Invalid report table"]);
    exit;
}

$checkTable = $conn->query("SHOW TABLES LIKE '$table'");
if (!$checkTable || $checkTable->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Table not found"]);
    exit;
}

$checkArchived = $conn->query("SHOW COLUMNS FROM `$table` LIKE 'archived'");
if (!$checkArchived || $checkArchived->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Archived column not found"]);
    exit;
}

$stmt = $conn->prepare("UPDATE `$table` SET archived = 'archived' WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Report not found or already archived"]);
}

$stmt->close();
$conn->close();
?>
