<?php
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

$conn = new mysqli("localhost", "root", "", "ces_reports_db");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["error" => "No ID provided"]);
    exit;
}

/* ===============================
   FETCH MAIN CNACR REPORT
================================ */

$stmt = $conn->prepare("SELECT * FROM cnacr WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$reportData = $result->fetch_assoc();

if (!$reportData) {
    echo json_encode(["error" => "Report not found"]);
    exit;
}

/* ===============================
   FETCH DEMOGRAPHIC TOTALS
================================ */

$barangay = $reportData['barangay'] ?? null;
$demoData = null;

if ($barangay) {

    // sanitize table name
    $barangay = preg_replace("/[^a-zA-Z0-9_]/", "", $barangay);

    $demoQuery = "
        SELECT population, households 
        FROM demographic_totals.$barangay 
        ORDER BY created_at DESC 
        LIMIT 1
    ";

    $demoResult = $conn->query($demoQuery);

    if ($demoResult && $demoResult->num_rows > 0) {
        $demoData = $demoResult->fetch_assoc();
    }
}

/* ===============================
   MERGE DATA
================================ */

$reportData['demographic_totals'] = $demoData;

/* ===============================
   RETURN JSON
================================ */

echo json_encode($reportData, JSON_UNESCAPED_UNICODE);
exit;
?>