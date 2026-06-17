function showSuccessBanner(message = 'Report submitted successfully!') {
    let banner = document.getElementById('submissionSuccessBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'submissionSuccessBanner';
        banner.setAttribute('role', 'status');
        banner.style.position = 'fixed';
        banner.style.top = '78px';
        banner.style.right = '24px';
        banner.style.zIndex = '10000';
        banner.style.maxWidth = '420px';
        banner.style.padding = '14px 18px';
        banner.style.borderRadius = '8px';
        banner.style.background = 'linear-gradient(135deg, #59AF29 0%, #254911 100%)';
        banner.style.color = '#ffffff';
        banner.style.boxShadow = '0 10px 24px rgba(37, 73, 17, 0.28)';
        banner.style.fontFamily = 'Inter, Segoe UI, Arial, sans-serif';
        banner.style.fontSize = '14px';
        banner.style.fontWeight = '700';
        banner.style.lineHeight = '1.4';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-10px)';
        banner.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        document.body.appendChild(banner);
    }
    banner.textContent = message;
    requestAnimationFrame(() => { banner.style.opacity = '1'; banner.style.transform = 'translateY(0)'; });
    clearTimeout(window.submissionSuccessBannerTimer);
    window.submissionSuccessBannerTimer = setTimeout(() => { banner.style.opacity = '0'; banner.style.transform = 'translateY(-10px)'; }, 3500);
}
function collectNarrative() {
    const params = new URLSearchParams(window.location.search);
    return {
        type: params.get('type') || window.reportType || 'Monthly Accomplishment Report- Narrative Report',
        narrate_success: document.getElementById('narrate_success')?.value || '',
        provide_data: document.getElementById('provide_data')?.value || '',
        identify_problems: document.getElementById('identify_problems')?.value || '',
        propose_solutions: document.getElementById('propose_solutions')?.value || ''
    };
}
function fillNarrative(data) { ['narrate_success','provide_data','identify_problems','propose_solutions'].forEach(id => { const el = document.getElementById(id); if (el) el.value = data[id] || ''; }); }
function clearNarrative() { document.getElementById('narrativeForm')?.reset(); }
document.addEventListener('DOMContentLoaded', () => {
    const draftManager = ReportDrafts.create({ storageKey: 'narrative_report', collect: collectNarrative, fill: fillNarrative, clear: clearNarrative });
    draftManager.checkDatabaseDraft();
    document.querySelector('.submit-button')?.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = draftManager.applySubmitMeta(collectNarrative());
        try {
            const response = await fetch('post.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(responseText || 'Submission failed.');
            }
            if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed.');
            draftManager.completeSubmit();
            showSuccessBanner(result.message || 'Report submitted successfully!');
            clearNarrative();
        } catch (error) { alert(`Error: ${error.message}`); }
    });
});
