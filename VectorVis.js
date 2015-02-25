
//--------------------------------------------------------
// A Simple 2D Grid Class
var UGrid2D = function(min_corner,max_corner,resolution){
  this.min_corner=min_corner;
  this.max_corner=max_corner;
  this.resolution=resolution;
  console.log('UGrid2D instance created');
}


// Method: draw_grid
// Draw the grid lines

UGrid2D.prototype.draw_grid = function(canvas){
	  var ctx = canvas.getContext('2d');
	  loc=[0,0];
	  delta = canvas.width/this.resolution;
	  for (var i=0;i<=this.resolution;i++)
	  {
	  	ctx.moveTo(i*delta, 0);
      	ctx.lineTo(i*delta, canvas.height-1);
      	ctx.lineWidth = 1;
      	// set line color
      	ctx.strokeStyle = '#000000';
      	ctx.stroke();
	   }
	   loc=[0,0];

	  	delta = canvas.height/this.resolution;

	  for (var i=0;i<=this.resolution;i++)
	  {
	  	ctx.moveTo(0,i*delta);
      	ctx.lineTo(canvas.width-1,i*delta);
      	ctx.lineWidth = 1;
      	// set line color
      	ctx.strokeStyle = '#000000';
      	ctx.stroke();
	   }
}

// Methods to add later for sampled data
// Method: get_resolution

// Method: get_scalar

// Method: get_gradient

// Method: get_divergence

// Method: get_vorticity

// Method: compute_scalars

// Method: compute_gradients

// Method: compute_divergence

// Method: compute_vorticity

// Method: draw_glyphs

UGrid2D.prototype.draw_glyphs = function(scl,vec_func,canvas){
    var ctx = canvas.getContext('2d');
	  loc=[0,0];
	  delta_x = canvas.width/this.resolution;
    delta_y = canvas.height/this.resolution;

    ctx.beginPath();

    console.log("Draw glyphs")
	  for (var i=0;i<=this.resolution;i++)
      for(var j=0;j<=this.resolution;j++)
	      {

         pix = [i*delta_x,j*delta_y];
         var pt = pixel2pt(canvas.width,canvas.height,x_extent,y_extent,pix[0],pix[1]);
         var grad = vec_func(pt);
         console.log("GRADIENT: ",grad[0],grad[1]);



         var dest =[pt[0]+grad[0],pt[1]+grad[1]]
         var pixdest = pt2pixel(canvas.width,canvas.height,x_extent,y_extent,dest[0],dest[1]);

         // Scale
         pixdest[0]=pix[0]+((pixdest[0]-pix[0])*scl);
         pixdest[1]=pix[1]+((pixdest[1]-pix[1])*scl);

         var ctx = canvas.getContext('2d');

         ctx.beginPath();
         ctx.arc(pix[0],pix[1],2,0,2*Math.PI);
         //ctx.fillStyle="red";
         ctx.fill();
         //ctx.stroke();
         console.log("Draw line ", pix[0],pix[1], " to ", pixdest[0],pixdest[1]);
         ctx.beginPath();
	       ctx.moveTo(pix[0], pix[1]);
         ctx.lineTo(pixdest[0],pixdest[1]);
         ctx.lineWidth = 1;
         ctx.strokeStyle = '#000000';
         ctx.stroke();
        }
}

//End UGrid2D--------------------------------------------



//-------------------------------------------------------
// Global variables

var x_extent=[-1.0,1.0];
var y_extent=[-1.0,1.0];
var myGrid;


//------------------------------------------------------
//MAIN
function main() {

  // Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}

	render();
}

//--Function: render-------------------------------------
//Main drawing function

function render(canvas){
  var res = parseFloat(document.getElementById("grid_res").value);
  myGrid = new UGrid2D([x_extent[0],y_extent[0]],  [x_extent[1],y_extent[1]]  ,res);
  var canvas = document.getElementById('example');
  if (! canvas) {
    console.log(' Failed to retrieve the < canvas > element');
    return false;
  }
  else {
	console.log(' Got < canvas > element ');
  }


// Get the rendering context for 2DCG <- (2)
var ctx = canvas.getContext('2d');

// Draw the scalar data using an image rpresentation
var imgData=ctx.getImageData(0,0,canvas.width,canvas.height);


// Choose the scalar function
var scalar_func = gaussian;
if (document.getElementById("divergence").checked)
  scalar_func = gaussian_divergence;
if (document.getElementById("vorticity").checked)
  scalar_func = gaussian_vorticity_mag;

//Determine the data range...useful for the color mapping
var mn = scalar_func(pixel2pt(canvas.width,canvas.height,x_extent,y_extent,0,0));
var mx = mn
for (var y=0;y<canvas.height;y++)
	for (var x=0;x<canvas.width;x++)
  	{
  		var fval = scalar_func(pixel2pt(canvas.width,canvas.height,x_extent,y_extent,x,y));
  		if (fval < mn)
  			mn=fval;
  		if (fval>mx)
  			mx=fval;
  	}

// Set the colormap based in the radio button
var color_func = rainbow_colormap;
if (document.getElementById("greyscale").checked)
  color_func = greyscale_map;

//Color the domain according to the scalar value
for (var y=0;y<canvas.height;y++)
	for (var x=0;x<canvas.width;x++)
  	{
  		var fval = scalar_func(pixel2pt(canvas.width,canvas.height,x_extent,y_extent,x,y));

  		var color = color_func(fval,mn,mx);

  		i = (y*canvas.width + x)*4

  		imgData.data[i]=color[0];
  		imgData.data[i+1]= color[1];
  		imgData.data[i+2]= color[2];
  		imgData.data[i+3]= color[3];
     }

	ctx.putImageData(imgData,0,0);

  // Draw the grid if necessary
  if (document.getElementById("show_grid").checked)
    myGrid.draw_grid(canvas);
  //Draw glyphs if necessary
  if (document.getElementById("show_grad").checked){
    var scl = parseFloat(document.getElementById("line_scale").value);
    myGrid.draw_glyphs(scl, gaussian_gradient,canvas);
  }
}

//--------------------------------------------------------
// Map a point in pixel coordinates to the 2D function domain
function pixel2pt(width,height,x_extent,y_extent, p_x,p_y){
	var pt = [0,0];
	xlen=x_extent[1]-x_extent[0]
	ylen=y_extent[1]-y_extent[0]
	pt[0]=(p_x/width)*xlen + x_extent[0];
	pt[1]=(p_y/height)*ylen + y_extent[0];
	return pt;
	}

//--------------------------------------------------------
// Map a point in domain coordinates to pixel coordinates
function pt2pixel(width,height,x_extent,y_extent, p_x,p_y){
	var pt = [0,0];

	var xlen = (p_x-x_extent[0])/(x_extent[1]-x_extent[0]);
  var ylen = (p_y-y_extent[0])/(y_extent[1]-y_extent[0]);

	pt[0]=Math.round(xlen*width);
	pt[1]=Math.round(ylen*height);
	return pt;
	}

//--------------------------------------------------------
//A simple Gaussian function
function gaussian(pt){
	return Math.exp(-(pt[0]*pt[0]+pt[1]*pt[1]));
}

//--------------------------------------------------------
//The infamous rainbow color map, normalized to the data range
function rainbow_colormap(fval,fmin,fmax){
	var dx=0.8;
	var fval_nrm = (fval-fmin)/(fmax-fmin);
	var g = (6.0-2.0*dx)*fval_nrm +dx;
	var R = Math.max(0.0,(3.0-Math.abs(g-4.0)-Math.abs(g-5.0))/2.0 )*255;
	var G = Math.max(0.0,(4.0-Math.abs(g-2.0)-Math.abs(g-4.0))/2.0 )*255;
	var B = Math.max(0.0,(3.0-Math.abs(g-1.0)-Math.abs(g-2.0))/2.0 )*255;
	color = [Math.round(R),Math.round(G),Math.round(B),255];
	return color;
}

//--------------------------------------------------------
//Functions for you to write

function greyscale_map(fval,fmin,fmax){
  var c=255*((fval-fmin)/(fmax-fmin));
  var color = [Math.round(c),Math.round(c),Math.round(c),255];
	return color;
}

function gaussian_gradient(pt){
  var dx = -2*pt[0]*gaussian(pt);
  var dy = -2*pt[1]*gaussian(pt);
	return [dx,dy];
}

function gaussian_divergence(pt){
  var gradient =  gaussian_gradient(pt);
	return gradient[0]+gradient[1];
}

function gaussian_vorticity_mag(pt){
	return 0;
}

function normalize2D(v){
  var len = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
  if (len == 0.0)
    {
       console.log("Zero length gradient");
       return ([0.0,0.0]);
    }
  return [v[0]/len,v[1]/len];
}

