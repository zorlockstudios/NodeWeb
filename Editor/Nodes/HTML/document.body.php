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
$val = '<body>';
for ($i=0; $i < sizeof($nr->inputs); $i++) { 
    $val .= $nr->inputs[$i];
}
$val .= '</body>';
array_push($res->outputs,$val);

header('Content-Type: application/json');
echo json_encode($res);

?>