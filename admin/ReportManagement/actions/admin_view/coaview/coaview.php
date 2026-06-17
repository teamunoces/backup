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

                            <div class="buttons">
                                <button  onclick="printReport()">Print</button>
                                <!-- <button id="downloadPDF" type="button">Download PDF</button>-->
                            </div>



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
              <div class="monitored-block">
                 <p><strong>Monitored by:</strong></p>
                  <div class="sig-line">
                      <input type="text" id="monitored_by">
                      <span class="sub-label">Signature over printed name</span>
                  </div>
              </div>

              <div class="monitored-block">
                  <p><strong>Verified by the Barangay Official/ Community Head/Beneficiary:</strong></p>
                  <div class="sig-line">
                      <input type="text" id="verified_by">
                      <span class="sub-label">Signature over printed name</span>
                  </div>
              </div>
          </section>



                           <!-- APPROVAL SECTIONS -->
        <section class="approvals">
          <div class="approval-section">
            <div class="label">Prepared by:</div>
            <div class="ces-head-block">
              <div id="ces_head" class="name"></div>
              <span class="ces-head"><strong>CES Head</strong></span>
            </div>
          </div>

          <div class="approval-section">
            <div class="label">Recommending Approval:</div>
            <div class="signature-block">
              <span id="vp_acad" class="name"></span>
              <span class="title">Vice-President for Academic Affairs and Research</span>
            </div>
            <div class="signature-block" style="margin-top: 40px;">
              <span id="vp_admin" class="name"></span>
              <span class="title">Vice-President for Administrative Affairs</span>
            </div>
          </div>

          <div class="approval-section">
            <div class="label">Approved by:</div>
            <div class="signature-block">
              <span id="school_president" class="name"></span>
              <span class="title">School President</span>
            </div>
          </div>
        </section>





        <!-- DOCUMENT INFORMATION -->
        <section class="document-info">
          <table class="doc-header">
            <tr>
              <td class="label">Form Code No.</td><td>:</td>
              <td class="value"><p class="document_type">FM-DPM-SMCC-CES-07</p></td>
            </tr>
            <tr>
              <td class="label">Issue Status</td><td>:</td>
              <td class="value"><input type="text" name="issue_status" disabled></td>
            </tr>
            <tr>
              <td class="label">Revision No.</td><td>:</td>
              <td class="value"><input type="text" name="revision_number" disabled></td>
            </tr>
            <tr>
              <td class="label">Date Effective</td><td>:</td>
              <td class="value"><input type="text" name="date_effective" disabled></td>
            </tr>
            <tr>
              <td class="label">Approved By</td><td>:</td>
              <td class="value"><input type="text" name="approved_by" disabled></td>
            </tr>
          </table>
        </section>
          


         <footer>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                </div>
            </div>
        </footer>

    </div>
    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="./get.js"></script>
    <script src="./print.js"></script>
    <script src="./download.js"></script>
    <script src="./darkmode.js"></script>
</body>
</html>