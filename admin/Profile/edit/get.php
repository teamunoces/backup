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

    $stmt = $conn->prepare("SELECT id, username, name, email, role, department 
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

    $data = json_decode(file_get_contents("php://input"), true);
    
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

    if(!empty($password)){
        $hashed = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("UPDATE users 
            SET username=?, name=?, email=?, password=?, role=?, department=? 
            WHERE id=?");
        $stmt->bind_param("ssssssi",$username,$name,$email,$hashed,$role,$department,$id);

    } else {
        $stmt = $conn->prepare("UPDATE users 
            SET username=?, name=?, email=?, role=?, department=? 
            WHERE id=?");
        $stmt->bind_param("sssssi",$username,$name,$email,$role,$department,$id);
    }

    if($stmt->execute()){
        echo json_encode(["status"=>"success","message"=>"Profile updated successfully"]);
    } else {
        echo json_encode(["status"=>"error","message"=>"Update failed: " . $conn->error]);
    }

    exit();
}
?>