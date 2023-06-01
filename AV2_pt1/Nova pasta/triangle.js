function initEventHandlers(canvas, currentAngle, gl, pickedPart) {
  var dragging = false;
  var lastX = -1,
    lastY = -1;
  canvas.onmousedown = function (ev) {
    var x = ev.clientX,
      y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
      var x_in_canvas = x - rect.left,
        y_in_canvas = rect.bottom - y;
      var part = checkPart(gl, x_in_canvas, y_in_canvas, pickedPart);
      gl.uniform1i(pickedPart, part);
      draw(gl);
    }
  };
  canvas.onmouseup = function (ev) {
    dragging = false;
  };
  canvas.onmousemove = function (ev) {
    var x = ev.clientX,
      y = ev.clientY;
    if (dragging) {
      var factor = 100 / canvas.height;
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    (lastX = x), (lastY = y);
  };
}


/*
function checkVertex(x, y) {
  // Lógica para verificar se o clique ocorreu em um vértice
  // Retorne true se o clique for em um vértice e false caso contrário
  

}
  canvas.onmousedown = function (ev) {
    var x = ev.clientX,
      y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
      var x_in_canvas = x - rect.left,
        y_in_canvas = rect.bottom - y;
      var part = checkPart(gl, x_in_canvas, y_in_canvas, pickedPart);
      gl.uniform1i(pickedPart, part);  
      if (checkVertex(x, y)) {
        // Chamar a função quando o clique for em um vértice
        minhaFuncaoQueNaoSeiImplementar();
      }
  
      draw(gl);
    }
};
*/


window.onload = function WebGLStart() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");
  initShaders(gl, "vs", "fs");
  var vertices = new Float32Array([
    0.0, 0.5, 0.0, -0.5, 0.0, 0.0, 0.5, 0.0, 0.0,
    -1, 0.5, 0.0,  -0.75, 1, 0.0, -0.5, 0.5, 0.0
  ]);
  initArrayBuffer(gl, "p", vertices, 3);
  var parts = new Float32Array([1.0, 1.0, 1.0, 2.0, 2.0, 2.0]);
  initArrayBuffer(gl, "part", parts, 1);
  gl.clearColor(0.75, 0.75, 0.75, 1.0);
  var pickedPart = gl.getUniformLocation(gl.program, "pickedPart");
  gl.uniform1i(pickedPart, -1);
  var u_modelMatrix = gl.getUniformLocation(gl.program, "u_modelMatrix");
  var modelMatrix = new Matrix4();
  var currentAngle = [0.0, 0.0]; // ([x-axis, y-axis] degrees)

  initEventHandlers(canvas, currentAngle, gl, pickedPart);

  var tick = function () {
    modelMatrix.setIdentity();
    modelMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); //x-axis
    modelMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); //y-axis
    gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.entries);
    draw(gl);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}
function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
function checkPart(gl, x, y, pickedPart) {
  var pixels = new Uint8Array(4);
  gl.uniform1i(pickedPart, 0);
  draw(gl);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels[3];
}
