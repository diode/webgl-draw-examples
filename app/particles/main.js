// ES6 Class App
class WebGLStarterKit {
  constructor(canvas, vsCode, fsCode) {
    /* Get the canvas */
    this.canvas = document.getElementById(canvas);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    /* Get shader scipts */
    this.vsCode = document.getElementById(vsCode);
    this.fsCode = document.getElementById(fsCode);

    /* Get webgl context */
    this.webGL = this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');

    // mouse state and position
    this.clicked = false;
    this.mouseX = 0;
    this.mouseY = 0;

    // buffer objects
    this.buffers = {};

  }

  start() {

    let canvas = this.canvas,
      webGL = this.webGL,
      w2h = canvas.width / canvas.height, // width to height ratio
      lineCount = 60000; // totoal lines to be drawn

    if (!webGL) {
      document.write("WebGL not supported");
      return;
    }

    // populate vertices, energy of vertices and colors
    let vertices = [];
    let energy = [];
    let colors = [];
    let angle = 0,
      d = 2 * Math.PI / lineCount;
    for (let i = 0; i < lineCount; i++) {
      vertices.push(0.01 * Math.cos(angle += d), // form a circle
        0.01 * Math.sin(angle += d),
        1.79);
      energy.push(0.02 * Math.cos(angle += d), // explode to a bigger circle
        0.02 * Math.sin(angle += d),
        .93 + Math.random() * .06);
      colors.push(1, 1, 1); // set white as default color
    }

    // geometry and color data
    this.drawData = {
      vertices: vertices,
      energy: energy,
      colors: colors,
      lineCount: lineCount,
      w2h: w2h
    };

    // create and set shader program
    this.shaderProgram = this.createShaderProgram(this.vsCode.text,
                                                        this.fsCode.text);

    // set stage
    this.setStage();

    // set up 3D view
    this.setUpView();

    // initiate animation
    this.animate(1);

  }

  // set current mouse position
  setMouseXY(mX, mY) {

    let w2h = this.drawData.w2h;

    this.mouseX = ((2 * mX - this.canvas.width) / this.canvas.width) * w2h;
    this.mouseY = -(2 * mY - this.canvas.height) / (this.canvas.height);

  }

  // animate by calling draw
  animate(count) {
    this.draw(count % 50 == 0);
    window.requestAnimationFrame(() => {
      this.animate(++count);
    })
  }

  // update geometry and color
  // draw lines
  draw(newColor) {

    let webGL = this.webGL;
    let vertices = this.drawData.vertices;
    let energy = this.drawData.energy;
    let colors = this.drawData.colors;
    let lineCount = this.drawData.lineCount;
    let w2h = this.drawData.w2h;

    let n = vertices.length,
      x, ix;
    for (let i = 0; i < lineCount; i += 2) {
      ix = i * 3;

      vertices[ix] = vertices[ix + 3];
      vertices[ix + 1] = vertices[ix + 4];

      energy[ix] *= energy[ix + 2];
      energy[ix + 1] *= energy[ix + 2];

      x = vertices[ix + 3];
      x += energy[ix];

      if (x < -w2h) {
        x = -w2h;
        energy[ix] = Math.abs(energy[ix]);
      } else if (x > w2h) {
        x = w2h;
        energy[ix] = -Math.abs(energy[ix]);
      }
      vertices[ix + 3] = x;

      x = vertices[ix + 4];
      x += energy[ix + 1];
      if (x < -1) {
        x = -1;
        energy[ix + 1] = Math.abs(energy[ix + 1]);
      } else if (x > 1) {
        x = 1;
        energy[ix + 1] = -Math.abs(energy[ix + 1]);
      }
      vertices[ix + 4] = x;

      if (this.clicked) {
        let tx = this.mouseX - vertices[ix],
          ty = this.mouseY - vertices[ix + 1],
          r = Math.sqrt(tx * tx + ty * ty);
        if (r < 2) {
          if (r < .03) {
            vertices[ix + 3] = (Math.random() * 2 - 1) * w2h;
            vertices[ix + 4] = Math.random() * 2 - 1;
            energy[ix] = 0;
            energy[ix + 1] = 0;
          } else {
            tx /= r;
            ty /= r;
            r = Math.pow(1 - r / 2, 2);
            energy[ix] += tx * r * .007;
            energy[ix + 1] += ty * r * .007;
          }
        }
      }

      if (colors[0] != colors[ix]) {
        colors[ix] += (Math.sign(colors[0] - colors[ix]) * 0.01);
        colors[ix + 3] = colors[ix];
      }

      if (colors[1] != colors[ix + 1]) {
        colors[ix + 1] += (Math.sign(colors[1] - colors[ix + 1]) * 0.01);
        colors[ix + 4] = colors[ix + 1];
      }

      if (colors[2] != colors[ix + 2]) {
        colors[ix + 2] += (Math.sign(colors[2] - colors[ix + 2]) * 0.01);
        colors[ix + 5] = colors[ix + 2];
      }


    }

    if (newColor) {
      colors[0] = 0.5 + Math.random() * 0.5;
      colors[1] = 0.3 + Math.random() * 0.7;
      colors[2] = 0.1 + Math.random() * 0.9;
    }

    webGL.lineWidth(2.2);

    webGL.clear(webGL.COLOR_BUFFER_BIT | webGL.DEPTH_BUFFER_BIT);

    // update buffer and shader program
    this.setAttributeBuffers({
      "color": colors,
      "coordinates": vertices,
    });

    // draw lines
    webGL.drawArrays(webGL.LINES, 0, lineCount);
    webGL.flush();

  }

  /***********************************************************/
  /*     Play with start and draw funtions above.            */
  /*     Forget about the code below for the time being.     */
  /*     But do explore when you are ready (Y)               */
  /***********************************************************/

  /* Associate the shader programs to buffer objects */
  setAttributeBuffers(attribArrays) {
    let webGL = this.webGL;

    for (let attribKey in attribArrays) {

      let array = attribArrays[attribKey];
      let buffer = this.getBuffer(attribKey);

      webGL.bindBuffer(webGL.ARRAY_BUFFER, buffer);
      webGL.bufferData(webGL.ARRAY_BUFFER, new Float32Array(array),
                                                      webGL.DYNAMIC_DRAW);

      let attrib = webGL.getAttribLocation(this.shaderProgram, attribKey);
      webGL.vertexAttribPointer(attrib, 3, webGL.FLOAT, false, 0, 0);
      webGL.enableVertexAttribArray(attrib);

      webGL.bindBuffer(webGL.ARRAY_BUFFER, null);

    }

  }

  // create a buffer or use exising one
  getBuffer(attribKey) {
    return (this.buffers[attribKey] = this.buffers[attribKey]
                                      || this.webGL.createBuffer());
  }

  // set up 3D view
  setUpView() {

    let webGL = this.webGL;
    let canvas = this.canvas;

    let pMatrix = ((angle, aspect, zMin, zMax) => {
      let a = 1 / (Math.tan(angle * Math.PI / 360.0) * aspect);
      let b = 1 / Math.tan(angle * Math.PI / 360.0);
      let c = (zMax + zMin) / (zMax - zMin);
      let d = (2 * zMax * zMin) / (zMax - zMin);
      return [
        a, 0, 0, 0,
        0, b, 0, 0,
        0, 0, c, d,
        0, 0, -1, 0
      ];
    })(30, canvas.width / canvas.height, 1, 1000);

    let vMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];

    let viewMatrix = webGL.getUniformLocation(webGL.program,
                                                          "viewMatrix");
    webGL.uniformMatrix4fv(viewMatrix, false, new Float32Array(pMatrix));

    let projectionMatrix = webGL.getUniformLocation(webGL.program,
                                                        "projectionMatrix");
    webGL.uniformMatrix4fv(projectionMatrix, false, new Float32Array(vMatrix));

  }

  /* Create and compile Shader programs */
  createShaderProgram(vShaderCode, fShaderCode) {

    let webGL = this.webGL;

    let vertexShader = webGL.createShader(webGL.VERTEX_SHADER);
    webGL.shaderSource(vertexShader, vShaderCode);
    webGL.compileShader(vertexShader);

    let fragmentShader = webGL.createShader(webGL.FRAGMENT_SHADER);
    webGL.shaderSource(fragmentShader, fShaderCode);
    webGL.compileShader(fragmentShader);

    webGL.program = webGL.createProgram();
    webGL.attachShader(webGL.program, vertexShader);
    webGL.attachShader(webGL.program, fragmentShader);
    webGL.linkProgram(webGL.program);

    webGL.useProgram(webGL.program);
    return webGL.program;

  }

  /* Clear stage and set a background color */
  setStage() {

    let webGL = this.webGL;

    webGL.viewport(0, 0, this.canvas.width, this.canvas.height);
    webGL.clearColor(0.0, 0.0, 0.0, 1.0);
    webGL.clearDepth(1.0);
    webGL.enable(webGL.BLEND);
    webGL.disable(webGL.DEPTH_TEST);
    webGL.blendFunc(webGL.SRC_ALPHA, webGL.ONE);

  }

}
window.onload = () => {
  // instatiate WebGLStarterKit
  var starterKit = new WebGLStarterKit("expCanvas", "vertexShaderCode",
    "fragmentShaderCode");
  starterKit.start();

  /* Track mouse/touch action*/
  let touch;
  document.addEventListener('touchstart', (e) => {
    let me = e.changedTouches[0];
    if (me) {
      touch = me.identifier;
      starterKit.setMouseXY(me.pageX, me.pageY);
      starterKit.clicked = true;
    }
    e.preventDefault();
  });
  document.addEventListener('touchmove', (e) => {
    if (starterKit.clicked) {
      let mes = e.changedTouches,
        count = mes.length,
        me;
      while (count--) {
        me = mes[count];
        if (touch == me.identifier) {
          starterKit.setMouseXY(me.pageX, me.pageY);
          break;
        }
      }
    }
    e.preventDefault();
  });
  document.addEventListener('touchend', (e) => {
    starterKit.clicked = false;
    e.preventDefault();
  });

  // track mouse click
  document.addEventListener('mousedown', (e) => {
    starterKit.setMouseXY(e.pageX, e.pageY);
    starterKit.clicked = true;
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (starterKit.clicked) {
      starterKit.setMouseXY(e.pageX, e.pageY);
    }
    e.preventDefault();
  });
  document.addEventListener('mouseup', (e) => {
    starterKit.clicked = false;
    e.preventDefault();
  });

}
