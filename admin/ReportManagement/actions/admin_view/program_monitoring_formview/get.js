document.addEventListener('DOMContentLoaded', () => {
    // ========================
    // SAFE SETTER FUNCTIONS
    // ========================
    function setValue(id, value) {
        const el = document.getElementById(id);
        if (!el || value === undefined || value === null) return;
        el.value = value;
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (!el || value === undefined || value === null) return;
        el.textContent = value;
    }

    function formatNameWithSuffix(name, suffix) {
        const cleanName = String(name || '').trim();
        const cleanSuffix = String(suffix || '').trim();

        if (!cleanName) return cleanSuffix;
        if (!cleanSuffix) return cleanName;
        return `${cleanName}, ${cleanSuffix}`;
    }

    function setInputByName(name, value) {
        const el = document.querySelector(`input[name="${name}"]`);
        if (!el) return;
        el.value = value || '';
    }

    function displayApprovalDocumentInfo(report) {
        if (!report) return;

        setText('dean', report.dean || '');
        setText('ces_head', formatNameWithSuffix(report.ces_head, report.ces_head_suffix));
        setText('vp_acad', formatNameWithSuffix(report.vp_acad, report.vp_acad_suffix));
        setText('vp_admin', formatNameWithSuffix(report.vp_admin, report.vp_admin_suffix));
        setText('school_president', formatNameWithSuffix(report.school_president, report.school_president_suffix));
        setInputByName('issue_status', report.issue_status);
        setInputByName('revision_number', report.revision_number);
        setInputByName('date_effective', report.date_effective);
        setInputByName('approved_by', report.approved_by);
    }

    function setCheckbox(selector, checked) {
        const el = document.querySelector(selector);
        if (!el) return;
        el.checked = checked;
    }

    // ========================
    // TEXTAREA AUTO EXPAND
    // ========================
    function autoExpand(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    function handleTab(e) {
        if (e.key === 'Tab') {
            e.preventDefault();

            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            e.target.value =
                e.target.value.substring(0, start) +
                '    ' +
                e.target.value.substring(end);

            e.target.selectionStart = e.target.selectionEnd = start + 4;
            autoExpand(e.target);
        }
    }

    function initializeTextareas() {
        document
            .querySelectorAll('textarea, .paper-lines, .feedbackSummary, .feedbackAction, #otherIssues')
            .forEach(textarea => {
                autoExpand(textarea);
                textarea.addEventListener('input', function () {
                    autoExpand(this);
                });
                textarea.addEventListener('keydown', handleTab);
            });
    }

    // ========================
    // MUTUAL EXCLUSIVITY
    // ========================
    function setupMutualExclusion() {
        document.querySelectorAll('.naCheck').forEach(naCheck => {
            naCheck.addEventListener('change', function () {
                if (this.checked) {
                    const rowId = this.getAttribute('data-row');
                    const yesCheck = document.querySelector(`.yesCheck[data-row="${rowId}"]`);
                    if (yesCheck) yesCheck.checked = false;
                }
            });
        });

        document.querySelectorAll('.yesCheck').forEach(yesCheck => {
            yesCheck.addEventListener('change', function () {
                if (this.checked) {
                    const rowId = this.getAttribute('data-row');
                    const naCheck = document.querySelector(`.naCheck[data-row="${rowId}"]`);
                    if (naCheck) naCheck.checked = false;
                }
            });
        });
    }

    function setupRecommendationExclusion() {
        document.querySelectorAll('.recYes').forEach(recYes => {
            recYes.addEventListener('change', function () {
                if (this.checked) {
                    const rowId = this.getAttribute('data-rec');
                    const recNa = document.querySelector(`.recNa[data-rec="${rowId}"]`);
                    if (recNa) recNa.checked = false;
                }
            });
        });

        document.querySelectorAll('.recNa').forEach(recNa => {
            recNa.addEventListener('change', function () {
                if (this.checked) {
                    const rowId = this.getAttribute('data-rec');
                    const recYes = document.querySelector(`.recYes[data-rec="${rowId}"]`);
                    if (recYes) recYes.checked = false;
                }
            });
        });
    }

    function setupFollowUpAutoFormat() {
        document.querySelectorAll('.followUp').forEach(field => {
            field.addEventListener('input', function () {
                let val = this.value.toUpperCase();

                if (val === 'Y' || val === 'YES') {
                    this.value = 'Y';
                } else if (val === 'N' || val === 'NO') {
                    this.value = 'N';
                } else if (val.length > 1) {
                    this.value = val.charAt(0);
                }
            });
        });
    }

    // ========================
    // LOAD REPORT DATA
    // ========================
    async function loadReportData() {
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');

        if (!reportId) {
            console.log('No report ID found.');
            return;
        }

        try {
            const response = await fetch(`get.php?id=${encodeURIComponent(reportId)}`);

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            if (result.success && result.report) {
                populateForm(result.report);
            } else {
                console.error('Failed to load report:', result.message);
                alert('Could not load report: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error loading report:', error);
            alert('Error loading report data. Please check your connection.');
        }
    }

    // ========================
    // POPULATE FORM
    // ========================
    function populateForm(report) {
        console.log('Populating form:', report);

        // Optional fields - safe even if IDs do not exist
        setText('created_by', report.created_by_name);
        setValue('admincomment', report.feedback);
        displayApprovalDocumentInfo(report);

        // Header fields
        setValue('programTitle', report.program_title);
        setValue('activityConducted', report.activity_conducted);
        setValue('location', report.location);
        setValue('beneficiaries', report.beneficiaries);
        setValue('monitoringDate', report.monitoring_date);
        setValue('monitoredBy', report.monitored_by);

        // ========================
        // I. Issues and Challenges
        // ========================
        const issueStatusMap = [
            {
                statusCol: 'issue1_low_participation_status',
                followUpCol: 'issue1_follow_up',
                row: 0
            },
            {
                statusCol: 'issue2_resource_constraints_status',
                followUpCol: 'issue2_follow_up',
                row: 1
            },
            {
                statusCol: 'issue3_lack_coordination_status',
                followUpCol: 'issue3_follow_up',
                row: 2
            },
            {
                statusCol: 'issue4_cultural_barriers_status',
                followUpCol: 'issue4_follow_up',
                row: 3
            },
            {
                statusCol: 'issue5_sustainability_status',
                followUpCol: 'issue5_follow_up',
                row: 4
            },
            {
                statusCol: 'issue6_inadequate_monitoring_status',
                followUpCol: 'issue6_follow_up',
                row: 5
            },
            {
                statusCol: 'issue7_limited_training_status',
                followUpCol: 'issue7_follow_up',
                row: 6
            },
            {
                statusCol: 'issue8_mismanagement_status',
                followUpCol: 'issue8_follow_up',
                row: 7
            }
        ];

        const issueRows = document.querySelectorAll('#issuesTable tbody tr');

        issueStatusMap.forEach(issue => {
            const row = issueRows[issue.row];
            if (!row) return;

            const status = report[issue.statusCol];
            const followUpValue = report[issue.followUpCol];

            const naCheck = row.querySelector('.naCheck');
            const yesCheck = row.querySelector('.yesCheck');
            const followUp = row.querySelector('.followUp');

            if (status === 'N/A') {
                if (naCheck) naCheck.checked = true;
                if (yesCheck) yesCheck.checked = false;
            } else if (status === 'YES' || status === 'Yes') {
                if (yesCheck) yesCheck.checked = true;
                if (naCheck) naCheck.checked = false;
            }

            if (
                followUp &&
                followUpValue !== undefined &&
                followUpValue !== null &&
                followUpValue !== 'null'
            ) {
                followUp.value = followUpValue;
            }
        });

        const otherIssues = document.getElementById('otherIssues');
        if (otherIssues && report.issue9_other_specify) {
            otherIssues.value = report.issue9_other_specify;
            autoExpand(otherIssues);
        }

        // ========================
        // II. Participant Feedback
        // ========================
        const feedbackTypes = [
            {
                key: 'positive',
                checked: 'positive_feedback_checked',
                summary: 'positive_feedback_summary',
                action: 'positive_feedback_action'
            },
            {
                key: 'negative',
                checked: 'negative_feedback_checked',
                summary: 'negative_feedback_summary',
                action: 'negative_feedback_action'
            },
            {
                key: 'suggestions',
                checked: 'suggestions_feedback_checked',
                summary: 'suggestions_feedback_summary',
                action: 'suggestions_feedback_action'
            }
        ];

        feedbackTypes.forEach(item => {
            const checkedValue = report[item.checked];

            if (checkedValue === 1 || checkedValue === '1' || checkedValue === true) {
                setCheckbox(`.feedbackCheck[data-feedback="${item.key}"]`, true);
            }

            const summaryEl = document.querySelector(`.feedbackSummary[data-feedback="${item.key}"]`);
            if (summaryEl && report[item.summary]) {
                summaryEl.value = report[item.summary];
                autoExpand(summaryEl);
            }

            const actionEl = document.querySelector(`.feedbackAction[data-feedback="${item.key}"]`);
            if (actionEl && report[item.action]) {
                actionEl.value = report[item.action];
                autoExpand(actionEl);
            }
        });

        // ========================
        // III. Recommendations
        // ========================
        const recRows = document.querySelectorAll('#recommendationsTable tbody tr');

        for (let i = 1; i <= 7; i++) {
            const applicability = report[`rec${i}_applicability`];
            const row = recRows[i - 1];

            if (!row || !applicability) continue;

            const recYes = row.querySelector('.recYes');
            const recNa = row.querySelector('.recNa');

            if (applicability === 'Yes' || applicability === 'YES') {
                if (recYes) recYes.checked = true;
                if (recNa) recNa.checked = false;
            } else if (applicability === 'N/A') {
                if (recNa) recNa.checked = true;
                if (recYes) recYes.checked = false;
            }
        }

        const otherRec = document.getElementById('other_recommendations');
        if (otherRec && report.other_recommendations) {
            otherRec.value = report.other_recommendations;
            autoExpand(otherRec);
        }

        // Keep checkboxes visible/high contrast
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.disabled = false;
            cb.tabIndex = -1;
            cb.addEventListener('click', e => e.preventDefault());
        });

        // Auto expand all textareas after data load
        document.querySelectorAll('textarea').forEach(textarea => {
            autoExpand(textarea);
        });

        console.log('Form population complete.');
    }

    // ========================
    // INITIALIZE
    // ========================
    function initialize() {
        setupMutualExclusion();
        setupRecommendationExclusion();
        setupFollowUpAutoFormat();
        initializeTextareas();
        loadReportData();
    }

    initialize();
});
