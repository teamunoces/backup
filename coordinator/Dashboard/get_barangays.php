<?php
error_reporting(0);
header('Content-Type: application/json');

// ---------------- CONFIG ----------------
$databases = [
    'survey' => [
        'servername' => 'localhost',
        'username' => 'root',
        'password' => '',
        'dbname'   => 'ces_database'
    ],
    'demo' => [
        'servername' => 'localhost',
        'username' => 'root',
        'password' => '',
        'dbname'   => 'ces_database'
    ],
    'pending' => [
        'servername' => 'localhost',
        'username' => 'root',
        'password' => '',
        'dbname'   => 'ces_database'
    ]
];

$surveyTables = [
    'aclan' => 'survey_aclan',
    'amontay' => 'survey_amontay',
    'ataatahon' => 'survey_ataatahon',
    'barangay1' => 'survey_barangay1',
    'barangay2' => 'survey_barangay2',
    'barangay3' => 'survey_barangay3',
    'barangay4' => 'survey_barangay4',
    'barangay5' => 'survey_barangay5',
    'barangay6' => 'survey_barangay6',
    'barangay7' => 'survey_barangay7',
    'camagong' => 'survey_camagong',
    'cubicubi' => 'survey_cubicubi',
    'culit' => 'survey_culit',
    'jaguimitan' => 'survey_jaguimitan',
    'kinajabangan' => 'survey_kinajabangan',
    'punta' => 'survey_punta',
    'santaana' => 'survey_santaana',
    'talisay' => 'survey_talisay',
    'triangulo' => 'survey_triangulo'
];

$demographicTables = [
    'aclan' => 'demograph_aclan',
    'amontay' => 'demograph_amontay',
    'ataatahon' => 'demograph_ataatahon',
    'barangay1' => 'demograph_barangay1',
    'barangay2' => 'demograph_barangay2',
    'barangay3' => 'demograph_barangay3',
    'barangay4' => 'demograph_barangay4',
    'barangay5' => 'demograph_barangay5',
    'barangay6' => 'demograph_barangay6',
    'barangay7' => 'demograph_barangay7',
    'camagong' => 'demograph_camagong',
    'cubicubi' => 'demograph_cubicubi',
    'culit' => 'demograph_culit',
    'jaguimitan' => 'demograph_jaguimitan',
    'kinajabangan' => 'demograph_kinajabangan',
    'punta' => 'demograph_punta',
    'santaana' => 'demograph_santaana',
    'talisay' => 'demograph_talisay',
    'triangulo' => 'demograph_triangulo'
];

$pendingTables = [
    'report_3ydp',
    'report_3ydp_programs',
    'report_cert_appearance',
    'report_cnacr',
    'report_coordinator_cnacr',
    'report_evaluation',
    'report_mar_header',
    'report_mar_table',
    'report_narrative',
    'report_pd_detail',
    'report_pd_main',
    'report_program_monitoring_form',
    'report_reflection_paper'
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

        $data = [];
        foreach ($surveyTables as $barangay => $table) {
            $respondents = 0;
            if (tableExists($conn, $table)) {
                $escapedTable = escapeIdentifier($table);
                $result = $conn->query("SELECT COUNT(*) AS respondents FROM $escapedTable");
                $row = $result ? $result->fetch_assoc() : null;
                $respondents = (int)($row['respondents'] ?? 0);
            }
            $data[] = [
                'name' => strtoupper($barangay),
                'respondents' => $respondents
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

        $data = [];
        foreach ($demographicTables as $barangay => $table) {
            $row = ['total_population' => 0, 'total_households' => 0];
            if (tableExists($conn, $table)) {
                $escapedTable = escapeIdentifier($table);
                $result = $conn->query("SELECT SUM(population) AS total_population, SUM(households) AS total_households FROM $escapedTable");
                $row = $result ? $result->fetch_assoc() : $row;
            }
            $data[] = [
                'name' => strtoupper($barangay),
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

        $totalCount = 0;

        foreach ($pendingTables as $tableName) {
            if (tableExists($conn, $tableName) && tableHasColumn($conn, $tableName, 'status')) {
                $escapedTable = escapeIdentifier($tableName);
                $countResult = $conn->query("
                    SELECT COUNT(*) as count 
                    FROM $escapedTable
                    WHERE status IN ('pending', 'need fix')
                    AND status <> 'draft'
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

function escapeIdentifier(string $identifier): string {
    return '`' . str_replace('`', '``', $identifier) . '`';
}

function tableExists(mysqli $conn, string $table): bool {
    $escapedTable = $conn->real_escape_string($table);
    $result = $conn->query("SHOW TABLES LIKE '$escapedTable'");
    return $result && $result->num_rows > 0;
}

function tableHasColumn(mysqli $conn, string $table, string $column): bool {
    $escapedTable = escapeIdentifier($table);
    $escapedColumn = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM $escapedTable LIKE '$escapedColumn'");
    return $result && $result->num_rows > 0;
}
?>
