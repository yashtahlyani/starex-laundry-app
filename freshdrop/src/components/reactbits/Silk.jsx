import { useEffect, useRef } from 'react'

const hexToRGB = hex => {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  }
}

const VERT_SRC = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG_SRC = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd    = noise(gl_FragCoord.xy);
  vec2  uv     = rotateUvs(vUv * uScale, uRotation);
  vec2  tex    = uv * uScale;
  float tOff   = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOff);

  float pattern = 0.6 +
    0.4 * sin(5.0 * (tex.x + tex.y +
      cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOff) +
      sin(20.0 * (tex.x + tex.y - 0.1 * tOff)));

  vec3 col = uColor * pattern - rnd / 15.0 * uNoiseIntensity;
  gl_FragColor = vec4(col, 1.0);
}
`

function createShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

function createProgram(gl, vert, frag) {
  const p = gl.createProgram()
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vert))
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(p)
  return p
}

export default function Silk({
  speed = 5,
  scale = 1,
  color = '#1a0a2e',
  noiseIntensity = 1.5,
  rotation = 0,
  style = {},
}) {
  const canvasRef = useRef(null)
  const propsRef = useRef({ speed, scale, color, noiseIntensity, rotation })
  propsRef.current = { speed, scale, color, noiseIntensity, rotation }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const program = createProgram(gl, VERT_SRC, FRAG_SRC)

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])

    const posBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const uvBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'position')
    const uvLoc = gl.getAttribLocation(program, 'uv')

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uColor = gl.getUniformLocation(program, 'uColor')
    const uSpeed = gl.getUniformLocation(program, 'uSpeed')
    const uScale = gl.getUniformLocation(program, 'uScale')
    const uRotation = gl.getUniformLocation(program, 'uRotation')
    const uNoiseIntensity = gl.getUniformLocation(program, 'uNoiseIntensity')

    const resize = () => {
      const { offsetWidth: w, offsetHeight: h } = canvas.parentElement || canvas
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf
    let t = 0
    const render = delta => {
      raf = requestAnimationFrame(render)
      t += delta * 0.001

      const p = propsRef.current
      const rgb = hexToRGB(p.color)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0)

      gl.uniform1f(uTime, t)
      gl.uniform3f(uColor, rgb.r, rgb.g, rgb.b)
      gl.uniform1f(uSpeed, p.speed)
      gl.uniform1f(uScale, p.scale)
      gl.uniform1f(uRotation, p.rotation)
      gl.uniform1f(uNoiseIntensity, p.noiseIntensity)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  )
}
