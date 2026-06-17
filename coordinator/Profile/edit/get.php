<?php
session_start();
header("Content-Type: application/json");

$conn = new mysqli("localhost","root","","accounts");

if ($conn->connect_error) {
    echo json_encode(["status"=>"error","message"=>"DB Connection Failed"]);
    exit();
}

/* =========================
   GET PROFILE
========================= */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if(!isset($_SESSION['user_id'])){
        echo json_encode(["status"=>"error","message"=>"Not logged in"]);
        exit();
    }

    $id = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT id, username, name, email, role, department, profile_picture 
                            FROM users WHERE id=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();

    $result = $stmt->get_result()->fetch_assoc();
    
    if (!$result) {
        echo json_encode(["status"=>"error","message"=>"User not found"]);
        exit();
    }

    echo json_encode($result);
    exit();
}

/* =========================
   UPDATE PROFILE
========================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Check login
    if(!isset($_SESSION['user_id'])){
        echo json_encode(["status"=>"error","message"=>"Not logged in"]);
        exit();
    }

    $data = $_POST;
    
    // Validate required fields
    if (empty($data['username']) || empty($data['name']) || empty($data['email'])) {
        echo json_encode(["status"=>"error","message"=>"Required fields missing"]);
        exit();
    }

    $id = $data['id'];
    
    // Security check - can only update own profile
    if ($id != $_SESSION['user_id']) {
        echo json_encode(["status"=>"error","message"=>"Unauthorized access"]);
        exit();
    }
    
    $username = $data['username'];
    $name = $data['name'];
    $email = $data['email'];
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? '';
    $department = $data['department'] ?? '';
    $profilePicture = null;

    $currentPictureStmt = $conn->prepare("SELECT profile_picture FROM users WHERE id=?");
    $currentPictureStmt->bind_param("i", $id);
    $currentPictureStmt->execute();
    $currentPictureRow = $currentPictureStmt->get_result()->fetch_assoc();
    $currentPicture = $currentPictureRow['profile_picture'] ?? null;

    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(["status"=>"error","message"=>"Profile picture upload failed"]);
            exit();
        }

        if ($_FILES['profile_picture']['size'] > 5 * 1024 * 1024) {
            echo json_encode(["status"=>"error","message"=>"Profile picture must be 5MB or smaller"]);
            exit();
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($_FILES['profile_picture']['tmp_name']);
        $allowedTypes = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            "image/gif" => "gif"
        ];

        if (!isset($allowedTypes[$mimeType])) {
            echo json_encode(["status"=>"error","message"=>"Only JPG, PNG, WEBP, or GIF profile pictures are allowed"]);
            exit();
        }

        $uploadDir = __DIR__ . "/../uploads/profile_pictures/";

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
            echo json_encode(["status"=>"error","message"=>"Could not create profile picture upload folder"]);
            exit();
        }

        $filename = "user_" . $id . "_" . bin2hex(random_bytes(8)) . "." . $allowedTypes[$mimeType];
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($_FILES['profile_picture']['tmp_name'], $destination)) {
            echo json_encode(["status"=>"error","message"=>"Could not save profile picture"]);
            exit();
        }

        $profilePicture = "/SYSTEM_VERSION_!/coordinator/Profile/uploads/profile_pictures/" . $filename;

        if (!empty($currentPicture) && strpos($currentPicture, "/SYSTEM_VERSION_!/coordinator/Profile/uploads/profile_pictures/") === 0) {
            $oldPicturePath = __DIR__ . "/.." . str_replace("/SYSTEM_VERSION_!/coordinator/Profile", "", $currentPicture);

            if (is_file($oldPicturePath)) {
                unlink($oldPicturePath);
            }
        }
    } else {
        $profilePicture = $currentPicture;
    }

    if(!empty($password)){
        $hashed = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("UPDATE users 
            SET username=?, name=?, email=?, password=?, role=?, department=?, profile_picture=? 
            WHERE id=?");
        $stmt->bind_param("sssssssi",$username,$name,$email,$hashed,$role,$department,$profilePicture,$id);

    } else {
        $stmt = $conn->prepare("UPDATE users 
            SET username=?, name=?, email=?, role=?, department=?, profile_picture=? 
            WHERE id=?");
        $stmt->bind_param("ssssssi",$username,$name,$email,$role,$department,$profilePicture,$id);
    }

    if($stmt->execute()){
        echo json_encode([
            "status"=>"success",
            "message"=>"Profile updated successfully",
            "profile_picture"=>$profilePicture
        ]);
    } else {
        echo json_encode(["status"=>"error","message"=>"Update failed: " . $conn->error]);
    }

    exit();
}
?>
