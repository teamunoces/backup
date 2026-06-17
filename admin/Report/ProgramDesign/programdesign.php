<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Program Design";
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
    <link rel="stylesheet" href="../shared/draft.css?v=20260520a">
    <link rel="stylesheet" href="programdesign.css?v=20260520a">
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
        src="../../Nav/navigation.html" 
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>

    <div class="form-container">
        <header>
            <div class="header-content">
                <img src="../images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <img src="../images/Ceslogo.png" alt="CES Logo" class="logo-left2">
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

        <h3 class="form-type">PROGRAM DESIGN FORM</h3>

        <div class="input-fields">
            <div class="field">
                <label>Department:</label>
                <input id="department" type="text" value="<?php echo htmlspecialchars($userDepartment); ?>" placeholder="Enter department">
            </div>
            <div class="field">
                <label>Title of Activity:</label>
                <input id="title_of_activity" type="text" placeholder="Enter title of activity">
            </div>
            <div class="field">
                <label>Participants:</label>
                <input id="participants" type="text" placeholder="Enter participants">
            </div>
            <div class="field">
                <label>Location:</label>
                <input id="location" type="text" placeholder="Enter location">
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
                    <button type="button" class="add-row-btn">Add Row</button>
                    <button type="button" class="delete-row-btn">Delete Row</button>
                
                </table>
        </form>

                    <!-- submit button-->

                        <div class="form-actions">
                            <button type="button" class="draft-button">Save Draft</button>
                            <button type="button" class="clear-button">Clear</button>
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
    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="../shared/draft-utils.js?v=20260520a"></script>
    <script src="./post.js?v=20260520a" ></script>
    <script src="./darkmode.js"></script>
</body>
</html>
