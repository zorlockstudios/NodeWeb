<?php
ini_set('display_errors', 1); 
ini_set('display_startup_errors', 1); 
error_reporting(E_ALL); 
class NodeRequest
{
    public $inputs = [];
    public $outputs = [];
}

$res = new NodeRequest;
$val = "Hello World!";
array_push($res->outputs,$val);

header('Content-Type: application/json');
echo json_encode($res);

?>