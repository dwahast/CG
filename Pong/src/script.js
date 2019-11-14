// WebGL2 - Animation, Not Frame Rate Independent
// from https://webgl2fundamentals.org/webgl/webgl-animation-not-frame-rate-independent.html


"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;

// the varied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

var p1MoveUp = false;
var p1MoveDown = false;

var p2MoveUp = false;
var p2MoveDown = false;

var speedPlayer = 10;
let keysPressed = {};
//document.addEventListener('keypress', doKeyDown, true);
//window.addEventListener( "keydown", doKeyDown, true); // função que captura uma tecla pressionada na janela
document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
});
document.addEventListener('keyup', (event) => {
  keysPressed[event.key] = false;
});

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  
  // Use our boilerplate utils to compile the shaders and link into a program
  var program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  // look up uniform locations
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  var positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();
  
  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // create the color buffer, make it the current ARRAY_BUFFER
  // and copy in the color values
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(colorAttributeLocation);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      colorAttributeLocation, size, type, normalize, stride, offset);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  // to hold the translationP1,
  var fieldOfViewRadians = degToRad(60);
  var translationP1 = [-700, -80, -720];
  var translationP2 = [700, -80, -720];
  
  var rotation = [0, 0, 0];
  var scale = [1, 1, 1];
  var fieldOfViewRadians = degToRad(60);
  var rotationSpeed = 0.6;

  function computeDrawMatrix(viewProjectionMatrix, translation, rotation, scale) {
   
    var matrix = m4.translate(viewProjectionMatrix,
        translation[0],
        translation[1],
        translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    
    //matrix = m4.multiply(viewProjectionMatrix, matrix);
    
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
   
  }
  //var player2PadVAO = vao

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(now) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
    ///// CAMERA
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);
    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
    /////////////////////////////

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);
    // tell webgl to cull faces
    gl.enable(gl.CULL_FACE);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
    
   
   if(keysPressed['w']){
    translationP1[1] += speedPlayer;
   }
   if(keysPressed['s']){
    translationP1[1] -= speedPlayer;
   }

   if(keysPressed['ArrowUp']){
    translationP2[1] += speedPlayer;
   }
   if(keysPressed['ArrowDown']){
    translationP2[1] -= speedPlayer;
   }

    
    
    computeDrawMatrix(viewProjectionMatrix, translationP1, rotation, scale)
    computeDrawMatrix(viewProjectionMatrix, translationP2, rotation, scale)
    
    // Call drawScene again next frame
    requestAnimationFrame(drawScene);
  }
}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl) {
  var positions = new Float32Array([
          //front (BORDO)
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,

          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          //back (AZUL ESCURO)
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,

            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top
          30,  0,  30,
          0,   0,  30,
          0,   0,   0,

          30,  0,  30,
          0,   0,   0,
          30,  0,   0,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,

          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,

          0,   0,   0,
          0, 150,  30,
          0, 150,   0,

          // right side
          30,   0,   0,
          30, 150,  30,
          30,   0,  30,
    
          30,   0,   0,
          30, 150,   0,
          30, 150,  30,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the current ARRAY_BUFFER buffer with colors for the 'F'.
function setColors(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array([
        //front (BORDO)
        400,  70, 120,
        400,  70, 120,
        400,  70, 120,
        400,  70, 120,
        400,  70, 120,
        400,  70, 120,

        //back (AZUL ESCURO)
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        //top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

        //bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

        // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,

         // right side
         160, 160, 220,
         160, 160, 220,
         160, 160, 220,
         160, 160, 220,
         160, 160, 220,
         160, 160, 220,
      ]),
      gl.STATIC_DRAW);
}

main();