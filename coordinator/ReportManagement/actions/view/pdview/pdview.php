<?php
session_start();

$userName = $_SESSION['name'] ?? '';
$userDean = $_SESSION['dean'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Program Design";
$reportId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
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
    <title>Program Design Form - SMCC</title>
    <link rel="stylesheet" href="view.css">
    <link rel="stylesheet" href="darkmode.css">
</head>
<body>

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

        <!-- ACTION BUTTONS -->
                          <div class="buttons">
                                <button  onclick="printReport()">Print</button>
                                <!-- <button id="downloadPDF" type="button">Download PDF</button> -->
                            </div>
                            <div class="wrapper">
                                    <div class="admin-comment">
                                          <label for="admincomment" class="admin-comment-label" style="font-weight: bold;">Admin Feedback</label>
                                          <textarea id="admincomment" placeholder="Enter admin comments here..." rows="5"></textarea>
                                    </div>


    <div class="form-container">

        
                        
                      
        <header>
            <div class="header-content">
                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                 <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png" alt="CES logo" class="logo-left2">
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

        <h3 class="form-type">PROGRAM DESIGN FORM</h3>

        <div class="input-fields">
            <div class="field">
                <label>Department:</label>
                <input id="department" class="department" type="text" placeholder="Enter department">
            </div>
            <div class="field">
                <label>Title of Activity:</label>
                <input id="title_of_activity" class="title_of_activity" type="text" placeholder="Enter title of activity">
            </div>
            <div class="field">
                <label>Participants:</label>
                <input id="participants" class="participants" type="text" placeholder="Enter participants">
            </div>
            <div class="field">
                <label>Location:</label>
                <input id="location" class="location" type="text" placeholder="Enter location">
            </div>
        </div>
        <form class="table_form">
                <table class="program-table">
                    <thead>
                        <tr>
                            <th rowspan="2">Program Title</th>
                            <th rowspan="2">Objectives</th>
                            <th rowspan="2">Program Content and Activities</th>
                            <th colspan="3">Approach and Methodology</th>
                            <th colspan="2">Program Timeline and Milestones</th>
                            <th colspan="2">Resources Needed</th>
                            <th rowspan="2" class="narrow">Risk Management and Contingency Plans</th>
                            <th rowspan="2" class="narrow">Sustainability and Follow-up</th>
                            <th rowspan="2" class="narrow">Promotion & Awareness</th>
                        </tr>
                        <tr class="sub-header">
                            <th>Service Delivery</th>
                            <th>Partnerships and Stakeholders</th>
                            <th>Facilitators and Trainers</th>
                            <th>Program's Start and End Dates</th>
                            <th>Frequency of Activities</th>
                            <th>Community Material Resources and Financial Resources</th>
                            <th>School Material Resources and Financial Resources</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                            <td contenteditable="true"></td>
                        </tr>
                    </tbody>    
                
                </table>
        </form>

                   

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
              <td class="value"><p class="document_type">FM-DPM-SMCC-CES-04</p></td>
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




                    <!-- FOOTER -->
                    <footer>
                        <div class="footer-bottom">
                            <div class="footer-logos">
                                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                            </div>
                        </div>
                    </footer>



    
    </div>
    </div>

         <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
          <input type="hidden" id="currentReportType" value="<?php echo $reportType; ?>">

    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="./get.js" ></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="./download.js"></script>
    <script src="./darkmode.js"></script>
    <script src="./print.js?v=<?php echo time(); ?>"></script>

    

</body>
</html>