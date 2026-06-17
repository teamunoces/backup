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
    <link rel="stylesheet" href="../shared/draft.css?v=20260519f">
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


    <div class="container">
         <header>
            <div class="header-content">
                <img src="../images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <img src="../images/Ceslogo.png" alt="CES logo" class="logo-left2">
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

             <div>
                <button type="submit" class="submit-button">Submit</button>
            </div>
    </div>
    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="./expand.js"></script>
    <script src="../shared/draft-utils.js?v=20260519j"></script>
    <script src="./post.js?v=20260519j"></script>
    <script src="./darkmode.js"></script>
</body>
</html>
