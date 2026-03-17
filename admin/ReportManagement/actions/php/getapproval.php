<?php
/* ==========================================
   JSON-SAFE APPROVAL.PHP (with auto-insert)
========================================== */

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

/* ==========================================
   DATABASE CONFIG
========================================== */
$host = 'localhost';
$dbname = 'approval_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
    exit;
}

/* ==========================================
   HELPER FUNCTION TO FETCH SINGLE ROW
========================================== */
function fetchRow($pdo, $sql) {
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch();
    return $row ? $row : [];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {

        // ---------- LATEST APPROVALS ----------
        $approvals = fetchRow($pdo, "
            SELECT 
                ces_head,
                ces_head_suffix,
                vp_acad,
                vp_acad_suffix,
                vp_admin,
                vp_admin_suffix,
                school_president,
                school_president_suffix
            FROM approvals
            ORDER BY updated_at DESC
            LIMIT 1
        ");

        // ---------- LATEST DOCUMENT INFO ----------
        $documentInfo = fetchRow($pdo, "
            SELECT
                issue_status,
                revision_number,
                date_effective,
                approved_by
            FROM document_info
            ORDER BY updated_at DESC
            LIMIT 1
        ");

        $result = array_merge(
            $approvals ?? [],
            $documentInfo ?? []
        );

        echo json_encode($result);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch data',
            'error' => $e->getMessage()
        ]);
    }
    exit;
}
