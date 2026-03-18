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
</head>
<body>

  <!-- HEADER -->
  <iframe src="/coordinator/Profile/profile.html" id="headerFrame" frameborder="0" scrolling="no" title="Header"></iframe>

  <!-- SIDEBAR -->
  <iframe src="/coordinator/Sidebar/sidebar.html" id="sidebarFrame" frameborder="0" scrolling="no" title="Navigation Sidebar"></iframe>

  
  <!-- MAIN PRINT CONTAINER -->
  <div class="container">

   <!--------------------feedback------------------ -->
                                    <div class="admin-comment">
                                          <label for="admincomment" class="admin-comment-label" style="font-weight: bold;">Admin Feedback</label>
                                          <textarea id="admincomment" placeholder="Enter admin comments here..." rows="5"></textarea>
                                    </div>

    
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
                    <button type="button" class="add-row-btn"  onclick="addTableRow()">Add Row</button>
                    <button type="button" class="delete-row-btn"onclick="deleteTableRow()">Delete Row</button>
        </section>

                        <div>
                           <button type="button" class="submit-button" id="resubmitBtn">Re-submit</button>
                        </div>
       

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




</body>
</html>