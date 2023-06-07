function initShaders(gl,vs,fs){
    vsScript = (vs.indexOf("main")>0 && vs.indexOf("(")>0)?
       vs:document.getElementById(vs).innerHTML;
    fsScript = (fs.indexOf("main")>0 && fs.indexOf("(")>0)?
       fs:document.getElementById(fs).innerHTML;
    vsObj = gl.createShader(gl.VERTEX_SHADER);
    fsObj = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vsObj,vsScript);
    gl.shaderSource(fsObj,fsScript);
    gl.compileShader(vsObj);
    gl.compileShader(fsObj);
    if (!gl.getShaderParameter(vsObj,gl.COMPILE_STATUS)){
       alert("Can't compile the vertex shader.");
    }
    if (!gl.getShaderParameter(fsObj,gl.COMPILE_STATUS)){
       alert("Can't compile the fragment shader.");
       return;
    }
    var p = gl.createProgram();
    gl.attachShader(p,vsObj);
    gl.attachShader(p,fsObj);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)){
       alert("Can't link the shaders-attached program.");
       return;
    }
    gl.useProgram(p);
    gl.program=p;
    return p;
 }
 
 function Matrix4(s){
    var i;
    this.entries = new Array();
    if (s && (typeof s)==='object' && s.length && s.length==16){
       for (i=0; i<16; i++) this.entries.push(s[i]);
    } else {
       this.entries=[1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1];
    }
 }
 
 Matrix4.prototype.setIdentity = function(){
    var e = this.entries;
    e[0] = 1; e[4] = 0; e[8]  = 0; e[12] = 0;
    e[1] = 0; e[5] = 1; e[9]  = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
    return this;
 }
 
 Matrix4.prototype.set = function(src) {
   var i, s, d;
   s = src.entries;
   d = this.entries;
   if (s === d) return;
   for (i = 0; i < 16; ++i) d[i] = s[i];
   return this;
 };
 
 Matrix4.prototype.multiply_matrix = function(other){
   var i, e, a, b, ai0, ai1, ai2, ai3;
   e = this.entries;
   a = this.entries;
   b = other;
   for (i = 0; i < 4; i++) {
     ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
     e[i]    = ai0*b[0]  + ai1*b[1]  + ai2*b[2]  + ai3*b[3];
     e[i+4]  = ai0*b[4]  + ai1*b[5]  + ai2*b[6]  + ai3*b[7];
     e[i+8]  = ai0*b[8]  + ai1*b[9]  + ai2*b[10] + ai3*b[11];
     e[i+12] = ai0*b[12] + ai1*b[13] + ai2*b[14] + ai3*b[15];
   }
   return this;
 }
 
 Matrix4.prototype.translate = function(x,y,z){
    //this.multiply_matrix([1,0,0,0,  0,1,0,0,  0,0,1,0,  x,y,z,1]);
   var e = this.entries;
   e[12] += e[0] * x + e[4] * y + e[8]  * z;
   e[13] += e[1] * x + e[5] * y + e[9]  * z;
   e[14] += e[2] * x + e[6] * y + e[10] * z;
   e[15] += e[3] * x + e[7] * y + e[11] * z;
 
   return this;
 }
 
 Matrix4.prototype.scale = function(x,y,z){
    this.multiply_matrix([x,0,0,0,  0,y,0,0,  0,0,z,0,  0,0,0,1]);
 }
 
 Matrix4.prototype.rotate = function(degrees,x,y,z){
    var  e = new Array(16);
    var  r = Math.PI * degrees / 180;
    var  s = Math.sin(r);
    var  c = Math.cos(r);
    var nc = 1-c;
 
    // Normalize (x,y,z) to a unit vector
    var  l = Math.sqrt(x*x + y*y + z*z);
    x/=l;
    y/=l;
    z/=l;
 
    e[ 0] = x*x*nc + c;
    e[ 1] = x*y*nc + z*s;
    e[ 2] = z*x*nc - y*s;
    e[ 3] = 0;
    e[ 4] = x*y*nc - z*s;
    e[ 5] = y*y*nc + c;
    e[ 6] = y*z*nc + x*s;
    e[ 7] = 0;
    e[ 8] = z*x*nc + y*s;
    e[ 9] = y*z*nc - x*s;
    e[10] = z*z*nc + c;
    e[11] = 0;
    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
 
    this.multiply_matrix(e);
 }
 
 Matrix4.prototype.lookAt = function(eyeX, eyeY, eyeZ, targetX, targetY, targetZ, upX, upY, upZ) {
   var e, fx, fy, fz, l, sx, sy, sz, ux, uy, uz;
 
   fx = targetX - eyeX;
   fy = targetY - eyeY;
   fz = targetZ - eyeZ;
 
   // Normalize f.
   l = Math.sqrt(fx*fx + fy*fy + fz*fz);
   fx /= l;
   fy /= l;
   fz /= l;
 
   // Calculate cross product of f and up.
   sx = fy * upZ - fz * upY;
   sy = fz * upX - fx * upZ;
   sz = fx * upY - fy * upX;
 
   // Normalize s.
   l = Math.sqrt(sx*sx + sy*sy + sz*sz);
   sx /= l;
   sy /= l;
   sz /= l;
 
   // Calculate cross product of s and f.
   ux = sy * fz - sz * fy;
   uy = sz * fx - sx * fz;
   uz = sx * fy - sy * fx;
 
   // A pre-calculated shortcut.
   e=this.entries;
   e[0] = sx;
   e[1] = ux;
   e[2] = -fx;
   e[3] = 0;
   e[4] = sy;
   e[5] = uy;
   e[6] = -fy;
   e[7] = 0;
   e[8] = sz;
   e[9] = uz;
   e[10] = -fz;
   e[11] = 0;
   e[12] = 0;
   e[13] = 0;
   e[14] = 0;
   e[15] = 1;
 
   this.translate(-eyeX, -eyeY, -eyeZ);
   return this;
 }
 
 Matrix4.prototype.orthographic = function(left, right, bottom, top, near, far) {
   var e, rw, rh, rd;
 
   if (left === right || bottom === top || near === far) {
     throw 'null frustum';
   }
 
   rw = 1 / (right - left);
   rh = 1 / (top - bottom);
   rd = 1 / (far - near);
 
   e = this.entries;
   e[0]  = 2 * rw;
   e[1]  = 0;
   e[2]  = 0;
   e[3]  = 0;
   e[4]  = 0;
   e[5]  = 2 * rh;
   e[6]  = 0;
   e[7]  = 0;
   e[8]  = 0;
   e[9]  = 0;
   e[10] = -2 * rd;
   e[11] = 0;
   e[12] = -(right + left) * rw;
   e[13] = -(top + bottom) * rh;
   e[14] = -(far + near) * rd;
   e[15] = 1;
 
   return this;
 };
 
 Matrix4.prototype.frustum = function(left, right, bottom, top, near, far) {
   var e, rw, rh, rd;
 
   if (left === right || top === bottom || near === far) throw 'null frustum';
   if (near <= 0) throw 'near <= 0';
   if (far <= 0) throw 'far <= 0';
 
   rw = 1 / (right - left);
   rh = 1 / (top - bottom);
   rd = 1 / (far - near);
 
   e = this.entries;
   e[ 0] = 2 * near * rw;
   e[ 1] = 0;
   e[ 2] = 0;
   e[ 3] = 0;
   e[ 4] = 0;
   e[ 5] = 2 * near * rh;
   e[ 6] = 0;
   e[ 7] = 0;
   e[ 8] = (right + left) * rw;
   e[ 9] = (top + bottom) * rh;
   e[10] = -(far + near) * rd;
   e[11] = -1;
   e[12] = 0;
   e[13] = 0;
   e[14] = -2 * near * far * rd;
   e[15] = 0;
 
   return this;
 };
 
 
 Matrix4.prototype.perspective = function(fovy, aspect, near, far) {
   var e, rd, s, ct;
 
   if (near === far || aspect === 0) throw 'null frustum';
   if (near <= 0) throw 'near <= 0';
   if (far <= 0) throw 'far <= 0';
 
   fovy = Math.PI * fovy / 180 / 2;
   s = Math.sin(fovy);
   if (s === 0) throw 'null frustum';
 
   rd = 1 / (far - near);
   ct = Math.cos(fovy) / s;
 
   e = this.entries;
   e[0]  = ct / aspect;
   e[1]  = 0;
   e[2]  = 0;
   e[3]  = 0;
   e[4]  = 0;
   e[5]  = ct;
   e[6]  = 0;
   e[7]  = 0;
   e[8]  = 0;
   e[9]  = 0;
   e[10] = -(far + near) * rd;
   e[11] = -1;
   e[12] = 0;
   e[13] = 0;
   e[14] = -2 * near * far * rd;
   e[15] = 0;
 
   return this;
 };
 
 function Vector3(s){
    var i;
    this.entries = new Array();
    if (s && (typeof s)==='object' && s.length && s.length==3){
       for (i=0; i<3; i++) this.entries.push(s[i]);
    } else {
       this.entries=[0,0,0];
    }
 }
 
 Vector3.prototype.normalize = function() {
    var v = this.entries;
    var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c*c+d*d+e*e);
    v[0] = c/g; v[1] = d/g; v[2] = e/g;
    return this;
 };
 
 Matrix4.prototype.inverse = function(){
   var i, s, d, inv, det;
   s = this.entries;
   inv = new Array(16);
 
   inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
             + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
   inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
             - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
   inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
             + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
   inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
             - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
   inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
             - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
   inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
             + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
   inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
             - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
   inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
             + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
   inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
             + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
   inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
             - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
   inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
             + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
   inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
             - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
   inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
             - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];
   inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
             + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];
   inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
             - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];
   inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
             + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];
 
   det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
   if (det === 0) return this;
   for (i = 0; i < 16; i++) s[i] = inv[i] / det;
   return this;
 }
 
 Matrix4.prototype.transpose = function() {
   var e, t;
   e = this.entries;
   t = e[ 1];  e[ 1] = e[ 4];  e[ 4] = t;
   t = e[ 2];  e[ 2] = e[ 8];  e[ 8] = t;
   t = e[ 3];  e[ 3] = e[12];  e[12] = t;
   t = e[ 6];  e[ 6] = e[ 9];  e[ 9] = t;
   t = e[ 7];  e[ 7] = e[13];  e[13] = t;
   t = e[11];  e[11] = e[14];  e[14] = t;
   return this;
 };
 
 function loadTexture(gl, n, texture, u_Sampler, image, aTexture, texUnit) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
    gl.activeTexture(aTexture);
    gl.bindTexture(gl.TEXTURE_2D, texture); 
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(u_Sampler, texUnit);
    gl.clear(gl.COLOR_BUFFER_BIT);
 }
 
 function initArrayBuffer(gl, attrib, data, num) {
 var ESIZE=data.BYTES_PER_ELEMENT;
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var attL = gl.getAttribLocation(gl.program, attrib);
    gl.vertexAttribPointer(attL, num, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attL);
 }
 
 function initFramebufferObject(gl,width,height) {
    var framebuffer, texture, depthBuffer;
 
    framebuffer = gl.createFramebuffer();
 
    texture = gl.createTexture(); // Create a texture object
    gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    framebuffer.texture = texture;
    depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16, width,height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                                                gl.RENDERBUFFER, depthBuffer);
 
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
       alert('Frame buffer object is incomplete: ' + e.toString());
       return error();
    }
 
    // Unbind the buffer object
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
 
    return framebuffer;
 }
 
 Matrix4.prototype.frustumInfinite =
     function(left, right, bottom, top, near) {
       var e, rw, rh;
       if (left === right || top === bottom) throw 'null frustum';
       if (near <= 0) throw 'near <= 0';
       rw = 1 / (right - left);
       rh = 1 / (top - bottom);
       e = this.entries;
       e[ 0] = 2 * near * rw;
       e[ 1] = 0;
       e[ 2] = 0;
       e[ 3] = 0;
       e[ 4] = 0;
       e[ 5] = 2 * near * rh;
       e[ 6] = 0;
       e[ 7] = 0;
       e[ 8] = (right + left) * rw;
       e[ 9] = (top + bottom) * rh;
       e[10] = -1;
       e[11] = -1;
       e[12] = 0;
       e[13] = 0;
       e[14] = -2 * near;
       e[15] = 0;
       return this;
 }