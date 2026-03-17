<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header("Content-Type: application/json");

require_once "db_connection.php";

/* =========================
   ERROR HANDLING
========================= */
set_error_handler(function($errno, $errstr, $errfile, $errline){
    echo json_encode([
        "success" => false,
        "message" => "PHP Error",
        "error" => "$errstr in $errfile on line $errline"
    ]);
    exit;
});

set_exception_handler(function($e){
    echo json_encode([
        "success" => false,
        "message" => "PHP Exception",
        "error" => $e->getMessage()
    ]);
    exit;
});

/* =========================
   POST CHECK
========================= */
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit;
}

/* =========================
   BARANGAY TABLE
========================= */
$barangay = strtolower(trim($_POST['barangay'] ?? 'camagong'));
$allowedTables = ['aclan','amontay','ataatahon','barangay1','barangay2','barangay3','barangay4','barangay5','barangay6','barangay7','camagong','cubicubi','culit','jaguimitan','kinabajangan','punta','santaana','talisay','triangulo'];
if (!in_array($barangay, $allowedTables)) {
    echo json_encode(["success" => false,"message" => "Invalid barangay: $barangay"]);
    exit;
}
$table = $barangay;

/* =========================
   HELPER FUNCTION TO SAFE STRING
========================= */
function safeString($value) {
    // If it's an array, implode it. If it's null/empty, return null.
    if (is_array($value)) {
        // Filter out empty values from array before imploding
        $filtered = array_filter($value, function($v) {
            return $v !== "" && $v !== null;
        });
        return empty($filtered) ? null : implode(", ", $filtered);
    }
    
    // If it's not a string, convert it
    if (!is_string($value)) {
        return $value === null ? null : (string)$value;
    }
    
    return trim($value) === '' ? null : trim($value);
}

/* =========================
   COLLECT DATA
========================= */
$data = [
    safeString($_POST['respondent_name'] ?? null),
    safeString($_POST['respondent_job'] ?? null),
    safeString($_POST['respondent_education'] ?? null),
    safeString($_POST['respondent_age'] ?? null),

    safeString($_POST['spouse_name'] ?? null),
    safeString($_POST['spouse_job'] ?? null),
    safeString($_POST['spouse_education'] ?? null),
    safeString($_POST['spouse_age'] ?? null),
    safeString($_POST['district'] ?? null), // merged

    safeString($_POST['religion'] ?? null), // merged
    safeString($_POST['other_religion'] ?? null), // merged
    safeString($_POST['family_livelihood'] ?? null),
    safeString($_POST['business_type'] ?? null),

    safeString($_POST['husband_salary'] ?? null),
    safeString($_POST['wife_salary'] ?? null),
    safeString($_POST['number_of_children'] ?? null),
    safeString($_POST['other_number_of_children'] ?? null),
    safeString($_POST['children_age_groups'] ?? null),
    safeString($_POST['other_children_age'] ?? null),
    safeString($_POST['children_grade'] ?? null),

    safeString($_POST['working_child'] ?? null),
    safeString($_POST['number_of_working_children'] ?? null),
    safeString($_POST['other_number_of_working_children'] ?? null),

    safeString($_POST['family_health_issue'] ?? null),
    safeString($_POST['family_health_issue_count'] ?? null),

    // Health Section 
    safeString($_POST['ubo'] ?? null),
    safeString($_POST['std'] ?? null),
    safeString($_POST['diabetes'] ?? null),
    safeString($_POST['hilanat'] ?? null),
    safeString($_POST['migraine'] ?? null),
    safeString($_POST['dengue'] ?? null),
    safeString($_POST['diarrhea'] ?? null),
    safeString($_POST['tuberkulosis'] ?? null),
    safeString($_POST['typhoid_fever'] ?? null),
    safeString($_POST['rayuma'] ?? null),
    safeString($_POST['high_blood_pressure'] ?? null),
    safeString($_POST['other_health_problems'] ?? null),

    safeString($_POST['toilet_type'] ?? null),
    safeString($_POST['waste_disposal'] ?? null),
    safeString($_POST['main_district_problem'] ?? null),
    safeString($_POST['other_main_district_problem'] ?? null),
    safeString($_POST['peace_and_order_issue'] ?? null),
    safeString($_POST['tanod_training'] ?? null),

    // Trainings 
    safeString($_POST['law_training'] ?? null),
    safeString($_POST['conflict_resolution'] ?? null),
    safeString($_POST['disaster_preparedness'] ?? null),
    safeString($_POST['human_rights'] ?? null),
    safeString($_POST['fire_safety'] ?? null),
    safeString($_POST['self_defense'] ?? null),
    safeString($_POST['crisis_intervention'] ?? null),
    safeString($_POST['weapons_handling'] ?? null),
    safeString($_POST['environmental_protection'] ?? null),
    safeString($_POST['cybersecurity'] ?? null),

    // Seminars 
    safeString($_POST['seminar_health'] ?? null), 
    safeString($_POST['seminar_environment'] ?? null), 
    safeString($_POST['seminar_relihiyon'] ?? null), 
    safeString($_POST['edukasyonal_nga_seminar'] ?? null), 
    safeString($_POST['seminar_sa_panginabuhi'] ?? null), 
    safeString($_POST['other_district_seminars'] ?? null), 
    safeString($_POST['district_training_needs'] ?? null),
    safeString($_POST['other_district_training_needs'] ?? null), 

    // Religious & Spiritual Activities (Checkboxes)
    safeString($_POST['religious_activities'] ?? null), 
    safeString($_POST['other_religious_activities'] ?? null), 
    safeString($_POST['important_religious_activities'] ?? null), 
    safeString($_POST['other_important_religious_activities'] ?? null), 
    safeString($_POST['spiritual_growth'] ?? null), 
    safeString($_POST['other_spiritual_growth'] ?? null), 
    safeString($_POST['spiritual_activity_frequency'] ?? null),
    safeString($_POST['barangay_needs'] ?? null)
];

/* =========================
   INSERT QUERY
========================= */
$columns = [
    'respondent_name',
    'respondent_job',
    'respondent_education',
    'respondent_age',
    'spouse_name',
    'spouse_job',
    'spouse_education',
    'spouse_age',
    'district',
    'religion',
    'other_religion',
    'family_livelihood',
    'business_type',
    'husband_salary',
    'wife_salary',
    'number_of_children',
    'other_number_of_children',
    'children_age_groups',
    'other_children_age',
    'children_grade',
    'working_child',
    'number_of_working_children',
    'other_number_of_working_children',
    'family_health_issue',
    'family_health_issue_count',
    'ubo','std','diabetes','hilanat','migraine','dengue','diarrhea','tuberkulosis','typhoid_fever','rayuma','high_blood_pressure',
    'other_health_problems',
    'toilet_type',
    'waste_disposal',
    'main_district_problem',
    'other_main_district_problem',
    'peace_and_order_issue',
    'tanod_training',
    'law_training','conflict_resolution','disaster_preparedness','human_rights','fire_safety','self_defense','crisis_intervention','weapons_handling','environmental_protection','cybersecurity',
    'seminar_health','seminar_environment','seminar_relihiyon','edukasyonal_nga_seminar','seminar_sa_panginabuhi','other_district_seminars','district_training_needs','other_district_training_needs',
    'religious_activities','other_religious_activities','important_religious_activities','other_important_religious_activities','spiritual_growth','other_spiritual_growth','spiritual_activity_frequency','barangay_needs'
];

// Verify column count matches data count
if (count($columns) !== count($data)) {
    echo json_encode([
        "success" => false, 
        "message" => "Column count mismatch", 
        "columns" => count($columns), 
        "data" => count($data)
    ]);
    exit;
}

// Note: id is auto_increment and created_at has default value, so we don't include them in the INSERT
$sql = "INSERT INTO `$table` (`".implode("`,`",$columns)."`) VALUES (".rtrim(str_repeat('?,', count($data)), ',').")";
$stmt = $pdo->prepare($sql);

/* =========================
   EXECUTE
========================= */
try {
    // Log the data being inserted (for debugging)
    error_log("Attempting to insert data into $table");
    error_log("Data: " . json_encode($data));
    
    $stmt->execute($data);
    
    // Get the last inserted ID
    $lastId = $pdo->lastInsertId();
    
    echo json_encode([
        "success" => true, 
        "message" => "Survey saved to `$table`",
        "id" => $lastId,
        "data_count" => count($data)
    ]);
    
} catch (PDOException $e) {
    // Log the full error
    error_log("Database Error: " . $e->getMessage());
    error_log("SQL: " . $sql);
    error_log("Data: " . json_encode($data));
    
    echo json_encode([
        "success" => false,
        "message" => "Database Error",
        "error" => $e->getMessage(),
        "sql" => $sql,
        "data_count" => count($data)
    ]);
}
?>