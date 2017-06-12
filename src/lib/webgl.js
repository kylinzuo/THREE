/**
 * 绘制三维图形
 * @param {elDom}
 * @param {config}
 */
import { colors } from './util'
console.log('colors', colors)
export function main (canvas, config) {
  // 设置canvas尺寸
  let canvasSize = setCanvasSize(canvas)
  console.log('canvasSize', canvasSize)
  let gl = getWebGLContext(canvas)
  if (!gl) return
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
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
