// ES6 Class App
class WebGLStarterKit {
  constructor(canvas, vsCode, fsCode) {
    /* Get the canvas */
    this.canvas = document.getElementById(canvas);

    /* Get shader scipts */
    this.vsCode = document.getElementById(vsCode);
    this.fsCode = document.getElementById(fsCode);

    /* Get webgl context */
    this.webGL = this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');
  }

  start() {

    let webGL = this.webGL;
    if (!webGL) {
      document.write("WebGL not supported");
    }

    // Define array of vertices
    // Create vertex buffer
    let vertices = [
      -0.5, 0.5, 0.5, /* index 0*/   0.5, 0.5, 0.5, /* index 1*/
      -0.5, -0.5, 0.5, /* index 2*/  0.5, -0.5, 0.5, /* index 3*/
      -0.5, 0.5, -0.5, /* index 4*/  0.5, 0.5, -0.5, /* index 5*/
      -0.5, -0.5, -0.5, /* index 6*/ 0.5, -0.5, -0.5 /* index 7*/
    ];

    /* Indices of triangles */
    let indices = [
      0, 1, 2, /* triangle 1*/  1, 2, 3, /* triangle 2*/  //Face 1
      1, 5, 3, /* triangle 3*/  5, 3, 7, /* triangle 4*/  //Face 2
      5, 4, 7, /* triangle 5*/  4, 7, 6, /* triangle 6*/  //Face 3
      4, 0, 6, /* triangle 7*/  0, 6, 2, /* triangle 8*/  //Face 4
      4, 5, 0, /* triangle 9*/  5, 0, 1, /* triangle 10*/  //Face 5
      6, 7, 2, /* triangle 11*/  7, 2, 3 /* triangle 12*/  //Face 6
    ];

    // define colors
    let colors = [
      1, 0, 0, /* red index 0*/    0, 1, 0, /* green index 1*/
      0, 0, 1, /* blue index 2*/   1, 1, 0, /* yellow index 3*/
      1, 0, 1, /* magenta index*/  0, 1, 1, /* cyan index 5*/
      0, 0, 0, /* black index 6 */ 0.5, 0.5, 0.5 /* grey index 7*/
    ];

    this.geometry = {
      vertices: vertices,
      indices: indices
    };

    // Get vertex shader code
    let vertexShaderCode = this.vsCode.text;
    // Get fragment shader code
    let fragmentShaderCode = this.fsCode.text;

    // Create shader program
    this.shaderProgram = this.createShaderProgram(vertexShaderCode,
      fragmentShaderCode);

    // Created buffer objects for vertices and indices
    let vertexBuffer = this.createVertexBuffer(vertices);
    let indexBuffer = this.createIndexBuffer(indices);
    let colorBuffer = this.createColorBuffer(webGL, colors);

    // Set vertex size (1 , 2, 3, 4)
    // Set shader buffer
    let vertexSize = 3;
    this.setShaderBuffer(vertexBuffer, indexBuffer, colorBuffer,
      vertexSize, "coordinates", "color");

    // Transformation parameters
    this.transform = {
      tx : 0, // translation on X axis
      ty : 0, // translation on Y axis
      tz : 0, // translation on Z axis
      sx : 1, // scale on X axis
      sy : 1, // scale on Y axis
      sz : 1, // scale on Z axis
      rx : 0, // rotation about X axis
      ry : 0, // rotation about Y axis
      rz : 0  // rotation about Z axis
    };

    // Set up canvas using webgl context
    this.setStage();

    this.set3D();
    this.setTransformations();

    // Finally call draw
    this.draw();

  }

  // Update rotation
  rotate(axis, neg){
    if(axis == "X"){
      this.transform.rx += (neg ? -1: 1) * Math.PI/8;
    }else if(axis == "Y"){
      this.transform.ry += (neg ? -1: 1) * Math.PI/8;
    }else if(axis == "Z"){
      this.transform.rz += (neg ? -1: 1) * Math.PI/8;
    }

    // Set up canvas using webgl context
    this.setStage();

    this.setTransformations();
    // Finally call draw
    this.draw();
  }

  // Update translation
  move(axis, neg){
    if(axis == "X"){
      this.transform.tx += (neg ? -1: 1) * 0.1;
    }else if(axis == "Y"){
      this.transform.ty += (neg ? -1: 1) * 0.1;
    }else if(axis == "Z"){
      this.transform.tz += (neg ? -1: 1) * 0.1;
    }

    // Set up canvas using webgl context
    this.setStage();

    this.setTransformations();
    // Finally call draw
    this.draw();
  }

  // Update scale
  scale(axis, neg){
    if(axis == "X"){
      this.transform.sx += (neg ? -1: 1) * 0.01;
    }else if(axis == "Y"){
      this.transform.sy += (neg ? -1: 1) * 0.01;
    }else if(axis == "Z"){
      this.transform.sz += (neg ? -1: 1) * 0.01;
    }

    // Set up canvas using webgl context
    this.setStage();

    this.setTransformations();
    // Finally call draw
    this.draw();
  }

  /* DRAW SOMETHING HERE !!! */
  draw() {
    let webGL = this.webGL;
    let geometry = this.geometry;
    webGL.drawElements(webGL.TRIANGLES, geometry.indices.length,
                                                  webGL.UNSIGNED_SHORT, 0);
  }

  // Set up 3D view and set zoom level
  set3D() {
    let webGL = this.webGL;
    let shaderProgram = this.shaderProgram;

    let projMatrix = ((angle, a, zMin, zMax) => {
      let ang = Math.tan((angle * .5) * Math.PI / 180); //angle*.5
      return [
        0.25 / ang, 0, 0, 0,
        0, 0.25 * a / ang, 0, 0,
        0, 0, -(zMax + zMin) / (zMax - zMin), -1,
        0, 0, (-1 * zMax * zMin) / (zMax - zMin), 0
      ];
    })(40, this.canvas.width/this.canvas.height, 1, 100);

    let viewMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    // zoom
    viewMatrix[14] = viewMatrix[14]-1.6;

    let projection = webGL.getUniformLocation(shaderProgram, "projMatrix");
    let view = webGL.getUniformLocation(shaderProgram, "viewMatrix");
    webGL.uniformMatrix4fv(projection, false, projMatrix);
    webGL.uniformMatrix4fv(view, false, viewMatrix);

  }

  /* APPLY TRANSFORMATION */
  setTransformations(
      sx = this.transform.sx, sy = this.transform.sy, sz = this.transform.sz,
      tx = this.transform.tx, ty = this.transform.ty, tz = this.transform.tz,
      rx = this.transform.rx, ry = this.transform.ry, rz = this.transform.rz) {
    let webGL = this.webGL;
    let shaderProgram = this.shaderProgram;

    // position
    let moveMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1
    ]);
    // apply translation via shader program
    let move = webGL.getUniformLocation(shaderProgram, 'moveMatrix');
    webGL.uniformMatrix4fv(move, false, moveMatrix);


    // rotation about X axis
    let rotXMatrix = new Float32Array([
      1, 0,            0,             0,
      0, Math.cos(rx), Math.sin(rx),  0,
      0, -Math.sin(rx), Math.cos(rx), 0,
      0, 0,             0,            1
    ]);

    // rotation about Y axis
    let rotYMatrix = new Float32Array([
      Math.cos(ry), 0, -Math.sin(ry), 0,
      0,            1, 0,             0,
      Math.sin(ry), 0, Math.cos(ry),  0,
      0,            0, 0,             1
    ]);

    // rotation about Z axis
    let rotZMatrix = new Float32Array([
      Math.cos(rz), -Math.sin(rz), 0, 0,
      Math.sin(rz), Math.cos(rz),  0, 0,
      0,            0,             1, 0,
      0,            0,             0, 1
    ]);

    // apply rotation via shader program
    let rotX = webGL.getUniformLocation(shaderProgram, 'rotXMatrix');
    let rotY = webGL.getUniformLocation(shaderProgram, 'rotYMatrix');
    let rotZ = webGL.getUniformLocation(shaderProgram, 'rotZMatrix');
    webGL.uniformMatrix4fv(rotX, false, rotXMatrix);
    webGL.uniformMatrix4fv(rotY, false, rotYMatrix);
    webGL.uniformMatrix4fv(rotZ, false, rotZMatrix);

    // scale
    let scaleMatrix = new Float32Array([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1
    ]);

    // apply scale via shader program
    let scale = webGL.getUniformLocation(shaderProgram, 'scaleMatrix');
    webGL.uniformMatrix4fv(scale, false, scaleMatrix);

  }



  /***********************************************************/
  /*     Play with start and draw funtions above.            */
  /*     Forget about the code below for the time being.     */
  /*     But do explore when you are ready (Y)               */
  /***********************************************************/

  /* Define the geometry and store it in buffer objects */
  createVertexBuffer(vertices) {
    let webGL = this.webGL;
    // Bind an empty array buffer to it
    // Pass the vertices data to the buffer
    // Unbind the buffer
    let vertexBuffer = webGL.createBuffer();
    webGL.bindBuffer(webGL.ARRAY_BUFFER, vertexBuffer);
    webGL.bufferData(webGL.ARRAY_BUFFER, new Float32Array(vertices),
      webGL.STATIC_DRAW);
    webGL.bindBuffer(webGL.ARRAY_BUFFER, null);
    return vertexBuffer;
  }

  /* Define the geometry and store it in buffer objects */
  createIndexBuffer(indices) {
    let webGL = this.webGL;
    // Create an empty buffer object to store Index buffer
    // Bind appropriate array buffer to it
    // Pass the vertex data to the buffer
    // Unbind the buffer
    let indexBuffer = webGL.createBuffer();
    webGL.bindBuffer(webGL.ELEMENT_ARRAY_BUFFER, indexBuffer);
    webGL.bufferData(webGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
      webGL.STATIC_DRAW);
    webGL.bindBuffer(webGL.ELEMENT_ARRAY_BUFFER, null);

    return indexBuffer;
  }

  /* Create an empty buffer object and store color data*/
  createColorBuffer(webGL, colors) {
    let colorBuffer = webGL.createBuffer();
    webGL.bindBuffer(webGL.ARRAY_BUFFER, colorBuffer);
    webGL.bufferData(webGL.ARRAY_BUFFER, new Float32Array(colors),
                                                    webGL.STATIC_DRAW);
    return colorBuffer;
  }

  /* Create and compile Shader programs */
  createShaderProgram(vShaderCode, fShaderCode) {
    let webGL = this.webGL;
    //Create a vertex shader object
    //Attach vertex shader source code
    //Compile the vertex shader
    let vertShader = webGL.createShader(webGL.VERTEX_SHADER);
    webGL.shaderSource(vertShader, vShaderCode);
    webGL.compileShader(vertShader);

    // Create fragment shader object
    // Attach fragment shader source code
    // Compile the fragment shader
    let fragShader = webGL.createShader(webGL.FRAGMENT_SHADER);
    webGL.shaderSource(fragShader, fShaderCode);
    webGL.compileShader(fragShader);

    // Create a shader program object to store combined shader program
    // Attach a vertex shader
    // Attach a fragment shader
    // Link both programs
    // Use the combined shader program object
    let shaderProgram = webGL.createProgram();
    webGL.attachShader(shaderProgram, vertShader);
    webGL.attachShader(shaderProgram, fragShader);
    webGL.linkProgram(shaderProgram);
    webGL.useProgram(shaderProgram);

    return shaderProgram;
  }

  /* Associate the shader programs to buffer objects */
  setShaderBuffer(vertexBuffer, indexBuffer, colorBuffer, vertexSize,
                                          coordinatesParam, colorParam) {
    let webGL = this.webGL;
    let shaderProgram = this.shaderProgram;
    //Bind vertex buffer object
    //Bind index buffer object
    //Get the attribute location
    //point an attribute to the currently bound VBO
    //Enable the attribute
    webGL.bindBuffer(webGL.ARRAY_BUFFER, vertexBuffer);
    webGL.bindBuffer(webGL.ELEMENT_ARRAY_BUFFER, indexBuffer);

    let coord = webGL.getAttribLocation(shaderProgram, coordinatesParam);
    webGL.vertexAttribPointer(coord, vertexSize, webGL.FLOAT, false, 0, 0);
    webGL.enableVertexAttribArray(coord);


    // bind the color buffer
    // get the attribute location
    // point attribute to the volor buffer object
    // enable the color attribute
    webGL.bindBuffer(webGL.ARRAY_BUFFER, colorBuffer);
    let color = webGL.getAttribLocation(shaderProgram, colorParam);
    webGL.vertexAttribPointer(color, 3, webGL.FLOAT, false, 0, 0);
    webGL.enableVertexAttribArray(color);
  }

  /* Clear stage and set a background color */
  setStage([red, green, blue, alpha] = [1.0, 1.0, 1.0, 1.0]) {
    let webGL = this.webGL;
    // Clear the canvas
    // Enable the depth test
    // Clear the color buffer bit
    // Set the view port
    webGL.enable(webGL.DEPTH_TEST);
    webGL.depthFunc(webGL.LEQUAL);
    webGL.clearColor(red, green, blue, alpha);
    webGL.clearDepth(1.0);
    webGL.clear(webGL.COLOR_BUFFER_BIT);
    webGL.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
}

// instatiate WebGLStarterKit
var starterKit = new WebGLStarterKit("expCanvas", "vertexShaderCode",
  "fragmentShaderCode");
starterKit.start();

document.getElementById("rotateX").addEventListener("click", (e) => {
  starterKit.rotate("X", e.shiftKey);
});
document.getElementById("rotateY").addEventListener("click", (e) => {
  starterKit.rotate("Y", e.shiftKey);
});
document.getElementById("rotateZ").addEventListener("click", (e) => {
  starterKit.rotate("Z", e.shiftKey);
});

document.getElementById("moveX").addEventListener("click", (e) => {
  starterKit.move("X", e.shiftKey);
});
document.getElementById("moveY").addEventListener("click", (e) => {
  starterKit.move("Y", e.shiftKey);
});
document.getElementById("moveZ").addEventListener("click", (e) => {
  starterKit.move("Z", e.shiftKey);
});

document.getElementById("scaleX").addEventListener("click", (e) => {
  starterKit.scale("X", e.shiftKey);
});
document.getElementById("scaleY").addEventListener("click", (e) => {
  starterKit.scale("Y", e.shiftKey);
});
document.getElementById("scaleZ").addEventListener("click", (e) => {
  starterKit.scale("Z", e.shiftKey);
});
