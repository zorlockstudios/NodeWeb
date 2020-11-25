
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