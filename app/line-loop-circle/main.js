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

    // Define array of vertices for a circle
    const ROTATION = (Math.PI * 2); // One rotation 2π
    let radius = 0.75;           // radius
    let angle = 0;              // start from angle 0
    let delta = (Math.PI / 32);  // radians to be incremented
    let x = 0, y = 0;

    // Run loop, find x,y using the equation of circle
    let circlePoints = [];
    while(angle < ROTATION){
      x = radius * Math.cos(angle);  // x = rcosθ
      y = radius * Math.sin(angle);  // y = rsinθ
      circlePoints.push(x, y);
      angle += delta;
    }


    // Create vertex buffer using the points in circle
    let vertexBuffer = this.createVertexBuffer(webGL, circlePoints);

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
    this.setShaderBuffer(webGL, vertexBuffer, shaderProgram, vertexSize,
                                                             "coordinates");

    // Set up canvas using webgl context
    this.setStage(webGL);

    // Finally call draw
    this.draw(webGL, circlePoints.length / vertexSize);

  }

  /* DRAW SOMETHING HERE !!! */
  draw(webGL, count){
    //webGL.drawArrays(webGL.POINTS, 0, count);
    webGL.drawArrays(webGL.LINE_LOOP, 0, count);
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
