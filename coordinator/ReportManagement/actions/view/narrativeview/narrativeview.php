<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Monthly Accomplishment Report- Narrative Report";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    <title>Monthly Accomplishment Report Form</title>
    <link rel="stylesheet" href="narrative.css">
    <link rel="stylesheet" href="darkmode.css">
</head>
<body>
    <!-- Header -->
    <iframe 
        src="http://localhost/SYSTEM_VERSION_!/coordinator/Profile/profile.html"
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>

    <!-- Sidebar -->
    <iframe 
        src="http://localhost/SYSTEM_VERSION_!/coordinator/Sidebar/sidebar.html"
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>

                            <div class="buttons">
                                <button  onclick="printReport()">Print</button>
                                <!-- <button id="downloadPDF" type="button">Download PDF</button> -->
                            </div>

                                <div class="wrapper">
                                    <div class="admin-comment">
                                          <label for="admincomment" class="admin-comment-label" style="font-weight: bold;">Admin Feedback</label>
                                          <textarea id="admincomment" rows="5" readonly></textarea>
                                    </div>
                                </div>


    <div class="report-container">
        <header>
            <div class="header-content">
                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                 <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png" alt="CES logo" class="logo-left">
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
            <h1>MONTHLY ACCOMPLISHMENT REPORT- NARRATIVE REPORT</h1>
        </header>

        <form id="narrativeForm">
            <ol class="report-list">
                <li>
                    <label class="label">Narrate Success</label> 
                    <textarea class="line-input dynamic-textarea" id="narrate_success" ></textarea>
                </li>
                <li>
                    <label class="label">Provide Data</label> 
                    <textarea class="line-input dynamic-textarea" id="provide_data" ></textarea>
                </li>
                <li>
                    <label class="label">Identify Problems</label> 
                    <textarea class="line-input dynamic-textarea" id="identify_problems" ></textarea>
                </li>
                <li>
                    <label class="label">Propose Solutions</label> 
                    <textarea class="line-input dynamic-textarea" id="propose_solutions"></textarea>
                </li>
            </ol>
        

                                <!-- APPROVAL SECTIONS -->
                    <section class="approvals-container">
                        <div class="approval-row">
                            <div class="signature-group">
                            <div class="label">Prepared by:</div>
                           <div class="signature-line" id="created_by_name"></div>
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
                            <td class="value"><p class="document_type">FM-DPM-SMCC-CES-05A</p></td>
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

                      </form>

        <footer>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                </div>
            </div>
        </footer>

    </div>
    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="./expand.js"></script>
    <script src="./get.js"></script>
    <script src="./download.js"></script>
    <script src="./darkmode.js"></script>
    <script src="./print.js"></script>
</body>
</html>