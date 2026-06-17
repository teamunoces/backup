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
function selectedServices() { return Array.from(document.querySelectorAll('input[name="extension_services[]"]:checked')).map(cb => cb.value).filter(Boolean).join(', '); }
function setSelectedServices(value) { const values = String(value || '').split(',').map(v => v.trim()); document.querySelectorAll('input[name="extension_services[]"]').forEach(cb => cb.checked = values.includes(cb.value)); }
function collectReflection() {
    return {
        report_type: window.reportType || 'Monthly Accomplishment Report- Reflection Paper',
        beneficiary_name: document.getElementById('beneficiary_name')?.value || '',
        implementing_department: document.getElementById('implementing_department')?.value || '',
        extension_services: selectedServices(),
        answer_one: document.getElementById('answer_one')?.value || '',
        answer_two: document.getElementById('answer_two')?.value || '',
        answer_three: document.getElementById('answer_three')?.value || '',
        beneficiary_signature: document.getElementById('beneficiary_signature')?.value || ''
    };
}
function fillReflection(data) { ['beneficiary_name','implementing_department','answer_one','answer_two','answer_three','beneficiary_signature'].forEach(id => { const el = document.getElementById(id); if (el) el.value = data[id] || ''; }); setSelectedServices(data.extension_services); }
function clearReflection() { document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = ''); document.querySelectorAll('input[name="extension_services[]"]').forEach(cb => cb.checked = false); }
document.addEventListener('DOMContentLoaded', () => {
    const draftManager = ReportDrafts.create({ storageKey: 'reflection_paper', collect: collectReflection, fill: fillReflection, clear: clearReflection });
    draftManager.checkDatabaseDraft();
    document.querySelector('.submit-button')?.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = draftManager.applySubmitMeta(collectReflection());
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
            clearReflection();
        } catch (error) { alert(`Error: ${error.message}`); }
    });
});
