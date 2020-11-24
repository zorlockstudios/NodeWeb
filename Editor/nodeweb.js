var pixelFontLoaded=false;
var pixelDirFontLoaded=false;
var WebDoc;
var WebNodeUI;

function reOffset(){
    var c = document.getElementById('canvas');
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    w = c.width;
    h = c.height;
    var BB=c.getBoundingClientRect();

    WebNodeUI.offsetX=BB.left;
    WebNodeUI.offsetY=BB.top; 
    WebNodeUI.w = w;
    WebNodeUI.h = h;
    WebNodeUI.Draw();  
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
    WebNodeUI= new WebNodeGUI(canvas,ctx,w,h);
    WebDoc = new WebNodeDocument(canvas,ctx,"document");
    WebNodeUI.Init();
    canvas.onmousedown=WebNodeUI.HandleMouseDown;
    canvas.onmousemove=WebNodeUI.HandleMouseMove;
    canvas.onmouseup=WebNodeUI.HandleMouseUp;
    canvas.onmouseout=WebNodeUI.HandleMouseOut;
    window.onscroll=function(e){ reOffset(); }
    window.onresize=function(e){ reOffset(); }
    canvas.onresize=function(e){ reOffset(); }
    window.addEventListener('DOMContentLoaded',LoadPixelFont);
    
    reOffset();
    //TEST

    

    
    let myNode = new WebNode(ctx,"Write Document",550,380,200,100,0);
    myNode.AddInput("",vartypes.FLOW,0);
    myNode.AddInput("Document Type",vartypes.STRING,0); 
    myNode.AddInput("Content",vartypes.STRING,0);
    //myNode.AddOutput("",vartypes.FLOW,0);
    //myNode.AddOutput("Float",vartypes.FLOAT,0);
    WebDoc.Nodes.push( myNode );
    
    myNode = new WebNode(ctx,"Doctype Javascript",350,280,200,100,1);
    //myNode.AddInput("Float",vartypes.FLOAT,0);
    //myNode.AddInput("Int",vartypes.INT,0);
    //myNode.AddInput("string",vartypes.STRING,0);
    myNode.AddOutput("string",vartypes.STRING,0); 
    //var saveit = JSON.stringify(myNode);
    WebDoc.Nodes.push( myNode );
    myNode = new WebNode(ctx,"Create Vector",250,420,200,100,1);
    myNode.AddInput("INPUT X",vartypes.FLOAT,0);
    myNode.AddInput("INPUT Y",vartypes.FLOAT,0);

    myNode.AddOutput("Vector 2",vartypes.VECTOR2,0); 

    WebDoc.Nodes.push( myNode );

    myNode = new WebNode(ctx,"Set Some Vector2",350,580,200,100,0);
    myNode.AddInput("",vartypes.FLOW,0);
    myNode.AddOutput("",vartypes.FLOW,0);   
    myNode.AddInput("Vector2",vartypes.VECTOR2,0);
    WebDoc.Nodes.push( myNode );

    myNode = new WebNode(ctx,"GET X",750,780,200,100,1);
    myNode.AddOutput("Float",vartypes.FLOAT,0);
    WebDoc.Nodes.push( myNode );
    myNode = new WebNode(ctx,"GET Y",650,680,200,100,1);
    myNode.AddOutput("Float",vartypes.FLOAT,0);
    WebDoc.Nodes.push( myNode );
    WebNodeUI.Draw();
    //var saveit = JSON.stringify(WebDoc);
    //$.post("editorfunctions.php",{"postaction" : "save-document", "dir" : "Documents/TestDoc.json", "doc" : saveit});
      /*
    $.get("editorfunctions.php?action=load-nodes", function(data, status){
        alert("Data: " + data + "\nStatus: " + status);
    });
    */

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
        this.g = WebNodeUI.GetNodeGradient(x,y,w,h,t);
        this.selectedinputPin = -1;
        this.selectedoutputPin = -1;
    }


    MouseOver(mx,my)
    {
        if( mx>this.x && mx<this.x+this.w && my>this.y && my<this.y+this.radius){
            return(true);
        } else {
            return(false);
        }  
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
        
        WebNodeUI.DrawNode(this.name,this.x+WebNodeUI.ScrollX, this.y+WebNodeUI.ScrollY, this.w, this.h,this.t);
        this.drawPins(this.inputs,0);
        this.drawPins(this.outputs,1);
    }

    drawConnections(pin,control)
    {
        
        for (let index = 0; index < pin.connections.length; index++) 
        {
            var con = pin.connections[index];
            this.context.strokeStyle = colortype(pin.t); 
            WebNodeUI.DrawConnection(this.x+pin.x+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.x+pin.x+control+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,(((this.x+pin.x)+(con.B.parent.x+con.B.x))/2)+WebNodeUI.ScrollX,(((con.B.parent.y+con.B.y)+(this.y+pin.y))/2)+WebNodeUI.ScrollY);
        }
        
    }

    drawPins(pins,isIn)
    {
        if(isIn==0)
        {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                if(pin.t!=4)
                {
                    this.context.beginPath();
                    this.context.arc(this.x+pin.x+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.radius/3,0,360,0);
                    if(this.selectedinputPin==index && WebNodeUI.isConnecting)
                    {
                        this.context.strokeStyle = colortype(pin.t); 
                    } else {
                        this.context.strokeStyle = colortype(pin.t);  
                    }
                    //this.context.strokeStyle = 'white';
                    this.context.lineWidth="3";
                    this.context.stroke();
                    this.context.closePath();
                } else {
                    WebNodeUI.DrawIcon(this.x+pin.x+WebNodeUI.ScrollX-15,this.y+pin.y+WebNodeUI.ScrollY-15,'Webdir',1,30,String.fromCharCode(60009),'#FFFFFF');
                }
                this.context.textAlign = 'left';
                WebNodeUI.DrawText(this.x+pin.x+(this.radius/2)+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.fontsize*0.75,pin.name,'white');
                this.drawConnections(pin,-50);
            }
        } else {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                if(pin.t!=4)
                {
                    this.context.beginPath();
                    this.context.arc(this.x+pin.x+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.radius/3,0,360,0);
                    if(this.selectedoutputPin==index && WebNodeUI.isConnecting)
                    {
                        this.context.strokeStyle = colortype(pin.t); 
                    } else {
                        this.context.strokeStyle = colortype(pin.t);  
                    }
                    //this.context.strokeStyle = 'white';
                    this.context.lineWidth="3";
                    this.context.stroke();     
                    this.context.closePath();
                } else {
                    WebNodeUI.DrawIcon(this.x+pin.x+WebNodeUI.ScrollX-15,this.y+pin.y+WebNodeUI.ScrollY-15,'Webdir',1,30,String.fromCharCode(60009),'#FFFFFF');
                }
                this.context.textAlign = 'right';
                WebNodeUI.DrawText(this.x+pin.x-(this.radius/2)+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.fontsize*0.75,pin.name,'white');
                this.drawConnections(pin,50);
           
            }
        }
    }
    
}

class WebNodeDocument
{
    constructor(canvas,context,name)
    {
        this.canvas = canvas;
        this.context = context;
        this.name = name;
        this.Nodes=[];
    }

    Draw()
    {
        WebNodeUI.DrawText(w-(w/6)-20,h-45,50,this.name,'rgba(255, 200, 0, 0.2)');
        for (let index = 0; index < this.Nodes.length; index++) {
            this.Nodes[index].drawThisNode();
            
        }
    }
}

class WebNodeGuiButton
{
    constructor(icon,label,x,y,w,h)
    {
        this.icon = icon;
        this.label = label;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hovering=false;
    }

    Draw()
    {
        WebNodeUI.context.strokeStyle = 'Black';
        WebNodeUI.context.lineWidth = 2;
        if(this.hovering)
        {
            WebNodeUI.context.fillStyle = 'GoldenRod';
        } else {
            WebNodeUI.context.fillStyle = 'Gray';
        }
        WebNodeUI.context.fillRect(this.x, this.y, this.w, this.h); 
        //New      
        WebNodeUI.DrawIcon(this.x+((this.w/2)-15),this.y+((this.w/2)-15),'Webapp',1,30,String.fromCharCode(this.icon),'#FFFFFF');
        WebNodeUI.context.textAlign = 'center';
        WebNodeUI.context.shadowBlur = 2;
        WebNodeUI.context.shadowColor = 'Black';
        WebNodeUI.DrawText(this.x+(this.w/2),this.y+this.h-8,16,this.label,'white');
    }

    MouseOver(mx,my)
    {
        if( mx>this.x && mx<this.x+this.w && my>this.y && my<this.y+this.h){
            return(true);
        } else {
            return(false);
        }  
    }
}

class WebNodeGUI
{
    constructor(canvas,context,width,height)
    {
        this.isDragging=false;
        this.isConnecting=false;
        this.isScrolling=false;
        this.isHoveringUI=false;
        this.hoveringElement;
        this.startX = 0;
        this.startY = 0;
        this.canvas = canvas;
        this.context = context;
        this.WebDoc;
        this.offsetX = 0;
        this.offsetY = 0;
        this.ScrollX=0;
        this.ScrollY=0;
        this.selectedShapeIndex = -1;
        this.selectedShapeConnectionIndex = -1;
        this.pixelFontLoaded=false;
        this.w = width;
        this.h = height;
        this.MenuButtons = []
    }

    Init()
    {
        this.MenuButtons.push(new WebNodeGuiButton(61223,'New',20,5,80,80));
        this.MenuButtons.push(new WebNodeGuiButton(61189,'Save',120,5,80,80));
        this.MenuButtons.push(new WebNodeGuiButton(61237,'Load',220,5,80,80));
        this.MenuButtons.push(new WebNodeGuiButton(61409,'Compile',320,5,80,80));
        this.MenuButtons.push(new WebNodeGuiButton(61401,'Launch',420,5,80,80));

    }

    Draw()
    {
        this.context.shadowBlur = 2;
        this.context.shadowColor = 'Black';
        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(0, 0, w, h);
        this.context.textAlign = 'right';
        this.DrawGrid();
        WebDoc.Draw();
        this.DrawLeftSideBar();
        this.DrawRightSideBar();
        this.DrawMenuBar();
    }

    DrawGrid() {
        // Box width
        var bw = w;
        // Box height
        var bh = h;
        // Padding
        var p = 0;
    
        for (var x = 0; x <= bw; x += 40) {
            this.context.moveTo(0.5 + x + p, p);
            this.context.lineTo(0.5 + x + p, bh + p);
        }
    
        for (var x = 0; x <= bh; x += 40) {
            this.context.moveTo(p, 0.5 + x + p);
            this.context.lineTo(bw + p, 0.5 + x + p);
        }
        this.context.strokeStyle = 'rgba(50, 50, 50, 0.5)';
        this.context.stroke();
    }

    NodeGradient(x,y,w,h,colors)
    {
        var nodegrad = this.context.createLinearGradient(x+(w/2), y, x+(w/2), y+h);
        nodegrad.addColorStop(0, colors[0]);
        nodegrad.addColorStop(.65, colors[1]);
        nodegrad.addColorStop(1, colors[2]);
        return nodegrad;
    }

    DrawText(x,y,size,text,color)
    {
        this.context.font = `${size}px Roboto`;
        this.context.fillStyle = color;
        this.context.fillText(text,x,y);
    }

    RoundRect(x, y, w, h, radius, gradient)
    {
      var r = x + w;
      var b = y + h;
      this.context.beginPath();
      this.context.strokeStyle="white";
      this.context.lineWidth="4";
      this.context.moveTo(x+radius, y);
      this.context.lineTo(r-radius, y);
      this.context.quadraticCurveTo(r, y, r, y+radius);
      this.context.lineTo(r, y+h-radius);
      this.context.quadraticCurveTo(r, b, r-radius, b);
      this.context.lineTo(x+radius, b);
      this.context.quadraticCurveTo(x, b, x, b-radius);
      this.context.lineTo(x, y+radius);
      this.context.quadraticCurveTo(x, y, x+radius, y);
      this.context.stroke();
      this.context.fillStyle=gradient;
      this.context.fill();
      this.context.closePath();   
      var greyGradient = this.context.createLinearGradient(x+(w/2), y, x+(w/2), b);
      greyGradient.addColorStop(0, 'DarkGray');
      greyGradient.addColorStop(.15, 'DimGray');
      greyGradient.addColorStop(0.35, 'black');  
      this.context.beginPath();
      this.context.moveTo(x, y+radius);
      this.context.lineTo(r, y+radius);
      this.context.lineTo(r, y+h-radius);
      this.context.quadraticCurveTo(r, b, r-radius, b);
      this.context.lineTo(x+radius, b);
      this.context.quadraticCurveTo(x, b, x, b-radius);
      this.context.lineTo(x, y+radius);
      this.context.fillStyle=greyGradient;
      this.context.fill();
      this.context.closePath();
    }

    DrawConnection(startx,starty,ax,ay,bx,by)
    {
        this.context.beginPath();
        this.context.lineWidth="4";
        this.context.moveTo(startx, starty);
        this.context.quadraticCurveTo(ax,ay,bx,by);
        this.context.stroke();
        this.context.closePath();
    }

    GetNodeGradient(x,y,w,h,t)
    {
        var g;
        switch(t)
        {
            case 0:
                var colors = ['red','darkred','black'];
                g = this.NodeGradient(x,y,w,h,colors);
            break;

            case 1:
                var colors = ['blue','darkblue','black'];
                g = this.NodeGradient(x,y,w,h,colors);
            break;

            default:
                var colors = ['darkgrey','dimgrey','black'];
                g = this.NodeGradient(x,y,w,h,colors);
        }   
        return(g);
    }

    DrawNode(name,x,y,w,h,t)
    {
        var radius = 20;
        var fontsize =12;
        var g = this.GetNodeGradient(x,y,w,h,t);    
        this.RoundRect(x, y, w, h, radius, g);
        this.context.textAlign = 'left';
        this.DrawText(x+(radius-(fontsize/2)),y+(radius-(fontsize/2)),fontsize,name,'white');

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
        this.context.fillRect(0, 0, w, 90); 
        for (let index = 0; index < WebNodeUI.MenuButtons.length; index++) {
            var p = WebNodeUI.MenuButtons[index];
            p.Draw();
        }
    }

    DrawIcon(xx,yy,bfont,bscale,bwidth,character,tint)
    {
        if(pixelFontLoaded && pixelDirFontLoaded)
        {
            PixelFontCanvas.drawText(this.canvas,character,{

                font: bfont,
                x: xx,
                y: yy,
                scale: bscale,
                width: bwidth,
                align: 'center',
                tint: tint

            });
        }
    }
    HandleMouseDown(e){
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
    
        if(e.button==0)
        {
            WebNodeUI.startX=parseInt(e.clientX-WebNodeUI.offsetX);
            WebNodeUI.startY=parseInt(e.clientY-WebNodeUI.offsetY); 
            if(!WebNodeUI.isHoveringUI)
            {
                for(var i=0;i<WebDoc.Nodes.length;i++){
                    if(WebDoc.Nodes[i].MouseOver(WebNodeUI.startX-WebNodeUI.ScrollX,WebNodeUI.startY-WebNodeUI.ScrollY))
                    {
                        WebNodeUI.selectedShapeIndex=i;
                        // set the isDragging flag
                        WebNodeUI.isDragging=true;
                        // and return (==stop looking for 
                        //     further shapes under the mouse)
                        return;
                    }
                    if(WebDoc.Nodes[i].OverPin(WebNodeUI.startX-WebNodeUI.ScrollX,WebNodeUI.startY-WebNodeUI.ScrollY))
                    {
                        
                        if(!WebNodeUI.isConnecting)
                        {
                            WebNodeUI.selectedShapeIndex=i;
                            WebNodeUI.isConnecting=true;
                        } else {
                            WebNodeUI.selectedShapeConnectionIndex = i;
                        }
                        
                        //refresh
                        WebNodeUI.Draw();
                        return;
                    }
                }
            }
        } else if(e.button==1)
        {
            WebNodeUI.startX=parseInt(e.clientX-WebNodeUI.offsetX)-WebNodeUI.ScrollX;
            WebNodeUI.startY=parseInt(e.clientY-WebNodeUI.offsetY)-WebNodeUI.ScrollY; 
            WebNodeUI.isScrolling = true;
            WebNodeUI.Draw();
        }
    
    }

    HandleMouseUp(e){
        // return if we're not dragging
        if(!WebNodeUI.isDragging && !WebNodeUI.isConnecting && !WebNodeUI.isScrolling){return;}
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // the drag is over -- clear the isDragging flag
        WebNodeUI.isDragging=false;
        WebNodeUI.isScrolling=false;
        if(WebNodeUI.isConnecting)
        {
            //create the connection if it exists. 
            var node = WebDoc.Nodes[WebNodeUI.selectedShapeIndex];
            if(node.selectedinputPin>-1)
            {
                if(WebNodeUI.selectedShapeConnectionIndex>-1)
                {
                    var selnode = WebDoc.Nodes[WebNodeUI.selectedShapeConnectionIndex];
                    if(selnode.selectedoutputPin>-1 && WebNodeUI.selectedShapeConnectionIndex!=WebNodeUI.selectedShapeIndex)
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
                if(WebNodeUI.selectedShapeConnectionIndex>-1)
                {
                    var selnode = WebDoc.Nodes[WebNodeUI.selectedShapeConnectionIndex];
                    if(selnode.selectedinputPin>-1 && WebNodeUI.selectedShapeConnectionIndex!=WebNodeUI.selectedShapeIndex)
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
    
        WebNodeUI.isConnecting=false;
        WebNodeUI.Draw();
    }


    HandleMouseOut(e)
    {
        // return if we're not dragging
        if(!WebNodeUI.isDragging && !WebNodeUI.isConnecting && !WebNodeUI.isScrolling){
            
            return;
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // the drag is over -- clear the isDragging flag
        WebNodeUI.isDragging=false;
        WebNodeUI.isConnecting=false;
        WebNodeUI.isScrolling=false;
        WebNodeUI.Draw();
    }

    HandleMouseMove(e)
    {
        // return if we're not dragging
        if(!WebNodeUI.isDragging && !WebNodeUI.isConnecting && !WebNodeUI.isScrolling)
        {
            e.preventDefault();
            e.stopPropagation();
    
            WebNodeUI.mouseX=parseInt(e.clientX-WebNodeUI.offsetX);
            WebNodeUI.mouseY=parseInt(e.clientY-WebNodeUI.offsetY);
            //check UI hovering
            WebNodeUI.CheckButtonHover(WebNodeUI.mouseX,WebNodeUI.mouseY);
            WebNodeUI.Draw();
            return;
        }
        if(WebNodeUI.isScrolling)
        {
            e.preventDefault();
            e.stopPropagation();
    
            WebNodeUI.mouseX=parseInt(e.clientX-WebNodeUI.offsetX);
            WebNodeUI.mouseY=parseInt(e.clientY-WebNodeUI.offsetY);
    
            var dx=WebNodeUI.mouseX-WebNodeUI.startX;
            var dy=WebNodeUI.mouseY-WebNodeUI.startY;
    
            WebNodeUI.ScrollX=dx;
            WebNodeUI.ScrollY=dy;
            WebNodeUI.Draw();
            return;
        }
        if(WebNodeUI.isDragging){
            
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // calculate the current mouse position         
        WebNodeUI.mouseX=parseInt(e.clientX-WebNodeUI.offsetX);
        WebNodeUI.mouseY=parseInt(e.clientY-WebNodeUI.offsetY);
        // how far has the mouse dragged from its previous mousemove position?
        var dx=WebNodeUI.mouseX-WebNodeUI.startX;
        var dy=WebNodeUI.mouseY-WebNodeUI.startY;
        // move the selected shape by the drag distance
        var selectedNode=WebDoc.Nodes[WebNodeUI.selectedShapeIndex];
        selectedNode.x+=dx;
        selectedNode.y+=dy;
        // clear the canvas and redraw all shapes
        WebNodeUI.Draw();
        // update the starting drag position (== the current mouse position)
        WebNodeUI.startX=WebNodeUI.mouseX;
        WebNodeUI.startY=WebNodeUI.mouseY;
        return;
        }
        if(WebNodeUI.isConnecting)
        {
            e.preventDefault();
            e.stopPropagation();
    
            WebNodeUI.mouseX=parseInt(e.clientX-WebNodeUI.offsetX);
            WebNodeUI.mouseY=parseInt(e.clientY-WebNodeUI.offsetY);
    
            var dx=WebNodeUI.mouseX-WebNodeUI.startX;
            var dy=WebNodeUI.mouseY-WebNodeUI.startY;
            var nx = 0;
            var ny = 0;
            var selectedNode=WebDoc.Nodes[WebNodeUI.selectedShapeIndex];
            WebNodeUI.Draw();
            if(selectedNode.selectedinputPin>-1)
            {
                nx=selectedNode.x+selectedNode.inputs[selectedNode.selectedinputPin].x;
                ny=selectedNode.y+selectedNode.inputs[selectedNode.selectedinputPin].y;
                selectedNode.context.strokeStyle=colortype(selectedNode.inputs[selectedNode.selectedinputPin].t);
                WebNodeUI.DrawConnection(nx+WebNodeUI.ScrollX,ny+ScrollY,nx-50+WebNodeUI.ScrollX,ny+ScrollY,WebNodeUI.mouseX,WebNodeUI.mouseY);
                
               
            }
            if(selectedNode.selectedoutputPin>-1)
            {
                nx=selectedNode.x+selectedNode.outputs[selectedNode.selectedoutputPin].x;
                ny=selectedNode.y+selectedNode.outputs[selectedNode.selectedoutputPin].y;
                selectedNode.context.strokeStyle=colortype(selectedNode.outputs[selectedNode.selectedoutputPin].t);
                WebNodeUI.DrawConnection(nx+WebNodeUI.ScrollX,ny+WebNodeUI.ScrollY,nx+50+WebNodeUI.ScrollX,ny+WebNodeUI.ScrollY,WebNodeUI.mouseX,WebNodeUI.mouseY);
                
               
            }
            for(var i=0;i<WebDoc.Nodes.length;i++)
            {
    
                if(WebDoc.Nodes[i].OverPin(WebNodeUI.startX-WebNodeUI.ScrollX,WebNodeUI.startY-WebNodeUI.ScrollY))
                {
                    
    
                    WebNodeUI.selectedShapeConnectionIndex = i;
    
                }
            }
            WebNodeUI.startX=WebNodeUI.mouseX;
            WebNodeUI.startY=WebNodeUI.mouseY;
            return;
        }
    }

    CheckButtonHover(mx,my)
    {
        WebNodeUI.isHoveringUI=false;
        for (let index = 0; index < WebNodeUI.MenuButtons.length; index++) {
            var p = WebNodeUI.MenuButtons[index];
            
            if(p.MouseOver(mx,my))
            {
                p.hovering=true;
                WebNodeUI.isHoveringUI=true;
                WebNodeUI.hoveringElement=p;
            } else {
                p.hovering=false;
            }
        }
        
    }



    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
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
        WebNodeUI.Draw();
    };
}

function LoadPixelFont(e)
{
    PixelFontCanvas.loadFont('BMFont/', 'Webdir.fnt', (data) => { pixelDirFontLoaded = true; WebDoc.Draw(); });
    PixelFontCanvas.loadFont('BMFont/', 'Webapp.fnt', (data) => { pixelFontLoaded=true; WebDoc.Draw(); });

}

