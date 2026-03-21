<?php
session_start();

$userName = $_SESSION['name'] ?? '';
$userDean = $_SESSION['dean'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "3-year Development Plan";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $reportType; ?></title>
  <link rel="stylesheet" href="view.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="darkmode.css">
</head>
<body>

  <!-- HEADER -->
  <iframe src="/coordinator/Profile/profile.html" id="headerFrame" frameborder="0" scrolling="no" title="Header"></iframe>

  <!-- SIDEBAR -->
  <iframe src="/coordinator/Sidebar/sidebar.html" id="sidebarFrame" frameborder="0" scrolling="no" title="Navigation Sidebar"></iframe>

  <!-- ACTION BUTTONS -->
  <div class="buttons">
    <button  onclick="printReport()">Print this Page</button>
    <button id="downloadPDF" type="button">Download PDF</button>
  </div>

  <!-- MAIN PRINT CONTAINER -->
  <div class="container">
    
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

    <!-- CONTENT BODY -->
    <section class="content-body">
      <header id="header">
        <h1><?php echo $reportType; ?></h1>
      </header>

      <!-- FORM DETAILS -->
      <form class="report-form">





        <div class="form-section">
          <div class="input-group">
            <label>I. Title of the Project/Program:</label>
            <textarea id="title_of_project" rows="2" class="paper-lines"  placeholder="Enter project title..."></textarea>
          </div>

          <div class="input-group">
            <label>II. Description of the Project/Program:</label>
            <textarea id="description_of_project" rows="3" class="paper-lines" placeholder="Briefly describe the project..."></textarea>
          </div>

          <div class="input-group">
            <label>III. General Objectives:</label>
            <textarea id="general_objectives" rows="3" class="paper-lines" placeholder="What are the goals?"></textarea>
          </div>

          <div class="input-group">
            <label>IV. Program Justification:</label>
            <textarea id="program_justification" rows="3" class="paper-lines" placeholder="Why is this project necessary?"></textarea>
          </div>

          <div class="input-group">
            <label>V. Beneficiaries:</label>
            <textarea id="beneficiaries" rows="2" class="paper-lines" placeholder="Who will benefit from this?"></textarea>
          </div>

          <div class="input-group">
            <label>VI. Program Plan:</label>
            <textarea id="program_plan_text" rows="3" class="paper-lines" placeholder="What is the plan?"></textarea>
          </div>
        </div>

        <!-- PROGRAM PLAN TABLE -->
        <section class="table-section">
          <table id="programPlanTable">
            <thead>
              <tr>
                                <th rowspan="5">Program</th>
                                <th rowspan="5">Objectives</th>
                                <th rowspan="5">Strategies and Action Plans</th>
                                <th rowspan="5">Resources from the School</th>
                                <th rowspan="5">Resources from the Community</th> 
                                <th rowspan="5">Budget</th>     
                                <th rowspan="5">Means of Verification</th>     
                                <th rowspan="5">Time Frame</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><textarea id="program" rows="5"></textarea></td>
                <td><textarea id="objectives" rows="5"></textarea></td>
                <td><textarea id="strategies" rows="5"></textarea></td>
                <td><textarea id="persons_agencies_involved" rows="5"></textarea></td>
                <td><textarea id="resources_needed" rows="5"></textarea></td>
                <td><textarea id="budget" rows="5"></textarea></td>
                <td><textarea id="means_of_verification" rows="5"></textarea></td>
                <td><textarea id="time_frame" rows="5"></textarea></td>
              </tr>
            </tbody>
          </table>
        </section>

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
      </form>
    </section>

    <!-- FOOTER -->
    <footer>
      <div class="footer-bottom">
        <img src="../../images/footerlogo.png" alt="Org Logo">
      </div>
    </footer>


    

    <!-- HIDDEN INPUTS -->
    <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
    <input type="hidden" id="currentReportType" value="<?php echo htmlspecialchars($reportType); ?>">

  </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script src="get.js"></script>
  <script src="/admin/ReportManagement/actions/js/getapproval.js"></script>
  <script src="download.js"></script>
  <script src="./darkmode.js"></script>

  <script>
          function printReport() {
              // Select elements you want to hide
              const buttons = document.querySelectorAll('.buttons');
              const iframes = document.querySelectorAll('iframe');

              // Hide them before printing
              buttons.forEach(btn => btn.style.display = 'none');
              iframes.forEach(frame => frame.style.display = 'none');

              // Trigger print
              window.print();

              // Restore visibility after print
              buttons.forEach(btn => btn.style.display = '');
              iframes.forEach(frame => frame.style.display = '');
          }
</script>

</body>
</html>