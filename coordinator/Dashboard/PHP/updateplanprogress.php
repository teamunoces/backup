<?php
session_start();
header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $programId = $input['program_id'] ?? null;
    $progress = $input['progress'] ?? null;

    $allowedProgress = ['Not Started', 'In Progress', 'Completed', 'Delayed'];

    if (!$programId || !ctype_digit((string) $programId)) {
        throw new Exception("Invalid program ID.");
    }

    if (!in_array($progress, $allowedProgress, true)) {
        throw new Exception("Invalid progress value.");
    }

    $conn = new mysqli("localhost", "root", "", "ces_database");
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");

    $stmt = $conn->prepare("UPDATE `report_3ydp_programs` SET progress = ? WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Failed to prepare update: " . $conn->error);
    }

    $programId = (int) $programId;
    $stmt->bind_param("si", $progress, $programId);

    if (!$stmt->execute()) {
        throw new Exception("Failed to update progress: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "progress" => $progress
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
