
var vartypes = { INT: 1, FLOAT: 2, STRING: 3, FLOW : 4, VECTOR2 : 5 };


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

    
}