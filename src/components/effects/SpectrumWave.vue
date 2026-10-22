<script setup lang="ts">
import { toRef, watch } from 'vue'
import { useAnimatedCanvas, type CanvasFrame } from '../../composables/useAnimatedCanvas'
import type { MotionEffectProps } from '../../types'
import { withAlpha } from '../../utils/color'

const props = defineProps<MotionEffectProps>()

function drawRadialWave(
  frame: CanvasFrame,
  radius: number,
  amplitude: number,
  lobes: number,
  offset: number,
  alpha: number,
) {
  const { ctx, width, height, time } = frame
  const centerX = width / 2
  const centerY = height / 2
  const motion = time * 0.001 * props.speed
  ctx.beginPath()

  for (let step = 0; step <= 220; step += 1) {
    const angle = (Math.PI * 2 * step) / 220
    const wave = Math.sin(angle * lobes + motion * 1.7 + offset) * amplitude
      + Math.sin(angle * (lobes + 3) - motion * 1.1 + offset * 1.7) * amplitude * 0.36
    const currentRadius = radius + wave
    const x = centerX + Math.cos(angle) * currentRadius
    const y = centerY + Math.sin(angle) * currentRadius
    if (step === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.strokeStyle = withAlpha(props.accent, alpha * props.intensity)
  ctx.lineWidth = 0.9
  ctx.stroke()
}

function draw(frame: CanvasFrame) {
  const { ctx, width, height, time } = frame
  const centerX = width / 2
  const centerY = height / 2
  const scale = Math.min(width, height)
  const motion = time * 0.001 * props.speed
  const barCount = Math.round(48 + props.density * 0.95)

  ctx.clearRect(0, 0, width, height)

  const ambient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 0.62)
  ambient.addColorStop(0, withAlpha(props.accent, 0.13 * props.intensity))
  ambient.addColorStop(0.42, withAlpha(props.accent, 0.035 * props.intensity))
  ambient.addColorStop(1, withAlpha(props.accent, 0))
  ctx.fillStyle = ambient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.globalCompositeOperation = 'lighter'

  const tickCount = 96
  for (let tick = 0; tick < tickCount; tick += 1) {
    const angle = (Math.PI * 2 * tick) / tickCount + motion * 0.05
    const inner = scale * 0.335
    const outer = scale * (tick % 8 === 0 ? 0.352 : 0.343)
    ctx.strokeStyle = withAlpha(props.accent, (tick % 8 === 0 ? 0.38 : 0.14) * props.intensity)
    ctx.lineWidth = tick % 8 === 0 ? 1 : 0.55
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
    ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.strokeStyle = withAlpha(props.accent, 0.13 * props.intensity)
  ctx.lineWidth = 0.7
  for (const ring of [0.37, 0.285, 0.17]) {
    ctx.beginPath()
    ctx.arc(0, 0, scale * ring, 0, Math.PI * 2)
    ctx.stroke()
  }

  const rotation = motion * 0.12
  for (let index = 0; index < barCount; index += 1) {
    const angle = (Math.PI * 2 * index) / barCount + rotation
    const phase = index * 0.42
    const primary = (Math.sin(motion * 2.3 + phase) + 1) * 0.5
    const secondary = (Math.sin(motion * 1.35 - phase * 1.4) + 1) * 0.5
    const length = scale * (0.018 + primary * 0.14 + secondary * 0.045)
    const accentAlpha = (0.22 + primary * 0.68) * props.intensity
    const start = scale * 0.263
    const end = start + length

    ctx.strokeStyle = withAlpha(props.accent, accentAlpha)
    ctx.lineWidth = Math.max(0.6, scale * 0.0016)
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * start, Math.sin(angle) * start)
    ctx.lineTo(Math.cos(angle) * end, Math.sin(angle) * end)
    ctx.stroke()

    if (index % 3 === 0) {
      ctx.fillStyle = withAlpha('#ffffff', 0.5 + primary * 0.4)
      ctx.beginPath()
      ctx.arc(Math.cos(angle) * end, Math.sin(angle) * end, Math.max(0.7, scale * 0.0018), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  drawRadialWave(frame, scale * 0.215, scale * (0.012 + props.intensity * 0.014), 7, 0.2, 0.46)
  drawRadialWave(frame, scale * 0.176, scale * 0.009, 11, 2.1, 0.3)
  drawRadialWave(frame, scale * 0.135, scale * 0.005, 5, 4.4, 0.2)

  ctx.save()
  const bottomY = height * 0.79
  ctx.strokeStyle = withAlpha(props.accent, 0.15 * props.intensity)
  ctx.lineWidth = 0.6
  ctx.beginPath()
  ctx.moveTo(width * 0.17, bottomY)
  ctx.lineTo(width * 0.83, bottomY)
  ctx.stroke()

  ctx.beginPath()
  for (let step = 0; step <= 160; step += 1) {
    const ratio = step / 160
    const x = width * (0.17 + ratio * 0.66)
    const envelope = Math.sin(ratio * Math.PI)
    const wave = Math.sin(ratio * 31 + motion * 3.2) * 0.5
      + Math.sin(ratio * 73 - motion * 1.8) * 0.24
      + Math.sin(ratio * 13 + motion * 1.1) * 0.35
    const y = bottomY - wave * height * 0.018 * envelope * props.intensity
    if (step === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = withAlpha(props.accent, 0.64 * props.intensity)
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = withAlpha(props.accent, 0.48 * props.intensity)
  for (let index = 0; index < 48; index += 1) {
    const ratio = index / 48
    const heightRatio = (Math.sin(motion * 1.9 + index * 0.73) + 1) * 0.5
    const x = width * (0.17 + ratio * 0.66)
    const barHeight = height * 0.005 + heightRatio * height * 0.018
    ctx.fillRect(x, bottomY + height * 0.012, Math.max(1, width * 0.0014), barHeight)
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
    class="motion-effect fx-spectrum-wave"
    :style="{
      '--fx-accent': accent,
      '--fx-intensity': intensity,
    }"
  >
    <canvas ref="canvasRef" class="effect-canvas" aria-hidden="true" />

    <div class="wave-topbar">
      <div class="wave-title">
        <span>RESONANCE</span>
        <small>FREQUENCY ANALYZER</small>
      </div>
      <div class="wave-live"><i /> SIGNAL LOCKED</div>
    </div>

    <div class="wave-hud">
      <small>LIVE FREQUENCY</small>
      <strong>96.4<span>Hz</span></strong>
      <p>实时频谱监测</p>
    </div>

    <div class="wave-panel wave-panel--left">
      <span class="wave-panel__label">BAND / 08</span>
      <b>124.6</b>
      <small>Hz</small>
      <div class="wave-panel__line" />
      <em>GAIN +12.4 dB</em>
    </div>

    <div class="wave-panel wave-panel--right">
      <span class="wave-panel__label">SIGNAL QUALITY</span>
      <div class="wave-quality">
        <i v-for="index in 20" :key="index" :class="{ active: index <= 17 }" />
      </div>
      <div class="wave-quality__meta">
        <b>98.4%</b>
        <small>STABLE</small>
      </div>
    </div>

    <div class="wave-axis">
      <span>20</span><span>80</span><span>160</span><span>320</span><span>640</span><span>1.2K</span><span>2.4K</span>
    </div>

    <span class="wave-tag wave-tag--tl">CH-01</span>
    <span class="wave-tag wave-tag--tr">SCAN / ACTIVE</span>
    <span class="wave-tag wave-tag--bl">AMP 0.842</span>
    <span class="wave-tag wave-tag--br">FFT 2048</span>
  </div>
</template>

<style scoped>
.fx-spectrum-wave {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  color: #f1efff;
  background:
    radial-gradient(ellipse at 50% 88%, color-mix(in srgb, var(--fx-accent) 10%, transparent), transparent 34%),
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--fx-accent) 3%, transparent) 0 1px, transparent 1px 4.2cqw),
    linear-gradient(145deg, #09080f 0%, #110d1c 50%, #07070d 100%);
}

.fx-spectrum-wave::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, transparent 0 19%, color-mix(in srgb, var(--fx-accent) 8%, transparent) 19.05%, transparent 19.2%);
}

.effect-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.wave-topbar {
  position: absolute;
  z-index: 2;
  top: 4.6cqw;
  right: 4.8cqw;
  left: 4.8cqw;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.wave-title {
  display: flex;
  flex-direction: column;
  gap: 0.35cqw;
}

.wave-title span,
.wave-title small,
.wave-live,
.wave-tag {
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  letter-spacing: 0.2em;
}

.wave-title span {
  font-size: 0.86cqw;
  font-weight: 600;
  color: #f4f1ff;
}

.wave-title small {
  font-size: 0.48cqw;
  color: rgba(222, 216, 255, 0.36);
}

.wave-live {
  display: flex;
  align-items: center;
  gap: 0.6cqw;
  font-size: 0.52cqw;
  color: color-mix(in srgb, var(--fx-accent) 72%, white 12%);
}

.wave-live i {
  width: 0.38cqw;
  height: 0.38cqw;
  border-radius: 50%;
  background: var(--fx-accent);
  box-shadow: 0 0 11px var(--fx-accent);
}

.wave-hud {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  text-align: center;
}

.wave-hud small,
.wave-hud p {
  margin: 0;
  font: 500 0.46cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.2em;
  color: rgba(227, 220, 255, 0.38);
}

.wave-hud strong {
  margin: 0.55cqw 0 0.65cqw;
  font: 300 2.5cqw/0.92 "Bahnschrift", "DIN Alternate", monospace;
  color: #f5f2ff;
  letter-spacing: -0.02em;
  text-shadow: 0 0 22px color-mix(in srgb, var(--fx-accent) 46%, transparent);
}

.wave-hud strong span {
  margin-left: 0.3cqw;
  font-size: 0.72cqw;
  letter-spacing: 0.08em;
  color: var(--fx-accent);
}

.wave-hud p {
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 0.22em;
}

.wave-panel {
  position: absolute;
  z-index: 2;
  width: 16.5cqw;
  padding: 1.2cqw 1.35cqw;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 18%, transparent);
  background: color-mix(in srgb, #0b0912 65%, transparent);
  backdrop-filter: blur(3px);
}

.wave-panel--left {
  top: 54%;
  left: 5.2cqw;
}

.wave-panel--right {
  top: 28%;
  right: 5.2cqw;
}

.wave-panel__label,
.wave-panel em {
  display: block;
  font: 500 0.44cqw/1 "JetBrains Mono", Consolas, monospace;
  font-style: normal;
  letter-spacing: 0.16em;
  color: rgba(228, 222, 255, 0.36);
}

.wave-panel--left b {
  display: inline-block;
  margin: 1cqw 0 0.35cqw;
  font: 300 1.8cqw/1 "Bahnschrift", monospace;
  color: #f4f0ff;
}

.wave-panel--left small {
  margin-left: 0.3cqw;
  font: 500 0.55cqw/1 "JetBrains Mono", Consolas, monospace;
  color: var(--fx-accent);
}

.wave-panel__line {
  width: 100%;
  height: 1px;
  margin: 0.8cqw 0;
  background: linear-gradient(90deg, var(--fx-accent), transparent);
  opacity: 0.4;
}

.wave-quality {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.2cqw;
  margin: 1.1cqw 0 0.8cqw;
}

.wave-quality i {
  height: 0.55cqw;
  background: color-mix(in srgb, var(--fx-accent) 12%, transparent);
}

.wave-quality i.active {
  background: color-mix(in srgb, var(--fx-accent) 68%, transparent);
  box-shadow: 0 0 5px color-mix(in srgb, var(--fx-accent) 24%, transparent);
}

.wave-quality__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.wave-quality__meta b {
  font: 300 1.2cqw/1 "Bahnschrift", monospace;
  color: var(--fx-accent);
}

.wave-quality__meta small {
  font: 500 0.44cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.12em;
  color: rgba(228, 222, 255, 0.36);
}

.wave-axis {
  position: absolute;
  z-index: 2;
  right: 17cqw;
  bottom: 4.4cqw;
  left: 17cqw;
  display: flex;
  justify-content: space-between;
  font: 500 0.42cqw/1 "JetBrains Mono", Consolas, monospace;
  color: rgba(227, 220, 255, 0.25);
}

.wave-tag {
  position: absolute;
  z-index: 2;
  font-size: 0.44cqw;
  color: rgba(227, 220, 255, 0.34);
}

.wave-tag--tl { top: 4.7cqw; left: 50%; transform: translateX(-50%); }
.wave-tag--tr { top: 4.7cqw; right: 14cqw; }
.wave-tag--bl { bottom: 4.5cqw; left: 5cqw; }
.wave-tag--br { right: 5cqw; bottom: 4.5cqw; }
</style>


