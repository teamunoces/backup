<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../shared/report_draft.php';

const CNACR_REPORT_TYPE = 'Community Needs Assessment Consolidated Report';

function clean_cnacr_value($value): string {
    return trim((string) ($value ?? ''));
}

function transform_cnacr_payload(array $input): array {
    return [
        'action' => $input['action'] ?? 'submit',
        'draft_id' => $input['draft_id'] ?? null,
        'type' => clean_cnacr_value($input['type'] ?? $input['report_type'] ?? CNACR_REPORT_TYPE),
        'department' => clean_cnacr_value($input['department'] ?? ''),
        'date_submitted' => clean_cnacr_value($input['date_submitted'] ?? ''),
        'date_conduct' => clean_cnacr_value($input['date_conduct'] ?? ''),
        'participants' => clean_cnacr_value($input['participants'] ?? ''),
        'location' => clean_cnacr_value($input['location'] ?? ''),
        'family_profile' => clean_cnacr_value($input['family_profile'] ?? ''),
        'community_concern' => clean_cnacr_value($input['community_concern'] ?? ''),
        'other_identified_needs' => clean_cnacr_value($input['other_identified_needs'] ?? ''),
        'kabayani_ng_panginoon' => clean_cnacr_value($input['kabayani_ng_panginoon'] ?? ''),
        'kabayani_ng_kalikasan' => clean_cnacr_value($input['kabayani_ng_kalikasan'] ?? ''),
        'kabayani_ng_buhay' => clean_cnacr_value($input['kabayani_ng_buhay'] ?? ''),
        'kabayani_ng_turismo' => clean_cnacr_value($input['kabayani_ng_turismo'] ?? ''),
        'kabayani_ng_kultura' => clean_cnacr_value($input['kabayani_ng_kultura'] ?? ''),
        'title_of_program' => clean_cnacr_value($input['title_of_program'] ?? ''),
        'objectives' => clean_cnacr_value($input['objectives'] ?? ''),
        'beneficiaries' => clean_cnacr_value($input['beneficiaries'] ?? ''),
        'from_school' => clean_cnacr_value($input['from_school'] ?? ''),
        'from_community' => clean_cnacr_value($input['from_community'] ?? '')
    ];
}

try {
    $pdo = draft_pdo();
    $data = transform_cnacr_payload(draft_input());
    $action = $data['action'];

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
            'default_type' => CNACR_REPORT_TYPE
        ]);

        draft_json([
            'success' => true,
            'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Report submitted successfully!',
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
