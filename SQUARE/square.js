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
    const positionLoc = context.getAttribLocation(context.program, "vPosition"); // <-- Use context instead of gl
    context.vertexAttribPointer(positionLoc, 2, context.FLOAT, false, 0, 0);
    context.enableVertexAttribArray(positionLoc);
    const indexBuffer = context.createBuffer();
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), context.STATIC_DRAW);
    context.drawElements(context.LINES, indices.length, context.UNSIGNED_SHORT, 0);
  });
  
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  function getRandomArbitrary(min, max) {
    return parseFloat(Math.random() * (max - min) + min);
  }
  
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

  clear.addEventListener("click", function (event) {
    location.reload();
  });
    
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
    let tabela = `
    <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px; text-align: left; background-color: #f2f2f2;">Coordenada X</th>
          <th style="border: 1px solid black; padding: 8px; text-align: left; background-color: #f2f2f2;">Coordenada Y</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (let temp of hull.values()) {
    tabela += `
        <tr style="border: 1px solid black;">
          <td style="border: 1px solid black; padding: 8px;">${temp.x}</td>
          <td style="border: 1px solid black; padding: 8px;">${temp.y}</td>
        </tr>
    `;
  }
  tabela += `
      </tbody>
    </table>
  `;
  document.write(tabela);
  }
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.point, 0, 20);
  gl.drawArrays(gl.LINE_LOOP, 0,20);
  window.requestAnimFrame(render);
}

