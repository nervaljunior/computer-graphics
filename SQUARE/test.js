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

var triangles = [];

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  generate = document.getElementById("generate");
  delaunay = document.getElementById("delaunay");
  clear = document.getElementById("clear");
  pontos = document.getElementById("pontos");
  vertices = document.getElementById("vertices");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  function getRandomArbitrary(min, max) {
    return parseFloat(Math.random() * (max - min) + min);
  }

  delaunay.addEventListener("click", function(event) {
    // Verifique se há pontos suficientes para formar um triângulo
    if (point.length < 3) {
      alert("Você precisa gerar pelo menos 3 pontos para criar um triângulo de Delaunay.");
      return;
    }
    
    // Limpe a lista de triângulos
    triangles = delaunayTriangulation(point);
    
    // Renderize os triângulos
    render();
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
    
    // Limpe a lista de triângulos
    triangles = [];
  });

  function delaunayTriangulation(p) {
  const triangles = [];

  // Encontre o ponto extremo (máximo) em cada dimensão
  const maxX = Math.max(...p.map(ponto => ponto[0]));
  const maxY = Math.max(...p.map(ponto => ponto[1]));

  // Crie um triângulo supertriângulo que contém todos os pontos
  const superTriangle = [
    [0, 2 * maxY],
    [2 * maxX, 2 * maxY],
    [maxX, 0]
  ];

  triangles.push(superTriangle);

  // Adicione cada ponto um a um à triangulação
  for (const ponto of p) {
    const edges = [];

    // Verifique se o ponto está dentro do circuncírculo de cada triângulo existente
    for (let i = triangles.length - 1; i >= 0; i--) {
      const triangle = triangles[i];
      const [p1, p2, p3] = triangle;

      if (ispontoInCircumcircle(ponto, p1, p2, p3)) {
        // Os três pontos do triângulo formam uma aresta inválida
        edges.push([p1, p2]);
        edges.push([p2, p3]);
        edges.push([p3, p1]);

        // Remova o triângulo inválido da lista
        triangles.splice(i, 1);
      }
    }

    // Remova as arestas duplicadas
    const uniqueEdges = getUniqueEdges(edges);

    // Crie novos triângulos conectados às arestas válidas
    for (const [p1, p2] of uniqueEdges) {
      triangles.push([p1, p2, ponto]);
    }
  }

  // Remova os triângulos que contêm vértices do supertriângulo
  const delaunayTriangles = triangles.filter(triangle => {
    for (const vertex of triangle) {
      if (vertex === superTriangle[0] || vertex === superTriangle[1] || vertex === superTriangle[2]) {
        return false;
      }
    }
    return true;
  });

  return delaunayTriangles; // Adicionando a linha corrigida
}

  
  
function getUniqueEdges(edges) {
  const uniqueEdges = [];
  const edgeSet = new Set();

  for (const edge of edges) {
    const [p1, p2] = edge;
    const key = `${p1.toString()}-${p2.toString()}`;

    if (!edgeSet.has(key)) {
      uniqueEdges.push(edge);
      edgeSet.add(key);
    }
  }

  return uniqueEdges;
}
  
function ispontoInCircumcircle(p, p1, p2, p3) {
  const a = p1[0] - p2[0];
  const b = p1[1] - p2[1];
  const c = p1[0] - p3[0];
  const d = p1[1] - p3[1];
  const e = (Math.pow(p1[0], 2) - Math.pow(p2[0], 2)) + (Math.pow(p1[1], 2) - Math.pow(p2[1], 2));
  const f = (Math.pow(p1[0], 2) - Math.pow(p3[0], 2)) + (Math.pow(p1[1], 2) - Math.pow(p3[1], 2));
  const g = 2 * ((p1[0] - p3[0]) * (p2[1] - p1[1]) - (p1[0] - p2[0]) * (p3[1] - p1[1]));

  if (g === 0) {
    // Os pontos são colineares, o circuncírculo não existe
    return false;
  }

  const centerX = (e * (p2[1] - p3[1]) - f * (p1[1] - p2[1])) / g;
  const centerY = (f * (p1[0] - p2[0]) - e * (p1[0] - p3[0])) / g;

  const radius = Math.sqrt(Math.pow(p1[0] - centerX, 2) + Math.pow(p1[1] - centerY, 2));
  const distance = Math.sqrt(Math.pow(p[0] - centerX, 2) + Math.pow(p[1] - centerY, 2));

  return distance <= radius;
}


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
  // Resto do código...


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Renderize os pontos
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    gl.drawArrays(gl.POINTS, 0, index);
    
    // Renderize os triângulos
    if (triangles.length > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);
      gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);
    
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      var colors = [];
      for (var i = 0; i < triangles.length; i++) {
        colors.push(vec4(1.0, 0.0, 0.0, 1.0));
      }
      gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
      gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vColor);
    
      gl.drawArrays(gl.TRIANGLES, 0, triangles.length);
    }
    
    requestAnimFrame(render);
  }
  