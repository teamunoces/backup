<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Monthly Accomplishment Report- Reflection Paper";
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
    <title>Monthly Accomplishment Report</title>
    <link rel="stylesheet" href="reflection.css">
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
                            <!--     <button id="downloadPDF" type="button">Download PDF</button>-->
                            </div>

                                <div class="wrapper">
                                    <div class="admin-comment">
                                          <label for="admincomment" class="admin-comment-label" style="font-weight: bold;">Admin Feedback</label>
                                          <textarea id="admincomment" rows="5" readonly></textarea>
                                    </div>
                                </div>



    <div class="container">
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
            <h1>MONTHLY ACCOMPLISHMENT REPORT- REFLECTION PAPER</h1>
        </header>

        <section class="info-section">
            <div class="input-group">
                <label>Name of the Beneficiary:</label>
                <input type="text" class="line-input" id="beneficiary_name">
            </div>
            <div class="input-group">
                <label>Implementing Department:</label>
                <input type="text" class="line-input" id="implementing_department">
            </div>
            <p class="instruction">
                Kindly put a check (/) mark on the type of extension service extended 
                <span class="translation">(Palihog ibutang ang tsek (/) sa klase sa serbisyo sa komunidad nga gihatag)</span>:
            </p>
        </section>

        <section class="checkbox-grid">
          <div class="column">
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value=""> Reading Literacy and Numeracy Program</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value="Sustainable Livelihood Program"> Sustainable Livelihood Program</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value="Feeding Program"> Feeding Program</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value="Recollection/Retreat"> Recollection/Retreat</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value="Lecture/Seminar"> Lecture/Seminar</label>
              </div>
          </div>
          <div class="column">
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value="Training and Workshop"> Training and Workshop</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox" name="extension_services[]" value="Coastal Clean-Up drive"> Coastal Clean-Up drive</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox"  name="extension_services[]" value="Tree Planting Program"> Tree Planting Program</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox"  name="extension_services[]" value="Gardening Program"> Gardening Program</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox"  name="extension_services[]" value="Community Clean-up Drive"> Community Clean-up Drive</label>
              </div>
              <div class="check-item">
                  <label><input type="checkbox"  name="extension_services[]" value="Health/Crime Prevention/Environmental Awareness"> Health/Crime Prevention/Environmental Awareness</label>
              </div>
          </div>
      </section>

        <section class="questions-section">
            <h3>Guide Questions:</h3>
            
            <div class="question">
                <p>1. How did the program influence your sense of social responsibility?</p>
                <p class="italic-trans">Giunsa sa programa pagpalambo sa imong pagbati sa sosyal nga responsibilidad?</p>
            </div>

            <div class="question">
                <p>2. What values did you develop or strengthen through participation?</p>
                <p class="italic-trans">Unsang mga kinaiya ang imong napalambo o napalig-on pinaagi sa pag-apil sa programa?</p>
            </div>

            <div class="question">
                <p>3. How will you apply what you learned from the program in your daily life or real-life situations?</p>
                <p class="italic-trans">Giunsa nimo pag-aplikar ang imong nahibal-an gikan sa programa sa imong adlaw-adlaw nga kinabuhi o sa tinuod nga kahimtang?</p>
            </div>
        </section>

       <section class="answer-section">
          <p><strong>Answer:</strong></p>
          
          <div class="answer-block">
              <label>1.</label>
              <textarea class="writing-lines-input" rows="2" id="answer_one" oninput="autoExpand(this)"></textarea>
          </div>
          
          <div class="answer-block">
              <label>2.</label>
              <textarea class="writing-lines-input" rows="2" id="answer_two" oninput="autoExpand(this)"></textarea>
          </div>
          
          <div class="answer-block">
              <label>3.</label>
              <textarea class="writing-lines-input" rows="2" id="answer_three" oninput="autoExpand(this)"></textarea>
          </div>
      </section>

    <div class="signature-wrapper">
        <div class="signature-block">
            <input type="text" class="signature-input" id="beneficiary_signature">
            <div class="signature-label">Signature of the Beneficiary</div>
        </div>
    </div>


     <!-- APPROVAL SECTIONS -->
                    <section class="approvals-container">
                        <div class="approval-row">
                            <div class="signature-group">
                            <div class="label">Prepared by:</div>
                           <div class="signature-line" id="created_by_name"></div>
                            <div class="title bold">CES Coordinator</div>
                            </div>
                        </div>

                        <div class="label" style="margin-top: 20px;">Noted by:</div>
                        <div class="approval-row">
                            <div class="signature-group">
                            <div class="signature-line" id="dean"></div>
                            <div class="title bold">Dean</div>
                            </div>
                            <div class="signature-group">
                            <div class="signature-line" id="ces_head"></div>
                            <div class="title bold">CES Head</div>
                            </div>
                        </div>

                        <div class="approval-centered" style="margin-top: 40px;">
                            <div class="label left-align">Recommending Approval:</div>
                            <div class="admin-block">
                            <div class="name-underlined" id="vp_acad"></div>
                            <div class="title bold">Vice-President for Academic Affairs and Research</div>
                            </div>
                            <div class="admin-block">
                            <div class="name-underlined"id="vp_admin" ></div>
                            <div class="title bold">Vice-President for Administrative Affairs</div>
                            </div>
                        </div>

                        <div class="approval-centered">
                            <div class="label left-align">Approved by:</div>
                            <div class="admin-block">
                            <div class="name-underlined"id="school_president"></div>
                            <div class="title bold">School President</div>
                            </div>
                        </div>
                        </section>

     <!-- DOCUMENT INFORMATION -->
        <section class="document-info">
          <table class="doc-header">
            <tr>
              <td class="label">Form Code No.</td><td>:</td>
              <td class="value"><p class="document_type">FM-DPM-SMCC-CES-05B</p></td>
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
    <script src="/SYSTEM_VERSION_!/coordinator//ReportManagement/actions/js/getapproval.js"></script>
    <script src="./get.js"></script>
    <script src="./expand.js"></script>
    <script src="./download.js"></script>
    <script src="./darkmode.js"></script>
    <script src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/view/reflectionview/print.js"></script>
    
</body>
</html>