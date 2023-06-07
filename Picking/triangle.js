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
    if (dragging) {
      var x = ev.clientX;
      var y = ev.clientY;
      var rect = ev.target.getBoundingClientRect();
      x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
      y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  
      gl.uniform2f(uTranslation, x, y);
  };
}
}

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

