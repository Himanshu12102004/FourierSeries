#version 300 es
precision mediump float;
out vec4 color;
uniform int draw;
uniform vec3 vectorColor;
uniform vec3 drawColor;
void main(){
  if(draw==0){
  color=vec4(vectorColor.x,vectorColor.y,vectorColor.z,1);}
  else{
    color=vec4(drawColor.x,drawColor.y,drawColor.z,1);
  }
}