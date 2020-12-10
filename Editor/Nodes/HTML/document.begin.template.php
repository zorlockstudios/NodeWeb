<?php

class NodeRequest
{
    public $inputs = [];
    public $outputs = [];
}

$data = $_POST['req'];
$nr = json_decode($data);

$res = new NodeRequest;
$res->inputs = $data->inputs;
$val = "<html>";
//blank val on array 0
array_push($res->outputs,"");
array_push($res->outputs,$val);

header('Content-Type: application/json');
echo json_encode($res);
?>