const { GLBufferAttribute } = require("three");

var vertexShadeText=['precision mediump float.',]

var InitDemo = function(){
    console.log('this is working');

    var canvas =document.getElementById('game-surface');
    var gl= canvas.getContext('webgl');

    if(!gl){
        console.log('WebGL not supported,falling back on experimental');
        gl=canvas.getContext('experimental-webgl');
    }
    if(!gl){
        alert('your browser does not support WebGL');
    }
    //canvas.width =window.innerWidth;
    //canvas.Height =window.innerHeight;
    //gl.viewport(0,0,window.innerWidth,window.innerHeight);
    gl.clearColor(0.75,0.85,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

//function vertexShade(vertPosition,vertColor){
  //  return{
    //    fragColor:vertColor,
      //  gl_Position:[vertPosition.x,vertPosition.y,0.0,1.0]
//    }
//}