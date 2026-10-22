<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { EffectDefinition } from '../effects'
import type { MotionSettings } from '../types'

const props = defineProps<{
  open: boolean
  effect: EffectDefinition
  settings: MotionSettings
  paused: boolean
  replayKey: number
}>()

const emit = defineEmits<{
  close: []
  'toggle-play': []
  replay: []
}>()

const controlsVisible = ref(true)
let hideTimer = 0

function scheduleHide() {
  window.clearTimeout(hideTimer)
  if (!props.open) return
  hideTimer = window.setTimeout(() => {
    controlsVisible.value = false
  }, 3200)
}

function revealControls() {
  controlsVisible.value = true
  scheduleHide()
}

watch(
  () => props.open,
  (open) => {
    controlsVisible.value = true
    if (open) scheduleHide()
  },
)

watch(
  () => props.paused,
  () => {
    controlsVisible.value = true
    scheduleHide()
  },
)

onBeforeUnmount(() => window.clearTimeout(hideTimer))
</script>

<template>
  <Teleport to="body">
    <Transition name="demo">
      <div
        v-if="open"
        class="demo-layer"
        :class="{ 'controls-hidden': !controlsVisible, paused }"
        :aria-hidden="!open"
        @pointermove="revealControls"
      >
        <div class="demo-stage" :style="{ '--demo-accent': settings.accent }">
          <component
            :is="effect.component"
            :speed="settings.speed"
            :density="settings.density"
            :intensity="settings.intensity"
            :accent="settings.accent"
            :paused="paused"
            :replay-key="replayKey"
          />
        </div>

        <div class="demo-topbar">
          <div class="demo-brand">
            <span class="demo-brand__mark"><i /></span>
            <div>
              <b>MOTION LAB</b>
              <small>大屏动效实验室</small>
            </div>
          </div>

          <div class="demo-title">
            <span>{{ effect.category }}</span>
            <h1>{{ effect.name }}</h1>
            <small>{{ effect.enName }}</small>
          </div>

          <div class="demo-actions">
            <button type="button" :aria-label="paused ? '播放动画' : '暂停动画'" @click="emit('toggle-play')">
              <svg v-if="paused" viewBox="0 0 16 16" aria-hidden="true"><path class="fill" d="m5.2 3.4 7 4.6-7 4.6V3.4Z" /></svg>
              <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 3.2v9.6M10.7 3.2v9.6" /></svg>
            </button>
            <button type="button" aria-label="重新播放" @click="emit('replay')">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 6.1A5.2 5.2 0 1 1 3.4 11M3.2 6.1V2.8M3.2 6.1h3.3" /></svg>
            </button>
            <button class="demo-close" type="button" @click="emit('close')">
              退出演示
              <kbd>ESC</kbd>
            </button>
          </div>
        </div>

        <div class="demo-hint">
          <span><kbd>SPACE</kbd> 暂停</span>
          <i />
          <span><kbd>R</kbd> 重播</span>
          <i />
          <span><kbd>←</kbd><kbd>→</kbd> 切换</span>
          <i />
          <span class="demo-live"><b /> LIVE 16:9</span>
        </div>

        <div v-if="paused" class="demo-paused">
          <span />
          <p>画面已暂停</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.demo-layer {
  position: fixed;
  z-index: 120;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: default;
  background: #01050a;
}

.demo-stage {
  position: relative;
  width: min(100vw, calc(100vh * 16 / 9));
  height: min(100vh, calc(100vw * 9 / 16));
  overflow: hidden;
  background: #030811;
  box-shadow: 0 0 90px color-mix(in srgb, var(--demo-accent) 13%, transparent);
}

.demo-topbar {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 28px 34px;
  background: linear-gradient(180deg, rgba(1, 5, 10, 0.76), transparent);
  transition: opacity 240ms ease, transform 240ms ease;
}

.controls-hidden .demo-topbar { opacity: 0; transform: translateY(-8px); pointer-events: none; }

.demo-brand { display: flex; align-items: center; gap: 10px; }
.demo-brand__mark { position: relative; display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid color-mix(in srgb, var(--demo-accent) 45%, transparent); transform: rotate(45deg); }
.demo-brand__mark::before { position: absolute; width: 45%; height: 45%; border: 1px solid color-mix(in srgb, var(--demo-accent) 65%, transparent); content: ""; }
.demo-brand__mark i { width: 4px; height: 4px; background: var(--demo-accent); box-shadow: 0 0 10px var(--demo-accent); }
.demo-brand div { display: flex; flex-direction: column; gap: 4px; }
.demo-brand b { font: 600 10px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.2em; color: #e8f8ff; }
.demo-brand small { font-size: 9px; letter-spacing: 0.12em; color: rgba(220, 240, 255, 0.45); }

.demo-title { text-align: center; }
.demo-title span, .demo-title small { display: block; font: 500 8px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.18em; color: color-mix(in srgb, var(--demo-accent) 68%, white 10%); }
.demo-title h1 { margin: 6px 0 5px; font-size: 16px; font-weight: 500; letter-spacing: 0.16em; color: #f0fbff; }
.demo-title small { color: rgba(220, 240, 255, 0.34); }

.demo-actions { display: flex; align-items: center; justify-content: flex-end; gap: 7px; }
.demo-actions > button { display: flex; height: 32px; align-items: center; justify-content: center; gap: 8px; padding: 0 10px; border: 1px solid rgba(132, 164, 190, 0.2); border-radius: 6px; color: rgba(221, 242, 255, 0.7); background: rgba(7, 16, 26, 0.54); font: 500 10px/1 var(--font-cn); cursor: pointer; backdrop-filter: blur(7px); }
.demo-actions > button:hover { border-color: color-mix(in srgb, var(--demo-accent) 42%, transparent); color: #f0fbff; background: rgba(18, 35, 49, 0.7); }
.demo-actions svg { width: 12px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.demo-actions svg .fill { fill: currentColor; stroke: none; }
.demo-close { padding: 0 8px 0 12px !important; }
.demo-close kbd { display: grid; height: 19px; padding: 0 5px; place-items: center; border: 1px solid rgba(130, 163, 190, 0.22); border-radius: 3px; font: 500 7px/1 "JetBrains Mono", Consolas, monospace; color: rgba(222, 242, 255, 0.42); }

.demo-hint {
  position: absolute;
  z-index: 2;
  bottom: 24px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border: 1px solid rgba(111, 145, 173, 0.16);
  border-radius: 6px;
  transform: translateX(-50%);
  background: rgba(4, 11, 18, 0.56);
  color: rgba(211, 234, 250, 0.34);
  font: 500 8px/1 var(--font-cn);
  backdrop-filter: blur(8px);
  transition: opacity 240ms ease, transform 240ms ease;
}

.controls-hidden .demo-hint { opacity: 0; transform: translate(-50%, 6px); pointer-events: none; }
.demo-hint span { display: flex; align-items: center; gap: 4px; }
.demo-hint kbd { min-width: 18px; padding: 3px 4px; border: 1px solid rgba(111, 145, 173, 0.19); border-radius: 3px; font: 500 7px/1 "JetBrains Mono", Consolas, monospace; text-align: center; color: rgba(220, 242, 255, 0.5); }
.demo-hint > i { width: 1px; height: 10px; background: rgba(111, 145, 173, 0.18); }
.demo-live b { width: 4px; height: 4px; border-radius: 50%; background: var(--demo-accent); box-shadow: 0 0 6px var(--demo-accent); }

.demo-paused {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border: 1px solid rgba(116, 151, 180, 0.2);
  border-radius: 5px;
  transform: translate(-50%, -50%);
  background: rgba(4, 10, 17, 0.64);
  color: rgba(224, 242, 255, 0.55);
  font-size: 9px;
  backdrop-filter: blur(7px);
  pointer-events: none;
}
.demo-paused span { width: 5px; height: 5px; border-radius: 50%; background: #d7a46d; }
.demo-paused p { margin: 0; }

.demo-enter-active, .demo-leave-active { transition: opacity 220ms ease; }
.demo-enter-from, .demo-leave-to { opacity: 0; }

@media (max-width: 760px) {
  .demo-topbar { grid-template-columns: 1fr auto; padding: 17px 18px; }
  .demo-title { display: none; }
  .demo-actions > button:not(.demo-close) { display: none; }
  .demo-hint { bottom: 14px; }
  .demo-hint span:nth-of-type(3) { display: none; }
}
</style>

