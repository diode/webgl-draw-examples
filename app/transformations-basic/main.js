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

  start(rotateButton) {

    let webGL = this.webGL;
    if (!webGL) {
      document.write("WebGL not supported");
    }

    // Define array of vertices
    // Create vertex buffer
    let vertices = [-0.5, 0, // index 0
      0, -0.5, // index 1
      0.5, 0, // index 2
      0, 0.5 // index 3
    ];

    // 1s triangle using indices 3, 2, 1
    // 2nd triangle using 3, 1, 0
    let indices = [3, 2, 1, 3, 1, 0];

    // Created buffer objects for vertices and indices
    let vertexBuffer = this.createVertexBuffer(webGL, vertices);
    let indexBuffer = this.createIndexBuffer(webGL, indices);

    // Get vertex shader code
    let vertexShaderCode = this.vsCode.text;

    // Get fragment shader code
    let fragmentShaderCode = this.fsCode.text;

    // Create shader program
    let shaderProgram = this.createShaderProgram(webGL, vertexShaderCode,
                                                        fragmentShaderCode);

    // Set vertex size (1 , 2, 3, 4)
    // Set shader buffer
    let vertexSize = 2;
    this.setShaderBuffer(webGL, vertexBuffer, indexBuffer, shaderProgram,
                                                vertexSize, "coordinates");


    let sx = 1.0, sy = 1.0 ; // scale
    let tx = 0, ty = 0 ; // translation
    let rz  = 0; // rotation

    // redraw function to clear, apply transformation and draw
    let redraw = function(){
      // Set up canvas using webgl context
      this.setStage(webGL);

      // apply transformation before drawing
      this.setTransformations(webGL, shaderProgram, sx, sy, tx, ty, rz);
      // Finally call draw
      this.draw(webGL, indices.length);
    }

    // call redraw with `this` as contet
    redraw.call(this);

    // call redraw on click of the button
    // change rotation before redrawing
    rotateButton.addEventListener("click", (e)=>{
      rz += event.shiftKey ? -Math.PI/8 : Math.PI/8;
      redraw.call(this);
    });

  }

  /* DRAW SOMETHING HERE !!! */
  draw(webGL, count) {
    webGL.drawElements(webGL.TRIANGLES, count, webGL.UNSIGNED_SHORT, 0);
  }

  /* APPLY TRANSFORMATION */
  setTransformations(webGL, shaderProgram, sx = 1.0, sy = 1.0,
                                           tx = 0.0, ty = 0.0, r = 0.0) {

    // scale
    let sMatrix = new Float32Array([
      sx, 0.0, 0.0, 0.0,
      0.0, sy, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    // position
    let mMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      tx, ty, 0.0, 1.0
    ]);

    // rotation
    let cos = Math.cos(r),
      sin = Math.sin(r);
    let rMatrix = new Float32Array([
      cos, -sin, 0.0, 0.0,
      sin, cos, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    // apply transformation via shader program
    let moveMatrix = webGL.getUniformLocation(shaderProgram, 'moveMatrix');
    let scaleMatrix = webGL.getUniformLocation(shaderProgram, 'scaleMatrix');
    let rotMatrix = webGL.getUniformLocation(shaderProgram, 'rotMatrix');
    webGL.uniformMatrix4fv(moveMatrix, false, mMatrix);
    webGL.uniformMatrix4fv(scaleMatrix, false, sMatrix);
    webGL.uniformMatrix4fv(rotMatrix, false, rMatrix);
  }



  /***********************************************************/
  /*     Play with start and draw funtions above.            */
  /*     Forget about the code below for the time being.     */
  /*     But do explore when you are ready (Y)               */
  /***********************************************************/

  /* Define the geometry and store it in buffer objects */
  createVertexBuffer(webGL, vertices) {
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
  createIndexBuffer(webGL, indices) {
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

  /* Create and compile Shader programs */
  createShaderProgram(webGL, vShaderCode, fShaderCode) {
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
  setShaderBuffer(webGL, vertexBuffer, indexBuffer, shaderProgram, vertexSize,
    coordinatesParam) {
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
  }

  /* Clear stage and set a background color */
  setStage(webGL, [red, green, blue, alpha] = [1.0, 1.0, 1.0, 1.0]) {
    // Clear the canvas
    // Enable the depth test
    // Clear the color buffer bit
    // Set the view port
    webGL.clearColor(red, green, blue, alpha);
    webGL.enable(webGL.DEPTH_TEST);
    webGL.clear(webGL.COLOR_BUFFER_BIT);
    webGL.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
}

// instatiate WebGLStarterKit
var starterKit = new WebGLStarterKit("expCanvas", "vertexShaderCode",
  "fragmentShaderCode");
starterKit.start(document.getElementById("rotate"));
