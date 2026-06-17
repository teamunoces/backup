<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "ces_database");

$id = $_GET['id'] ?? 0;

// DEBUG: Check if ID even exists in the table
$check = $conn->prepare("SELECT id FROM report_cnacr WHERE id = ?");
$check->bind_param("s", $id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    echo json_encode(["error" => "ID $id does not exist in the report_cnacr table."]);
    exit;
}

$sql = "SELECT * FROM report_cnacr WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id); // "s" handles both numbers and strings
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

echo json_encode($result);
?>
