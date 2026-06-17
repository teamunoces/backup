<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Clear any output buffers
if (ob_get_level()) ob_end_clean();

header('Content-Type: application/json');

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ces_database";

// Define arrays
$departments = ["CCIS", "CTHM", "CAS", "CBM", "JHS", "SHS", "CTE", "CCJE", "CCF", "ELEM"];
$months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Document types and their corresponding tables
$documents = [
    "3-Year Development Plan" => "report_3ydp",
    "Community Needs Assessment Consolidated Report" => "report_coordinator_cnacr",
    "Monthly Accomplishment Report" => "report_mar_header",
    "Program Design" => "report_pd_main",
    "Program Monitoring Form" => "report_program_monitoring_form",
    "Evaluation Sheet for Extension Services" => "report_evaluation",
    "Certificate of Appearance" => "report_cert_appearance",
    "Monthly Accomplishment Report- Reflection Paper" => "report_reflection_paper",
    "Monthly Accomplishment Report- Narrative Report" => "report_narrative"
];

// Update docKeys to match ALL documents (9 keys)
$docKeys = [
    "devPlan",           // 3-Year Development Plan
    "needsAssessment",   // Community Needs Assessment Consolidated Report
    "monthlyReport",     // Monthly Accomplishment Report
    "programDesign",     // Program Design
    "programMonitoring", // Program Monitoring Form
    "evaluationSheet",   // Evaluation Sheet for Extension Services
    "certificate",       // Certificate of Appearance
    "reflectionPaper",   // Monthly Accomplishment Report- Reflection Paper
    "narrativeReport"    // Monthly Accomplishment Report- Narrative Report
];

// NO NEED to slice arrays anymore - we want ALL documents
// Remove these lines:
// $docKeys = array_slice($docKeys, 0, count($documents));

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// Set charset to UTF-8
$conn->set_charset("utf8");

// Initialize submission data array
$submissionData = [];

// Get current year
$currentYear = date('Y');

// For each department
foreach ($departments as $department) {
    $submissionData[$department] = [];
    
    // Process ALL documents (no slicing)
    $docIndex = 0;
    foreach ($documents as $docName => $tableName) {
        // Initialize monthly data array with zeros for 12 months
        $monthlyData = array_fill(0, 12, 0);
        
        // Check if table exists to avoid SQL errors
        $checkTable = $conn->query("SHOW TABLES LIKE '$tableName'");
        if ($checkTable && $checkTable->num_rows == 0) {
            // Table doesn't exist, store empty data
            $submissionData[$department][$docKeys[$docIndex]] = $monthlyData;
            $docIndex++;
            continue;
        }
        
        // Query to get submissions for this department and document type
        $sql = "SELECT 
                    MONTH(created_at) as month,
                    COUNT(*) as submission_count
                FROM `$tableName` 
                WHERE department = ? 
                    AND status = 'approve'
                    AND role = 'coordinator'
                    AND YEAR(created_at) = ?
                GROUP BY MONTH(created_at)
                ORDER BY month";
        
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("si", $department, $currentYear);
            $stmt->execute();
            $result = $stmt->get_result();
            
            // Fill in the months where submissions exist
            while ($row = $result->fetch_assoc()) {
                $monthIndex = (int)$row['month'] - 1;
                if ($monthIndex >= 0 && $monthIndex < 12) {
                    $monthlyData[$monthIndex] = 1;
                }
            }
            $stmt->close();
        }
        
        $submissionData[$department][$docKeys[$docIndex]] = $monthlyData;
        $docIndex++;
    }
}

$conn->close();

// Ensure clean JSON output - send ALL documents
$response = [
    'success' => true,
    'months' => $months,
    'departments' => $departments,
    'documents' => array_keys($documents), // Send ALL document names
    'docKeys' => $docKeys, // Send ALL document keys
    'submissionData' => $submissionData,
    'currentYear' => $currentYear
];

echo json_encode($response);
?>
