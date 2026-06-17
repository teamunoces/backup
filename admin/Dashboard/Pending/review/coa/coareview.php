<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Certificate of Appearance";
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
    <title>Certificate of Appearance</title>
    <link rel="stylesheet" href="coa.css">
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

                          


    <div class="certificate-container">

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
            <h1>CERTIFICATE OF APPEARANCE</h1>
        </header>
          <section class="content">
              <p>
                  This is to certify that 
                  <span class="line-wrap"><input type="text" class="long-line" id="participant"><span class="sub-label">(Name)</span></span> 
                  of 
                  <span class="line-wrap"><input type="text" class="long-line" id="cert_department"><span class="sub-label">(Department)</span></span>,
              </p>

              <p>
                  has visited and monitored the activity /project on 
                  <input type="text" class="med-line" id="activity_name">
                  <div class="sub-label-center">(title of the activity/project)</div>
              </p>

              <div class="location-group">
                  held at <input type="text" class="full-line" id="location">
              </div>

              <div class="date-group">
                  Done this <input type="text" class="short-line" id="date_held">
                  day of <input type="text" class="month-line" id="month_held">, <input type="text" class="short-line" id="year_held"> at <input type="text" class="location-line" id="location_two">
              </div>
          </section>

          <section class="signatures">
              <div class="signature-block">
                 <p><strong>Monitored by:</strong></p>
                  <div class="sig-line">
                      <input type="text" id="monitored_by">
                      <span class="sub-label">Signature over printed name</span>
                  </div>
              </div>

              <div class="signature-block">
                  <p><strong>Verified by the Barangay Official/ Community Head/Beneficiary:</strong></p>
                  <div class="sig-line">
                      <input type="text" id="verified_by">
                      <span class="sub-label">Signature over printed name</span>
                  </div>
              </div>
          </section>



            

         <footer>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                </div>
            </div>
        </footer>

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
     <input type="hidden" id="currentReportId" value="<?php echo htmlspecialchars($_GET['id'] ?? ''); ?>">
    <input type="hidden" id="currentReportType" value="<?php echo $reportType; ?>">
    <script>const reportType = "<?php echo $reportType; ?>";</script>
    <script src="/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/action/action.js"></script>
    <script src="./get.js"></script>
    <script src="./darkmode.js"></script>

</body>
</html>
