<?php

header( "Content-Type: application/json" );

// TODO: validate
$path = $_GET["path"];


//echo ('./'.$path);

$data = file_get_contents('./data/'.$path);
//$data = str_replace( array( '\r', '\n', '\r\n' ), array( ',\n', ',\n', ',\n' ), $data );
//$data = preg_replace('~\r\n?~', "XXX,\n", $data);
//$data = preg_replace("/\\r\\n|\\r|\\n/", ",\n", $data );
$arr = preg_split( "/\\r\\n|\\r|\\n/", $data );

//print_r( $arr );
echo '[';
foreach( $arr as $i => $token ) {
    $tmp = explode( ',', $token );

    if( !$token || !$tmp || count($tmp) == 0 )
        continue;

    if( $i > 0 )
        echo ",\n";    
    
    echo '{ "x" : ' . $tmp[0] . ', "y" : ' . $tmp[1] . "}";
}
echo ']';

/*
echo "{ x : [";
echo $data;
echo '0,0';
echo '] }';
*/
    
?>