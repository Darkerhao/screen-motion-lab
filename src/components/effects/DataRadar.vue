<script setup lang="ts">
import { toRef, watch } from 'vue'
import { useAnimatedCanvas, type CanvasFrame } from '../../composables/useAnimatedCanvas'
import type { MotionEffectProps } from '../../types'
import { withAlpha } from '../../utils/color'

const props = defineProps<MotionEffectProps>()

interface Target {
  angle: number
  distance: number
  size: number
  phase: number
  drift: number
}

let targets: Target[] = []
let generatedDensity = -1

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

function ensureTargets() {
  if (generatedDensity === props.density) return
  generatedDensity = props.density
  const random = randomFactory(4327 + Math.round(props.density))
  const count = Math.round(9 + props.density * 0.14)
  targets = Array.from({ length: count }, () => ({
    angle: random() * Math.PI * 2,
    distance: 0.14 + random() * 0.8,
    size: 1.2 + random() * 2.6,
    phase: random() * Math.PI * 2,
    drift: 0.4 + random() * 0.8,
  }))
}

function draw(frame: CanvasFrame) {
  ensureTargets()
  const { ctx, width, height, time } = frame
  const scale = Math.min(width, height)
  const centerX = width * 0.5
  const centerY = height * 0.51
  const radius = scale * 0.365
  const motion = time * 0.001 * props.speed
  const sweep = motion * 0.58 - Math.PI / 2

  ctx.clearRect(0, 0, width, height)

  const ambient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)
  ambient.addColorStop(0, withAlpha(props.accent, 0.075 * props.intensity))
  ambient.addColorStop(0.58, withAlpha(props.accent, 0.018 * props.intensity))
  ambient.addColorStop(1, withAlpha(props.accent, 0))
  ctx.fillStyle = ambient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(centerX, centerY)

  ctx.strokeStyle = withAlpha(props.accent, 0.2 * props.intensity)
  ctx.lineWidth = 0.8
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath()
    ctx.arc(0, 0, (radius * ring) / 4, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.strokeStyle = withAlpha(props.accent, 0.095 * props.intensity)
  ctx.lineWidth = 0.65
  for (let spoke = 0; spoke < 12; spoke += 1) {
    const angle = (Math.PI * 2 * spoke) / 12
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * radius * 0.07, Math.sin(angle) * radius * 0.07)
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    ctx.stroke()
  }

  ctx.strokeStyle = withAlpha(props.accent, 0.52 * props.intensity)
  ctx.lineWidth = 1
  for (let tick = 0; tick < 72; tick += 1) {
    const angle = (Math.PI * 2 * tick) / 72
    const length = tick % 6 === 0 ? 0.035 : 0.012
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    ctx.lineTo(Math.cos(angle) * radius * (1 + length), Math.sin(angle) * radius * (1 + length))
    ctx.stroke()
  }

  const sweepGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
  sweepGradient.addColorStop(0, withAlpha(props.accent, 0.2 * props.intensity))
  sweepGradient.addColorStop(0.55, withAlpha(props.accent, 0.075 * props.intensity))
  sweepGradient.addColorStop(1, withAlpha(props.accent, 0))
  ctx.fillStyle = sweepGradient
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, radius, sweep - 0.62, sweep, false)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = withAlpha('#eafffb', 0.75 * props.intensity)
  ctx.lineWidth = 1.15
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(Math.cos(sweep) * radius, Math.sin(sweep) * radius)
  ctx.stroke()

  const sweepGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.15)
  sweepGlow.addColorStop(0, withAlpha('#ffffff', 0.55 * props.intensity))
  sweepGlow.addColorStop(0.2, withAlpha(props.accent, 0.38 * props.intensity))
  sweepGlow.addColorStop(1, withAlpha(props.accent, 0))
  ctx.fillStyle = sweepGlow
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalCompositeOperation = 'lighter'
  for (const target of targets) {
    const angle = target.angle + Math.sin(motion * 0.24 + target.phase) * 0.015 * target.drift
    const distance = radius * target.distance
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2)
    const normalizedSweep = (sweep + Math.PI * 2) % (Math.PI * 2)
    const age = (normalizedSweep - normalizedAngle + Math.PI * 2) % (Math.PI * 2)
    const flash = Math.max(0, 1 - age / 1.4)
    const opacity = 0.3 + flash * 0.7
    const pulse = 1 + Math.sin(motion * 2.1 + target.phase) * 0.16

    const glow = ctx.createRadialGradient(x, y, 0, x, y, target.size * 7)
    glow.addColorStop(0, withAlpha('#ffffff', opacity * 0.95))
    glow.addColorStop(0.12, withAlpha(props.accent, opacity * props.intensity))
    glow.addColorStop(1, withAlpha(props.accent, 0))
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, target.size * 7 * pulse, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = withAlpha(props.accent, opacity * props.intensity)
    ctx.lineWidth = 0.8
    ctx.strokeRect(x - target.size * 2.8, y - target.size * 2.8, target.size * 5.6, target.size * 5.6)
  }
  ctx.globalCompositeOperation = 'source-over'
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
    class="motion-effect fx-data-radar"
    :style="{
      '--fx-accent': accent,
      '--fx-intensity': intensity,
      '--fx-grid': `${Math.max(28, 88 - density * 0.48)}px`,
    }"
  >
    <canvas ref="canvasRef" class="effect-canvas" aria-hidden="true" />

    <div class="radar-brand">
      <span class="radar-brand__mark"><i /></span>
      <div>
        <b>SENTINEL</b>
        <small>SECTOR / 07</small>
      </div>
    </div>

    <div class="radar-live">
      <i />
      <span>LIVE SCANNING</span>
    </div>

    <div class="radar-hud">
      <small>ACTIVE TARGETS</small>
      <strong>1,284</strong>
      <span>AREA 12.8 KM</span>
    </div>

    <aside class="radar-panel">
      <div class="radar-panel__head">
        <span>区域负载</span>
        <b>72.4%</b>
      </div>
      <div v-for="index in 5" :key="index" class="radar-panel__meter">
        <span>{{ ['A-01', 'B-07', 'C-12', 'D-03', 'E-09'][index - 1] }}</span>
        <i><em :style="{ width: `${34 + ((index * 17) % 58)}%` }" /></i>
        <b>{{ 34 + ((index * 17) % 58) }}</b>
      </div>
      <div class="radar-panel__signal">
        <small>SIGNAL</small>
        <div>
          <i v-for="index in 13" :key="index" :style="{ height: `${25 + ((index * 19) % 70)}%` }" />
        </div>
      </div>
    </aside>

    <div class="radar-log">
      <p><span>09:42:16</span> 北区节点接入 <b>ONLINE</b></p>
      <p><span>09:42:11</span> 目标轨迹已同步 <b>SYNC</b></p>
      <p><span>09:42:04</span> 链路安全校验通过 <b>PASS</b></p>
    </div>

    <span class="radar-corner radar-corner--tl" />
    <span class="radar-corner radar-corner--tr" />
    <span class="radar-corner radar-corner--bl" />
    <span class="radar-corner radar-corner--br" />
  </div>
</template>

<style scoped>
.fx-data-radar {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  color: #e8fff8;
  background:
    linear-gradient(color-mix(in srgb, var(--fx-accent) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--fx-accent) 5%, transparent) 1px, transparent 1px),
    radial-gradient(circle at 50% 52%, color-mix(in srgb, var(--fx-accent) 7%, transparent), transparent 42%),
    linear-gradient(145deg, #030c0b 0%, #061512 50%, #030908 100%);
  background-size: var(--fx-grid) var(--fx-grid), var(--fx-grid) var(--fx-grid), auto, auto;
}

.effect-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.radar-brand {
  position: absolute;
  z-index: 2;
  top: 4.7cqw;
  left: 4.7cqw;
  display: flex;
  align-items: center;
  gap: 0.8cqw;
}

.radar-brand__mark {
  position: relative;
  display: grid;
  width: 2.1cqw;
  height: 2.1cqw;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 55%, transparent);
  transform: rotate(45deg);
}

.radar-brand__mark::before,
.radar-brand__mark::after {
  position: absolute;
  content: "";
  background: var(--fx-accent);
  opacity: 0.55;
}

.radar-brand__mark::before { width: 70%; height: 1px; }
.radar-brand__mark::after { width: 1px; height: 70%; }

.radar-brand__mark i {
  width: 0.45cqw;
  height: 0.45cqw;
  background: var(--fx-accent);
  box-shadow: 0 0 12px var(--fx-accent);
}

.radar-brand div {
  display: flex;
  flex-direction: column;
  gap: 0.3cqw;
}

.radar-brand b {
  font: 600 0.82cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.2em;
}

.radar-brand small {
  font: 500 0.48cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--fx-accent) 66%, transparent);
}

.radar-live {
  position: absolute;
  z-index: 2;
  top: 4.8cqw;
  right: 4.8cqw;
  display: flex;
  align-items: center;
  gap: 0.6cqw;
  font: 500 0.56cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--fx-accent) 79%, white 10%);
}

.radar-live i {
  width: 0.42cqw;
  height: 0.42cqw;
  border-radius: 50%;
  background: var(--fx-accent);
  box-shadow: 0 0 12px var(--fx-accent);
  animation: radar-blink 1.7s ease-in-out infinite;
}

.radar-hud {
  position: absolute;
  z-index: 2;
  top: 51%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.radar-hud small,
.radar-hud span {
  font: 500 0.55cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.18em;
  color: rgba(220, 255, 246, 0.5);
}

.radar-hud strong {
  margin: 0.7cqw 0 0.6cqw;
  font: 400 2.9cqw/1 "Bahnschrift", "DIN Alternate", "JetBrains Mono", monospace;
  letter-spacing: 0.03em;
  color: #f1fffb;
  text-shadow: 0 0 26px color-mix(in srgb, var(--fx-accent) 55%, transparent);
}

.radar-panel {
  position: absolute;
  z-index: 2;
  top: 22%;
  right: 5.3cqw;
  width: 17.5cqw;
  padding: 1.3cqw 1.4cqw;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 25%, transparent);
  background: color-mix(in srgb, #04100e 76%, transparent);
  backdrop-filter: blur(3px);
}

.radar-panel::before {
  position: absolute;
  top: -1px;
  left: -1px;
  width: 32%;
  height: 1px;
  content: "";
  background: var(--fx-accent);
  box-shadow: 0 0 10px var(--fx-accent);
}

.radar-panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.2cqw;
  font-size: 0.74cqw;
}

.radar-panel__head span { color: rgba(226, 255, 248, 0.56); }
.radar-panel__head b {
  font: 500 1.1cqw/1 "Bahnschrift", monospace;
  color: var(--fx-accent);
}

.radar-panel__meter {
  display: grid;
  grid-template-columns: 2.8cqw 1fr 1.5cqw;
  gap: 0.7cqw;
  align-items: center;
  margin-top: 0.65cqw;
  font: 500 0.48cqw/1 "JetBrains Mono", Consolas, monospace;
  color: rgba(220, 255, 246, 0.44);
}

.radar-panel__meter i {
  height: 3px;
  overflow: hidden;
  background: color-mix(in srgb, var(--fx-accent) 12%, transparent);
}

.radar-panel__meter em {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fx-accent) 34%, transparent), var(--fx-accent));
  box-shadow: 0 0 8px color-mix(in srgb, var(--fx-accent) 38%, transparent);
}

.radar-panel__meter b {
  font-weight: 500;
  text-align: right;
  color: color-mix(in srgb, var(--fx-accent) 70%, white 12%);
}

.radar-panel__signal {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 1.2cqw;
  padding-top: 0.9cqw;
  border-top: 1px solid color-mix(in srgb, var(--fx-accent) 12%, transparent);
}

.radar-panel__signal small {
  font: 500 0.46cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.16em;
  color: rgba(220, 255, 246, 0.36);
}

.radar-panel__signal div {
  display: flex;
  gap: 0.16cqw;
  align-items: flex-end;
  width: 7.5cqw;
  height: 1.4cqw;
}

.radar-panel__signal i {
  flex: 1;
  background: color-mix(in srgb, var(--fx-accent) 56%, transparent);
  box-shadow: 0 0 5px color-mix(in srgb, var(--fx-accent) 22%, transparent);
}

.radar-log {
  position: absolute;
  z-index: 2;
  bottom: 4.7cqw;
  left: 4.8cqw;
  display: flex;
  flex-direction: column;
  gap: 0.65cqw;
  font: 400 0.56cqw/1.2 "Microsoft YaHei", sans-serif;
  color: rgba(225, 254, 247, 0.44);
}

.radar-log p { margin: 0; }
.radar-log span {
  margin-right: 0.7cqw;
  font-family: "JetBrains Mono", Consolas, monospace;
  color: color-mix(in srgb, var(--fx-accent) 62%, transparent);
}
.radar-log b {
  margin-left: 0.6cqw;
  font: 500 0.46cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.1em;
  color: var(--fx-accent);
}

.radar-corner {
  position: absolute;
  z-index: 2;
  width: 2.4cqw;
  height: 2.4cqw;
  opacity: 0.55;
}
.radar-corner--tl { top: 2.5cqw; left: 2.5cqw; border-top: 1px solid var(--fx-accent); border-left: 1px solid var(--fx-accent); }
.radar-corner--tr { top: 2.5cqw; right: 2.5cqw; border-top: 1px solid var(--fx-accent); border-right: 1px solid var(--fx-accent); }
.radar-corner--bl { bottom: 2.5cqw; left: 2.5cqw; border-bottom: 1px solid var(--fx-accent); border-left: 1px solid var(--fx-accent); }
.radar-corner--br { right: 2.5cqw; bottom: 2.5cqw; border-right: 1px solid var(--fx-accent); border-bottom: 1px solid var(--fx-accent); }

@keyframes radar-blink {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
</style>

