<?php
// db_config.php - Database Configuration (embedded)
// Configuration for both databases

// Main application database (for notifications)
define('DB_HOST', 'localhost');
define('DB_REPORTS_NAME', 'ces_reports_db'); // Database for notifications
define('DB_REPORTS_USER', 'root'); // Change to your database username
define('DB_REPORTS_PASS', ''); // Change to your database password

// Accounts database (for users)
define('DB_ACCOUNTS_NAME', 'accounts'); // Database for users
define('DB_ACCOUNTS_USER', 'root'); // Change to your database username
define('DB_ACCOUNTS_PASS', ''); // Change to your database password

// Optional: Additional configuration
define('TIMEZONE', 'Asia/Manila'); // Set your timezone
date_default_timezone_set(TIMEZONE);

// Connection functions
function getReportsDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_REPORTS_NAME . ";charset=utf8mb4",
                DB_REPORTS_USER,
                DB_REPORTS_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log('Reports DB connection failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }
    return $pdo;
}

function getAccountsDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_ACCOUNTS_NAME . ";charset=utf8mb4",
                DB_ACCOUNTS_USER,
                DB_ACCOUNTS_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log('Accounts DB connection failed: ' . $e->getMessage());
            throw new Exception('Database connection failed');
        }
    }
    return $pdo;
}

// 1. SET CORS HEADERS IMMEDIATELY
$allowed_origins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1'
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
} else {
    header("Access-Control-Allow-Origin: http://localhost:3000");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");
header("Content-Type: application/json; charset=UTF-8");

// 2. HANDLE PREFLIGHT (OPTIONS) AND EXIT
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. NOW START SESSIONS
session_start();

// Check if user is logged in (adjust based on your auth system)
function getCurrentUserId() {
    // This should come from your login system
    // Assuming you store user_id in session after login from accounts database
    return $_SESSION['user_id'] ?? null;
}

// Response function
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Error response
function sendError($message, $status = 400) {
    sendResponse(['error' => $message], $status);
}

// Get list of departments/coordinators from accounts database
function getDepartments() {
    try {
        $pdo = getAccountsDB(); // Connect to accounts database
        
        // Query to get users with coordinator or admin roles from accounts database
        $stmt = $pdo->query("
            SELECT 
                id,
                username,
                name,
                email,
                role,
                department,
                dean,
                is_active
            FROM users 
            WHERE role IN ('coordinator', 'admin')
            AND is_active = 1
            ORDER BY 
                CASE 
                    WHEN role = 'admin' THEN 1 
                    ELSE 2 
                END,
                department, 
                name
        ");
        
        $users = $stmt->fetchAll();
        
        if (empty($users)) {
            sendResponse([]);
            return;
        }
        
        // Format the response
        $formattedUsers = array_map(function($user) {
            return [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'full_name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'department' => $user['department'],
                'dean' => $user['dean'],
                'is_active' => $user['is_active'],
                'display_name' => $user['name'] . ($user['department'] ? ' (' . $user['department'] . ')' : '') . 
                                 ($user['role'] === 'admin' ? ' [Admin]' : '')
            ];
        }, $users);
        
        sendResponse($formattedUsers);
        
    } catch (Exception $e) {
        sendError('Failed to fetch departments: ' . $e->getMessage(), 500);
    }
}

// Send notification to multiple users
function sendToDepartments() {
    $currentUserId = getCurrentUserId();
    if (!$currentUserId) {
        sendError('Unauthorized', 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (!isset($data['departments']) || !is_array($data['departments']) || empty($data['departments'])) {
        sendError('Please select at least one recipient');
    }
    
    if (!isset($data['message']) || trim($data['message']) === '') {
        sendError('Message cannot be empty');
    }
    
    $recipients = $data['departments']; // These are user IDs from accounts database
    $message = trim($data['message']);
    $priority = $data['priority'] ?? 'normal';
    
    // Validate priority
    if (!in_array($priority, ['normal', 'important', 'urgent'])) {
        $priority = 'normal';
    }
    
    try {
        // First, verify recipients exist in accounts database
        $accountsDB = getAccountsDB();
        $placeholders = implode(',', array_fill(0, count($recipients), '?'));
        
        $stmt = $accountsDB->prepare("
            SELECT id, name, email, department 
            FROM users 
            WHERE id IN ($placeholders) 
            AND is_active = 1
        ");
        $stmt->execute($recipients);
        $validRecipients = $stmt->fetchAll();
        
        if (empty($validRecipients)) {
            sendError('No valid recipients found');
        }
        
        // Insert notifications into ces_reports_db database
        $reportsDB = getReportsDB();
        $insertStmt = $reportsDB->prepare("
            INSERT INTO notifications (sender_id, recipient_id, message, priority, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        
        $successCount = 0;
        $failedRecipients = [];
        
        // Begin transaction on reports database
        $reportsDB->beginTransaction();
        
        foreach ($validRecipients as $recipient) {
            try {
                $insertStmt->execute([$currentUserId, $recipient['id'], $message, $priority]);
                $successCount++;
            } catch (Exception $e) {
                $failedRecipients[] = $recipient['id'];
                error_log('Failed to insert notification for recipient ' . $recipient['id'] . ': ' . $e->getMessage());
            }
        }
        
        $reportsDB->commit();
        
        // Get recipient names for response
        $recipientNames = array_map(function($r) {
            return $r['name'] . ($r['department'] ? ' (' . $r['department'] . ')' : '');
        }, $validRecipients);
        
        sendResponse([
            'success' => true,
            'message' => "Message sent successfully to {$successCount} recipient(s)" . 
                        (count($failedRecipients) > 0 ? ". Failed for " . count($failedRecipients) . " recipient(s)." : ""),
            'recipient_count' => $successCount,
            'failed_count' => count($failedRecipients),
            'total_recipients' => count($validRecipients),
            'recipients' => $recipientNames
        ]);
        
    } catch (Exception $e) {
        if (isset($reportsDB)) {
            $reportsDB->rollBack();
        }
        sendError('Failed to send notifications: ' . $e->getMessage(), 500);
    }
}

// Get unread count for current user from reports database
function getUnreadCount() {
    $currentUserId = getCurrentUserId();
    if (!$currentUserId) {
        sendError('Unauthorized', 401);
    }
    
    try {
        $pdo = getReportsDB(); // Connect to reports database
        
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM notifications 
            WHERE recipient_id = ? AND is_read = 0
        ");
        $stmt->execute([$currentUserId]);
        $result = $stmt->fetch();
        
        sendResponse(['count' => (int)$result['count']]);
    } catch (Exception $e) {
        sendError('Failed to get unread count: ' . $e->getMessage(), 500);
    }
}

// Mark a notification as read in reports database
function markAsRead($notificationId) {
    $currentUserId = getCurrentUserId();
    if (!$currentUserId) {
        sendError('Unauthorized', 401);
    }
    
    try {
        $pdo = getReportsDB(); // Connect to reports database
        
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1, read_at = NOW() 
            WHERE notification_id = ? AND recipient_id = ?
        ");
        $stmt->execute([$notificationId, $currentUserId]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Marked as read']);
        } else {
            sendError('Notification not found or unauthorized', 404);
        }
    } catch (Exception $e) {
        sendError('Failed to mark as read: ' . $e->getMessage(), 500);
    }
}

// Get sender info from accounts database for a notification
function getSenderInfo($senderId) {
    try {
        $pdo = getAccountsDB();
        $stmt = $pdo->prepare("SELECT id, name, username, department, role FROM users WHERE id = ?");
        $stmt->execute([$senderId]);
        return $stmt->fetch();
    } catch (Exception $e) {
        return null;
    }
}

// Optional: Get inbox messages (if you want to add this feature later)
function getInbox() {
    $currentUserId = getCurrentUserId();
    if (!$currentUserId) {
        sendError('Unauthorized', 401);
    }
    
    $filter = $_GET['filter'] ?? 'all';
    
    try {
        $reportsDB = getReportsDB();
        
        $sql = "SELECT * FROM notifications WHERE recipient_id = ?";
        $params = [$currentUserId];
        
        if ($filter === 'unread') {
            $sql .= " AND is_read = 0";
        } elseif ($filter === 'urgent') {
            $sql .= " AND priority = 'urgent'";
        } elseif ($filter === 'important') {
            $sql .= " AND priority = 'important'";
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT 50";
        
        $stmt = $reportsDB->prepare($sql);
        $stmt->execute($params);
        $notifications = $stmt->fetchAll();
        
        // Enrich with sender info from accounts database
        foreach ($notifications as &$note) {
            $sender = getSenderInfo($note['sender_id']);
            $note['sender_name'] = $sender ? $sender['name'] : 'Unknown';
            $note['sender_department'] = $sender ? $sender['department'] : null;
            $note['sender_role'] = $sender ? $sender['role'] : null;
        }
        
        sendResponse($notifications);
    } catch (Exception $e) {
        sendError('Failed to get inbox: ' . $e->getMessage(), 500);
    }
}

// Main router
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'departments':
            getDepartments();
            break;
            
        case 'send-to-departments':
            sendToDepartments();
            break;
            
        case 'unread-count':
            getUnreadCount();
            break;
            
        case 'mark-read':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                sendError('Notification ID required');
            }
            markAsRead($id);
            break;
            
        case 'inbox': // Optional: if you want to add inbox later
            getInbox();
            break;
            
        default:
            sendError('Invalid action', 400);
    }
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
?>