<?php
session_start();

require_once 'includes/config.php';

if (isset($_SESSION['user_id'])) {




    switch ($_SESSION['role']) {
        case 'admin':
            header("Location: admin/Dashboard/Dashboard.html");
            break;

        case 'coordinator':
            header("Location: coordinator/Dashboard/dashboard.html");
            break;

        case 'encoder':
            header("Location: encoder/encoder.html");
            break;

        default:
            // fallback if role is unknown
            session_destroy();
            header("Location: login/login.html");
            break;
    }

    exit();

} else {
    header("Location: login/login.html");
    exit();
}
?>
