var blueNode;
var redNode;
var isDragging=false;
var startX,startY;
var ctx;
var Nodes=[];
var offsetX,offsetY;
var selectedShapeIndex;

function reOffset(){
    var c = document.getElementById('canvas');
    var BB=c.getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top;        
}

function Init()
{
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        h = parseInt(document.getElementById('canvas').getAttribute('height'));
        w = parseInt(document.getElementById('canvas').getAttribute('width'));
     
      ctx = canvas.getContext('2d');
    }
    canvas.onmousedown=handleMouseDown;
    canvas.onmousemove=handleMouseMove;
    canvas.onmouseup=handleMouseUp;
    canvas.onmouseout=handleMouseOut;
    window.onscroll=function(e){ reOffset(); }
    window.onresize=function(e){ reOffset(); }
    canvas.onresize=function(e){ reOffset(); }
    reOffset();
    //TEST


    /*
    let myNode = new WebNode(ctx,"Flow Node",50,80,200,100,0);
    myNode.AddInput("INPUT A",0,0);
    myNode.AddOutput("OUTPUT A",0,0);
    myNode.AddOutput("OUTPUT B",0,0);
    Nodes.push( myNode );
    myNode = new WebNode(ctx,"Function Node",350,80,200,100,1);
    myNode.AddInput("INPUT A",0,0);
    myNode.AddInput("INPUT B",0,0);
    myNode.AddInput("INPUT C",0,0);
    myNode.AddOutput("OUTPUT",0,0); 
    Nodes.push( myNode );
    myNode = new WebNode(ctx,"My Node",250,120,200,100,1);
    myNode.AddInput("INPUT X",0,0);
    myNode.AddInput("INPUT Y",0,0);

    myNode.AddOutput("OUTPUT A",0,0); 
    myNode.AddOutput("OUTPUT B",0,0);
    Nodes.push( myNode );
*/

    $.get("editorfunctions.php?action=load-project", function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });

}

function draw() {
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx,w,h);
    for (let index = 0; index < Nodes.length; index++) {
        Nodes[index].drawThisNode();
        
    }
    //drawNode(ctx,50,80,200,100,0);

    //drawNode(ctx,350,80,200,100,1);
    
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

function drawNode(context,name,x,y,w,h,t)
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
    drawText(context,x+(radius-(fontsize/2)),y+(radius-(fontsize/2)),fontsize,name,'white');
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

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    startX=parseInt(e.clientX-offsetX);
    startY=parseInt(e.clientY-offsetY); 
    for(var i=0;i<Nodes.length;i++){
        if(isMouseInNode(startX,startY,Nodes[i]))
        {
            selectedShapeIndex=i;
            // set the isDragging flag
            isDragging=true;
            // and return (==stop looking for 
            //     further shapes under the mouse)
            return;
        }
    }
}

function handleMouseUp(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseOut(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseMove(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position         
    mouseX=parseInt(e.clientX-offsetX);
    mouseY=parseInt(e.clientY-offsetY);
    // how far has the mouse dragged from its previous mousemove position?
    var dx=mouseX-startX;
    var dy=mouseY-startY;
    // move the selected shape by the drag distance
    var selectedNode=Nodes[selectedShapeIndex];
    selectedNode.x+=dx;
    selectedNode.y+=dy;
    // clear the canvas and redraw all shapes
    draw();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
}

function isMouseInNode(mx,my,node)
{
    if( mx>node.x && mx<node.x+node.w && my>node.y && my<node.y+node.h){
        return(true);
    } else {
        return(false);
    }  
}

function isMouseInShape(mx,my,x,y,w,h)
{
    if( mx>x && mx<x+w && my>y && my<y+h){
        return(true);
    } else {
        return(false);
    }  
}

class WebVar {
    constructor(name,type,containerType)
    {
        this.name = name;
        this.type = type;
        this.containerType = containerType;
    }
}


class WebNode {
    constructor(context,name,x,y,w,h,t)
    {
        this.name = name;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.t = t;
        this.context = context;
        this.inputs=[];
        this.outputs=[];
        this.radius = 20;
        this.fontsize = 12;
        this.g = redNodeGradient(context,x,y,w,h);
    }

    AddInput(name,type,containerType)
    {
        let myInput = new WebVar(name,type,containerType);
        this.inputs.push(myInput);
    }

    AddOutput(name,type,containerType)
    {
        let myOutput = new WebVar(name,type,containerType);
        this.outputs.push(myOutput);
    }

    drawThisNode()
    {

        switch(this.t)
        {
            case 0:
                this.g = redNodeGradient(this.context,this.x,this.y,this.w,this.h);
            break;
    
            case 1:
                this.g = blueNodeGradient(this.context,this.x,this.y,this.w,this.h);
            break;
    
            default:
                this.g = redNodeGradient(this.context,this.x,this.y,this.w,this.h);
        }
        roundRect(this.context,this.x, this.y, this.w, this.h, this.radius, this.g);
        this.context.textAlign = 'left';
        drawText(this.context,this.x+(this.radius-(this.fontsize/2)),this.y+(this.radius-(this.fontsize/2)),this.fontsize,this.name,'white');
        this.drawPins(this.inputs,0);
        this.drawPins(this.outputs,1);
    }

    drawPins(pins,isIn)
    {
        if(isIn==0)
        {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                this.context.beginPath();
                this.context.arc(this.x+this.radius,this.y+(this.radius*2)+((this.radius)*index),this.radius/3,0,360,0);
                this.context.strokeStyle = 'white';
                this.context.lineWidth="3";
                this.context.stroke();
                this.context.closePath();
                this.context.textAlign = 'left';
                drawText(this.context,this.x+this.radius+(this.radius/2),this.y+(this.radius*2)+((this.radius)*index),this.fontsize*0.75,pin.name,'white');

            }
        } else {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                this.context.beginPath();
                this.context.arc(this.x+this.w-this.radius,this.y+(this.radius*2)+((this.radius)*index),this.radius/3,0,360,0);
                this.context.strokeStyle = 'white';
                this.context.lineWidth="3";
                this.context.stroke();     
                this.context.closePath();
                this.context.textAlign = 'right';
                drawText(this.context,this.x+this.w-this.radius-(this.radius/2),this.y+(this.radius*2)+((this.radius)*index),this.fontsize*0.75,pin.name,'white');
           
            }
        }
    }   


}

