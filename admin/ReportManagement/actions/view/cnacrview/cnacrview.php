

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barangay Profile Report</title>
    <link rel="stylesheet" href="cnacrview.css">
   
</head>
<body>

     <!-- Header -->
        <iframe 
            src="/admin/Profile/profile.html" 
            id="headerFrame"
            frameborder="0"
            scrolling="no"
            title="Header">
        </iframe>

        <!-- Sidebar -->
        <iframe 
            src="/admin/Nav/navigation.html" 
            id="sidebarFrame"
            frameborder="0"
            scrolling="no"
            title="Navigation Sidebar">
        </iframe>

       

<div class="main-wrapper">   
    
        <div class="buttons">
            <button onclick="window.print()">Print this Page</button>
            <button id="downloadPDF" type="button">Download PDF</button></>
        </div>
    
                                

    <div class="container">

                                <!-- ================= HEADER ================= -->

                                <header class="report-header">
                                    <img src="/admin/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo left">
                                    <div class="header-text">
                                        <h1>Saint Michael College of Caraga</h1>
                                        <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                                        <p>Tel. Nos. +63 085 343-3251 / Fax No. +63 085 808-0892</p>
                                        <p class="website">www.smccnasipit.edu.ph</p>
                                        <h2>OFFICE OF THE COMMUNITY EXTENSION SERVICE</h2>
                                        <p id="psemester">First Semester, A.Y. 2025-2026</p>
                                    </div>
                                    <img src="/admin/ReportManagement/actions/images/ISOlogo.png" alt="Extension Logo" class="logo right">
                                </header>


                                <div class="header_content">
                                       <header class="intro-header" id="communityHeader">
                                                <h1 id="titleH1">COMMUNITY NEEDS ASSESMENT CONSOLIDATED RESULTS</h1>
                                                <h2 id="titleH2">Barangay Camagong, NASIPIT, AGUSAN DEL NORTE</h2>
                                                <h3 id="titleH3Semester">First Semester, A.Y. 2025-2026</h3>
                                                <h3 id="titleH3Date">Conducted on February 25, 2026</h3>
                                        </header>
                                       
                                        <!-- iNTRODUCTION-->
                                        <div id="introText" class="intro-text-display"></div>

                                </div>

    <!-- ================= SUMMARY ================= -->
    <div class="section-banner"> Table 1. Barangay Profile</div>    
    <div class="table-card">
        <table>
            <thead>
                <tr>
                    <th>Location</th>
                    <th>Total Population</th>
                    <th>Total No. of Household</th>
                    <th>No. of Respondents</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody id="barangayProfileTable">
                <tr>
                    <td>BRGY. CAMAGONG<br>DISTRICT 1 TO DISTRICT 10</td>
                    <td id="totalPopulation">Loading...</td>
                    <td id="totalHousehold">Loading...</td>
                    <td id="totalRespondents">Loading...</td>
                    <td id="responsePercent">Loading...</td>
                </tr>
            </tbody>
        </table>
    </div>

     
      <div id="table_1_text" class="intro-text-display"></div>


                                <!-- ================= FAMILY PROFILE ================= -->
                                    <div class="main-profile-label">A. FAMILY PROFILE</div>

                                        <!-- Religion -->
                                        <div class="banner">Table 2.Family Profile</div>
                                        <div class="table-container">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Religion</th>
                                                        <th>Total Frequency</th>
                                                        <th>Percentage</th>
                                                        <th>Rank</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="religionTable">
                                                    <tr><td colspan="4">Loading...</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                               
              
                    <div id="table_2_text" class="intro-text-display"></div>

                                                <!-- Source of Income -->
                                                <div class="banner"> Table 3. Source of Income</div>
                                                <div class="table-container">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Source of Income</th>
                                                                <th>Total Frequency</th>
                                                                <th>Percentage</th>
                                                                <th>Rank</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="incomeTable">
                                                            <tr><td colspan="4">Loading...</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>

        
                    <div id="table_3_text" class="intro-text-display"></div>

                                <!-- Monthly Income -->
                                <div class="banner">Table 4.Monthly Income</div>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th rowspan="2">Monthly Income</th>
                                                <th colspan="2">District 1 to District 10</th>
                                                <th rowspan="2">Total Frequency</th>
                                                <th rowspan="2">Percentage</th>
                                                <th rowspan="2">Rank</th>
                                            </tr>
                                            <tr>
                                                <th>Bana</th>
                                                <th>Asawa</th>
                                            </tr>
                                        </thead>
                                        <tbody id="monthlyIncomeTable">
                                            <tr><td colspan="6">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                    
                    <div id="table_4_text" class="intro-text-display"></div>

                                <!-- Education -->
                                <div class="banner">Table 5.Educational Level of Children</div>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Educational Level of Children</th>
                                                <th>Total Frequency</th>
                                                <th>Percentage</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="educationTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                   
                    <div id="table_5_text" class="intro-text-display"></div>

                                <!-- Age -->
                                <div class="banner">Table 6. Age of Children</div>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>EDAD SA MGA ANAK</th>
                                                <th>Total Frequency</th>
                                                <th>Percentage</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="ageTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                   
                    <div id="table_6_text" class="intro-text-display"></div>

                                <!-- Disability -->
                                <div class="banner">Table 7. Children with Disability</div>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>PWD Children</th>
                                                <th>Total Frequency</th>
                                                <th>Percentage</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="pwdTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                   
                    <div id="table_7_text" class="intro-text-display"></div>

                                <!-- ================= COMMUNITY ================= -->
                                <div class="pill-label">B. COMMUNITY CONCERNS</div>

                                        <!-- Health Concerns -->
                                    <div class="green-banner">Table 8. Health Concerns</div>
                                    <div class="table-box">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Kabalak-an sa Komunidad</th>
                                                    <th>Total Frequency</th>
                                                    <th>WM</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody id="healthTable">
                                                <tr><td colspan="4">Loading...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                        
                    <div id="table_8_text" class="intro-text-display"></div>

                                    
                                    <!-- Toilet Facilities -->
                                    <div class="green-banner">Table 9. TYPES OF TOILET FACILITIES </div>
                                    <div class="table-box">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>PAGLAKARAW SA KASILYAS</th>
                                                    <th>Total Frequency</th>
                                                    <th>PERCENTAGE</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody id="toiletTable">
                                                <tr><td colspan="4">Loading...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                    
                    <div id="table_9_text" class="intro-text-display"></div>

                                    <!-- Waste Disposal -->
                                        <div class="green-banner">Table 10. METHODS USED BY HOUSEHOLDS FOR WASTE DISPOSAL</div>
                                        <div class="table-box">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>PAMA-AGI SA PAGLABAY SA BASURA </th>
                                                        <th>Total Frequency</th>
                                                        <th>PERCENTAGE</th>
                                                        <th>Rank</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="wasteTable">
                                                    <tr><td colspan="4">Loading...</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
       
                    <div id="table_10_text" class="intro-text-display"></div>
        
                                    <!-- Urgent Concerns -->
                                    <div class="green-banner">Table 11. URGENT CONCERNS</div>
                                    <div class="table-box">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>ANG PINAKA-DALI NGA PROBLEMA SA INYONG DISTRITO </th>
                                                    <th>Total Frequency</th>
                                                    <th>PERCENTAGE</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody id="urgentTable">
                                                <tr><td colspan="4">Loading...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
       
                    <div id="table_11_text" class="intro-text-display"></div>

                                    <!-- Community Perceptions -->
                                    <div class="green-banner">Table 12. COMMUNITY PERCEPTIONS REGARDING PEACE AND ORDER</div>
                                    <div class="table-box">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>ADONA BA KAMO PROBLEMA SA KALINAW SA DISTRITO? </th>
                                                    <th>Total Frequency</th>
                                                    <th>PERCENTAGE</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody id="peaceTable">
                                                <tr><td colspan="4">Loading...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
       
                    <div id="table_12_text" class="intro-text-display"></div>

                                <!-- Necessity of Training -->
                                <div class="green-banner">Table 13. THE NECESSITY OF TRAINING FOR BARANGAY TANODS</div>
                                <div class="table-box">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>KINAHANGLAN BA ANG TRAINING PARA SA BARANGAY TANOD?  </th>
                                                <th>Total Frequency</th>
                                                <th>Percentage</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="neccessityTrainingTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
        
                    <div id="table_13_text" class="intro-text-display"></div>


                                <!-- Essential Training -->
                                <div class="green-banner">Table 14. MOST ESSENTIAL TRAINING PROGRAMS IDENTIFIED FOR BARANGAY TANODS AND COMMUNITY MEMBERS </div>
                                <div class="table-box">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>UNSA MAN ANG GIKINAHANGLAN NGA MGA TRAINING ANG KINAHANGLAN ALANG SA BARANGAY TANOD UG ALANG SA MGA KATAWHAN?</th>
                                                <th>Total Frequency</th>
                                                <th>WM</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="essentialTrainingTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                    
                    <div id="table_14_text" class="intro-text-display"></div>

                                <!-- Seminars Most Needed -->
                                <div class="green-banner">Table 15. SEMINARS MOST NEEDED </div>
                                <div class="table-box">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>UNSA NGA MGA SEMINAR ANG PINAKAIKINAHANGLAN SA INYONG DISTRITO?</th>
                                                <th>Total Frequency</th>
                                                <th>WM</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="seminarTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
        
                    <div id="table_15_text" class="intro-text-display"></div>
                                <!-- Trainings Most Needed -->
                                <div class="green-banner">Table 16. TRAININGS MOST NEEDED</div>
                                <div class="table-box">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>UNSA NGA MGA TRAINING ANG PINAKAKINAHANGLAN SA INYONG DISTRITO?</th>
                                                <th>Total Frequency</th>
                                                <th>PERCENTAGE</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="trainingTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>

        
                    <div id="table_16_text" class="intro-text-display"></div>

                                <!-- ================= RELIGIOUS ACTIVITIES ================= -->
                                <div class="main-profile-label">C. THE RELIGIOUS ACTIVITIES NEEDED IN THE COMMUNITY</div>

                                    <!-- Most Desired Religiou s-->
                                <div class="green-banner">Table 17. MOST DESIRED RELIGIOUS ACTIVITIES</div>
                                    <div class="table-box">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>UNSA NGA RELIHIYOSONG MGA KALIHOKAN ANG IMONG GUSTO MAKITA SA KOMUNIDAD? </th>
                                                    <th>Total Frequency</th>
                                                    <th>PERCENTAGE</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody id="mostDesiredTable">
                                                <tr><td colspan="4">Loading...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
        
                    <div id="table_17_text" class="intro-text-display"></div>    

                                    <!-- Spiritual Life Priorities -->
                                    <div class="green-banner">Table 18. SPIRITUAL LIFE PRIORITIES</div>
                                        <div class="table-box">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>UNSA ANG LABING IMPORTANTE PARA NIMO SA IMONG ESPIRITWAL NGA KINABUHI?  </th>
                                                        <th>Total Frequency</th>
                                                        <th>PERCENTAGE</th>
                                                        <th>Rank</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="spiritualLifeTable">
                                                    <tr><td colspan="4">Loading...</td></tr>
                                                </tbody>
                                            </table>
                                    </div>
                    <div id="table_18_text" class="intro-text-display"></div>


                                    <!-- Deepening of Spirituality -->
                                    <div class="green-banner">Table 19. DEEPENING OF SPIRITUALITY</div>
                                    <div class="table-box">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>UNSAON NIMO PAGPALALUM SA IMONG ESPIRITWAL NGA KINABUHI?</th>
                                                    <th>Total Frequency</th>
                                                    <th>PERCENTAGE</th>
                                                    <th>Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody id="deepeningSpiritualityTable">
                                                <tr><td colspan="4">Loading...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                    <div id="table_19_text" class="intro-text-display"></div>

                                <!-- Participation in Religious Activities -->
                                <div class="green-banner">Table 20.FREQUENCY OF PARTICIPATION IN RELIGIOUS ACTIVITIES</div>
                                <div class="table-box">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>PILA KA BESES KA MOSALMOT SA RELIHIYOSONG KALIHOKAN? </th>
                                                <th>Total Frequency</th>
                                                <th>PERCENTAGE</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="participationTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                    <div id="table_20_text" class="intro-text-display"></div>

                                <!-- Other Barangay Needs -->
                                <div class="green-banner">Table 21. OTHER BARANGAY NEEDS THAT SMCC CAN ADDRESS</div>
                                <div class="table-box">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>UNSA PANG PANGINAHANGLAN SA INYONG BARANGAY NGA PWEDE MAHIMO SA SMCC?</th>
                                                <th>Total Frequency</th>
                                                <th>PERCENTAGE</th>
                                                <th>Rank</th>
                                            </tr>
                                        </thead>
                                        <tbody id="otherBarangayNeedsTable">
                                            <tr><td colspan="4">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                    <div id="table_21_text" class="intro-text-display"></div>

         <p>Conclusion</p>
          <div id="conclusion_text" class="intro-text-display"></div>


                <!-- ================= APPROVALS ================= -->
                            <div class="approvals">
                                <!-- Prepared by -->
                                <div class="section">
                                    <div class="label">Prepared by:</div>
                                    <div class="ces-head-block">
                                        <div id="ces_head" class="name"></div>
                                        <span class="ces-head"><strong>CES Head</strong></span>
                                    </div>
                                </div>

                                <!-- Recommending Approval -->
                                <div class="section">
                                    <div class="label">Recommending Approval:</div>
                                    
                                    <!-- VP Academic -->
                                    <div class="signature-block">
                                        <span id="vp_acad" class="name"></span>
                                        <span class="title">Vice-President for Academic Affairs and Research</span>
                                    </div>

                                    <!-- VP Admin -->
                                    <div class="signature-block" style="margin-top: 40px;">
                                        <span id="vp_admin" class="name"></span>
                                        <span class="title">Vice-President for Administrative Affairs</span>
                                    </div>
                                </div>

                                <!-- Approved by -->
                                <div class="section">
                                    <div class="label">Approved by:</div>
                                    <div class="signature-block">
                                        <span id="school_president" class="name"></span>
                                        <span class="title">School President</span>
                                    </div>
                                </div>
                            </div>

                           

                            <section class="form-section">
                                <h2 class="section-title">Document Information</h2>
                                <div class="input-row">
                                    <table class="doc-header">

                                        <tr>
                                            <td class="label">Document Type</td>
                                            <td class="separator">:</td>
                                            <td class="value">
                                                <p class="document_type">‌FM-DPM-SMCC-CES-02</p>
                                            </td>
                                        </tr>    

                                        <tr>
                                            <td class="label">Issue Status</td>
                                            <td class="separator">:</td>
                                            <td class="value">
                                                <input type="text" name="issue_status" disabled>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="label">Revision No.</td>
                                            <td class="separator">:</td>
                                            <td class="value">
                                                <input type="text" name="revision_number" disabled>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="label">Date Effective</td>
                                            <td class="separator">:</td>
                                            <td class="value">
                                                <input type="text" name="date_effective" disabled>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="label">Approved By</td>
                                            <td class="separator">:</td>
                                            <td class="value">
                                                <input type="text" name="approved_by" disabled>
                                            </td>
                                        </tr>

                                    </table>
                                </div>
                            </section>

                            <script src="/admin/ReportManagement/actions/js/getapproval.js"></script>


                            <!-- ================= FOOTER ================= -->
        
                        <footer>
                            <div class="footer-bottom">
                                <div class="footer-logos">
                                    <img src="/admin/ReportManagement/actions/images/footerlogo.png" alt="Org Logo 1">
                                </div>
                            </div>
                        </footer>

                       
   
      

    </div>
   <input type="hidden" id="currentReportId" value="<?php echo $_GET['id']; ?>">
</div>    

<!-- ================= JAVASCRIPT FILE ================= -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script src="./viewget.js"></script>
<script src="/admin/ReportManagement/actions/js/download.js"></script>


</body>
</html>
