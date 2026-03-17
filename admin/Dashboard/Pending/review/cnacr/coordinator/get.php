<?php
session_start();
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "";
$db = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["success"=>false,"error"=>$conn->connect_error]);
    exit;
}

$department = $_SESSION['department'] ?? '';

$sql = "SELECT * FROM coordinator_cnacr WHERE department = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $department);
$stmt->execute();

$result = $stmt->get_result();

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode([
    "success"=>true,
    "data"=>$data
]);
?>