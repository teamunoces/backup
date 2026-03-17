<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "demographic_totals");

if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"DB connection failed"]);
    exit;
}

/* ===== LIST OF ALLOWED BARANGAY TABLES ===== */
$allowedTables = [
    "aclan","amontay","ataatahon",
    "barangay1","barangay2","barangay3","barangay4","barangay5","barangay6","barangay7",
    "camagong","cubicubi","culit","jaguimitan","kinajabangan",
    "punta","santaana","talisay","triangulo"
];

$action = $_GET['action'] ?? "";


/* =========================================================
   SAVE DATA (INSERT OR UPDATE)
========================================================= */
if ($action === "save") {

    $data = json_decode(file_get_contents("php://input"), true);

    $barangay   = strtolower($data['barangay']);
    $population = (int)$data['population'];
    $households = (int)$data['households'];

    if (!in_array($barangay, $allowedTables)) {
        echo json_encode(["status"=>"error","message"=>"Invalid barangay"]);
        exit;
    }

    // create table if not exist
    $conn->query("
        CREATE TABLE IF NOT EXISTS $barangay (
            id INT PRIMARY KEY AUTO_INCREMENT,
            population INT,
            households INT
        )
    ");

    // delete old data then insert new (1 row per barangay)
    $conn->query("DELETE FROM $barangay");

    $sql = "INSERT INTO $barangay (population, households)
            VALUES ($population, $households)";

    if ($conn->query($sql)) {
        echo json_encode(["status"=>"success"]);
    } else {
        echo json_encode(["status"=>"error","message"=>$conn->error]);
    }
}


/* =========================================================
   GET ALL BARANGAY DATA
========================================================= */
elseif ($action === "get") {

    $allData = [];

    foreach ($allowedTables as $table) {

        $check = $conn->query("SHOW TABLES LIKE '$table'");
        if ($check->num_rows == 0) continue;

        $result = $conn->query("SELECT * FROM $table LIMIT 1");

        if ($row = $result->fetch_assoc()) {
            $allData[] = [
                "barangay" => strtoupper($table),
                "population" => $row['population'],
                "households" => $row['households']
            ];
        }
    }

    echo json_encode($allData);
}


/* =========================================================
   DELETE DATA (CLEAR TABLE)
========================================================= */
elseif ($action === "delete") {

    $data = json_decode(file_get_contents("php://input"), true);
    $barangay = strtolower($data['barangay']);

    if (!in_array($barangay, $allowedTables)) {
        echo json_encode(["status"=>"error"]);
        exit;
    }

    $conn->query("DELETE FROM $barangay");
    echo json_encode(["status"=>"success"]);
}

$conn->close();
?>