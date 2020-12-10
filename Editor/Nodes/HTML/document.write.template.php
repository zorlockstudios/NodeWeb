<?php

    class NodeRequest
    {
        public $inputs = [];
        public $outputs = [];
    }

    $data = $_POST['req'];
    $nr = json_decode($data);
    //input 0 on a flow node is the flow pin - ignore it
    $doc = $nr->inputs[1]."</html>";

    $myfile = fopen("../../Launch/Launch.html", "w");  
    fwrite($myfile, $doc);
    fclose($myfile);
    exit();

?>