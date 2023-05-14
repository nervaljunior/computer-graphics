var canvas;
var gl;

var maxNumTriangles = 10;
var maxNumVertices = 3 * maxNumTriangles;
var index = 0;
var count = 0;
var colors = [
  vec4(0.0, 0.0, 0.0, 1.0), // black
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // magenta
  vec4(0.0, 1.0, 1.0, 1.0), // cyan
];
var points = new Array(20);
var pointsLength;

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  myButton = document.getElementById("random_points");
  convexHullFunction = document.getElementById("convex_hull");
 
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  function getRandomArbitrary(min, max) {
    return parseFloat(Math.random() * (max - min) + min);
  }
  //canvas.addEventListener("mousedown", function(){
  /*
  canvas.addEventListener("mousedown", function (event) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var t = vec2(getRandomArbitrary(-1.0, 1.0), getRandomArbitrary(-1.0, 1.0));
    gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    t = vec4(colors[index % 7]);
    gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
    index++;
  });
  */
  myButton.addEventListener("click", function (event) {
    while (count <= 21) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      var t = vec2(
        getRandomArbitrary(-1.0, 1.0),
        getRandomArbitrary(-1.0, 1.0)
      );
      //onsole.log(t[0], t[1]);
      points[count] = new Point(t[0], t[1]);
      pointsLength = points.length;
      console.log(points[count]);
    
      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      t = vec4(colors[index % 7]);
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
      index++;
      count++;
    }
  });
  convexHullFunction.addEventListener("click", function (event) {
    console.log(convexHull1(points, pointsLength));

  });
 
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

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
  
  // To find orientation of ordered triplet (p, q, r).
  // The function returns following values
  // 0 --> p, q and r are collinear
  // 1 --> Clockwise
  // 2 --> Counterclockwise
  function orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  
    if (val == 0) return 0; // collinear
    return val > 0 ? 1 : 2; // clock or counterclock wise
  }
  
  // Prints convex hull of a set of n points.
  function convexHull1(points, n) {
    // There must be at least 3 points
    if (n < 3) return;
  
    // Initialize Result
    let hull = [];
  
    // Find the leftmost point
    let l = 0;
    for (let i = 1; i < n; i++) if (points[i].x < points[l].x) l = i;
  
    // Start from leftmost point, keep moving
    // counterclockwise until reach the start point
    // again. This loop runs O(h) times where h is
    // number of points in result or output.
    let p = l,
      q;
    do {
      // Add current point to result
      hull.push(points[p]);
  
      // Search for a point 'q' such that
      // orientation(p, q, x) is counterclockwise
      // for all points 'x'. The idea is to keep
      // track of last visited most counterclock-
      // wise point in q. If any point 'i' is more
      // counterclock-wise than q, then update q.
      q = (p + 1) % n;
  
      for (let i = 0; i < n; i++) {
        // If i is more counterclockwise than
        // current q, then update q
        if (orientation(points[p], points[i], points[q]) == 2) q = i;
      }
  
      // Now q is the most counterclockwise with
      // respect to p. Set p as q for next iteration,
      // so that q is added to result 'hull'
      p = q;
    } while (p != l); // While we don't come to first
    // point
  
    // Print Result
    for (let temp of hull.values())
      document.write("(" + temp.x + ", " + temp.y + ")<br>");
  }
  
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 20);
 //gl.drawArrays(gl.LINE_LOOP, 0,20);
  window.requestAnimFrame(render);
}

