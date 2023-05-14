var canvas;
var gl;

var numero_max_triang = 10;
var maximo_de_vert = 3 * numero_max_triang;
var point = new Array(20);
var length_point;
var index = 0;
var count = 0;
var colors = [
  vec4(0.0, 0.0, 0.0, 1.0),   vec4(1.0, 0.0, 0.0, 1.0),   vec4(1.0, 1.0, 0.0, 1.0), 
  vec4(0.0, 1.0, 0.0, 1.0),   vec4(0.0, 0.0, 1.0, 1.0), 
  vec4(1.0, 0.0, 1.0, 1.0),   vec4(0.0, 1.0, 1.0, 1.0), 
];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  generate = document.getElementById("generate");
  delaunay = document.getElementById("delaunay");
  clear = document.getElementById("clear");
  vertices = document.getElementById("vertices");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  function getRandomArbitrary(min, max) {
    return parseFloat(Math.random() * (max - min) + min);
  }

  delaunay.addEventListener("click", function (event) {
    var data = [];
    for (var i = 0; i < count; i++) {
      data.push([point[i].x, point[i].y]);
    }
    var triangles = d3.Delaunay.from(data).triangles();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
  });
  
  
  canvas.addEventListener("mousedown", function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    var t = vec2(2 * x / canvas.width - 1, 2 * (canvas.height - y) / canvas.height - 1);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));
  
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    t = vec4(colors[index % 7]);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
    index++;
  });
   
  generate.addEventListener("click", function (event) {
    while (count <= 21) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      var t = vec2(
        getRandomArbitrary(-1.0, 1.0),
        getRandomArbitrary(-1.0, 1.0)
      );
      //onsole.log(t[0], t[1]);
      point[count] = new Point(t[0], t[1]);
      length_point = point.length;
      console.log(point[count]);
    
      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      t = vec4(colors[index % 7]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
      index++;
      count++;
    }
  });
  /*delaunay.addEventListener("click", function (event) {
    gl.drawArrays(gl.LINE_LOOP, 0,20);
    
  });*/
  vertices.addEventListener("click", function (event) {
    console.log(convexHull1(point, length_point));
  });
 
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maximo_de_vert, gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maximo_de_vert, gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  render();
  class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }
  
  function orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  
    if (val == 0) return 0; 
    return val > 0 ? 1 : 2; 
  }
  
  function convexHull1(point, n) {
 
    if (n < 3) return;

    let hull = [];
  

    let l = 0;
    for (let i = 1; i < n; i++) if (point[i].x < point[l].x) l = i;
  
    let p = l,
      q;
    do {

      hull.push(point[p]);

      q = (p + 1) % n;
  
      for (let i = 0; i < n; i++) {

        if (orientation(point[p], point[i], point[q]) == 2) q = i;
      }
  
      p = q;
    } while (p != l); 

    for (let temp of hull.values())
      document.write("(" + temp.x + ", " + temp.y + ")<br>");
  }
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.point, 0, 20);
  //gl.drawArrays(gl.LINE_LOOP, 0,20);
  window.requestAnimFrame(render);
}

