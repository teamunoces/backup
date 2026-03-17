<?php
// Database connection
$host = 'localhost';
$dbname = 'accounts';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

// Set response header for JSON
header('Content-Type: application/json');

// Handle GET requests for fetching accounts
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'get_accounts') {
    try {
        $stmt = $pdo->query("SELECT id, username, name, email,department,role, CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END AS status FROM users ORDER BY created_at DESC");
        $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($accounts);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch accounts: ' . $e->getMessage()]);
    }
    exit;
}

// Handle POST requests
elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action === 'create_account') {
        $username = trim($_POST['username'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $role = trim($_POST['role'] ?? '');
        $department = trim($_POST['department'] ?? '');
        $password = $_POST['password'] ?? '';

        // Basic validation
        if (empty($username) || empty($name) || empty($email) || empty($role) || empty($department) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'All fields are required.']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
            exit;
        }
        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
            exit;
        }

        try {
            // Check if username or email already exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$username, $email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Username or email already exists.']);
                exit;
            }

            // Insert password as plain text (no hashing)
            $stmt = $pdo->prepare("INSERT INTO users (username, name, email, role, department, password, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$username, $name, $email, $role, $department, $password]);

            echo json_encode(['success' => true, 'message' => 'Account created successfully.']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to create account: ' . $e->getMessage()]);
        }
    }

    elseif ($action === 'update_status') {
        $id = intval($_POST['id'] ?? 0);
        $statusAction = $_POST['status_action'] ?? '';  // 'deactivate' or 'reactivate'

        if ($id <= 0 || !in_array($statusAction, ['deactivate', 'reactivate'])) {
            echo json_encode(['success' => false, 'message' => 'Invalid input.']);
            exit;
        }

        $newStatus = ($statusAction === 'deactivate') ? 0 : 1;

        try {
            $stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Account ' . $statusAction . 'd successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Account not found.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Failed to update status: ' . $e->getMessage()]);
        }
    }

    else {
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    }
}

else {
    echo json_encode(['error' => 'Invalid request.']);
}
?>
