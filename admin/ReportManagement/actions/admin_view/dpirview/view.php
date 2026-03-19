<?php
session_start();
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "departmental planned initiative report";
$reportId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
// These should be set when user logs in
$userName = $_SESSION['name'] ?? '';
$userDepartment = $_SESSION['department'] ?? '';
$report_Type = 'departmental planned initiative report'; // or whatever your report type is
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Departmental Planned Initiative Report</title>
    <link rel="stylesheet" href="view.css">
</head>
<body>


       <!-- Header -->
   <iframe 
        src="/admin/Profile/profile.html" 
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>

    <!-- Sidebar -->
    <iframe 
        src="/admin/Nav/navigation.html" 
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>

  <!-- ACTION BUTTONS -->
                          <div class="buttons">
                            <button onclick="window.print()">Print this Page</button>
                            <button id="downloadPDF" class="btn-download" type="button">Download PDF</button>
                          </div>

     

    <div class="report-container">

        <!-- Header -->

       <header>
            <div class="header-content">
                <img src="/admin/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <div class="college-info">
                    <h1>Saint Michael College of Caraga</h1>
                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                </div>
                <div class="logos-right">
                    <img src="/admin/ReportManagement/actions/images/ISOlogo.png" alt="SOCOTEC Logo">
                </div>
            </div>
            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
            <div class="double-line"></div>
        </header>


                        <!---- main report----->

        <h1>DEPARTMENTAL PLANNED INTIATIVE REPORT</h1>

        <table class="header-table">
            <tr>
                <td class="label-cell">Department</td>
                <td class="input-cell">
                <input type="text" name="department" id="department"   placeholder="Type here..." readonly></td>
                <td class="label-cell">Date Submitted</td>
                <td class="input-cell"><input type="text" name="date" id="date_submitted" placeholder="Type here..." readonly></td>
            </tr>
        </table>

      <div class="first_content">
          <p>A. Community Needs Assessment Date of Conduct: <textarea name="assessment_date" id="assessment_date" class="auto-expand" rows="1" placeholder="Type here..."></textarea></p>
          <p>B. Name of Participant: <textarea name="participant_name" id="participant_name" class="auto-expand" rows="1" placeholder="Type here..."></textarea></p>
          <p>C. Location/Purok/district: <textarea name="location" id="location" class="auto-expand" rows="1" placeholder="Type here..."></textarea></p>
      </div>

        <div class="section-header">
            I. Community Needs Assessment Results:
        </div>
        <div class="section_content">
            <p>A. Family Profile: <textarea name="family_profile"  id="family_profile" class="auto-expand" rows="1" placeholder="Type here..."></textarea></p>
            
            <p>B. Community Concerns: <textarea name="communtiy_concern" id="communtiy_concern" class="auto-expand" rows="1" placeholder="Type here..."></textarea></p>
            
            <p>C. Other Identified Needs: <textarea name="identified_needs" id="identified_needs" class="auto-expand" rows="1" placeholder="Type here..."></textarea></span></p>
           
        </div>

        <div class="section-header">
            II. Identified Kabayani Prevailing Needs of the Community
        </div>
        <div class="section_content">
            <div class="prevailing_needs">
                <textarea name="prevailing_needs" id="prevailing_needs" class="paper-lines" oninput="autoExpand(this)" rows="3" placeholder="Type here..."></textarea>
            </div>
        </div>

        <div class="section-header">
            III. Outreach Program
        </div>
        <div class="section-content">
            <p>Title of the Program:</p>
            <textarea name="title_of_program" id="title_of_program" class="auto-expand" rows="1" placeholder="Type here..."></textarea>
            
            <p>Objectives:</p>
            <div class="objectives">
                <textarea name="objectives" id="objectives" class="paper-lines" oninput="autoExpand(this)" rows="3" placeholder="Type here..."></textarea>
            </div>
            
            
            <p>Beneficiaries:</p>
            <div class="beneficiaries">
                <textarea name="beneficiaries" id="beneficiaries" class="paper-lines" oninput="autoExpand(this)" rows="3" placeholder="Type here..."></textarea>
            </div>
        </div>

        <div class="section-header">
            IV. Allocation of Resources (Funds and Equipment Needed)
        </div>
        <div class="section-content">
            <div class="line-group">
                <textarea name="resources_needed" id="resources_needed" class="paper-lines" oninput="autoExpand(this)" rows="3" placeholder="Type here..."></textarea>
            </div>
        </div>
                                                           

                                                <!-- APPROVAL SECTIONS -->
        <section class="approvals">
          <div class="approval-section">
            <div class="label">Prepared by:</div>
            <div class="ces-head-block">
              <div id="ces_head" class="name"></div>
              <span class="ces-head"><strong>CES Head</strong></span>
            </div>
          </div>

          <div class="approval-section">
            <div class="label">Recommending Approval:</div>
            <div class="signature-block">
              <span id="vp_acad" class="name"></span>
              <span class="title">Vice-President for Academic Affairs and Research</span>
            </div>
            <div class="signature-block" style="margin-top: 40px;">
              <span id="vp_admin" class="name"></span>
              <span class="title">Vice-President for Administrative Affairs</span>
            </div>
          </div>

          <div class="approval-section">
            <div class="label">Approved by:</div>
            <div class="signature-block">
              <span id="school_president" class="name"></span>
              <span class="title">School President</span>
            </div>
          </div>
        </section>




        <!-- DOCUMENT INFORMATION -->
        <section class="document-info">
          <table class="doc-header">
            <tr>
              <td class="label">Form Code No.</td><td>:</td>
              <td class="value"><p class="document_type">FM-OCM-SMCC-CLA-04</p></td>
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


                      

        <!-- Footer-->

       <footer>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img src="/admin/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                </div>
            </div>
        </footer>


          <!-- ================= ADMIN COMMENT ================= -->
<!-- Add these hidden input fields before the admin comment section -->
<input type="hidden" id="currentReportId" value="<?php echo isset($_GET['id']) ? htmlspecialchars($_GET['id']) : ''; ?>">
<input type="hidden" id="currentReportType" value="<?php echo $reportType; ?>">
                        
                               

                              
    </div>


    
    

    <!-- Include post.js and pass PHP data to it -->
<script>
  // Only pass necessary data to JavaScript
        window.userData = {
            reportType: "<?php echo $reportType; ?>",
            // department and userName are NOT passed to JS since they're from session
        };
</script>
    
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
<script src="/admin/ReportManagement/actions/view/dpirview/get.js"></script>
<script src="/admin/ReportManagement/actions/js/getapproval.js"></script>
</body>
</html>
