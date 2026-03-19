<?php
session_start();

$userName = $_SESSION['name'] ?? '';
$userDean = $_SESSION['dean'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Monthly Accomplishment Report";
$reportId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Accomplishment Report</title>
    <link rel="stylesheet" href="mar.css">
    <style>
/* Hide elements when printing */
@media print {

    #headerFrame,
    #sidebarFrame,
    .buttons,
    #downloadPDF {
        display: none !important;
    }

    body{
        margin:0;
        padding:0;
    }

    .report-container{
        width:100%;
        margin:0;
        padding:20px;
    }

    input{
        border:none;
    }

}

/* Optional: better page size */
@page{
    size:A4;
    margin:20mm;
}
</style>
</head>
<body>

  <!-- Header -->
   <iframe 
        src="/coordinator/Profile/profile.html" 
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>

    <!-- Sidebar -->
    <iframe 
        src="/coordinator/Sidebar/sidebar.html" 
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>

                     


    <div class="report-container">

                                                <!--------------------feedback------------------ -->
                                    <div class="admin-comment">
                                          <label for="admincomment" class="admin-comment-label" style="font-weight: bold;">Admin Feedback</label>
                                          <textarea id="admincomment" placeholder="Enter admin comments here..." rows="5"></textarea>
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




                    <h1>MONTHLY ACCOMPLISHMENT REPORT</h1>

                <table class="header-table">
                        <tr>
                            <td class="label">Department</td>
                            <td class="input_cell"><input type="text" name="department" id="department" placeholder="Type here..." ></td>
                        </tr>
                        <tr>
                            <td class="label">Report for the Month of</td>
                            <td class="input_cell"><input type="text" name="month" id="month" placeholder="Type here..." ></td>
                        </tr>
                        <tr>
                            <td class="label">Title of Activity</td>
                            <td class="input_cell"><input type="text" name="title_act" id="title_act" placeholder="Type here..." ></td>
                        </tr>
                        <tr>
                            <td class="label">Location of Program Implementation</td>
                            <td class="input_cell"><input type="text" name="location" id="location" placeholder="Type here..." ></td>
                        </tr>
                        <tr>
                            <td class="label">Beneficiaries</td>
                            <td class="input_cell"><input type="text" name="benefeciaries" id="benefeciaries" placeholder="Type here..." ></td>
                        </tr>
                        <tr>
                            <td class="label">Date Submitted</td>
                            <td class="input_cell"><input type="text" name="date_submitted" id="date_submitted" placeholder="Type here..." ></td>
                        </tr>
                    </table>

                    <form class="table_form">
                            <table class="main-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Activities Conducted</th>
                                        <th>Objectives</th>
                                        <th>Status</th>
                                        <th>Issues or Concerns</th>
                                        <th>Financial Report (if applicable)</th>
                                        <th>Recommendations</th>
                                        <th>Plans for Next Months</th>
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
                                    </tr>
                                </tbody>
                            </table>
                            
                    </form>

               
                          <!-- submit button-->

                      

                    <footer>
                        <div class="footer-bottom">
                            <div class="footer-logos">
                                <img src="/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                            </div>
                        </div>
                    </footer>


                
                                
    </div>
  
          <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
          <input type="hidden" id="currentReportType" value="<?php echo $reportType; ?>">

            <!-- Include post.js and pass PHP data to it -->
<script>
function printReport(){

    document.title = "Monthly_Accomplishment_Report";

    window.print();

}
</script>
      <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
      <script src="./get.js" ></script>
</script>


</body>
</html>