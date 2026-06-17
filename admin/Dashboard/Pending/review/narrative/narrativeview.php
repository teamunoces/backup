<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Monthly Accomplishment Report- Narrative Report";
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
    <title>Monthly Accomplishment Report Form</title>
    <link rel="stylesheet" href="narrative.css">
    <link rel="stylesheet" href="darkmode.css">
</head>
<body>
    <!-- Header -->
    <iframe 
        src="http://localhost/SYSTEM_VERSION_!/admin/Profile/profile.html"
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>

    <!-- Sidebar -->
    <iframe 
        src="http://localhost/SYSTEM_VERSION_!/admin/Nav/navigation.html"
        id="sidebarFrame"
        frameborder="0"
        scrolling="no"
        title="Navigation Sidebar">
    </iframe>

    <div class="report-container">
        <header>
            <div class="header-content">
                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png" alt="CES Logo" class="logo-left2">
                <div class="college-info">
                    <h1>Saint Michael College of Caraga</h1>
                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                </div>
                <div class="logos-right">
                    <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/ISOlogo.png" alt="SOCOTEC Logo">
                </div>
            </div>
            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
            <div class="double-line"></div>
        </header>

        <header>
            <h1>MONTHLY ACCOMPLISHMENT REPORT- NARRATIVE REPORT</h1>
        </header>

        <form id="narrativeForm">
            <ol class="report-list">
                <li>
                    <label class="label">Narrate Success</label> 
                    <textarea class="line-input dynamic-textarea" id="narrate_success" ></textarea>
                </li>
                <li>
                    <label class="label">Provide Data</label> 
                    <textarea class="line-input dynamic-textarea" id="provide_data" ></textarea>
                </li>
                <li>
                    <label class="label">Identify Problems</label> 
                    <textarea class="line-input dynamic-textarea" id="identify_problems" ></textarea>
                </li>
                <li>
                    <label class="label">Propose Solutions</label> 
                    <textarea class="line-input dynamic-textarea" id="propose_solutions"></textarea>
                </li>
            </ol>
        </form>

        
                                <!--- ADMIN FEEBACK AND BUTTONS --->

                                <div class="admin-comment">
                                    <label for="admincomment" class="admin-comment-label">Admin Feedback</label>
                                    <textarea id="admincomment" placeholder="Enter admin comments here..." rows="5"></textarea>
                                </div>


                                 <div class="button-container">      
                                        <button class="rejectbtn" id="rejectReport" value="">Reject</button>
                                        <button class="needFixes" id="needFixes" value="">Need Fixes</button>
                                        <button class="approvebtn" id="approveReport" value="">Approve</button>
                                </div>

 

    </div>
    <script>const reportType = "<?php echo $reportType; ?>";</script>
    <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
    <input type="hidden" id="currentReportType" value="<?php echo $reportType; ?>">
    <script src="/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/action/action.js"></script>
    <script src="./expand.js"></script>
    <script src="./get.js"></script>
    <script src="./darkmode.js"></script>

</body>
</html>
