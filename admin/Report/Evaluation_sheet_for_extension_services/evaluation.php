<?php
session_start();
$userDepartment = $_SESSION['department'] ?? '';
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "Evaluation Sheet for Extension Services";
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
    <title>Evaluation Sheet for Extension Services</title>
    <link rel="stylesheet" href="../shared/draft.css?v=20260520a">
    <link rel="stylesheet" href="evaluation.css?v=20260520a">
    <link rel="stylesheet" href="./darkmode.css">
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

    <div class="evaluation-container">
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
        
        <header>
            <h1>EVALUATION SHEET FOR EXTENSION SERVICES</h1>
        </header>

        <form id="evaluationForm">
            <section class="header-info">
                <div class="input-line">
                    <label>Venue:</label>
                    <input type="text" name="venue" class="full-line" id="venue">
                </div>
                <div class="input-line">
                    <label>Implementing Department:</label>
                    <input type="text" name="department" class="full-line" id="implementing_department">
                </div>
                <p><strong>Kindly put a check (/) mark on the type of extension service extended:</strong></p>
            </section>

            <section class="checkbox-grid">
                <div class="column">
                    <label><input type="checkbox" name="service_types[]" value="Reading Literacy and Numeracy Program"> Reading Literacy and Numeracy Program</label>
                    <label><input type="checkbox" name="service_types[]" value="Sustainable Livelihood Program"> Sustainable Livelihood Program</label>
                    <label><input type="checkbox" name="service_types[]" value="Feeding Program"> Feeding Program</label>
                    <label><input type="checkbox" name="service_types[]" value="Recollection/Retreat"> Recollection/Retreat</label>
                    <label><input type="checkbox" name="service_types[]" value="Lecture/Seminar"> Lecture/Seminar</label>
                </div>
                <div class="column">
                    <label><input type="checkbox" name="service_types[]" value="Training and Workshop"> Training and Workshop</label>
                    <label><input type="checkbox" name="service_types[]" value="Coastal Clean-Up drive"> Coastal Clean-Up drive</label>
                    <label><input type="checkbox" name="service_types[]" value="Tree Planting Program"> Tree Planting Program</label>
                    <label><input type="checkbox" name="service_types[]" value="Gardening Program"> Gardening Program</label>
                    <label><input type="checkbox" name="service_types[]" value="Community Clean-up Drive"> Community Clean-up Drive</label>
                    <label><input type="checkbox" name="service_types[]" value="Health/Crime Prevention/Environmental Awareness"> Health/Crime Prevention/Environmental Awareness</label>
                </div>
            </section>

            <section class="instructions">
                <p><strong>Instruction:</strong> Rate each statement based on your current experience with the Extension Service Program. Choose the option that best reflects your level of agreement. Refer to the rating scale below.</p>
            </section>

            <table class="legend-table">
                <tr>
                    <td class="score-cell">4</td>
                    <td><strong>Strongly Agree</strong><br>Dako kaayo ang pag-uyon</td>
                    <td><strong>Klaro nimo nga nakita ni sa programa. Nahitabo kini pirmi ug maayo ang pagdala.</strong><br><em>You clearly saw this in the program. It happened consistently and effectively.</em></td>
                </tr>
                <tr>
                    <td class="score-cell">3</td>
                    <td><strong>Agree</strong><br>Pag-uyon</td>
                    <td><strong>Nakita nimo ni sa programaadaghanan sa oras, pero dili kanunay.</strong><br><em>You saw this in the program most of the time, but not always.</em></td>
                </tr>
                <tr>
                    <td class="score-cell">2</td>
                    <td><strong>Disagree</strong><br>Walay pag-uyon</td>
                    <td><strong>Bihira nimo kini makita sa programa. Kinahanglan pa kini og pagpaayo.</strong><br><em>You rarely saw this in the program. It needs improvement.</em></td>
                </tr>
                <tr>
                    <td class="score-cell">1</td>
                    <td><strong>Strongly Disagree</strong><br>Dili gyud pag-uyon</td>
                    <td><strong>Wala gyud nimo kini makita sa programa. Wala kini gihimo o wala maangkon ang tumong.</strong><br><em>You did not see this in the program at all. It was not practiced or not achieved.</em></td>
                </tr>
            </table>

            <table class="evaluation-table" id="evalTable">
                <thead>
                    <tr>
                        <th></th>
                        <th class="num-col">4</th>
                        <th class="num-col">3</th>
                        <th class="num-col">2</th>
                        <th class="num-col">1</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="category-row"><td colspan="5">Program Relevance</td></tr>
                    <tr>
                        <td>1. Ang programa mitubag sa tinuod nga panginahanglan sa komunidad.<br><em>The program addressed a real need in the community.</em></td>
                        <td class="radio-cell"><input type="radio" name="q1" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q1" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q1" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q1" value="1"></td>
                    </tr>
                    <tr>
                        <td>2. Klaro sa mga partisipante ang tumong sa programa.<br><em>The objectives of the program were clear to participants.</em></td>
                        <td class="radio-cell"><input type="radio" name="q2" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q2" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q2" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q2" value="1"></td>
                    </tr>
                    <tr>
                        <td>3. Ang mga kalihokan nagtugma sa tumong sa programa.<br><em>The activities matched the goals of the program.</em></td>
                        <td class="radio-cell"><input type="radio" name="q3" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q3" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q3" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q3" value="1"></td>
                    </tr>

                    <tr class="category-row"><td colspan="5">Planning and Organization</td></tr>
                    <tr>
                        <td>4. Husto ang oras ug iskedyul sa programa.<br><em>The schedule and timing of the program were appropriate.</em></td>
                        <td class="radio-cell"><input type="radio" name="q4" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q4" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q4" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q4" value="1"></td>
                    </tr>
                    <tr>
                        <td>5. Ang mga materyales ug mga kapanguhaan sa programa igo ug sapat.<br><em>The program materials and resources were sufficient.</em></td>
                        <td class="radio-cell"><input type="radio" name="q5" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q5" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q5" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q5" value="1"></td>
                    </tr>

                    <tr class="category-row"><td colspan="5">Facilitation / Delivery</td></tr>
                    <tr>
                        <td>6. Sayon sabton ang mga instruksyon ug impormasyon.<br><em>Instructions and information were easy to understand.</em></td>
                        <td class="radio-cell"><input type="radio" name="q6" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q6" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q6" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q6" value="1"></td>
                    </tr>
                    <tr>
                        <td>7. Ang programa nagdasig og aktibong pag-apil.<br><em>The program encouraged active participation.</em></td>
                        <td class="radio-cell"><input type="radio" name="q7" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q7" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q7" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q7" value="1"></td>
                    </tr>
                    <tr>
                        <td>8. Andam ug maalamon ang mga tigpasiugda.<br><em>The facilitators were prepared and knowledgeable.</em></td>
                        <td class="radio-cell"><input type="radio" name="q8" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q8" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q8" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q8" value="1"></td>
                    </tr>
                    <tr>
                        <td>9. Saktong gihatag ang oras aron maabot ang tumong sa programa.<br><em>The duration of the program was enough to meet the objectives.</em></td>
                        <td class="radio-cell"><input type="radio" name="q9" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q9" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q9" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q9" value="1"></td>
                    </tr>
                    <tr>
                        <td>10. Organisado ang mga kalihokan.<br><em>The activities were well organized.</em></td>
                        <td class="radio-cell"><input type="radio" name="q10" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q10" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q10" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q10" value="1"></td>
                    </tr>

                    <tr class="category-row"><td colspan="5">Learning Environment / Engagement</td></tr>
                    <tr>
                        <td>11. Ang programa nakatukod og maayong lugar sa pagkaton.<br><em>The program created a positive learning environment.</em></td>
                        <td class="radio-cell"><input type="radio" name="q11" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q11" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q11" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q11" value="1"></td>
                    </tr>
                    <tr>
                        <td>12. Ang programa nagpasiugda og kooperasyon ug teamwork.<br><em>The program promoted teamwork and cooperation.</em></td>
                        <td class="radio-cell"><input type="radio" name="q12" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q12" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q12" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q12" value="1"></td>
                    </tr>

                    <tr class="category-row"><td colspan="5">Community Impact / Outcomes</td></tr>
                    <tr>
                        <td>13. Ang programa nakatabang sa pagpauswag sa kahibalo o kahanas sa komunidad.<br><em>The program helped improve community knowledge or skills.</em></td>
                        <td class="radio-cell"><input type="radio" name="q13" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q13" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q13" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q13" value="1"></td>
                    </tr>
                    <tr>
                        <td>14. Klaro ang kaayohan nga nadawat sa komunidad.<br><em>The program had a visible benefit to the community.</em></td>
                        <td class="radio-cell"><input type="radio" name="q14" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q14" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q14" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q14" value="1"></td>
                    </tr>

                    <tr class="category-row"><td colspan="5">Satisfaction Level of the Beneficiary</td></tr>
                    <tr>
                        <td>15. Kontento ko sa tibuok pagpatuman sa programa.<br><em>I am satisfied with the overall implementation of the program.</em></td>
                        <td class="radio-cell"><input type="radio" name="q15" value="4"></td>
                        <td class="radio-cell"><input type="radio" name="q15" value="3"></td>
                        <td class="radio-cell"><input type="radio" name="q15" value="2"></td>
                        <td class="radio-cell"><input type="radio" name="q15" value="1"></td>
                    </tr>
                </tbody>
            </table>

            <footer class="signature-section">
                <div class="sig-line">Evaluated by: <input type="text" name="evaluated_by" class="sig-input" placeholder="type here..."></div>
                <div class="sig-line">Signature: <input type="text" name="signature" class="sig-input" placeholder="type here..."></div>
                <div class="sig-line">Date: <input type="text" name="date" class="sig-input" placeholder="type here..."></div>
            </footer>

            <div class="form-actions">
                <button type="button" class="draft-button">Save Draft</button>
                <button type="button" class="clear-button">Clear</button>
                <button type="submit" class="submit-button">Submit</button>
            </div>
        </form>
    </div>
    <script>const reportType = "<?php echo $reportType; ?>";console.log(reportType);</script>
    <script src="../shared/draft-utils.js?v=20260520a"></script>
    <script src="./post.js?v=20260520a"></script>
    <script src="./darkmode.js"></script>
</body>
</html>
