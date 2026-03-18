<?php
error_reporting(0);
header('Content-Type: application/json');

// ---------------- CONFIG ----------------
$databases = [
    'survey' => [
        'servername' => 'localhost',
        'username' => 'root',
        'password' => '',
        'dbname'   => 'questionnaire'
    ],
    'demo' => [
        'servername' => 'localhost',
        'username' => 'root',
        'password' => '',
        'dbname'   => 'demographic_totals'
    ],
    'pending' => [
        'servername' => 'localhost',
        'username' => 'root',
        'password' => '',
        'dbname'   => 'ces_reports_db'
    ]
];

// ---------------- GET ACTION ----------------
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'survey':
        $conn = new mysqli(...array_values($databases['survey']));
        if ($conn->connect_error) {
            echo json_encode(['error' => 'SurveyDB connection failed']);
            exit;
        }

        $barangayTables = ["aclan","amontay","ataatahon","barangay1","barangay2","barangay3","barangay4","barangay5","barangay6","barangay7","camagong","cubicubi","culit","jaguimitan","kinajabangan","punta","santaana","talisay","triangulo"];
        $data = [];
        foreach ($barangayTables as $table) {
            $result = $conn->query("SELECT COUNT(*) AS respondents FROM `$table`");
            $row = $result->fetch_assoc();
            $data[] = [
                'name' => strtoupper($table),
                'respondents' => (int)$row['respondents']
            ];
        }
        $conn->close();
        echo json_encode($data);
        break;

    case 'demographics':
        $conn = new mysqli(...array_values($databases['demo']));
        if ($conn->connect_error) {
            echo json_encode(['error' => 'Demographics DB connection failed']);
            exit;
        }

        $barangayTables = ["aclan","amontay","ataatahon","barangay1","barangay2","barangay3","barangay4","barangay5","barangay6","barangay7","camagong","cubicubi","culit","jaguimitan","kinajabangan","punta","santaana","talisay","triangulo"];
        $data = [];
        foreach ($barangayTables as $table) {
            $result = $conn->query("SELECT SUM(population) AS total_population, SUM(households) AS total_households FROM `$table`");
            $row = $result->fetch_assoc();
            $data[] = [
                'name' => strtoupper($table),
                'population' => (int)($row['total_population'] ?? 0),
                'households' => (int)($row['total_households'] ?? 0)
            ];
        }
        $conn->close();
        echo json_encode($data);
        break;

       case 'pending':
        $conn = new mysqli(...array_values($databases['pending']));
        if ($conn->connect_error) {
            echo json_encode(['error' => 'Pending DB connection failed']);
            exit;
        }

        $tablesResult = $conn->query("SHOW TABLES");
        $totalCount = 0;

        while ($row = $tablesResult->fetch_array()) {
            $tableName = $row[0];

            // Check if the table has both 'status' and 'role' columns
            $statusCheck = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'status'");
            $roleCheck = $conn->query("SHOW COLUMNS FROM `$tableName` LIKE 'role'");
            
            // If both columns exist, count with role = 'coordinator'
            if ($statusCheck && $statusCheck->num_rows > 0 && $roleCheck && $roleCheck->num_rows > 0) {
                $countResult = $conn->query("
                    SELECT COUNT(*) as count 
                    FROM `$tableName` 
                    WHERE status IN ('pending', 'need fix')
                    AND role = 'coordinator'
                ");
                if ($countResult) {
                    $countRow = $countResult->fetch_assoc();
                    $totalCount += $countRow['count'];
                }
            } 
        }

        echo json_encode(['count' => $totalCount]);
        break;

    default:
        echo json_encode(['error' => 'No valid action specified']);
        break;
}
?>