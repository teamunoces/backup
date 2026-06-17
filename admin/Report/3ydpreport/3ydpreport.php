<?php
$reportType = isset($_GET['type']) ? htmlspecialchars($_GET['type']) : "3-year Development Plan";


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
  <title>3-Year Development Plan</title>
  <link rel="stylesheet" href="../shared/draft.css?v=20260520a">
  <link rel="stylesheet" href="3ydpreport.css?v=20260520a">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="darkmode.css">
</head>
<body>
    <!-- Header -->
    <iframe src="../../Profile/profile.html" id="headerFrame" frameborder="0" scrolling="no" title="Header"></iframe>

    <!-- Sidebar -->
    <iframe  src="../../Nav/navigation.html"  id="sidebarFrame" frameborder="0" scrolling="no" title="Navigation Sidebar"></iframe>

    <div class="container">
       
        <header>
            <div class="header-content">
                <img src="../images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                <img src="../images/Ceslogo.png" alt="Ces Logo" class="logo-left2">
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
            <h1>3-Year Development Plan</h1>
        </header>

        <form>
            <!-- Project Details -->
           <section class="form-section">
                <div class="input-group">
                    <label>I. Title of the Project/Program:</label>
                    <textarea id="title_of_project" class="paper-lines" oninput="autoExpand(this)" rows="1"  placeholder="Enter project title..."></textarea>
                </div>

                <div class="input-group">
                    <label>II. Description of the Project/Program:</label>
                    <textarea id="description_of_project" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Briefly describe the project..."></textarea>
                </div>

                <div class="input-group">
                    <label>III. General Objectives:</label>
                    <textarea id="general_objectives" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="What are the goals?"></textarea>
                </div>

                <div class="input-group">
                    <label>IV. Program Justification:</label>
                    <textarea id="program_justification" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Why is this project necessary?"></textarea>
                </div>

                <div class="input-group">
                    <label>V. Beneficiaries:</label>
                    <textarea id="beneficiaries" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="Who will benefit from this?"></textarea>
                </div>

                <div class="input-group">
                    <label>VI. Program Plan:</label>
                    <textarea id="program_plan" class="paper-lines" oninput="autoExpand(this)" rows="1" placeholder="What is the plan?"></textarea>
                </div>
            </section>

            <!-- Program Plan Table -->
            <section class="table-section">
                <div class="table-wrapper">
                    <table id="programPlanTable">
                         <thead>
                            <tr>
                                                <th rowspan="2">Program</th>
                                                <th rowspan="2">Objectives</th>
                                                <th rowspan="2">Strategies and<br>Action Plans</th>
                                                <th colspan="3">Resources Needed</th>
                                                <th rowspan="2">Means of<br>Verification</th>
                                                <th rowspan="2">Time<br>Frame</th>
                                            </tr>

                                            <tr>
                                                <th>
                                                    Resources from the School<br>
                                                    (Human Resources,<br>
                                                    Collaborating Agencies<br>
                                                    and Equipment)
                                                </th>

                                                <th>
                                                    Resources from the Community<br>
                                                    (Human Resources,<br>
                                                    Collaborating Agencies<br>
                                                    and Equipment)
                                                </th>

                                                <th>Budget and funding</th>
                                            </tr>
                            </thead>
                        <tbody>
                            <tr>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                                <td><textarea rows="5" placeholder="..."></textarea></td>
                            
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" class="add-row-btn">Add Row</button>
                    <button type="button" class="delete-row-btn">Delete Row</button>
                </div>
            </section>

            <!-- Submit Buttons -->
            <div class="form-actions">
                <button type="button" class="btn btn-draft draft-button">Save Draft</button>
                <button type="button" class="btn btn-clear clear-button">Clear</button>
                <button type="submit" class="btn btn-submit submit-button">Submit</button>
                <button type="button" class="btn recommendation-btn">
                    AI Recommendations
                </button>
            </div>
        </form>

        <!-- AI Recommendation Bar -->
        <div class="ai-search-bar">
            <input type="text" id="ai-input" placeholder="Ask for suggestions to improve your development plan..." />
        </div>

        <div id="recommendation-container" class="recommendation-section">
            <h3>AI-Generated Recommendations</h3>
            <p class="recommendation-intro"></p>
            <ul id="recommendation-list"></ul>
        </div>
    </div>
    <script>
    const reportType = "<?php echo $reportType; ?>";
    console.log(reportType);
    </script>
    <script src="../shared/draft-utils.js?v=20260520a" defer></script>
    <script src="./js/post.js?v=20260520a" defer></script>
    <script src="paperlines.js"></script>
    <script src="./darkmode.js"></script>
    <script src="./AI_RECOMMENDATION/AI.js?v=20260526c" defer></script>
</body>
</html>
