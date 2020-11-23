var blueNode;
var redNode;
var isDragging=false;
var isConnecting=false;
var isScrolling=false;
var startX,startY;
var ctx;
var WebDoc;
var offsetX,offsetY;
var ScrollX=0,ScrollY=0;
var selectedShapeIndex;
var selectedShapeConnectionIndex = -1;
var pixelFontLoaded=false;

function reOffset(){
    var c = document.getElementById('canvas');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    w = c.width;
    h = c.height;
    var BB=c.getBoundingClientRect();
    offsetX=BB.left;
    offsetY=BB.top; 
    WebDoc.Draw();  
}

function Init()
{
    
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        h = parseInt(document.getElementById('canvas').getAttribute('height'));
        w = parseInt(document.getElementById('canvas').getAttribute('width'));
     
      ctx = canvas.getContext('2d');
      LoadMyFonts(ctx);
    }
    WebDoc = new WebNodeDocument(ctx,"document");
    canvas.onmousedown=handleMouseDown;
    canvas.onmousemove=handleMouseMove;
    canvas.onmouseup=handleMouseUp;
    canvas.onmouseout=handleMouseOut;
    window.onscroll=function(e){ reOffset(); }
    window.onresize=function(e){ reOffset(); }
    canvas.onresize=function(e){ reOffset(); }
    window.addEventListener('DOMContentLoaded',LoadPixelFont);
    
    reOffset();
    //TEST

    

    
    let myNode = new WebNode(ctx,"Write Document",50,80,200,100,0);
    myNode.AddInput("",vartypes.FLOW,0);
    myNode.AddInput("Document Type",vartypes.STRING,0); 
    myNode.AddInput("Content",vartypes.STRING,0);
    //myNode.AddOutput("",vartypes.FLOW,0);
    //myNode.AddOutput("Float",vartypes.FLOAT,0);
    WebDoc.Nodes.push( myNode );
    
    myNode = new WebNode(ctx,"Doctype Javascript",350,80,200,100,1);
    //myNode.AddInput("Float",vartypes.FLOAT,0);
    //myNode.AddInput("Int",vartypes.INT,0);
    //myNode.AddInput("string",vartypes.STRING,0);
    myNode.AddOutput("string",vartypes.STRING,0); 
    //var saveit = JSON.stringify(myNode);
    WebDoc.Nodes.push( myNode );
    myNode = new WebNode(ctx,"Create Vector",250,120,200,100,1);
    myNode.AddInput("INPUT X",vartypes.FLOAT,0);
    myNode.AddInput("INPUT Y",vartypes.FLOAT,0);

    myNode.AddOutput("Vector 2",vartypes.VECTOR2,0); 

    WebDoc.Nodes.push( myNode );

    myNode = new WebNode(ctx,"Set Some Vector2",350,80,200,100,0);
    myNode.AddInput("",vartypes.FLOW,0);
    myNode.AddOutput("",vartypes.FLOW,0);   
    myNode.AddInput("Vector2",vartypes.VECTOR2,0);
    WebDoc.Nodes.push( myNode );

    myNode = new WebNode(ctx,"GET X",350,280,200,100,1);
    myNode.AddOutput("Float",vartypes.FLOAT,0);
    WebDoc.Nodes.push( myNode );
    myNode = new WebNode(ctx,"GET Y",350,180,200,100,1);
    myNode.AddOutput("Float",vartypes.FLOAT,0);
    WebDoc.Nodes.push( myNode );
    WebDoc.Draw();
    //var saveit = JSON.stringify(WebDoc);
    //$.post("editorfunctions.php",{"postaction" : "save-document", "dir" : "Documents/TestDoc.json", "doc" : saveit});
      /*
    $.get("editorfunctions.php?action=load-nodes", function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });
    */

}
/*
function draw() {
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, w, h);

    drawGrid(ctx,w,h);
    for (let index = 0; index < WebDoc.Nodes.length; index++) {
        WebDoc.Nodes[index].drawThisNode();
        
    }
    //drawNode(ctx,50,80,200,100,0);

    //drawNode(ctx,350,80,200,100,1);
    
  }
*/
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

function drawIcon(context,x,y,size,character,color)
{
    context.font = `${size}px Font Awesome 5 Free`;
    context.fillStyle = color;
    ctx.fillText(character,x,y);
}

function drawText(context,x,y,size,text,color)
{
    context.font = `${size}px Roboto`;
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

function drawConnection(context,startx,starty,ax,ay,bx,by)
{
    context.beginPath();
    context.lineWidth="4";
    context.moveTo(startx, starty);
    context.quadraticCurveTo(ax,ay,bx,by);
    context.stroke();
    context.closePath();
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

    if(e.button==0)
    {
        startX=parseInt(e.clientX-offsetX);
        startY=parseInt(e.clientY-offsetY); 
        for(var i=0;i<WebDoc.Nodes.length;i++){
            if(isMouseInNode(startX-ScrollX,startY-ScrollY,WebDoc.Nodes[i]))
            {
                selectedShapeIndex=i;
                // set the isDragging flag
                isDragging=true;
                // and return (==stop looking for 
                //     further shapes under the mouse)
                return;
            }
            if(isMouseInPin(startX-ScrollX,startY-ScrollY,WebDoc.Nodes[i]))
            {
                
                if(!isConnecting)
                {
                    selectedShapeIndex=i;
                    isConnecting=true;
                } else {
                    selectedShapeConnectionIndex = i;
                }
                
                //refresh
                WebDoc.Draw();
                return;
            }
        }
    } else if(e.button==1)
    {
        startX=parseInt(e.clientX-offsetX)-ScrollX;
        startY=parseInt(e.clientY-offsetY)-ScrollY; 
        isScrolling = true;
    }

}

function handleMouseUp(e){
    // return if we're not dragging
    if(!isDragging && !isConnecting && !isScrolling){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
    isScrolling=false;
    if(isConnecting)
    {
        //create the connection if it exists. 
        var node = WebDoc.Nodes[selectedShapeIndex];
        if(node.selectedinputPin>-1)
        {
            if(selectedShapeConnectionIndex>-1)
            {
                var selnode = WebDoc.Nodes[selectedShapeConnectionIndex];
                if(selnode.selectedoutputPin>-1 && selectedShapeConnectionIndex!=selectedShapeIndex)
                {
                    if(node.inputs[node.selectedinputPin].t==selnode.outputs[selnode.selectedoutputPin].t)
                    {
                        node.inputs[node.selectedinputPin].AddConnection(selnode.outputs[selnode.selectedoutputPin]);
                        selnode.outputs[selnode.selectedoutputPin].AddConnection(node.inputs[node.selectedinputPin]);
                    }
                }
            }
        }
        else if(node.selectedoutputPin >-1)
        {
            if(selectedShapeConnectionIndex>-1)
            {
                var selnode = WebDoc.Nodes[selectedShapeConnectionIndex];
                if(selnode.selectedinputPin>-1 && selectedShapeConnectionIndex!=selectedShapeIndex)
                {
                    if(node.outputs[node.selectedoutputPin].t==selnode.inputs[selnode.selectedinputPin].t)
                    {
                        node.outputs[node.selectedoutputPin].AddConnection(selnode.inputs[selnode.selectedinputPin]);
                        selnode.inputs[selnode.selectedinputPin].AddConnection(node.outputs[node.selectedoutputPin]);
                    }
                }
            }
        }
    }

    isConnecting=false;
    WebDoc.Draw();
}

function handleMouseOut(e){
    // return if we're not dragging
    if(!isDragging && !isConnecting && !isScrolling){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
    isConnecting=false;
    isScrolling=false;
    WebDoc.Draw();
}

function handleMouseMove(e){
    // return if we're not dragging
    if(!isDragging && !isConnecting && !isScrolling)
    {
        return;
    }
    if(isScrolling)
    {
        e.preventDefault();
        e.stopPropagation();

        mouseX=parseInt(e.clientX-offsetX);
        mouseY=parseInt(e.clientY-offsetY);

        var dx=mouseX-startX;
        var dy=mouseY-startY;

        ScrollX=dx;
        ScrollY=dy;
        WebDoc.Draw();
    }
    if(isDragging){
        
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
    var selectedNode=WebDoc.Nodes[selectedShapeIndex];
    selectedNode.x+=dx;
    selectedNode.y+=dy;
    // clear the canvas and redraw all shapes
    WebDoc.Draw();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
    return;
    }
    if(isConnecting)
    {
        e.preventDefault();
        e.stopPropagation();

        mouseX=parseInt(e.clientX-offsetX);
        mouseY=parseInt(e.clientY-offsetY);

        var dx=mouseX-startX;
        var dy=mouseY-startY;
        var nx = 0;
        var ny = 0;
        var selectedNode=WebDoc.Nodes[selectedShapeIndex];
        WebDoc.Draw();
        if(selectedNode.selectedinputPin>-1)
        {
            nx=selectedNode.x+selectedNode.inputs[selectedNode.selectedinputPin].x;
            ny=selectedNode.y+selectedNode.inputs[selectedNode.selectedinputPin].y;
            selectedNode.context.strokeStyle=colortype(selectedNode.inputs[selectedNode.selectedinputPin].t);
            drawConnection(selectedNode.context,nx+ScrollX,ny+ScrollY,nx-50+ScrollX,ny+ScrollY,mouseX,mouseY);
            
           
        }
        if(selectedNode.selectedoutputPin>-1)
        {
            nx=selectedNode.x+selectedNode.outputs[selectedNode.selectedoutputPin].x;
            ny=selectedNode.y+selectedNode.outputs[selectedNode.selectedoutputPin].y;
            selectedNode.context.strokeStyle=colortype(selectedNode.outputs[selectedNode.selectedoutputPin].t);
            drawConnection(selectedNode.context,nx+ScrollX,ny+ScrollY,nx+50+ScrollX,ny+ScrollY,mouseX,mouseY);
            
           
        }
        for(var i=0;i<WebDoc.Nodes.length;i++)
        {

            if(isMouseInPin(startX-ScrollX,startY-ScrollY,WebDoc.Nodes[i]))
            {
                

                selectedShapeConnectionIndex = i;

            }
        }
        startX=mouseX;
        startY=mouseY;
        return;
    }
}

function isMouseInPin(mx,my,node)
{
    return(node.OverPin(mx,my));
}

function isMouseInNode(mx,my,node)
{
    if( mx>node.x && mx<node.x+node.w && my>node.y && my<node.y+node.radius){
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

class WebPinConnection {

    constructor(t,A,B)
    {
        this.t = t;
        this.A = A;
        this.B = B;
    }
}

class WebVar {
    constructor(name,t,parent,containerType)
    {
        this.name = name;
        this.t = t;
        this.containerType = containerType;
        this.x = 0;
        this.y = 0;
        this.connections=[];
        this.parent = parent;
    }

    toJSON()
    {
        return {
            "name" : this.name,
            "t" : this.t,
            "containerType" : this.containerType,
            "x" : this.x,
            "y" : this.y,
            "connections" : this.connections,
        };
    }

    AddConnection(pin)
    {
        let con = new WebPinConnection(0,this,pin);
        this.connections.push(con);
    }

    SetPinLocation(x,y)
    {
        this.x = x;
        this.y = y;
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
        this.selectedinputPin = -1;
        this.selectedoutputPin = -1;
    }

    OverPin(mx,my)
    {
        var isover = false;
        
        for (let index = 0; index < this.inputs.length; index++) {
            var pin = this.inputs[index];
            if( mx>this.x+pin.x-(this.radius/6) && mx<this.x+pin.y+(this.radius/6) && my>this.y+pin.y-(this.radius/6) && my<this.y+pin.y+(this.radius/6)){
                this.selectedinputPin = index;
                this.selectedoutputPin = -1;
                return(true);
            }
        } 
        
        for (let index = 0; index < this.outputs.length; index++) {
            var pin = this.outputs[index];
            if( mx>this.x+pin.x-(this.radius/6) && mx<this.x+pin.x+(this.radius/6) && my>this.y+pin.y-(this.radius/6) && my<this.y+pin.y+(this.radius/6)){
                this.selectedoutputPin = index;
                this.selectedinputPin = -1;
                return(true);
            }           
        }
        return(isover);
    }

    AddInput(name,t,containerType)
    {
        let myInput = new WebVar(name,t,this,containerType);       
        myInput.SetPinLocation(this.radius,(this.radius*2)+((this.radius)*this.inputs.length));
        this.inputs.push(myInput);
    }

    AddOutput(name,t,containerType)
    {
        let myOutput = new WebVar(name,t,this,containerType);
        myOutput.SetPinLocation(this.w-this.radius,(this.radius*2)+((this.radius)*this.outputs.length));
        this.outputs.push(myOutput);
    }

    drawThisNode()
    {

        switch(this.t)
        {
            case 0:
                this.g = redNodeGradient(this.context,this.x+ScrollX,this.y+ScrollY,this.w,this.h);
            break;
    
            case 1:
                this.g = blueNodeGradient(this.context,this.x+ScrollX,this.y+ScrollY,this.w,this.h);
            break;
    
            default:
                this.g = redNodeGradient(this.context,this.x+ScrollX,this.y+ScrollY,this.w,this.h);
        }
        roundRect(this.context,this.x+ScrollX, this.y+ScrollY, this.w, this.h, this.radius, this.g);
        this.context.textAlign = 'left';
        drawText(this.context,this.x+(this.radius-(this.fontsize/2))+ScrollX,this.y+(this.radius-(this.fontsize/2))+ScrollY,this.fontsize,this.name,'white');
        this.drawPins(this.inputs,0);
        this.drawPins(this.outputs,1);
    }

    drawConnections(pin,control)
    {
        
        for (let index = 0; index < pin.connections.length; index++) 
        {
            var con = pin.connections[index];
            this.context.strokeStyle = colortype(pin.t); 
            drawConnection(this.context,this.x+pin.x+ScrollX,this.y+pin.y+ScrollY,this.x+pin.x+control+ScrollX,this.y+pin.y+ScrollY,(((this.x+pin.x)+(con.B.parent.x+con.B.x))/2)+ScrollX,(((con.B.parent.y+con.B.y)+(this.y+pin.y))/2)+ScrollY);
        }
        
    }

    drawPins(pins,isIn)
    {
        if(isIn==0)
        {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                this.context.beginPath();
                this.context.arc(this.x+pin.x+ScrollX,this.y+pin.y+ScrollY,this.radius/3,0,360,0);
                if(this.selectedinputPin==index && isConnecting)
                {
                    this.context.strokeStyle = colortype(pin.t); 
                } else {
                    this.context.strokeStyle = colortype(pin.t);  
                }
                //this.context.strokeStyle = 'white';
                this.context.lineWidth="3";
                this.context.stroke();
                this.context.closePath();
                this.context.textAlign = 'left';
                drawText(this.context,this.x+pin.x+(this.radius/2)+ScrollX,this.y+pin.y+ScrollY,this.fontsize*0.75,pin.name,'white');
                this.drawConnections(pin,-50);
            }
        } else {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                this.context.beginPath();
                this.context.arc(this.x+pin.x+ScrollX,this.y+pin.y+ScrollY,this.radius/3,0,360,0);
                if(this.selectedoutputPin==index && isConnecting)
                {
                    this.context.strokeStyle = colortype(pin.t); 
                } else {
                    this.context.strokeStyle = colortype(pin.t);  
                }
                //this.context.strokeStyle = 'white';
                this.context.lineWidth="3";
                this.context.stroke();     
                this.context.closePath();
                this.context.textAlign = 'right';
                drawText(this.context,this.x+pin.x-(this.radius/2)+ScrollX,this.y+pin.y+ScrollY,this.fontsize*0.75,pin.name,'white');
                this.drawConnections(pin,50);
           
            }
        }
    }
    



}

class WebNodeDocument
{
    constructor(context,name)
    {
        this.context = context;
        this.name = name;
        this.Nodes=[];
    }

    Draw()
    {
        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(0, 0, w, h);
        this.context.textAlign = 'right';
        
        drawGrid(this.context,w,h);
        drawText(this.context,w-(w/6)-20,h-45,50,this.name,'rgba(255, 200, 0, 0.2)');
        for (let index = 0; index < this.Nodes.length; index++) {
            this.Nodes[index].drawThisNode();
            
        }
        this.DrawLeftSideBar();
        this.DrawRightSideBar();
        this.DrawMenuBar();
    }

    DrawLeftSideBar()
    {
        this.context.fillStyle = 'DimGrey';
        this.context.fillRect(0, 50, w/6, h);

    }
    DrawRightSideBar()
    {
        this.context.fillStyle = 'DimGrey';
        this.context.fillRect(w-(w/6), 50, w/6, h);
    }

    DrawMenuBar()
    {
        this.context.fillStyle = 'DimGrey';
        this.context.fillRect(0, 0, w, 50);       

        drawIcon(this.context,60,20,80,String.fromCharCode(0xF001),'white');

    }

}

function LoadMyFonts(context)
{
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://fonts.googleapis.com/css?family=Roboto';
    document.getElementsByTagName('head')[0].appendChild(link);
    var image = new Image;
    image.src = link.href;
    image.onerror = function() {
        context.font = '50px "Roboto"';
        context.textBaseline = 'middle';
        context.fillText('Hello!', 20, 10);
        WebDoc.Draw();
    };
/*
    var blink = document.createElement('link');
    blink.rel = 'stylesheet';
    //blink.type = 'text/css';
    blink.href = 'all.css';
    document.getElementsByTagName('head')[0].appendChild(blink);
    var bimage = new Image;
    bimage.src = blink.href;
    bimage.onerror = function() {
        context.font = '50px "Font Awesome 5 Free Solid"';
        context.textBaseline = 'middle';
        context.fillText('Hello!', 20, 10);
        WebDoc.Draw();
    };
    */
}

function LoadPixelFont(e)
{
    PixelFontCanvas.loadFont('BMFont/', 'FontAwesome.txt', (data) => { pixelFontLoaded=true; });


}

