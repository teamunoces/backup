<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');

$servername = "localhost";
$username = "root"; 
$password = ""; 
$dbname = "ces_reports_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit;
}

// ===== Accept both 'id' and 'report_id' parameters =====
$rid = 0;
if (isset($_GET['id'])) {
    $rid = intval($_GET['id']);
} elseif (isset($_GET['report_id'])) {
    $rid = intval($_GET['report_id']);
}

if ($rid <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid ID"]);
    exit;
}

try {
    // ===== Fetch main report data =====
    $main_sql = "SELECT * FROM pd_main WHERE id = ?";
    $stmt = $conn->prepare($main_sql);
    $stmt->bind_param("i", $rid);
    $stmt->execute();
    $main_result = $stmt->get_result()->fetch_assoc();
    if (!$main_result) $main_result = null;

    // ===== Fetch related rows =====
    $details_sql = "SELECT * FROM pd_detail WHERE report_id = ?";
    $stmt_details = $conn->prepare($details_sql);
    $stmt_details->bind_param("i", $rid);
    $stmt_details->execute();
    $details_result = $stmt_details->get_result();

    $details = [];
    while ($row = $details_result->fetch_assoc()) {
        $details[] = $row;
    }

    echo json_encode([
        "success" => true,
        "main" => $main_result,
        "details" => $details
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>