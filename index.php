<?php
session_start();

require_once 'C:/wamp64/www/SYSTEM_VERSION_!/includes/config.php';

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

if (isset($_SESSION['user_id'])) {
    runAiRecommendationScriptForAllowedRole($_SESSION['role'] ?? '');
    
    // Your redirect logic
    switch ($_SESSION['role']) {
        case 'admin':
            header("Location: " . BASE_URL . "/admin/Dashboard/Dashboard.html");
            break;
        case 'coordinator':
            header("Location: " . BASE_URL . "/coordinator/Dashboard/dashboard.html");
            break;
        case 'encoder':
            header("Location: " . BASE_URL . "/encoder/encoder.html");
            break;
        default:
            session_destroy();
            header("Location: " . BASE_URL . "/login/login.html");
            break;
    }
    exit();
} else {
    header("Location: " . BASE_URL . "/login/login.html");
    exit();
}
?>
