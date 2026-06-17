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
function field(id) { return document.getElementById(id); }
function collectCertificate() {
    return {
        report_type: window.reportType || 'Certificate of Appearance',
        participant: field('participant')?.value || field('name')?.value || '',
        cert_department: field('cert_department')?.value || '',
        activity_name: field('activity_name')?.value || '',
        location: field('location')?.value || '',
        date_held: field('date_held')?.value || '',
        month_held: field('month_held')?.value || '',
        year_held: field('year_held')?.value || '',
        location_two: field('location_two')?.value || '',
        monitored_by: field('monitored_by')?.value || '',
        verified_by: field('verified_by')?.value || '',
        feedback: ''
    };
}
function fillCertificate(data) {
    ['participant','cert_department','activity_name','location','date_held','month_held','year_held','location_two','monitored_by','verified_by'].forEach(id => {
        if (field(id)) field(id).value = data[id] || '';
    });
}
function clearCertificate() { document.querySelectorAll('input, textarea').forEach(el => el.value = ''); }
document.addEventListener('DOMContentLoaded', () => {
    const draftManager = ReportDrafts.create({ storageKey: 'certificate_of_appearance', collect: collectCertificate, fill: fillCertificate, clear: clearCertificate });
    draftManager.checkDatabaseDraft();
    document.querySelector('.submit-button')?.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const data = draftManager.applySubmitMeta(collectCertificate());
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
            clearCertificate();
        } catch (error) { alert(`Error: ${error.message}`); }
    });
});
