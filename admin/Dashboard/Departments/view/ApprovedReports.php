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
$dbname = "ces_reports_db";

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
    
    // Check if report_files table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'report_files'");
    if ($table_check && $table_check->num_rows > 0) {
        $sql = "SELECT * FROM report_files WHERE report_id = ?";
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
        case '3ydp':
            return '3-Year Development Plan';
        case 'coordinator_cnacr':
            return 'Community Needs Assessment Consolidated Report';
        case 'mar_header':
            return 'MAR Header';
        case 'pd_main':
            return 'Program Design';
        default:
            return ucfirst(str_replace('_', ' ', $table_name));
    }
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

// Function to fetch reports from 3ydp table
function fetchFrom3ydp($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, '3ydp');
    
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
        "'3ydp' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    $sql = "SELECT $select_sql 
            FROM `3ydp` 
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

// Function to fetch reports from coordinator_cnacr table
function fetchFromCoordinatorCNACR($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'coordinator_cnacr');
    
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
        "'coordinator_cnacr' as source_table"
    ];
    
    $select_sql = implode(', ', $select_fields);
    
    $sql = "SELECT $select_sql 
            FROM `coordinator_cnacr` 
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

// Function to fetch reports from mar_header table
function fetchFromMARHeader($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'mar_header');
    
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
    $select_fields[] = "'mar_header' as source_table";
    
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
    
    $sql = "SELECT $select_sql FROM `mar_header` $where_sql";
    
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

// Function to fetch reports from pd_main table
function fetchFromPDMain($conn, $department) {
    $reports = [];
    
    // Get actual columns
    $columns = getTableColumns($conn, 'pd_main');
    
    // Determine which columns exist
    $title_col = in_array('title', $columns) ? 'title' : (in_array('program_title', $columns) ? 'program_title' : null);
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
        "'pd_main' as source_table"
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
    
    $sql = "SELECT $select_sql FROM `pd_main` $where_sql";
    
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

// Function to check if file exists and return proper path
// Function to get proper file URL
// Function to get proper file URL
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
    if (strpos($file_path, 'coordinator/Reportmanagement/') !== false) {
        // Path already includes the full structure
        return $protocol . "://" . $host . '/' . $file_path;
    } else if (strpos($file_path, 'uploads/report_files/') !== false) {
        // Path starts with uploads, need to prepend the coordinator path
        return $protocol . "://" . $host . '/coordinator/Reportmanagement/' . $file_path;
    } else {
        // Just the filename, need the full path
        return $protocol . "://" . $host . '/coordinator/Reportmanagement/uploads/report_files/' . $file_path;
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
if (in_array('3ydp', $existing_tables)) {
    $reports = fetchFrom3ydp($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('coordinator_cnacr', $existing_tables)) {
    $reports = fetchFromCoordinatorCNACR($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('mar_header', $existing_tables)) {
    $reports = fetchFromMARHeader($conn, $department);
    $all_reports = array_merge($all_reports, $reports);
}

if (in_array('pd_main', $existing_tables)) {
    $reports = fetchFromPDMain($conn, $department);
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
    <title><?php echo htmlspecialchars($department); ?> - Approved Reports (Coordinator)</title>
    
    <!-- External CSS -->
    <link rel="stylesheet" href="approve.css">
    <link rel="stylesheet" href="approved-reports.css">
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
                                                'Program Design'
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
                        <small>Records must have: status = 'approve' and role = 'coordinator'</small>
                        <br><br>
                        <small class="debug-text">Debug: Checked tables: <?php echo implode(', ', $existing_tables); ?></small>
                    </div>
                <?php else: ?>
                    <?php foreach ($all_reports as $report): 
                        $report_type = getReportType($report['source_table']);
                        $attachments = getAttachments($conn, $report['id']);
                    ?>
                        <div class="report-card"
                                data-report-date="<?php echo isset($report['created_at']) ? date('Y-m-d', strtotime($report['created_at'])) : ''; ?>"
                                data-report-type="<?php echo strtolower($report_type); ?>">

                                <div class="report-header">
                                    <h2 class="report-title">
                                        <?php echo htmlspecialchars($report['title'] ?? 'Untitled'); ?>
                                        <span class="report-type"><?php echo $report_type; ?></span>
                                        <span class="status-badge">APPROVED</span>
                                        <span class="coordinator-tag">Coordinator</span>
                                    </h2>

                                    <span class="report-date">
                                        <?php echo isset($report['created_at']) ? date('F j, Y, g:i a', strtotime($report['created_at'])) : 'Date unknown'; ?>
                                    </span>
                                </div>

                            
                            <div class="report-meta">
                                <span class="submitted-by">
                                    📝 Submitted by: <i><?php echo htmlspecialchars($report['submitted_by'] ?? 'Unknown'); ?></i>
                                </span>
                                <span>🏢 Department: <?php echo htmlspecialchars($report['department'] ?? $department); ?></span>
                                <span>📋 Status: <?php echo htmlspecialchars($report['status'] ?? 'approve'); ?></span>
                                <span>👤 Role: <?php echo htmlspecialchars($report['role'] ?? 'coordinator'); ?></span>
                            </div>
                            
                            <div class="report-content">
                                <?php echo nl2br(htmlspecialchars($report['description'] ?? 'No description available')); ?>
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
<script src="pdfviewer.js"></script>

<?php
// Close database connection
$conn->close();
?>

</body>
</html>