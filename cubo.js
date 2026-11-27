var contexto;
var numVertices = 36; // 6 faces * 2 triângulos por face * 3 vértices = 36
var angulo = 0.0;
var uProjectionLoc;

window.onload = function init() {

    const canvas = document.querySelector("#gl-canvas");
    contexto = canvas.getContext("webgl");

    if (!contexto) {
        alert("Não foi possível inicializar o WebGL neste navegador.");
        return;
    }

    // Configurações do Canvas e ativação do Depth Buffer (Sustenta a tridimensionalidade)
    contexto.viewport(0, 0, canvas.width, canvas.height);
    contexto.clearColor(0.1, 0.1, 0.1, 1.0); // Fundo escuro para destacar o cubo
    contexto.enable(contexto.DEPTH_TEST);

    // 1. Definição dos 8 cantos (vértices base) do cubo no espaço local
    var pontosCubo = [
        vec3(-0.5, -0.5,  0.5), // 0: Canto Inferior Frontal Esquerdo
        vec3(-0.5,  0.5,  0.5), // 1: Canto Superior Frontal Esquerdo
        vec3( 0.5,  0.5,  0.5), // 2: Canto Superior Frontal Direito
        vec3( 0.5, -0.5,  0.5), // 3: Canto Inferior Frontal Direito
        vec3(-0.5, -0.5, -0.5), // 4: Canto Inferior Traseiro Esquerdo
        vec3(-0.5,  0.5, -0.5), // 5: Canto Superior Traseiro Esquerdo
        vec3( 0.5,  0.5, -0.5), // 6: Canto Superior Traseiro Direito
        vec3( 0.5, -0.5, -0.5)  // 7: Canto Inferior Traseiro Direito
    ];

    // 2. Cores sólidas para cada uma das 6 faces
    var coresFaces = [
        vec4(1.0, 0.0, 0.0, 1.0), // Frente: Vermelho
        vec4(0.0, 1.0, 0.0, 1.0), // Trás: Verde
        vec4(0.0, 0.0, 1.0, 1.0), // Cima: Azul
        vec4(1.0, 1.0, 0.0, 1.0), // Baixo: Amarelo
        vec4(1.0, 0.0, 1.0, 1.0), // Direita: Magenta
        vec4(0.0, 1.0, 1.0, 1.0)  // Esquerda: Ciano
    ];

    var vertices = [];
    var cores = [];

    // Função auxiliar para montar um quadrado (2 triângulos) a partir de 4 índices
    function montaFace(a, b, c, d, cor) {
        var indices = [a, b, c, a, c, d];
        for (var i = 0; i < indices.length; ++i) {
            vertices.push(pontosCubo[indices[i]]);
            cores.push(cor);
        }
    }

    // Monta as 6 faces do cubo chamando a função com os índices dos cantos
    montaFace(1, 0, 3, 2, coresFaces[0]); // Face Frontal
    montaFace(2, 3, 7, 6, coresFaces[4]); // Face Direita
    montaFace(3, 0, 4, 7, coresFaces[3]); // Face Inferior
    montaFace(6, 5, 1, 2, coresFaces[2]); // Face Superior
    montaFace(4, 5, 6, 7, coresFaces[1]); // Face Traseira
    montaFace(5, 4, 0, 1, coresFaces[5]); // Face Esquerda

    // Compila os Shaders
    var programa = initShaders(contexto, "vertex-shader", "fragment-shader");
    contexto.useProgram(programa);

    uProjectionLoc = contexto.getUniformLocation(programa, "uProjection");

    // --- BUFFER DE POSIÇÕES (VÉRTICES) ---
    var bufferVertice = contexto.createBuffer();
    contexto.bindBuffer(contexto.ARRAY_BUFFER, bufferVertice);
    contexto.bufferData(contexto.ARRAY_BUFFER, flatten(vertices), contexto.STATIC_DRAW);

    var vPosition = contexto.getAttribLocation(programa, "vPosition");
    contexto.enableVertexAttribArray(vPosition);
    contexto.vertexAttribPointer(vPosition, 3, contexto.FLOAT, false, 0, 0);

    // --- BUFFER DE CORES ---
    var bufferCores = contexto.createBuffer();
    contexto.bindBuffer(contexto.ARRAY_BUFFER, bufferCores);
    contexto.bufferData(contexto.ARRAY_BUFFER, flatten(cores), contexto.STATIC_DRAW);

    var vColor = contexto.getAttribLocation(programa, "vColor");
    contexto.enableVertexAttribArray(vColor);
    contexto.vertexAttribPointer(vColor, 4, contexto.FLOAT, false, 0, 0);

    // Inicia a animação
    render();
};

function render() {
    // Limpa a tela e o buffer de profundidade
    contexto.clear(contexto.COLOR_BUFFER_BIT | contexto.DEPTH_BUFFER_BIT);

    // Incrementa a rotação
    angulo += 1.0;

    // Matriz Ortográfica cobrindo o intervalo de -2.0 a +2.0 em todos os eixos
    var projMatrix = ortho(-2.0, 2.0, -2.0, 2.0, -2.0, 2.0);

    // Rotaciona o cubo simultaneamente nos eixos X, Y e Z
    var rx = rotate(angulo, [1, 0, 0]);
    var ry = rotate(angulo * 0.7, [0, 1, 0]);
    var rz = rotate(angulo * 0.3, [0, 0, 1]);

    var modelView = mult(rz, mult(ry, rx));
    var matrizFinal = mult(projMatrix, modelView);

    // Envia a matriz para o shader
    contexto.uniformMatrix4fv(uProjectionLoc, false, flatten(matrizFinal));

    // Desenha as 6 faces usando os 36 vértices agregados
    contexto.drawArrays(contexto.TRIANGLES, 0, numVertices);

    // Loop contínuo de animação
    requestAnimationFrame(render);
}