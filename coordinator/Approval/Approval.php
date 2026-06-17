<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/* ==========================================
   DATABASE CONFIG
========================================== */

$host = "localhost";
$user = "root";
$pass = "";

try {

    // CES database
    $pdo = new PDO(
        "mysql:host=$host;dbname=ces_database;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed",
        "error" => $e->getMessage()
    ]);
    exit;
}

/* ==========================================
   HELPER FUNCTION
========================================== */

function fetchRow($pdo, $sql) {

    $stmt = $pdo->query($sql);
    $row = $stmt->fetch();

    return $row ? $row : [];
}

function fetchPreparedRow($pdo, $sql, $params) {

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();

    return $row ? $row : [];
}

/* ==========================================
   GET REQUEST
========================================== */

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    try {

        $department = trim($_SESSION["department"] ?? "");

        if ($department === "") {
            throw new Exception("Cannot load approval data because no department was found in the session.");
        }

        /* ---------- GET DEAN FROM ces_database.users ---------- */

        $dean = "";

        if (isset($_SESSION['user_id'])) {

            $accountsPDO = new PDO(
                "mysql:host=$host;dbname=ces_database;charset=utf8mb4",
                $user,
                $pass,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]
            );

            $stmt = $accountsPDO->prepare("
                SELECT dean 
                FROM users 
                WHERE id = :id
                LIMIT 1
            ");

            $stmt->execute([
                ":id" => $_SESSION["user_id"]
            ]);

            $userRow = $stmt->fetch();

            if ($userRow) {
                $dean = $userRow["dean"];
            }
        }

        /* ---------- APPROVAL DATA ---------- */

        $approvals = fetchPreparedRow($pdo, "
            SELECT 
                dean,
                ces_head,
                ces_head_suffix,
                vp_acad,
                vp_acad_suffix,
                vp_admin,
                vp_admin_suffix,
                school_president,
                school_president_suffix
            FROM approvals_coordinator
            WHERE department = :department
            ORDER BY updated_at DESC
            LIMIT 1
        ", [
            ":department" => $department
        ]);

        if (!array_key_exists("dean", $approvals) || $approvals["dean"] === null || $approvals["dean"] === "") {
            $approvals["dean"] = $dean;
        }

        /* ---------- DOCUMENT INFO ---------- */

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

        /* ---------- MERGE RESULTS ---------- */

        $result = array_merge(
            $approvals,
            $documentInfo
        );

        echo json_encode($result);

    } catch (Exception $e) {

        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch data",
            "error" => $e->getMessage()
        ]);
    }

    exit;
}

/* ==========================================
   POST REQUEST
========================================== */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !is_array($data)) {

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);
    exit;
}

try {

    $pdo->beginTransaction();

    /* ---------- SAVE DEAN INTO ces_database.users ---------- */

    $dean = trim($data["dean"] ?? "");
    $department = trim($_SESSION["department"] ?? "");

    if (!isset($_SESSION['user_id'])) {
        throw new Exception("Cannot save dean because no logged-in user was found.");
    }

    if ($department === "") {
        throw new Exception("Cannot save approval data because no department was found in the session.");
    }

    $accountsPDO = new PDO(
        "mysql:host=$host;dbname=ces_database;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );

    $stmt = $accountsPDO->prepare("
        UPDATE users
        SET dean = :dean
        WHERE id = :id
    ");

    $stmt->execute([
        ":dean" => $dean,
        ":id"   => $_SESSION["user_id"]
    ]);

    $_SESSION["dean"] = $dean;

    /* ---------- COORDINATOR APPROVALS ---------- */

    $approvalParams = [
        ":dean" => $dean,
        ":ces_head" => $data["ces_head"] ?? "",
        ":ces_head_suffix" => $data["ces_head_suffix"] ?? "",
        ":vp_acad" => $data["vp_acad"] ?? "",
        ":vp_acad_suffix" => $data["vp_acad_suffix"] ?? "",
        ":vp_admin" => $data["vp_admin"] ?? "",
        ":vp_admin_suffix" => $data["vp_admin_suffix"] ?? "",
        ":school_president" => $data["school_president"] ?? "",
        ":school_president_suffix" => $data["school_president_suffix"] ?? "",
        ":department" => $department
    ];

    $existingApproval = fetchPreparedRow($pdo, "
        SELECT id
        FROM approvals_coordinator
        WHERE department = :department
        ORDER BY updated_at DESC
        LIMIT 1
    ", [
        ":department" => $department
    ]);

    if ($existingApproval) {
        $stmt = $pdo->prepare("
            UPDATE approvals_coordinator
            SET
                dean = :dean,
                ces_head = :ces_head,
                ces_head_suffix = :ces_head_suffix,
                vp_acad = :vp_acad,
                vp_acad_suffix = :vp_acad_suffix,
                vp_admin = :vp_admin,
                vp_admin_suffix = :vp_admin_suffix,
                school_president = :school_president,
                school_president_suffix = :school_president_suffix,
                department = :department
            WHERE id = :id
        ");

        $stmt->execute(array_merge($approvalParams, [
            ":id" => $existingApproval["id"]
        ]));
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO approvals_coordinator (
                dean,
                ces_head,
                ces_head_suffix,
                vp_acad,
                vp_acad_suffix,
                vp_admin,
                vp_admin_suffix,
                school_president,
                school_president_suffix,
                department
            )
            VALUES (
                :dean,
                :ces_head,
                :ces_head_suffix,
                :vp_acad,
                :vp_acad_suffix,
                :vp_admin,
                :vp_admin_suffix,
                :school_president,
                :school_president_suffix,
                :department
            )
        ");

        $stmt->execute($approvalParams);
    }

    /* ---------- DOCUMENT INFO ---------- */

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
        ":issue_status" => $data["issue_status"] ?? "",
        ":revision_number" => $data["revision_number"] ?? "",
        ":date_effective" => $data["date_effective"] ?? "",
        ":approved_by" => $data["approved_by"] ?? ""
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Approval form saved successfully"
    ]);

} catch (Exception $e) {

    $pdo->rollBack();

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Save failed",
        "error" => $e->getMessage()
    ]);
}
?>
