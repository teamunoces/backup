<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../shared/report_draft.php';

function transform_evaluation_payload(array $data): array {
    $ratings = is_array($data['ratings'] ?? null) ? $data['ratings'] : [];

    $payload = [
        'action' => $data['action'] ?? 'submit',
        'draft_id' => $data['draft_id'] ?? null,
        'type' => $data['type'] ?? 'Evaluation Sheet for Extension Services',
        'venue' => $data['venue'] ?? '',
        'implementing_department' => $data['implementing_department'] ?? '',
        'service_types' => is_array($data['serviceTypes'] ?? null)
            ? implode(', ', $data['serviceTypes'])
            : ($data['serviceTypes'] ?? $data['service_types'] ?? ''),
        'evaluated_by' => $data['evaluatedBy'] ?? $data['evaluated_by'] ?? '',
        'signature' => $data['signature'] ?? '',
        'evaluation_date' => $data['evaluationDate'] ?? $data['evaluation_date'] ?? ''
    ];

    for ($i = 1; $i <= 15; $i++) {
        $key = 'q' . $i;
        $column = $key . '_rating';
        $payload[$column] = isset($ratings[$key]) && $ratings[$key] !== null && $ratings[$key] !== ''
            ? (int) $ratings[$key]
            : ($data[$column] ?? null);
    }

    return $payload;
}

try {
    $pdo = draft_pdo();
    $data = transform_evaluation_payload(draft_input());
    $action = $data['action'] ?? 'submit';

    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'evaluation_reports');
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => $draft
        ]);
    }

    if ($action === 'submit') {
        if (trim((string) ($data['venue'] ?? '')) === '') {
            draft_json(['success' => false, 'message' => 'Venue is required'], 400);
        }
        if (trim((string) ($data['evaluated_by'] ?? '')) === '') {
            draft_json(['success' => false, 'message' => 'Evaluated by is required'], 400);
        }
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $reportId = draft_save_main($pdo, 'evaluation_reports', $data, [
            'default_type' => 'Evaluation Sheet for Extension Services'
        ]);

        draft_json([
            'success' => true,
            'message' => $action === 'save_draft' ? 'Draft saved successfully.' : 'Evaluation submitted successfully.',
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
