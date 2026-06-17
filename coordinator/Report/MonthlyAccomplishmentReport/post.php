<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../shared/report_draft.php';

function save_mar_details(PDO $pdo, int $reportId, array $rows): void {
    $pdo->prepare('DELETE FROM mar_table WHERE report_id = ?')->execute([$reportId]);
    $stmt = $pdo->prepare('INSERT INTO mar_table (report_id, date_of_act, activities_conducted, objectives, act_status, issues_or_concerns, financial_report, recommendations, plans_for_next_months) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    foreach ($rows as $row) {
        if (trim(($row['date_of_act'] ?? '') . ($row['activities_conducted'] ?? '')) === '') continue;
        $stmt->execute([$reportId, $row['date_of_act'] ?? '', $row['activities_conducted'] ?? '', $row['objectives'] ?? '', $row['act_status'] ?? '', $row['issues_or_concerns'] ?? '', $row['financial_report'] ?? '', $row['recommendations'] ?? '', $row['plans_for_next_months'] ?? '']);
    }
}
function load_mar_details(PDO $pdo, int $reportId): array {
    $stmt = $pdo->prepare('SELECT date_of_act, activities_conducted, objectives, act_status, issues_or_concerns, financial_report, recommendations, plans_for_next_months FROM mar_table WHERE report_id = ? ORDER BY id ASC');
    $stmt->execute([$reportId]);
    return $stmt->fetchAll();
}
try {
    $pdo = draft_pdo();
    $data = draft_input();
    $action = $data['action'] ?? 'submit';
    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'mar_header');
        if ($draft) $draft['rows'] = load_mar_details($pdo, (int) $draft['id']);
        draft_json(['success' => true, 'user_id' => (string) ($_SESSION['user_id'] ?? ''), 'draft' => $draft]);
    }
    if ($action === 'save_draft' || $action === 'submit') {
        $rows = is_array($data['rows'] ?? null) ? $data['rows'] : [];
        unset($data['rows']);
        $data['type'] = $data['type'] ?? 'Monthly Accomplishment Report';
        $pdo->beginTransaction();
        $reportId = draft_save_main($pdo, 'mar_header', $data, ['default_type' => 'Monthly Accomplishment Report']);
        save_mar_details($pdo, $reportId, $rows);
        $pdo->commit();
        draft_json(['success' => true, 'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Report submitted successfully.', 'draft_id' => $reportId, 'report_id' => $reportId, 'user_id' => (string) ($_SESSION['user_id'] ?? '')]);
    }
    draft_json(['success' => false, 'message' => 'Invalid action.'], 400);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    draft_json(['success' => false, 'message' => $e->getMessage()], 500);
}
?>
