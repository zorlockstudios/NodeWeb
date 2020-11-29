<?php


class NodeRequest
{
    public $inputs = [];
    public $outputs = [];
}

$data = $_POST['req'];
$nr = json_decode($data);

$res = new NodeRequest;
$val = $nr->inputs[0].''.$nr->inputs[1];
array_push($res->outputs,$val);

header('Content-Type: application/json');
echo json_encode($res);

?>