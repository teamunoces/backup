<?php
session_start();
session_destroy();
header("Location: /SYSTEM_VERSION_!/login/login.html");
exit();
?>