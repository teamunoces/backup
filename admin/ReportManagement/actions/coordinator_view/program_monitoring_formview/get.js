document.addEventListener('DOMContentLoaded', () => {
    // ========================
    // PAPER LINES TEXTAREA FUNCTIONS
    // ========================
    function autoExpand(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }

    function handleTab(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.substring(0, start) + "    " + e.target.value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
            autoExpand(e.target);
        }
    }

    function initializePaperLines() {
        const textareas = document.querySelectorAll('.paper-lines');
        textareas.forEach(el => {
            autoExpand(el);
            el.addEventListener('input', function() { autoExpand(this); });
            el.addEventListener('keydown', handleTab);
        });
    }

    // ========================
    // MUTUAL EXCLUSIVITY
    // ========================
    function setupMutualExclusion() {
        const naChecks = document.querySelectorAll('.naCheck');
        const yesChecks = document.querySelectorAll('.yesCheck');

        naChecks.forEach(naCheck => {
            naCheck.addEventListener('change', function() {
                if (this.checked) {
                    const rowId = this.getAttribute('data-row');
                    const correspondingYes = document.querySelector(`.yesCheck[data-row="${rowId}"]`);
                    if (correspondingYes) correspondingYes.checked = false;
                }
            });
        });

        yesChecks.forEach(yesCheck => {
            yesCheck.addEventListener('change', function() {
                if (this.checked) {
                    const rowId = this.getAttribute('data-row');
                    const correspondingNa = document.querySelector(`.naCheck[data-row="${rowId}"]`);
                    if (correspondingNa) correspondingNa.checked = false;
                }
            });
        });
    }

    function setupRecommendationExclusion() {
        const recYesList = document.querySelectorAll('.recYes');
        const recNaList = document.querySelectorAll('.recNa');

        recYesList.forEach(recYes => {
            recYes.addEventListener('change', function() {
                if (this.checked) {
                    const rowIdx = this.getAttribute('data-rec');
                    const sameRowNa = document.querySelector(`.recNa[data-rec="${rowIdx}"]`);
                    if (sameRowNa) sameRowNa.checked = false;
                }
            });
        });

        recNaList.forEach(recNa => {
            recNa.addEventListener('change', function() {
                if (this.checked) {
                    const rowIdx = this.getAttribute('data-rec');
                    const sameRowYes = document.querySelector(`.recYes[data-rec="${rowIdx}"]`);
                    if (sameRowYes) sameRowYes.checked = false;
                }
            });
        });
    }

    function setupFollowUpAutoFormat() {
        const followUpFields = document.querySelectorAll('.followUp');
        followUpFields.forEach(field => {
            field.addEventListener('input', function() {
                let val = this.value.toUpperCase();
                if (val === 'Y' || val === 'N' || val === 'YES' || val === 'NO') {
                    this.value = (val === 'Y' || val === 'YES') ? 'Y' : 'N';
                } else if (val.length > 1) {
                    this.value = val.charAt(0);
                }
            });
        });
    }

    // ========================
    // LOAD DATA FROM SERVER (GET)
    // ========================
    async function loadReportData() {
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');

        if (!reportId) {
            console.log('No ID parameter found. This is a new form.');
            return;
        }

        console.log('Loading report ID:', reportId);

        try {
            const response = await fetch(`get.php?id=${reportId}`);
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
    // POPULATE FORM WITH DATABASE DATA
    // ========================
    function populateForm(report) {
        console.log('Populating form with data:', report);

        // Populate header fields
        if (report.dean) document.getElementById('dean').textContent = report.dean;
        if (report.created_by_name) {document.getElementById('created_by').textContent = report.created_by_name;}
        if (report.feedback) document.getElementById('admincomment').value = report.feedback;
        if (report.program_title) document.getElementById('programTitle').value = report.program_title;
        if (report.activity_conducted) document.getElementById('activityConducted').value = report.activity_conducted;
        if (report.location) document.getElementById('location').value = report.location;
        if (report.beneficiaries) document.getElementById('beneficiaries').value = report.beneficiaries;
        if (report.monitoring_date) document.getElementById('monitoringDate').value = report.monitoring_date;
        if (report.monitored_by) document.getElementById('monitoredBy').value = report.monitored_by;
        
        // Admin feedback (if you have this column - I don't see it in your data)
        // If you have an admin_feedback column, uncomment:
        // if (report.admin_feedback) document.getElementById('admincomment').value = report.admin_feedback;

        // ========================
        // I. Issues and Challenges
        // ========================
        
        // Map database columns to row indices (0-7)
        const issueStatusMap = [
            { statusCol: 'issue1_low_participation_status', followUpCol: 'issue1_follow_up', row: 0 },
            { statusCol: 'issue2_resource_constraints_status', followUpCol: 'issue2_follow_up', row: 1 },
            { statusCol: 'issue3_lack_coordination_status', followUpCol: 'issue3_follow_up', row: 2 },
            { statusCol: 'issue4_cultural_barriers_status', followUpCol: 'issue4_follow_up', row: 3 },
            { statusCol: 'issue5_sustainability_status', followUpCol: 'issue5_follow_up', row: 4 },
            { statusCol: 'issue6_inadequate_monitoring_status', followUpCol: 'issue6_follow_up', row: 5 },
            { statusCol: 'issue7_limited_training_status', followUpCol: 'issue7_follow_up', row: 6 },
            { statusCol: 'issue8_mismanagement_status', followUpCol: 'issue8_follow_up', row: 7 }
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
            
            // Set checkbox status
            if (status === 'N/A') {
                if (naCheck) naCheck.checked = true;
            } else if (status === 'YES') {
                if (yesCheck) yesCheck.checked = true;
            }
            
            // Set follow-up value
            if (followUp && followUpValue && followUpValue !== 'null') {
                followUp.value = followUpValue;
            }
        });
        
        // Handle "Others" section
        if (report.issue9_other_specify) {
            const otherIssues = document.getElementById('otherIssues');
            if (otherIssues) {
                otherIssues.value = report.issue9_other_specify;
                autoExpand(otherIssues);
            }
        }
        
        // ========================
        // II. Participant Feedback
        // ========================
        
        // Positive Feedback
        const positiveChecked = report.positive_feedback_checked;
        const positiveSummary = report.positive_feedback_summary;
        const positiveAction = report.positive_feedback_action;
        
        if (positiveChecked === 1 || positiveChecked === '1' || positiveChecked === true) {
            const positiveCheckbox = document.querySelector('.feedbackCheck[data-feedback="positive"]');
            if (positiveCheckbox) positiveCheckbox.checked = true;
        }
        
        if (positiveSummary) {
            const positiveSummaryElem = document.querySelector('.feedbackSummary[data-feedback="positive"]');
            if (positiveSummaryElem) {
                positiveSummaryElem.value = positiveSummary;
                autoExpand(positiveSummaryElem);
            }
        }
        
        if (positiveAction) {
            const positiveActionElem = document.querySelector('.feedbackAction[data-feedback="positive"]');
            if (positiveActionElem) {
                positiveActionElem.value = positiveAction;
                autoExpand(positiveActionElem);
            }
        }
        
        // Negative Feedback
        const negativeChecked = report.negative_feedback_checked;
        const negativeSummary = report.negative_feedback_summary;
        const negativeAction = report.negative_feedback_action;
        
        if (negativeChecked === 1 || negativeChecked === '1' || negativeChecked === true) {
            const negativeCheckbox = document.querySelector('.feedbackCheck[data-feedback="negative"]');
            if (negativeCheckbox) negativeCheckbox.checked = true;
        }
        
        if (negativeSummary) {
            const negativeSummaryElem = document.querySelector('.feedbackSummary[data-feedback="negative"]');
            if (negativeSummaryElem) {
                negativeSummaryElem.value = negativeSummary;
                autoExpand(negativeSummaryElem);
            }
        }
        
        if (negativeAction) {
            const negativeActionElem = document.querySelector('.feedbackAction[data-feedback="negative"]');
            if (negativeActionElem) {
                negativeActionElem.value = negativeAction;
                autoExpand(negativeActionElem);
            }
        }
        
        // Suggestions Feedback
        const suggestionsChecked = report.suggestions_feedback_checked;
        const suggestionsSummary = report.suggestions_feedback_summary;
        const suggestionsAction = report.suggestions_feedback_action;
        
        if (suggestionsChecked === 1 || suggestionsChecked === '1' || suggestionsChecked === true) {
            const suggestionsCheckbox = document.querySelector('.feedbackCheck[data-feedback="suggestions"]');
            if (suggestionsCheckbox) suggestionsCheckbox.checked = true;
        }
        
        if (suggestionsSummary) {
            const suggestionsSummaryElem = document.querySelector('.feedbackSummary[data-feedback="suggestions"]');
            if (suggestionsSummaryElem) {
                suggestionsSummaryElem.value = suggestionsSummary;
                autoExpand(suggestionsSummaryElem);
            }
        }
        
        if (suggestionsAction) {
            const suggestionsActionElem = document.querySelector('.feedbackAction[data-feedback="suggestions"]');
            if (suggestionsActionElem) {
                suggestionsActionElem.value = suggestionsAction;
                autoExpand(suggestionsActionElem);
            }
        }
        
        // ========================
        // III. Actions to be taken (Recommendations)
        // ========================
        
        const recRows = document.querySelectorAll('#recommendationsTable tbody tr');
        
        // Map recommendation columns (rec1_applicability through rec7_applicability)
        for (let i = 1; i <= 7; i++) {
            const recCol = `rec${i}_applicability`;
            const applicability = report[recCol];
            const row = recRows[i - 1];
            
            if (row && applicability) {
                const recYes = row.querySelector('.recYes');
                const recNa = row.querySelector('.recNa');
                
                if (applicability === 'Yes' && recYes) {
                    recYes.checked = true;
                } else if (applicability === 'N/A' && recNa) {
                    recNa.checked = true;
                }
            }
        }
        
        // Other Recommendations
        if (report.other_recommendations) {
            const otherRecTextarea = document.querySelector('.footer-notes .paper-lines');
            if (otherRecTextarea) {
                otherRecTextarea.value = report.other_recommendations;
                autoExpand(otherRecTextarea);
            }
        }
        
        // Auto-expand all textareas after populating
        document.querySelectorAll('textarea').forEach(textarea => {
            autoExpand(textarea);
        });

        
        
        console.log('Form population complete!');

         // Inside your populateForm(report) function:

                // When setting checkboxes, do NOT use .disabled = true
                if (status === 'N/A') {
                    if (naCheck) naCheck.checked = true;
                } else if (status === 'YES') {
                    if (yesCheck) yesCheck.checked = true;
                }

                // Ensure no script is accidentally disabling them
                const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
                allCheckboxes.forEach(cb => {
                    cb.disabled = false; // Keep them "enabled" so they stay high-contrast
                    // Additional safety: stop keyboard toggling
                    cb.tabIndex = -1; 
                });
    }

    // Auto-expand for textareas
    const textareas = document.querySelectorAll('.feedbackSummary, .feedbackAction, #otherIssues, .paper-lines');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        if (textarea.value) {
            setTimeout(() => {
                textarea.style.height = (textarea.scrollHeight) + 'px';
            }, 100);
        }
    });

    function initialize() {
        setupMutualExclusion();
        setupRecommendationExclusion();
        setupFollowUpAutoFormat();
        initializePaperLines();
        
        // Load existing data if ID is present
        loadReportData();
    }

    initialize();
});