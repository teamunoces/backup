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
    <title>Program Design Form - SMCC</title>
    <link rel="stylesheet" href="view.css">
</head>
<body>

 <!-- HEADER -->
  <iframe src="/coordinator/Profile/profile.html" id="headerFrame" frameborder="0" scrolling="no" title="Header"></iframe>

  <!-- SIDEBAR -->
  <iframe src="/coordinator/Sidebar/sidebar.html" id="sidebarFrame" frameborder="0" scrolling="no" title="Navigation Sidebar"></iframe>

     
                                  
                          

    <div class="form-container">
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
                            <th>Program</th>
                            <th>Milestones</th>
                            <th>Duration</th>
                            <th>Objectives</th>
                            <th>Persons Involved</th>
                            <th>Resources Needed from the School (funds, equipment)</th>
                            <th>Resources Needed from the Community (funds, equipment)</th>
                            <th>Collaborating Agencies</th>
                            <th>Budget</th>
                            <th>Means of Verification</th>
                            <th>Remarks</th>
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
                        </tr>
                    </tbody>
                   
                    <button type="button" class="add-row-btn">Add Row</button>
                    <button type="button" class="delete-row-btn">Delete Row</button>
                </table>
        </form>

                    <!-- submit button-->>

                        <div>
                           <button type="button" class="submit-button" id="resubmitBtn">Re-submit</button>
                        </div>

                    <!-- FOOTER -->
                    <footer>
                        <div class="footer-bottom">
                            <div class="footer-logos">
                                <img src="/admin/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                            </div>
                        </div>
                    </footer>



    
    </div>

         <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
          <input type="hidden" id="currentReportType" value="<?php echo $reportType; ?>">

    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="./get.js" ></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="download.js"></script>

</body>
</html>