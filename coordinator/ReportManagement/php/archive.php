<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "ces_reports_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success"=>false]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$table = $data['table'];

$stmt = $conn->prepare("UPDATE `$table` SET archived = 'archived' WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success"=>true]);
} else {
    echo json_encode(["success"=>false]);
}

$stmt->close();
$conn->close();
?>