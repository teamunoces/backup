<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../shared/report_draft.php';

function pmf_date(?string $date): ?string {
    $date = trim((string) $date);
    if ($date === '') {
        return null;
    }

    $timestamp = strtotime($date);
    return $timestamp === false ? null : date('Y-m-d', $timestamp);
}

function pmf_follow_up($value): ?string {
    $value = strtoupper(trim((string) $value));
    if ($value === 'Y' || $value === 'YES') {
        return 'Y';
    }
    if ($value === 'N' || $value === 'NO') {
        return 'N';
    }
    return null;
}

function pmf_issue_status($status): string {
    return in_array($status, ['N/A', 'YES', 'Not marked'], true) ? $status : 'Not marked';
}

function pmf_rec_status($status): string {
    return in_array($status, ['Yes', 'N/A', 'Not specified'], true) ? $status : 'Not specified';
}

function transform_pmf_payload(array $data): array {
    $header = is_array($data['header'] ?? null) ? $data['header'] : [];

    $payload = [
        'action' => $data['action'] ?? 'submit',
        'draft_id' => $data['draft_id'] ?? null,
        'type' => $data['reportType'] ?? $data['type'] ?? 'Program Monitoring Form',
        'program_title' => trim((string) ($header['programTitle'] ?? '')),
        'activity_conducted' => trim((string) ($header['activityConducted'] ?? '')),
        'location' => trim((string) ($header['location'] ?? '')),
        'beneficiaries' => trim((string) ($header['beneficiaries'] ?? '')),
        'monitoring_date' => pmf_date($header['dateOfMonitoring'] ?? ''),
        'monitored_by' => trim((string) ($header['monitoredBy'] ?? ''))
    ];

    $issueMap = [
        'Low Participation' => 'issue1_low_participation',
        'Resource Constraints' => 'issue2_resource_constraints',
        'Lack of Proper Coordination' => 'issue3_lack_coordination',
        'Cultural and Social Barriers' => 'issue4_cultural_barriers',
        'Sustainability Challenges' => 'issue5_sustainability',
        'Inadequate Monitoring' => 'issue6_inadequate_monitoring',
        'Limited Training' => 'issue7_limited_training',
        'Mismanagement' => 'issue8_mismanagement'
    ];

    foreach ($issueMap as $prefix) {
        $payload[$prefix . '_status'] = 'Not marked';
        $payload[$prefix . '_follow_up'] = null;
    }
    $payload['issue9_other_specify'] = '';

    foreach ((array) ($data['issuesAndChallenges'] ?? []) as $issue) {
        $indicator = $issue['indicator'] ?? '';
        if (strpos($indicator, 'Others') !== false) {
            $payload['issue9_other_specify'] = $issue['details'] ?? '';
            continue;
        }

        foreach ($issueMap as $needle => $prefix) {
            if (strpos($indicator, $needle) !== false) {
                $payload[$prefix . '_status'] = pmf_issue_status($issue['status'] ?? 'Not marked');
                $payload[$prefix . '_follow_up'] = pmf_follow_up($issue['followUpRequired'] ?? '');
            }
        }
    }

    foreach (['positive', 'negative', 'suggestions'] as $type) {
        $payload[$type . '_feedback_checked'] = 0;
        $payload[$type . '_feedback_summary'] = '';
        $payload[$type . '_feedback_action'] = '';
    }

    foreach ((array) ($data['participantFeedback'] ?? []) as $feedback) {
        $typeText = $feedback['feedbackType'] ?? '';
        $key = strpos($typeText, 'Negative') !== false
            ? 'negative'
            : (strpos($typeText, 'Suggestions') !== false ? 'suggestions' : 'positive');

        $payload[$key . '_feedback_checked'] = !empty($feedback['isChecked']) ? 1 : 0;
        $payload[$key . '_feedback_summary'] = $feedback['summary'] ?? '';
        $payload[$key . '_feedback_action'] = $feedback['actionsToImprove'] ?? '';
    }

    $recommendations = $data['actionsForNextActivity']['standardRecommendations'] ?? [];
    for ($i = 1; $i <= 7; $i++) {
        $payload['rec' . $i . '_applicability'] = 'Not specified';
    }
    foreach ((array) $recommendations as $index => $recommendation) {
        if ($index < 7) {
            $payload['rec' . ($index + 1) . '_applicability'] = pmf_rec_status($recommendation['applicability'] ?? 'Not specified');
        }
    }

    $payload['other_recommendations'] = $data['actionsForNextActivity']['otherRecommendations'] ?? '';

    return $payload;
}

try {
    $pdo = draft_pdo();
    $data = transform_pmf_payload(draft_input());
    $action = $data['action'] ?? 'submit';

    if ($action === 'get_draft') {
        $draft = draft_get_main($pdo, 'program_monitoring_form');
        draft_json([
            'success' => true,
            'user_id' => (string) ($_SESSION['user_id'] ?? ''),
            'draft' => $draft
        ]);
    }

    if ($action === 'save_draft' || $action === 'submit') {
        $reportId = draft_save_main($pdo, 'program_monitoring_form', $data, [
            'default_type' => 'Program Monitoring Form'
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
