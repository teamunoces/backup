<?php
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
</head>
<body>

  <!-- HEADER -->
  <iframe src="/admin/Profile/profile.html" id="headerFrame" frameborder="0" scrolling="no" title="Header"></iframe>

  <!-- SIDEBAR -->
  <iframe src="/admin/Nav/navigation.html" id="sidebarFrame" frameborder="0" scrolling="no" title="Navigation Sidebar"></iframe>

  <!-- ACTION BUTTONS -->
  <div class="buttons">
    <button onclick="window.print()">Print this Page</button>
    <button id="downloadPDF" type="button">Download PDF</button>
  </div>

  <!-- MAIN PRINT CONTAINER -->
  <div class="container">

    <!-- REPORT HEADER -->
    <section class="report-header">
      <iframe src="../../ReportHeader/header.html" id="reportHeaderFrame" frameborder="0" scrolling="no"></iframe>
    </section>

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
            <textarea id="title_of_project" rows="2" placeholder="Enter project title..."></textarea>
          </div>

          <div class="input-group">
            <label>II. Description of the Project/Program:</label>
            <textarea id="description_of_project" rows="3" placeholder="Briefly describe the project..."></textarea>
          </div>

          <div class="input-group">
            <label>III. General Objectives:</label>
            <textarea id="general_objectives" rows="3" placeholder="What are the goals?"></textarea>
          </div>

          <div class="input-group">
            <label>IV. Program Justification:</label>
            <textarea id="program_justification" rows="3" placeholder="Why is this project necessary?"></textarea>
          </div>

          <div class="input-group">
            <label>V. Beneficiaries:</label>
            <textarea id="beneficiaries" rows="2" placeholder="Who will benefit from this?"></textarea>
          </div>

          <div class="input-group">
            <label>VI. Program Plan:</label>
            <textarea id="program_plan_text" rows="3" placeholder="What is the plan?"></textarea>
          </div>
        </div>

        <!-- PROGRAM PLAN TABLE -->
        <section class="table-section">
          <table id="programPlanTable">
            <thead>
              <tr>
                <th>Program</th>
                <th>Milestones</th>
                <th>Objectives</th>
                <th>Strategies</th>
                <th>Persons/ Agencies Involved</th>
                <th>Resources Needed</th>
                <th>Budget</th>
                <th>Time Frame</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><textarea id="program" rows="5"></textarea></td>
                <td><textarea id="milestones" rows="5"></textarea></td>
                <td><textarea id="objectives" rows="5"></textarea></td>
                <td><textarea id="strategies" rows="5"></textarea></td>
                <td><textarea id="persons_agencies_involved" rows="5"></textarea></td>
                <td><textarea id="resources_needed" rows="5"></textarea></td>
                <td><textarea id="budget" rows="5"></textarea></td>
                <td><textarea id="time_frame" rows="5"></textarea></td>
              </tr>
            </tbody>
          </table>
        </section>

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
          <h2>Document Information</h2>
          <table class="doc-header">
            <tr>
              <td class="label">Document Type</td><td>:</td>
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

</body>
</html>