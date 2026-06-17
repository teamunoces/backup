<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/accounts.php';

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

function runAiRecommendationScriptForAllowedRole($role) {
    if (!in_array($role, ['admin', 'coordinator'], true)) {
        return;
    }

    $pythonPath = 'c:/python313/python.exe';
    $scriptPath = 'c:/wamp64/www/SYSTEM_VERSION_!/coordinator/Report/3ydpreport/AI_RECOMMENDATION/AI.py';
    $startupScript = 'c:/wamp64/www/SYSTEM_VERSION_!/coordinator/Report/3ydpreport/AI_RECOMMENDATION/start_ai_server.bat';

    if (!file_exists($pythonPath) || !file_exists($scriptPath) || !file_exists($startupScript)) {
        error_log("Python startup skipped. Missing python or script path.");
        return;
    }

    $connection = @fsockopen('127.0.0.1', 5000, $errno, $errstr, 1);
    if ($connection) {
        fclose($connection);
        error_log("Python AI recommendation script is already running.");
        return;
    }

    if (PHP_OS_FAMILY === 'Windows') {
        $command = 'cmd /C start /B "" "' . $startupScript . '"';
    } else {
        $command = escapeshellarg($pythonPath) . ' ' . escapeshellarg($scriptPath) . ' > /dev/null 2>&1 &';
    }

    $process = @popen($command, 'r');
    if (is_resource($process)) {
        pclose($process);
        error_log("Python AI recommendation script started for role: " . $role);
    } else {
        error_log("Python AI recommendation script failed to start for role: " . $role);
    }
}

$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? ''; // Don't trim passwords

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please enter both username and password.']);
    exit();
}

try {
    // ✅ FIXED: Added 'dean' to SELECT query
    $stmt = $pdo->prepare("SELECT id, username, name, password, role, department, dean, is_active FROM users WHERE username = ?");
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
            if ((int) $user['is_active'] !== 1) {
                echo json_encode(['success' => false, 'message' => 'This account is inactive. Please contact your administrator.']);
                exit();
            }

            session_start();
            
            // ✅ dean is now available in $user and stored in session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['department'] = $user['department'];
            $_SESSION['dean'] = $user['dean']; // ✅ Now works!

            runAiRecommendationScriptForAllowedRole($user['role']);

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
