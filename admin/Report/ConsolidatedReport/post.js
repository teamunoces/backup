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
        banner.style.letterSpacing = '0';
        banner.style.lineHeight = '1.4';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-10px)';
        banner.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        document.body.appendChild(banner);
    }

    banner.textContent = message;
    requestAnimationFrame(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0)';
    });

    clearTimeout(window.submissionSuccessBannerTimer);
    window.submissionSuccessBannerTimer = setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-10px)';
    }, 3500);
}

function fieldValue(selector) {
    return document.querySelector(selector)?.value || '';
}

function collectCnacr() {
    return {
        type: 'Community Needs Assessment Consolidated Report',
        department: fieldValue('#department'),
        date_submitted: fieldValue('#date_submitted'),
        date_conduct: fieldValue('[name="date_conduct"]'),
        participants: fieldValue('[name="participants"]'),
        location: fieldValue('[name="location"]'),
        family_profile: fieldValue('[name="family_profile"]'),
        community_concern: fieldValue('[name="community_concern"]'),
        other_identified_needs: fieldValue('[name="other_identified_needs"]'),
        kabayani_ng_panginoon: fieldValue('[name="kabayani_ng_panginoon"]'),
        kabayani_ng_kalikasan: fieldValue('[name="kabayani_ng_kalikasan"]'),
        kabayani_ng_buhay: fieldValue('[name="kabayani_ng_buhay"]'),
        kabayani_ng_turismo: fieldValue('[name="kabayani_ng_turismo"]'),
        kabayani_ng_kultura: fieldValue('[name="kabayani_ng_kultura"]'),
        title_of_program: fieldValue('[name="title_of_program"]'),
        objectives: fieldValue('[name="objectives"]'),
        beneficiaries: fieldValue('[name="beneficiaries"]'),
        from_school: fieldValue('[name="from_school"]'),
        from_community: fieldValue('[name="from_community"]')
    };
}

function setValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.value = value || '';
}

function fillCnacr(data) {
    setValue('#department', data.department);
    setValue('#date_submitted', data.date_submitted);
    setValue('[name="date_conduct"]', data.date_conduct);
    setValue('[name="participants"]', data.participants);
    setValue('[name="location"]', data.location);
    setValue('[name="family_profile"]', data.family_profile);
    setValue('[name="community_concern"]', data.community_concern);
    setValue('[name="other_identified_needs"]', data.other_identified_needs);
    setValue('[name="kabayani_ng_panginoon"]', data.kabayani_ng_panginoon);
    setValue('[name="kabayani_ng_kalikasan"]', data.kabayani_ng_kalikasan);
    setValue('[name="kabayani_ng_buhay"]', data.kabayani_ng_buhay);
    setValue('[name="kabayani_ng_turismo"]', data.kabayani_ng_turismo);
    setValue('[name="kabayani_ng_kultura"]', data.kabayani_ng_kultura);
    setValue('[name="title_of_program"]', data.title_of_program);
    setValue('[name="objectives"]', data.objectives);
    setValue('[name="beneficiaries"]', data.beneficiaries);
    setValue('[name="from_school"]', data.from_school);
    setValue('[name="from_community"]', data.from_community);
}

function clearCnacr() {
    document.querySelectorAll('textarea').forEach(field => {
        field.value = '';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const draftManager = ReportDrafts.create({
        storageKey: 'admin_cnacr',
        endpoint: 'post.php',
        collect: collectCnacr,
        fill: fillCnacr,
        clear: clearCnacr
    });

    draftManager.checkDatabaseDraft();

    document.querySelector('.submit-button')?.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();

        try {
            const response = await fetch('post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftManager.applySubmitMeta(collectCnacr()))
            });
            const responseText = await response.text();
            let result;

            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(responseText || 'Submission failed.');
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message || result.error || 'Submission failed.');
            }

            draftManager.completeSubmit();
            showSuccessBanner(result.message || 'Report submitted successfully!');
            clearCnacr();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
});
