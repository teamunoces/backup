<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "ces_database");

if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"DB connection failed"]);
    exit;
}

/* ===== LIST OF ALLOWED BARANGAY TABLES ===== */
$allowedTables = [
    "aclan" => "demograph_aclan",
    "amontay" => "demograph_amontay",
    "ataatahon" => "demograph_ataatahon",
    "barangay1" => "demograph_barangay1",
    "barangay2" => "demograph_barangay2",
    "barangay3" => "demograph_barangay3",
    "barangay4" => "demograph_barangay4",
    "barangay5" => "demograph_barangay5",
    "barangay6" => "demograph_barangay6",
    "barangay7" => "demograph_barangay7",
    "camagong" => "demograph_camagong",
    "cubicubi" => "demograph_cubicubi",
    "culit" => "demograph_culit",
    "jaguimitan" => "demograph_jaguimitan",
    "kinajabangan" => "demograph_kinajabangan",
    "punta" => "demograph_punta",
    "santaana" => "demograph_santaana",
    "talisay" => "demograph_talisay",
    "triangulo" => "demograph_triangulo"
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

    if (!isset($allowedTables[$barangay])) {
        echo json_encode(["status"=>"error","message"=>"Invalid barangay"]);
        exit;
    }

    $table = $allowedTables[$barangay];
    $escapedTable = "`" . str_replace("`", "``", $table) . "`";

    // create table if not exist
    $conn->query("
        CREATE TABLE IF NOT EXISTS $escapedTable (
            id INT PRIMARY KEY AUTO_INCREMENT,
            population INT,
            households INT
        )
    ");

    // delete old data then insert new (1 row per barangay)
    $conn->query("DELETE FROM $escapedTable");

    $stmt = $conn->prepare("INSERT INTO $escapedTable (population, households) VALUES (?, ?)");
    $stmt->bind_param("ii", $population, $households);

    if ($stmt->execute()) {
        echo json_encode(["status"=>"success"]);
    } else {
        echo json_encode(["status"=>"error","message"=>$stmt->error]);
    }
    $stmt->close();
}


/* =========================================================
   GET ALL BARANGAY DATA
========================================================= */
elseif ($action === "get") {

    $allData = [];

    foreach ($allowedTables as $barangay => $table) {
        $escapedTable = "`" . str_replace("`", "``", $table) . "`";
        $tableLike = $conn->real_escape_string($table);

        $check = $conn->query("SHOW TABLES LIKE '$tableLike'");
        if ($check->num_rows == 0) continue;

        $result = $conn->query("SELECT * FROM $escapedTable LIMIT 1");

        if ($row = $result->fetch_assoc()) {
            $allData[] = [
                "barangay" => $barangay,
                "barangay_label" => strtoupper($barangay),
                "barangay_key" => $barangay,
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

    if (!isset($allowedTables[$barangay])) {
        echo json_encode(["status"=>"error"]);
        exit;
    }

    $table = $allowedTables[$barangay];
    $escapedTable = "`" . str_replace("`", "``", $table) . "`";

    $conn->query("DELETE FROM $escapedTable");
    echo json_encode(["status"=>"success"]);
}

$conn->close();
?>
