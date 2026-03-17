<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Monthly Accomplishment Report";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Accomplishment Report</title>
    <link rel="stylesheet" href="mar.css">
    <link rel="stylesheet" href="darkmode.css">
</head>
<body>

  <!-- Header -->
   <iframe 
        src="../../Profile/profile.html" 
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>

    <!-- Sidebar -->
    <iframe 
        src="../../Sidebar/sidebar.html" 
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>


    <div class="report-container">


           <header>
            <div class="header-content">
                <img src="../images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <div class="college-info">
                    <h1>Saint Michael College of Caraga</h1>
                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                </div>
                <div class="logos-right">
                    <img src="../images/ISOlogo.png" alt="SOCOTEC Logo">
                </div>
            </div>
            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
            <div class="double-line"></div>
        </header>




        <h1>MONTHLY ACCOMPLISHMENT REPORT</h1>

       <table class="header-table">
            <tr>
                <td class="label">Department</td>
                <td class="input_cell"><input type="text" name="department" id="department" value="<?php echo htmlspecialchars($userDepartment); ?>" placeholder="Type here..." ></td>
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
                    <button type="button" class="add-row-btn">Add Row</button>
                    <button type="button" class="delete-row-btn">Delete Row</button>
                
                </table>
        </form>


          <div>
                <button type="submit" class="submit-button">Submit</button>
          </div>

        
        <footer>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img src="../images/footerlogo.png" alt="Org Logo 1">
                </div>
            </div>
        </footer>


                      
</div>
    </div>


      <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
      <script src="./darkmode.js"></script>
      <script src="./post.js" ></script>

</body>
</html>