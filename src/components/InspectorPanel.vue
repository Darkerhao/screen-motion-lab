<script setup lang="ts">
import type { EffectDefinition, swatches } from '../effects'
import type { MotionSettings } from '../types'

defineProps<{
  effect: EffectDefinition
  settings: MotionSettings
  paused: boolean
  palette: typeof swatches
}>()

const emit = defineEmits<{
  'update-setting': [key: keyof MotionSettings, value: number | string]
  reset: []
  'toggle-play': []
  replay: []
  'copy-path': []
}>()

function updateNumber(key: 'speed' | 'density' | 'intensity', event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  emit('update-setting', key, value)
}

function progress(value: number, min: number, max: number) {
  return `${((value - min) / (max - min)) * 100}%`
}
</script>

<template>
  <aside class="inspector-panel panel" :style="{ '--accent-color': settings.accent }">
    <div class="inspector-heading">
      <div>
        <span class="eyebrow">LIVE CONTROLS</span>
        <h2>实时调参</h2>
      </div>
      <button class="text-button" type="button" @click="emit('reset')">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.1 6.2A5.2 5.2 0 1 1 3.4 11M3.1 6.2V2.8M3.1 6.2h3.4" />
        </svg>
        重置
      </button>
    </div>

    <div class="active-effect">
      <span class="active-effect__dot" :style="{ background: settings.accent, boxShadow: `0 0 10px ${settings.accent}` }" />
      <div>
        <b>{{ effect.name }}</b>
        <small>{{ effect.enName }}</small>
      </div>
      <span class="active-effect__state" :class="{ paused }">{{ paused ? 'PAUSED' : 'RUNNING' }}</span>
    </div>

    <div class="control-group">
      <div class="control-label">
        <span>动画速度</span>
        <b>{{ settings.speed.toFixed(2) }}<i>×</i></b>
      </div>
      <input
        class="range-input"
        type="range"
        min="0.3"
        max="2"
        step="0.05"
        :value="settings.speed"
        :style="{ '--range-progress': progress(settings.speed, 0.3, 2), '--range-color': settings.accent }"
        aria-label="动画速度"
        @input="updateNumber('speed', $event)"
      />
      <div class="range-meta"><span>0.3×</span><span>2.0×</span></div>
    </div>

    <div class="control-group">
      <div class="control-label">
        <span>粒子密度</span>
        <b>{{ Math.round(settings.density) }}<i>%</i></b>
      </div>
      <input
        class="range-input"
        type="range"
        min="30"
        max="120"
        step="1"
        :value="settings.density"
        :style="{ '--range-progress': progress(settings.density, 30, 120), '--range-color': settings.accent }"
        aria-label="粒子密度"
        @input="updateNumber('density', $event)"
      />
      <div class="range-meta"><span>轻量</span><span>密集</span></div>
    </div>

    <div class="control-group">
      <div class="control-label">
        <span>光效强度</span>
        <b>{{ Math.round(settings.intensity * 100) }}<i>%</i></b>
      </div>
      <input
        class="range-input"
        type="range"
        min="0.3"
        max="1.2"
        step="0.01"
        :value="settings.intensity"
        :style="{ '--range-progress': progress(settings.intensity, 0.3, 1.2), '--range-color': settings.accent }"
        aria-label="光效强度"
        @input="updateNumber('intensity', $event)"
      />
      <div class="range-meta"><span>克制</span><span>强烈</span></div>
    </div>

    <div class="control-group control-group--palette">
      <div class="control-label">
        <span>主题色</span>
        <b>{{ settings.accent.toUpperCase() }}</b>
      </div>
      <div class="swatch-row">
        <button
          v-for="swatch in palette"
          :key="swatch.value"
          class="swatch-button"
          :class="{ active: settings.accent === swatch.value }"
          :style="{ '--swatch-color': swatch.value }"
          type="button"
          :title="swatch.name"
          :aria-label="`切换主题色：${swatch.name}`"
          :aria-pressed="settings.accent === swatch.value"
          @click="emit('update-setting', 'accent', swatch.value)"
        >
          <i />
        </button>
      </div>
    </div>

    <div class="playback-row">
      <button class="icon-action icon-action--primary" type="button" :aria-label="paused ? '播放动画' : '暂停动画'" @click="emit('toggle-play')">
        <svg v-if="paused" viewBox="0 0 16 16" aria-hidden="true"><path class="fill" d="m5.2 3.4 7 4.6-7 4.6V3.4Z" /></svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 3.2v9.6M10.7 3.2v9.6" /></svg>
      </button>
      <button class="icon-action" type="button" aria-label="重新播放" @click="emit('replay')">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 6.1A5.2 5.2 0 1 1 3.4 11M3.2 6.1V2.8M3.2 6.1h3.3" /></svg>
      </button>
      <span>{{ paused ? '动画已暂停' : '实时渲染中' }}</span>
      <i class="render-dot" :class="{ paused }" />
    </div>

    <div class="inspector-section">
      <div class="section-title">
        <span>组件信息</span>
        <button class="copy-path" type="button" @click="emit('copy-path')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.1" y="5.1" width="7.4" height="7.4" rx="1.2" /><path d="M10.8 5.1V3.5H3.5v7.3h1.6" /></svg>
          复制路径
        </button>
      </div>
      <code class="component-path">{{ effect.componentPath }}</code>
      <div class="tag-row">
        <span v-for="tag in effect.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="inspector-section">
      <div class="section-title"><span>适用场景</span></div>
      <ul class="scene-list">
        <li v-for="scene in effect.scenes" :key="scene">
          <i />
          {{ scene }}
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.inspector-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  padding: 18px 16px 15px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(82, 118, 151, 0.3) transparent;
}

.inspector-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.eyebrow {
  display: block;
  font: 600 9px/1.2 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.17em;
  color: #536478;
}

.inspector-heading h2 {
  margin: 7px 0 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #e8f3ff;
}

.text-button {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  padding: 5px 7px;
  border: 0;
  border-radius: 5px;
  color: #657b90;
  background: transparent;
  font: 500 10px/1 var(--font-cn);
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease;
}

.text-button:hover { color: #a9c7e2; background: rgba(50, 80, 106, 0.22); }
.text-button svg { width: 12px; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }

.active-effect {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 18px 0 19px;
  padding: 10px 11px;
  border: 1px solid rgba(72, 107, 139, 0.2);
  border-radius: 8px;
  background: rgba(14, 29, 43, 0.58);
}

.active-effect__dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.active-effect div { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
.active-effect b { font-size: 12px; font-weight: 500; color: #dcecf9; }
.active-effect small { overflow: hidden; font: 500 8px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.06em; color: #566b7f; white-space: nowrap; text-overflow: ellipsis; }

.active-effect__state {
  margin-left: auto;
  font: 600 8px/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.11em;
  color: #56d8f1;
}
.active-effect__state.paused { color: #d29c68; }

.control-group { margin-bottom: 19px; }
.control-group--palette { margin-bottom: 20px; }

.control-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 9px;
}

.control-label span { font-size: 11px; color: #71879c; }
.control-label b { font: 500 12px/1 "JetBrains Mono", Consolas, monospace; color: #c0d6e9; letter-spacing: 0.01em; }
.control-label b i { margin-left: 2px; font-style: normal; font-size: 9px; color: #62788c; }

.range-input {
  width: 100%;
  height: 16px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.range-input::-webkit-slider-runnable-track {
  width: 100%;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--range-color) 0 var(--range-progress), rgba(79, 105, 129, 0.24) var(--range-progress) 100%);
}

.range-input::-moz-range-track {
  width: 100%;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--range-color) 0 var(--range-progress), rgba(79, 105, 129, 0.24) var(--range-progress) 100%);
}

.range-input::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  margin-top: -4.5px;
  appearance: none;
  border: 2px solid #0a121d;
  border-radius: 50%;
  background: var(--range-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--range-color) 45%, transparent), 0 0 9px color-mix(in srgb, var(--range-color) 35%, transparent);
}

.range-input::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border: 2px solid #0a121d;
  border-radius: 50%;
  background: var(--range-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--range-color) 45%, transparent), 0 0 9px color-mix(in srgb, var(--range-color) 35%, transparent);
}

.range-meta { display: flex; justify-content: space-between; margin-top: 1px; font-size: 8px; color: #42566a; }

.swatch-row { display: flex; gap: 9px; }

.swatch-button {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: border-color 160ms ease, transform 160ms ease;
}

.swatch-button i {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--swatch-color);
  box-shadow: 0 0 8px color-mix(in srgb, var(--swatch-color) 45%, transparent);
}

.swatch-button:hover { transform: translateY(-1px); }
.swatch-button.active { border-color: color-mix(in srgb, var(--swatch-color) 65%, transparent); }

.playback-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 0 2px 16px;
  border-bottom: 1px solid rgba(89, 123, 153, 0.13);
}

.icon-action {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(91, 126, 156, 0.22);
  border-radius: 6px;
  color: #859db2;
  background: rgba(17, 31, 45, 0.5);
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}

.icon-action:hover { color: #d9efff; border-color: rgba(103, 152, 190, 0.42); background: rgba(27, 47, 65, 0.62); }
.icon-action--primary { color: #82e8fa; border-color: rgba(67, 217, 255, 0.24); background: rgba(67, 217, 255, 0.07); }
.icon-action svg { width: 12px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.icon-action svg .fill { fill: currentColor; stroke: none; }
.playback-row span { margin-left: 2px; font-size: 9px; color: #5a7085; }
.render-dot { width: 4px; height: 4px; margin-left: auto; border-radius: 50%; background: #59def1; box-shadow: 0 0 7px #59def1; }
.render-dot.paused { background: #a17a59; box-shadow: none; }

.inspector-section { padding-top: 15px; }
.section-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; font-size: 10px; color: #6f8599; }
.copy-path { display: flex; align-items: center; gap: 3px; padding: 0; border: 0; color: #557087; background: none; font: 500 9px/1 var(--font-cn); cursor: pointer; }
.copy-path:hover { color: #8fcbe1; }
.copy-path svg { width: 11px; fill: none; stroke: currentColor; stroke-width: 1.1; }

.component-path {
  display: block;
  overflow: hidden;
  padding: 7px 8px;
  border: 1px solid rgba(83, 116, 146, 0.16);
  border-radius: 5px;
  color: #6d8ba4;
  background: rgba(8, 18, 29, 0.6);
  font: 400 8px/1.35 "JetBrains Mono", Consolas, monospace;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tag-row { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.tag-row span { padding: 4px 6px; border: 1px solid rgba(88, 123, 153, 0.18); border-radius: 4px; color: #607b91; background: rgba(26, 44, 60, 0.35); font: 500 8px/1 var(--font-cn); }

.scene-list { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.scene-list li { display: flex; align-items: center; gap: 7px; font-size: 9px; color: #60788e; }
.scene-list li i { width: 3px; height: 3px; border-radius: 50%; background: var(--accent-color); opacity: 0.7; }
</style>



