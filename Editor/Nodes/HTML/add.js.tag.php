<?php

class NodeRequest
{
    public $inputs = [];
    public $outputs = [];
}

$data = $_POST['req'];
$nr = json_decode($data);
$res = new NodeRequest;
$res->inputs = $nr->inputs;
$val = '<script src="'.$nr->inputs[1].'"></script>';
array_push($res->outputs,$val);
header('Content-Type: application/json');
echo json_encode($res);

?>