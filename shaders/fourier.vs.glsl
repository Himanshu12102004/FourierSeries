#version 300 es
precision mediump float;
in vec2 vertex;
uniform vec2 viewportDimensions;
void main(){
vec2 transformed=vec2(vertex.x/viewportDimensions.x,vertex.y/viewportDimensions.y);
  gl_Position=vec4(transformed,0,1);
}