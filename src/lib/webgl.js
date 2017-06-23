/**
 * 绘制三维图形
 * @param {elDom}
 * @param {config}
 */
import { colors } from './util'
import { initShaders } from './book'
import { Matrix4, Vector3 } from './matrix'
// import logoSrc from './../assets/sky.jpg'
console.log('colors', colors)
export function main (canvas, config) {
  // 设置canvas尺寸
  let canvasSize = setCanvasSize(canvas)
  console.log('canvasSize', canvasSize)
  let gl = getWebGLContext(canvas)
  if (!gl) return

  let VSHADER_SOURCE = `
    attribute vec4 aPosition;
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjMatrix;
    uniform mat4 uMvpMatrix;
    attribute vec4 aColor;
    attribute vec4 aNormal;
    uniform vec3 uLightColor;
    uniform vec3 uLightDirection;
    varying vec4 vColor;
    uniform vec3 uAmbientLight;
    uniform mat4 uNormalMatrix;
    void main() {
      gl_Position = uMvpMatrix * aPosition;
      vec3 normal = normalize(vec3(vec3(uNormalMatrix * aNormal)));
      float nDotL = max(dot(uLightDirection, normal), 0.0);
      vec3 diffuse = uLightColor * vec3(aColor) * nDotL;
      vec3 ambient = uAmbientLight * aColor.rgb;
      vColor = vec4(diffuse + ambient, aColor.a);
    }
  `
  let FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }
  let aPosition = gl.getAttribLocation(gl.program, 'aPosition')
  let uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix')
  let aColor = gl.getAttribLocation(gl.program, 'aColor')
  let uLightColor = gl.getUniformLocation(gl.program, 'uLightColor')
  let uLightDirection = gl.getUniformLocation(gl.program, 'uLightDirection')
  let uAmbientLight = gl.getUniformLocation(gl.program, 'uAmbientLight')
  let uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix')
  if (aPosition < 0) {
    console.log('Failed to get the storage location of a_Position')
    return
  }
  if (!uMvpMatrix) {
    console.log('Failed to get the storage location of uMvpMatrix')
    return
  }
  if (aColor < 0) {
    console.log('Failed to get the storage location of a_Color')
    return
  }
  if (uLightColor < 0) {
    console.log('Failed to get the storage location of uLightColor')
    return
  }
  if (uLightDirection < 0) {
    console.log('Failed to get the storage location of uLightDirection')
    return
  }
  if (uAmbientLight < 0) {
    console.log('Failed to get the storage location of uAmbientLight')
    return
  }
  if (uNormalMatrix < 0) {
    console.log('Failed to get the storage location of uNormalMatrix')
    return
  }

  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log('Failed to set the positions of the vertices')
    return
  }

  let mvpMatrix = new Matrix4()
  let modelMatrix = new Matrix4()
  let viewMatrix = new Matrix4()
  let projMatrix = new Matrix4()
  let normalMatrix = new Matrix4()
  // let eyeX = 0.2
  // let eyeY = 0.25
  // let eyeZ = 0.25
  let eyeX = 3.0
  let eyeY = 3.0
  let eyeZ = 7.0
  function draw (gl, n, uMvpMatrix, mvpMatrix) {
    // projMatrix.setOrtho(-0.5, 0.5, -1.0, 1.0, 0.0, 2.0)
    modelMatrix.setTranslate(0, 0.1, 0)
    modelMatrix.rotate(45, 0, 0, 1)
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0)
    projMatrix.setPerspective(30, canvasSize.width / canvasSize.height, 1, 100)
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix)
    gl.uniformMatrix4fv(uMvpMatrix, false, mvpMatrix.elements)
    gl.uniform3f(uLightColor, 1.0, 1.0, 1.0)
    let lightDirection = new Vector3([0.5, 3.0, 4.0])
    lightDirection.normalize()
    gl.uniform3fv(uLightDirection, lightDirection.elements)
    gl.uniform3f(uAmbientLight, 0.2, 0.2, 0.2)
    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()
    gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements)
    clear(gl)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0) // POINTS TRIANGLES
  }

  draw(gl, n, uMvpMatrix, mvpMatrix)

  document.onkeydown = function (ev) {
    keydown(ev, gl, n, uMvpMatrix, mvpMatrix)
  }

  function keydown (ev, gl, n, uProjMatrix, modelViewMatrix, uModelMatrix, modelMatrix) {
    switch (ev.keyCode) {
      case 39: eyeX += 0.1; break
      case 37: eyeX -= 0.1; break
      default: return
    }
    console.log('keydown', eyeX)
    draw(gl, n, uMvpMatrix, mvpMatrix)
  }

  function initVertexBuffers (gl) {
    let vertices = new Float32Array([   // Vertex coordinates
      1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,  // v0-v3-v4-v5 right
      1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
      -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,  // v1-v6-v7-v2 left
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,  // v7-v4-v3-v2 down
      1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0   // v4-v7-v6-v5 back
    ])

    // let colors = new Float32Array([     // Colors
    //   0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    //   0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    //   1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    //   1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    //   1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    //   0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0   // v4-v7-v6-v5 back
    // ])

    let colors = new Float32Array([     // Colors
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(blue)
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(green)
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(red)
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v1-v6-v7-v2 left
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0  // v4-v7-v6-v5 back
    ])

    let indices = new Uint8Array([       // Indices of the vertices
      0, 1, 2, 0, 2, 3,    // front
      4, 5, 6, 4, 6, 7,    // right
      8, 9, 10, 8, 10, 11,    // up
      12, 13, 14, 12, 14, 15,    // left
      16, 17, 18, 16, 18, 19,    // down
      20, 21, 22, 20, 22, 23     // back
    ])

    var normals = new Float32Array([    // Normal
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ])

    let n = indices.length
    // 创建缓冲区对象
    let indexBuffer = gl.createBuffer()
    if (!indexBuffer) {
      console.log('Failed to create the indexBuffer object')
      return -1
    }

    // Write the vertex coordinates and color to the buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'aPosition')) return -1

    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'aColor')) return -1

    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'aNormal')) return -1

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    return n
  }
}

function initArrayBuffer (gl, data, num, type, attribute) {
  var buffer = gl.createBuffer()   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object')
    return false
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  // Assign the buffer object to the attribute variable
  var aAttribute = gl.getAttribLocation(gl.program, attribute)
  if (aAttribute < 0) {
    console.log('Failed to get the storage location of ' + attribute)
    return false
  }
  gl.vertexAttribPointer(aAttribute, num, type, false, 0, 0)
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(aAttribute)

  return true
}

function clear (gl) {
  gl.enable(gl.DEPTH_TEST)
  // 设置canvas背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas | 清除深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

// 设置画布尺寸
function setCanvasSize (elDom) {
  let parentNode = elDom.parentNode
  let w = parentNode.clientWidth
  let h = parentNode.clientHeight
  let props = [{
    prop: 'width',
    val: w
  }, {
    prop: 'height',
    val: h
  }]
  props.forEach(d => {
    elDom.setAttribute(d.prop, d.val)
  })
  return {
    width: w,
    height: h
  }
}

// 获取webgl上下文
function getWebGLContext (canvas) {
  let gl = null
  try {
    // 尝试获取标准上下文，如果失败，回退到试验性上下文
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  } catch (e) {
    console.log(e)
  }
  if (!gl) {
    alert('WebGL初始化失败，可能是因为您的浏览器不支持。')
    gl = null
  }
  return gl
}
