<?php
ob_start();
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

function sendResponse($success, $message, $data = null) {
    ob_clean();
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    $conn = new mysqli("localhost", "root", "", "ces_reports_db");
    if ($conn->connect_error) {
        sendResponse(false, "Database connection failed");
    }

    $input = file_get_contents('php://input');
    if (!$input) {
        sendResponse(false, "No data received");
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, "Invalid JSON: " . json_last_error_msg());
    }

    if (!isset($data['id'])) {
        sendResponse(false, "No report ID provided");
    }

    $reportId = intval($data['id']);
    $status = 'pending'; // Set status back to pending for re-submission

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update main 3ydp table (EXCLUDING feedback field)
        $stmt = $conn->prepare("UPDATE `3ydp` SET 
            title_of_project = ?,
            description_of_project = ?,
            general_objectives = ?,
            program_justification = ?,
            beneficiaries = ?,
            program_plan_text = ?,
            status = ?
            WHERE id = ?");

        $stmt->bind_param("sssssssi", 
            $data['title_of_project'],
            $data['description_of_project'],
            $data['general_objectives'],
            $data['program_justification'],
            $data['beneficiaries'],
            $data['program_plan_text'],
            $status,
            $reportId
        );

        if (!$stmt->execute()) {
            throw new Exception("Failed to update main report: " . $stmt->error);
        }
        $stmt->close();

        // Delete existing programs
        $stmt = $conn->prepare("DELETE FROM `3ydp_programs` WHERE report_id = ?");
        $stmt->bind_param("i", $reportId);
        if (!$stmt->execute()) {
            throw new Exception("Failed to delete old programs: " . $stmt->error);
        }
        $stmt->close();

        // Insert new programs
        if (isset($data['programs']) && is_array($data['programs'])) {
            $stmt = $conn->prepare("INSERT INTO `3ydp_programs` 
                (report_id, program, milestones, objectives, strategies, 
                persons_agencies_involved, resources_needed, budget, time_frame) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

            foreach ($data['programs'] as $program) {
                $stmt->bind_param("issssssss", 
                    $reportId,
                    $program['program'],
                    $program['milestones'],
                    $program['objectives'],
                    $program['strategies'],
                    $program['persons_agencies_involved'],
                    $program['resources_needed'],
                    $program['budget'],
                    $program['time_frame']
                );

                if (!$stmt->execute()) {
                    throw new Exception("Failed to insert program: " . $stmt->error);
                }
            }
            $stmt->close();
        }

        // Commit transaction
        $conn->commit();
        sendResponse(true, "Report updated successfully and status set to pending");

    } catch (Exception $e) {
        $conn->rollback();
        sendResponse(false, $e->getMessage());
    }

    $conn->close();

} catch (Exception $e) {
    sendResponse(false, "Server error: " . $e->getMessage());
}
?>