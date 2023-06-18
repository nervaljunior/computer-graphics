const cuboVertices =[

    {x:0.0 ,y:0.0 ,z:0.0},{x:0.0 ,y:1.0 ,z:0.0},{x:1.0 ,y:1.0 ,z:0.0},
    {x:0.0 ,y:0.0 ,z:0.0},{x:1.0 ,y:1.0 ,z:0.0},{x:1.0 ,y:0.0 ,z:0.0},
    
    {x:1.0 ,y:0.0 ,z:0.0},{x:1.0 ,y:1.0 ,z:0.0},{x:1.0 ,y:1.0 ,z:1.0},
    {x:1.0 ,y:0.0 ,z:0.0},{x:1.0 ,y:1.0 ,z:1.0},{x:1.0 ,y:0.0 ,z:1.0},

    {x:1.0 ,y:0.0 ,z:1.0},{x:1.0 ,y:1.0 ,z:1.0},{x:1.0 ,y:1.0 ,z:1.0},
    {x:1.0 ,y:0.0 ,z:1.0},{x:0.0 ,y:1.0 ,z:1.0},{x:1.0 ,y:0.0 ,z:1.0},

    {x:0.0 ,y:0.0 ,z:1.0},{x:0.0 ,y:1.0 ,z:1.0},{x:0.0 ,y:1.0 ,z:0.0},
    {x:0.0 ,y:0.0 ,z:1.0},{x:1.0 ,y:1.0 ,z:0.0},{x:0.0 ,y:0.0 ,z:0.0},


    //top
    {x:0.0 ,y:1.0 ,z:0.0},{x:0.0 ,y:1.0 ,z:1.0},{x:1.0 ,y:1.0 ,z:1.0},
    {x:0.0 ,y:1.0 ,z:0.0},{x:1.0 ,y:1.0 ,z:1.0},{x:1.0 ,y:1.0 ,z:0.0},


    //bottom
    {x:1.0 ,y:0.0 ,z:1.0},{x:0.0 ,y:0.0 ,z:1.0},{x:0.0 ,y:0.0 ,z:0.0},
    {x:1.0 ,y:0.0 ,z:1.0},{x:1.0 ,y:0.0 ,z:0.0},{x:1.0 ,y:0.0 ,z:0.0}
]


let elapsedTime=0;

const canvas =document.querySelector("#canvas");
const context =canvas.getContext('2d');

const WIDTH=1280;
const HEIGHT=720;

const aspectRation= HEIGHT/WIDTH;
const fov =100;

function makeProjectionMatrix(){

    const fovFactor=1.0/Math.tan(fov*0.5/180*Math.PI);

    const projectionMatrix=[
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];

    projectionMatrix[0][0]=aspectRation * fovFactor;
    projectionMatrix[1][1]=fovFactor;
    projectionMatrix[2][2]=1;
    projectionMatrix[2][3]=1;

    return projectionMatrix;

       
}

function multiply_vertex_to_4x4_matrix(vertex,matrix){

    const newVertex ={x:0.0 ,y:0.0 ,z:0.0};

    newVertex.x= (vertex.x * matrix[0][0])+ (vertex.y * matrix[1][0]) + (vertex.z * matrix[2][0])+  matrix[3][0];
    newVertex.y= (vertex.x * matrix[0][1])+ (vertex.y * matrix[1][1]) + (vertex.z * matrix[2][1])+  matrix[3][1];
    newVertex.z= (vertex.x * matrix[0][2])+ (vertex.y * matrix[1][2]) + (vertex.z * matrix[2][2])+  matrix[3][2];

    const w =(vertex.x *matrix[0][3])+(vertex.y*matrix[1][3])+(vertex.z *matrix[2][3])+matrix[3][3];

    if(w!=0){
        newVertex.x /= w;
        newVertex.y /= w;
        newVertex.z /= w;

        return newVertex;
    }
    return vertex;
}

function draw(vertex,vertex2){
    if(!context) return;
    
    context.strokeStyle="blue"

    context.beginPath();
    context.moveTo(WIDTH/2 +vertex.x ,HEIGHT/2-vertex.y);
    context.lineTo(WIDTH/2 +vertex2.x ,HEIGHT/2-vertex2.y);

    context.stroke();
}

function drawTriangulo(vertex1,vertex2,vertex3){
    
    draw(vertex1,vertex2);
    draw(vertex1,vertex3);
    draw(vertex3,vertex2);
}

const matProj=makeProjectionMatrix();

setInterval(()=>{

    if(context) context.clearRect(0,0,WIDTH,HEIGHT);

    const clonedCube= structuredClone(cuboVertices)

    for(let i=0;i<clonedCube.length;i+=3){
        const triangleVerteces =[
            clonedCube[i],
            clonedCube[i+1],
            clonedCube[i+2]
        ];

        triangleVerteces[0].z+=3.0;;
        triangleVerteces[1].z+=3.0;;
        triangleVerteces[2].z+=3.0;;

        const projected=[

            multiply_vertex_to_4x4_matrix(triangleVerteces[0],matProj),
            multiply_vertex_to_4x4_matrix(triangleVerteces[1],matProj),
            multiply_vertex_to_4x4_matrix(triangleVerteces[2],matProj),

        ];

        projected[0].x *=WIDTH/2;
        projected[0].y *=WIDTH/2;
        
        projected[1].x *=WIDTH/2;
        projected[1].y *=WIDTH/2;
        
        projected[2].x *=WIDTH/2;
        projected[2].y *=WIDTH/2;
        
        drawTriangulo(projected[0],projected[1],projected[2])
    }
    elapsedTime+=0.01;
},20);