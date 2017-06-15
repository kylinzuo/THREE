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
    uniform mat4 uModelMatrix;
    attribute float aPointSize;
    attribute vec4 aColor;
    varying vec4 vColor;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;
    void main() {
      gl_Position = uModelMatrix * aPosition;
      gl_PointSize = aPointSize;
      vTexCoord = aTexCoord;
      vColor = aColor;
    }
  `
  let FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 vColor;
    uniform float uWidth;
    uniform float uHeight;
    uniform sampler2D uSample;
    varying vec2 vTexCoord;
    void main() {
      gl_FragColor = texture2D(uSample, vTexCoord);
    }
  `
  // gl_FragColor = vec4(gl_FragCoord.x / uWidth, 0.0, gl_FragCoord.y / uHeight, 1.0);
  // gl_FragColor = vColor;
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }
  let aPosition = gl.getAttribLocation(gl.program, 'aPosition')
  let uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
  let aPointSize = gl.getAttribLocation(gl.program, 'aPointSize')
  let aColor = gl.getAttribLocation(gl.program, 'aColor')
  let uWidth = gl.getUniformLocation(gl.program, 'uWidth')
  let uHeight = gl.getUniformLocation(gl.program, 'uHeight')
  let aTexCoord = gl.getAttribLocation(gl.program, 'aTexCoord')
  if (aPosition < 0) {
    console.log('Failed to get the storage location of a_Position')
    return
  }
  if (!uModelMatrix) {
    console.log('Failed to get the storage location of uModelMatrix')
    return
  }
  if (aPointSize < 0) {
    console.log('Failed to get the storage location of a_PointSize')
    return
  }
  if (aColor < 0) {
    console.log('Failed to get the storage location of a_Color')
    return
  }
  if (uWidth < 0) {
    console.log('Failed to get the storage location of uWidth')
    return
  }
  if (uHeight < 0) {
    console.log('Failed to get the storage location of uHeight')
    return
  }
  if (aTexCoord < 0) {
    console.log('Failed to get the storage location of aTexCoord')
    return
  }
  // let gPoints = []
  // let gColors = []
  // canvas.addEventListener('mousedown', onMousedown, false)
  // function onMousedown (event) {
  //   console.log('event', event)
  //   let x = event.clientX
  //   let y = event.clientY
  //   let rect = event.target.getBoundingClientRect()
  //   x = ((x - rect.left) - canvasSize.width / 2) / (canvasSize.width / 2)
  //   y = (canvasSize.height / 2 - (y - rect.top)) / (canvasSize.height / 2)
  //   gPoints.push({
  //     x: x,
  //     y: y
  //   })
  //   gColors.push([Math.random(), Math.random(), Math.random(), 1.0])
  //   // 清空canvas
  //   clear(gl)
  //   gl.vertexAttrib1f(aPointSize, 50.0)
  //   gPoints.forEach((d, i) => {
  //     gl.vertexAttrib3f(aPosition, d.x, d.y, 0.0)
  //     gl.uniform4f(uFragColor, gColors[i][0], gColors[i][1], gColors[i][2], gColors[i][3])
  //     gl.drawArrays(gl.POINTS, 0, 1)
  //   })
  // }

  let n = initVertexBuffers(gl)
  if (n < 0) {
    console.log('Failed to set the positions of the vertices')
    return
  }
  // 配置纹理
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.')
    return
  }

  let xModelMatrix = new Matrix4()
  xModelMatrix.setTranslate(0.0, 0.0, 0.0)
  // clear(gl)
  // gl.uniform1f(uWidth, gl.drawingBufferWidth)
  // gl.uniform1f(uHeight, gl.drawingBufferHeight)
  // gl.uniformMatrix4fv(uModelMatrix, false, xModelMatrix.elements)
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n) // POINTS TRIANGLES

  function initVertexBuffers (gl) {
    let verticesSizes = new Float32Array([
      -0.2, 0.2, 10.0, 1.0, 0.0, 0.0, 0.0, 1.0,
      -0.2, -0.2, 10.0, 0.0, 1.0, 0.0, 0.0, 0.0,
      0.2, 0.2, 10.0, 0.0, 0.0, 1.0, 1.0, 1.0,
      0.2, -0.2, 10.0, 1.0, 0.0, 1.0, 1.0, 0.0
    ])
    let n = 4
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
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 8, 0)
    // 连接变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(aPosition)

    gl.vertexAttribPointer(aPointSize, 1, gl.FLOAT, false, FSIZE * 8, FSIZE * 2)
    gl.enableVertexAttribArray(aPointSize)

    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3)
    gl.enableVertexAttribArray(aColor)

    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6)
    gl.enableVertexAttribArray(aTexCoord)

    return n
  }

  function initTextures (gl, n) {
    console.log('initTextures')
    let texture = gl.createTexture()
    if (!texture) {
      console.log('Failed to create the texture object')
      return false
    }
    let uSample = gl.getUniformLocation(gl.program, 'uSample')
    if (!uSample) {
      console.log('Failed to get the storage location of u_Sampler')
      return false
    }

    let image = new Image()
    if (!image) {
      console.log('Failed to create the image object')
      return false
    }

    image.onload = function () {
      console.log('image load success!')
      loadTexture(gl, n, texture, uSample, image)
    }
    // image.src = logoSrc
    image.src = '../../static/sky.jpg'

    return true
  }

  function loadTexture (gl, n, texture, uSample, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0)
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

    // Set the texture unit 0 to the sampler
    gl.uniform1i(uSample, 0)

    clear(gl)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n) // Draw the rectangle
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
