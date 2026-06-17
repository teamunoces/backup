document.addEventListener('DOMContentLoaded', function() {
    const resubmitBtn = document.getElementById('resubmitBtn');
    
    if (resubmitBtn) {
        resubmitBtn.addEventListener('click', async function() {
            // Get report ID from URL
            const urlParams = new URLSearchParams(window.location.search);
            const reportId = urlParams.get('id');
            
            if (!reportId) {
                alert('No report ID found. Cannot resubmit.');
                return;
            }
            
            // Collect all form data
            const formData = collectFormData();
            
            if (!formData) {
                alert('Failed to collect form data.');
                return;
            }
            
            // Confirm resubmission
            const confirmed = confirm('Are you sure you want to resubmit this report? This will set the status back to "pending" for admin review.');
            
            if (!confirmed) {
                return;
            }
            
            // Show loading state
            resubmitBtn.disabled = true;
            resubmitBtn.textContent = 'Submitting...';
            
            try {
                const response = await fetch('update.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: reportId,
                        ...formData
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Report successfully resubmitted! Status set to pending.');
                    // Optional: redirect or reload
                    window.location.reload();
                } else {
                    alert('Failed to resubmit: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while resubmitting. Please try again.');
            } finally {
                resubmitBtn.disabled = false;
                resubmitBtn.textContent = 'Re-submit';
            }
        });
    }
    
    function collectFormData() {
        try {
            // Get header values
            const programTitle = document.getElementById('programTitle')?.value || '';
            const activityConducted = document.getElementById('activityConducted')?.value || '';
            const location = document.getElementById('location')?.value || '';
            const beneficiaries = document.getElementById('beneficiaries')?.value || '';
            const monitoringDate = document.getElementById('monitoringDate')?.value || '';
            const monitoredBy = document.getElementById('monitoredBy')?.value || '';
            
            // Collect issues and challenges (rows 0-7)
            const issuesData = {};
            const issueRows = document.querySelectorAll('#issuesTable tbody tr');
            
            // Define issue mappings
            const issueMappings = [
                'low_participation', 'resource_constraints', 'lack_coordination', 
                'cultural_barriers', 'sustainability', 'inadequate_monitoring', 
                'limited_training', 'mismanagement'
            ];
            
            for (let i = 0; i < 8 && i < issueRows.length; i++) {
                const row = issueRows[i];
                const naCheck = row.querySelector('.naCheck')?.checked || false;
                const yesCheck = row.querySelector('.yesCheck')?.checked || false;
                const followUp = row.querySelector('.followUp')?.value || '';
                
                const issueKey = issueMappings[i];
                issuesData[`issue${i+1}_status`] = naCheck ? 'N/A' : (yesCheck ? 'YES' : '');
                issuesData[`issue${i+1}_follow_up`] = followUp;
            }
            
            // Get other issues
            const otherIssues = document.getElementById('otherIssues')?.value || '';
            
            // Collect feedback data
            const positiveChecked = document.querySelector('.feedbackCheck[data-feedback="positive"]')?.checked || false;
            const positiveSummary = document.querySelector('.feedbackSummary[data-feedback="positive"]')?.value || '';
            const positiveAction = document.querySelector('.feedbackAction[data-feedback="positive"]')?.value || '';
            
            const negativeChecked = document.querySelector('.feedbackCheck[data-feedback="negative"]')?.checked || false;
            const negativeSummary = document.querySelector('.feedbackSummary[data-feedback="negative"]')?.value || '';
            const negativeAction = document.querySelector('.feedbackAction[data-feedback="negative"]')?.value || '';
            
            const suggestionsChecked = document.querySelector('.feedbackCheck[data-feedback="suggestions"]')?.checked || false;
            const suggestionsSummary = document.querySelector('.feedbackSummary[data-feedback="suggestions"]')?.value || '';
            const suggestionsAction = document.querySelector('.feedbackAction[data-feedback="suggestions"]')?.value || '';
            
            // Collect recommendations (rows 0-6)
            const recommendations = [];
            const recRows = document.querySelectorAll('#recommendationsTable tbody tr');
            
            for (let i = 0; i < 7 && i < recRows.length; i++) {
                const row = recRows[i];
                const recYes = row.querySelector('.recYes')?.checked || false;
                const recNa = row.querySelector('.recNa')?.checked || false;
                
                let applicability = '';
                if (recYes) applicability = 'Yes';
                if (recNa) applicability = 'N/A';
                
                recommendations.push(applicability);
            }
            
            // Get other recommendations
            const otherRecommendations = document.querySelector('.footer-notes .paper-lines')?.value || '';
            
            // Get admin feedback
            const adminFeedback = document.getElementById('admincomment')?.value || '';
            
            // Return complete form data
            return {
                program_title: programTitle,
                activity_conducted: activityConducted,
                location: location,
                beneficiaries: beneficiaries,
                monitoring_date: monitoringDate,
                monitored_by: monitoredBy,
                // Issues
                issue1_status: issuesData.issue1_status,
                issue1_follow_up: issuesData.issue1_follow_up,
                issue2_status: issuesData.issue2_status,
                issue2_follow_up: issuesData.issue2_follow_up,
                issue3_status: issuesData.issue3_status,
                issue3_follow_up: issuesData.issue3_follow_up,
                issue4_status: issuesData.issue4_status,
                issue4_follow_up: issuesData.issue4_follow_up,
                issue5_status: issuesData.issue5_status,
                issue5_follow_up: issuesData.issue5_follow_up,
                issue6_status: issuesData.issue6_status,
                issue6_follow_up: issuesData.issue6_follow_up,
                issue7_status: issuesData.issue7_status,
                issue7_follow_up: issuesData.issue7_follow_up,
                issue8_status: issuesData.issue8_status,
                issue8_follow_up: issuesData.issue8_follow_up,
                issue9_other_specify: otherIssues,
                // Feedback
                positive_feedback_checked: positiveChecked ? 1 : 0,
                positive_feedback_summary: positiveSummary,
                positive_feedback_action: positiveAction,
                negative_feedback_checked: negativeChecked ? 1 : 0,
                negative_feedback_summary: negativeSummary,
                negative_feedback_action: negativeAction,
                suggestions_feedback_checked: suggestionsChecked ? 1 : 0,
                suggestions_feedback_summary: suggestionsSummary,
                suggestions_feedback_action: suggestionsAction,
                // Recommendations
                rec1_applicability: recommendations[0] || '',
                rec2_applicability: recommendations[1] || '',
                rec3_applicability: recommendations[2] || '',
                rec4_applicability: recommendations[3] || '',
                rec5_applicability: recommendations[4] || '',
                rec6_applicability: recommendations[5] || '',
                rec7_applicability: recommendations[6] || '',
                other_recommendations: otherRecommendations,
                // Admin feedback
                feedback: adminFeedback
            };
        } catch (error) {
            console.error('Error collecting form data:', error);
            return null;
        }
    }
});