var canvas; /*elemento do cnavas do html */
var gl; // contexto webgl
var decider = true;  // controla matriz de projeção
var numTimesToSubdivide = 3; // subdivisões para criar o poliedro

var index = 0;

// armazena vertices
var pointsArray = [];
var normalsArray = [];

var near = -1; // -1 - 1 - 2
var far = 1; //1
//ortho
var nearO = -10; // -1 - 1 - 2
var farO = 10; //1
var radius = 1.5; // raio da camera
var theta = 0.0; // angulo theta da camera
var phi = 0.0; //angulo phi da camera
var dr = (5.0 * Math.PI) / 180.0; //variação deangulo para os bot~es que controlam a camera

var fovy = 140; // campo de visão vertical da projeção
var aspect = 1.0; //proporção de aspecto da janela

// a seguir os limites de projeção ortografica
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

//vertices do tetraedro
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);


var lightPosition = vec4(1.0, 1.0, 1.0, 0.0); //luz 1
var lightPosition2 = vec4(-1.0, -1.0, -1.0, 0.0); //luz 2
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0); //luz do ambiente
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0); // luz difusa
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0); // luz especular

//configurações dos materiais a seguir
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

//localiações no shader e matriz de transformções
var ctm; //matriz de transformação atual
var ambientColor, diffuseColor, specularColor; //matriz de viasualização e projeção

var modelViewMatrix, projectionMatrix, projectionMatrix2;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye; // Posição da câmera.

var at = vec3(0.0, 0.0, 0.0); // Ponto para onde a câmera está olhando.
var up = vec3(0.0, 1.0, 0.0); // Vetor que define a direção "para cima" na cena.

// s seguir a função que cria um triangulo a partir dos vertices
function triangle(a, b, c) {
  //calculo da normal até o triangulo
  var t1 = subtract(b, a);
  var t2 = subtract(c, a);
  var normal = normalize(cross(t2, t1));
  normal = vec4(normal);

  normalsArray.push(normal);
  normalsArray.push(normal);
  normalsArray.push(normal);

  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);

  index += 3;
}

// Função recursiva para subdividir um triângulo.
function divideTriangle(a, b, c, count) {
  if (count > 0) {
    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
  } else {
    triangle(a, b, c);
  }
}

// Função para criar um tetraedro a partir de um conjunto de vértices.
function tetrahedron(a, b, c, d, n) {
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

// Função chamada quando a página é carregada.
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // Configuração do viewport e da cor de fundo.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  // Carregamento e inicialização dos shaders
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Cálculo dos produtos de iluminação.
  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  //chama a função de criação do tetraedro
  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

  // Criação e configuração dos buffers de vértices e normais.
  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Obtenção das localizações das matrizes no shader
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

  // Configuração dos botões e sliders para interação com a cena.
  document.getElementById("Button0").onclick = function () {
    radius *= 2.0;
  };
  document.getElementById("Button1").onclick = function () {
    radius *= 0.5;
  };
  document.getElementById("Button2").onclick = function () {
    theta += dr;
  };
  document.getElementById("Button3").onclick = function () {
    theta -= dr;
  };
  document.getElementById("Button4").onclick = function () {
    phi += dr;
  };
  document.getElementById("Button5").onclick = function () {
    phi -= dr;
  };

  document.getElementById("Button6").onclick = function () {
    numTimesToSubdivide++;
    index = 0;
    pointsArray = [];
    normalsArray = [];
    init();
  };
  document.getElementById("Button7").onclick = function () {
    if (numTimesToSubdivide) numTimesToSubdivide--;
    index = 0;
    pointsArray = [];
    normalsArray = [];
    init();
  };

  document.getElementById("Button8").onclick = function () {
    lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    init();
  };
  document.getElementById("Button9").onclick = function () {
    lightAmbient = vec4(0.0, 0.0, 0.0, 0.0);
    init();
  };

  document.getElementById("Button10").onclick = function () {
    lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    init();
  };
  document.getElementById("Button11").onclick = function () {
    lightDiffuse = vec4(0, 0, 0, 0);
    init();
  };
  document.getElementById("Button12").onclick = function () {
    lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    init();
  };
  document.getElementById("Button13").onclick = function () {
    lightSpecular = vec4(0, 0, 0, 0);
    init();
  };
  document.getElementById("sliderTheta").onchange = function (event) {
    theta = (event.target.value * Math.PI) / 180.0;
  };
  document.getElementById("sliderPhi").onchange = function (event) {
    phi = (event.target.value * Math.PI) / 180.0;
  };

  document.getElementById("Button14").onclick = function () {
    far += 0.1;
    init();
  };
  document.getElementById("Button15").onclick = function () {
    far -= 0.1;
    init();
  };
  document.getElementById("Button16").onclick = function () {
    near += 1.0;
    init();
  };
  document.getElementById("Button17").onclick = function () {
    near -= 1.0;
    init();
  };
  document.getElementById("Button18").onclick = function () {
    decider = true;
    init();
  };
  document.getElementById("Button19").onclick = function () {
    decider = false;
    init();
  };
  document.getElementById("fovSlider").onchange = function (event) {
    fovy = event.target.value;
  };

  // Configuração das variáveis uniformes no shader.
  gl.uniform4fv(
    gl.getUniformLocation(program, "ambientProduct"),
    flatten(ambientProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "diffuseProduct"),
    flatten(diffuseProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "specularProduct"),
    flatten(specularProduct)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform4fv(
    gl.getUniformLocation(program, "lightPosition"),
    flatten(lightPosition)
  );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

  //renderização da cena
  render();
};

// função de renderização 
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //calculo da posição de onde ta a camera
  eye = vec3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );

  //calculo das matrizes de visualização
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);
  projectionMatrix2 = ortho(left, right, bottom, ytop, nearO, farO);
  normalMatrix = [
    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2]),
  ];

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  decider === true
    ? gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
    : gl.uniformMatrix4fv(
        projectionMatrixLoc,
        false,
        flatten(projectionMatrix2)
      );

  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

  for (var i = 0; i < index; i += 3) gl.drawArrays(gl.TRIANGLES, i, 3);

  window.requestAnimFrame(render);
}
