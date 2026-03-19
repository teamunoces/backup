<?php
session_start();
header('Content-Type: application/json');

try {
    $conn = new mysqli("localhost", "root", "", "ces_reports_db");
    if ($conn->connect_error) throw new Exception($conn->connect_error);

    // Make sure required session variables exist
    if (!isset($_SESSION['name'], $_SESSION['department'], $_SESSION['role'], $_SESSION['user_id'])) {
        throw new Exception("User not logged in");
    }

    $created_by_name = $_SESSION['name'];
    $department = $_SESSION['department'];
    $role = $_SESSION['role'];
    $user_id = $_SESSION['user_id'];
    $dean = $_SESSION['dean'] ?? 'N/A';


    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    if (!$data) throw new Exception("Invalid JSON input");

    // --- Main report fields ---
    $type = $data['report_type'] ?? '3-year Development Plan';
    $title = $data['title_of_project'] ?? '';
    $description = $data['description_of_project'] ?? '';
    $general_objectives = $data['general_objectives'] ?? '';
    $program_justification = $data['program_justification'] ?? '';
    $beneficiaries = $data['beneficiaries'] ?? '';
    $program_plan_text = $data['program_plan_text'] ?? '';

    // --- Insert main report including role and user_id ---
    $stmt = $conn->prepare("INSERT INTO `3ydp`
        (type, title_of_project, description_of_project, general_objectives, program_justification, beneficiaries, program_plan_text, created_by_name, department, role, user_id, dean)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param(
        "ssssssssssis",
        $type,
        $title,
        $description,
        $general_objectives,
        $program_justification,
        $beneficiaries,
        $program_plan_text,
        $created_by_name,
        $department,
        $role,
        $user_id,
        $dean
    );
    $stmt->execute();
    $report_id = $conn->insert_id; // <-- all program rows use this ID
    $stmt->close();

    // --- Insert program rows ---
    $rows = $data['programPlanTable'] ?? [];
    $inserted = 0;

    if ($rows) {
        $stmt2 = $conn->prepare("INSERT INTO `3ydp_programs`
            (report_id, program, objectives, milestones, strategies, persons_agencies_involved, resources_needed, budget, time_frame)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($rows as $row) {
            $stmt2->bind_param(
                "issssssss",
                $report_id,
                $row['program'],
                $row['objectives'],
                $row['milestones'],
                $row['strategies'],
                $row['persons_agencies_involved'],
                $row['resources_needed'],
                $row['budget'],
                $row['time_frame']
            );
            if ($stmt2->execute()) $inserted++;
        }
        $stmt2->close();
    }

    $conn->close();

    echo json_encode([
        "success" => true,
        "message" => "Report inserted with $inserted program row(s).",
        "report_id" => $report_id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>