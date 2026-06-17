<?php
session_start();

$userName = $_SESSION['name'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Program Monitoring Form";
$reportId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <style id="anti-fouc">
    html,
    body {
        margin: 0;
        min-height: 100%;
        background-color: #f4f7f9;
    }

    #headerFrame {
        background-color: #ffffff;
    }

    #sidebarFrame {
        background-color: #254911;
    }
</style>
    <title>Program Monitoring Form</title>
    <link rel="stylesheet" href="pmf.css">
    <link rel="stylesheet" href="darkmode.css">
</head>
<body>


  <!-- Header -->
   <iframe 
          src="http://localhost/SYSTEM_VERSION_!/admin/Profile/profile.html"
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>

    <!-- Sidebar -->
    <iframe 
       src="http://localhost/SYSTEM_VERSION_!/admin/Nav/navigation.html" 
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>


                            <div class="buttons">
                                <button  onclick="printReport()">Print</button>
                               <!--  <button id="downloadPDF" type="button">Download PDF</button>-->
                            </div>
                            <div class="wrapper">
                                    <div class="admin-comment">
                                          <label for="admincomment" class="admin-comment-label" style="font-weight: bold;">Admin Feedback</label>
                                          <textarea id="admincomment" placeholder="Enter admin comments here..." rows="5"></textarea>
                                    </div>
                            </div>
        
    <div class="form-container">

          <header>
            <div class="header-content">
                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png" alt="CES Logo" class="logo-left2">
                <div class="college-info">
                    <h1>Saint Michael College of Caraga</h1>
                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                </div>
                <div class="logos-right">
                    <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/ISOlogo.png" alt="SOCOTEC Logo">
                </div>
            </div>
            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
            <div class="double-line"></div>
        </header>



        <header>
            <h2>Program Monitoring Form</h2>
            <div class="header-info">
                <div class="input-group">
                    <label>Program Title:</label>
                    <input type="text" id="programTitle" readonly >
                </div>
                <div class="input-group">
                    <label>Activity Conducted:</label>
                    <input type="text" id="activityConducted" readonly>
                </div>
                <div class="input-group">
                    <label>Location:</label>
                    <input type="text" id="location" readonly>
                </div>
                <div class="input-group">
                    <label>Beneficiaries:</label>
                    <input type="text" id="beneficiaries" readonly>
                </div>
                <div class="input-group">
                    <label>Date of Monitoring:</label>
                    <input type="text" id="monitoringDate" readonly>
                </div>
                <div class="input-group">
                    <label>Monitored by:</label>
                    <input type="text" id="monitoredBy" readonly>
                </div>
            </div>
        </header>

        <section>
            <h3>I. Issues and Challenges</h3>
            <table id="issuesTable">
                <thead>
                    <tr>
                        <th style="width: 40px;">N/A</th>
                        <th style="width: 40px;">YES</th>
                        <th>INDICATOR</th>
                        <th style="width: 100px;">FOLLOW-UP REQUIRED (Y/N)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="0" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="0" readonly></td>
                        <td><strong>Low Participation and Engagement:</strong> Lack of awareness or interest in CES activities.</td>
                        <td><input type="text" class="followUp" data-row="0" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="1" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="1" readonly></td>
                        <td><strong>Resource Constraints:</strong> Insufficient funding, manpower, and infrastructure.</td>
                        <td><input type="text" class="followUp" data-row="1" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="2" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="2" readonly></td>
                        <td><strong>Lack of Proper Coordination:</strong> Poor communication between stakeholders and misalignment of goals.</td>
                        <td><input type="text" class="followUp" data-row="2" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="3" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="3" readonly></td>
                        <td><strong>Cultural and Social Barriers:</strong> Resistance to change and difficulties in reaching marginalized groups.</td>
                        <td><input type="text" class="followUp" data-row="3" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="4" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="4" readonly></td>
                        <td><strong>Sustainability Challenges:</strong> Short-term programs without long-term support or resources.</td>
                        <td><input type="text" class="followUp" data-row="4" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="5" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="5" readonly></td>
                        <td><strong>Inadequate Monitoring and Evaluation:</strong> Difficulty in tracking progress or measuring impact.</td>
                        <td><input type="text" class="followUp" data-row="5" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="6" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="6" readonly></td>
                        <td><strong>Limited Training and Capacity Building:</strong> Lack of training and opportunities for beneficiaries to grow.</td>
                        <td><input type="text" class="followUp" data-row="6" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td class="checkbox-cell"><input type="checkbox" class="naCheck" data-row="7" readonly></td>
                        <td class="checkbox-cell"><input type="checkbox" class="yesCheck" data-row="7" readonly></td>
                        <td><strong>Mismanagement or Corruption:</strong> Misuse of resources or lack of transparency.</td>
                        <td><input type="text" class="followUp" data-row="7" placeholder="" maxlength="1" readonly></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="center-text"><strong>Others (Pls. Specify)</strong></td>
                        <td colspan="2">
                            <textarea id="otherIssues" 
                                      class="auto-expand" 
                                      rows="1"></textarea>
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section>
            <h3>II. Participant/s Feedback</h3>
            <table id="feedbackTable">
                <thead>
                    <tr>
                        <th style="width: 200px;">Feedback Type <br><small>(Please tick the box that corresponds to your answer)</small></th>
                        <th>Feedback Summary</th>
                        <th>Actions to Improve</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="checkbox" class="feedbackCheck" data-feedback="positive"> Positive Feedback</td>
                        <td><textarea class="feedbackSummary" data-feedback="positive" rows="2"></textarea></td>
                        <td><textarea class="feedbackAction" data-feedback="positive" rows="2" ></textarea></td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="feedbackCheck" data-feedback="negative"> Negative Feedback</td>
                        <td><textarea class="feedbackSummary" data-feedback="negative" rows="2" ></textarea></td>
                        <td><textarea class="feedbackAction" data-feedback="negative" rows="2" ></textarea></td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="feedbackCheck" data-feedback="suggestions"> Suggestions for Improvement</td>
                        <td><textarea class="feedbackSummary" data-feedback="suggestions" rows="2" ></textarea></td>
                        <td><textarea class="feedbackAction" data-feedback="suggestions" rows="2" ></textarea></td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section>
            <h3>III. Actions to be taken for Next Activity:</h3>
            <table id="recommendationsTable">
                <thead>
                    <tr>
                        <th style="width: 120px;">Applicability</th>
                        <th>Recommendation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="0"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="0"> N/A</td>
                        <td>Raise awareness using local leaders and social media to highlight the benefits of participation.</td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="1"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="1"> N/A</td>
                        <td>Diversify funding through grants, local businesses, and crowdfunding for long-term support.</td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="2"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="2"> N/A</td>
                        <td>Define roles clearly and use regular meetings or digital tools to stay aligned.</td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="3"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="3"> N/A</td>
                        <td>Involve the community in planning to ensure activities are culturally sensitive and inclusive.</td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="4"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="4"> N/A</td>
                        <td>Secure ongoing funding, train local leaders, and build partnerships for long-term support.</td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="5"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="5"> N/A</td>
                        <td>Set clear goals and gather feedback to track progress and adjust activities.</td>
                    </tr>
                    <tr>
                        <td><input type="checkbox" class="recYes" data-rec="6"> yes &nbsp; <input type="checkbox" class="recNa" data-rec="6"> N/A</td>
                        <td>Offer continuous training to build skills and empower community members to lead.</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer-notes">
                <p><strong>Other Recommendation/s Please Specify:</strong></p>
               <textarea name="other_identified_needs" class="paper-lines" id="other_recommendations" rows="1" readonly></textarea>
            </div>
        </section>


        <!-- APPROVAL SECTIONS -->
                    <section class="approvals-container">
                        <div class="approval-row">
                            <div class="signature-group">
                            <div class="label">Prepared by:</div>
                            <div class="signature-line" id="created_by"></div>
                            <div class="title bold">CES Coordinator</div>
                            </div>
                        </div>

                        <div class="label" style="margin-top: 20px;">Noted by:</div>
                        <div class="approval-row">
                            <div class="signature-group">
                             <div class="signature-line" id="dean"></div>
                            <div class="title bold">Dean</div>
                            </div>
                            <div class="signature-group">
                            <div class="signature-line" id="ces_head"></div>
                            <div class="title bold">CES Head</div>
                            </div>
                        </div>

                        <div class="approval-centered" style="margin-top: 40px;">
                            <div class="label left-align">Recommending Approval:</div>
                            <div class="admin-block">
                            <div class="name-underlined" id="vp_acad"></div>
                            <div class="title bold">Vice-President for Academic Affairs and Research</div>
                            </div>
                            <div class="admin-block">
                            <div class="name-underlined"id="vp_admin" ></div>
                            <div class="title bold">Vice-President for Administrative Affairs</div>
                            </div>
                        </div>

                        <div class="approval-centered">
                            <div class="label left-align">Approved by:</div>
                            <div class="admin-block">
                            <div class="name-underlined"id="school_president"></div>
                            <div class="title bold">School President</div>
                            </div>
                        </div>
                        </section>





        <!-- DOCUMENT INFORMATION -->
        <section class="document-info">
          <table class="doc-header">
            <tr>
              <td class="label">Form Code No.</td><td>:</td>
              <td class="value"><p class="document_type">FM-DPM-SMCC-CES-06</p></td>
            </tr>
            <tr>
              <td class="label">Issue Status</td><td>:</td>
              <td class="value"><input type="text" name="issue_status" disabled></td>
            </tr>
            <tr>
              <td class="label">Revision No.</td><td>:</td>
              <td class="value"><input type="text" name="revision_number" disabled></td>
            </tr>
            <tr>
              <td class="label">Date Effective</td><td>:</td>
              <td class="value"><input type="text" name="date_effective" disabled></td>
            </tr>
            <tr>
              <td class="label">Approved By</td><td>:</td>
              <td class="value"><input type="text" name="approved_by" disabled></td>
            </tr>
          </table>
        </section>

      

        <footer>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                </div>
            </div>
        </footer>

    </div>
    
    

    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="./get.js"></script>
 <script src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/js/getapproval.js"></script>
 <script src="./download.js"></script>
 <script src="./darkmode.js"></script>
 <script src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/view/pmfview/print.js"></script>

</body>
</html>