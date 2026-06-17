function showSuccessBanner(message = 'Report submitted successfully!') {
    let banner = document.getElementById('submissionSuccessBanner');
    if (!banner) {
        banner = document.createElement('div'); banner.id = 'submissionSuccessBanner'; banner.setAttribute('role', 'status');
        banner.style.position = 'fixed'; banner.style.top = '78px'; banner.style.right = '24px'; banner.style.zIndex = '10000'; banner.style.maxWidth = '420px'; banner.style.padding = '14px 18px'; banner.style.borderRadius = '8px'; banner.style.background = 'linear-gradient(135deg, #59AF29 0%, #254911 100%)'; banner.style.color = '#ffffff'; banner.style.boxShadow = '0 10px 24px rgba(37, 73, 17, 0.28)'; banner.style.fontFamily = 'Inter, Segoe UI, Arial, sans-serif'; banner.style.fontSize = '14px'; banner.style.fontWeight = '700'; banner.style.lineHeight = '1.4'; banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)'; banner.style.transition = 'opacity 0.2s ease, transform 0.2s ease'; document.body.appendChild(banner);
    }
    banner.textContent = message; requestAnimationFrame(() => { banner.style.opacity = '1'; banner.style.transform = 'translateY(0)'; }); clearTimeout(window.submissionSuccessBannerTimer); window.submissionSuccessBannerTimer = setTimeout(() => { banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)'; }, 3500);
}
function collectEvaluation() {
    const ratings = {};
    for (let i = 1; i <= 15; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        ratings[`q${i}`] = selected ? parseInt(selected.value, 10) : null;
    }
    return {
        type: window.reportType || 'Evaluation Sheet for Extension Services',
        venue: document.getElementById('venue')?.value || '',
        implementing_department: document.getElementById('implementing_department')?.value || '',
        serviceTypes: Array.from(document.querySelectorAll('input[name="service_types[]"]:checked')).map(cb => cb.value),
        ratings,
        evaluatedBy: document.querySelector('input[name="evaluated_by"]')?.value || '',
        signature: document.querySelector('input[name="signature"]')?.value || '',
        evaluationDate: document.querySelector('input[name="date"]')?.value || ''
    };
}
function fillEvaluation(data) {
    if (document.getElementById('venue')) document.getElementById('venue').value = data.venue || '';
    if (document.getElementById('implementing_department')) document.getElementById('implementing_department').value = data.implementing_department || '';
    document.querySelectorAll('input[name="service_types[]"]').forEach(cb => cb.checked = String(data.service_types || '').split(',').map(v => v.trim()).includes(cb.value));
    for (let i = 1; i <= 15; i++) {
        const value = data[`q${i}_rating`];
        document.querySelectorAll(`input[name="q${i}"]`).forEach(radio => radio.checked = String(radio.value) === String(value));
    }
    const evaluatedBy = document.querySelector('input[name="evaluated_by"]'); if (evaluatedBy) evaluatedBy.value = data.evaluated_by || '';
    const signature = document.querySelector('input[name="signature"]'); if (signature) signature.value = data.signature || '';
    const date = document.querySelector('input[name="date"]'); if (date) date.value = data.evaluation_date || '';
}
function clearEvaluation() { document.getElementById('evaluationForm')?.reset(); }
document.addEventListener('DOMContentLoaded', () => {
    const draftManager = ReportDrafts.create({ storageKey: 'evaluation_report', collect: collectEvaluation, fill: fillEvaluation, clear: clearEvaluation });
    draftManager.checkDatabaseDraft();
    document.querySelector('.submit-button')?.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = draftManager.applySubmitMeta(collectEvaluation());
        try {
            const response = await fetch('post.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (error) {
                throw new Error(text || 'Server returned an invalid response.');
            }
            if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed.');
            draftManager.completeSubmit(); showSuccessBanner(result.message || 'Evaluation submitted successfully!'); clearEvaluation();
        } catch (error) { alert(`Error: ${error.message}`); }
    });
});
