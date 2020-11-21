<?php
$servername = "";
$username = "";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
  die("\nConnection failed: " . $conn->connect_error);
}
// echo "\nConnected successfully";
?>