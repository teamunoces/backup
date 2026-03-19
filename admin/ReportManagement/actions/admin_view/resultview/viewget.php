<?php
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "", "ces_reports_db");

$id = $_GET['id'] ?? 0;

// DEBUG: Check if ID even exists in the table
$check = $conn->query("SELECT id FROM cnacr WHERE id = '$id'");
if ($check->num_rows === 0) {
    echo json_encode(["error" => "ID $id does not exist in the cnacr table."]);
    exit;
}

$sql = "SELECT * FROM cnacr WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id); // "s" handles both numbers and strings
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

echo json_encode($result);
?>