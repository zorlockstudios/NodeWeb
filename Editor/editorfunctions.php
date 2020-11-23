<?php
    $jsonheader = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    $action = $_GET["action"];
    $postaction = $_POST["postaction"];

    switch($action)
    {
        case "load-project":
            $myfile = $myfile = fopen("proj.txt", "r") or $myfile = fopen("proj.txt", "w");
            echo fread($myfile,filesize("proj.txt"));
            fclose($myfile);
            exit();
        break;

        case "load-nodes":
            //$filteredDir = array_slice( array_diff( scandir( "/Nodes" ), array( '..', '.', '.DS_Store' ) ), 0 );
            header('Content-Type: application/json');
            echo json_encode(getDirContents('Nodes'));  
            exit();
        break;


    }
    switch($postaction)
    {

        case "save-document":
            $myfile = fopen($_POST["dir"], "w");           
            $obj = json_decode($_POST["doc"], false);
            fwrite($myfile, json_encode($obj));
            exit();
        break;

        case "save-node":
            $myfile = fopen($_POST["dir"], "w");
            $obj = json_decode($_POST["node"], false);
            fwrite($myfile, json_encode($obj));
        break;

    }

    function getDirContents($dir, &$results = array()) {
        $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));

        $files = array(); 
        
        foreach ($rii as $file) {
        
            if ($file->isDir()){ 
                continue;
            }
            $files[] = $file->getPathname(); 
        
        }
    
        return $files;
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