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

var translationP1 = [-830, -75, -720];
var translationP2 = [800, -75, -720];

var p1MoveUp = false;
var p1MoveDown = false;

var p2MoveUp = false;
var p2MoveDown = false;

var playerSpeed = 700;
var ballSpeed = 0;
let keysPressed = {};

var player1score = 0;
var player2score = 0;
var randomStart = ['DIR','ESQ']
var solo = false;
var dificult = [-400,-300,0]
var limite = 5;
var incrementBallSpeed = 25;
var paused = false;
var savedBallSpeed;
var savedPlayerSpeed;
var running = false;
var ballPosition = [0,0,-720];
var baseSpeed = 700;
var music = true;

var mySound = new sound("solid.wav");
var myMusic = new sound("bites.mp3");


document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
});
document.addEventListener('keyup', (event) => {
  keysPressed[event.key] = false;
});

document.querySelectorAll('.debug').forEach(function(el) {
  el.style.display = 'block';
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

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Create a vertex array object (attribute state)
  var padsVAO = gl.createVertexArray();
  // and make it the one we're currently working with
  gl.bindVertexArray(padsVAO);
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
  gl.vertexAttribPointer( positionAttributeLocation, size, type, normalize, stride, offset);

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
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var positionBuffer1 = gl.createBuffer();
  var ballVAO = gl.createVertexArray();
  gl.bindVertexArray(ballVAO);
  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer1);
  // Set Geometry.
  setGeometryBall(gl);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer( positionAttributeLocation, size, type, normalize, stride, offset);

  // create the color buffer, make it the current ARRAY_BUFFER
  // and copy in the color values
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColorsBall(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(colorAttributeLocation);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  // to hold the translation
  ballPosition = [0,0,-720]
  var diagonal = 0;
  var rotation = [0, 0, 0];
  var scale = [1, 1, 1];
  var fieldOfViewRadians = degToRad(60);
  var ballRotation = [0,0,0];

  function computeDrawMatrix(viewProjectionMatrix, translation, rotation, scale, v) {
    gl.bindVertexArray(v);
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

  var then = 0;
  var dir = randomStart[Math.round(Math.random())];

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(now) {
    now *= 0.001
    var deltaTime = now - then;
    then = now;
    
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

    if(!paused && music){
      myMusic.play();
    }else{
      myMusic.stop();
    }

    if(keysPressed[' '] == true && running){
      document.getElementById('pause').innerHTML = "Paused";
      if(paused == false){
          savedBallSpeed = ballSpeed;
          savedPlayerSpeed = playerSpeed;
          playerSpeed = 0;
          ballSpeed = 0;
          paused = true;
          document.getElementById('pause').style.display = 'block';
          document.getElementById('solo').style.display = 'block';
          document.getElementById('multi').style.display = 'block';
      }else{
          ballSpeed = savedBallSpeed;
          playerSpeed = savedPlayerSpeed;
          paused = false;
          document.getElementById('pause').style.display = 'none';
          document.getElementById('solo').style.display = 'none';
          document.getElementById('multi').style.display = 'none';
      }
      keysPressed[' '] = false;
    }
      
    //Comandos de movimentação Jogadores
    if(keysPressed['w']){
      if(translationP1[1] + 150 <= canvas.height - 220){
        translationP1[1] += playerSpeed * deltaTime;
      }
    }
    if(keysPressed['s']){
      if(translationP1[1] >= -canvas.height + 220){
        translationP1[1] -= playerSpeed * deltaTime;
      }  
    }
    if(keysPressed['p']){
      if(translationP2[1] + 150 <= canvas.height - 220){
        translationP2[1] += playerSpeed * deltaTime;
      }
    } 
    if(keysPressed['l']){
      if(translationP2[1] >= -canvas.height + 220){
        translationP2[1] -= playerSpeed * deltaTime;
      }
    } 

    //Verificação de hit
    if(dir == 'ESQ'){
      if(ballPosition[0] <= (translationP1[0] + 15)){//limite hit
        if( translationP1[1] > (ballPosition[1]+40) || (translationP1[1]+160) < ballPosition[1]){
          //alert("ERROU")
            player2score += 1;
            ballPosition = [0,0,-720];
            dir = randomStart[Math.round(Math.random())];
            ballSpeed = baseSpeed;
            diagonal = 0;
        }else{
          //alert("Acertou")
          mySound.play();
          dir = 'DIR'    
          ballSpeed += incrementBallSpeed;
          if(ballPosition[1] + 30 <= translationP1[1] + 101){//bate na parte inferior
            diagonal = (translationP1[1]+100 - ballPosition[1]); 
          }else{
            if(ballPosition[1] - 30 >= translationP1[1] + 50){//bate na parte superior
              diagonal = -1*(ballPosition[1] - translationP1[1]); 
            }else{
              diagonal = 0;
            }
          }
        }
      }else{
        if(ballPosition[1] + 30 >= canvas.height - 220) diagonal *= -1;
        if(ballPosition[1] <= -canvas.height + 220) diagonal *= -1;
        ballPosition[0] -= ballSpeed * deltaTime;
        ballPosition[1] += diagonal * deltaTime * (ballSpeed*0.003);
      }
    }
    
    if(dir == 'DIR'){
      if(ballPosition[0] >= (translationP2[0] - 15)){//limite hit
        if( translationP2[1] > (ballPosition[1]+35) || (translationP2[1]+ 155) < ballPosition[1]){
          //alert("ERROU")
          player1score += 1;
          ballPosition = [0,0,-720];
          dir = randomStart[Math.round(Math.random())];
          ballSpeed = baseSpeed;
          diagonal = 0;
        }else{
          //alert("Acertou")
          mySound.play();
          dir = 'ESQ'    
          ballSpeed += incrementBallSpeed;
          if(ballPosition[1] + 30 <= translationP2[1] + 101){//bate na parte inferior
            diagonal = (translationP2[1]+100 - ballPosition[1]); 
          }else{
            if(ballPosition[1] - 30 >= translationP2[1] + 50){//bate na parte superior
              diagonal = -1*(ballPosition[1] - translationP2[1]); 
            }else{
              diagonal = 0;
            }
          }
        }
      }else{
        if(ballPosition[1] + 30 >= canvas.height - 220) diagonal *= -1;
        if(ballPosition[1] <= -canvas.height + 220) diagonal *= -1;
        ballPosition[0] += ballSpeed * deltaTime;
        ballPosition[1] += diagonal * deltaTime * (ballSpeed*0.003);
      }
    }
    //IA
    if(solo && !paused && running){
      if(translationP2[1]+75 <= ballPosition[1]+15){
        if(translationP2[1] + 150 <= canvas.height - 220){
          translationP2[1] += (playerSpeed + dificult[0]) * deltaTime;
        }
      }else{
        if(translationP2[1] >= -canvas.height + 220){
          translationP2[1] -= (playerSpeed + dificult[0]) * deltaTime;
        }
      }
    }
    //limite de pontuação
    if(player1score >= limite){
      //alert("Player 1 Venceu!!!");
      document.getElementById('pause').innerHTML = "Player 1 Venceu!!!";
      document.getElementById('pause').style.display = "block";
      player1score = 0;
      player2score = 0;
      ballSpeed = 0;
      ballPosition [0,0, -720]
      solo = false;
      running = false;
      document.getElementById('solo').style.display = 'block';
      document.getElementById('multi').style.display = 'block';
    }
    if(player2score >= limite){
      document.getElementById('pause').innerHTML = "Player 1 Venceu!!!";
      document.getElementById('pause').style.display = "block";
      // alert("Player 2 Venceu!!!");
      player1score = 0;
      player2score = 0;
      ballSpeed = 0;
      ballPosition [0,0, -720]
      solo = false;
      running = false;
      document.getElementById('solo').style.display = 'block';
      document.getElementById('multi').style.display = 'block';
      
    }

    //SCORE
    document.getElementById('score').innerHTML = player1score + ' X ' + player2score;
    
    //screen debug
    document.getElementById('musicStatus').innerHTML = "Music:" + music;
    document.getElementById('running').innerHTML = "running:" + running;
    document.getElementById('paused').innerHTML = "paused:" + paused;
    document.getElementById('speed').innerHTML = "Speed: " + ballSpeed;
    document.getElementById('savedspeed').innerHTML = "SaveSpeed: " + playerSpeed;
    document.getElementById('angle').innerHTML = "Angle:" + diagonal;
    document.getElementById('type').innerHTML = "AI: " + solo;
    document.getElementById('pad1').innerHTML = "Pad 1 Pos:" + translationP1[1];
    document.getElementById('pad2').innerHTML = "Pad 2 Pos:" + translationP2[1];

    computeDrawMatrix(viewProjectionMatrix, translationP1, rotation, scale, padsVAO)
    computeDrawMatrix(viewProjectionMatrix, translationP2, rotation, scale, padsVAO)
    computeDrawMatrix(viewProjectionMatrix, ballPosition, ballRotation, [0.9,0.7,0.5], ballVAO)
    
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

function setGeometryBall(gl) {
  var ballvertexpositions = new Float32Array([
    //
    30,   0,  0,        
    0,   0,  0,
    0, 30,  0,

    30,   0,  0,
    0, 30,  0,
    30, 30,  0 ,
    
    //
    0,   0,  30,
    30,   0,  30,        
    0, 30,  30,
    
    0, 30,  30,
    30,   0,  30,
    30, 30,  30,
    //
    0,   30,  0,
    0,   0,  0,
    0, 30,  30,

    0, 0,  0,
    0,   0,  30,
    0, 30,  30,
    //
    30,   0,  0,
    30,   30,  0,
    30, 30,  30,

    30,   0,  30,
    30, 0,  0,
    30, 30,  30,
    //top
    30, 30, 0,
    0, 30, 0,
    0, 30, 30,

    30, 30, 30,
    30, 30, 0,
    0, 30, 30,
    //
    0, 0, 0,
    30, 0, 0,
    0, 0, 30,

    30, 0, 0,
    30, 0, 30,
    0, 0, 30,

  ]);
  // var x;
  // var y;
  // var z;
  // var r;
  // var vertex;
  // var STACKS = 3;
  // var SLICES = 10;
  // var ballvertexpositions = [];

  // for (var stack = 0; stack < STACKS; ++stack) {
  //   for (var slice = 0; slice < SLICES; ++slice) {
  //     //y = 2.0 * stack / STACKS - 1.0;
  //     y = -Math.cos(Math.PI * stack / STACKS);
  //     r = Math.sqrt(1 - y^2);
  //     x = r * Math.sin(2.0 * Math.PI * slice / SLICES);
  //     z = r * Math.cos(2.0 * Math.PI * slice / SLICES);
  
  //     vertex = r * (x, y, z);
  //     ballvertexpositions.push(vertex)
  //   }
  // }
  // var positions = new Float32Array(ballvertexpositions);
  // document.getElementById('teste').innerHTML = positions
  gl.bufferData(gl.ARRAY_BUFFER, ballvertexpositions, gl.STATIC_DRAW);
}

function setColorsBall(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array([
        //front (BORDO)
        100,  100, 100,
        100,  100, 100,
        100,  100, 100,
        
        100,  200, 100,
        100,  200, 100,
        100,  200, 100,

        //back (AZUL ESCURO)
        100,  100, 200,
        100,  100, 200,
        100,  100, 200,

        200, 100, 200,
        200, 100, 200,
        200, 100, 200,

        //top
        400,  400, 400,
        400,  400, 400,
        400,  400, 400,
        700, 2000, 210,
        700, 2000, 210,
        700, 2000, 210,

        // //bottom
        900, 130, 110,
        400,  400, 400,
        400,  400, 400,
        400,  400, 400,
        400,  400, 400,
        900, 130, 110,

        // // left side
        1600, 160, 220,
        1600, 160, 220,
        1600, 160, 220,
        1600, 160, 220,
        1600, 160, 220,
        1600, 160, 220,

        //  // right side
         160, 1260, 2200,
         160, 1260, 2200,
         160, 1260, 2200,
         160, 1260, 2200,
         160, 1260, 2200,
         160, 1260, 2200,
      ]),
      gl.STATIC_DRAW);
}
function singleplayer(){
  document.getElementById('solo').style.display = 'none';
  document.getElementById('multi').style.display = 'none';
  document.getElementById('pause').style.display = 'none';
  ballSpeed = baseSpeed;
  if(solo && running){
    keysPressed[' '] = true;
  }else{
    running = true;
    solo = true;
    paused = false;
    playerSpeed = baseSpeed;
    ballPosition = [0,0,-720];
    player1score = 0;
    player2score = 0;
    translationP1[1] = -75;
    translationP2[1] = -75;
  }
}
function multiplayer(){
  document.getElementById('solo').style.display = 'none';
  document.getElementById('multi').style.display = 'none';
  document.getElementById('pause').style.display = 'none';
  ballSpeed = baseSpeed;
  if(!solo && running){
    keysPressed[' '] = true;
  }else{
    running = true
    solo = false;
    paused = false;
    playerSpeed = ballSpeed;
    ballPosition = [0,0,-720];
    player1score = 0;
    player2score = 0;
    translationP1[1] = -75;
    translationP2[1] = -75;
  } 
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

function musicOnOff() {
  if(music){
    music = false;
  }else{
    music = true;
  }
}

main();