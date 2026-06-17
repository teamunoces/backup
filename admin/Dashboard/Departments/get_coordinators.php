<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "";
$accountsDbName = "ces_database";

$department = trim($_GET['department'] ?? '');
$allowedDepartments = ["ELEMENTARY", "JHS", "SHS", "CBMA", "CBM", "CTHM", "CCIS", "CCJE", "CAS", "CTE", "CSF", "CCF", "LRC"];
$departmentAliases = [
    "ELEMENTARY" => ["ELEMENTARY", "ELEM"],
    "CBMA" => ["CBMA", "CBM"],
    "CBM" => ["CBMA", "CBM"],
    "CTHM" => ["CTHM"],
    "CSF" => ["CSF", "CCF"],
    "CCF" => ["CSF", "CCF"]
];

if ($department === '' || !in_array($department, $allowedDepartments, true)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid department selected.",
        "coordinators" => []
    ]);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$accountsDbName;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $departmentsToMatch = $departmentAliases[$department] ?? [$department];
    $placeholders = implode(',', array_fill(0, count($departmentsToMatch), '?'));

    $sql = "
        SELECT DISTINCT u.id, u.name
        FROM users u
        WHERE LOWER(u.role) = 'coordinator'
            AND u.is_active = 1
            AND u.department IN ($placeholders)
        ORDER BY name ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($departmentsToMatch);
    $coordinators = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "coordinators" => $coordinators
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch coordinators.",
        "coordinators" => []
    ]);
}
?>
