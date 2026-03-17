<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/accounts.php';

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? ''; // Don't trim passwords

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please enter both username and password.']);
    exit();
}

try {
    // ✅ FIXED: Added 'dean' to SELECT query
    $stmt = $pdo->prepare("SELECT id, username, name, password, role, department, dean FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Password validation (hashed OR plaintext fallback)
        if (preg_match('/^\$2[ayb]\$/', $user['password'])) {
            $valid = password_verify($password, $user['password']);
        } else {
            $valid = ($password === $user['password']);
        }

        if ($valid) {
            session_start();
            
            // ✅ dean is now available in $user and stored in session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['department'] = $user['department'];
            $_SESSION['dean'] = $user['dean']; // ✅ Now works!

            echo json_encode(['success' => true, 'role' => $user['role']]);
            exit();
        }
    }

    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again later.']);
}
?>