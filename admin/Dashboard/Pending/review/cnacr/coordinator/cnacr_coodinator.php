<?php
session_start();
// These should be set when user logs in
$userDepartment = $_SESSION['department'] ?? '';
// Get selected report type from query parameter
$repottype = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Community Needs Assessment Consolidated Report";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Needs Assessment Report</title>
    <link rel="stylesheet" href="cnacr.css">
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



        <h1>COMMUNITY NEEDS ASSESSMENT CONSOLIDATED REPORT</h1>

        <div class="header-grid">
            <div class="label-box bg-gray">Department</div>
            <input type="text" name="department" id="department"  value="<?php echo htmlspecialchars($userDepartment); ?>" placeholder="Type here..." >
            <div class="label-box bg-gray">Date Submitted</div>
            <input type="text" name="date" id="date_submitted" value="<?php echo date('d-m-Y'); ?>" placeholder="Type here..." >
        </div>

        <div class="section-content">
            <div class="form-group">
                <label>A. Community Needs Assessment Date of Conduct:</label>
                <div class="line-input">
                    <textarea name="date_conduct" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>

            <div class="form-group">
                <label>B. Participants:</label>
                <div class="line-input">
                    <textarea name="participants" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>

            <div class="form-group">
                <label>C. Location/Purok/district:</label>
                <div class="line-input">
                    <textarea name="location" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">I.</span> Community Needs Assessment Results:
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>A. Family Profile:</label>
                <div class="line-input">
                    <textarea name="family_profile" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>B. Community Concerns:</label>
               <div class="line-input">
                    <textarea name="community_concern" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>C. Other Identified Needs:</label>
                <div class="line-input">
                    <textarea name="other_identified_needs" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">II.</span> Identified Kabayani Major Institutional Programs and Prevailing Needs of the Community
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>1. Kabayani ng Panginoon</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_panginoon" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>2. Kabayani ng Kalikasan Kabayani ng Buhay</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_kalikasan" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
             <div class="form-group">
                <label>3. Kabayani ng Buhay</label>
                  <div class="line-input">
                    <textarea name="kabayani_ng_buhay" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>4. Kabayani ng Turismo</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_turismo" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>5. Kabayani ng Kultura –</label>
                <div class="line-input">
                    <textarea name="kabayani_ng_kultura" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">III.</span> Outreach Program
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>Title of the Program:</label>
                <div class="line-input">
                    <textarea name="title_of_program" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Objectives:</label>
               <div class="line-input">
                    <textarea name="objectives" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>Beneficiaries:</label>
                <div class="line-input">
                    <textarea name="beneficiaries" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

        <div class="section-header">
            <span class="roman-num">IV.</span> Allocation of Resources (Funds and Equipment Needed)
        </div>
        <div class="section-content">
            <div class="form-group">
                <label>From the School:</label>
                <div class="line-input">
                    <textarea name="from_school" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
            <div class="form-group">
                <label>From the Community:</label>
               <div class="line-input">
                    <textarea name="from_community" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Type here..."></textarea>
                </div>
            </div>
        </div>

                    
                      <!--______________________________ footer___________________________ -->

                         <footer>
                            <div class="footer-bottom">
                                <div class="footer-logos">
                                    <img src="../images/footerlogo.png" alt="Org Logo 1">
                                </div>
                            </div>
                        </footer>







    </div>


    <SCript src="./get.js"></SCript>


</body>
</html>