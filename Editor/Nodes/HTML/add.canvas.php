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
$val = '<canvas id="'.$nr->inputs[1].'" style="display:block;  height: '.$nr->inputs[0].'; width: '.$nr->inputs[1].'; "></canvas>';
array_push($res->outputs,$val);
header('Content-Type: application/json');
echo json_encode($res);
?>