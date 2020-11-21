var blueNode;
var redNode;

var ctx;

function Init()
{
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        h = parseInt(document.getElementById('canvas').getAttribute('height'));
        w = parseInt(document.getElementById('canvas').getAttribute('width'));
     
      ctx = canvas.getContext('2d');
    }

}

function draw() {
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx,w,h);

    drawNode(ctx,50,80,200,100,0);

    drawNode(ctx,350,80,200,100,1);
    
  }

function drawGrid(context,w,h) {
    // Box width
    var bw = w;
    // Box height
    var bh = h;
    // Padding
    var p = 0;

    for (var x = 0; x <= bw; x += 40) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 40) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }
    context.strokeStyle = 'rgba(50, 50, 50, 0.5)';
    context.stroke();
}

function blueNodeGradient(ctx,x,y,w,h)
{
    blueNode = ctx.createLinearGradient(x+(w/2), y, x+(w/2), y+h);
    blueNode.addColorStop(0, 'blue');
    blueNode.addColorStop(.65, 'darkblue');
    blueNode.addColorStop(1, 'black');
    return blueNode;
}

function redNodeGradient(ctx,x,y,w,h)
{
    redNode = ctx.createLinearGradient(x+(w/2), y, x+(w/2), y+h);
    redNode.addColorStop(0, 'red');
    redNode.addColorStop(.65, 'darkred');
    redNode.addColorStop(1, 'black');
    return redNode;
}


function drawText(context,x,y,size,text,color)
{
    context.font = `${size}px serif`;
    context.fillStyle = color;
    ctx.fillText(text,x,y);
}

function drawNode(context,x,y,w,h,t)
{
    var radius = 20;
    var fontsize =12;
    var g;
    switch(t)
    {
        case 0:
            g = redNodeGradient(ctx,x,y,w,h);
        break;

        case 1:
            g = blueNodeGradient(ctx,x,y,w,h);
        break;

        default:
            g = redNodeGradient(ctx,x,y,w,h);
    }
    roundRect(context,x, y, w, h, radius, g);
    drawText(context,x+(radius-(fontsize/2)),y+(radius-(fontsize/2)),fontsize,'Node','white');
}


function roundRect(context,x, y, w, h, radius, gradient)
{
  var r = x + w;
  var b = y + h;
  context.beginPath();
  context.strokeStyle="white";
  context.lineWidth="4";
  context.moveTo(x+radius, y);
  context.lineTo(r-radius, y);
  context.quadraticCurveTo(r, y, r, y+radius);
  context.lineTo(r, y+h-radius);
  context.quadraticCurveTo(r, b, r-radius, b);
  context.lineTo(x+radius, b);
  context.quadraticCurveTo(x, b, x, b-radius);
  context.lineTo(x, y+radius);
  context.quadraticCurveTo(x, y, x+radius, y);
  context.stroke();
  context.fillStyle=gradient;
  context.fill();
  context.closePath();

  var greyGradient = ctx.createLinearGradient(x+(w/2), y, x+(w/2), b);
  greyGradient.addColorStop(0, 'DarkGray');
  greyGradient.addColorStop(.15, 'DimGray');
  greyGradient.addColorStop(0.35, 'black');


  context.beginPath();
  context.moveTo(x, y+radius);
  context.lineTo(r, y+radius);
  context.lineTo(r, y+h-radius);
  context.quadraticCurveTo(r, b, r-radius, b);
  context.lineTo(x+radius, b);
  context.quadraticCurveTo(x, b, x, b-radius);
  context.lineTo(x, y+radius);
  //context.quadraticCurveTo(x, y, x+radius, y);
  context.fillStyle=greyGradient;
  context.fill();
  context.closePath();
}