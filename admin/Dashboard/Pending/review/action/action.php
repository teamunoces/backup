<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_database");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No JSON received"]);
    exit;
}

$id = (int)($data["id"] ?? 0);
$status = strtolower(trim($data["status"] ?? ""));
$feedback = trim($data["feedback"] ?? "");
$type = normalizeReportType($data["type"] ?? "");

$allowedStatuses = ['rejected', 'need fix', 'approve'];
if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid report ID"]);
    exit;
}

if (!in_array($status, $allowedStatuses, true)) {
    echo json_encode(["success" => false, "message" => "Invalid status"]);
    exit;
}

if ($status !== 'approve' && $feedback === '') {
    echo json_encode(["success" => false, "message" => "Feedback is required for reject and need-fix actions"]);
    exit;
}

$tables = [
    "community needs assessment consolidated report" => "report_coordinator_cnacr",
    "community needs assessment report" => "report_coordinator_cnacr",
    "3-year development plan" => "report_3ydp",
    "3 year development plan" => "report_3ydp",
    "program design" => "report_pd_main",
    "monthly accomplishment report" => "report_mar_header",
    "program monitoring form" => "report_program_monitoring_form",
    "evaluation sheet for extension services" => "report_evaluation",
    "certificate of appearance" => "report_cert_appearance",
    "monthly accomplishment report- reflection paper" => "report_reflection_paper",
    "monthly accomplishment report - reflection paper" => "report_reflection_paper",
    "monthly accomplishment report- narrative report" => "report_narrative",
    "monthly accomplishment report - narrative report" => "report_narrative"
];

if (!isset($tables[$type])) {
    echo json_encode(["success" => false, "message" => "Unsupported or unknown report type"]);
    exit;
}

$table = $tables[$type];

if (!tableHasColumn($conn, $table, 'feedback') || !tableHasColumn($conn, $table, 'status')) {
    echo json_encode(["success" => false, "message" => "Report table is missing required columns"]);
    exit;
}

$escapedTable = '`' . str_replace('`', '``', $table) . '`';
$stmt = $conn->prepare("UPDATE $escapedTable SET `status` = ?, `feedback` = ? WHERE `id` = ?");

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Failed to prepare update"]);
    exit;
}

$stmt->bind_param("ssi", $status, $feedback, $id);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => $stmt->error]);
    exit;
}

if ($stmt->affected_rows < 1) {
    echo json_encode(["success" => false, "message" => "No matching report was updated"]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Updated successfully",
    "table" => $table,
    "status" => $status
]);

$stmt->close();
$conn->close();

function normalizeReportType(string $type): string
{
    return strtolower(trim(preg_replace('/\s+/', ' ', $type)));
}

function tableHasColumn(mysqli $conn, string $table, string $column): bool
{
    $escapedTable = '`' . str_replace('`', '``', $table) . '`';
    $escapedColumn = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM $escapedTable LIKE '$escapedColumn'");
    if (!$result) {
        return false;
    }

    $hasColumn = $result->num_rows > 0;
    $result->free();

    return $hasColumn;
}
?>
