<?php
/* ==========================================
   JSON-SAFE APPROVAL.PHP (with auto-insert)
========================================== */

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/* ==========================================
   DATABASE CONFIG
========================================== */
$host = 'localhost';
$dbname = 'ces_database';
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

        // ---------- LATEST APPROVAL SETTINGS ----------
        $result = fetchRow($pdo, "
            SELECT 
                ces_head,
                ces_head_suffix,
                vp_acad,
                vp_acad_suffix,
                vp_admin,
                vp_admin_suffix,
                school_president,
                school_president_suffix
            FROM approvals_admin
            ORDER BY updated_at DESC
            LIMIT 1
        ");

        $result = array_merge([
            'ces_head' => '',
            'ces_head_suffix' => '',
            'vp_acad' => '',
            'vp_acad_suffix' => '',
            'vp_admin' => '',
            'vp_admin_suffix' => '',
            'school_president' => '',
            'school_president_suffix' => ''
        ], $result);

        // ---------- LATEST DOCUMENT INFO ----------
        $documentInfo = fetchRow($pdo, "
            SELECT
                issue_status,
                revision_number,
                date_effective,
                approved_by
            FROM approvals_document_info
            ORDER BY updated_at DESC
            LIMIT 1
        ");

        $result = array_merge($result, [
            'issue_status' => '',
            'revision_number' => '',
            'date_effective' => '',
            'approved_by' => ''
        ], $documentInfo);

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

/* ==========================================
   HANDLE POST REQUEST (SAVE DATA)
========================================== */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON data'
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    /* ---------- APPROVALS ADMIN TABLE ---------- */
    $stmt = $pdo->prepare("
        INSERT INTO approvals_admin (
            id,
            ces_head, ces_head_suffix,
            vp_acad, vp_acad_suffix,
            vp_admin, vp_admin_suffix,
            school_president, school_president_suffix
        )
        VALUES (
            1,
            :ces_head, :ces_head_suffix,
            :vp_acad, :vp_acad_suffix,
            :vp_admin, :vp_admin_suffix,
            :school_president, :school_president_suffix
        )
        ON DUPLICATE KEY UPDATE
            ces_head = VALUES(ces_head),
            ces_head_suffix = VALUES(ces_head_suffix),
            vp_acad = VALUES(vp_acad),
            vp_acad_suffix = VALUES(vp_acad_suffix),
            vp_admin = VALUES(vp_admin),
            vp_admin_suffix = VALUES(vp_admin_suffix),
            school_president = VALUES(school_president),
            school_president_suffix = VALUES(school_president_suffix)
    ");

    $stmt->execute([
        ':ces_head'               => $data['ces_head'] ?? '',
        ':ces_head_suffix'        => $data['ces_head_suffix'] ?? '',
        ':vp_acad'                => $data['vp_acad'] ?? '',
        ':vp_acad_suffix'         => $data['vp_acad_suffix'] ?? '',
        ':vp_admin'               => $data['vp_admin'] ?? '',
        ':vp_admin_suffix'        => $data['vp_admin_suffix'] ?? '',
        ':school_president'       => $data['school_president'] ?? '',
        ':school_president_suffix'=> $data['school_president_suffix'] ?? ''
    ]);

    /* ---------- APPROVALS DOCUMENT INFO TABLE ---------- */
    $stmt = $pdo->prepare("
        INSERT INTO approvals_document_info (
            id,
            issue_status,
            revision_number,
            date_effective,
            approved_by
        )
        VALUES (
            1,
            :issue_status,
            :revision_number,
            :date_effective,
            :approved_by
        )
        ON DUPLICATE KEY UPDATE
            issue_status = VALUES(issue_status),
            revision_number = VALUES(revision_number),
            date_effective = VALUES(date_effective),
            approved_by = VALUES(approved_by)
    ");

    $stmt->execute([
        ':issue_status'    => $data['issue_status'] ?? '',
        ':revision_number' => $data['revision_number'] ?? '',
        ':date_effective'  => $data['date_effective'] ?? '',
        ':approved_by'     => $data['approved_by'] ?? ''
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Approval form saved successfully'
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Save failed',
        'error'   => $e->getMessage()
    ]);
}
