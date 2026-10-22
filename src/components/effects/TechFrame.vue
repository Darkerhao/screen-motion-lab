<script setup lang="ts">
import type { MotionEffectProps } from '../../types'

const props = defineProps<MotionEffectProps>()
</script>

<template>
  <div
    class="motion-effect fx-tech-frame"
    :class="{ 'is-paused': props.paused }"
    :style="{
      '--fx-accent': accent,
      '--fx-intensity': intensity,
      '--fx-speed': `${Math.max(2.2, 7 / Math.max(speed, 0.1))}s`,
      '--fx-grid': `${Math.max(28, 92 - density * 0.5)}px`,
    }"
  >
    <div class="frame-surface" aria-hidden="true" />
    <div class="frame-scan" aria-hidden="true" />
    <div class="frame-grid" aria-hidden="true" />

    <div class="frame-edge frame-edge--top"><i /></div>
    <div class="frame-edge frame-edge--bottom"><i /></div>

    <span class="frame-corner frame-corner--tl"><i /><b /></span>
    <span class="frame-corner frame-corner--tr"><i /><b /></span>
    <span class="frame-corner frame-corner--bl"><i /><b /></span>
    <span class="frame-corner frame-corner--br"><i /><b /></span>

    <header class="frame-header">
      <div class="frame-brand">
        <span class="frame-brand__icon"><i /></span>
        <div>
          <b>SECURE MATRIX</b>
          <small>模块化安全监测中枢</small>
        </div>
      </div>
      <div class="frame-status"><i /> SYSTEM ONLINE</div>
    </header>

    <main class="frame-content">
      <span class="frame-content__index">01 / CORE MODULE</span>
      <h2>全域感知<br />实时守护</h2>
      <p>统一接入 · 动态监测 · 智能预警</p>
      <div class="frame-content__actions">
        <span>数据链路 <b>正常</b></span>
        <i />
        <span>安全等级 <b>L3</b></span>
      </div>
    </main>

    <aside class="frame-data frame-data--left">
      <span>PROCESSING</span>
      <b>84.6</b>
      <small>%</small>
      <div class="frame-data__bars">
        <i v-for="index in 10" :key="index" :style="{ height: `${24 + ((index * 17) % 66)}%` }" />
      </div>
    </aside>

    <aside class="frame-data frame-data--right">
      <span>ACTIVE NODES</span>
      <b>1,286</b>
      <div class="frame-data__pulse"><i v-for="index in 4" :key="index" /></div>
      <small>ALL CHANNELS SYNCHRONIZED</small>
    </aside>

    <footer class="frame-footer">
      <span>CHANNEL / 08</span>
      <div><i /><i /><i /><i /></div>
      <span>ENCRYPTED · AES-256</span>
    </footer>
  </div>
</template>

<style scoped>
.fx-tech-frame {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  color: #eef7ff;
  background:
    radial-gradient(circle at 72% 24%, color-mix(in srgb, var(--fx-accent) 10%, transparent), transparent 28%),
    radial-gradient(circle at 20% 84%, color-mix(in srgb, var(--fx-accent) 7%, transparent), transparent 28%),
    linear-gradient(145deg, #030912 0%, #071321 55%, #030811 100%);
}

.frame-surface {
  position: absolute;
  inset: 3.1cqw;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 20%, transparent);
  clip-path: polygon(0 0, 4.2cqw 0, 4.2cqw 1.2cqw, calc(100% - 4.2cqw) 1.2cqw, calc(100% - 4.2cqw) 0, 100% 0, 100% 3.3cqw, calc(100% - 1.2cqw) 3.3cqw, calc(100% - 1.2cqw) calc(100% - 3.3cqw), 100% calc(100% - 3.3cqw), 100% 100%, calc(100% - 4.2cqw) 100%, calc(100% - 4.2cqw) calc(100% - 1.2cqw), 4.2cqw calc(100% - 1.2cqw), 4.2cqw 100%, 0 100%, 0 calc(100% - 3.3cqw), 1.2cqw calc(100% - 3.3cqw), 1.2cqw 3.3cqw, 0 3.3cqw);
}

.frame-grid {
  position: absolute;
  inset: 3.2cqw;
  opacity: calc(var(--fx-intensity) * 0.6);
  background:
    linear-gradient(color-mix(in srgb, var(--fx-accent) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--fx-accent) 5%, transparent) 1px, transparent 1px);
  background-size: var(--fx-grid) var(--fx-grid);
  mask-image: linear-gradient(90deg, black, transparent 28%, transparent 72%, black);
}

.frame-scan {
  position: absolute;
  z-index: 1;
  top: 3.2cqw;
  right: 3.2cqw;
  left: 3.2cqw;
  height: 9cqw;
  opacity: calc(var(--fx-intensity) * 0.75);
  transform: translateY(-110%);
  background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--fx-accent) 8%, transparent) 84%, color-mix(in srgb, var(--fx-accent) 45%, transparent) 97%, transparent);
  animation: frame-scan var(--fx-speed) linear infinite;
}

.frame-edge {
  position: absolute;
  z-index: 2;
  right: 8.5cqw;
  left: 8.5cqw;
  height: 1px;
  overflow: hidden;
  background: color-mix(in srgb, var(--fx-accent) 15%, transparent);
}

.frame-edge--top { top: 3.1cqw; }
.frame-edge--bottom { bottom: 3.1cqw; }

.frame-edge i {
  display: block;
  width: 22%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--fx-accent), transparent);
  animation: edge-travel calc(var(--fx-speed) * 0.72) linear infinite;
}

.frame-edge--bottom i {
  animation-direction: reverse;
}

.frame-corner {
  position: absolute;
  z-index: 3;
  width: 3.5cqw;
  height: 3.5cqw;
}

.frame-corner i,
.frame-corner b {
  position: absolute;
  display: block;
  background: var(--fx-accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--fx-accent) 42%, transparent);
}

.frame-corner i { width: 100%; height: 1.5px; }
.frame-corner b { width: 1.5px; height: 100%; }
.frame-corner--tl { top: 2.8cqw; left: 2.8cqw; }
.frame-corner--tr { top: 2.8cqw; right: 2.8cqw; transform: rotate(90deg); }
.frame-corner--bl { bottom: 2.8cqw; left: 2.8cqw; transform: rotate(-90deg); }
.frame-corner--br { right: 2.8cqw; bottom: 2.8cqw; transform: rotate(180deg); }

.frame-header {
  position: absolute;
  z-index: 3;
  top: 5.4cqw;
  right: 5.5cqw;
  left: 5.5cqw;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.frame-brand {
  display: flex;
  align-items: center;
  gap: 0.9cqw;
}

.frame-brand__icon {
  display: grid;
  width: 2.4cqw;
  height: 2.4cqw;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 42%, transparent);
  transform: rotate(45deg);
}

.frame-brand__icon::before {
  position: absolute;
  width: 45%;
  height: 45%;
  border: 1px solid var(--fx-accent);
  content: "";
}

.frame-brand__icon i {
  width: 0.35cqw;
  height: 0.35cqw;
  background: #f5fbff;
  box-shadow: 0 0 12px var(--fx-accent);
}

.frame-brand div {
  display: flex;
  flex-direction: column;
  gap: 0.35cqw;
}

.frame-brand b,
.frame-status,
.frame-footer,
.frame-data span,
.frame-content__index {
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  letter-spacing: 0.16em;
}

.frame-brand b {
  font-size: 0.72cqw;
  font-weight: 600;
}

.frame-brand small {
  font-size: 0.55cqw;
  letter-spacing: 0.12em;
  color: rgba(209, 233, 255, 0.4);
}

.frame-status {
  display: flex;
  align-items: center;
  gap: 0.55cqw;
  font-size: 0.48cqw;
  color: color-mix(in srgb, var(--fx-accent) 64%, white 18%);
}

.frame-status i {
  width: 0.38cqw;
  height: 0.38cqw;
  border-radius: 50%;
  background: var(--fx-accent);
  box-shadow: 0 0 10px var(--fx-accent);
  animation: frame-pulse 1.8s ease-in-out infinite;
}

.frame-content {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  width: 44cqw;
  transform: translate(-50%, -50%);
  text-align: center;
}

.frame-content__index {
  display: inline-block;
  padding: 0.45cqw 0.8cqw;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 26%, transparent);
  font-size: 0.44cqw;
  color: color-mix(in srgb, var(--fx-accent) 68%, white 10%);
  background: color-mix(in srgb, var(--fx-accent) 5%, transparent);
}

.frame-content h2 {
  margin: 1.3cqw 0 0.9cqw;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 3cqw;
  font-weight: 400;
  line-height: 1.28;
  letter-spacing: 0.16em;
  text-indent: 0.16em;
  text-shadow: 0 0 28px color-mix(in srgb, var(--fx-accent) 34%, transparent);
}

.frame-content p {
  margin: 0;
  font-size: 0.72cqw;
  letter-spacing: 0.25em;
  color: rgba(220, 239, 255, 0.43);
}

.frame-content__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2cqw;
  margin-top: 1.7cqw;
  font-size: 0.6cqw;
  color: rgba(220, 239, 255, 0.48);
}

.frame-content__actions b {
  margin-left: 0.35cqw;
  color: var(--fx-accent);
  font-weight: 500;
}

.frame-content__actions i {
  width: 1px;
  height: 0.9cqw;
  background: color-mix(in srgb, var(--fx-accent) 25%, transparent);
}

.frame-data {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
}

.frame-data--left {
  bottom: 17%;
  left: 8.5cqw;
  align-items: flex-start;
}

.frame-data--right {
  top: 32%;
  right: 8.5cqw;
  align-items: flex-end;
  text-align: right;
}

.frame-data span {
  font-size: 0.44cqw;
  color: rgba(215, 236, 255, 0.34);
}

.frame-data--left b {
  margin-top: 0.45cqw;
  font: 300 2.1cqw/1 "Bahnschrift", monospace;
  color: #f4faff;
}

.frame-data--left small {
  font: 500 0.55cqw/1 "JetBrains Mono", Consolas, monospace;
  color: var(--fx-accent);
}

.frame-data__bars {
  display: flex;
  align-items: flex-end;
  gap: 0.2cqw;
  width: 8cqw;
  height: 2.4cqw;
  margin-top: 0.8cqw;
}

.frame-data__bars i {
  flex: 1;
  background: linear-gradient(180deg, var(--fx-accent), color-mix(in srgb, var(--fx-accent) 18%, transparent));
  opacity: 0.55;
}

.frame-data--right b {
  margin: 0.55cqw 0 0.7cqw;
  font: 300 1.55cqw/1 "Bahnschrift", monospace;
  color: #f4faff;
}

.frame-data--right small {
  margin-top: 0.7cqw;
  font: 500 0.38cqw/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.12em;
  color: rgba(215, 236, 255, 0.26);
}

.frame-data__pulse {
  position: relative;
  display: grid;
  width: 3.2cqw;
  height: 3.2cqw;
  place-items: center;
}

.frame-data__pulse i {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--fx-accent) 35%, transparent);
  border-radius: 50%;
  animation: frame-ring 3.2s linear infinite;
}

.frame-data__pulse i:nth-child(1) { width: 24%; height: 24%; background: var(--fx-accent); box-shadow: 0 0 10px var(--fx-accent); }
.frame-data__pulse i:nth-child(2) { width: 52%; height: 52%; animation-delay: -0.7s; }
.frame-data__pulse i:nth-child(3) { width: 76%; height: 76%; animation-delay: -1.4s; }
.frame-data__pulse i:nth-child(4) { width: 100%; height: 100%; animation-delay: -2.1s; }

.frame-footer {
  position: absolute;
  z-index: 3;
  right: 8.5cqw;
  bottom: 5.2cqw;
  left: 8.5cqw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.38cqw;
  color: rgba(215, 236, 255, 0.3);
}

.frame-footer div {
  display: flex;
  gap: 0.22cqw;
}

.frame-footer i {
  width: 1.8cqw;
  height: 2px;
  background: color-mix(in srgb, var(--fx-accent) 25%, transparent);
}

.frame-footer i:nth-child(-n + 3) {
  background: color-mix(in srgb, var(--fx-accent) 72%, transparent);
  box-shadow: 0 0 6px color-mix(in srgb, var(--fx-accent) 28%, transparent);
}

.is-paused .frame-scan,
.is-paused .frame-edge i,
.is-paused .frame-status i,
.is-paused .frame-data__pulse i {
  animation-play-state: paused;
}

@keyframes frame-scan {
  from { transform: translateY(-110%); }
  to { transform: translateY(850%); }
}

@keyframes edge-travel {
  from { transform: translateX(-100%); }
  to { transform: translateX(560%); }
}

@keyframes frame-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

@keyframes frame-ring {
  from { transform: scale(0.7); opacity: 0.1; }
  50% { opacity: 0.65; }
  to { transform: scale(1.15); opacity: 0; }
}
</style>
