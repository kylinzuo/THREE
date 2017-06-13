/**
 * 绘制三维图形
 * @param {elDom}
 * @param {config}
 */
import { colors } from './util'
import { initShaders } from './book'
console.log('colors', colors)
export function main (canvas, config) {
  // 设置canvas尺寸
  let canvasSize = setCanvasSize(canvas)
  console.log('canvasSize', canvasSize)
  let gl = getWebGLContext(canvas)
  if (!gl) return

  let VSHADER_SOURCE = `
    attribute vec4 aPosition;
    attribute float aPointSize;
    void main() {
      gl_Position = aPosition;
      gl_PointSize = aPointSize;
    }
  `
  let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 uFragColor;
    void main() {
      gl_FragColor = uFragColor;
    }
  `
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }
  let aPosition = gl.getAttribLocation(gl.program, 'aPosition')
  let aPointSize = gl.getAttribLocation(gl.program, 'aPointSize')
  let uFragColor = gl.getUniformLocation(gl.program, 'uFragColor')
  if (aPosition < 0) {
    console.log('Failed to get the storage location of a_Position')
    return
  }
  if (aPointSize < 0) {
    console.log('Failed to get the storage location of a_PointSize')
    return
  }
  if (!uFragColor) {
    console.log('Failed to get the storage location of u_FragColor')
    return
  }
  let gPoints = []
  let gColors = []
  canvas.addEventListener('mousedown', onMousedown, false)
  function onMousedown (event) {
    console.log('event', event)
    let x = event.clientX
    let y = event.clientY
    let rect = event.target.getBoundingClientRect()
    x = ((x - rect.left) - canvasSize.width / 2) / (canvasSize.width / 2)
    y = (canvasSize.height / 2 - (y - rect.top)) / (canvasSize.height / 2)
    gPoints.push({
      x: x,
      y: y
    })
    gColors.push([Math.random(), Math.random(), Math.random(), 1.0])
    // 清空canvas
    clear(gl)
    gl.vertexAttrib1f(aPointSize, 50.0)
    gPoints.forEach((d, i) => {
      gl.vertexAttrib3f(aPosition, d.x, d.y, 0.0)
      gl.uniform4f(uFragColor, gColors[i][0], gColors[i][1], gColors[i][2], gColors[i][3])
      gl.drawArrays(gl.POINTS, 0, 1)
    })
  }

  // function initVertexBuffers (gl) {
  //   let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5])
  //   let n = 3
  //   // 创建缓冲区对象
  //   let vertexBuffer = gl.createBuffer()
  //   if (!vertexBuffer) {
  //     console.log('Failed to create the buffer object')
  //     return -1
  //   }

  //   // 将缓冲区对象绑定到目标
  //   gl.bindBuffer(gl.ARRARY_BUFFER, vertexBuffer)

  //   // 向缓冲区对象中写入数据
  //   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  //   let aPosition = gl.getAttribLocation(gl.program, 'aPosition')

  //   // 连接变量与分配给它的缓冲区对象
  //   gl.enableVertexAttrbArray(aPosition)

  //   return n
  // }
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
