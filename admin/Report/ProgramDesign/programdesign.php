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
    <title>Program Design Form - SMCC</title>
    <link rel="stylesheet" href="programdesign.css">
    <link rel="stylesheet" href="darkmode.css">">
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
    <script src="./post.js" ></script>
    <script src="./darkmode.js"></script>
</body>
</html>