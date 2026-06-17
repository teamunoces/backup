<?php
// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if needed for authentication
session_start();

// Get department from URL parameter with validation
$department = isset($_GET['department']) ? trim($_GET['department']) : '';
if (empty($department)) {
    die("Error: Department parameter is required.");
}

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "ces_database";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4");

// Function to get attachments for a specific report
function getAttachments($conn, $report_id) {
    $attachments = [];
    
    // Check if coordinator_report_files table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'coordinator_report_files'");
    if ($table_check && $table_check->num_rows > 0) {
        $sql = "SELECT * FROM coordinator_report_files WHERE report_id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("i", $report_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($row = $result->fetch_assoc()) {
                $attachments[] = $row;
            }
            $stmt->close();
        }
    }
    return $attachments;
}

// Function to get report type based on table
function getReportType($table_name) {
    switch($table_name) {
        case 'report_3ydp':
            return '3-Year Development Plan';
        case 'report_coordinator_cnacr':
            return 'Community Needs Assessment Consolidated Report';
        case 'report_mar_header':
            return 'Monthly Accomplishment Report';
        case 'report_pd_main':
            return 'Program Design';
        case 'report_program_monitoring_form':
            return 'Program Monitoring Form';
        case 'report_cert_appearance':
            return 'Certificate of Appearance';
        case 'report_evaluation':
            return 'Evaluation Sheet for Extension Services';
        case 'report_reflection_paper':
            return 'Monthly Accomplishment Report- Reflection Paper';
        case 'report_narrative':
            return 'Monthly Accomplishment Report- Narrative Report';
        default:
            return ucfirst(str_replace('_', ' ', $table_name));
    }
}

function getDisplayTitle($title, $report_type) {
    $title = trim((string) $title);

    if ($title === '' || preg_match('/^ces_head(?:_suffix)?/i', $title)) {
        return $report_type;
    }

    return $title;
}

// Function to get column names for a table
function getTableColumns($conn, $tableName) {
    $columns = [];
    $result = $conn->query("SHOW COLUMNS FROM `$tableName`");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $columns[] = $row['Field'];
        }
    }
    return $columns;
}

// Function to fetch reports from report_3ydp table
function fetchFrom3ydp($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'report_3ydp');
    
    // Determine which columns exist
    $title_col = in_array('title_of_project', $columns) ? 'title_of_project' : (in_array('title', $columns) ? 'title' : null);
    $desc_col = in_array('description_of_project', $columns) ? 'description_of_project' : (in_array('description', $columns) ? 'description' : null);
    $submitted_by_col = in_array('created_by_name', $columns) ? 'created_by_name' : (in_array('submitted_by', $columns) ? 'submitted_by' : null);
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'3-Year Development Plan' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        'created_at',
        'status',
        'role',
        'department',
        "'report_3ydp' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    $sql = "SELECT $select_sql 
            FROM `report_3ydp` 
            WHERE department = ? 
            AND status = 'approve'
            AND role = 'coordinator'
            ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("s", $department);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_coordinator_cnacr table
function fetchFromCoordinatorCNACR($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'report_coordinator_cnacr');
    
    // Determine which columns exist
    $title_col = in_array('title_of_program', $columns) ? 'title_of_program' : (in_array('title', $columns) ? 'title' : null);
    $desc_col = in_array('feedback', $columns) ? 'feedback' : (in_array('description', $columns) ? 'description' : null);
    $submitted_by_col = in_array('created_by_name', $columns) ? 'created_by_name' : (in_array('submitted_by', $columns) ? 'submitted_by' : null);
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Community Needs Assessment' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        'created_at',
        'status',
        'role',
        'department',
        "'report_coordinator_cnacr' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    $sql = "SELECT $select_sql 
            FROM `report_coordinator_cnacr` 
            WHERE department = ? 
            AND status = 'approve'
            AND role = 'coordinator'
            ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("s", $department);
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_mar_header table
function fetchFromMARHeader($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'report_mar_header');
    
    // MAR Header might have different column names
    $title_col = null;
    $possible_title = ['title', 'title_act', 'activity_title', 'name'];
    foreach ($possible_title as $col) {
        if (in_array($col, $columns)) {
            $title_col = $col;
            break;
        }
    }
    
    $desc_col = null;
    $possible_desc = ['description', 'content', 'details', 'feedback'];
    foreach ($possible_desc as $col) {
        if (in_array($col, $columns)) {
            $desc_col = $col;
            break;
        }
    }
    
    $submitted_by_col = null;
    $possible_submitted = ['created_by_name', 'submitted_by', 'prepared_by', 'encoder'];
    foreach ($possible_submitted as $col) {
        if (in_array($col, $columns)) {
            $submitted_by_col = $col;
            break;
        }
    }
    
    // Build SELECT clause dynamically
    $select_fields = ['id'];
    
    // Add title field
    if ($title_col) {
        $select_fields[] = "$title_col as title";
    } else {
        $select_fields[] = "'MAR Header Report' as title";
    }
    
    // Add description field
    if ($desc_col) {
        $select_fields[] = "$desc_col as description";
    } else {
        $select_fields[] = "'' as description";
    }
    
    // Add submitted_by field
    if ($submitted_by_col) {
        $select_fields[] = "$submitted_by_col as submitted_by";
    } else {
        $select_fields[] = "'Unknown' as submitted_by";
    }
    
    // Add other fields if they exist
    $select_fields[] = in_array('created_at', $columns) ? 'created_at' : 'NULL as created_at';
    $select_fields[] = in_array('status', $columns) ? 'status' : "'approve' as status";
    $select_fields[] = in_array('role', $columns) ? 'role' : "'coordinator' as role";
    $select_fields[] = in_array('department', $columns) ? 'department' : "'$department' as department";
    $select_fields[] = "'report_mar_header' as source_table";
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause based on existing columns
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_mar_header` $where_sql";
    
    // Add ORDER BY if created_at exists
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_pd_main table
function fetchFromPDMain($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'report_pd_main');
    
    // Determine which columns exist
    $title_col = in_array('title_of_activity', $columns) ? 'title_of_activity' : (in_array('program_title', $columns) ? 'program_title' : null);
    $desc_col = in_array('description', $columns) ? 'description' : (in_array('content', $columns) ? 'content' : null);
    $submitted_by_col = in_array('created_by_name', $columns) ? 'created_by_name' : (in_array('submitted_by', $columns) ? 'submitted_by' : null);
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Program Design' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        in_array('created_at', $columns) ? 'created_at' : 'NULL as created_at',
        in_array('status', $columns) ? 'status' : "'approve' as status",
        in_array('role', $columns) ? 'role' : "'coordinator' as role",
        in_array('department', $columns) ? 'department' : "'$department' as department",
        "'report_pd_main' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_pd_main` $where_sql";
    
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_program_monitoring_form table
function fetchFromProgramMonitoringForm($conn, $department) {
    $reports = [];
    
    // Check if table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'report_program_monitoring_form'");
    if (!$table_check || $table_check->num_rows === 0) {
        return $reports;
    }
    
    $columns = getTableColumns($conn, 'report_program_monitoring_form');
    
    // Determine which columns exist
    $title_col = in_array('program_title', $columns) ? 'program_title' : 
                (in_array('title', $columns) ? 'title' : 
                (in_array('activity_name', $columns) ? 'activity_name' : null));
    $desc_col = in_array('description', $columns) ? 'description' : 
                (in_array('remarks', $columns) ? 'remarks' : 
                (in_array('findings', $columns) ? 'findings' : null));
    $submitted_by_col = in_array('created_by_name', $columns) ? 'created_by_name' : 
                       (in_array('submitted_by', $columns) ? 'submitted_by' : 
                       (in_array('monitor_name', $columns) ? 'monitor_name' : null));
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Program Monitoring Form' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        in_array('created_at', $columns) ? 'created_at' : (in_array('monitoring_date', $columns) ? 'monitoring_date as created_at' : 'NULL as created_at'),
        in_array('status', $columns) ? 'status' : "'approve' as status",
        in_array('role', $columns) ? 'role' : "'coordinator' as role",
        in_array('department', $columns) ? 'department' : "'$department' as department",
        "'report_program_monitoring_form' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_program_monitoring_form` $where_sql";
    
    // Add ORDER BY
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    } elseif (in_array('monitoring_date', $columns)) {
        $sql .= " ORDER BY monitoring_date DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_cert_appearance table
function fetchFromCertAppearance($conn, $department) {
    $reports = [];
    
    // Check if table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'report_cert_appearance'");
    if (!$table_check || $table_check->num_rows === 0) {
        return $reports;
    }
    
    $columns = getTableColumns($conn, 'report_cert_appearance');
    
    // Determine which columns exist
    $title_col = in_array('activity_title', $columns) ? 'activity_title' : 
                (in_array('title', $columns) ? 'title' : 
                (in_array('event_name', $columns) ? 'event_name' : null));
    $desc_col = in_array('purpose', $columns) ? 'purpose' : 
                (in_array('description', $columns) ? 'description' : 
                (in_array('remarks', $columns) ? 'remarks' : null));
    $submitted_by_col = in_array('created_by_name', $columns) ? 'created_by_name' : 
                       (in_array('submitted_by', $columns) ? 'submitted_by' : 
                       (in_array('name', $columns) ? 'name' : null));
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Certificate of Appearance' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        in_array('created_at', $columns) ? 'created_at' : (in_array('date_filed', $columns) ? 'date_filed as created_at' : 'NULL as created_at'),
        in_array('status', $columns) ? 'status' : "'approve' as status",
        in_array('role', $columns) ? 'role' : "'coordinator' as role",
        in_array('department', $columns) ? 'department' : "'$department' as department",
        "'report_cert_appearance' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_cert_appearance` $where_sql";
    
    // Add ORDER BY
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    } elseif (in_array('date_filed', $columns)) {
        $sql .= " ORDER BY date_filed DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_evaluation table
function fetchFromEvaluationReports($conn, $department) {
    $reports = [];
    
    // Check if table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'report_evaluation'");
    if (!$table_check || $table_check->num_rows === 0) {
        return $reports;
    }
    
    $columns = getTableColumns($conn, 'report_evaluation');
    
    // Determine which columns exist
    $title_col = in_array('program_name', $columns) ? 'program_name' : 
                (in_array('activity_title', $columns) ? 'activity_title' : 
                (in_array('title', $columns) ? 'title' : null));
    $desc_col = in_array('feedback', $columns) ? 'feedback' : 
                (in_array('comments', $columns) ? 'comments' : 
                (in_array('remarks', $columns) ? 'remarks' : 
                (in_array('description', $columns) ? 'description' : null)));
    $submitted_by_col = in_array('evaluator_name', $columns) ? 'evaluator_name' : 
                       (in_array('created_by_name', $columns) ? 'created_by_name' : 
                       (in_array('submitted_by', $columns) ? 'submitted_by' : null));
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Evaluation Sheet' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        in_array('created_at', $columns) ? 'created_at' : (in_array('evaluation_date', $columns) ? 'evaluation_date as created_at' : 'NULL as created_at'),
        in_array('status', $columns) ? 'status' : "'approve' as status",
        in_array('role', $columns) ? 'role' : "'coordinator' as role",
        in_array('department', $columns) ? 'department' : "'$department' as department",
        "'report_evaluation' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_evaluation` $where_sql";
    
    // Add ORDER BY
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    } elseif (in_array('evaluation_date', $columns)) {
        $sql .= " ORDER BY evaluation_date DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_reflection_paper table
function fetchFromReflectionPaper($conn, $department) {
    $reports = [];
    
    // Check if table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'report_reflection_paper'");
    if (!$table_check || $table_check->num_rows === 0) {
        return $reports;
    }
    
    $columns = getTableColumns($conn, 'report_reflection_paper');
    
    // Determine which columns exist
    $title_col = in_array('reflection_title', $columns) ? 'reflection_title' : 
                (in_array('title', $columns) ? 'title' : 
                (in_array('activity_name', $columns) ? 'activity_name' : null));
    $desc_col = in_array('reflection_content', $columns) ? 'reflection_content' : 
                (in_array('content', $columns) ? 'content' : 
                (in_array('reflection', $columns) ? 'reflection' : 
                (in_array('description', $columns) ? 'description' : null)));
    $submitted_by_col = in_array('author_name', $columns) ? 'author_name' : 
                       (in_array('created_by_name', $columns) ? 'created_by_name' : 
                       (in_array('submitted_by', $columns) ? 'submitted_by' : null));
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Reflection Paper' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        in_array('created_at', $columns) ? 'created_at' : (in_array('date_submitted', $columns) ? 'date_submitted as created_at' : 'NULL as created_at'),
        in_array('status', $columns) ? 'status' : "'approve' as status",
        in_array('role', $columns) ? 'role' : "'coordinator' as role",
        in_array('department', $columns) ? 'department' : "'$department' as department",
        "'report_reflection_paper' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_reflection_paper` $where_sql";
    
    // Add ORDER BY
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    } elseif (in_array('date_submitted', $columns)) {
        $sql .= " ORDER BY date_submitted DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to fetch reports from report_narrative table
function fetchFromNarrativeReport($conn, $department) {
    $reports = [];
    
    // Check if table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'report_narrative'");
    if (!$table_check || $table_check->num_rows === 0) {
        return $reports;
    }
    
    $columns = getTableColumns($conn, 'report_narrative');
    
    // Determine which columns exist
    $title_col = in_array('report_title', $columns) ? 'report_title' : 
                (in_array('activity_title', $columns) ? 'activity_title' : 
                (in_array('title', $columns) ? 'title' : null));
    $desc_col = in_array('narrative_content', $columns) ? 'narrative_content' : 
                (in_array('content', $columns) ? 'content' : 
                (in_array('report_content', $columns) ? 'report_content' : 
                (in_array('description', $columns) ? 'description' : null)));
    $submitted_by_col = in_array('reporter_name', $columns) ? 'reporter_name' : 
                       (in_array('created_by_name', $columns) ? 'created_by_name' : 
                       (in_array('submitted_by', $columns) ? 'submitted_by' : null));
    
    // Build SELECT clause dynamically
    $select_fields = [
        'id',
        $title_col ? "$title_col as title" : "'Narrative Report' as title",
        $desc_col ? "$desc_col as description" : "'' as description",
        $submitted_by_col ? "$submitted_by_col as submitted_by" : "'Unknown' as submitted_by",
        in_array('created_at', $columns) ? 'created_at' : (in_array('report_date', $columns) ? 'report_date as created_at' : 'NULL as created_at'),
        in_array('status', $columns) ? 'status' : "'approve' as status",
        in_array('role', $columns) ? 'role' : "'coordinator' as role",
        in_array('department', $columns) ? 'department' : "'$department' as department",
        "'report_narrative' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    $types = "";
    
    if (in_array('department', $columns)) {
        $where_conditions[] = "department = ?";
        $params[] = $department;
        $types .= "s";
    }
    
    if (in_array('status', $columns)) {
        $where_conditions[] = "status = 'approve'";
    }
    
    if (in_array('role', $columns)) {
        $where_conditions[] = "role = 'coordinator'";
    }
    
    $where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
    
    $sql = "SELECT $select_sql FROM `report_narrative` $where_sql";
    
    // Add ORDER BY
    if (in_array('created_at', $columns)) {
        $sql .= " ORDER BY created_at DESC";
    } elseif (in_array('report_date', $columns)) {
        $sql .= " ORDER BY report_date DESC";
    }
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
        $stmt->close();
    }
    
    return $reports;
}

// Function to check if file exists and return proper path
function getFileUrl($file_path) {
    // Check if it's already a full URL
    if (preg_match('/^https?:\/\//', $file_path)) {
        return $file_path;
    }
    
    // Clean the path - remove any leading slashes
    $file_path = ltrim($file_path, '/');
    
    // Get base URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    
    // Check if the file_path already starts with the full path
    if (strpos($file_path, '/SYSTEM_VERSION_!/coordinator/Reportmanagement/') !== false) {
        // Path already includes the full structure
        return $protocol . "://" . $host . '/' . $file_path;
    } else if (strpos($file_path, 'uploads/report_files/') !== false) {
        // Path starts with uploads, need to prepend the coordinator path
        return $protocol . "://" . $host . '/SYSTEM_VERSION_!/coordinator/Reportmanagement/' . $file_path;
    } else {
        // Just the filename, need the full path
        return $protocol . "://" . $host . '/SYSTEM_VERSION_!/coordinator/Reportmanagement/uploads/report_files/' . $file_path;
    }
}

// Fetch all reports
$all_reports = [];

// Check which tables exist
$tables_check = $conn->query("SHOW TABLES");
$existing_tables = [];
while ($row = $tables_check->fetch_array()) {
    $existing_tables[] = $row[0];
}

// Fetch from each table if it exists
if (in_array('report_3ydp', $existing_tables)) {
    $reports = fetchFrom3ydp($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_coordinator_cnacr', $existing_tables)) {
    $reports = fetchFromCoordinatorCNACR($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_mar_header', $existing_tables)) {
    $reports = fetchFromMARHeader($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_pd_main', $existing_tables)) {
    $reports = fetchFromPDMain($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_program_monitoring_form', $existing_tables)) {
    $reports = fetchFromProgramMonitoringForm($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_cert_appearance', $existing_tables)) {
    $reports = fetchFromCertAppearance($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_evaluation', $existing_tables)) {
    $reports = fetchFromEvaluationReports($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_reflection_paper', $existing_tables)) {
    $reports = fetchFromReflectionPaper($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('report_narrative', $existing_tables)) {
    $reports = fetchFromNarrativeReport($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

// Sort all reports by created_at date (newest first)
usort($all_reports, function($a, $b) {
    $timeA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
    $timeB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
    return $timeB - $timeA;
});

// Helper function to format file size
function formatFileSize($bytes) {
    if ($bytes >= 1073741824) {
        return number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    } elseif ($bytes > 1) {
        return $bytes . ' bytes';
    } elseif ($bytes == 1) {
        return '1 byte';
    } else {
        return '0 bytes';
    }
}

// Debug mode setting
$debug_mode = false; // Set to true to see debug info
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
    <title><?php echo htmlspecialchars($department); ?> - Approved Reports (Coordinator)</title>
    
    <!-- External CSS -->
    <link rel="stylesheet" href="approve.css">
    <link rel="stylesheet" href="approved-reports.css">
    <link rel="stylesheet" href="darkmode.css">
</head>
<body>




<!-- ===== PAGE LAYOUT ===== -->
<div class="page-wrapper">

    <!-- ===== SIDEBAR ===== -->
    <iframe 
        src="../../../Nav/navigation.html"
        id="sidebarFrame"
        title="Navigation Sidebar"
        class="sidebar-frame">
    </iframe>
    
    <!-- ===== HEADER ===== -->
    <iframe 
        src="../../../Profile/profile.html" 
        id="headerFrame"
        title="Header"
        class="header-frame">
    </iframe>

    <!-- ===== CONTENT AREA ===== -->
    <div class="content-area">

        <!-- ===== MAIN CONTENT ===== -->
        <main class="main-wrapper">

                          <!-- ===== FILTER SECTION ===== -->
                            <div class="filters-container">
                                <div class="filters-wrapper">
                                    <!-- Type Filter -->
                                    <div class="filter-row">
                                        <span class="label">Type:</span>
                                        <select class="select-red" id="reportTypeFilter" onchange="filterReports()">
                                            <option value="all">All type</option>
                                            <?php
                                            // Get unique report types from the actual reports
                                            $report_types = [];
                                            foreach ($all_reports as $report) {
                                                $type = getReportType($report['source_table']);
                                                $report_types[$type] = $type;
                                            }
                                            sort($report_types);
                                            
                                            // Define the order you want
                                            $ordered_types = [
                                                '3-Year Development Plan',
                                                'Community Needs Assessment Consolidated Report',
                                                'Monthly Accomplishment Report',
                                                'Program Design',
                                                'Program Monitoring Form',
                                                'Certificate of Appearance',
                                                'Evaluation Sheet for Extension Services',
                                                'Monthly Accomplishment Report- Reflection Paper',
                                                'Monthly Accomplishment Report- Narrative Report'
                                            ];
                                            
                                            // Display in the order you want, then add any others
                                            foreach ($ordered_types as $ordered_type) {
                                                if (in_array($ordered_type, $report_types)) {
                                                    echo '<option value="' . htmlspecialchars($ordered_type) . '">' . htmlspecialchars($ordered_type) . '</option>';
                                                }
                                            }
                                            
                                            // Display any remaining types not in the ordered list
                                            foreach ($report_types as $type) {
                                                if (!in_array($type, $ordered_types)) {
                                                    echo '<option value="' . htmlspecialchars($type) . '">' . htmlspecialchars($type) . '</option>';
                                                }
                                            }
                                            ?>
                                        </select>
                                    </div>

                                    <!-- Date Filter -->
                                    <div class="filter-row">
                                        <span class="label">Date:</span>
                                        <select class="select-red" id="dateFilter" onchange="handleDateFilterChange()">
                                            <option value="all">All dates</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="year">This Year</option>
                                            <option value="custom">Custom range</option>
                                        </select>
                                    </div>

                                    <!-- Custom Date Range (hidden by default) -->
                                    <div class="filter-row custom-date-row" id="customDateRow" style="display: none;">
                                        <span class="label">From:</span>
                                        <input type="date" id="startDate" class="date-input-red">
                                        <span class="label">To:</span>
                                        <input type="date" id="endDate" class="date-input-red">
                                        <button class="apply-filter-btn" onclick="applyCustomDate()">Apply</button>
                                    </div>

                                    <!-- Filter Actions -->
                                    <div class="filter-actions">
                                        <button class="clear-filters-btn" onclick="clearFilters()">Clear Filters</button>
                                        <span class="results-count" id="resultsCount"><?php echo count($all_reports); ?> reports</span>
                                    </div>
                                </div>
                            </div>

            <!-- ===== REPORTS SECTION ===== -->
            <section class="reports-container">
                
                <?php if (empty($all_reports)): ?>
                    <div class="no-reports">
                        <p>No approved coordinator reports found for <?php echo htmlspecialchars($department); ?> department.</p>
                        <br><br>
                       
                    </div>
                <?php else: ?>
                    <?php foreach ($all_reports as $report): 
                        $report_type = getReportType($report['source_table']);
                        $display_title = getDisplayTitle($report['title'] ?? '', $report_type);
                        $attachments = getAttachments($conn, $report['id']);
                    ?>
                        <div class="report-card"
                                 data-report-type="<?php echo htmlspecialchars(getReportType($report['source_table'])); ?>"
                                 data-report-date="<?php echo htmlspecialchars(date('Y-m-d', strtotime($report['created_at']))); ?>">
                                <div class="report-card-accent" aria-hidden="true"></div>

                                <div class="report-header">
                                    <div class="report-heading">
                                        <span class="report-eyebrow">Approved report</span>
                                        <h2 class="report-title"><?php echo htmlspecialchars($display_title); ?></h2>
                                        <div class="report-badges" aria-label="Report classification">
                                            <span class="report-type"><?php echo htmlspecialchars($report_type); ?></span>
                                            <span class="coordinator-tag">Coordinator</span>
                                        </div>
                                    </div>

                                    <div class="report-header-side">
                                        <span class="status-badge">
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
                                            Approved
                                        </span>
                                        <time class="report-date" datetime="<?php echo isset($report['created_at']) ? htmlspecialchars(date('c', strtotime($report['created_at']))) : ''; ?>">
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"/></svg>
                                            <?php echo isset($report['created_at']) ? date('M j, Y', strtotime($report['created_at'])) : 'Date unknown'; ?>
                                        </time>
                                    </div>
                                </div>

                            
                            <div class="report-meta">
                                <span class="meta-item submitted-by">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>
                                    <span><small>Submitted by</small><?php echo htmlspecialchars($report['submitted_by'] ?? 'Unknown'); ?></span>
                                </span>
                                <span class="meta-item">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M6 21V7l6-4 6 4v14"/></svg>
                                    <span><small>Department</small><?php echo htmlspecialchars($report['department'] ?? $department); ?></span>
                                </span>
                                <span class="meta-item">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
                                    <span><small>Status</small>Approved</span>
                                </span>
                                <span class="meta-item">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0 0 4h14"/></svg>
                                    <span><small>Role</small><?php echo htmlspecialchars(ucfirst($report['role'] ?? 'coordinator')); ?></span>
                                </span>
                                <span class="legacy-report-meta">
                                <span class="submitted-by">
                                    📝 Submitted by: <i><?php echo htmlspecialchars($report['submitted_by'] ?? 'Unknown'); ?></i>
                                </span>
                                <span>🏢 Department: <?php echo htmlspecialchars($report['department'] ?? $department); ?></span>
                                <span>📋 Status: <?php echo htmlspecialchars($report['status'] ?? 'approve'); ?></span>
                                <span>👤 Role: <?php echo htmlspecialchars($report['role'] ?? 'coordinator'); ?></span>
                                </span>
                            </div>
                            
                            <?php $description = trim((string) ($report['description'] ?? '')); ?>
                            <div class="report-content<?php echo $description === '' ? ' is-empty' : ''; ?>">
                                <?php echo $description !== '' ? nl2br(htmlspecialchars($description)) : 'No description available'; ?>
                            </div>
                            
                            <!-- Attachments Section -->
                            <?php include 'attachments-section.php'; ?>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
                
                <?php if (!empty($all_reports)): ?>
                <div class="reports-summary">
                    Total: <strong><?php echo count($all_reports); ?></strong> coordinator report(s) from <strong><?php echo htmlspecialchars($department); ?></strong> department
                </div>
                <?php endif; ?>
                
            </section>

        </main>
    </div>
</div>

<!-- PDF Viewer Modal -->
<?php include 'pdfmodal.php'; ?>

<!-- JavaScript -->
<script src="./pdfviewer.js"></script>
<script src="./darkmode.js"></script>

<?php
// Close database connection
$conn->close();
?>

</body>
</html>
