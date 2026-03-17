<?php
session_start();
$username = $_SESSION['name'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Header with Profile Dropdown</title>
    <link rel="stylesheet" href="header.css">
</head>
<body>

<header class="main-header">
    <div class="profile-container">
        <img src="/encoder/images/ces.png" alt="Profile Picture" class="profile-pic">
        
        <!-- DISPLAY USERNAME DIRECTLY FROM SESSION -->
        <span class="username">
            <?php echo htmlspecialchars($username); ?> &#9662;
        </span>

        <div class="dropdown">
            <button class="logout-btn">Logout</button>
        </div>
    </div>
</header>

<script src="header.js"></script>

</body>
</html>