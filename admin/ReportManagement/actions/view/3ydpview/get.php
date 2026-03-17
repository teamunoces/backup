<?php
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_reports_db");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$id = $_GET['id'] ?? 0;

if(!$id){
    echo json_encode(["error"=>"No ID provided"]);
    exit;
}

/* ---------------------------
   1. GET MAIN 3YDP DATA
----------------------------*/
$stmt = $conn->prepare("SELECT * FROM 3ydp WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$project = $stmt->get_result()->fetch_assoc();

if(!$project){
    echo json_encode(["error"=>"Report not found"]);
    exit;
}

/* ---------------------------
   2. GET PROGRAM PLAN TABLE
----------------------------*/
$stmt2 = $conn->prepare("SELECT * FROM 3ydp_programs WHERE report_id = ?");
$stmt2->bind_param("i", $id);
$stmt2->execute();
$result2 = $stmt2->get_result();

$programs = [];

while($row = $result2->fetch_assoc()){
    $programs[] = $row;
}

/* ---------------------------
   3. RETURN COMBINED DATA
----------------------------*/
echo json_encode([
    "project" => $project,
    "programs" => $programs
]);

$conn->close();
?>s