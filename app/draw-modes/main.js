// ES6 Class App
class WebGLStarterKit {
  constructor(canvas, vsCode, fsCode) {
    /* Get the canvas */
    this.canvas = document.getElementById(canvas);

    /* Get shader scipts */
    this.vsCode = document.getElementById(vsCode);
    this.fsCode = document.getElementById(fsCode);

    /* Get webgl context */
    this.webGL  = this.canvas.getContext('webgl') ||
                  this.canvas.getContext('experimental-webgl');
  }

  start() {

    let webGL = this.webGL;
    if (!webGL) {
      document.write("WebGL not supported");
    }

    // Define array of vertices
    // Create vertex buffer
    let vertices = [-1, 1,  -0.5, 1,
                    -0.5, 0.5,  0, 0.5,
                    0, 0,   0.5, 0,
                    0.5, -0.5,  1, -0.5,  1, -1]; // vertices of a traingle
    let vertexBuffer = this.createVertexBuffer(webGL, vertices);

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
    this.setShaderBuffer(webGL, vertexBuffer, shaderProgram,
                                              vertexSize, "coordinates");

    // Set up canvas using webgl context
    this.setStage(webGL);

    // Finally call draw, pass vertex count
    // Uncomment one function and see how it works

    //this.draw(webGL, webGL.POINTS, vertices.length / vertexSize);
    //this.draw(webGL, webGL.LINES, vertices.length / vertexSize);
    //this.draw(webGL, webGL.LINE_STRIP, vertices.length / vertexSize);
    //this.draw(webGL, webGL.LINE_LOOP, vertices.length / vertexSize);
    this.draw(webGL, webGL.TRIANGLES, vertices.length / vertexSize);
    //this.draw(webGL, webGL.TRIANGLE_STRIP, vertices.length / vertexSize);
    //this.draw(webGL, webGL.TRIANGLE_FAN, vertices.length / vertexSize);

  }

  /* DRAW SOMETHING HERE !!! */
  draw(webGL, mode, count){
    webGL.drawArrays(mode, 0, count);
  }



  /***********************************************************/
  /*     Play with start and draw funtions above.            */
  /*     Forget about the code below for the time being.     */
  /*     But do explore when you are ready (Y)               */
  /***********************************************************/

  /* Define the geometry and store it in buffer objects */
  createVertexBuffer(webGL, vertices){
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

  /* Create and compile Shader programs */
  createShaderProgram(webGL, vShaderCode, fShaderCode){
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
  setShaderBuffer(webGL, vertexBuffer, shaderProgram, vertexSize,
                                                       coordinatesParam){
    //Bind vertex buffer object
    //Get the attribute location
    //point an attribute to the currently bound VBO
    //Enable the attribute
    webGL.bindBuffer(webGL.ARRAY_BUFFER, vertexBuffer);
    let coord = webGL.getAttribLocation(shaderProgram, coordinatesParam);
    webGL.vertexAttribPointer(coord, vertexSize, webGL.FLOAT, false, 0, 0);
    webGL.enableVertexAttribArray(coord);
  }

  /* Clear stage and set a background color */
  setStage(webGL, [red, green, blue, alpha] = [1.0, 1.0, 1.0, 1.0]){
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
