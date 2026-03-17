<?php
// Get selected barangay from query parameter
$barangay = isset($_GET['barangay']) ? htmlspecialchars($_GET['barangay']) : "triangulo";
?>
<!DOCTYPE html>
<html lang="ceb">
<head>
    <meta charset="UTF-8">
    <title>Porma sa Pag-ila sa Panginahanglanon sa Komunidad</title>
    <link rel="stylesheet" href="survey.css">
</head>
<body>
     <!-- Header -->
    <iframe 
        src="../header/profile.php" 
        id="headerFrame"
        frameborder="0"
        scrolling="no"
        title="Header">
    </iframe>
        
<div class="container">

    <h1>Porma sa Pag-ila sa Panginahanglanon sa Komunidad</h1>
    <h2>Barangay Triangulo, Nasipit, Agusan del Norte</h2>

    <form id="surveyForm">

    <!-- PERSONAL INFO -->
    <section>
        <h3>Personal nga Impormasyon</h3>

        <div class="row">
            <label>Ngalan:</label>
            <input type="text" name="respondent_name">
            <label>Trabaho:</label>
            <input type="text" name="respondent_job">
        </div>

        <div class="row">
            <label>Edukasyon:</label>
            <input type="text" name="respondent_education">
            <label>Edad:</label>
            <input type="number" name="respondent_age">
        </div>

        <div class="row">
            <label>Ngalan sa Bana/Asawa:</label>
            <input type="text" name="spouse_name">
            <label>Trabaho:</label>
            <input type="text" name="spouse_job">
        </div>

        <div class="row">
            <label>Edukasyon:</label>
            <input type="text" name="spouse_education">
            <label>Edad:</label>
            <input type="number" name="spouse_age">
        </div>
    </section>

    <!-- DISTRICT -->
    <section>
        <h3>Imong Distrito</h3>

        <div class="checkbox-group">
            <label><input type="checkbox" name="district[]" value="District 1"> District 1</label>
            <label><input type="checkbox" name="district[]" value="District 2"> District 2</label>
            <label><input type="checkbox" name="district[]" value="District 3"> District 3</label>
            <label><input type="checkbox" name="district[]" value="District 4"> District 4</label>
            <label><input type="checkbox" name="district[]" value="District 5"> District 5</label>
            <label><input type="checkbox" name="district[]" value="District 6"> District 6</label>
            <label><input type="checkbox" name="district[]" value="District 7"> District 7</label>
           
        </div>
    </section>

    <!-- SECTION A -->
    <section>
        <h3>A. PROFILE SA PAMILYA</h3>

        <p>1. Relihiyon</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="religion[]" value="Katoliko Romano"> Katoliko Romano</label>
            <label><input type="checkbox" name="religion[]" value="Protestante"> Protestante</label>
            <label><input type="checkbox" name="religion[]" value="Born Again Christian"> Born Again Christian</label>
            <label><input type="checkbox" name="religion[]" value="Iglesia ni Cristo"> Iglesia ni Cristo</label>
            <label><input type="checkbox" name="religion[]" value="Muslim"> Muslim</label>
            <label>Uban pa: <input type="text" name="other_religion" class="short"></label>
        </div>
    
        <p>2. Unsa ang panginabuhian sa pamilya?</p>
        <input type="text" name="family_livelihood" class="long">

        <p>Kung negosyo, unsa man nga negosyo:</p>
        <input type="text" name="business_type" class="long">

        <p>3. Pila ang suweldo matag bulan sa bana? :</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="husband_salary" value="1,000 pa ubos"> 1,000 pa ubos</label>
            <label><input type="checkbox" name="husband_salary" value="1,001 – 3,000"> 1,001 – 3,000</label>
            <label><input type="checkbox" name="husband_salary" value="3,001 – 5,000"> 3,001 – 5,000</label>
            <label><input type="checkbox" name="husband_salary" value="5,001 – 8,000"> 5,001 – 8,000</label>
            <label><input type="checkbox" name="husband_salary" value="8,001 – 10,000"> 8,001 – 10,000</label>
            <label><input type="checkbox" name="husband_salary" value="10,001 – pataas"> 10,001 – pataas</label>
            <label><input type="checkbox" name="husband_salary" value="Walay trabaho"> Walay trabaho</label>
        </div>

        <p>4.Pila ang suweldo matag bulan sa asawa? :</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="wife_salary" value="1,000 pa ubos"> 1,000 pa ubos</label>
            <label><input type="checkbox" name="wife_salary" value="1,001 – 3,000"> 1,001 – 3,000</label>
            <label><input type="checkbox" name="wife_salary" value="3,001 – 5,000"> 3,001 – 5,000</label>
            <label><input type="checkbox" name="wife_salary" value="5,001 – 8,000"> 5,001 – 8,000</label>
            <label><input type="checkbox" name="wife_salary" value="8,001 – 10,000"> 8,001 – 10,000</label>
            <label><input type="checkbox" name="wife_salary" value="10,001 – pataas"> 10,001 – pataas</label>
            <label><input type="checkbox" name="wife_salary" value="Walay trabaho"> Walay trabaho</label>
        </div>

        <p>5. Gidaghanon sa mga Anak:</p>
        <div class="checkbox-group">
                <label><input type="checkbox" name="number_of_children[]" value="0"> 0</label>
                <label><input type="checkbox" name="number_of_children[]" value="1"> 1</label>
                <label><input type="checkbox" name="number_of_children[]" value="2"> 2</label>
                <label><input type="checkbox" name="number_of_children[]" value="3"> 3</label>
                <label><input type="checkbox" name="number_of_children[]" value="4"> 4</label>
                <label>Uban pa: <input type="text" name="other_number_of_children" class="short"></label>
        </div>
        <p>6. Edad sa mga Anak:</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="children_age_groups[]" value="0-4"> 0-4</label>
            <label><input type="checkbox" name="children_age_groups[]" value="5-8"> 5-8</label>
            <label><input type="checkbox" name="children_age_groups[]" value="9-12"> 9-12</label>
            <label><input type="checkbox" name="children_age_groups[]" value="13-16"> 13-16</label>
            <label>Uban pa: <input type="text" name="other_children_age" class="short"></label>
        </div>

        <p>7. Grado nga gi-eskwelahan sa mga anak:</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="children_grade[]" value="Elementary"> Elementary</label>
            <label><input type="checkbox" name="children_grade[]" value="Grade 7"> Grade 7</label>
            <label><input type="checkbox" name="children_grade[]" value="Grade 8"> Grade 8</label>
            <label><input type="checkbox" name="children_grade[]" value="Grade 9"> Grade 9</label>
            <label><input type="checkbox" name="children_grade[]" value="Grade 10"> Grade 10</label>
            <label><input type="checkbox" name="children_grade[]" value="Grade 11"> Grade 11</label>
            <label><input type="checkbox" name="children_grade[]" value="Grade 12"> Grade 12</label>
            <label><input type="checkbox" name="children_grade[]" value="College Level"> College Level</label>
            <label><input type="checkbox" name="children_grade[]" value="Wala nag Eskwela"> Wala nag Eskwela</label>

        </div>

        <p>8. Aduna ba kay anak nga nagtrabaho na?</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="working_child" value="Oo"> Oo</label>
            <label><input type="checkbox" name="working_child" value="Wala"> Wala</label>
        </div>

        <p>9. Kung oo, pila ang nagtrabaho?</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="number_of_working_children" value="1"> 1</label>
            <label><input type="checkbox" name="number_of_working_children" value="2"> 2</label>
            <label><input type="checkbox" name="number_of_working_children" value="3"> 3</label>
            <label><input type="checkbox" name="number_of_working_children" value="4"> 4</label>
            <label>uban pa: <input type="text" name="other_number_of_working_children" class="short"></label>
        </div>

        <p>10. Aduna ba kay miyembro sa pamilya nga adunay kapansanan o sakit?</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="family_health_issue" value="Oo"> Oo</label>
            <label><input type="checkbox" name="family_health_issue" value="Wala"> Wala</label>
            <label>Kung naa, pila?<input type="text" name="family_health_issue_count" class="short"></label>
        </div>
    
    </section>


    <!-- SECTION B -->
    <section>
        <h3>B. KABALAKA-AN SA KOMUNIDAD</h3>
        
        <p>11. Unsa ang kasagaran nga problema sa panglawas sa inyong pamilya? Palihog hatag ug numero 1-10. Ang numero 1 ang pinaka problema.</p>
        <div class="dropbox-group">
           <label for="ubo">Ubo ug Sip-on:</label>
                    <select id="ubo" name="ubo" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
            <label for="std">STD:</label>
                    <select id="std" name="std" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
            <label for="diabetes">Diabetes:</label>
                    <select id="diabetes" name="diabetes" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>     
            <label for="hilanat">Hilanat:</label>
                    <select id="hilanat" name="hilanat" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>    
             <label for="migraine">Migraine:</label>
                    <select id="migraine" name="migraine" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select> 
             <label for="dengue">Dengue:</label>
                    <select id="dengue" name="dengue" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>    
            <label for="diarrhea">Diarrhea:</label>
                    <select id="diarrhea" name="diarrhea" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
            <label for="tuberkulosis">Tuberkulosis:</label>
                    <select id="tuberkulosis" name="tuberkulosis" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>  
            <label for="typhoid_fever">Typhoid Fever:</label>
                    <select id="typhoid_fever" name="typhoid_fever" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>    
            <label for="rayuma">Rayuma:</label>
                    <select id="rayuma" name="rayuma" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>  
            <label for="high_blood_pressure">High Blood Pressure:</label>
                    <select id="high_blood_pressure" name="high_blood_pressure" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>     
                           
        </div>

        <label>12. Uban pa, palihog isulat:<input type="text" name="other_health_problems" class="long"></label>

        <p>13. Paglaraw sa Kasilyas</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="toilet_type" value="Flush"> Flush</label>
            <label><input type="checkbox" name="toilet_type" value="Antipolo"> Antipolo</label>
            <label><input type="checkbox" name="toilet_type" value="Water-sealed"> Water-sealed</label>
            <label><input type="checkbox" name="toilet_type" value="Walay CR"> Walay CR</label>
        </div>
        
        <p>14. Unsa ang inyong pamaagi sa paglabay sa basura:</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="waste_disposal" value="Compost Pit"> Compost Pit</label>
            <label><input type="checkbox" name="waste_disposal" value="Koleksyon sa Basura"> Koleksyon sa Basura</label>
        </div>

        <p>15. Unsa ang pinaka-dali nga problema sa inyong distrito?</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="main_district_problem[]" value="Kakulangan sa Trabaho"> Drug trafficking</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Kalinaw ug Kahapsay"> Kalinaw ug Kahapsay</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Malnutrition"> Malnutrition</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Kasilyas"> Kasilyas</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Early pregnancy"> Early pregnancy</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Panginabuhi"> Panginabuhi</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Mga bata nga dili kamao mobasa"> Mga bata nga dili kamao mobasa</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Kawulang sa trabaho"> Kawulang sa trabaho</label>
            <label><input type="checkbox" name="main_district_problem[]" value="Dugang kita aron masuportahan ang pamilya"> Dugang kita aron masuportahan ang pamilya</label>
            <label>Uban pa, palihog tibugi<input type="text" name="other_main_district_problem" class="short"></label>
        </div>
        <p>16. Aduna ba mo’y problema sa kalinaw ug kahapsay sa inyong distrito?</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="peace_and_order_issue[]" value="Oo"> Oo</label>
            <label><input type="checkbox" name="peace_and_order_issue[]" value="Wala"> Wala</label>
        </div>

        <p>17. Kinahanglan ba ang training para sa mga Barangay Tanod?</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="tanod_training" value="Oo"> Oo</label>
            <label><input type="checkbox" name="tanod_training" value="Wala"> Wala</label>
        </div>

        <p>18. Unsa man ang gikinahanglan nga mga training ang kinahanglan alang sa Barangay Tanod ug alang sa mga katawhan. Palihog hatag og numero 1-10. Ang numero 1 ang pinaka problema.</p>
         <div class="dropbox-group">
                    <label for="law_training">Basic Law Enforcement Training:</label>
                    <select id="law_training" name="law_training" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="conflict_resolution">Community Policing and Conflict Resolution Training:</label>
                    <select id="conflict_resolution" name="conflict_resolution" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="disaster_preparedness">Disaster Preparedness and Response Training:</label>
                    <select id="disaster_preparedness" name="disaster_preparedness" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="human_rights">Human Rights and Ethical Conduct Training:</label>
                    <select id="human_rights" name="human_rights" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="fire_safety">Fire Safety and Firefighting Training:</label>
                    <select id="fire_safety" name="fire_safety" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="self_defense">Basic Self-defense and Physical Fitness Training:</label>
                    <select id="self_defense" name="self_defense" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="crisis_intervention">Crisis Intervention Training:</label>
                    <select id="crisis_intervention" name="crisis_intervention" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="weapons_handling">Weapons Handling and Security Procedures:</label>
                    <select id="weapons_handling" name="weapons_handling" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="environmental_protection">Environmental Protection and Waste Mgmt Training:</label>
                    <select id="environmental_protection" name="environmental_protection" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="cybersecurity"> Cybersecurity and Online Safety Training:</label>
                    <select id="cybersecurity" name="cybersecurity" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
        </div>

        <p>19. Unsa nga mga seminar ang pinakaliknahanang sa inyong distrito? Palihug hatagi ug numero 1-10. Ang numero 1 ang pinaka problema.</p>
        <div class="dropbox-group">
            <label for="seminar_health">Seminar bahin sa panglawas (HIV/STD, Drug Symposium, Early Pregnancy, mga sakit nga makatakod, sakit sa kasingkasing, rayuma, arthritis, diabetes, basic first aid):</label>
                    <select id="seminar_health" name="seminar_health" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="seminar_environment">Seminar sa kalikupan (Pagpreserba ug proteksyon sa kalikupan, hustong paglabay sa basura):</label>
                    <select id="seminar_environment" name="seminar_environment" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="seminar_relihiyon">Seminar sa relihiyon (Pagpalambo sa mga maayong batasan, responsable nga pagka-ginikanan):</label>
                    <select id="seminar_relihiyon" name="seminar_relihiyon" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                     <label for="edukasyonal_nga_seminar">Edukasyonal nga seminar (Crime Prevention, Basic Bookkeeping)</label>
                    <select id="edukasyonal_nga_seminar" name="edukasyonal_nga_seminar" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label for="seminar_sa_panginabuhi">Seminar sa panginabuhi (Organisasyon sa kooperatiba, pag-atiman og hayop)</label>
                    <select id="seminar_sa_panginabuhi" name="seminar_sa_panginabuhi" required>
                        <option value="">Pili-a ang ranggo</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                    </select>
                    <label>Uban pa, palihog isulat:<input type="text" name="other_district_seminars" class="short"></label>
           
        </div>
        <p>20. Unsa nga mga training ang pinakakinahangan sa inyong distrito? Palihog ranggohi:</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="district_training_needs[]" value="Baking and Cooking for Mothers"> Baking ug cooking para sa mga inahan</label>
            <label><input type="checkbox" name="district_training_needs[]" value="Computer Literacy for Out-of-School Youth"> Computer Literacy training para sa out-of-school youth</label>
            <label><input type="checkbox" name="district_training_needs[]" value="Basic Law Enforcement Training"> Crime prevention ug disaster management para sa mga Barangay Tanod ug opisyales</label>
            <label>Uban pa, palihog isulat:<input type="text" name="other_district_training_needs" class="short"></label>

        </div>

        
    </section>

    <!-- SECTION C -->
    <section>
        <h3>C. MGA RELIHIYOSONG AKTIBIDAD</h3>

        <p>21. Unsa nga relihiyosong mga kalihokan ang imong gusto Makita sa komunidad? Butangi og check mark (/), ang gusto nimo.</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="religious_activities[]" value="lecture kabahin sa mga sakramento sa simbahan"> lecture kabahin sa mga sakramento sa simbahan</label>
            <label><input type="checkbox" name="religious_activities[]" value="Mga grupo sa pagtuon sa bibliya"> Mga grupo sa pagtuon sa bibliya</label>
            <label><input type="checkbox" name="religious_activities[]" value="Espiritual nga retreats ug recollections"> Espiritual nga retreats ug recollections</label>
            <label><input type="checkbox" name="religious_activities[]" value="Mga programa para sa pagpalig-on sa pagtuo sa kabatan-onan ug pamilya"> Mga programa para sa pagpalig-on sa pagtuo sa kabatan-onan ug pamilya</label>
            <label><input type="checkbox" name="religious_activities[]" value="Groupo sa pag-ampo o intercessory minitries"> Groupo sa pag-ampo o intercessory minitries</label>
            <label>Uban pa(palihog isulat):<input type="text" name="other_religious_activities" class="short"></label>

        </div>

        <p>22.Unsa ang labing importante para nimo sa Imong espiritwal nga kinabuhi? Butangi og check mark (/), ang gusto nimo.</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="important_religious_activities[]" value="Pag-ampo ug meditasyon"> Pag-ampo ug meditasyon</label>
            <label><input type="checkbox" name="important_religious_activities[]" value="Pagtuon sa Bibliya o relihiyosong edukasyon"> Pagtuon sa Bibliya o relihiyosong edukasyon</label>
            <label><input type="checkbox" name="important_religious_activities[]" value="Pagsalmot sa mga pagsimba"> Pagsalmot sa mga pagsimba</label>
            <label><input type="checkbox" name="important_religious_activities[]" value="Espiritual nga tambag ug giya"> Espiritual nga tambag ug giya</label>
            <label><input type="checkbox" name="important_religious_activities[]" value="Pag-alagad ug tabang sa uban"> Pag-alagad ug tabang sa uban</label>
            <label>Uban pa(palihog isulat):<input type="text" name="other_important_religious_activities" class="short"></label>
        </div>

        <p>23. Unsaon nimo pagpalambo sa Imong espiritwal nga kinabuhi? Butangi og check mark (/), ang gusto nimo.</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="spiritual_growth[]" value="Pagsalmot sa retreats o recollections"> Pagsalmot sa retreats o recollections</label>
            <label><input type="checkbox" name="spiritual_growth[]" value="Pagtuon sa Bibliya o relihiyosong edukasyon"> Apil sa gagmay nga faith-sharing groups</label>
            <label><input type="checkbox" name="spiritual_growth[]" value="Pagsalmot sa mga pagsimba"> Moapil sa youth o family-focused nga relihiyosong events</label>
            <label>Uban pa(palihog isulat):<input type="text" name="other_spiritual_growth" class="short"></label>
        </div>

        <p>224.Pila ka beses ka mosalmot sa relihiyosong kalihokan? Butangi og check mark (/), ang gusto nimo.</p>
        <div class="checkbox-group">
            <label><input type="checkbox" name="spiritual_activity_frequency" value="Adlaw-adlaw"> Adlaw-adlaw</label>
            <label><input type="checkbox" name="spiritual_activity_frequency" value="Kada bulan"> Kada bulan</label>
            <label><input type="checkbox" name="spiritual_activity_frequency" value="Kada Semana"> Kada Semana</label>
            <label><input type="checkbox" name="spiritual_activity_frequency" value="Panagsa ra"> Panagsa ra</label>  
            <label><input type="checkbox" name="spiritual_activity_frequency" value="Wala gyud"> Wala gyud</label>  
        </div>            

        <p>25. Panginahanglan sa Barangay nga pwede buhaton sa SMCC</p>
        <textarea name="barangay_needs" rows="4"></textarea>
    </section>

    <input type="hidden" name="barangay" value="<?php echo $barangay; ?>">
    <button class="submit-btn" type="submit">Submit</button>

</form>
<script src="./js/survey.js"></script>
</div>
 

</body>
</html>