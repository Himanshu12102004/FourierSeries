import createProgram from "./helpers/createProgram.js";
import compileShader from "./helpers/compileShader.js";
import createBuffer from "./helpers/createBuffer.js";
import Arrow from "./materials/arrow.js";
import ComplexFunction from "./maths/complexFunction.js";
import integralCalculator from "./maths/integralCalculator.js";
var gl, canvas;
var calcInput, err;
var expression = "sin(x)*2";
var isValid = true;
var makeGraphButton = document.querySelector("#graph");
var calc = document.querySelector(".calc");
var blur = document.querySelector(".blur");
var head = document.querySelector(".head");
var animationId;
var preloader;
function loadShaderAsync(shaderURL, callback) {
  const req = new XMLHttpRequest();
  req.open("GET", shaderURL);
  req.onload = function () {
    if (req.status < 200 || req.status > 300) {
      callback("shaderNot", null);
    } else {
      callback(null, req.responseText);
    }
  };
  req.send();
}
function main(error, shaderText) {
  const Controllers = {
    scale: 300,
    speed: 5,
    noOfVectors: 700,
    smoothness: 500,
    ErasePrevious: true,
  };
  const color = {
    vector: {
      r: 255,
      g: 255,
      b: 255,
    },
    drawing: {
      r: 0,
      g: 255,
      b: 255,
    },
  };
  let arrows = [];
  let drawBuffer = [];
  let dBuffer;
  let maxArrowPairs = 500;
  let equation = expression;
  let vectorsToBeDrawn;
  calcInput.innerText = expression;
  let fun1, fun3;
  if (innerWidth < 500) {
    Controllers.scale = 100;
    // maxArrowPairs = 300;
    // Controllers.noOfVectors = 500;
  }
  makeGraphButton.addEventListener("click", async () => {
    if (!isValid) return;
    equation = expression;
    drawBuffer = [];
    head.innerText = "Please Wait!";
    preloader.classList.remove("preloaderFade");
    preloader.style.display = "flex";
    document.querySelector("#words").innerHTML = "Generating Graph...";
    await new Promise((resolve) => setTimeout(resolve, 0));
    assignFunction();
    generateVectors();
    calc.style.display = "none";
    blur.style.display = "none";
    preloader.classList.add("preloaderFade");
    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);
    loop();
  });
  let prevScale = Controllers.scale;
  const gui = new dat.GUI();
  const controllersFolder = gui.addFolder("Controllers");
  controllersFolder.open();
  controllersFolder
    .add(Controllers, "scale", 30, 500)
    .name("Scale")
    .onChange(() => {
      updateVectorsLength();
    });

  controllersFolder
    .add(Controllers, "speed", 0, 100, 0.001)
    .name("Speed")
    .onChange(() => {
      if (Controllers.ErasePrevious) {
        drawBuffer = [];
      }
    });
  controllersFolder
    .add(Controllers, "noOfVectors", 1, maxArrowPairs * 2, 1)
    .name("Vector Count")
    .onChange(() => {
      vectorsToBeDrawn =
        arrows[0].radius <= 0.0001
          ? Controllers.noOfVectors + 1
          : Controllers.noOfVectors;
      if (Controllers.ErasePrevious) {
        drawBuffer = [];
      }
    });

  const colorFolder = controllersFolder.addFolder("Color");
  const vectorFolder = colorFolder.addFolder("Vector");
  const drawingFolder = colorFolder.addFolder("Drawing");

  vectorFolder.add(color.vector, "r", 0, 255).name("Red").onChange(changeColor);
  vectorFolder
    .add(color.vector, "g", 0, 255)
    .name("Green")
    .onChange(changeColor);
  vectorFolder
    .add(color.vector, "b", 0, 255)
    .name("Blue")
    .onChange(changeColor);

  drawingFolder
    .add(color.drawing, "r", 0, 255)
    .name("Red")
    .onChange(changeColor);
  drawingFolder
    .add(color.drawing, "g", 0, 255)
    .name("Green")
    .onChange(changeColor);
  drawingFolder
    .add(color.drawing, "b", 0, 255)
    .name("Blue")
    .onChange(changeColor);
  function changeColor() {
    gl.uniform3fv(
      vectorColorLocation,
      [color.vector.r / 255, color.vector.g / 255, color.vector.b / 255],
      0,
      3
    );
    gl.uniform3fv(
      drawColorLocation,
      [color.drawing.r / 255, color.drawing.g / 255, color.drawing.b / 255],
      0,
      3
    );
  }
  // controllersFolder.add(Controllers, "smoothness", 10, 1000).onChange(() => {
  //   drawBuffer = [];
  //   arrows = [];
  //   generateVectors();
  // });
  // controllersFolder.add(Controllers, "ErasePrevious").onChange(() => {
  //   if (Controllers.ErasePrevious) drawBuffer = [];
  // });
  const vertexShader = compileShader(shaderText[0], gl.VERTEX_SHADER, gl);
  const fragmentShader = compileShader(shaderText[1], gl.FRAGMENT_SHADER, gl);
  const program = createProgram({ vertexShader, fragmentShader }, gl);
  const vertexLocation = gl.getAttribLocation(program, "vertex");
  const drawLocation = gl.getUniformLocation(program, "draw");
  const buffer = createBuffer(new Float32Array([0, 0, 100, 0]), gl);
  gl.enableVertexAttribArray(vertexLocation);
  function resize() {
    canvas.height = innerHeight;
    canvas.width = innerWidth;
    gl.viewport(0, 0, innerWidth, innerHeight);
  }
  resize();
  window.addEventListener("resize", () => {
    resize();
    gl.uniform2fv(viewportDimensionsLocation, [innerWidth, innerHeight], 0, 2);
  });
  const fun2 = new ComplexFunction("cos(n*x)", "-sin(n*x)");
  function assignFunction() {
    document.querySelector(".currentFun").innerText = `f(x)=${equation}`;
    fun1 = new ComplexFunction("x", equation);
    fun3 = ComplexFunction.multiply(fun1, fun2);
  }
  assignFunction();
  let min = -Math.PI;
  let max = Math.PI;
  function updateVectorsLength() {
    for (let i = 0; i < arrows.length; i++) {
      arrows[i].radius = (arrows[i].radius / prevScale) * Controllers.scale;
    }
    if (Controllers.ErasePrevious) drawBuffer = [];
    prevScale = Controllers.scale;
  }

  function generateVectors() {
    arrows = [];
    for (let i = 0; i < maxArrowPairs + 1; i++) {
      let integral = integralCalculator(
        fun3,
        min,
        max,
        Controllers.smoothness + i,
        i
      );
      integral.scalerMultiply(1 / (max - min));
      const radius = integral.radius();
      arrows.push(new Arrow(radius * Controllers.scale, integral.angle(), i));
      if (i != 0) {
        integral = integralCalculator(
          fun3,
          min,
          max,
          Controllers.smoothness + i,
          -i
        );
        integral.scalerMultiply(1 / (max - min));
        const radius = integral.radius();
        arrows.push(
          new Arrow(radius * Controllers.scale, integral.angle(), -i)
        );
      }
    }

    vectorsToBeDrawn =
      arrows[0].radius <= 0.0001
        ? Controllers.noOfVectors + 1
        : Controllers.noOfVectors;
  }

  generateVectors();
  preloader.classList.add("preloaderFade");
  setTimeout(() => {
    preloader.style.display = "none";
  }, 500);
  const viewportDimensionsLocation = gl.getUniformLocation(
    program,
    "viewportDimensions"
  );
  const drawColorLocation = gl.getUniformLocation(program, "drawColor");
  const vectorColorLocation = gl.getUniformLocation(program, "vectorColor");
  changeColor();

  gl.uniform2fv(viewportDimensionsLocation, [innerWidth, innerHeight], 0, 2);
  function updateBuffer(p) {
    let array = [0, 0];
    let last = 0;
    for (let i = 0; i < vectorsToBeDrawn; i++) {
      const arrow = arrows[i];
      let lastX = array[last];
      let lastY = array[last + 1];
      last += 2;
      array.push(
        lastX +
          arrow.radius * Math.cos(arrow.phase + p * arrow.angularVelocity),
        lastY + arrow.radius * Math.sin(arrow.phase + p * arrow.angularVelocity)
      );
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.DYNAMIC_DRAW);
    drawBuffer.push(array[array.length - 2], array[array.length - 1]);
    dBuffer = createBuffer(drawBuffer, gl);
  }
  let count = 0;
  let lastFrameTime = 0;
  function loop() {
    animationId = requestAnimationFrame(loop);
    const currentTime = performance.now();
    let deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    if (deltaTime >= 100) deltaTime = 0;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    updateBuffer(count);
    count += Controllers.speed * deltaTime * 0.0001;
    gl.uniform1i(drawLocation, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, dBuffer);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, true, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, drawBuffer.length / 2);
    gl.uniform1i(drawLocation, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, true, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, vectorsToBeDrawn + 1);
  }
  loop();
}
function fetchElem(name) {
  return document.getElementById(name);
}
function addListener(elem) {
  elem.addEventListener("click", clicked);
}
function clicked(e) {
  expression += e.target.id;
  calcInput.innerText = expression;
  try {
    const parsedExpression = math.parse(expression);
    const zeroeEvaluated = parsedExpression.evaluate({ x: 0 });
    const piEval = parsedExpression.evaluate({ x: Math.PI / 2 });
    if (
      zeroeEvaluated == Infinity ||
      zeroeEvaluated == -Infinity ||
      piEval > 163312393531953 ||
      piEval < -163312393531953
    ) {
      err.innerText = "Sorry this graph can't be made";
      isValid = false;
      makeGraphButton.classList.add("invalid");
    } else {
      err.innerText = "";
      isValid = true;
      makeGraphButton.classList.remove("invalid");
    }
  } catch (e) {
    err.innerText = "Invalid Expression";
    isValid = false;
    makeGraphButton.classList.add("invalid");
  }
}
function init() {
  preloader = document.querySelector(".preloader");
  document.querySelector(".inputFunctions").addEventListener("click", () => {
    head.innerText = "Function Editor";
    calc.style.display = "grid";
    blur.style.display = "block";
    cancelAnimationFrame(animationId);
  });
  calcInput = document.querySelector(".in");
  err = document.querySelector(".err");
  for (let i = 0; i <= 9; i++) {
    const elem = fetchElem(`${i}`);
    addListener(elem);
  }
  addListener(fetchElem("sin("));
  addListener(fetchElem("*"));
  addListener(fetchElem("+"));
  addListener(fetchElem("-"));
  addListener(fetchElem("/"));
  addListener(fetchElem("cos("));
  addListener(fetchElem("^"));
  addListener(fetchElem("("));
  addListener(fetchElem(")"));
  addListener(fetchElem("x"));
  document.getElementById("clear").addEventListener("click", () => {
    calcInput.innerText = "";
    err.innerText = "";
    expression = "";
    isValid = false;
    makeGraphButton.classList.add("invalid");
  });

  canvas = document.querySelector("canvas");
  gl = canvas.getContext("webgl2");
  async.map(
    {
      vsText: "./shaders/fourier.vs.glsl",
      fsText: "./shaders/fourier.fs.glsl",
    },
    loadShaderAsync,
    main
  );
}

try {
  init();
} catch (err) {
  console.error(err);
}
