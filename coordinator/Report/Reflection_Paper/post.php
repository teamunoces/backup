<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../shared/report_draft.php';

const REFLECTION_REPORT_TYPE = 'Monthly Accomplishment Report- Reflection Paper';

function clean_reflection_value($value): string {
    return trim((string) ($value ?? ''));
}

function transform_reflection_payload(array $input): array {
    $extensionServices = $input['extension_services'] ?? '';
    if (is_array($extensionServices)) {
        $extensionServices = implode(', ', array_filter(array_map('trim', $extensionServices)));
    }

    return [
        'action' => $input['action'] ?? 'submit',
        'draft_id' => $input['draft_id'] ?? null,
        'type' => clean_reflection_value($input['report_type'] ?? $input['type'] ?? REFLECTION_REPORT_TYPE),
        'beneficiary_name' => clean_reflection_value($input['beneficiary_name'] ?? ''),
        'implementing_department' => clean_reflection_value($input['implementing_department'] ?? ''),
        'extension_services' => clean_reflection_value($extensionServices),
        'answer_one' => clean_reflection_value($input['answer_one'] ?? ''),
        'answer_two' => clean_reflection_value($input['answer_two'] ?? ''),
        'answer_three' => clean_reflection_value($input['answer_three'] ?? ''),
        'beneficiary_signature' => clean_reflection_value($input['beneficiary_signature'] ?? '')
    ];
}

try {
    $pdo = draft_pdo();
    $data = transform_reflection_payload(draft_input());
    $action = $data['action'];

    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'reflection_paper');
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => $draft
        ]);
    }

    if ($action === 'submit') {
        if ($data['beneficiary_name'] === '') {
            draft_json(['success' => false, 'message' => 'Beneficiary name is required.'], 400);
        }

        if ($data['implementing_department'] === '') {
            draft_json(['success' => false, 'message' => 'Implementing department is required.'], 400);
        }

        if ($data['extension_services'] === '') {
            draft_json(['success' => false, 'message' => 'Please select at least one extension service type.'], 400);
        }
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $reportId = draft_save_main($pdo, 'reflection_paper', $data, [
            'default_type' => REFLECTION_REPORT_TYPE
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
