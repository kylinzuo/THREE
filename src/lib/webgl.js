/**
 * 绘制三维图形
 * @param {elDom}
 * @param {config}
 */
import { colors } from './util'
import { initShaders } from './book'
import { Matrix4 } from './matrix'
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
    uniform mat4 uModelViewMatrix;
    attribute vec4 aColor;
    varying vec4 vColor;
    void main() {
      gl_Position = uModelViewMatrix * aPosition;
      vColor = aColor;
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
  let uModelViewMatrix = gl.getUniformLocation(gl.program, 'uModelViewMatrix')
  let aColor = gl.getAttribLocation(gl.program, 'aColor')
  if (aPosition < 0) {
    console.log('Failed to get the storage location of a_Position')
    return
  }
  if (!uModelViewMatrix) {
    console.log('Failed to get the storage location of uModelViewMatrix')
    return
  }
  if (aColor < 0) {
    console.log('Failed to get the storage location of a_Color')
    return
  }

  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log('Failed to set the positions of the vertices')
    return
  }

  let modelViewMatrix = new Matrix4()
  let eyeX = 0.2
  let eyeY = 0.25
  let eyeZ = 0.25
  function draw (gl, n, uModelViewMatrix, modelViewMatrix) {
    modelViewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0)

    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements)
    clear(gl)
    gl.drawArrays(gl.TRIANGLES, 0, n) // POINTS TRIANGLES
  }

  draw(gl, n, uModelViewMatrix, modelViewMatrix)

  document.onkeydown = function (ev) {
    keydown(ev, gl, n, uModelViewMatrix, modelViewMatrix)
  }

  function keydown (ev, gl, n, uModelViewMatrix, modelViewMatrix) {
    if (ev.keyCode === 39) {
      eyeX += 0.01
      console.log('right', eyeX)
    } else if (ev.keyCode === 37) {
      eyeX -= 0.01
      console.log('left', eyeX)
    } else {
      return
    }
    draw(gl, n, uModelViewMatrix, modelViewMatrix)
  }

  function initVertexBuffers (gl) {
    let verticesSizes = new Float32Array([
      0.0, 0.3, -0.2, 0.4, 1.0, 0.4,
      -0.3, -0.3, -0.2, 0.4, 1.0, 0.4,
      0.3, -0.3, -0.2, 1.0, 0.4, 0.4,

      0.3, 0.2, -0.2, 1.0, 0.4, 0.4,
      -0.3, 0.2, -0.2, 1.0, 1.0, 0.4,
      0.0, -0.4, -0.2, 1.0, 1.0, 0.4,

      0.0, 0.3, 0.0, 0.4, 0.4, 1.0,
      -0.3, -0.3, 0.0, 0.4, 0.4, 1.0,
      0.3, -0.3, 0.0, 1.0, 0.4, 0.4
    ])
    let n = 9
    // 创建缓冲区对象
    let vertexBuffer = gl.createBuffer()
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object')
      return -1
    }

    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

    // 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW)
    let FSIZE = verticesSizes.BYTES_PER_ELEMENT
    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, FSIZE * 6, 0)
    // 连接变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(aPosition)

    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    gl.enableVertexAttribArray(aColor)

    return n
  }
}

function clear (gl) {
  // 设置canvas背景色
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // 清空canvas
  gl.clear(gl.COLOR_BUFFER_BIT)
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
