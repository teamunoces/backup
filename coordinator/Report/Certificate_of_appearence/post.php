<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../shared/report_draft.php';

const CERTIFICATE_REPORT_TYPE = 'Certificate of Appearance';

function clean_certificate_value($value): string {
    return trim((string) ($value ?? ''));
}

function transform_certificate_payload(array $input): array {
    return [
        'action' => $input['action'] ?? 'submit',
        'draft_id' => $input['draft_id'] ?? null,
        'type' => clean_certificate_value($input['report_type'] ?? $input['type'] ?? CERTIFICATE_REPORT_TYPE),
        'participant' => clean_certificate_value($input['participant'] ?? $input['name'] ?? ''),
        'cert_department' => clean_certificate_value($input['cert_department'] ?? ''),
        'activity_name' => clean_certificate_value($input['activity_name'] ?? ''),
        'location' => clean_certificate_value($input['location'] ?? ''),
        'date_held' => clean_certificate_value($input['date_held'] ?? ''),
        'month_held' => clean_certificate_value($input['month_held'] ?? ''),
        'year_held' => clean_certificate_value($input['year_held'] ?? ''),
        'location_two' => clean_certificate_value($input['location_two'] ?? ''),
        'monitored_by' => clean_certificate_value($input['monitored_by'] ?? ''),
        'verified_by' => clean_certificate_value($input['verified_by'] ?? ''),
        'feedback' => clean_certificate_value($input['feedback'] ?? '')
    ];
}

try {
    $pdo = draft_pdo();
    $data = transform_certificate_payload(draft_input());
    $action = $data['action'];

    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'cert_appearance');
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => $draft
        ]);
    }

    if ($action === 'submit') {
        $requiredFields = [
            'participant' => 'Participant name is required.',
            'cert_department' => 'Department is required.',
            'activity_name' => 'Activity name is required.',
            'monitored_by' => 'Monitored by is required.',
            'verified_by' => 'Verified by is required.'
        ];

        foreach ($requiredFields as $field => $message) {
            if ($data[$field] === '') {
                draft_json(['success' => false, 'message' => $message], 400);
            }
        }
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $reportId = draft_save_main($pdo, 'cert_appearance', $data, [
            'default_type' => CERTIFICATE_REPORT_TYPE
        ]);

        draft_json([
            'success' => true,
            'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Certificate data successfully inserted!',
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
