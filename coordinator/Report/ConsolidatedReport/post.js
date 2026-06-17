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
const cnacrSelectors = {
    department: '#department', date_submitted: '#date_submitted', date_conduct: '[name="date_conduct"]', participants: '[name="participants"]', location: '[name="location"]', family_profile: '[name="family_profile"]', community_concern: '[name="community_concern"]', other_identified_needs: '[name="other_identified_needs"]', kabayani_ng_panginoon: '[name="kabayani_ng_panginoon"]', kabayani_ng_kalikasan: '[name="kabayani_ng_kalikasan"]', kabayani_ng_buhay: '[name="kabayani_ng_buhay"]', kabayani_ng_turismo: '[name="kabayani_ng_turismo"]', kabayani_ng_kultura: '[name="kabayani_ng_kultura"]', title_of_program: '[name="title_of_program"]', objectives: '[name="objectives"]', beneficiaries: '[name="beneficiaries"]', from_school: '[name="from_school"]', from_community: '[name="from_community"]'
};
function collectCnacr() {
    const data = { type: document.querySelector('[name="report_type"]')?.value || window.reportType || 'Community Needs Assessment Report' };
    Object.entries(cnacrSelectors).forEach(([key, selector]) => data[key] = document.querySelector(selector)?.value || '');
    return data;
}
function fillCnacr(data) { Object.entries(cnacrSelectors).forEach(([key, selector]) => { const el = document.querySelector(selector); if (el) el.value = data[key] || ''; }); }
function clearCnacr() { document.querySelectorAll('textarea, input[type="text"]').forEach(field => field.value = ''); }
async function submitReport(event) {
    if (event) event.preventDefault();
    if (event) event.stopPropagation();
    const data = window.cnacrDraftManager.applySubmitMeta(collectCnacr());
    try {
        const response = await fetch('post.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || result.error || 'Submission failed.');
        window.cnacrDraftManager.completeSubmit();
        showSuccessBanner(result.message || 'Report submitted successfully!');
        clearCnacr();
    } catch (error) { alert(`Error: ${error.message}`); }
}
document.addEventListener('DOMContentLoaded', () => {
    window.cnacrDraftManager = ReportDrafts.create({ storageKey: 'cnacr', collect: collectCnacr, fill: fillCnacr, clear: clearCnacr });
    window.cnacrDraftManager.checkDatabaseDraft();
    document.querySelector('.submit-button')?.addEventListener('click', submitReport);
});
