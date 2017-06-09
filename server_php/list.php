<?php
/**
 * @author Ikaros Kappler
 * @date   2017-06-09
 * @version 1.0.0
 **/

header( 'Content-Type: text/plain; charset=utf-8' );

$dir = '.';
if( array_key_exists('dir',$_GET) )
    $dir = $_GET['dir'];


// Found at
//   https://stackoverflow.com/questions/1628699/test-if-a-directory-is-a-sub-directory-of-another-folder
function is_sub_dir($path = NULL, $parent_folder = SITE_PATH) {

    //Get directory path minus last folder
    $dir = dirname($path);
    $folder = substr($path, strlen($dir));

    //Check the the base dir is valid
    $dir = realpath($dir);

    //Only allow valid filename characters
    $folder = preg_replace('/[^a-z0-9\.\-_]/i', '', $folder);

    //If this is a bad path or a bad end folder name
    if( !$dir OR !$folder OR $folder === '.') {
        return FALSE;
    }

    //Rebuild path
    $path = $dir. DS. $folder;

    //If this path is higher than the parent folder
    if( strcasecmp($path, $parent_folder) > 0 ) {
        return $path;
    }

    return FALSE;
}


//if( !is_sub_dir('
function check($file) {
    if( strpos($file,'.') === 0 )
        return false;
    return true;
}

$list = scandir( './data/' . $dir );
$list = array_filter( $list, 'check' );

echo json_encode( array_values($list) );

?>