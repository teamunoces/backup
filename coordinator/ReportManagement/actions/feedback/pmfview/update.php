<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    $conn = new mysqli('localhost', 'root', '', 'ces_reports_db');

    if ($conn->connect_error) {
        sendResponse(false, 'Connection failed: ' . $conn->connect_error);
    }

    $conn->set_charset("utf8");

    $input = file_get_contents('php://input');
    if (!$input) sendResponse(false, 'No data received');

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data['id'])) {
        sendResponse(false, 'No report ID provided');
    }

    $reportId = intval($data['id']);
    $status = 'pending';

    // ========================
    // CLEAN DATA
    // ========================
    $department = $data['department'] ?? '';
    $program_title = $data['program_title'] ?? '';
    $activity_conducted = $data['activity_conducted'] ?? '';
    $location = $data['location'] ?? '';
    $beneficiaries = $data['beneficiaries'] ?? '';
    $monitoring_date = !empty($data['monitoring_date']) ? $data['monitoring_date'] : null;
    $monitored_by = $data['monitored_by'] ?? '';

    // Issues
    for ($i = 1; $i <= 8; $i++) {
        ${"issue{$i}_status"} = $data["issue{$i}_low_participation_status"] ?? $data["issue{$i}_resource_constraints_status"] ?? $data["issue{$i}_lack_coordination_status"] ?? $data["issue{$i}_cultural_barriers_status"] ?? $data["issue{$i}_sustainability_status"] ?? $data["issue{$i}_inadequate_monitoring_status"] ?? $data["issue{$i}_limited_training_status"] ?? $data["issue{$i}_mismanagement_status"] ?? 'Not marked';
        ${"issue{$i}_follow_up"} = $data["issue{$i}_follow_up"] ?? null;
    }

    $issue9_other_specify = $data['issue9_other_specify'] ?? '';

    // Feedback
    $positive_feedback_checked = (int)($data['positive_feedback_checked'] ?? 0);
    $positive_feedback_summary = $data['positive_feedback_summary'] ?? '';
    $positive_feedback_action = $data['positive_feedback_action'] ?? '';

    $negative_feedback_checked = (int)($data['negative_feedback_checked'] ?? 0);
    $negative_feedback_summary = $data['negative_feedback_summary'] ?? '';
    $negative_feedback_action = $data['negative_feedback_action'] ?? '';

    $suggestions_feedback_checked = (int)($data['suggestions_feedback_checked'] ?? 0);
    $suggestions_feedback_summary = $data['suggestions_feedback_summary'] ?? '';
    $suggestions_feedback_action = $data['suggestions_feedback_action'] ?? '';

    // Recommendations
    for ($i = 1; $i <= 7; $i++) {
        ${"rec{$i}_applicability"} = $data["rec{$i}_applicability"] ?? 'Not specified';
    }

    $other_recommendations = $data['other_recommendations'] ?? '';
    $feedback = $data['feedback'] ?? '';

    // ========================
    // PREPARE QUERY
    // ========================
    $stmt = $conn->prepare("UPDATE program_monitoring_form SET 
        department=?, program_title=?, activity_conducted=?, location=?, beneficiaries=?, monitoring_date=?, monitored_by=?,
        issue1_low_participation_status=?, issue1_follow_up=?,
        issue2_resource_constraints_status=?, issue2_follow_up=?,
        issue3_lack_coordination_status=?, issue3_follow_up=?,
        issue4_cultural_barriers_status=?, issue4_follow_up=?,
        issue5_sustainability_status=?, issue5_follow_up=?,
        issue6_inadequate_monitoring_status=?, issue6_follow_up=?,
        issue7_limited_training_status=?, issue7_follow_up=?,
        issue8_mismanagement_status=?, issue8_follow_up=?,
        issue9_other_specify=?,
        positive_feedback_checked=?, positive_feedback_summary=?, positive_feedback_action=?,
        negative_feedback_checked=?, negative_feedback_summary=?, negative_feedback_action=?,
        suggestions_feedback_checked=?, suggestions_feedback_summary=?, suggestions_feedback_action=?,
        rec1_applicability=?, rec2_applicability=?, rec3_applicability=?, rec4_applicability=?, rec5_applicability=?, rec6_applicability=?, rec7_applicability=?,
        other_recommendations=?, feedback=?, status=?
        WHERE id=?");

    if (!$stmt) {
        sendResponse(false, 'Prepare failed: ' . $conn->error);
    }

    // ========================
    // FIXED TYPES (NO ERROR)
    // ========================
    $types =
        str_repeat("s", 24) . // first 24
        "i" . "ss" .          // positive
        "i" . "ss" .          // negative
        "i" .                 // suggestions
        str_repeat("s", 12) . // rest
        "i";                  // id

    // DEBUG (optional)
    if (strlen($types) !== 44) {
        sendResponse(false, 'Type mismatch error: ' . strlen($types));
    }

    $stmt->bind_param(
        $types,
        $department,
        $program_title,
        $activity_conducted,
        $location,
        $beneficiaries,
        $monitoring_date,
        $monitored_by,
        $issue1_status, $issue1_follow_up,
        $issue2_status, $issue2_follow_up,
        $issue3_status, $issue3_follow_up,
        $issue4_status, $issue4_follow_up,
        $issue5_status, $issue5_follow_up,
        $issue6_status, $issue6_follow_up,
        $issue7_status, $issue7_follow_up,
        $issue8_status, $issue8_follow_up,
        $issue9_other_specify,
        $positive_feedback_checked, $positive_feedback_summary, $positive_feedback_action,
        $negative_feedback_checked, $negative_feedback_summary, $negative_feedback_action,
        $suggestions_feedback_checked, $suggestions_feedback_summary, $suggestions_feedback_action,
        $rec1_applicability, $rec2_applicability, $rec3_applicability,
        $rec4_applicability, $rec5_applicability, $rec6_applicability, $rec7_applicability,
        $other_recommendations,
        $feedback,
        $status,
        $reportId
    );

    if ($stmt->execute()) {
        sendResponse(true, 'Report updated successfully');
    } else {
        sendResponse(false, 'Execute failed: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Throwable $e) {
    sendResponse(false, $e->getMessage());
}
?>