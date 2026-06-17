function showSuccessBanner(message = 'Report submitted successfully!') {
    let banner = document.getElementById('submissionSuccessBanner');
    if (!banner) { banner = document.createElement('div'); banner.id = 'submissionSuccessBanner'; banner.setAttribute('role', 'status'); banner.style.position = 'fixed'; banner.style.top = '78px'; banner.style.right = '24px'; banner.style.zIndex = '10000'; banner.style.maxWidth = '420px'; banner.style.padding = '14px 18px'; banner.style.borderRadius = '8px'; banner.style.background = 'linear-gradient(135deg, #59AF29 0%, #254911 100%)'; banner.style.color = '#fff'; banner.style.boxShadow = '0 10px 24px rgba(37, 73, 17, 0.28)'; banner.style.fontFamily = 'Inter, Segoe UI, Arial, sans-serif'; banner.style.fontSize = '14px'; banner.style.fontWeight = '700'; banner.style.lineHeight = '1.4'; banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)'; banner.style.transition = 'opacity 0.2s ease, transform 0.2s ease'; document.body.appendChild(banner); }
    banner.textContent = message; requestAnimationFrame(() => { banner.style.opacity = '1'; banner.style.transform = 'translateY(0)'; }); clearTimeout(window.submissionSuccessBannerTimer); window.submissionSuccessBannerTimer = setTimeout(() => { banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)'; }, 3500);
}
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.querySelector('.submit-button');
    function autoExpand(textarea) { textarea.style.height = 'auto'; textarea.style.height = `${textarea.scrollHeight}px`; }
    document.querySelectorAll('textarea').forEach(textarea => textarea.addEventListener('input', () => autoExpand(textarea)));
    document.querySelectorAll('.naCheck, .yesCheck').forEach(box => box.addEventListener('change', function() { if (!this.checked) return; const other = this.classList.contains('naCheck') ? '.yesCheck' : '.naCheck'; document.querySelector(`${other}[data-row="${this.dataset.row}"]`).checked = false; }));
    document.querySelectorAll('.recYes, .recNa').forEach(box => box.addEventListener('change', function() { if (!this.checked) return; const other = this.classList.contains('recYes') ? '.recNa' : '.recYes'; document.querySelector(`${other}[data-rec="${this.dataset.rec}"]`).checked = false; }));
    document.querySelectorAll('.followUp').forEach(field => field.addEventListener('input', function() { const val = this.value.toUpperCase(); this.value = val.startsWith('Y') ? 'Y' : (val.startsWith('N') ? 'N' : val.slice(0, 1)); }));

    function collectFormData() {
        const headerData = {
            programTitle: document.getElementById('programTitle')?.value || '', activityConducted: document.getElementById('activityConducted')?.value || '', location: document.getElementById('location')?.value || '', beneficiaries: document.getElementById('beneficiaries')?.value || '', dateOfMonitoring: document.getElementById('monitoringDate')?.value || '', monitoredBy: document.getElementById('monitoredBy')?.value || ''
        };
        const issuesList = [];
        document.querySelectorAll('#issuesTable tbody tr').forEach((row) => {
            const indicator = row.querySelector('td:nth-child(3)')?.innerText.trim() || '';
            if (!indicator) return;
            issuesList.push({ indicator, status: row.querySelector('.naCheck')?.checked ? 'N/A' : (row.querySelector('.yesCheck')?.checked ? 'YES' : 'Not marked'), followUpRequired: row.querySelector('.followUp')?.value.trim().toUpperCase() || '', details: document.getElementById('otherIssues')?.value || '' });
        });
        const participantFeedback = ['positive','negative','suggestions'].map(type => ({ feedbackType: type === 'positive' ? 'Positive Feedback' : (type === 'negative' ? 'Negative Feedback' : 'Suggestions for Improvement'), isChecked: document.querySelector(`.feedbackCheck[data-feedback="${type}"]`)?.checked || false, summary: document.querySelector(`.feedbackSummary[data-feedback="${type}"]`)?.value || '', actionsToImprove: document.querySelector(`.feedbackAction[data-feedback="${type}"]`)?.value || '' }));
        const standardRecommendations = Array.from(document.querySelectorAll('#recommendationsTable tbody tr')).map(row => ({ recommendation: row.querySelector('td:nth-child(2)')?.innerText.trim() || '', applicability: row.querySelector('.recYes')?.checked ? 'Yes' : (row.querySelector('.recNa')?.checked ? 'N/A' : 'Not specified') }));
        return { reportType: window.reportType || 'Program Monitoring Form', header: headerData, issuesAndChallenges: issuesList, participantFeedback, actionsForNextActivity: { standardRecommendations, otherRecommendations: document.querySelector('.footer-notes .paper-lines')?.value || '' } };
    }
    function fillForm(data) {
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.value = value || ''; };
        set('programTitle', data.program_title); set('activityConducted', data.activity_conducted); set('location', data.location); set('beneficiaries', data.beneficiaries); set('monitoringDate', data.monitoring_date); set('monitoredBy', data.monitored_by); set('otherIssues', data.issue9_other_specify);
        const issuePrefixes = ['issue1_low_participation','issue2_resource_constraints','issue3_lack_coordination','issue4_cultural_barriers','issue5_sustainability','issue6_inadequate_monitoring','issue7_limited_training','issue8_mismanagement'];
        issuePrefixes.forEach((prefix, index) => { const status = data[`${prefix}_status`]; const na = document.querySelector(`.naCheck[data-row="${index}"]`); const yes = document.querySelector(`.yesCheck[data-row="${index}"]`); const follow = document.querySelector(`.followUp[data-row="${index}"]`); if (na) na.checked = status === 'N/A'; if (yes) yes.checked = status === 'YES'; if (follow) follow.value = data[`${prefix}_follow_up`] || ''; });
        ['positive','negative','suggestions'].forEach(type => { const cb = document.querySelector(`.feedbackCheck[data-feedback="${type}"]`); const summary = document.querySelector(`.feedbackSummary[data-feedback="${type}"]`); const action = document.querySelector(`.feedbackAction[data-feedback="${type}"]`); if (cb) cb.checked = Number(data[`${type}_feedback_checked`]) === 1; if (summary) summary.value = data[`${type}_feedback_summary`] || ''; if (action) action.value = data[`${type}_feedback_action`] || ''; });
        for (let i = 1; i <= 7; i++) { const value = data[`rec${i}_applicability`]; const yes = document.querySelector(`.recYes[data-rec="${i - 1}"]`); const na = document.querySelector(`.recNa[data-rec="${i - 1}"]`); if (yes) yes.checked = value === 'Yes'; if (na) na.checked = value === 'N/A'; }
        const other = document.querySelector('.footer-notes .paper-lines'); if (other) other.value = data.other_recommendations || '';
    }
    function resetForm() { document.querySelectorAll('input[type="text"], textarea').forEach(input => input.value = ''); document.querySelectorAll('input[type="checkbox"]').forEach(box => box.checked = false); }
    const draftManager = ReportDrafts.create({ storageKey: 'program_monitoring_form', collect: collectFormData, fill: fillForm, clear: resetForm });
    draftManager.checkDatabaseDraft();
    submitBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = draftManager.applySubmitMeta(collectFormData());

        try {
            const response = await fetch('post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (error) {
                throw new Error(text || 'Server returned an invalid response.');
            }

            if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed.');
            draftManager.completeSubmit();
            showSuccessBanner(result.message || 'Report submitted successfully!');
            resetForm();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
});
