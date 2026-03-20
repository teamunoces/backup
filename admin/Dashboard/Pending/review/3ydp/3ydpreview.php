<?php
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "3-year Development Plan";
?>
<!DOCTYPE html>
<html lang="en">
<l>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3-Year Development Plan</title>
  <link rel="stylesheet" href="3ydpreview.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="darkmode.css">
</head>
<body>
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

    <div class="container">

                                <header class="report-header">
                                    <img src="../images/smcclogo.png" alt="SMCC Logo" class="logo left">
                                    <div class="header-text">
                                        <h1>Saint Michael College of Caraga</h1>
                                        <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                                        <p>Tel. Nos. +63 085 343-3251 / Fax No. +63 085 808-0892</p>
                                        <p class="website">www.smccnasipit.edu.ph</p>
                                        <h2>OFFICE OF THE COMMUNITY EXTENSION SERVICE</h2>
                                        <p id="psemester">First Semester, A.Y. 2025-2026</p>
                                    </div>
                                    <img src="../images/ISOlogo.png" alt="Extension Logo" class="logo right">
                                </header>
        
        <header>
            <h1>3-Year Development Plan</h1>
        </header>

        <form>
            <!-- Project Details -->
           <section class="form-section">
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
            </section>

            <!-- Program Plan Table -->
            <section class="table-section">
                <div class="table-wrapper">
                    <table id="programPlanTable">
                        <thead>
                            <tr>
                                <th rowspan="5">Program</th>
                                <th rowspan="5">Milestones</th>
                                <th rowspan="5">Objectives</th>
                                <th rowspan="5">Strategies</th>
                                <th rowspan="5">Persons/ Agencies Involved</th>
                                <th rowspan="5">Resources Needed</th> 
                                <th rowspan="5">Budget</th>          
                                <th rowspan="5">Time Frame</th>
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
                   
                </div>
            </section>

            
                            <!-- ================= FOOTER ================= -->
        
                        <footer>
                            <div class="footer-bottom">
                                <div class="footer-logos">
                                    <img src="../images/footerlogo.png" alt="Org Logo 1">
                                </div>
                            </div>
                        </footer>
            <!-- ================= ADMIN COMMENT ================= -->

            <div class="admin-comment">
                                    <label for="admincomment" class="admin-comment-label">Admin Feedback</label>
                                    <textarea id="admincomment" placeholder="Enter admin comments here..." rows="5"></textarea>
            </div>
    
            <div class="button-container">      
                        <button class="rejectbtn" id="rejectReport" value="">Reject</button>
                        <button class="needFixes" id="needFixes" value="">Need Fixes</button>
                        <button class="approvebtn" id="approveReport" value="">Approve</button>
            </div>


                 <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
                 <input type="hidden" id="currentReportType" value="<?php echo htmlspecialchars($reportType); ?>">
    </div>
                

    <script src="./js/get.js"></script>
    <script src="../action/action.js"></script>
    <script src="./darkmode.js"></script>
    
  </body>  
</html>