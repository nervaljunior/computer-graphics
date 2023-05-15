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
]

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  
  generate = document.getElementById("generate");
  delau = document.getElementById("delaunay");
  Voronoi = document.getElementById("Voronoi");
  clear = document.getElementById("clear");
  vertices = document.getElementById("vertices");

  delau.addEventListener("click", function(event) {
    const points = point.slice(0, length_point);
    const delaunay = d3.Delaunay.from(points);
    const context = canvas.getContext("webgl");
    context.clearColor(0.5, 0.5, 0.5, 1.0);
    context.clear(context.COLOR_BUFFER_BIT);
    const triangles = delaunay.triangleArray();
    const edges = new Set();
    for (let i = 0; i < triangles.length; i += 3) {
      edges.add(`${triangles[i]}-${triangles[i+1]}`);
      edges.add(`${triangles[i+1]}-${triangles[i+2]}`);
      edges.add(`${triangles[i+2]}-${triangles[i]}`);
    }
    const positions = points.flatMap(p => [p[0], p[1]]);
    const indices = Array.from(edges.values()).flatMap(edge => {
      const [i, j] = edge.split("-").map(Number);
      return [i, j];
    });
    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(positions), context.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "vPosition");
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);
    context.enableVertexAttribArray(positionLoc);
    const indexBuffer = context.createBuffer();
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), context.STATIC_DRAW);
    context.drawElements(context.LINES, indices.length, context.UNSIGNED_SHORT, 0);
  });
}