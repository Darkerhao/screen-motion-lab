<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EffectDefinition } from '../effects'
import type { MotionSettings } from '../types'

const props = defineProps<{
  open: boolean
  effect: EffectDefinition
  settings: MotionSettings
}>()

const emit = defineEmits<{
  close: []
  copy: [text: string]
}>()

const activeTab = ref<'code' | 'params'>('code')

const componentName = computed(() => props.effect.componentPath.split('/').pop()?.replace('.vue', '') ?? 'MotionEffect')
const code = computed(() => [
  '<script setup lang="ts">',
  `import ${componentName.value} from '@/components/effects/${componentName.value}.vue'`,
  '',
  'const motion = {',
  `  speed: ${props.settings.speed.toFixed(2)},`,
  `  density: ${Math.round(props.settings.density)},`,
  `  intensity: ${props.settings.intensity.toFixed(2)},`,
  `  accent: '${props.settings.accent}',`,
  '}',
  '</' + 'script>',
  '',
  '<template>',
  `  <${componentName.value}`,
  '    v-bind="motion"',
  '    :paused="false"',
  '    :replay-key="0"',
  '    class="screen-motion"',
  '  />',
  '</template>',
  '',
  '<style scoped>',
  '.screen-motion {',
  '  position: absolute;',
  '  inset: 0;',
  '  width: 100%;',
  '  height: 100%;',
  '}',
  '</style>',
].join('\n'))

const codeLines = computed(() => code.value.split('\n'))

function copyCode() {
  emit('copy', code.value)
}
</script>

<template>
  <div class="drawer-layer" :class="{ open }" :aria-hidden="!open">
    <button class="drawer-backdrop" type="button" aria-label="关闭接入说明" @click="emit('close')" />
    <aside class="code-drawer" role="dialog" aria-modal="true" aria-label="组件接入说明">
      <header class="drawer-header">
        <div>
          <span class="eyebrow">INTEGRATION GUIDE</span>
          <h2>组件接入</h2>
        </div>
        <button class="drawer-close" type="button" aria-label="关闭" @click="emit('close')">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
        </button>
      </header>

      <div class="drawer-tabs" role="tablist" aria-label="接入内容">
        <button :class="{ active: activeTab === 'code' }" type="button" role="tab" :aria-selected="activeTab === 'code'" @click="activeTab = 'code'">Vue 用法</button>
        <button :class="{ active: activeTab === 'params' }" type="button" role="tab" :aria-selected="activeTab === 'params'" @click="activeTab = 'params'">参数说明</button>
      </div>

      <div class="drawer-body">
        <template v-if="activeTab === 'code'">
          <div class="effect-summary">
            <span class="effect-summary__dot" :style="{ background: settings.accent, boxShadow: `0 0 10px ${settings.accent}` }" />
            <div>
              <b>{{ effect.name }}</b>
              <small>{{ effect.enName }} · {{ effect.category }}</small>
            </div>
          </div>

          <div class="step-note">
            <span>01</span>
            <p>将 <code>{{ effect.componentPath }}</code> 复制到业务项目的组件目录。</p>
          </div>
          <div class="step-note">
            <span>02</span>
            <p>把组件放进固定比例或全屏容器中，通过参数控制视觉表现。</p>
          </div>

          <div class="code-heading">
            <span>当前参数接入代码</span>
            <button type="button" @click="copyCode">
              <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.1" y="5.1" width="7.4" height="7.4" rx="1.2" /><path d="M10.8 5.1V3.5H3.5v7.3h1.6" /></svg>
              复制代码
            </button>
          </div>

          <div class="code-block">
            <div class="code-block__bar">
              <span><i class="red" /><i class="yellow" /><i class="green" /></span>
              <b>{{ componentName }}.vue</b>
              <em>VUE 3</em>
            </div>
            <pre><code><span v-for="(line, index) in codeLines" :key="`${index}-${line}`" class="code-line"><i>{{ String(index + 1).padStart(2, '0') }}</i><span>{{ line || ' ' }}</span></span></code></pre>
          </div>

          <div class="usage-note">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 14 5v6L8 14.2 2 11V5l6-3.2Zm0 3.3v4M8 11.5v.2" /></svg>
            <p>推荐容器保持 16:9；如需全屏展示，请使用同比例舞台适配，不要让 Canvas 在非等比容器中拉伸。</p>
          </div>
        </template>

        <template v-else>
          <div class="param-current">
            <div>
              <span>当前主题</span>
              <b>{{ settings.accent.toUpperCase() }}</b>
            </div>
            <i :style="{ background: settings.accent, boxShadow: `0 0 16px ${settings.accent}` }" />
          </div>

          <div class="param-table">
            <div class="param-row param-row--head">
              <span>参数</span><span>范围</span><span>当前值</span>
            </div>
            <div class="param-row">
              <span><b>speed</b><small>动画速度</small></span><span>0.30 – 2.00</span><span>{{ settings.speed.toFixed(2) }}×</span>
            </div>
            <div class="param-row">
              <span><b>density</b><small>粒子密度</small></span><span>30 – 120</span><span>{{ Math.round(settings.density) }}%</span>
            </div>
            <div class="param-row">
              <span><b>intensity</b><small>光效强度</small></span><span>0.30 – 1.20</span><span>{{ Math.round(settings.intensity * 100) }}%</span>
            </div>
            <div class="param-row">
              <span><b>accent</b><small>主题颜色</small></span><span>HEX</span><span>{{ settings.accent }}</span>
            </div>
            <div class="param-row">
              <span><b>paused</b><small>暂停状态</small></span><span>Boolean</span><span>false</span>
            </div>
          </div>

          <div class="convention-block">
            <h3>组件使用约束</h3>
            <ul>
              <li>组件填满父容器，不依赖外部数据与接口。</li>
              <li>播放状态由 <code>paused</code> 控制，不额外维护内部多套状态。</li>
              <li>通过 <code>replayKey</code> 触发重新播放，适合演示前重置画面。</li>
              <li>组件内部自行处理 DPR 与尺寸变化，父级只需提供稳定容器。</li>
            </ul>
          </div>

          <div class="usage-note">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 14 5v6L8 14.2 2 11V5l6-3.2Zm0 3.3v4M8 11.5v.2" /></svg>
            <p>参数只负责视觉表现，业务数据尽量放在组件外部的业务容器中，继续保持组件可复用。</p>
          </div>
        </template>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.drawer-layer {
  position: fixed;
  z-index: 80;
  inset: 0;
  pointer-events: none;
}

.drawer-layer.open { pointer-events: auto; }

.drawer-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgba(2, 7, 13, 0.62);
  opacity: 0;
  cursor: default;
  backdrop-filter: blur(3px);
  transition: opacity 220ms ease;
}

.drawer-layer.open .drawer-backdrop { opacity: 1; }

.code-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: min(500px, 92vw);
  flex-direction: column;
  border-left: 1px solid rgba(79, 116, 149, 0.24);
  background:
    radial-gradient(circle at 100% 0%, rgba(67, 217, 255, 0.06), transparent 35%),
    #080f18;
  box-shadow: -25px 0 70px rgba(0, 0, 0, 0.4);
  transform: translateX(102%);
  transition: transform 260ms cubic-bezier(0.22, 0.8, 0.25, 1);
}

.drawer-layer.open .code-drawer { transform: translateX(0); }

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 17px;
  border-bottom: 1px solid rgba(84, 119, 150, 0.14);
}

.eyebrow { display: block; font: 600 9px/1.2 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.18em; color: #516579; }
.drawer-header h2 { margin: 7px 0 0; font-size: 20px; font-weight: 600; letter-spacing: 0.06em; color: #e9f4ff; }

.drawer-close {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid rgba(89, 125, 156, 0.2);
  border-radius: 7px;
  color: #71869a;
  background: rgba(19, 34, 48, 0.55);
  cursor: pointer;
}

.drawer-close:hover { color: #cae6f8; border-color: rgba(101, 151, 189, 0.4); }
.drawer-close svg { width: 13px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; }

.drawer-tabs {
  display: flex;
  gap: 4px;
  padding: 11px 24px 0;
  border-bottom: 1px solid rgba(84, 119, 150, 0.14);
}

.drawer-tabs button {
  position: relative;
  padding: 9px 10px 11px;
  border: 0;
  color: #62798e;
  background: transparent;
  font: 500 11px/1 var(--font-cn);
  cursor: pointer;
}

.drawer-tabs button::after {
  position: absolute;
  right: 9px;
  bottom: -1px;
  left: 9px;
  height: 1px;
  content: "";
  background: #43d9ff;
  transform: scaleX(0);
  transition: transform 160ms ease;
}

.drawer-tabs button.active { color: #cfe9f8; }
.drawer-tabs button.active::after { transform: scaleX(1); }

.drawer-body {
  flex: 1;
  padding: 21px 24px 28px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(82, 119, 151, 0.28) transparent;
}

.effect-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 11px 12px;
  border: 1px solid rgba(76, 111, 142, 0.19);
  border-radius: 8px;
  background: rgba(16, 30, 44, 0.54);
}

.effect-summary__dot { width: 6px; height: 6px; border-radius: 50%; }
.effect-summary div { display: flex; flex-direction: column; gap: 4px; }
.effect-summary b { font-size: 12px; font-weight: 500; color: #dcecf9; }
.effect-summary small { font: 500 8px/1 "JetBrains Mono", Consolas, monospace; color: #566b7f; }

.step-note { display: flex; gap: 10px; margin-bottom: 11px; }
.step-note > span { display: grid; width: 21px; height: 21px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(67, 217, 255, 0.19); border-radius: 5px; font: 500 8px/1 "JetBrains Mono", Consolas, monospace; color: #5bd6ee; background: rgba(67, 217, 255, 0.055); }
.step-note p { margin: 1px 0 0; font-size: 10px; line-height: 1.7; color: #6e859a; }
.step-note code { color: #8fb2cc; font: 400 9px/1.4 "JetBrains Mono", Consolas, monospace; }

.code-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 23px 0 9px;
  font-size: 10px;
  color: #748a9e;
}

.code-heading button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 7px;
  border: 1px solid rgba(67, 217, 255, 0.17);
  border-radius: 5px;
  color: #70dfeb;
  background: rgba(67, 217, 255, 0.05);
  font: 500 9px/1 var(--font-cn);
  cursor: pointer;
}

.code-heading button:hover { border-color: rgba(67, 217, 255, 0.35); background: rgba(67, 217, 255, 0.09); }
.code-heading button svg { width: 11px; fill: none; stroke: currentColor; stroke-width: 1.1; }

.code-block {
  overflow: hidden;
  border: 1px solid rgba(73, 107, 138, 0.22);
  border-radius: 8px;
  background: #060c14;
}

.code-block__bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 11px; border-bottom: 1px solid rgba(74, 107, 136, 0.16); background: rgba(19, 32, 45, 0.5); }
.code-block__bar span { display: flex; gap: 4px; }
.code-block__bar i { width: 5px; height: 5px; border-radius: 50%; background: #54677a; }
.code-block__bar i.red { background: #d4776d; }
.code-block__bar i.yellow { background: #c6a26d; }
.code-block__bar i.green { background: #67af8b; }
.code-block__bar b { font: 500 8px/1 "JetBrains Mono", Consolas, monospace; color: #6c8295; }
.code-block__bar em { font: 500 7px/1 "JetBrains Mono", Consolas, monospace; font-style: normal; letter-spacing: 0.1em; color: #405569; }

.code-block pre { max-height: 365px; margin: 0; padding: 10px 0; overflow: auto; scrollbar-width: thin; scrollbar-color: rgba(74, 112, 148, 0.3) transparent; }
.code-block code { display: block; font: 400 10px/1.75 "JetBrains Mono", Consolas, monospace; color: #9bb6cc; }
.code-line { display: flex; min-width: max-content; padding-right: 15px; }
.code-line > i { width: 31px; flex: 0 0 auto; padding-right: 9px; color: #3d5265; font-style: normal; text-align: right; user-select: none; }
.code-line > span { white-space: pre; }
.code-line:nth-child(2) > span, .code-line:nth-child(7) > span { color: #78d8e8; }
.code-line:nth-child(10) > span, .code-line:nth-child(13) > span, .code-line:nth-child(15) > span { color: #b6a6eb; }

.usage-note { display: flex; gap: 9px; margin-top: 16px; padding: 11px 12px; border: 1px solid rgba(89, 125, 155, 0.15); border-radius: 7px; background: rgba(15, 27, 40, 0.48); }
.usage-note svg { width: 13px; height: 13px; flex: 0 0 auto; margin-top: 1px; fill: none; stroke: #5c7d94; stroke-width: 1.1; stroke-linejoin: round; }
.usage-note p { margin: 0; font-size: 9px; line-height: 1.75; color: #60788d; }

.param-current { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; border: 1px solid rgba(82, 117, 148, 0.19); border-radius: 8px; background: rgba(15, 28, 41, 0.54); }
.param-current div { display: flex; flex-direction: column; gap: 5px; }
.param-current span { font-size: 9px; color: #60778c; }
.param-current b { font: 500 11px/1 "JetBrains Mono", Consolas, monospace; color: #c3daeb; }
.param-current > i { width: 10px; height: 10px; border-radius: 50%; }

.param-table { overflow: hidden; border: 1px solid rgba(77, 112, 143, 0.18); border-radius: 7px; }
.param-row { display: grid; grid-template-columns: 1.2fr 1fr 0.7fr; gap: 8px; align-items: center; min-height: 45px; padding: 0 11px; border-top: 1px solid rgba(77, 112, 143, 0.12); font: 400 9px/1.3 "JetBrains Mono", Consolas, monospace; color: #728ca1; }
.param-row:first-child { border-top: 0; }
.param-row--head { min-height: 28px; font-size: 8px; color: #475e72; background: rgba(23, 39, 53, 0.4); }
.param-row > span:first-child { display: flex; flex-direction: column; gap: 4px; }
.param-row b { font-weight: 500; color: #9ab4c8; }
.param-row small { font: 400 8px/1.2 var(--font-cn); color: #4d6376; }
.param-row > span:last-child { text-align: right; color: #81c7d8; }

.convention-block { margin-top: 22px; }
.convention-block h3 { margin: 0 0 10px; font-size: 11px; font-weight: 500; color: #8197aa; }
.convention-block ul { display: flex; flex-direction: column; gap: 9px; margin: 0; padding: 0; list-style: none; }
.convention-block li { position: relative; padding-left: 13px; font-size: 9px; line-height: 1.7; color: #60778b; }
.convention-block li::before { position: absolute; top: 0.62em; left: 0; width: 3px; height: 3px; border-radius: 50%; content: ""; background: #43d9ff; opacity: 0.7; }
.convention-block code { color: #8caec6; font-family: "JetBrains Mono", Consolas, monospace; }
</style>

