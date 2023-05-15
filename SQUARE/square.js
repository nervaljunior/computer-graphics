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

  var generate = document.getElementById("generate");
  var delau = document.getElementById("delaunay");
  var clear = document.getElementById("clear");
  var pontos = document.getElementById("pontos");
  var vertices = document.getElementById("vertices");

  delau.addEventListener("click", function(event) {
    // Criando a triangulação de Delaunay
    const delaunay = d3.Delaunay.from(point);

    // Obtendo o contexto WebGL
    const gl = canvas.getContext("webgl");

    // Compilando os shaders e vinculando o programa WebGL
    const vertexShaderSource = document.getElementById("vertex-shader").text;
    const fragmentShaderSource = document.getElementById("fragment-shader").text;
    const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);

    // Verificando se o programa foi criado corretamente
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      console.error('Erro ao criar o programa WebGL:', error);
      return;
    }

    gl.useProgram(program);

    // Configurando o

// Configurando o atributo de posição dos vértices
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(delaunay.points.flat()), gl.STATIC_DRAW);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Configurando o atributo de cor dos vértices
const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(delaunay.points.length * 3), gl.STATIC_DRAW);
gl.enableVertexAttribArray(colorAttributeLocation);
gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

// Renderizando os triângulos
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, delaunay.points.length / 2);
});

clear.addEventListener("click", function(event) {
point.length = 0;
index = 0;
count = 0;
gl.clear(gl.COLOR_BUFFER_BIT);
});

pontos.addEventListener("input", function(event) {
numero_max_triang = parseInt(event.target.value);
maximo_de_vert = 3 * numero_max_triang;
});

vertices.addEventListener("input", function(event) {
const value = parseInt(event.target.value);
if (value < length_point) {
  point.length = value * 2;
  length_point = value;
  count = Math.floor(value / 3);
  index = count;
}
});

canvas.addEventListener("click", function(event) {
const rect = canvas.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;

point[index++] = (2 * x - canvas.width) / canvas.width;
point[index++] = (canvas.height - 2 * y) / canvas.height;

if (index >= maximo_de_vert) {
  count++;
  index = count * 3;
}
});

generate.addEventListener("click", function(event) {
gl = canvas.getContext("webgl");
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(1.0, 1.0, 1.0, 1.0);
length_point = numero_max_triang * 3;
});
};
