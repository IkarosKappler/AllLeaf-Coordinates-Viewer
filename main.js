/**
 * The main script for the Leaf Renderer.
 *
 * @author   Ikaros Kappler
 * @date     2017-06-07
 * @version  1.0.0
 **/

$( document ).ready( function() {

    var $canvas           = $( 'canvas#my_canvas' );
    var ctx               = $canvas[0].getContext('2d');
    var $debug            = $( 'div#debug' );

    var canvas_width      = 640;
    var canvas_height     = 640;

    var offset            = { x : canvas_width/2, y : canvas_height/2 };
    var scale             = { x : 1.0, y : 1.0 };

    var currentLeafPoints = null;

    var irand             = function(n) {
	return Math.floor( Math.random()*n );
    };

    var randomPoint   = function(max_x, max_y) {
	return new Complex( irand(max_x), irand(max_y) );
    };

    var computeBounds = function( data ) {

	var xmin = Number.POSITIVE_INFINITY;
	var xmax = Number.NEGATIVE_INFINITY;
	var ymin = Number.POSITIVE_INFINITY;
	var ymax = Number.NEGATIVE_INFINITY;
	for( var i = 0; i < data.length; i++ ) {
	    xmin = Math.min( xmin, data[i].x );
	    xmax = Math.max( xmax, data[i].x );
	    ymin = Math.min( ymin, data[i].y );
	    ymax = Math.max( ymax, data[i].y );
	}
	return { xmin : xmin, ymin : ymin, xmax : xmax, ymax, width : xmax-xmin, height : ymax-ymin, centerx : (xmax-xmin)/2, centery : (ymax-ymin)/2 };
    };
    
    var normalize = function( data ) {
	var bounds = computeBounds(data);
	console.log( "Bounds: " + JSON.stringify(bounds) );
	var result = [];
	var hmargin = 20;
	var vmargin = 20;
	var scale = Math.max( bounds.width, bounds.height );
	for( var i = 0; i < data.length; i++ ) {
	    result[i] = { x : hmargin + Math.round((data[i].x-bounds.xmin)/scale*(canvas_width-2*hmargin)),
			  y : vmargin + Math.round((data[i].y-bounds.ymin)/scale*(canvas_height-2*vmargin))
			};
	}
	return result;
    }

    // http://jsfiddle.net/soulwire/HbMLh/
    // (Currently not in use)
    function catmullRom( points, ctx ) {
	
	var p0, p1, p2, p3, i6 = 1.0 / 6.0;
	
	for ( var i = 3, n = points.length; i < n; i++ ) {

            p0 = points[i - 3];
            p1 = points[i - 2];
            p2 = points[i - 1];
            p3 = points[i];
            
            ctx.bezierCurveTo(
		p2.x * i6 + p1.x - p0.x * i6,
		p2.y * i6 + p1.y - p0.y * i6,
		p3.x * -i6 + p2.x + p1.x * i6,
		p3.y * -i6 + p2.y + p1.y * i6,
		p2.x,
		p2.y
            );
	}
    }
    
    function draw() {
	// Cleaning canvas?
	ctx.fillStyle='white';
	ctx.fillRect(0,0,canvas_width,canvas_height);
	if( !currentLeafPoints || !currentLeafPoints.length )
	    return;
	
	// Draw leaf data
	//console.log( "Draw leaf data: " + JSON.stringify(currentLeafPoints) );
	ctx.translate(0.5,0.5); // Fix for the half-pixel issue
	ctx.beginPath();
	ctx.moveTo( currentLeafPoints[0].x, currentLeafPoints[0].y );
	for( var i = 1; i < currentLeafPoints.length; i++ ) {
	    //console.log('test');
	    ctx.lineTo( currentLeafPoints[i].x, currentLeafPoints[i].y );
	    // Catmull rendering is somehow foo for so many points ...
	    //if( i >= 3 )
	//	catmullRom( [currentLeafPoints[i-3], currentLeafPoints[i-2], currentLeafPoints[i-1], currentLeafPoints[i-0]] , ctx );
	}
	ctx.closePath();
	ctx.strokeStyle = 'black';
	ctx.lineWidth   = 1.0;
	ctx.stroke();
	ctx.fillStyle   = '#008828';
	ctx.fill();
	// Draw shape
	//draw_shape( ctx );
	ctx.translate(-0.5,-0.5); // Fix for the half-pixel issue
    }

    $inputName = $( 'input#name' );


    var reload = function() {
	var url = "http://func.name/services/AllLeaf_coordinates/get.php?path=" + $inputName.val();
	console.log( 'url=' + url );

	$.get( { url : url,
		 crossDomain: true,
		 dataType : 'json', // THIS IS REQUIRED FOR CORS
		 success: function(data) {
		     //alert(data);
		     //draw();
		 }
	       }
	      )
	    .done( function(data, textStatus, jqXHR ) {
		//console.log( 'success: ' + JSON.stringify(data) );
		currentLeafPoints = normalize(data);
		draw();
	    } )
	    .fail( function(jqxhr, textStatus, error) {
		console.log('Error (textStatus=' + JSON.stringify(textStatus) + ')' );
		console.log('Error: ' + JSON.stringify(error) );
	    } );
	
    };

    var $pathSelect  = $( 'select#path_select' );
    var $breadCrumbs = $( 'div#breadcrumbs' );
    
    var currentDir = ['.'];
    var loadList = function() {
	var url = 'http://func.name/services/AllLeaf_coordinates/list.php?dir=' + currentDir.join('/');
	console.log( 'url=' + url );

	$.get( { url : url,
		 crossDomain: true,
		 dataType : 'json', // THIS IS REQUIRED FOR CORS
		 success: function(data) {
		     //alert(data);
		     //draw();
		 }
	       }
	     )
	    .done( function(data, textStatus, jqXHR ) {
		//console.log( 'success: ' + JSON.stringify(data) );
		$pathSelect.empty();
		$pathSelect.append( $( '<option/>' ).html( '--select--' ) );
		for( index in data ) {
		    var path = data[index];
		    $pathSelect.append( $( '<option/>' ).val( path ).html( path ) );
		}
	    } )
	    .fail( function(jqxhr, textStatus, error) {
		console.log('Error (textStatus=' + JSON.stringify(textStatus) + ')' );
		console.log('Error: ' + JSON.stringify(error) );
	    } );
    };

    var handlePathSelectChange = function(event) {
	var selected = $pathSelect.find( 'option:selected' ).val();
	if( !selected )
	    return;
	if( selected.endsWith('.txt') ) {
	    $inputName.val(currentDir.join('/')+'/'+selected);
	    reload();
	} else {
	    $breadCrumbs.append( $( '<div/>' ).addClass( 'breadcrumb' ).attr('id','bc_'+currentDir.length).data('filename',selected).html( '<a href="#" data-index="'+currentDir.length+'" onclick="handlePathUp(this)">'+selected+'</a>&rarr;') );
	    currentDir.push( selected );
	    loadList();
	}
    };

    window.handlePathUp = function(elem) {
	$anchor = $(elem);
	var pathIndex = $anchor.attr('data-index');
	console.log( 'pathIndex=' + pathIndex );
	// Remove all trailing elements from the path and from the breadcrumbs
	for( var i = currentDir.length-1; i >= pathIndex; i-- ) {
	    var $tmp = $( 'div#bc_' + i ); //.detach();
	    console.log( 'attr=' + $tmp.attr('data-index') );
	    $tmp.detach();
	}
	currentDir.splice(pathIndex, currentDir.length-1);
	
	loadList();
    };
    
    $pathSelect.change( handlePathSelectChange );
    

    loadList();
    reload();
    //draw(ctx);

    //$( 'input#node_count' ).change( rebuild );
    $( 'button#reload' ).click( reload );

    /*
    var mouseDown                = false;
    var mouseDownPosition        = null;
    var draggedPointIndex        = -1;
    var draggedPoint             = null;
    var mouseDownPointDifference = null;
    $canvas.mousedown( function(event) {
	mouseDown = true;
	mouseDownPosition = canvasPosition2Complex(event);
	draggedPointIndex = locateGraphPointAt( mouseDownPosition, 10 );
	if( draggedPointIndex != -1 ) {
	    draggedPoint             = graph.points()[draggedPointIndex];
	    mouseDownPointDifference = draggedPoint.clone().sub( mouseDownPosition );
	    console.log( 'begin drag of point ' + draggedPointIndex + ' difference=' + mouseDownPointDifference );
	} else {
	    draggedPoint             = null;
	    mouseDownPointDifference = null;
	}
	
	//draw_shape( ctx );
    } );
    $canvas.mouseup( function(event) {
	mouseDown         = false;
	mouseDownPosition = null;
	if( draggedPointIndex != -1 )
	    console.log( 'end drag of point ' + draggedPointIndex );
	draggedPointIndex = -1;
	draggedPoint      = null;
    } );
    $canvas.mousemove( function(event) {
	if( !mouseDown ) 
	    return;
	var z = canvasPosition2Complex(event);
	$debug.empty().html( JSON.stringify(z) );

	var diff = mouseDownPosition.clone().sub( z );
	if( draggedPoint ) {
	    // console.log( 'move difference: ' + diff );
	    draggedPoint.sub( diff );
	}
	mouseDownPosition = z;
	
	draw_shape( ctx );
    } );
    */
} );


var getFloatInput = function(id) {
    return parseFloat( document.getElementById(id).value );
}

var getIntegerInput = function(id) {
    return parseInt( document.getElementById(id).value );
}

