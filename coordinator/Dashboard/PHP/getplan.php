<?php
session_start();
header('Content-Type: application/json');

try {
    $conn = new mysqli("localhost", "root", "", "ces_database");
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");

    $year = $_GET['year'] ?? 'all';
    $currentUserId = $_SESSION['user_id'] ?? null;

    $tableCheck = $conn->query("SHOW TABLES LIKE 'report_3ydp'");
    $programTableCheck = $conn->query("SHOW TABLES LIKE 'report_3ydp_programs'");

    if (!$tableCheck || $tableCheck->num_rows === 0 || !$programTableCheck || $programTableCheck->num_rows === 0) {
        echo json_encode([
            "success" => true,
            "years" => [],
            "plans" => []
        ]);
        exit;
    }

    $hasUserId = $conn->query("SHOW COLUMNS FROM `report_3ydp` LIKE 'user_id'")->num_rows > 0;
    $hasProgress = $conn->query("SHOW COLUMNS FROM `report_3ydp_programs` LIKE 'progress'")->num_rows > 0;

    $where = [];
    $types = "";
    $params = [];

    $where[] = "LOWER(p.status) IN ('approve', 'approved')";

    if ($year !== 'all' && preg_match('/^\d{4}$/', $year)) {
        $where[] = "YEAR(p.created_at) = ?";
        $types .= "s";
        $params[] = $year;
    }

    if ($hasUserId && $currentUserId !== null) {
        $where[] = "p.user_id = ?";
        $types .= "s";
        $params[] = (string) $currentUserId;
    }

    $whereSql = count($where) ? "WHERE " . implode(" AND ", $where) : "";

    $query = "
        SELECT
            p.id AS plan_id,
            p.title_of_project AS plan_title,
            p.department,
            p.status,
            p.created_at
        FROM `report_3ydp` p
        $whereSql
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT 1
    ";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare query: " . $conn->error);
    }

    if ($types !== "") {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $plans = [];
    $planIds = [];

    while ($row = $result->fetch_assoc()) {
        $planId = (string) $row['plan_id'];
        $planIds[] = (int) $row['plan_id'];

        if (!isset($plans[$planId])) {
            $plans[$planId] = [
                "id" => $row['plan_id'],
                "title" => $row['plan_title'] ?: "Untitled 3-Year Development Plan",
                "department" => $row['department'] ?: "N/A",
                "status" => $row['status'] ?: "N/A",
                "created_at" => $row['created_at'],
                "year" => $row['created_at'] ? date("Y", strtotime($row['created_at'])) : null,
                "programs" => []
            ];
        }
    }

    $stmt->close();

    if (count($planIds) > 0) {
        $placeholders = implode(",", array_fill(0, count($planIds), "?"));
        $programTypes = str_repeat("i", count($planIds));
        $progressColumn = $hasProgress ? "progress" : "NULL AS progress";

        $programQuery = "
            SELECT
                id,
                report_id,
                program,
                objectives,
                $progressColumn
            FROM `report_3ydp_programs`
            WHERE report_id IN ($placeholders)
            ORDER BY id ASC
            LIMIT 3
        ";

        $programStmt = $conn->prepare($programQuery);
        if (!$programStmt) {
            throw new Exception("Failed to prepare program query: " . $conn->error);
        }

        $programStmt->bind_param($programTypes, ...$planIds);
        $programStmt->execute();
        $programResult = $programStmt->get_result();

        while ($programRow = $programResult->fetch_assoc()) {
            $reportId = (string) $programRow['report_id'];

            if (!isset($plans[$reportId])) {
                continue;
            }

            $plans[$reportId]["programs"][] = [
                "id" => $programRow['id'],
                "program" => $programRow['program'] ?: "Untitled Program",
                "objectives" => $programRow['objectives'] ?: "No objective provided.",
                "progress" => $programRow['progress'] ?: "Not Started"
            ];
        }

        $programStmt->close();
    }

    $yearQuery = "SELECT DISTINCT YEAR(created_at) AS report_year FROM `report_3ydp`";
    $yearWhere = [];
    $yearTypes = "";
    $yearParams = [];

    $yearWhere[] = "LOWER(status) IN ('approve', 'approved')";

    if ($hasUserId && $currentUserId !== null) {
        $yearWhere[] = "user_id = ?";
        $yearTypes .= "s";
        $yearParams[] = (string) $currentUserId;
    }

    if (count($yearWhere)) {
        $yearQuery .= " WHERE " . implode(" AND ", $yearWhere);
    }

    $yearQuery .= " ORDER BY report_year DESC";
    $yearStmt = $conn->prepare($yearQuery);
    if (!$yearStmt) {
        throw new Exception("Failed to prepare year query: " . $conn->error);
    }

    if ($yearTypes !== "") {
        $yearStmt->bind_param($yearTypes, ...$yearParams);
    }

    $yearStmt->execute();
    $yearResult = $yearStmt->get_result();
    $years = [];

    while ($yearRow = $yearResult->fetch_assoc()) {
        if ($yearRow['report_year']) {
            $years[] = (string) $yearRow['report_year'];
        }
    }

    $yearStmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "years" => $years,
        "plans" => array_values($plans)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
