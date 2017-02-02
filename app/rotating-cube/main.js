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

    let vertices = [
      -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, // Face 1
      -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, // Face 2
      -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, // Face 3
      1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, // Face 4
      -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, // Face 5
      -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, // Face 6
    ];

    let indices = [
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, // Face 1 & 2
      8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,  // Face 3 & 4
      16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23   // Face 5 & 6
    ];

    let colors = [
      0.5, 0.3, 0.7, 0.5, 0.3, 0.7, 0.5, 0.3, 0.7, 0.5, 0.3, 0.7, // Face 1
      0.3, 0.7, 0.5, 0.3, 0.7, 0.5, 0.3, 0.7, 0.5, 0.3, 0.7, 0.5, // Face 2
      0.7, 0.5, 0.3, 0.7, 0.5, 0.3, 0.7, 0.5, 0.3, 0.7, 0.5, 0.3, // Face 3
      0.4, 0.6, 0.1, 0.4, 0.6, 0.1, 0.4, 0.6, 0.1, 0.4, 0.6, 0.1, // Face 4
      0.3, 0.5, 0.7, 0.3, 0.5, 0.7, 0.3, 0.5, 0.7, 0.3, 0.5, 0.7, // Face 5
      0.6, 0.1, 0.4, 0.6, 0.1, 0.4, 0.6, 0.1, 0.4, 0.6, 0.1, 0.4, // Face 6
    ];

    // Geometry Data
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

    // Rotation parameters
    this.transform = {
      rx: 0,
      ry: 0,
      rz: 0,
      rt: "rx" // current axis
    };

    // Set up canvas using webgl context
    this.setStage();

    this.set3D();

    this.rotate();

  }

  // rotate function that is recursevely called
  rotate() {

    // change axis
    if (Math.round(this.transform[this.transform.rt] % (2 * Math.PI)) == 0) {
      let rand = Math.random() * 91;
      if (rand > 30) {
        this.transform.rt = "ry";
      }
      if (rand > 60) {
        this.transform.rt = "rz";
      }
    }
    // update current rotation
    this.transform[this.transform.rt] += Math.PI / 64;
    // update transformation
    this.setTransformations();

    this.setStage();
    // Finally call draw
    this.draw();

    // invoke `rotate` again after a delay
    window.requestAnimationFrame(() => {
      this.rotate();
    });

  }

  /* DRAW SOMETHING HERE !!! */
  draw() {
    let webGL = this.webGL;
    let geometry = this.geometry;
    webGL.drawElements(webGL.TRIANGLES, geometry.indices.length,
                                              webGL.UNSIGNED_SHORT, 0);
  }

  /* Set up 3D projetion and set zoom level */
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
    })(40, this.canvas.width / this.canvas.height, 1, 100);

    let viewMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    // zoom
    viewMatrix[14] = viewMatrix[14] - 3;

    let projection = webGL.getUniformLocation(shaderProgram, "projMatrix");
    let view = webGL.getUniformLocation(shaderProgram, "viewMatrix");
    webGL.uniformMatrix4fv(projection, false, projMatrix);
    webGL.uniformMatrix4fv(view, false, viewMatrix);

  }

  /* APPLY TRANSFORMATION */
  setTransformations(rx = this.transform.rx,
                     ry = this.transform.ry, rz = this.transform.rz) {
    let webGL = this.webGL;
    let shaderProgram = this.shaderProgram;

    // rotation about X axis
    let rotXMatrix = new Float32Array([
      1, 0, 0, 0,
      0, Math.cos(rx), Math.sin(rx), 0,
      0, -Math.sin(rx), Math.cos(rx), 0,
      0, 0, 0, 1
    ]);

    // rotation about Y axis
    let rotYMatrix = new Float32Array([
      Math.cos(ry), 0, -Math.sin(ry), 0,
      0, 1, 0, 0,
      Math.sin(ry), 0, Math.cos(ry), 0,
      0, 0, 0, 1
    ]);

    // rotation about Z axis
    let rotZMatrix = new Float32Array([
      Math.cos(rz), -Math.sin(rz), 0, 0,
      Math.sin(rz), Math.cos(rz), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);

    // apply rotation via shader program
    let rotX = webGL.getUniformLocation(shaderProgram, 'rotXMatrix');
    let rotY = webGL.getUniformLocation(shaderProgram, 'rotYMatrix');
    let rotZ = webGL.getUniformLocation(shaderProgram, 'rotZMatrix');
    webGL.uniformMatrix4fv(rotX, false, rotXMatrix);
    webGL.uniformMatrix4fv(rotY, false, rotYMatrix);
    webGL.uniformMatrix4fv(rotZ, false, rotZMatrix);

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
    webGL.clear(webGL.COLOR_BUFFER_BIT | webGL.DEPTH_BUFFER_BIT);
    webGL.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
}

// instatiate WebGLStarterKit
var starterKit = new WebGLStarterKit("expCanvas", "vertexShaderCode",
  "fragmentShaderCode");
starterKit.start();
