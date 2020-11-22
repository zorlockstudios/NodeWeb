<?php

    $action = $_GET["action"];
    $postaction = $_POST["postaction"];

    switch($action)
    {
        case "load-project":
            $myfile = $myfile = fopen("proj.txt", "r") or $myfile = fopen("proj.txt", "w");
            echo fread($myfile,filesize("proj.txt"));
            fclose($myfile);
        break;


    }
    switch($postaction)
    {

        case "save-project":
            $myfile = fopen("proj.txt", "w");           
            $obj = json_decode($_POST["x"], false);
            fwrite($myfile, json_encode($obj));
        break;

    }

    class WebVar
    {
        public $name;
        public $type;
        public $containertype;

    }

    class WebNode
    {
        public $name;
        public $x;
        public $y;
        public $w;
        public $h;
        public $t;

        public $inputs = [];
        public $outputs = [];
    }

    class Project
    {
        public $name;       
        public $nodes = [];
    }

?>