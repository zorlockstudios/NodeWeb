var pixelFontLoaded=false;
var pixelDirFontLoaded=false;
//var WebDoc;
var WebNodeUI;

var vartypes = { INT: 1, FLOAT: 2, STRING: 3, FLOW : 4, BOOL : 5, VECTOR2 : 6, VECTOR3 : 7, VECTOR4 : 8 };


function colortype(t)
{
    switch(t)
    {
        case vartypes.INT:
            return('dodgerblue');
        case vartypes.FLOAT:
            return('forestgreen');
        case vartypes.STRING:
            return('darkviolet');
        case vartypes.FLOW:
            return('ghostwhite');
        case vartypes.VECTOR2:
            return('Olive');
        case vartypes.BOOL:
            return('darkred');   
        case vartypes.VECTOR3:
            return('Orange');       
        case vartypes.VECTOR3:
            return('SlateBlue');                 
        default:
            return ('SlateGrey');
    }

    
}

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
    WebNodeUI.MainDoc = new WebNodeDocument(canvas,ctx,"document");
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
   
    WebNodeUI.MainDoc.AddWebNode('Nodes/HTML/document.begin',true);
}


class WebPinConnection {

    constructor(t,A,B)
    {
        this.t = t;
        this.A = A;
        this.B = B;
        this.guid;
    }

    toJSON()
    {
        return {
            "t" : this.t,
            "guid" : this.guid,
            "A" : this.A.guid,
            "B" : this.B.guid
        };
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
        this.val;
        this.isInput = false;
        this.defaultval;
        this.currentval;
        this.guid;
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
            "defaultval" : this.defaultval,
            "guid" : this.guid
        };
    }

    DeleteConnection(pin)
    {
        for (let index = 0; index < this.connections.length; index++) {
            var p = this.connections[index];
            if(p.B===pin)
            {
                this.connections.splice(0, index+1); 
                return;
            }
        }
    }

    AddConnection(pin)
    {

        let con = new WebPinConnection(0,this,pin);
        con.guid = WebNodeUI.uuidv4();
        if(this.isInput)
        {
            if(this.connections.length>0)
            {
                this.connections[0].B.DeleteConnection(this);
                this.connections[0]=con;
            } else {
                this.connections.push(con);
            }
        } else {
            this.connections.push(con);
        }
        
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
        this.templatepath = "..";
        this.context = WebNodeUI.context;
        this.inputs=[];
        this.outputs=[];
        this.radius = 20;
        this.fontsize = 12;
        this.g = WebNodeUI.GetNodeGradient(x,y,w,h,t);
        this.selectedinputPin = -1;
        this.selectedoutputPin = -1;
        this.guid;
    }

    Reload()
    {
        var index = 0;
        for (index = 0; index < this.inputs.length; index++) {
            var pin = this.inputs[index];
            var thepin = new WebVar(pin.name,pin.t,this,pin.containerType);
            this.inputs[index] = Object.assign(thepin,pin);
            this.inputs[index].guid = WebNodeUI.uuidv4();
        } 
        for (index = 0; index < this.outputs.length; index++) {
            var pin = this.outputs[index];
            var thepin = new WebVar(pin.name,pin.t,this,pin.containerType);
            this.outputs[index] = Object.assign(thepin,pin);
            this.outputs[index].guid = WebNodeUI.uuidv4();
        } 
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
        myInput.guid = WebNodeUI.uuidv4();      
        myInput.isInput = true; 
        myInput.SetPinLocation(this.radius,(this.radius*2)+((this.radius)*this.inputs.length));
        this.inputs.push(myInput);
    }

    AddOutput(name,t,containerType)
    {
        let myOutput = new WebVar(name,t,this,containerType);
        myOutput.guid = WebNodeUI.uuidv4();
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
            WebNodeUI.context.strokeStyle = colortype(pin.t); 
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
                    WebNodeUI.context.beginPath();
                    WebNodeUI.context.arc(this.x+pin.x+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.radius/3,0,360,0);
                    if(this.selectedinputPin==index && WebNodeUI.isConnecting)
                    {
                        WebNodeUI.context.strokeStyle = colortype(pin.t); 
                    } else {
                        WebNodeUI.context.strokeStyle = colortype(pin.t);  
                    }
                    //this.context.strokeStyle = 'white';
                    WebNodeUI.context.lineWidth="3";
                    WebNodeUI.context.stroke();
                    WebNodeUI.context.closePath();
                } else {
                    WebNodeUI.DrawIcon(this.x+pin.x+WebNodeUI.ScrollX-15,this.y+pin.y+WebNodeUI.ScrollY-15,'Webdir',1,30,String.fromCharCode(60009),'#FFFFFF');
                }
                WebNodeUI.context.textAlign = 'left';
                WebNodeUI.DrawText(this.x+pin.x+(this.radius/2)+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.fontsize*0.75,pin.name,'white');
                this.drawConnections(pin,-50);
            }
        } else {
            for (let index = 0; index < pins.length; index++) {
                var pin = pins[index];
                if(pin.t!=4)
                {
                    WebNodeUI.context.beginPath();
                    WebNodeUI.context.arc(this.x+pin.x+WebNodeUI.ScrollX,this.y+pin.y+WebNodeUI.ScrollY,this.radius/3,0,360,0);
                    if(this.selectedoutputPin==index && WebNodeUI.isConnecting)
                    {
                        WebNodeUI.context.strokeStyle = colortype(pin.t); 
                    } else {
                        WebNodeUI.context.strokeStyle = colortype(pin.t);  
                    }
                    //this.context.strokeStyle = 'white';
                    WebNodeUI.context.lineWidth="3";
                    WebNodeUI.context.stroke();     
                    WebNodeUI.context.closePath();
                } else {
                    WebNodeUI.DrawIcon(this.x+pin.x+WebNodeUI.ScrollX-15,this.y+pin.y+WebNodeUI.ScrollY-15,'Webdir',1,30,String.fromCharCode(60009),'#FFFFFF');
                }
                WebNodeUI.context.textAlign = 'right';
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
        this.Functions=[];
        this.Variabes=[];
        this.Entrynode;
        this.guid = WebNodeUI.uuidv4();
    }

    Draw()
    {
        WebNodeUI.DrawText(w-(w/6)-20,h-45,50,this.name,'rgba(255, 200, 0, 0.2)');
        for (let index = 0; index < this.Nodes.length; index++) {
            this.Nodes[index].drawThisNode();
            
        }
    }

    AddNewVariable()
    {
        //var nv = new WebVar(name,t,parent,containerType);
        $('#newvarModal').modal('show');
    }

    AddNewFunction()
    {   

        $('#newfuncModal').modal('show');


    }



    SaveDocument()
    {
        $('#savedocModal').modal('show');
    }

    OnClick()
    {
        WebNodeUI.CurrentDoc = this.obj;

    }



    AddWebNode(path,isEntry=false)
    {
        $.get("https://zorlockstudios.com/NodeWeb/Editor/editorfunctions.php?action=load-node&path="+path, function(data, status){
        console.log(data);
        var node = new WebNode(WebNodeUI.context,"",200,200,200,200,0);
        var newnode = Object.assign(node, data);
        newnode.guid = WebNodeUI.uuidv4();
        newnode.Reload();
        if(isEntry)
        {
            WebNodeUI.CurrentDoc.Entrynode = newnode;
        }
        WebNodeUI.CurrentDoc.Nodes.push(newnode);
        //alert("Data: " + data + "\nStatus: " + status);
        });
    }
}


class WebNodeFunction extends WebNodeDocument
{
    constructor(canvas,context,name)
    {       
        super(canvas,context,name);

    }

    InitFunc()
    {
        var myNode = new WebNode(ctx,'Entry to '+this.name,WebNodeUI.w/2,WebNodeUI.h/2,200,100,2);
        myNode.AddOutput("",vartypes.FLOW,0);   
        this.Entrynode = myNode;
        this.Nodes.push(myNode);
    }

}

class WebNodeGuiWidget
{
    constructor(x,y,w,h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hovering=false;
        this.obj;
        this.fontsize=16;
        this.delegate = function() {};
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
    }

    MouseOver(mx,my)
    {
        if( mx>this.x && mx<this.x+this.w && my>this.y && my<this.y+this.h){
            this.hovering = true;
            return(true);
        } else {
            this.hovering = false;
            return(false);
        }  
    }
}

class WebNodeGuiButton extends WebNodeGuiWidget
{
    constructor(icon,label,x,y,w,h)
    {
        super(x,y,w,h);
        this.icon = icon;
        this.label = label;  
        this.align = 'center';     
    }

    Draw()
    {
        super.Draw();
        //New     
        if(this.align=='center')
        { 
            WebNodeUI.DrawIcon(this.x+((this.w/2)-15),this.y+((this.h/2)-15),'Webapp',1,30,String.fromCharCode(this.icon),'#FFFFFF');
            WebNodeUI.context.textAlign = 'center';
            WebNodeUI.context.shadowBlur = 2;
            WebNodeUI.context.shadowColor = 'Black';
            WebNodeUI.DrawText(this.x+(this.w/2),this.y+this.h-(this.fontsize/2),this.fontsize,this.label,'white');
        } else if(this.align=='left')
        {
            WebNodeUI.DrawIcon(this.x+15,this.y+((this.h/2)-15),'Webapp',1,30,String.fromCharCode(this.icon),'#FFFFFF');
            WebNodeUI.context.textAlign = 'left';
            WebNodeUI.context.shadowBlur = 2;
            WebNodeUI.context.shadowColor = 'Black';
            WebNodeUI.DrawText(this.x+50,this.y+this.fontsize+(this.fontsize/2),this.fontsize,this.label,'white');            
        } else if(this.align=='right')
        {
            WebNodeUI.DrawIcon(this.x+this.w-15,this.y+((this.h/2)-15),'Webapp',1,30,String.fromCharCode(this.icon),'#FFFFFF');
            WebNodeUI.context.textAlign = 'right';
            WebNodeUI.context.shadowBlur = 2;
            WebNodeUI.context.shadowColor = 'Black';
            WebNodeUI.DrawText(this.x+this.w-50,this.y+this.fontsize+(this.fontsize/2),this.fontsize,this.label,'white');            
        }
    }
}

class WebNodeGuiListItem extends WebNodeGuiWidget
{
    constructor(icon,label,x,y,w,h)
    {
        super(x,y,w,h);
        this.icon = icon;
        this.label = label;     
        this.parent;  
        this.color = '#FFFFFF';
    }

    Draw()
    {

        WebNodeUI.context.strokeStyle = 'Black';
        WebNodeUI.context.lineWidth = 2;
        if(this.parent.hovering)
        {
            if(this.hovering)
            {
                WebNodeUI.context.fillStyle = 'GoldenRod';
            } else {
                WebNodeUI.context.fillStyle = 'Gray';
            }
        } else {
            this.hovering = false;
            WebNodeUI.context.fillStyle = 'Gray';
        }
        WebNodeUI.context.fillRect(this.x, this.y, this.w, 40); 

        WebNodeUI.DrawIcon(this.x+15,this.y+5,'Webapp',1,30,String.fromCharCode(this.icon),this.color);
        WebNodeUI.context.textAlign = 'left';
        WebNodeUI.context.shadowBlur = 2;
        WebNodeUI.context.shadowColor = 'Black';
        WebNodeUI.DrawText(this.x+50,this.y+this.fontsize+(this.fontsize/2),this.fontsize,this.label,'white');
    }


}

class WebNodeGuiListView extends WebNodeGuiWidget
{
    constructor(icon,label,x,y,w,h)
    {
        super(x,y,w,h);
        this.icon = icon;
        this.label = label;
        this.container = [];
        this.hoveringElement;
    }
    
    AddItem(icon,label,itm,del,col='#FFFFFF')
    {
        var newitem = new WebNodeGuiListItem(icon,label,0,0,100,40);
        newitem.obj = itm;
        newitem.parent = this;
        newitem.delegate = del;
        newitem.color = col;
        this.container.push(newitem);

    }

    MouseOver(mx,my)
    {
        if( mx>this.x && mx<this.x+this.w && my>this.y && my<this.y+this.h){
            for (let index = 0; index < this.container.length; index++) {
                var e = this.container[index];
                if(e.MouseOver(mx,my))
                {
                    this.hovering = true;
                    this.hoveringElement = e;
                    return(true);
                }
            }
            return(false);
        } else {
            this.hovering = false;
            this.hoveringElement = null;
            return(false);
        } 

    }

    Draw()
    {
        WebNodeUI.context.strokeStyle = 'Black';
        WebNodeUI.context.lineWidth = 2;
        WebNodeUI.context.fillStyle = 'Gray';
        WebNodeUI.context.fillRect(this.x, this.y, this.w, this.h); 
        WebNodeUI.context.fillRect(this.x, this.y, this.w, 40); 

        WebNodeUI.DrawIcon(this.x+15,this.y+5,'Webapp',1,30,String.fromCharCode(this.icon),'#FFFFFF');
        WebNodeUI.context.textAlign = 'left';
        WebNodeUI.context.shadowBlur = 2;
        WebNodeUI.context.shadowColor = 'Black';
        WebNodeUI.DrawText(this.x+50,this.y+this.fontsize+(this.fontsize/2),this.fontsize,this.label,'white');

        for (let index = 0; index < this.container.length; index++) {
            var e = this.container[index];
            e.w = this.w-10;
            e.h = 40;
            e.x = this.x+5;
            e.y = this.y+50+(40*index);
            e.Draw();
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
        this.offsetX = 0;
        this.offsetY = 0;
        this.ScrollX=0;
        this.ScrollY=0;
        this.selectedShapeIndex = -1;
        this.selectedShapeConnectionIndex = -1;
        this.pixelFontLoaded=false;
        this.w = width;
        this.h = height;
        this.MenuButtons = [];
        this.GraphList;
        this.FunctionList;
        this.VariableList;
        this.NewFunction;
        this.NewVariable;
        this.LeftBarButtons = [];
        this.CurrentDoc;
        this.MainDoc;
        this.NodeQueue;
        this.CompiledData;

    }

    Init()
    {
        this.MenuButtons.push(new WebNodeGuiButton(61223,'New',20,5,80,80));
        var SaveButton = new WebNodeGuiButton(61189,'Save',120,5,80,80);
        SaveButton.delegate = function() { WebNodeUI.MainDoc.SaveDocument(); };
        this.MenuButtons.push(SaveButton);
        this.MenuButtons.push(new WebNodeGuiButton(61237,'Load',220,5,80,80));

        var nb = new WebNodeGuiButton(61176,'Nodes',320,5,80,80);
        nb.delegate = function() { AddNodeFunction('Nodes'); };
        this.MenuButtons.push(nb);   

        this.MenuButtons.push(new WebNodeGuiButton(61409,'Compile',420,5,80,80));
        var b = new WebNodeGuiButton(61401,'Launch',520,5,80,80);
        b.delegate = function() { WebNodeUI.Launch(); };
        this.MenuButtons.push(b);
        this.GraphList = new WebNodeGuiListView(61419,'Node Graphs',5,120,100,100);
        this.GraphList.AddItem(61266,this.MainDoc.name,this.MainDoc,this.MainDoc.OnClick);
        this.FunctionList = new WebNodeGuiListView(61375,'Functions',5,240,100,300);
        this.VariableList = new WebNodeGuiListView(61374,'Variables',5,560,100,300);
        
        this.NewFunction = new WebNodeGuiButton(61378,'New',35,240,60,40);
        this.NewFunction.align = "left";
        this.NewFunction.delegate = function() { WebNodeUI.MainDoc.AddNewFunction(); };

        this.NewVariable = new WebNodeGuiButton(61378,'New',35,560,60,40);
        this.NewVariable.align = "left";
        this.NewVariable.delegate = function() { WebNodeUI.MainDoc.AddNewVariable(); };

        this.CurrentDoc = this.MainDoc;
        //this.LeftBarButtons.push(button);
        //this.LeftBarButtons.push();
    }

    Draw()
    {
        this.context.shadowBlur = 2;
        this.context.shadowColor = 'Black';
        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(0, 0, w, h);
        this.context.textAlign = 'right';
        this.DrawGrid();
        this.CurrentDoc.Draw();
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

            case 2:
                var colors = ['MediumOrchid','Purple','black'];
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
        WebNodeUI.context.fillStyle = 'DimGrey';
        WebNodeUI.context.fillRect(0, 50, w/6, h);
               
        WebNodeUI.GraphList.w = (w/6)-10;
        WebNodeUI.GraphList.Draw();
  
        WebNodeUI.FunctionList.w = (w/6)-10;
        WebNodeUI.FunctionList.Draw();
        
        WebNodeUI.VariableList.w = (w/6)-10;
        WebNodeUI.VariableList.Draw();

        WebNodeUI.NewFunction.w = WebNodeUI.FunctionList.w/3;
        WebNodeUI.NewFunction.x = (WebNodeUI.FunctionList.x+WebNodeUI.FunctionList.w)-(WebNodeUI.FunctionList.w/3)-5;
        WebNodeUI.NewFunction.Draw();

        WebNodeUI.NewVariable.w = WebNodeUI.VariableList.w/3;
        WebNodeUI.NewVariable.x = (WebNodeUI.VariableList.x+WebNodeUI.VariableList.w)-(WebNodeUI.VariableList.w/3)-5;
        WebNodeUI.NewVariable.Draw();

        for (let index = 0; index < WebNodeUI.LeftBarButtons.length; index++) {
            var p = WebNodeUI.LeftBarButtons[index];
            p.Draw();
        }

    }
    DrawRightSideBar()
    {
        WebNodeUI.context.fillStyle = 'DimGrey';
        WebNodeUI.context.fillRect(w-(w/6), 50, w/6, h);
    }

    DrawMenuBar()
    {
        WebNodeUI.context.fillStyle = 'DimGrey';
        WebNodeUI.context.fillRect(0, 0, w, 90); 
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
                for(var i=0;i<WebNodeUI.CurrentDoc.Nodes.length;i++){
                    if(WebNodeUI.CurrentDoc.Nodes[i].MouseOver(WebNodeUI.startX-WebNodeUI.ScrollX,WebNodeUI.startY-WebNodeUI.ScrollY))
                    {
                        WebNodeUI.selectedShapeIndex=i;
                        // set the isDragging flag
                        WebNodeUI.isDragging=true;
                        // and return (==stop looking for 
                        //     further shapes under the mouse)
                        return;
                    }
                    if(WebNodeUI.CurrentDoc.Nodes[i].OverPin(WebNodeUI.startX-WebNodeUI.ScrollX,WebNodeUI.startY-WebNodeUI.ScrollY))
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
        if(!WebNodeUI.isDragging && !WebNodeUI.isConnecting && !WebNodeUI.isScrolling){
            if(WebNodeUI.isHoveringUI)
            {
                if(WebNodeUI.hoveringElement!=null)
                {
                    WebNodeUI.hoveringElement.delegate();
                    WebNodeUI.hoveringElement.hovering = false;
                    WebNodeUI.isHoveringUI = false;
                    WebNodeUI.hoveringElement = null;
                    reOffset();
                }
            }
            return;
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        // the drag is over -- clear the isDragging flag
        WebNodeUI.isDragging=false;
        WebNodeUI.isScrolling=false;
        if(WebNodeUI.isConnecting)
        {
            //create the connection if it exists. 
            var node = WebNodeUI.CurrentDoc.Nodes[WebNodeUI.selectedShapeIndex];
            if(node.selectedinputPin>-1)
            {
                if(WebNodeUI.selectedShapeConnectionIndex>-1)
                {
                    var selnode = WebNodeUI.CurrentDoc.Nodes[WebNodeUI.selectedShapeConnectionIndex];
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
                    var selnode = WebNodeUI.CurrentDoc.Nodes[WebNodeUI.selectedShapeConnectionIndex];
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
            if(WebNodeUI.CheckButtonHover(WebNodeUI.mouseX,WebNodeUI.mouseY))
            {
                WebNodeUI.Draw();
            }
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
        var selectedNode=WebNodeUI.CurrentDoc.Nodes[WebNodeUI.selectedShapeIndex];
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
            var selectedNode=WebNodeUI.CurrentDoc.Nodes[WebNodeUI.selectedShapeIndex];
            WebNodeUI.Draw();
            if(selectedNode.selectedinputPin>-1)
            {
                nx=selectedNode.x+selectedNode.inputs[selectedNode.selectedinputPin].x;
                ny=selectedNode.y+selectedNode.inputs[selectedNode.selectedinputPin].y;
                WebNodeUI.context.strokeStyle=colortype(selectedNode.inputs[selectedNode.selectedinputPin].t);
                WebNodeUI.DrawConnection(nx+WebNodeUI.ScrollX,ny+WebNodeUI.ScrollY,nx-50+WebNodeUI.ScrollX,ny+WebNodeUI.ScrollY,WebNodeUI.mouseX,WebNodeUI.mouseY);
                
               
            }
            if(selectedNode.selectedoutputPin>-1)
            {
                nx=selectedNode.x+selectedNode.outputs[selectedNode.selectedoutputPin].x;
                ny=selectedNode.y+selectedNode.outputs[selectedNode.selectedoutputPin].y;
                WebNodeUI.context.strokeStyle=colortype(selectedNode.outputs[selectedNode.selectedoutputPin].t);
                WebNodeUI.DrawConnection(nx+WebNodeUI.ScrollX,ny+WebNodeUI.ScrollY,nx+50+WebNodeUI.ScrollX,ny+WebNodeUI.ScrollY,WebNodeUI.mouseX,WebNodeUI.mouseY);
                
               
            }
            for(var i=0;i<WebNodeUI.CurrentDoc.Nodes.length;i++)
            {
    
                if(WebNodeUI.CurrentDoc.Nodes[i].OverPin(WebNodeUI.startX-WebNodeUI.ScrollX,WebNodeUI.startY-WebNodeUI.ScrollY))
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
        var oldstate = WebNodeUI.isHoveringUI;
        var oldelem = WebNodeUI.hoveringElement;
        WebNodeUI.isHoveringUI=false;
        for (let index = 0; index < WebNodeUI.MenuButtons.length; index++) {
            var p = WebNodeUI.MenuButtons[index];
            
            if(p.MouseOver(mx,my))
            {
                WebNodeUI.isHoveringUI=true;
                WebNodeUI.hoveringElement=p;
            }
        }
        if(WebNodeUI.GraphList.MouseOver(mx,my))
        {
            WebNodeUI.isHoveringUI=true;
            WebNodeUI.hoveringElement=WebNodeUI.GraphList.hoveringElement;            
        }
        if(WebNodeUI.FunctionList.MouseOver(mx,my))
        {
            WebNodeUI.isHoveringUI=true;
            WebNodeUI.hoveringElement=WebNodeUI.FunctionList.hoveringElement;            
        }
        if(WebNodeUI.NewFunction.MouseOver(mx,my))
        {
            WebNodeUI.isHoveringUI=true;
            WebNodeUI.hoveringElement=WebNodeUI.NewFunction;
        }
        if(WebNodeUI.NewVariable.MouseOver(mx,my))
        {
            WebNodeUI.isHoveringUI=true;
            WebNodeUI.hoveringElement=WebNodeUI.NewVariable;
        }
        if(oldstate!=WebNodeUI.isHoveringUI)
        {
            //state changed
            return(true);
        }
        return(false);
    }

    Launch()
    {
        $('#launchModal').modal('show');
        var saveit = JSON.stringify( WebNodeUI.MainDoc);

        $.post("editorfunctions.php",{"postaction" : "compile-document", "doc" : saveit},function(data){
            $.get("Launch/Launch.html", function(data, status){
                $('#launchme').html(data);
                });            
        });

        
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
    PixelFontCanvas.loadFont('BMFont/', 'Webdir.fnt', (data) => { pixelDirFontLoaded = true; WebNodeUI.Draw(); });
    PixelFontCanvas.loadFont('BMFont/', 'Webapp.fnt', (data) => { pixelFontLoaded=true; WebNodeUI.Draw(); });

}

function AddNodeFunction(dir)
{   

    $('#nodesModal').modal('show');
    $.get("https://zorlockstudios.com/NodeWeb/Editor/editorfunctions.php?action=load-nodes&dir="+dir, function(data, status){
        $('#nodescontent').html(data);
    //alert("Data: " + data + "\nStatus: " + status);
    });
}

function CreateNewVariable()
{

    var vname = $('#newvarModal').find('.modal-body input').val();
    var vtype = $("#vartype")[0].selectedIndex;
    var vcon = $("#varcon")[0].selectedIndex;
    var v = 0;
    var c = 61338;
    switch(vcon)
    {
        case 1:
            c = 61346; 
        break;

        case 2:
            c = 61301;
        break;
    }
    switch(vtype)
    {
        case(0):
            v = 1;
        break;
        case(1):
            v = 2;
        break;
        case(2):
            v = 3;
        break;
        case(3):
            v = 5;
        break;
        case(4):
            v = 6;     
        break;
        case(5):
            v = 7;     
        break;
        case(6):
            v = 8;     
        break;                
    }
    var nv = new WebVar(vname,v,null,vcon);
    nv.guid = WebNodeUI.uuidv4();
    WebNodeUI.MainDoc.Variabes.push(nv);
    WebNodeUI.VariableList.AddItem(c,vname,nv,nv.OnClick,colortype(v));
    WebNodeUI.Draw();
}


function SaveMyDocument()
{
    var saveit = JSON.stringify( WebNodeUI.MainDoc);
    WebNodeUI.MainDoc.name = $('#savedocModal').find('.modal-body input').val();
    $.post("editorfunctions.php",{"postaction" : "save-document", "dir" : "Documents/Doc_"+WebNodeUI.MainDoc.name, "doc" : saveit},function(data){
        alert("Data: " + data);
    });
}

function CreateNewFunction()
{
    
    var nf = new WebNodeFunction(WebNodeUI.canvas,WebNodeUI.context,'New Func');
    nf.guid = WebNodeUI.uuidv4();
    WebNodeUI.CurrentDoc = nf;
    var fname = $('#newfuncModal').find('.modal-body input').val();
    nf.name = fname;
    WebNodeUI.FunctionList.AddItem(61167,fname,nf,nf.OnClick);
    WebNodeUI.MainDoc.Functions.push(nf);
    nf.InitFunc();
    WebNodeUI.Draw();
}

$(document).ready(function(){

    $('#newfuncModal').on('show.bs.modal', function () {
        var modal = $(this);
        modal.find('.modal-body input').trigger('focus');
        modal.find('.modal-body input').val('New Func');
        //console.log("Hello world!");
    });
    $('#savedocModal').on('show.bs.modal', function () {
        var modal = $(this);
        modal.find('.modal-body input').trigger('focus');
        modal.find('.modal-body input').val(WebNodeUI.MainDoc.name);
        //console.log("Hello world!");
    });
});