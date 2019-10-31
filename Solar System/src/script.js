// WebGL2 - Scene Graph - Solar System
// from https://webgl2fundamentals.org/webgl/webgl-scene-graph-solar-system.html


  "use strict";

var vs = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fs = `#version 300 es
precision mediump float;

// Passed in from the vertex shader.
in vec4 v_color;

uniform vec4 u_colorMult;
uniform vec4 u_colorOffset;

out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult + u_colorOffset;
}
`;

var Node = function() {
  this.children = [];
  this.localMatrix = m4.identity();
  this.worldMatrix = m4.identity();
};

Node.prototype.setParent = function(parent) {
  // remove us from our parent
  if (this.parent) {
    var ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }

  // Add us to our new parent
  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
};

Node.prototype.updateWorldMatrix = function(matrix) {
  if (matrix) {
    // a matrix was passed in so do the math
    m4.multiply(matrix, this.localMatrix, this.worldMatrix);
  } else {
    // no matrix was passed in so just copy.
    m4.copy(this.localMatrix, this.worldMatrix);
  }

  // now process all the children
  var worldMatrix = this.worldMatrix;
  this.children.forEach(function(child) {
    child.updateWorldMatrix(worldMatrix);
  });
};



function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);

  // setup GLSL program
  var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

  var sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);

  var objectsToDraw = [];
  var objects = [];

  // Let's make all the nodes
  var sunNode = new Node();
  sunNode.localMatrix = m4.translation(0, 0, 0);  // sun a the center
  sunNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.6, 0.6, 0, 1], // yellow
      u_colorMult:   [0.4, 0.4, 0, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var mercuryNode = new Node();
  mercuryNode.localMatrix = m4.translation(20, 0, 0);  // earth 100 units from the sun
  mercuryNode.localMatrix = m4.scale(mercuryNode.localMatrix, 0.3, 0.3, 0.3);
  mercuryNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.7, 0.2, 0.1, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var venusNode = new Node();
  venusNode.localMatrix = m4.translation(40, 0, 0);  // earth 100 units from the sun
  venusNode.localMatrix = m4.scale(venusNode.localMatrix, 0.3, 0.3, 0.3);
  venusNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.2, 0.5, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var earthNode = new Node();
  earthNode.localMatrix = m4.translation(60, 0, 0);  // earth 100 units from the sun
  earthNode.localMatrix = m4.scale(earthNode.localMatrix, 0.3, 0.3, 0.3);
  earthNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.2, 0.5, 0.8, 1],  // blue-green
      u_colorMult:   [0.8, 0.5, 0.2, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var moonNode = new Node();
  moonNode.localMatrix = m4.translation(20, 0, 0);  // moon 20 units from the earth
  moonNode.localMatrix = m4.scale(moonNode.localMatrix, 0.3, 0.3, 0.3);
  moonNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.5, 0.5, 1],  // gray
      u_colorMult:   [0.1, 0.1, 0.1, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var marsNode = new Node();
  marsNode.localMatrix = m4.translation(80, 0, 0);  // sun a the center
  marsNode.localMatrix = m4.scale(marsNode.localMatrix, 0.3, 0.3, 0.3);
  marsNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.2, 0.5, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var jupyterNode = new Node();
  jupyterNode.localMatrix = m4.translation(100, 0, 0);  // sun a the center
  jupyterNode.localMatrix = m4.scale(jupyterNode.localMatrix, 0.3, 0.3, 0.3);
  jupyterNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.2, 0.5, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var saturnNode = new Node();
  saturnNode.localMatrix = m4.translation(120, 0, 0);  // sun a the center
  saturnNode.localMatrix = m4.scale(saturnNode.localMatrix, 0.3, 0.3, 0.3);
  saturnNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.2, 0.5, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var uranusNode = new Node();
  uranusNode.localMatrix = m4.translation(140, 0, 0);  // sun a the center
  uranusNode.localMatrix = m4.scale(uranusNode.localMatrix, 0.3, 0.3, 0.3);
  uranusNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.2, 0.5, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };

  var neptuneNode = new Node();
  neptuneNode.localMatrix = m4.translation(160, 0, 0);  // sun a the center
  neptuneNode.localMatrix = m4.scale(neptuneNode.localMatrix, 0.3, 0.3, 0.3);
  neptuneNode.drawInfo = {
    uniforms: {
      u_colorOffset: [0.5, 0.2, 0.5, 1], // yellow
      u_colorMult:   [0.5, 0.5, 0.5, 1],
    },
    programInfo: programInfo,
    bufferInfo: sphereBufferInfo,
    vertexArray: sphereVAO,
  };


  // connect the celetial objects
  mercuryNode.setParent(sunNode); 
  venusNode.setParent(sunNode);
  earthNode.setParent(sunNode);
  moonNode.setParent(earthNode);
  marsNode.setParent(sunNode);
  jupyterNode.setParent(sunNode);
  saturnNode.setParent(sunNode);
  uranusNode.setParent(sunNode);
  neptuneNode.setParent(sunNode);

  var objects = [
    sunNode,
    mercuryNode,
    venusNode,
    earthNode,
    moonNode,
    marsNode,
    jupyterNode,
    saturnNode,
    uranusNode,
    neptuneNode
  ];

  var objectsToDraw = [
    sunNode.drawInfo,
    mercuryNode.drawInfo,
    venusNode.drawInfo,
    earthNode.drawInfo,
    moonNode.drawInfo,
    marsNode.drawInfo,
    jupyterNode.drawInfo,
    saturnNode.drawInfo,
    uranusNode.drawInfo,
    neptuneNode.drawInfo
  ];

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    time *= 0.001;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, -200, 0];
    var target = [0, 0, 0];
    var up = [0, 0, 1];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // update the local matrices for each object.
    m4.multiply(m4.yRotation(0.01), sunNode.localMatrix  , sunNode.localMatrix);
    m4.multiply(m4.yRotation(0.00), mercuryNode.localMatrix, mercuryNode.localMatrix);
    m4.multiply(m4.yRotation(0.000004115), venusNode.localMatrix, venusNode.localMatrix);
    m4.multiply(m4.yRotation(0.001), earthNode.localMatrix, earthNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), moonNode.localMatrix , moonNode.localMatrix);
    m4.multiply(m4.yRotation(0.0009), marsNode.localMatrix , marsNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), jupyterNode.localMatrix , jupyterNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), saturnNode.localMatrix , saturnNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), uranusNode.localMatrix , uranusNode.localMatrix);
    m4.multiply(m4.yRotation(0.01), neptuneNode.localMatrix , neptuneNode.localMatrix);
    /*
    
    Planet    Rotation Period     Revolution Period
    
    Mercury   58.6 days           87.97   days
    Venus     243  days           224.7   days
    Earth     0.99 days           365.26  days
    Mars      1.03 days           1.88    years
    Jupiter   0.41 days           11.86   years
    Saturn    0.45 days           29.46   years
    Uranus    0.72 days           84.01   years
    Neptune   0.67 days           164.79  years
    Pluto     6.39 days           248.59  years

    */
    // Update all world matrices in the scene graph
    sunNode.updateWorldMatrix();

    // Compute all the matrices for rendering
    objects.forEach(function(object) {
        object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

    // ------ Draw the objects --------

    twgl.drawObjectList(gl, objectsToDraw);

    requestAnimationFrame(drawScene);
  }
}

main();
