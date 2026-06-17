<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../shared/report_draft.php';

function detail_rows(array $data): array {
    return is_array($data['rows'] ?? null) ? $data['rows'] : [];
}
function save_details(PDO $pdo, int $reportId, array $rows): void {
    $pdo->prepare('DELETE FROM pd_detail WHERE report_id = ?')->execute([$reportId]);
    $stmt = $pdo->prepare('INSERT INTO pd_detail (report_id, program, objectives, program_content_and_activities, service_delivery, partnerships_and_stakeholders, facilitators_and_trainers, program_start_and_end_dates, frequency_of_activities, community_resources, school_resources, risk_management_and_contingency_plans, sustainability_and_follow_up, promotion_and_awareness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($rows as $row) {
        $hasTypedData = false;
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                $hasTypedData = true;
                break;
            }
        }
        if (!$hasTypedData) continue;
        $stmt->execute([$reportId, $row['program'] ?? '', $row['objectives'] ?? '', $row['program_content_and_activities'] ?? '', $row['service_delivery'] ?? '', $row['partnerships_and_stakeholders'] ?? '', $row['facilitators_and_trainers'] ?? '', $row['program_start_and_end_dates'] ?? '', $row['frequency_of_activities'] ?? '', $row['community_resources'] ?? '', $row['school_resources'] ?? '', $row['risk_management_and_contingency_plans'] ?? '', $row['sustainability_and_follow_up'] ?? '', $row['promotion_and_awareness'] ?? '']);
    }
}
function load_details(PDO $pdo, int $reportId): array {
    $stmt = $pdo->prepare('SELECT program, objectives, program_content_and_activities, service_delivery, partnerships_and_stakeholders, facilitators_and_trainers, program_start_and_end_dates, frequency_of_activities, community_resources, school_resources, risk_management_and_contingency_plans, sustainability_and_follow_up, promotion_and_awareness FROM pd_detail WHERE report_id = ? ORDER BY id ASC');
    $stmt->execute([$reportId]);
    return $stmt->fetchAll();
}
try {
    $pdo = draft_pdo();
    $data = draft_input();
    $action = $data['action'] ?? 'submit';
    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'pd_main');
        if ($draft) $draft['rows'] = load_details($pdo, (int) $draft['id']);
        draft_json(['success' => true, 'user_id' => (string) ($_SESSION['user_id'] ?? ''), 'draft' => $draft]);
    }
    if ($action === 'save_draft' || $action === 'submit') {
        $rows = detail_rows($data);
        unset($data['rows']);
        $data['type'] = $data['type'] ?? 'Program Design';
        $pdo->beginTransaction();
        $reportId = draft_save_main($pdo, 'pd_main', $data, ['default_type' => 'Program Design']);
        save_details($pdo, $reportId, $rows);
        $pdo->commit();
        draft_json(['success' => true, 'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Report submitted successfully.', 'draft_id' => $reportId, 'report_id' => $reportId, 'user_id' => (string) ($_SESSION['user_id'] ?? '')]);
    }
    draft_json(['success' => false, 'message' => 'Invalid action.'], 400);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    draft_json(['success' => false, 'message' => $e->getMessage()], 500);
}
?>
