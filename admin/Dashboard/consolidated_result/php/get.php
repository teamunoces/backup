<?php
$surveyHost = 'localhost';
$surveyDBName = 'questionnaire';
$surveyUser = 'root';
$surveyPass = '';

$demoHost = 'localhost';
$demoDBName = 'demographic_totals';
$demoUser = 'root';
$demoPass = '';

header('Content-Type: application/json');

try {
    // Connect to survey database
    $surveyPdo = new PDO("mysql:host=$surveyHost;dbname=$surveyDBName;charset=utf8", $surveyUser, $surveyPass);
    $surveyPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Connect to demographics database
    $demoPdo = new PDO("mysql:host=$demoHost;dbname=$demoDBName;charset=utf8", $demoUser, $demoPass);
    $demoPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get selected barangay from GET parameter
    $barangay = $_GET['barangay'] ?? '';
    $barangay = strtolower($barangay); // normalize

    $data = [];

    // -------- TABLE 1. POPULATION & HOUSEHOLDS --------
    $stmt = $demoPdo->prepare("SELECT population, households FROM $barangay LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $population = (int)($row['population'] ?? 0);
    $households = (int)($row['households'] ?? 0);
    $data['demographics'][$barangay] = [
        'population' => $population,
        'households' => $households
    ];

    // -------- TOTAL RESPONDENTS --------
    $stmt = $surveyPdo->query("SELECT COUNT(*) AS total FROM $barangay");
    $totalRespondents = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
    $data['respondents'][$barangay] = $totalRespondents;
    $data['totalRespondents'] = $totalRespondents;

    // -------- RESPONSE PERCENTAGE --------
    $data['percentages'][$barangay] = $population > 0 ? round(($totalRespondents / $population) * 100, 2) : 0;

                   // -------- TABLE 2. RELIGION COUNT --------

                                        $types = [
                                            "Katoliko Romano",
                                            "Protestante",
                                            "Muslim",
                                            "Iglesia ni Cristo",
                                            "Born Again Christian"
                                        ];

                                        // total answered religion (exclude null)
                                        $totalStmt = $surveyPdo->query("
                                            SELECT COUNT(*) 
                                            FROM `$barangay`
                                            WHERE religion IS NOT NULL AND religion != ''
                                        ");
                                        $total = (int)$totalStmt->fetchColumn();

                                        $data['religion'] = [];

                                        /* -------- PREDEFINED RELIGIONS -------- */
                                        foreach ($types as $t){

                                            $stmt = $surveyPdo->prepare("
                                                SELECT COUNT(*) 
                                                FROM `$barangay`
                                                WHERE religion = ?
                                            ");
                                            $stmt->execute([$t]);
                                            $main = (int)$stmt->fetchColumn();

                                            $data['religion'][] = [
                                                "religion"=>$t,
                                                "total"=>$main,
                                                "other"=>0,
                                                "display"=>$t." (".$main.",0)",
                                                "percentage"=>$total ? round($main/$total*100,2) : 0
                                            ];
                                        }

                                       /* -------- TYPED OTHER RELIGIONS AS ONE ROW -------- */
                                        $stmt = $surveyPdo->query("
                                            SELECT Other_religion, COUNT(*) AS total
                                            FROM `$barangay`
                                            WHERE Other_religion IS NOT NULL
                                            AND Other_religion != ''
                                            GROUP BY Other_religion
                                            ORDER BY total DESC
                                        ");

                                        $typedArr = [];
                                        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                            $typedArr[] = $row['Other_religion']; // just the values
                                            // if you want counts: $typedArr[] = $row['Other_religion'] . "," . $row['total'];
                                        }

                                        if (!empty($typedArr)) {
                                            $data['religion'][] = [
                                                "religion" => "Others",
                                                "total" => count($typedArr), // number of different typed religions
                                                "other" => count($typedArr),
                                                "display" => "Others (" . implode(",", $typedArr) . ")", // combined in one row
                                                "percentage" => 0 // optional
                                            ];
                                        }

/* -------- SORT -------- */
usort($data['religion'], fn($a,$b)=>$b['total']-$a['total']);

/* -------- RANK -------- */
$rank=1;
foreach($data['religion'] as &$row){
    $row['rank']=$rank++;
}
unset($row);



    // -------- TABLE 3. SOURCE OF INCOME --------
    $incomeData = [];
    $stmt = $surveyPdo->query("SELECT COUNT(*) AS total FROM $barangay WHERE family_livelihood IS NOT NULL AND family_livelihood != ''");
    $incomeData[] = ['source' => 'family_livelihood', 'total' => (int)$stmt->fetch(PDO::FETCH_ASSOC)['total']];
    $stmt = $surveyPdo->query("SELECT COUNT(*) AS total FROM $barangay WHERE business_type IS NOT NULL AND business_type != ''");
    $incomeData[] = ['source' => 'Business', 'total' => (int)$stmt->fetch(PDO::FETCH_ASSOC)['total']];
    $data['income'] = $incomeData;

    // --------TABLE 4. MONTHLY INCOME --------
  $incomeBrackets = [
    "1000-or-less" => "1,000 pa ubos",
    "1001-3000" => "1,001 - 3,000",
    "3001-5000" => "3,001 - 5,000",
    "5001-8000" => "5,001 - 8,000",
    "8001-10000" => "8,001 - 10,000",
    "10001-above" => "10,001 - pataas",
    "no-income" => "Walay trabaho"
];

$monthlyIncome = [];

foreach ($incomeBrackets as $label => $value) {

    $stmt = $surveyPdo->query("
        SELECT 
        SUM(CASE WHEN husband_salary = '$value' THEN 1 ELSE 0 END) AS bana,
        SUM(CASE WHEN wife_salary = '$value' THEN 1 ELSE 0 END) AS asawa
        FROM $barangay
    ");

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    $bana = (int)$row['bana'];
    $asawa = (int)$row['asawa'];

    $total = $bana + $asawa;
    $percent = $totalRespondents > 0 ? round(($total / $totalRespondents) * 100, 2) : 0;

    $monthlyIncome[] = [
        'label' => $label,
        'bana' => $bana,
        'asawa' => $asawa,
        'total' => $total,
        'percentage' => $percent
    ];
}
    $data['monthlyIncome'] = $monthlyIncome;

    // --------TABLE 5. EDUCATION --------
    $educationLevels = ["Elementary", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 12", "College Level", "Wala nag Eskwela"];
    $educationData = [];
    foreach ($educationLevels as $level) {
    if ($level === "No Response") {
        $stmt = $surveyPdo->prepare("SELECT COUNT(*) AS total FROM $barangay WHERE children_grade IS NULL OR children_grade = ''");
        $stmt->execute();
    } else {
        $stmt = $surveyPdo->prepare("SELECT COUNT(*) AS total FROM $barangay WHERE children_grade LIKE :level");
        $stmt->execute(['level' => "%$level%"]);
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $total = $row ? (int)$row['total'] : 0;
    $percent = $totalRespondents > 0 ? round(($total / $totalRespondents) * 100, 2) : 0;
    $educationData[] = ['level' => $level, 'total' => $total, 'percentage' => $percent];
}
    // Sort descending
    usort($educationData, fn($a,$b)=>$b['total']-$a['total']);
    // Assign ranks with ties
    $rank = 0;
    $prevTotal = null;
    $skip = 1;
    foreach($educationData as $i => &$row){
        if($row['total'] !== $prevTotal){
            $rank += $skip;
            $skip = 1;
        } else {
            $skip++;
        }
        $row['rank'] = $rank;
        $prevTotal = $row['total'];
    }
    $data['education'] = $educationData;

    // --------TABLE 6. AGE OF CHILDREN --------

    // Get total respondents
        $stmt = $surveyPdo->prepare("SELECT COUNT(*) as total FROM $barangay");
        $stmt->execute();
        $totalRespondents = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $ageGroups = [
            "0-4" => "0-4",
            "5-8" => "5-8",
            "9-12" => "9-12",
            "13-16" => "13-16"
        ];

        $ageData = [];

        foreach ($ageGroups as $label => $value) {

            $stmt = $surveyPdo->prepare("
                SELECT COUNT(*) AS total 
                FROM $barangay 
                WHERE children_age_groups = :value
            ");

            $stmt->execute(['value'=>$value]);

            $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $percent = $totalRespondents > 0 
                ? round(($total / $totalRespondents) * 100, 2) 
                : 0;

            $ageData[] = [
                'group'=>$label,
                'total'=>$total,
                'percentage'=>$percent
            ];
        }
    $data['age'] = $ageData;

                                    // --------TABLE 7. PWD --------
                                        $types = ["Oo","Wala"];

                                        // total answered
                                        $totalStmt = $surveyPdo->query("
                                            SELECT COUNT(*) 
                                            FROM `$barangay`
                                            WHERE family_health_issue IS NOT NULL 
                                            AND family_health_issue != ''
                                        ");
                                        $total = (int)$totalStmt->fetchColumn();

                                        $data['pwd'] = [];

                                        /* ---------- Oo + Wala ---------- */
                                        foreach ($types as $t) {

                                            $stmt = $surveyPdo->prepare("
                                                SELECT COUNT(*) 
                                                FROM `$barangay`
                                                WHERE family_health_issue = ?
                                            ");
                                            $stmt->execute([$t]);
                                            $count = (int)$stmt->fetchColumn();

                                            $data['pwd'][] = [
                                                "pwd"=>$t,
                                                "total"=>$count,
                                                "percentage"=>$total>0 ? round($count/$total*100,2) : 0
                                            ];
                                        }

                                        /* ---------- Rank ONLY Oo + Wala ---------- */
                                        usort($data['pwd'], fn($a,$b)=>$b['total']-$a['total']);

                                        $rank = 1;
                                        foreach ($data['pwd'] as &$row){
                                            $row['rank'] = $rank++;
                                        }
                                        unset($row);

                                        /* ---------- Others (always last, no rank) ---------- */
                                        $stmt = $surveyPdo->query("
                                            SELECT SUM(family_health_issue_count)
                                            FROM `$barangay`
                                            WHERE family_health_issue_count IS NOT NULL
                                            AND family_health_issue_count != ''
                                        ");
                                        $othersTotal = (int)$stmt->fetchColumn();

                                        if ($othersTotal > 0){
                                            $data['pwd'][] = [
                                                "pwd"=>"Total Number of PWD",
                                                "total"=>$othersTotal,
                                                "percentage"=>$total>0 ? round($othersTotal/$total*100,2) : 0,
                                                "rank"=>"-"   // no rank
                                            ];
                                        }

                            // -------- TABLE 8 HEALTH CONCERNS --------
                            $healthColumns = [
                                "Ubo" => "ubo",
                                "STD" => "std",
                                "Diabetes" => "diabetes",
                                "Hilanat" => "hilanat",
                                "Migraine" => "migraine",
                                "Dengue" => "dengue",
                                "Diarrhea" => "diarrhea",
                                "Tuberkulosis" => "tuberkulosis",
                                "Rayuma" => "rayuma",
                                "Typhoid Fever" => "typhoid_fever",
                                "High Blood Pressure" => "high_blood_pressure"
                            ];

                            $healthData = [];

                            foreach ($healthColumns as $label => $col) {
                                $stmt = $surveyPdo->query("
                                    SELECT AVG($col) AS avg_rank, COUNT($col) AS total
                                    FROM `$barangay`
                                    WHERE $col IS NOT NULL AND $col <> ''
                                ");
                                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                                $healthData[] = [
                                    "heal" => $label,
                                    "wm" => $row['avg_rank'] !== null ? round($row['avg_rank'], 2) : 0,
                                    "total" => (int)($row['total'] ?? 0)
                                ];
                            }

                            // Sort: lower average_rank = higher priority
                            usort($healthData, fn($a, $b) => $a['wm'] <=> $b['wm']);

                            // Assign ranks (1 = highest priority)
                            $rank = 1;
                            foreach ($healthData as &$row) {
                                $row['rank'] = $rank++;
                            }

                            $data['heal'] = $healthData;


    // --------TABLE 9 toilet type --------
            $types = ["Flush","Antipolo","Water-sealed","Walay CR"];
            $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

            $data['toilet'] = array_map(function($t) use ($surveyPdo,$barangay,$total){
                $stmt = $surveyPdo->prepare("SELECT COUNT(*) FROM `$barangay` WHERE toilet_type=?");
                $stmt->execute([$t]);
                $c = (int)$stmt->fetchColumn();
                return [
                    "toilet"=>$t,
                    "total"=>$c,
                    "percentage"=>$total ? round($c/$total*100,2) : 0
                ];
            }, $types);

            // sort + rank
            usort($data['toilet'], fn($a,$b)=>$b['total']-$a['total']);
            $r=1;$p=null;
            foreach($data['toilet'] as $i=>&$row){
                if($p!==null && $row['total']<$p) $r=$i+1;
                $row['rank']=$r;
                $p=$row['total'];
            }

            // -------------------- TABLE 10 waste disposal-------------
            $types = ["Compost Pit","Koleksyon sa Basura"];
            $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

            $data['waste'] = array_map(function($t) use ($surveyPdo,$barangay,$total){
                $stmt = $surveyPdo->prepare("SELECT COUNT(*) FROM `$barangay` WHERE waste_disposal=?");
                $stmt->execute([$t]);
                $c = (int)$stmt->fetchColumn();
                return [
                    "waste"=>$t,
                    "total"=>$c,
                    "percentage"=>$total ? round($c/$total*100,2) : 0
                ];
            }, $types);

            // sort + rank
            usort($data['waste'], fn($a,$b)=>$b['total']-$a['total']);
            $r=1;$p=null;
            foreach($data['waste'] as $i=>&$row){
                if($p!==null && $row['total']<$p) $r=$i+1;
                $row['rank']=$r;
                $p=$row['total'];
            }

                    // --------TABLE 11 DISTRICT PROBLEMS --------
                    $types = [
                            "Drug trafficking",
                            "Malnutrition", 
                            "Early pregnancy",
                            "Mga bata nga dili kamao mo basa",
                            "Dugang kita aron masuportahan ang pamilya",
                            "Lack of health services",
                            "Kakuwang sa trabaho",
                            "Panginabuhi",
                            "Kasilyas"
                    ];

                    // total respondents
                    $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                    $data['problem'] = [];

                    // 1️⃣ Count predefined problems
                    foreach ($types as $t) {
                        $stmt = $surveyPdo->prepare("
                            SELECT COUNT(*) FROM `$barangay`
                            WHERE main_district_problem LIKE ?
                        ");
                        $stmt->execute(["%$t%"]);
                        $c = (int)$stmt->fetchColumn();

                        $data['problem'][] = [
                            "problem"=>$t,
                            "total"=>$c,
                            "percentage"=>$total ? round($c/$total*100,2) : 0
                        ];
                    }

                    // 2️⃣ Count ALL typed answers as "Others"
                    $stmt = $surveyPdo->query("
                        SELECT COUNT(*) FROM `$barangay`
                        WHERE other_main_district_problem IS NOT NULL
                        AND other_main_district_problem <> ''
                    ");
                    $others = (int)$stmt->fetchColumn();

                    $data['problem'][] = [
                        "problem"=>"Others",
                        "total"=>$others,
                        "percentage"=>$total ? round($others/$total*100,2) : 0
                    ];

                    // 3️⃣ Sort + Rank
                    usort($data['problem'], fn($a,$b)=>$b['total']-$a['total']);
                    $r=1;$p=null;
                    foreach($data['problem'] as $i=>&$row){
                        if($p!==null && $row['total']<$p) $r=$i+1;
                        $row['rank']=$r;
                        $p=$row['total'];
                    }


                    // --------------------TABL2 12. Peace and Order-------------
                        $types = ["Oo","Wala"];
                        $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                        $data['peace'] = array_map(function($t) use ($surveyPdo,$barangay,$total){
                            $stmt = $surveyPdo->prepare("SELECT COUNT(*) FROM `$barangay` WHERE peace_and_order_issue=?");
                            $stmt->execute([$t]);
                            $c = (int)$stmt->fetchColumn();
                            return [
                                "peace"=>$t,
                                "total"=>$c,
                                "percentage"=>$total ? round($c/$total*100,2) : 0
                            ];
                        }, $types);

                        // sort + rank
                        usort($data['peace'], fn($a,$b)=>$b['total']-$a['total']);
                        $r=1;$p=null;
                        foreach($data['peace'] as $i=>&$row){
                            if($p!==null && $row['total']<$p) $r=$i+1;
                            $row['rank']=$r;
                            $p=$row['total'];
                        }

            
                    // -------------------- TABLE 13. Tanod Training --------------------
                                    $types = ["Oo", "Wala"];

                                    // count only answered respondents
                                    $totalStmt = $surveyPdo->query("
                                        SELECT COUNT(*) 
                                        FROM `$barangay` 
                                        WHERE tanod_training IS NOT NULL 
                                        AND tanod_training != ''
                                    ");
                                    $total = (int)$totalStmt->fetchColumn();

                                    $data['necessity'] = [];

                                    foreach ($types as $t) {

                                        $stmt = $surveyPdo->prepare("
                                            SELECT COUNT(*) 
                                            FROM `$barangay` 
                                            WHERE tanod_training = ?
                                        ");
                                        $stmt->execute([$t]);
                                        $count = (int)$stmt->fetchColumn();

                                        $data['necessity'][] = [
                                            "necessity" => $t,
                                            "total" => $count,
                                            "percentage" => $total > 0 ? round(($count/$total)*100,2) : 0
                                        ];
                                    }

                                    // ranking
                                    usort($data['necessity'], function($a,$b){
                                        return $b['total'] - $a['total'];
                                    });

                                    $rank = 1;
                                    foreach ($data['necessity'] as &$row) {
                                        $row['rank'] = $rank++;
                                    }
                                    unset($row);


            
              // --------TABLE 14. Types of Training Ranked --------
                            $needColumns = [
                                "Basic Law Enforcement Training"=>"law_training",
                                "Community Policing & Conflict Resolution"=>"conflict_resolution",
                                "Disaster Preparedness"=>"disaster_preparedness",
                                "Human Rights Training"=>"human_rights",
                                "Fire Safety Training"=>"fire_safety",
                                "Self-defense Training"=>"self_defense",
                                "Crisis Intervention"=>"crisis_intervention",
                                "Weapons Handling"=>"weapons_handling",
                                "Environmental Protection"=>"environmental_protection",
                                "Cybersecurity Training"=>"cybersecurity"
                            ];

                            $needData = [];

                            foreach ($needColumns as $label => $col) {

                                $stmt = $surveyPdo->query("
                                    SELECT 
                                        COALESCE(AVG($col),0) AS avg_rank,
                                        COUNT($col) AS total
                                    FROM `$barangay`
                                    WHERE $col IS NOT NULL AND $col != ''
                                ");

                                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                                // skip if no responses
                                if ((int)$row['total'] == 0) continue;

                                $needData[] = [
                                    "training" => $label,
                                    "average_rank" => round($row['avg_rank'],2),
                                    "responses" => (int)$row['total']
                                ];
                            }

                            /* Sort (lower avg = higher priority) */
                            usort($needData, fn($a,$b)=>$a['average_rank'] <=> $b['average_rank']);

                            /* Rank */
                            $rank=1;
                            foreach ($needData as &$row){
                                $row['rank']=$rank++;
                            }
                            unset($row);

                            $data['training_need'] = $needData;


                     // --------TABLE 15. Types of Seminar Ranked --------
                    $seminarColumns = [
                        "Seminar bahin sa panglawas"=>"seminar_health",
                        "Seminar sa kalikupan "=>"seminar_environment",
                        "Seminar sa relihiyon "=>"seminar_relihiyon",
                        "Edukasyonal nga seminar "=>"edukasyonal_nga_seminar",
                        "Seminar sa panginabuhi "=>"seminar_sa_panginabuhi",
                    ];

                    $seminarData = [];

                    foreach ($seminarColumns as $label => $col) {

                        $stmt = $surveyPdo->query("
                            SELECT AVG($col) AS avg_rank, COUNT($col) AS total
                            FROM `$barangay`
                            WHERE $col IS NOT NULL AND $col <> ''
                        ");

                        $row = $stmt->fetch(PDO::FETCH_ASSOC);

                        $seminarData[] = [
                            "seminar"=>$label,
                            "average_rank"=> $row['avg_rank'] ? round($row['avg_rank'],2) : 0,
                            "responses"=>(int)$row['total']
                        ];
                    }

                    // Lower average = higher priority
                    usort($seminarData, fn($a,$b)=>$a['average_rank'] <=> $b['average_rank']);

                    // Assign ranks
                    $r=1;
                    foreach($seminarData as &$row){
                        $row['rank']=$r++;
                    }

                    $data['seminar_need'] = $seminarData;


                   // --------TABLE 16. DISTRICT TRAINING FOR THE COMMUNITY --------
                    $types = [
                        "Baking and cooking for Mothers","Computer Literacy for Out-of-School Youth","Crime prevention ug disaster management para sa mga Barangay Tanod ug opisyales"
                    ];

                    // total respondents
                    $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                    $data['dtr'] = [];

                    // 1️⃣ Count predefined problems
                    foreach ($types as $t) {
                        $stmt = $surveyPdo->prepare("
                            SELECT COUNT(*) FROM `$barangay`
                            WHERE district_training_needs LIKE ?
                        ");
                        $stmt->execute(["%$t%"]);
                        $c = (int)$stmt->fetchColumn();

                        $data['dtr'][] = [
                            "dtr"=>$t,
                            "total"=>$c,
                            "percentage"=>$total ? round($c/$total*100,2) : 0
                        ];
                    }

                    // 2️⃣ Count ALL typed answers as "Others"
                    $stmt = $surveyPdo->query("
                        SELECT COUNT(*) FROM `$barangay`
                        WHERE other_district_training_needs IS NOT NULL
                        AND other_district_training_needs <> ''
                    ");
                    $others = (int)$stmt->fetchColumn();

                    $data['dtr'][] = [
                        "dtr"=>"Others",
                        "total"=>$others,
                        "percentage"=>$total ? round($others/$total*100,2) : 0
                    ];

                    // 3️⃣ Sort + Rank
                    usort($data['dtr'], fn($a,$b)=>$b['total']-$a['total']);
                    $r=1;$p=null;
                    foreach($data['dtr'] as $i=>&$row){
                        if($p!==null && $row['total']<$p) $r=$i+1;
                        $row['rank']=$r;
                        $p=$row['total'];
                    }

                    // -------- TABLE 17. DESIRED RELIGIOUS ACTIVITIES   --------
                    $types = [
                        "lecture kabahin sa mga sakramento sa simbahan","Mga grupo sa pagtuon sa bibliya","Espiritwal nga retreats ug recollections","Mga programa para sa pagpalig-on sa pagtuo sa kabatanonan ug pamilya","Grupo sa pag-ampo o intercessory ministries"
                    ];

                
                    // total respondents
                    $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                    $data['religious_act'] = [];

                    // 1️⃣ Count predefined problems
                    foreach ($types as $t) {
                        $stmt = $surveyPdo->prepare("
                            SELECT COUNT(*) FROM `$barangay`
                            WHERE religious_activities LIKE ?
                        ");
                        $stmt->execute(["%$t%"]);
                        $c = (int)$stmt->fetchColumn();

                        $data['religious_act'][] = [
                            "religious_act"=>$t,
                            "total"=>$c,
                            "percentage"=>$total ? round($c/$total*100,2) : 0
                        ];
                    }

                    // 2️⃣ Count ALL typed answers as "Others"
                    $stmt = $surveyPdo->query("
                        SELECT COUNT(*) FROM `$barangay`
                        WHERE other_religious_activities IS NOT NULL
                        AND other_religious_activities <> ''
                    ");
                    $others = (int)$stmt->fetchColumn();

                    $data['religious_act'][] = [
                        "religious_act"=>"Others",
                        "total"=>$others,
                        "percentage"=>$total ? round($others/$total*100,2) : 0
                    ];

                    // 3️⃣ Sort + Rank
                    usort($data['religious_act'], fn($a,$b)=>$b['total']-$a['total']);
                    $r=1;$p=null;
                    foreach($data['religious_act'] as $i=>&$row){
                        if($p!==null && $row['total']<$p) $r=$i+1;
                        $row['rank']=$r;
                        $p=$row['total'];
                    }

                    // --------   TABLE 18.  IMPORTANT RELIGIOUS ACTIVITY    --------
                    $types = [
                        "Pag-ampo ug meditasyon","Pagtuon sa Bibliya o relihiyosong edukasyon","Pagsalmot sa mga pagsimba","Espiritwal nga tambag ug giya","Pag-alagad ug tabang sa uban"
                        ,"Pag-alagad ug tabang sa uban"
                    ];

                
                    // total respondents
                    $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                    $data['ira'] = [];

                    // 1️⃣ Count predefined problems
                    foreach ($types as $t) {
                        $stmt = $surveyPdo->prepare("
                            SELECT COUNT(*) FROM `$barangay`
                            WHERE important_religious_activities LIKE ?
                        ");
                        $stmt->execute(["%$t%"]);
                        $c = (int)$stmt->fetchColumn();

                        $data['ira'][] = [
                            "ira"=>$t,
                            "total"=>$c,
                            "percentage"=>$total ? round($c/$total*100,2) : 0
                        ];
                    }

                    // 2️⃣ Count ALL typed answers as "Others"
                    $stmt = $surveyPdo->query("
                        SELECT COUNT(*) FROM `$barangay`
                        WHERE other_important_religious_activities IS NOT NULL
                        AND other_important_religious_activities <> ''
                    ");
                    $others = (int)$stmt->fetchColumn();

                    $data['ira'][] = [
                        "ira"=>"Others",
                        "total"=>$others,
                        "percentage"=>$total ? round($others/$total*100,2) : 0
                    ];

                    // 3️⃣ Sort + Rank
                    usort($data['ira'], fn($a,$b)=>$b['total']-$a['total']);
                    $r=1;$p=null;
                    foreach($data['ira'] as $i=>&$row){
                        if($p!==null && $row['total']<$p) $r=$i+1;
                        $row['rank']=$r;
                        $p=$row['total'];
                    }

                    // -------- TABLE 19    SPIRITUAL GROWTH    --------
                    $types = [
                        "Pagsalmot sa retreats o recollections","Apil sa gagmay nga faith-sharing groups","Moapil sa youth o family-focused nga relihiyosong events"
                    ];

                
                    // total respondents
                    $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                    $data['growth'] = [];

                    // 1️⃣ Count predefined problems
                    foreach ($types as $t) {
                        $stmt = $surveyPdo->prepare("
                            SELECT COUNT(*) FROM `$barangay`
                            WHERE spiritual_growth LIKE ?
                        ");
                        $stmt->execute(["%$t%"]);
                        $c = (int)$stmt->fetchColumn();

                        $data['growth'][] = [
                            "growth"=>$t,
                            "total"=>$c,
                            "percentage"=>$total ? round($c/$total*100,2) : 0
                        ];
                    }

                    // 2️⃣ Count ALL typed answers as "Others"
                    $stmt = $surveyPdo->query("
                        SELECT COUNT(*) FROM `$barangay`
                        WHERE other_spiritual_growth IS NOT NULL
                        AND other_spiritual_growth <> ''
                    ");
                    $others = (int)$stmt->fetchColumn();

                    $data['growth'][] = [
                        "growth"=>"Others",
                        "total"=>$others,
                        "percentage"=>$total ? round($others/$total*100,2) : 0
                    ];

                    // 3️⃣ Sort + Rank
                    usort($data['growth'], fn($a,$b)=>$b['total']-$a['total']);
                    $r=1;$p=null;
                    foreach($data['growth'] as $i=>&$row){
                        if($p!==null && $row['total']<$p) $r=$i+1;
                        $row['rank']=$r;
                        $p=$row['total'];
                    }


                    // -------------------- TABLE 20.  KA PILA SILA MAG AMPO    -------------
                        $types = ["Adlaw-adlaw ","Kada Semana","Kada bulan","Panagsa ra"];
                        $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay`")->fetchColumn();

                        $data['freq'] = array_map(function($t) use ($surveyPdo,$barangay,$total){
                            $stmt = $surveyPdo->prepare("SELECT COUNT(*) FROM `$barangay` WHERE spiritual_activity_frequency=?");
                            $stmt->execute([$t]);
                            $c = (int)$stmt->fetchColumn();
                            return [
                                "freq"=>$t,
                                "total"=>$c,
                                "percentage"=>$total ? round($c/$total*100,2) : 0
                            ];
                        }, $types);

                        // sort + rank
                        usort($data['freq'], fn($a,$b)=>$b['total']-$a['total']);
                        $r=1;$p=null;
                        foreach($data['freq'] as $i=>&$row){
                            if($p!==null && $row['total']<$p) $r=$i+1;
                            $row['rank']=$r;
                            $p=$row['total'];
                        }

                       // -------- TABLE 21. HELP NEEDED IN THE COMMUNITY --------

                            // Get total number of non-empty responses
                            $total = $surveyPdo->query("SELECT COUNT(*) FROM `$barangay` WHERE barangay_needs IS NOT NULL AND barangay_needs <> ''")->fetchColumn();

                            // Get counts per unique response
                            $stmt = $surveyPdo->query("
                                SELECT barangay_needs, COUNT(*) AS total_count
                                FROM `$barangay`
                                WHERE barangay_needs IS NOT NULL AND barangay_needs <> ''
                                GROUP BY barangay_needs
                            ");

                            $data['helps'] = [];
                            while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                                $data['helps'][] = [
                                    "helps" => $row['barangay_needs'],                   // user-provided answer
                                    "total" => (int)$row['total_count'],                // number of responses
                                    "percentage" => $total ? round($row['total_count']/$total*100,2) : 0 // percentage
                                ];
                            }

                            // Sort by total descending
                            usort($data['helps'], fn($a,$b)=>$b['total']-$a['total']);

                            // Assign ranks (1 = highest total)
                            $r=1; $p=null;
                            foreach($data['helps'] as $i=>&$row){
                                if($p!==null && $row['total']<$p) $r = $i+1;
                                $row['rank'] = $r;
                                $p = $row['total'];
                            }

    echo json_encode($data);

} catch(PDOException $e){
    echo json_encode(['error'=>$e->getMessage()]);
}
?>