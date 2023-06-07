// Obtém o elemento mycanvas
var mycanvas = document.getElementById('mycanvas');
var gl = mycanvas.getContext('webgl');

// Define as coordenadas e cores do quadrado
var vertices = [
  -0.5, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0,
  //-1, -1, 0.0,  -0.25, -0.5, 0.0, -0.5, -1, 0.0
  
];

var selectedColors = [
  1.0, 0.5, 0.5, 1.0,
  1.0, 0.5, 0.5, 1.0,
  0.0, 0.0, 1.0, 1.0,
  
];

var defaultColors = [
    0.5, 0.0, 0.0, 1.0,
  0.0, 0.6, 0.0, 1.0,
  1.0, 1.0, 1.0, 1.0,
];

var colors = defaultColors;
var isTriangleSelected = false;
var squareRotation = 0.0; // Rotação inicial do quadrado

// Define os índices dos vértices para formar o quadrado
var indices = [0, 1, 2, 0, 2, 3];

// Cria os buffers para armazenar os dados
var vertexBuffer = gl.createBuffer();
var colorBuffer = gl.createBuffer();
var indexBuffer = gl.createBuffer();

// Vincula os buffers aos respectivos tipos de dados
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Obtém as referências aos atributos e uniformes dos shaders
var vertexShaderSource = `
attribute vec3 aPosition;
attribute vec4 aColor;
uniform vec2 uTranslation;
uniform float uRotation;
varying vec4 vColor;
void main() {
  vec3 translatedPosition = vec3(aPosition.x + uTranslation.x, aPosition.y + uTranslation.y, aPosition.z);
  float cosTheta = cos(uRotation);
  float sinTheta = sin(uRotation);
  mat3 rotationMatrix = mat3(
    cosTheta, -sinTheta, 0.0,
    sinTheta, cosTheta, 0.0,
    0.0, 0.0, 1.0
  );
  vec3 rotatedPosition = rotationMatrix * translatedPosition;
  gl_Position = vec4(rotatedPosition, 1.0);
  vColor = aColor;
}`;

var fragmentShaderSource = `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}`;

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var aPosition = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPosition);

var aColor = gl.getAttribLocation(program, 'aColor');
gl.enableVertexAttribArray(aColor);

var uTranslation = gl.getUniformLocation(program, 'uTranslation');
var uRotation = gl.getUniformLocation(program, 'uRotation');

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

// Configura os manipuladores de eventos para detectar cliques, movimentos do mouse e rolagem do scroll no mycanvas
mycanvas.addEventListener('mousedown', function(event) {
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  x = ((x - rect.left) - mycanvas.width / 2) / (mycanvas.width / 2);
  y = (mycanvas.height / 2 - (y - rect.top)) / (mycanvas.height / 2);

  // Verifica se o clique ocorreu dentro do quadrado
  if (x >= -0.5 && x <= 0.5 && y >= -0.5 && y <= 0.5) {
    isTriangleSelected = true;
    colors = selectedColors;
  } else {
    isTriangleSelected = false;
    colors = defaultColors;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
});

mycanvas.addEventListener('mouseup', function() {
  isTriangleSelected = false;
  colors = defaultColors;

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
});

mycanvas.addEventListener('mousemove', function(event) {
  if (isTriangleSelected) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    x = ((x - rect.left) - mycanvas.width / 2) / (mycanvas.width / 2);
    y = (mycanvas.height / 2 - (y - rect.top)) / (mycanvas.height / 2);

    gl.uniform2f(uTranslation, x, y);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }
});

mycanvas.addEventListener('wheel', function(event) {
  if (isTriangleSelected) {
    // Verifica a direção da rolagem do scroll
    var delta = Math.sign(event.deltaY);

    // Atualiza a rotação do quadrado com base na direção do scroll
    squareRotation += delta * 0.1;

    gl.uniform1f(uRotation, squareRotation);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Impede o comportamento padrão do scroll
    event.preventDefault();
  }
});

// Limpa a tela e desenha o quadrado inicialmente
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
