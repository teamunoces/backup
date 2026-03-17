<?php
session_start();

// Default username
$displayName = "Guest";

// Only fetch from DB if user is logged in
if (isset($_SESSION['username'])) {
    $username = $_SESSION['username'];

    // DATABASE CONNECTION
    $conn = new mysqli("localhost", "root", "", "accounts");

    // Check connection
    if ($conn->connect_error) {
        // Optional: log error and continue with default name
        error_log("Database connection failed: " . $conn->connect_error);
        echo htmlspecialchars($displayName);
        exit();
    }

    // Prepare and execute query safely
    $stmt = $conn->prepare("SELECT username FROM users WHERE username = ?");
    if ($stmt) {
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        // Fetch username
        if ($row = $result->fetch_assoc()) {
            $displayName = $row['username'];
        } else {
            $displayName = "Unknown User";
        }

        $stmt->close();
    }

    $conn->close();
}

// Output safely
echo htmlspecialchars($displayName);
?>