<?php
session_start();

header('Content-Type: application/json');

$profilePicture = null;

if (isset($_SESSION['user_id'])) {
    $conn = new mysqli("localhost", "root", "", "accounts");

    if (!$conn->connect_error) {
        $stmt = $conn->prepare("SELECT profile_picture FROM users WHERE id=?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();

        $result = $stmt->get_result()->fetch_assoc();
        $profilePicture = $result['profile_picture'] ?? null;
    }
}

echo json_encode([
    "username" => $_SESSION['username'] ?? "Admin",
    "profile_picture" => $profilePicture
]);
