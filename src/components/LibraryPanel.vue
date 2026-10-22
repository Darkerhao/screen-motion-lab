<script setup lang="ts">
import EffectThumbnail from './EffectThumbnail.vue'
import type { EffectDefinition } from '../effects'

defineProps<{
  effects: EffectDefinition[]
  categories: string[]
  activeId: string
  activeCategory: string
}>()

const emit = defineEmits<{
  select: [id: string]
  'update-category': [category: string]
}>()
</script>

<template>
  <aside class="library-panel panel">
    <div class="panel-heading">
      <div>
        <span class="eyebrow">COMPONENT LIBRARY</span>
        <h2>特效组件</h2>
      </div>
      <span class="count-badge">{{ effects.length.toString().padStart(2, '0') }}</span>
    </div>

    <div class="category-row" role="tablist" aria-label="特效分类">
      <button
        v-for="category in categories"
        :key="category"
        class="category-chip"
        :class="{ active: activeCategory === category }"
        type="button"
        role="tab"
        :aria-selected="activeCategory === category"
        @click="emit('update-category', category)"
      >
        {{ category }}
      </button>
    </div>

    <div class="effect-list">
      <button
        v-for="(effect, index) in effects"
        :key="effect.id"
        class="effect-card"
        :class="{ active: activeId === effect.id }"
        :style="{ '--card-accent': effect.defaultSettings.accent }"
        type="button"
        @click="emit('select', effect.id)"
      >
        <EffectThumbnail :effect="effect" />
        <span class="effect-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="effect-card__copy">
          <b>{{ effect.name }}</b>
          <small>{{ effect.enName }}</small>
        </span>
        <span class="effect-card__arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
          </svg>
        </span>
      </button>
    </div>

    <div class="library-note">
      <span class="library-note__icon">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2.2v7.2M8 12.4v.5M2.2 8a5.8 5.8 0 1 1 11.6 0A5.8 5.8 0 0 1 2.2 8Z" />
        </svg>
      </span>
      <p>所有组件继续保持独立，可按业务需要直接嵌入大屏模块。</p>
    </div>

    <div class="shortcut-note">
      <span>快捷键</span>
      <kbd>1</kbd><i>—</i><kbd>4</kbd>
      <span>切换组件</span>
    </div>
  </aside>
</template>

<style scoped>
.library-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 18px 14px 14px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 4px 14px;
}

.eyebrow {
  display: block;
  font: 600 9px/1.2 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.18em;
  color: #536478;
}

.panel-heading h2 {
  margin: 7px 0 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #e8f3ff;
}

.count-badge {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border: 1px solid rgba(74, 112, 146, 0.34);
  border-radius: 8px;
  font: 500 10px/1 "JetBrains Mono", Consolas, monospace;
  color: #7d9ab5;
  background: rgba(17, 31, 46, 0.6);
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 0 3px 14px;
  border-bottom: 1px solid rgba(93, 128, 160, 0.12);
}

.category-chip {
  padding: 5px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #6f8499;
  background: transparent;
  font: 500 10px/1 var(--font-cn);
  cursor: pointer;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease;
}

.category-chip:hover {
  color: #c2dcf5;
  background: rgba(45, 74, 100, 0.24);
}

.category-chip.active {
  border-color: rgba(67, 217, 255, 0.2);
  color: #69e6ff;
  background: rgba(67, 217, 255, 0.08);
}

.effect-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-height: 0;
  padding: 15px 2px 12px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(80, 120, 155, 0.35) transparent;
}

.effect-card {
  position: relative;
  display: grid;
  grid-template-columns: 56px 1fr 20px;
  gap: 11px;
  align-items: center;
  padding: 7px;
  border: 1px solid transparent;
  border-radius: 9px;
  text-align: left;
  background: transparent;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
}

.effect-card:hover {
  border-color: rgba(72, 104, 134, 0.28);
  background: rgba(23, 38, 53, 0.45);
}

.effect-card.active {
  border-color: color-mix(in srgb, var(--card-accent) 32%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--card-accent) 9%, transparent), transparent 80%),
    rgba(18, 33, 48, 0.65);
  box-shadow: inset 2px 0 0 color-mix(in srgb, var(--card-accent) 75%, transparent);
}

.effect-card :deep(.effect-thumbnail) {
  width: 56px;
}

.effect-card__index {
  position: absolute;
  top: 9px;
  left: 9px;
  font: 600 7px/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.08em;
  color: rgba(232, 249, 255, 0.56);
  text-shadow: 0 1px 3px #02060b;
}

.effect-card__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.effect-card__copy b {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #dbeaf8;
}

.effect-card.active .effect-card__copy b {
  color: #f0fbff;
}

.effect-card__copy small {
  overflow: hidden;
  font: 500 8px/1 "JetBrains Mono", Consolas, monospace;
  letter-spacing: 0.07em;
  color: #536a80;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.effect-card__arrow {
  display: grid;
  width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 50%;
  color: #50677c;
  opacity: 0;
  transition: opacity 180ms ease, color 180ms ease, background 180ms ease;
}

.effect-card:hover .effect-card__arrow,
.effect-card.active .effect-card__arrow {
  opacity: 1;
}

.effect-card.active .effect-card__arrow {
  color: var(--card-accent);
  background: color-mix(in srgb, var(--card-accent) 10%, transparent);
}

.effect-card__arrow svg {
  width: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.library-note {
  display: flex;
  gap: 9px;
  margin-top: auto;
  padding: 12px 10px;
  border: 1px solid rgba(75, 113, 147, 0.15);
  border-radius: 8px;
  background: rgba(14, 27, 40, 0.52);
}

.library-note__icon {
  display: grid;
  width: 21px;
  height: 21px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 5px;
  color: #5bdff9;
  background: rgba(67, 217, 255, 0.08);
}

.library-note__icon svg {
  width: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.1;
}

.library-note p {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
  color: #657b90;
}

.shortcut-note {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 4px 0;
  font-size: 9px;
  color: #506579;
}

.shortcut-note kbd {
  display: grid;
  min-width: 17px;
  height: 17px;
  place-items: center;
  border: 1px solid rgba(100, 137, 168, 0.25);
  border-radius: 4px;
  font: 500 8px/1 "JetBrains Mono", Consolas, monospace;
  color: #829ab0;
  background: rgba(15, 27, 40, 0.8);
}

.shortcut-note i {
  font-style: normal;
  color: #3f5366;
}
</style>
