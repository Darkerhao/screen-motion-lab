<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import CodeDrawer from './components/CodeDrawer.vue'
import DemoOverlay from './components/DemoOverlay.vue'
import InspectorPanel from './components/InspectorPanel.vue'
import LibraryPanel from './components/LibraryPanel.vue'
import { effectCategories, effectDefinitions, swatches } from './effects'
import type { MotionSettings } from './types'

const activeId = ref(effectDefinitions[0].id)
const activeCategory = ref('全部')
const activeEffect = computed(() => effectDefinitions.find((effect) => effect.id === activeId.value) ?? effectDefinitions[0])
const settings = reactive<MotionSettings>({ ...effectDefinitions[0].defaultSettings })
const paused = ref(false)
const replayKey = ref(0)
const codeOpen = ref(false)
const demoOpen = ref(false)
const mobileLibraryOpen = ref(false)
const toast = ref('')
let toastTimer = 0

const visibleEffects = computed(() => activeCategory.value === '全部'
  ? effectDefinitions
  : effectDefinitions.filter((effect) => effect.category === activeCategory.value))

function selectEffect(id: string) {
  const effect = effectDefinitions.find((item) => item.id === id)
  if (!effect) return
  if (activeId.value !== id) {
    activeId.value = id
    Object.assign(settings, effect.defaultSettings)
    paused.value = false
    replayKey.value += 1
  }
  mobileLibraryOpen.value = false
}

function selectCategory(category: string) {
  activeCategory.value = category
  if (category !== '全部' && activeEffect.value.category !== category) {
    const firstEffect = effectDefinitions.find((effect) => effect.category === category)
    if (firstEffect) selectEffect(firstEffect.id)
  }
}

function updateSetting(key: keyof MotionSettings, value: number | string) {
  if (key === 'accent') {
    settings.accent = String(value)
    return
  }
  settings[key] = Number(value)
}

function resetSettings() {
  Object.assign(settings, activeEffect.value.defaultSettings)
  replayKey.value += 1
  showToast('已恢复当前组件的默认参数')
}

function togglePlayback() {
  paused.value = !paused.value
}

function replay() {
  replayKey.value += 1
  paused.value = false
}

function showToast(message: string) {
  toast.value = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

async function copyText(text: string, message: string) {
  let copied = false
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      copied = true
    } catch {
      copied = false
    }
  }

  if (!copied) {
    const input = document.createElement('textarea')
    input.value = text
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    copied = document.execCommand('copy')
    input.remove()
  }

  showToast(copied ? message : '复制失败，请手动选择文本')
}

function copyPath() {
  void copyText(activeEffect.value.componentPath, '组件路径已复制')
}

async function openDemo() {
  demoOpen.value = true
  document.body.classList.add('is-presenting')
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // 浏览器拒绝全屏时，仍保留沉浸式演示层。
    }
  }
}

async function closeDemo() {
  demoOpen.value = false
  document.body.classList.remove('is-presenting')
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch {
      // 全屏状态可能已由浏览器自行退出，无需额外处理。
    }
  }
}

function onFullscreenChange() {
  if (!document.fullscreenElement && demoOpen.value) {
    demoOpen.value = false
    document.body.classList.remove('is-presenting')
  }
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const tagName = target?.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable) return

  if (event.code === 'Escape') {
    if (demoOpen.value) {
      event.preventDefault()
      void closeDemo()
      return
    }
    if (codeOpen.value) {
      event.preventDefault()
      codeOpen.value = false
      return
    }
    if (mobileLibraryOpen.value) mobileLibraryOpen.value = false
    return
  }

  if (event.code === 'Space') {
    event.preventDefault()
    togglePlayback()
    return
  }

  if (event.code === 'KeyR') {
    event.preventDefault()
    replay()
    return
  }

  if (event.code === 'KeyF' && !demoOpen.value) {
    event.preventDefault()
    void openDemo()
    return
  }

  if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
    event.preventDefault()
    const currentIndex = effectDefinitions.findIndex((effect) => effect.id === activeId.value)
    const direction = event.code === 'ArrowRight' ? 1 : -1
    const nextIndex = (currentIndex + direction + effectDefinitions.length) % effectDefinitions.length
    selectEffect(effectDefinitions[nextIndex].id)
    return
  }

  const numberMatch = event.code.match(/^Digit([1-4])$/)
  if (numberMatch) {
    const effect = effectDefinitions[Number(numberMatch[1]) - 1]
    if (effect) selectEffect(effect.id)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.clearTimeout(toastTimer)
  document.body.classList.remove('is-presenting')
})
</script>

<template>
  <div class="app-shell" :style="{ '--ui-accent': settings.accent }">
    <header class="topbar">
      <button class="brand" type="button" @click="selectCategory('全部')">
        <span class="brand-mark">
          <i />
          <b />
        </span>
        <span class="brand-copy">
          <strong>MOTION <em>LAB</em></strong>
          <small>大屏动效实验室</small>
        </span>
      </button>

      <nav class="topnav" aria-label="主导航">
        <button class="active" type="button">组件实验室</button>
        <button type="button" @click="codeOpen = true">接入说明</button>
      </nav>

      <div class="topbar-actions">
        <div class="build-state">
          <span>V0.1</span>
          <i />
          <em>LOCAL LIBRARY</em>
        </div>
        <button class="present-button" type="button" @click="openDemo">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <rect x="2.5" y="3" width="13" height="9.5" rx="1.3" />
            <path d="M6.3 15.2h5.4M9 12.5v2.7" />
          </svg>
          进入演示
          <kbd>F</kbd>
        </button>
      </div>
    </header>

    <main class="workspace">
      <LibraryPanel
        class="library-column"
        :class="{ 'is-open': mobileLibraryOpen }"
        :effects="visibleEffects"
        :categories="effectCategories"
        :active-id="activeId"
        :active-category="activeCategory"
        @select="selectEffect"
        @update-category="selectCategory"
      />

      <button v-if="mobileLibraryOpen" class="mobile-library-backdrop" type="button" aria-label="关闭组件列表" @click="mobileLibraryOpen = false" />

      <section class="lab-column">
        <div class="lab-heading">
          <button class="mobile-library-trigger" type="button" @click="mobileLibraryOpen = true">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" /></svg>
          </button>

          <div class="heading-copy">
            <div class="breadcrumb">
              <span>{{ activeEffect.category }}</span>
              <i>/</i>
              <span>{{ activeEffect.enName }}</span>
            </div>
            <div class="title-line">
              <h1>{{ activeEffect.name }}</h1>
              <span class="active-chip"><i /> ACTIVE</span>
            </div>
            <p>{{ activeEffect.description }}</p>
          </div>

          <div class="heading-actions">
            <button class="soft-button icon-only" type="button" :aria-label="paused ? '播放动画' : '暂停动画'" @click="togglePlayback">
              <svg v-if="paused" viewBox="0 0 16 16" aria-hidden="true"><path class="fill" d="m5.2 3.4 7 4.6-7 4.6V3.4Z" /></svg>
              <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 3.2v9.6M10.7 3.2v9.6" /></svg>
            </button>
            <button class="soft-button icon-only" type="button" aria-label="重新播放" @click="replay">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 6.1A5.2 5.2 0 1 1 3.4 11M3.2 6.1V2.8M3.2 6.1h3.3" /></svg>
            </button>
            <button class="soft-button code-button" type="button" @click="codeOpen = true">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5.6 4.2-3.3 3.8 3.3 3.8M10.4 4.2l3.3 3.8-3.3 3.8" /></svg>
              接入
            </button>
            <button class="demo-button" type="button" @click="openDemo">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.4h6.6V10M5 11l7.6-7.6M3 5.4v7.2h7.2" /></svg>
              全屏演示
            </button>
          </div>
        </div>

        <div class="stage-card" :style="{ '--stage-accent': settings.accent }">
          <div class="stage-toolbar">
            <div class="preview-state"><i /> LIVE PREVIEW</div>
            <div class="stage-specs">
              <span>1920 × 1080</span>
              <i />
              <span>16 : 9</span>
              <i />
              <span>{{ activeEffect.tags[0] }}</span>
            </div>
          </div>

          <div class="stage-viewport">
            <div class="stage-canvas">
              <component
                :is="activeEffect.component"
                :speed="settings.speed"
                :density="settings.density"
                :intensity="settings.intensity"
                :accent="settings.accent"
                :paused="paused || demoOpen"
                :replay-key="replayKey"
              />
            </div>
          </div>

          <div class="stage-footer">
            <div class="render-meta">
              <span>RENDERER <b>{{ activeEffect.tags[0] }}</b></span>
              <i />
              <span>STATUS <b :class="{ paused }">{{ paused ? 'PAUSED' : 'RUNNING' }}</b></span>
              <i />
              <span>DPR <b>自适应</b></span>
            </div>
            <div class="stage-shortcuts">
              <span><kbd>SPACE</kbd> 暂停</span>
              <span><kbd>R</kbd> 重播</span>
              <span><kbd>F</kbd> 演示</span>
            </div>
          </div>
        </div>

        <div class="under-stage">
          <div class="effect-tags">
            <span class="under-stage__label">组件标签</span>
            <span v-for="tag in activeEffect.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="scene-hint">
            <span class="under-stage__label">推荐场景</span>
            <p>{{ activeEffect.scenes.join(' · ') }}</p>
          </div>
        </div>
      </section>

      <InspectorPanel
        class="inspector-column"
        :effect="activeEffect"
        :settings="settings"
        :paused="paused"
        :palette="swatches"
        @update-setting="updateSetting"
        @reset="resetSettings"
        @toggle-play="togglePlayback"
        @replay="replay"
        @copy-path="copyPath"
      />
    </main>

    <CodeDrawer
      :open="codeOpen"
      :effect="activeEffect"
      :settings="settings"
      @close="codeOpen = false"
      @copy="copyText($event, '接入代码已复制')"
    />

    <DemoOverlay
      :open="demoOpen"
      :effect="activeEffect"
      :settings="settings"
      :paused="paused"
      :replay-key="replayKey"
      @close="closeDemo"
      @toggle-play="togglePlayback"
      @replay="replay"
    />

    <Transition name="toast">
      <div v-if="toast" class="toast-message" role="status">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.3 8.2 3 3 6.4-6.4" /></svg>
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 64% -8%, color-mix(in srgb, var(--ui-accent) 7%, transparent), transparent 28%),
    radial-gradient(circle at 10% 100%, rgba(52, 86, 121, 0.07), transparent 32%),
    #070b12;
}

.topbar {
  position: relative;
  z-index: 30;
  display: grid;
  height: 72px;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid rgba(85, 120, 151, 0.15);
  background: rgba(7, 12, 19, 0.78);
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.brand-mark {
  position: relative;
  display: grid;
  width: 33px;
  height: 33px;
  place-items: center;
  border: 1px solid rgba(67, 217, 255, 0.35);
  transform: rotate(45deg);
}

.brand-mark::before {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(67, 217, 255, 0.18);
  content: "";
}

.brand-mark i {
  width: 4px;
  height: 4px;
  background: #5ce4ff;
  box-shadow: 0 0 10px #43d9ff;
}

.brand-mark b {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 7px;
  height: 7px;
  border-top: 1px solid #58ddff;
  border-right: 1px solid #58ddff;
}

.brand-copy { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.brand-copy strong { font: 600 14px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.15em; color: #e7f7ff; }
.brand-copy strong em { font-style: normal; color: #58dcf8; }
.brand-copy small { font-size: 9px; letter-spacing: 0.22em; color: #4d6175; }

.topnav {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  gap: 26px;
}

.topnav button {
  position: relative;
  padding: 0 2px;
  border: 0;
  color: #61778a;
  background: transparent;
  font: 500 11px/1 var(--font-cn);
  cursor: pointer;
}

.topnav button::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  content: "";
  background: #43d9ff;
  box-shadow: 0 0 8px rgba(67, 217, 255, 0.35);
  transform: scaleX(0);
  transition: transform 180ms ease;
}

.topnav button:hover { color: #aac6dc; }
.topnav button.active { color: #d7ecfa; }
.topnav button.active::after { transform: scaleX(1); }

.topbar-actions { display: flex; align-items: center; justify-content: flex-end; gap: 17px; }
.build-state { display: flex; align-items: center; gap: 7px; font: 500 8px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.08em; color: #4f6375; }
.build-state span { padding: 4px 5px; border: 1px solid rgba(85, 121, 153, 0.2); border-radius: 3px; color: #6f8aa0; }
.build-state i { width: 1px; height: 12px; background: rgba(91, 125, 154, 0.18); }
.build-state em { font-style: normal; }

.present-button {
  display: flex;
  height: 33px;
  align-items: center;
  gap: 7px;
  padding: 0 8px 0 11px;
  border: 1px solid rgba(67, 217, 255, 0.23);
  border-radius: 6px;
  color: #9ceeff;
  background: linear-gradient(180deg, rgba(67, 217, 255, 0.105), rgba(67, 217, 255, 0.04));
  font: 500 10px/1 var(--font-cn);
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.present-button:hover { border-color: rgba(67, 217, 255, 0.45); background: rgba(67, 217, 255, 0.12); box-shadow: 0 0 20px rgba(67, 217, 255, 0.07); }
.present-button svg { width: 14px; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
.present-button kbd { display: grid; width: 18px; height: 18px; place-items: center; border: 1px solid rgba(97, 220, 246, 0.2); border-radius: 3px; font: 500 7px/1 "JetBrains Mono", Consolas, monospace; color: #66b9d0; background: rgba(3, 15, 22, 0.3); }

.workspace {
  display: grid;
  height: calc(100vh - 72px);
  grid-template-columns: 236px minmax(0, 1fr) 286px;
  gap: 14px;
  padding: 14px;
  overflow: hidden;
}

.workspace > :deep(.library-column),
.workspace > :deep(.inspector-column) { min-width: 0; }

.lab-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 2px 2px 12px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 113, 144, 0.28) transparent;
}

.lab-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 5px 17px;
}

.mobile-library-trigger { display: none; }
.heading-copy { min-width: 0; }
.breadcrumb { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; font: 500 8px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.11em; color: #4f6579; text-transform: uppercase; }
.breadcrumb span:first-child { color: color-mix(in srgb, var(--ui-accent) 66%, #8195a8); }
.breadcrumb i { font-style: normal; color: #35495b; }

.title-line { display: flex; align-items: center; gap: 11px; }
.title-line h1 { margin: 0; font-size: clamp(22px, 2vw, 28px); font-weight: 600; letter-spacing: 0.05em; color: #eaf6ff; }
.active-chip { display: flex; align-items: center; gap: 5px; padding: 4px 6px; border: 1px solid rgba(72, 218, 242, 0.15); border-radius: 4px; font: 600 7px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.1em; color: #64d5e9; background: rgba(72, 218, 242, 0.045); }
.active-chip i { width: 3px; height: 3px; border-radius: 50%; background: #55e1f5; box-shadow: 0 0 6px #55e1f5; }
.heading-copy > p { max-width: 610px; margin: 8px 0 0; font-size: 11px; line-height: 1.65; color: #62798e; }

.heading-actions { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; padding-top: 15px; }
.soft-button { display: flex; height: 33px; align-items: center; justify-content: center; gap: 6px; padding: 0 10px; border: 1px solid rgba(85, 121, 153, 0.21); border-radius: 6px; color: #8097aa; background: rgba(16, 29, 42, 0.55); font: 500 10px/1 var(--font-cn); cursor: pointer; transition: color 160ms ease, border-color 160ms ease, background 160ms ease; }
.soft-button:hover { color: #c8e1f4; border-color: rgba(98, 144, 181, 0.38); background: rgba(24, 42, 58, 0.68); }
.soft-button svg { width: 13px; fill: none; stroke: currentColor; stroke-width: 1.15; stroke-linecap: round; stroke-linejoin: round; }
.soft-button svg .fill { fill: currentColor; stroke: none; }
.icon-only { width: 33px; padding: 0; }
.code-button { padding: 0 11px; }
.demo-button { display: flex; height: 33px; align-items: center; gap: 7px; padding: 0 13px; border: 1px solid color-mix(in srgb, var(--ui-accent) 32%, transparent); border-radius: 6px; color: color-mix(in srgb, var(--ui-accent) 68%, white 15%); background: color-mix(in srgb, var(--ui-accent) 10%, transparent); font: 500 10px/1 var(--font-cn); cursor: pointer; transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease; }
.demo-button:hover { border-color: color-mix(in srgb, var(--ui-accent) 55%, transparent); background: color-mix(in srgb, var(--ui-accent) 15%, transparent); box-shadow: 0 0 22px color-mix(in srgb, var(--ui-accent) 8%, transparent); }
.demo-button svg { width: 13px; fill: none; stroke: currentColor; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }

.stage-card {
  display: flex;
  flex-direction: column;
  padding: 0 11px 10px;
  border: 1px solid rgba(80, 115, 146, 0.18);
  border-radius: 11px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--stage-accent) 4%, transparent), transparent 30%),
    rgba(9, 17, 27, 0.66);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(148, 188, 220, 0.025);
}

.stage-toolbar { display: flex; height: 38px; align-items: center; justify-content: space-between; padding: 0 3px; }
.preview-state { display: flex; align-items: center; gap: 6px; font: 600 8px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.13em; color: #5f778c; }
.preview-state i { width: 4px; height: 4px; border-radius: 50%; background: #52dfef; box-shadow: 0 0 7px #52dfef; animation: live-pulse 2s ease-in-out infinite; }
.stage-specs { display: flex; align-items: center; gap: 7px; font: 500 7px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.06em; color: #43586a; }
.stage-specs i { width: 1px; height: 8px; background: rgba(94, 128, 158, 0.17); }

.stage-viewport { padding: 1px; border: 1px solid rgba(100, 136, 166, 0.16); border-radius: 7px; background: #030811; }
.stage-canvas { position: relative; width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 6px; background: #030811; }
.stage-canvas > :deep(*) { width: 100%; height: 100%; }

.stage-footer { display: flex; min-height: 36px; align-items: center; justify-content: space-between; padding: 0 3px; }
.render-meta { display: flex; align-items: center; gap: 8px; font: 500 7px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.07em; color: #415568; }
.render-meta b { margin-left: 3px; font-weight: 500; color: #6a8499; }
.render-meta b.paused { color: #a17d5d; }
.render-meta i { width: 1px; height: 8px; background: rgba(92, 126, 156, 0.15); }
.stage-shortcuts { display: flex; align-items: center; gap: 10px; font-size: 8px; color: #3f5365; }
.stage-shortcuts span { display: flex; align-items: center; gap: 4px; }
.stage-shortcuts kbd { padding: 3px 4px; border: 1px solid rgba(92, 126, 156, 0.17); border-radius: 3px; font: 500 6px/1 "JetBrains Mono", Consolas, monospace; color: #5c7487; background: rgba(19, 32, 45, 0.5); }

.under-stage { display: flex; align-items: center; justify-content: space-between; gap: 22px; padding: 14px 4px 0; }
.under-stage__label { display: block; margin-bottom: 6px; font: 600 8px/1 "JetBrains Mono", Consolas, monospace; letter-spacing: 0.08em; color: #405467; }
.effect-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
.effect-tags .under-stage__label { width: 100%; }
.effect-tags > span:not(.under-stage__label) { padding: 4px 7px; border: 1px solid rgba(86, 121, 151, 0.16); border-radius: 4px; font-size: 8px; color: #60778b; background: rgba(17, 30, 43, 0.45); }
.scene-hint { text-align: right; }
.scene-hint p { margin: 0; font-size: 9px; color: #5a7084; }

.mobile-library-backdrop { display: none; }

.toast-message {
  position: fixed;
  z-index: 150;
  bottom: 26px;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border: 1px solid rgba(86, 214, 237, 0.24);
  border-radius: 7px;
  transform: translateX(-50%);
  color: #c8f2fa;
  background: rgba(7, 20, 29, 0.92);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.38), 0 0 25px rgba(67, 217, 255, 0.06);
  font-size: 10px;
  backdrop-filter: blur(12px);
}
.toast-message svg { width: 13px; fill: none; stroke: #5adedd; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.toast-enter-active, .toast-leave-active { transition: opacity 180ms ease, transform 180ms ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 7px); }

@keyframes live-pulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
}

@media (max-width: 1240px) {
  .workspace { grid-template-columns: 216px minmax(0, 1fr) 268px; gap: 11px; padding: 11px; }
  .topbar { padding: 0 18px; }
  .build-state { display: none; }
  .heading-actions { gap: 5px; }
  .soft-button.icon-only { display: none; }
}

@media (max-width: 1040px) {
  .workspace { grid-template-columns: minmax(0, 1fr) 268px; }
  .topnav { display: none; }
  .topbar { grid-template-columns: 1fr 1fr; }
  .library-column {
    position: fixed;
    z-index: 45;
    top: 82px;
    bottom: 12px;
    left: 12px;
    width: 250px;
    transform: translateX(-110%);
    background: rgba(8, 17, 27, 0.97);
    box-shadow: 30px 0 70px rgba(0, 0, 0, 0.38);
    transition: transform 230ms ease;
  }
  .library-column.is-open { transform: translateX(0); }
  .mobile-library-trigger {
    display: grid;
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    margin-top: 18px;
    place-items: center;
    border: 1px solid rgba(86, 122, 153, 0.2);
    border-radius: 6px;
    color: #7790a4;
    background: rgba(16, 29, 42, 0.55);
    cursor: pointer;
  }
  .mobile-library-trigger svg { width: 14px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; }
  .mobile-library-backdrop { position: fixed; z-index: 44; inset: 72px 0 0; display: block; border: 0; background: rgba(2, 7, 12, 0.55); backdrop-filter: blur(2px); }
}

@media (max-width: 820px) {
  .workspace { display: block; height: auto; overflow: visible; }
  .inspector-column { display: none !important; }
  .lab-column { overflow: visible; }
  .topbar { height: 64px; padding: 0 14px; }
  .brand-copy small { display: none; }
  .present-button { padding: 0 9px; }
  .present-button kbd { display: none; }
  .lab-heading { padding-top: 10px; }
  .heading-actions .code-button { display: none; }
  .heading-copy > p { max-width: 100%; }
  .title-line h1 { font-size: 22px; }
  .stage-specs span:nth-of-type(2), .stage-specs i:nth-of-type(2) { display: none; }
  .stage-footer { align-items: flex-start; flex-direction: column; gap: 8px; padding: 10px 3px 3px; }
  .stage-shortcuts { display: none; }
  .under-stage { align-items: flex-start; flex-direction: column; gap: 10px; }
  .scene-hint { text-align: left; }
}

@media (max-width: 520px) {
  .present-button { font-size: 0; }
  .present-button svg { width: 15px; }
  .heading-actions { gap: 4px; }
  .soft-button.code-button { display: none; }
  .demo-button { padding: 0 10px; }
  .demo-button svg { width: 14px; }
}
</style>

