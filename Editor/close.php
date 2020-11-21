<?php
try {
    $conn->close();
    // echo "\nClosed Connection successfully";
  } catch(PDOException $e) {
    echo "\nConnection failed: " . $e->getMessage();
  }
?>