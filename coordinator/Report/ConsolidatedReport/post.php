<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../shared/report_draft.php';

function transform_cnacr_payload(array $data): array {
    $data['type'] = $data['type'] ?? $data['report_type'] ?? 'Community Needs Assessment Consolidated Report';
    unset($data['report_type']);
    return $data;
}

try {
    $pdo = draft_pdo();
    $data = transform_cnacr_payload(draft_input());
    $action = $data['action'] ?? 'submit';

    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'coordinator_cnacr');
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => $draft
        ]);
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $reportId = draft_save_main($pdo, 'coordinator_cnacr', $data, [
            'default_type' => 'Community Needs Assessment Consolidated Report'
        ]);

        draft_json([
            'success' => true,
            'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Report submitted successfully.',
            'draft_id' => $reportId,
            'report_id' => $reportId,
            'user_id' => (string) ($_SESSION['user_id'] ?? '')
        ]);
    }

    draft_json(['success' => false, 'message' => 'Invalid action.'], 400);
} catch (Throwable $e) {
    draft_json(['success' => false, 'message' => $e->getMessage()], 500);
}
?>
