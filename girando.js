var buffervertice;
var contexto;

// Variáveis globais para controle da animação e dos locais dos uniformes
var angulo = 0.0;
var uProjectionLoc;
var numVertices = 0;

window.onload = function init() {

    const conva = document.querySelector("#gl-canvas");
    contexto = conva.getContext("webgl");

    if(!contexto){
        alert("Não foi possível inicializar o WebGL neste navegador.");
        return;
    }

    contexto.clearColor(0.7, 0.6, 0.9, 0.7);

    // Vértices do quadrado (Centro em X = 1.5, Y = 1.5)
    var vertices = [
        vec3(1.0, 1.0, 0.0),
        vec3(2.0, 1.0, 0.0),
        vec3(2.0, 2.0, 0.0),
        vec3(1.0, 2.0, 0.0)
    ];

    numVertices = vertices.length;

    var cores = [
        vec4(0.8, 0.0, 0.0, 1.0), // Vermelho
        vec4(0.0, 0.8, 0.0, 1.0), // Verde
        vec4(0.0, 0.0, 0.8, 1.0), // Azul
        vec4(0.8, 0.8, 0.0, 1.0)  // Amarelo
    ];

    var programa = initShaders(contexto, "vertex-shader", "fragment-shader");
    contexto.useProgram(programa);

    // Captura a localização da matriz no shader
    uProjectionLoc = contexto.getUniformLocation(programa, "uProjection");

    // --- BUFFER DE POSIÇÕES ---
    buffervertice = contexto.createBuffer();
    contexto.bindBuffer(contexto.ARRAY_BUFFER, buffervertice);
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

    // Inicia o loop continuo de renderização
    render();
};

function render() {
    // 1. Limpa o buffer de cor da tela
    contexto.clear(contexto.COLOR_BUFFER_BIT);

    // 2. Incrementa o ângulo a cada quadro (ajuste +1.0 para alterar a velocidade)
    angulo += 1.0;

    // 3. Matriz de Projeção
    var projMatrix = ortho(0.5, 2.5, 0.5, 2.5, -1.0, 1.0);

    // 4. Sequência para rotação no centro do próprio objeto (Centro = 1.5, 1.5):
    var T1 = translate(-1.5, -1.5, 0.0); // Leva o centro para a origem (0, 0)
    console.log("T1:", T1);
    var Rx  = rotate(angulo, [1, 0, 0]);  // Executa a rotação no eixo X
    console.log("Rotação no eixo x:", Rx);
    var Ry  = rotate(angulo, [0, 1, 0]);  // Executa a rotação no eixo Y
    console.log("Rotação no eixo y:", Ry);
    var Rz  = rotate(angulo, [0, 0, 1]);  // Executa a rotação no eixo Z
    console.log("Rotação no eixo z:", Rz);
    var T2 = translate(1.5, 1.5, 0.0);   // Retorna o centro para a posição original (1.5, 1.5)

    R = rotate(angulo, [1, 1, 1]);   // Combina as rotações em uma única matriz
    
    // Multiplicação na ordem: Projeção * T2 * R * T1
    var modelView = mult(T2, mult(R, T1));
    //var modelView = mult(R, T1);
    var matrizFinal = mult(projMatrix, modelView);

    // 5. Envia a matriz atualizada para a GPU
    contexto.uniformMatrix4fv(uProjectionLoc, false, flatten(matrizFinal));

    // 6. Desenha os vértices
    contexto.drawArrays(contexto.TRIANGLE_FAN, 0, numVertices);

    // 7. Solicita ao navegador a renderização do próximo frame de animação
    requestAnimationFrame(render);
}