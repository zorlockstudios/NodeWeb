
var vartypes = { INT: 1, FLOAT: 2, STRING: 3, FLOW : 4, VECTOR2 : 5 };
/*
var vartypes = [];
vartypes['INT'] = 0;
vartypes['FLOAT'] = 1;
vartypes['STRING'] = 2;
vartypes['FLOW'] = 3;
vartypes['VECTOR2'] = 4;
*/

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
            return('darkorange');
        default:
            return ('SlateGrey');
    }
    /*
    if(t==0)
    {
            return('dodgerblue'); 
    }else if(t==1)
    {
            return('forestgreen');
    }else if(t==2)
    {
            return('darkviolet');
    }else if(t==3)
    {
            return('ghostwhite');
    }else if(t==4)
    {
            return('darkorange');
    } else {
            return ('SlateGrey');
    }
    */
    
}