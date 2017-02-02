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
      -0.5, 0, // index 0
      -0.5, -0.5, // index 1
      0, -0.5, // index 2
      0.5, -0.5, // index 3
      0.5, 0, // index 4
      0.5, 0.5, // index 5
      0, 0.5, // index 6
      -0.5, 0.5 // index 7
    ];

    // 1s triangle using indices 3, 2, 1
    // 2nd triangle using 3, 1, 0
    let indices = [0, 1, 2, 3, 4, 5, 6, 7];

    // define some colors
    let colors = [
      1, 0, 0, // red index 0
      0, 1, 0, // green index 1
      0, 0, 1, // blue index 2
      1, 1, 0, // yellow index 3
      1, 0, 1, // magenta index 4
      0, 1, 1, // cyan index 5
      0, 0, 0, // black index 6
      0.5, 0.5, 0.5 // grey index 7
    ];

    // Created buffer objects for vertices and indices
    let vertexBuffer = this.createVertexBuffer(webGL, vertices);
    let indexBuffer = this.createIndexBuffer(webGL, indices);
    let colorBuffer = this.createColorBuffer(webGL, colors);

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
    let vertexParam = "coordinates";
    let colorParam = "color";
    this.setShaderBuffer(webGL, vertexBuffer, indexBuffer, colorBuffer,
                         shaderProgram, vertexSize, vertexParam, colorParam);

    // Set up canvas using webgl context
    this.setStage(webGL);

    // Finally call draw
    this.draw(webGL, indices.length);

  }

  /* DRAW SOMETHING HERE !!! */
  draw(webGL, count) {
    webGL.drawElements(webGL.POINTS, count, webGL.UNSIGNED_SHORT, 0);
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

  /* Create an empty buffer object and store color data*/
  createColorBuffer(webGL, colors) {
    let colorBuffer = webGL.createBuffer();
    webGL.bindBuffer(webGL.ARRAY_BUFFER, colorBuffer);
    webGL.bufferData(webGL.ARRAY_BUFFER, new Float32Array(colors),
                                                    webGL.STATIC_DRAW);
    return colorBuffer;
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
  setShaderBuffer(webGL, vertexBuffer, indexBuffer, colorBuffer, shaderProgram,
                                        vertexSize, vertexParam, colorParam) {
    //Bind vertex buffer object
    //Bind index buffer object
    //Get the attribute location
    //point an attribute to the currently bound VBO
    //Enable the attribute
    webGL.bindBuffer(webGL.ARRAY_BUFFER, vertexBuffer);
    webGL.bindBuffer(webGL.ELEMENT_ARRAY_BUFFER, indexBuffer);

    let coord = webGL.getAttribLocation(shaderProgram, vertexParam);
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
starterKit.start();
