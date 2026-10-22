<script setup lang="ts">
import { toRef, watch } from 'vue'
import { useAnimatedCanvas, type CanvasFrame } from '../../composables/useAnimatedCanvas'
import type { MotionEffectProps } from '../../types'
import { withAlpha } from '../../utils/color'

const props = defineProps<MotionEffectProps>()

interface Particle {
  angle: number
  radius: number
  speed: number
  size: number
  phase: number
  depth: number
}

let particles: Particle[] = []
let generatedDensity = -1
let positions: Array<{ x: number; y: number; particle: Particle }> = []

function randomFactory(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function ensureParticles() {
  if (generatedDensity === props.density) return
  generatedDensity = props.density
  const random = randomFactory(9642 + Math.round(props.density))
  const count = Math.round(24 + props.density * 0.82)
  particles = Array.from({ length: count }, () => ({
    angle: random() * Math.PI * 2,
    radius: 0.08 + random() * 0.86,
    speed: 0.45 + random() * 1.05,
    size: 0.7 + random() * 2.1,
    phase: random() * Math.PI * 2,
    depth: random(),
  }))
}

function drawOrbit(frame: CanvasFrame, radiusX: number, radiusY: number, offset: number, opacity: number) {
  const { ctx, width, height } = frame
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate(offset)
  ctx.strokeStyle = withAlpha(props.accent, opacity * props.intensity)
  ctx.lineWidth = 0.8
  ctx.setLineDash([1.5, 11])
  ctx.beginPath()
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function draw(frame: CanvasFrame) {
  ensureParticles()
  const { ctx, width, height, time } = frame
  const centerX = width / 2
  const centerY = height / 2
  const scale = Math.min(width, height)
  const motion = time * 0.001 * props.speed

  ctx.clearRect(0, 0, width, height)

  const ambient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 0.64)
  ambient.addColorStop(0, withAlpha(props.accent, 0.11 * props.intensity))
  ambient.addColorStop(0.34, withAlpha(props.accent, 0.035 * props.intensity))
  ambient.addColorStop(1, 'rgba(2, 7, 14, 0)')
  ctx.fillStyle = ambient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.strokeStyle = withAlpha(props.accent, 0.17 * props.intensity)
  ctx.lineWidth = 0.7
  for (let index = 0; index < 3; index += 1) {
    const pulse = 0.9 + Math.sin(motion * 0.7 + index * 1.6) * 0.035
    ctx.beginPath()
    ctx.ellipse(0, 0, scale * (0.16 + index * 0.095) * pulse, scale * (0.105 + index * 0.064) * pulse, 0, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()

  drawOrbit(frame, scale * 0.37, scale * 0.24, motion * 0.035, 0.24)
  drawOrbit(frame, scale * 0.43, scale * 0.28, -motion * 0.025, 0.13)

  positions = particles.map((particle) => {
    const orbitAngle = particle.angle + motion * particle.speed * 0.15
    const radiusX = scale * (0.18 + particle.radius * 0.34)
    const radiusY = scale * (0.12 + particle.radius * 0.22)
    const breathing = 1 + Math.sin(motion * 0.9 + particle.phase) * 0.035
    return {
      x: centerX + Math.cos(orbitAngle) * radiusX * breathing,
      y: centerY + Math.sin(orbitAngle) * radiusY * breathing,
      particle,
    }
  })

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const connectDistance = scale * 0.095
  for (let index = 0; index < positions.length; index += 1) {
    const current = positions[index]
    for (let nextIndex = index + 1; nextIndex < positions.length; nextIndex += 1) {
      const next = positions[nextIndex]
      const distance = Math.hypot(current.x - next.x, current.y - next.y)
      if (distance > connectDistance) continue
      const alpha = (1 - distance / connectDistance) * 0.25 * props.intensity
      ctx.strokeStyle = withAlpha(props.accent, alpha)
      ctx.lineWidth = 0.55
      ctx.beginPath()
      ctx.moveTo(current.x, current.y)
      ctx.lineTo(next.x, next.y)
      ctx.stroke()
    }
  }

  for (const { x, y, particle } of positions) {
    const pulse = 0.72 + Math.sin(motion * 1.8 + particle.phase) * 0.28
    const radius = particle.size * (0.82 + pulse * 0.35)
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 7)
    glow.addColorStop(0, withAlpha(props.accent, 0.82 * props.intensity))
    glow.addColorStop(0.18, withAlpha(props.accent, 0.32 * props.intensity))
    glow.addColorStop(1, withAlpha(props.accent, 0))
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, radius * 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = withAlpha('#ffffff', 0.78 + particle.depth * 0.2)
    ctx.beginPath()
    ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2)
    ctx.fill()
  }

  const corePulse = 1 + Math.sin(motion * 1.4) * 0.08
  const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 0.09 * corePulse)
  coreGlow.addColorStop(0, withAlpha('#ffffff', 0.9))
  coreGlow.addColorStop(0.08, withAlpha(props.accent, 0.65 * props.intensity))
  coreGlow.addColorStop(1, withAlpha(props.accent, 0))
  ctx.fillStyle = coreGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, scale * 0.09 * corePulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = withAlpha(props.accent, 0.58 * props.intensity)
  ctx.lineWidth = 1.1
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8 + motion * 0.06
    const inner = scale * 0.029
    const outer = scale * (index % 2 === 0 ? 0.045 : 0.038)
    ctx.beginPath()
    ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner)
    ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer)
    ctx.stroke()
  }
  ctx.restore()
}

const { canvasRef, containerRef, redraw } = useAnimatedCanvas(draw, {
  paused: toRef(props, 'paused'),
  replayKey: toRef(props, 'replayKey'),
})

watch(
  () => [props.density, props.accent, props.intensity, props.speed],
  redraw,
)
</script>

<template>
  <div
    ref="containerRef"
    class="motion-effect fx-particle-nexus"
    :style="{
      '--fx-accent': accent,
      '--fx-intensity': intensity,
    }"
  >
    <canvas ref="canvasRef" class="effect-canvas" aria-hidden="true" />
    <div class="fx-nexus-ambient" aria-hidden="true" />
    <span class="nexus-coordinate nexus-coordinate--tl">LINK / 08</span>
    <span class="nexus-coordinate nexus-coordinate--tr">GRID 37.24°</span>
    <span class="nexus-coordinate nexus-coordinate--bl">SYNC 99.82%</span>
    <span class="nexus-coordinate nexus-coordinate--br">RTT 12.4 MS</span>

    <div class="nexus-hud">
      <p class="nexus-kicker">RELATION ENGINE</p>
      <h2>数据协同网络</h2>
      <div class="nexus-rule"><span /><i /><span /></div>
      <p class="nexus-caption">REAL-TIME CONNECTION TOPOLOGY</p>
      <div class="nexus-metrics">
        <span>NODES <b>128</b></span>
        <span>ACTIVE <b>096</b></span>
        <span>LOAD <b>72%</b></span>
      </div>
    </div>

    <div class="nexus-side-data nexus-side-data--left">
      <small>INPUT SIGNAL</small>
      <b>+24.8%</b>
      <span v-for="index in 6" :key="index" :style="{ height: `${18 + ((index * 13) % 48)}%` }" />
    </div>
    <div class="nexus-side-data nexus-side-data--right">
      <small>LINK QUALITY</small>
      <b>稳定</b>
      <em>EXCELLENT</em>
    </div>
  </div>
</template>

<style scoped>
.fx-particle-nexus {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  color: #eaf9ff;
  background:
    radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--fx-accent) 8%, transparent), transparent 35%),
    linear-gradient(145deg, #040912 0%, #06111d 52%, #030811 100%);
}

.effect-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.fx-nexus-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: calc(var(--fx-intensity) * 0.7);
  background:
    linear-gradient(90deg, transparent 49.92%, color-mix(in srgb, var(--fx-accent) 12%, transparent) 50%, transparent 50.08%),
    linear-gradient(0deg, transparent 49.92%, color-mix(in srgb, var(--fx-accent) 9%, transparent) 50%, transparent 50.08%);
  mask-image: radial-gradient(circle at center, black 0%, transparent 64%);
}

.nexus-coordinate {
  position: absolute;
  z-index: 2;
  font: 500 0.68cqw/1.4 "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--fx-accent) 72%, transparent);
  text-transform: uppercase;
}

.nexus-coordinate::before {
  content: "";
  display: inline-block;
  width: 0.65cqw;
  height: 1px;
  margin-right: 0.5cqw;
  vertical-align: middle;
  background: var(--fx-accent);
  box-shadow: 0 0 8px var(--fx-accent);
}

.nexus-coordinate--tl { top: 4.2cqw; left: 4.6cqw; }
.nexus-coordinate--tr { top: 4.2cqw; right: 4.6cqw; }
.nexus-coordinate--bl { bottom: 4.2cqw; left: 4.6cqw; }
.nexus-coordinate--br { right: 4.6cqw; bottom: 4.2cqw; }

.nexus-hud {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 30cqw;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.nexus-kicker,
.nexus-caption {
  margin: 0;
  font: 500 0.64cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.34em;
  color: color-mix(in srgb, var(--fx-accent) 76%, white 8%);
}

.nexus-hud h2 {
  margin: 1.15cqw 0 1cqw;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 2.45cqw;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-indent: 0.16em;
  text-shadow: 0 0 24px color-mix(in srgb, var(--fx-accent) 50%, transparent);
}

.nexus-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65cqw;
  width: 64%;
  margin: 0 auto 1.15cqw;
}

.nexus-rule span {
  width: 43%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--fx-accent));
  opacity: 0.55;
}

.nexus-rule span:last-child {
  transform: rotate(180deg);
}

.nexus-rule i {
  width: 0.35cqw;
  height: 0.35cqw;
  transform: rotate(45deg);
  background: var(--fx-accent);
  box-shadow: 0 0 10px var(--fx-accent);
}

.nexus-caption {
  font-size: 0.54cqw;
  letter-spacing: 0.25em;
  opacity: 0.56;
}

.nexus-metrics {
  display: flex;
  justify-content: center;
  gap: 1.3cqw;
  margin-top: 1.5cqw;
  font: 500 0.54cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.08em;
  color: rgba(225, 247, 255, 0.48);
}

.nexus-metrics b {
  margin-left: 0.24cqw;
  font-size: 0.68cqw;
  color: #ecfbff;
  font-weight: 500;
}

.nexus-side-data {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: flex;
  flex-direction: column;
  transform: translateY(-50%);
}

.nexus-side-data--left {
  left: 9cqw;
  flex-direction: row;
  align-items: flex-end;
  gap: 0.42cqw;
  height: 5cqw;
}

.nexus-side-data--left small {
  position: absolute;
  bottom: -1.2cqw;
  left: 0;
  font: 500 0.48cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.16em;
  color: rgba(219, 245, 255, 0.42);
}

.nexus-side-data--left b {
  position: absolute;
  top: -1.8cqw;
  left: 0;
  font: 500 0.95cqw/1 "JetBrains Mono", Consolas, monospace;
  color: var(--fx-accent);
}

.nexus-side-data--left span {
  width: 0.4cqw;
  min-height: 0.7cqw;
  border-radius: 1px;
  background: linear-gradient(180deg, var(--fx-accent), color-mix(in srgb, var(--fx-accent) 8%, transparent));
  box-shadow: 0 0 8px color-mix(in srgb, var(--fx-accent) 30%, transparent);
}

.nexus-side-data--right {
  right: 7.5cqw;
  align-items: flex-end;
  gap: 0.4cqw;
  padding-right: 1cqw;
  border-right: 1px solid color-mix(in srgb, var(--fx-accent) 55%, transparent);
  text-align: right;
}

.nexus-side-data--right small,
.nexus-side-data--right em {
  font: 500 0.48cqw/1 "JetBrains Mono", Consolas, monospace;
  font-style: normal;
  letter-spacing: 0.16em;
  color: rgba(219, 245, 255, 0.42);
}

.nexus-side-data--right b {
  font: 500 1.35cqw/1.1 "Microsoft YaHei", sans-serif;
  color: #eefcff;
}

.nexus-side-data--right em {
  color: color-mix(in srgb, var(--fx-accent) 80%, white 10%);
}
</style>

