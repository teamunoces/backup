<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "ces_reports_db");

if ($conn->connect_error) {
    echo json_encode(["success"=>false,"message"=>"DB connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success"=>false,"message"=>"No JSON received"]);
    exit;
}

$id = intval($data["id"]);
$status = $data["status"];
$feedback = $data["feedback"];
$type = strtolower($data["type"] ?? "");

/* -----------------------------
   VALIDATE STATUS
------------------------------*/

$allowed = ['rejected','need fix','approve'];
if (!in_array($status, $allowed)) {
    echo json_encode(["success"=>false,"message"=>"Invalid status"]);
    exit;
}

/* -----------------------------
   DETERMINE TABLE
------------------------------*/

switch($type){

    case "community needs assessment consolidated report":
        $table = "coordinator_cnacr";
        break;

    case "3-year development plan":
        $table = "3ydp";
        break;

    case "program design":
        $table = "pd_main";
        break;
    case "departmental planned initiative report":
        $table = "dpir";
        break;
        
    case "monthly accomplishment report":
        $table = "mar_header";
        break;

   

    default:
        echo json_encode(["success"=>false,"message"=>"Unknown report type"]);
        exit;
}

/* -----------------------------
   UPDATE REPORT
------------------------------*/

$stmt = $conn->prepare("UPDATE $table SET status=?, feedback=? WHERE id=?");
$stmt->bind_param("ssi", $status, $feedback, $id);

if ($stmt->execute()) {
    echo json_encode([
        "success"=>true,
        "message"=>"Updated successfully",
        "table"=>$table
    ]);
} else {
    echo json_encode([
        "success"=>false,
        "message"=>$stmt->error
    ]);
}

$conn->close();
?>