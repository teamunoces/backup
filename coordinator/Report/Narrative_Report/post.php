<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../shared/report_draft.php';

const NARRATIVE_REPORT_TYPE = 'Monthly Accomplishment Report- Narrative Report';

function clean_narrative_value($value): string {
    return trim((string) ($value ?? ''));
}

function transform_narrative_payload(array $input): array {
    return [
        'action' => $input['action'] ?? 'submit',
        'draft_id' => $input['draft_id'] ?? null,
        'type' => clean_narrative_value($input['type'] ?? $input['report_type'] ?? NARRATIVE_REPORT_TYPE),
        'narrate_success' => clean_narrative_value($input['narrate_success'] ?? ''),
        'provide_data' => clean_narrative_value($input['provide_data'] ?? ''),
        'identify_problems' => clean_narrative_value($input['identify_problems'] ?? ''),
        'propose_solutions' => clean_narrative_value($input['propose_solutions'] ?? '')
    ];
}

try {
    $pdo = draft_pdo();
    $data = transform_narrative_payload(draft_input());
    $action = $data['action'];

    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'narrative_report');
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => $draft
        ]);
    }

    if ($action === 'submit') {
        $requiredFields = [
            'narrate_success' => 'Narrative of success is required.',
            'provide_data' => 'Data/results field is required.',
            'identify_problems' => 'Problems/challenges field is required.',
            'propose_solutions' => 'Proposed solutions field is required.'
        ];

        foreach ($requiredFields as $field => $message) {
            if ($data[$field] === '') {
                draft_json(['success' => false, 'message' => $message], 400);
            }
        }
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $reportId = draft_save_main($pdo, 'narrative_report', $data, [
            'default_type' => NARRATIVE_REPORT_TYPE
        ]);

        draft_json([
            'success' => true,
            'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Report submitted successfully',
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
