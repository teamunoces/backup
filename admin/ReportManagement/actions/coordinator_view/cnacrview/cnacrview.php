<?php
session_start();

$userName = $_SESSION['name'] ?? '';
$userDean = $_SESSION['dean'] ?? '';

$repottype = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Community Needs Assessment Consolidated Report";
$reportId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Needs Assessment Report</title>
    <link rel="stylesheet" href="cnacrview.css">
    <link rel="stylesheet" href="darkmode.css">

</head>
<body>



   <!-- HEADER -->
  <iframe src="/admin/Profile/profile.html" id="headerFrame" frameborder="0" scrolling="no" title="Header"></iframe>

  <!-- SIDEBAR -->
  <iframe src="/admin/Nav/navigation.html" id="sidebarFrame" frameborder="0" scrolling="no" title="Navigation Sidebar"></iframe>


                 
    <div class="report-container">

                                   <!-- ACTION BUTTONS -->
                        <div class="buttons">
                            <button  onclick="printReport()">Print this Page</button>
                            <button id="downloadPDF" type="button">Download PDF</button>
                        </div>

        <header>
            <div class="header-content">
                <img src="/coordinator/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <div class="college-info">
                    <h1>Saint Michael College of Caraga</h1>
                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                </div>
                <div class="logos-right">
                    <img src="/coordinator/ReportManagement/actions/images/ISOlogo.png" alt="SOCOTEC Logo">
                </div>
            </div>
            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
            <div class="double-line"></div>
        </header>



        <h1>COMMUNITY NEEDS ASSESSMENT CONSOLIDATED REPORT</h1>

        <div class="header-grid">
            <div class="label-box bg-gray">Department</div>
            <input type="text" name="department" id="department"  placeholder="Type here..." >
            <div class="label-box bg-gray">Date Submitted</div>
            <input type="text" name="date" id="date_submitted" placeholder="Type here..." >
        </div>

        <div class="section-content">
            <div class="form-group">
                <label>A. Community Needs Assessment Date of Conduct:</label>
                <div class="line-input">
                    <textarea name="date_conduct" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>

            <div class="form-group">
                <label>B. Participants:</label>
                <div class="line-input">
                    <textarea name="participants" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>

            <div class="form-group">
                <label>C. Location/Purok/district:</label>
                <div class="line-input">
                    <textarea name="location" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">I.</span> Community Needs Assessment Results:
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>A. Family Profile:</label>
                <div class="line-input">
                    <textarea name="family_profile" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>B. Community Concerns:</label>
               <div class="line-input">
                    <textarea name="community_concern" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>C. Other Identified Needs:</label>
                <div class="line-input">
                    <textarea name="other_identified_needs" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">II.</span> Identified Kabayani Major Institutional Programs and Prevailing Needs of the Community
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>1. Kabayani ng Panginoon</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_panginoon" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>2. Kabayani ng Kalikasan Kabayani ng Buhay</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_kalikasan" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
             <div class="form-group">
                <label>3. Kabayani ng Buhay</label>
                  <div class="line-input">
                    <textarea name="kabayani_ng_buhay" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>4. Kabayani ng Turismo</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_turismo" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>5. Kabayani ng Kultura –</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_kultura" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">III.</span> Outreach Program
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>Title of the Program:</label>
                <div class="line-input">
                    <textarea name="title_of_program" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Objectives:</label>
               <div class="line-input">
                    <textarea name="objectives" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Beneficiaries:</label>
                <div class="line-input">
                    <textarea name="beneficiaries" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">IV.</span> Allocation of Resources (Funds and Equipment Needed)
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>From the School:</label>
                <div class="line-input">
                    <textarea name="from_school" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>From the Community:</label>
               <div class="line-input">
                    <textarea name="from_community" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>



        
                                                <!-- APPROVAL SECTIONS -->
                        <!-- APPROVAL SECTIONS -->
                    <section class="approvals-container">
                        <div class="approval-row">
                            <div class="signature-group">
                            <div class="label">Prepared by:</div>
                            <div class="signature-line"><?php echo htmlspecialchars($userName); ?></div>
                            <div class="title bold">CES Coordinator</div>
                            </div>
                        </div>

                        <div class="label" style="margin-top: 20px;">Noted by:</div>
                        <div class="approval-row">
                            <div class="signature-group">
                            <div class="signature-line"><?php echo htmlspecialchars($userDean); ?></div>
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
              <td class="value"><p class="document_type">FM-DPM-SMCC-CES-02</p></td>
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

         
        

                    
                      <!--______________________________ footer___________________________ -->

                         <footer>
                            <div class="footer-bottom">
                                <div class="footer-logos">
                                    <img src="/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                                </div>
                            </div>
                        </footer>







    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function () {

            // Get ID from URL
            const params = new URLSearchParams(window.location.search);
            const reportId = params.get("id");

            if (reportId) {
                loadReportById(reportId);
            } else {
                console.error("No report ID in URL");
            }

        });
    </script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script src="./print.js"></script>
    <SCript src="./viewget.js"></SCript>
    <script src="/admin/ReportManagement/actions/js/getapproval.js"></script>
    <script src="./darkmode.js"></script>
    <script src="./download.js"></script>

</body>
</html>