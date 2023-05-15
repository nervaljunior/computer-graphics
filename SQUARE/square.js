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
  clear = document.getElementById("clear");
  pontos = document.getElementById("pontos");
  vertices = document.getElementById("vertices");

  delau.addEventListener("click", function(event) {

const delaunay = d3.Delaunay.from(point);

const gl = canvas.getContext("webgl");

const vertexShaderSource = document.getElementById("vertex-shader").text;
const fragmentShaderSource = document.getElementById("fragment-shader").text;
const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const error = gl.getProgramInfoLog(program);
  console.error('Erro ao criar o programa WebGL:', error);
  return;
}

gl.useProgram(program);

gl.uniform4fv(gl.getUniformLocation(program, "uColor"), [0.0, 0.0, 0.0, 1.0]);
gl.lineWidth(1);

const triangles = delaunay.triangles;
const edges = new Set();
for (let i = 0; i < triangles.length; i += 3) {
  edges.add(`${triangles[i]}-${triangles[i + 1]}`);
  edges.add(`${triangles[i + 1]}-${triangles[i + 2]}`);
  edges.add(`${triangles[i + 2]}-${triangles[i]}`);
}

const positions = Array.from(edges.values()).flatMap(edge => {
  const [i, j] = edge.split("-").map(Number);
  return [points[i][0], points[i][1], points[j][0], points[j][1]];
});

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const positionLoc = gl.getAttribLocation(program, "vPosition");
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.LINES, 0, positions.length / 2);


    /*delaunay = d3.Delaunay.from(point);

    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    context.strokeStyle = "black";
    context.beginPath();
    delaunay.render(context);
    context.stroke();*/
    // Criando a triangulação de Delaunay
/*const canvas = document.querySelector("canvas");

const delaunay = d3.Delaunay.from(point);

// Obtendo o contexto WebGL
const gl = canvas.getContext("webgl");

// Compilando os shaders e vinculando o programa WebGL
const vertexShaderSource = document.getElementById("vertex-shader").text;
const fragmentShaderSource = document.getElementById("fragment-shader").text;
const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// Configurando o estilo das arestas
gl.uniform4fv(gl.getUniformLocation(program, "uColor"), [0.0, 0.0, 0.0, 1.0]);
gl.lineWidth(1);

// Obtendo as arestas da triangulação
const triangles = delaunay.triangles;
const edges = new Set();
for (let i = 0; i < triangles.length; i += 3) {
  edges.add(`${triangles[i]}-${triangles[i + 1]}`);
  edges.add(`${triangles[i + 1]}-${triangles[i + 2]}`);
  edges.add(`${triangles[i + 2]}-${triangles[i]}`);
}

// Obtendo os vértices das arestas
const positions = Array.from(edges.values()).flatMap(edge => {
  const [i, j] = edge.split("-").map(Number);
  return [points[i][0], points[i][1], points[j][0], points[j][1]];
});

// Criando buffers e atributos
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
const positionLoc = gl.getAttribLocation(program, "vPosition");
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

// Desenhando as arestas
gl.drawArrays(gl.LINES, 0, positions.length / 2);*/
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
   
  pontos.addEventListener("click", function (event) {
    let tabela_pontos = `
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 8px; text-align: left; background-color: #f2f2f2;">Pontos</th>
            <th style="border: 1px solid black; padding: 8px; text-align: left; background-color: #f2f2f2;">Coordenadas</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    for (let i = 0; i < point.length-2; i++) {
      tabela_pontos += `
        <tr style="border: 1px solid black;">
          <td style="border: 1px solid black; padding: 8px;"> ponto ${i+1}</td>
          <td style="border: 1px solid black; padding: 8px;">{X: ${point[i].x} , Y: ${point[i].y}}</td>
        </tr>
      `;
    }
  
    tabela_pontos += `
        </tbody>
      </table>
    `;
    document.write(tabela_pontos);
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
  //gl.drawArrays(gl.LINE_LOOP, 0,20);
  window.requestAnimFrame(render);
}

