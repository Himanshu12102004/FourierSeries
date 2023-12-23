function compileShader(shaderText, type, gl) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, shaderText);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (type == gl.FRAGMENT_SHADER)
      throw new Error("FRAGMENT_SHADER" + gl.getShaderInfoLog(shader));
    else if (type == gl.VERTEX_SHADER) {
      throw new Error("Vertex" + gl.getShaderInfoLog(shader));
    }
  }
  return shader;
}
export default compileShader;
