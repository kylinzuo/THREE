// 顶点着色器
`
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_MvpMatrix;
  varying vec4 v_Color;
  void main () {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
  }
`
// 片元着色器
`
  #ifdef GLSL_ES
  precision mediump float;
  #endif
  varying vec4 v_Color;
  void main () {
    gl_FragColor = v_Color;
  }
`

