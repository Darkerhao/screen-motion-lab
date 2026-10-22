<script setup lang="ts">
import type { EffectDefinition } from '../effects'

defineProps<{
  effect: EffectDefinition
}>()
</script>

<template>
  <div
    class="effect-thumbnail"
    :class="`effect-thumbnail--${effect.id}`"
    :style="{ '--thumb-accent': effect.defaultSettings.accent }"
    aria-hidden="true"
  >
    <template v-if="effect.id === 'particle-nexus'">
      <span class="thumb-orbit thumb-orbit--one" />
      <span class="thumb-orbit thumb-orbit--two" />
      <i v-for="index in 10" :key="index" class="thumb-particle" />
      <span class="thumb-core" />
    </template>

    <template v-else-if="effect.id === 'data-radar'">
      <span class="thumb-radar-ring thumb-radar-ring--one" />
      <span class="thumb-radar-ring thumb-radar-ring--two" />
      <span class="thumb-radar-cross" />
      <span class="thumb-radar-sweep" />
      <i v-for="index in 5" :key="index" class="thumb-target" />
    </template>

    <template v-else-if="effect.id === 'spectrum-wave'">
      <span class="thumb-wave-ring thumb-wave-ring--one" />
      <span class="thumb-wave-ring thumb-wave-ring--two" />
      <i v-for="index in 28" :key="index" class="thumb-wave-bar" />
      <span class="thumb-wave-core" />
    </template>

    <template v-else>
      <span class="thumb-frame-corner thumb-frame-corner--tl" />
      <span class="thumb-frame-corner thumb-frame-corner--tr" />
      <span class="thumb-frame-corner thumb-frame-corner--bl" />
      <span class="thumb-frame-corner thumb-frame-corner--br" />
      <span class="thumb-frame-line" />
      <span class="thumb-frame-content"><i /><i /><i /></span>
    </template>
  </div>
</template>

<style scoped>
.effect-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 8.7;
  overflow: hidden;
  border-radius: 7px;
  background:
    radial-gradient(circle at center, color-mix(in srgb, var(--thumb-accent) 13%, transparent), transparent 46%),
    #07101b;
  isolation: isolate;
}

.effect-thumbnail::after {
  position: absolute;
  inset: 0;
  content: "";
  opacity: 0.5;
  background-image:
    linear-gradient(color-mix(in srgb, var(--thumb-accent) 6%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--thumb-accent) 6%, transparent) 1px, transparent 1px);
  background-size: 16px 16px;
  mask-image: radial-gradient(circle, black, transparent 78%);
}

.effect-thumbnail--data-radar {
  background:
    radial-gradient(circle at center, color-mix(in srgb, var(--thumb-accent) 13%, transparent), transparent 54%),
    #06110f;
}

.effect-thumbnail--spectrum-wave {
  background:
    radial-gradient(circle at center, color-mix(in srgb, var(--thumb-accent) 12%, transparent), transparent 55%),
    #0c0914;
}

.effect-thumbnail--tech-frame {
  background:
    radial-gradient(circle at 70% 20%, color-mix(in srgb, var(--thumb-accent) 10%, transparent), transparent 45%),
    #06101b;
}

.thumb-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52%;
  height: 45%;
  border: 1px solid color-mix(in srgb, var(--thumb-accent) 25%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-14deg);
}

.thumb-orbit--two {
  width: 72%;
  height: 68%;
  border-style: dashed;
  opacity: 0.48;
  transform: translate(-50%, -50%) rotate(19deg);
}

.thumb-particle {
  position: absolute;
  z-index: 2;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #e9fcff;
  box-shadow: 0 0 7px var(--thumb-accent);
}

.thumb-particle:nth-of-type(1) { top: 25%; left: 28%; }
.thumb-particle:nth-of-type(2) { top: 34%; left: 19%; }
.thumb-particle:nth-of-type(3) { top: 64%; left: 22%; }
.thumb-particle:nth-of-type(4) { top: 75%; left: 35%; }
.thumb-particle:nth-of-type(5) { top: 70%; left: 62%; }
.thumb-particle:nth-of-type(6) { top: 55%; left: 76%; }
.thumb-particle:nth-of-type(7) { top: 29%; left: 69%; }
.thumb-particle:nth-of-type(8) { top: 20%; left: 51%; }
.thumb-particle:nth-of-type(9) { top: 48%; left: 28%; }
.thumb-particle:nth-of-type(10) { top: 47%; left: 70%; }

.thumb-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border: 1px solid var(--thumb-accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px var(--thumb-accent), inset 0 0 5px var(--thumb-accent);
}

.thumb-radar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid color-mix(in srgb, var(--thumb-accent) 28%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.thumb-radar-ring--one { width: 48%; aspect-ratio: 1; }
.thumb-radar-ring--two { width: 74%; aspect-ratio: 1; opacity: 0.52; }

.thumb-radar-cross {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 74%;
  height: 74%;
  transform: translate(-50%, -50%);
  background:
    linear-gradient(90deg, transparent 49.8%, color-mix(in srgb, var(--thumb-accent) 21%, transparent) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 49.8%, color-mix(in srgb, var(--thumb-accent) 21%, transparent) 50%, transparent 50.2%);
}

.thumb-radar-sweep {
  position: absolute;
  top: 36%;
  left: 50%;
  width: 33%;
  height: 1px;
  transform-origin: left center;
  transform: rotate(-36deg);
  background: linear-gradient(90deg, var(--thumb-accent), transparent);
  box-shadow: 0 0 5px var(--thumb-accent);
}

.thumb-target {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--thumb-accent);
  box-shadow: 0 0 7px var(--thumb-accent);
}

.thumb-target:nth-of-type(1) { top: 33%; left: 59%; }
.thumb-target:nth-of-type(2) { top: 57%; left: 30%; }
.thumb-target:nth-of-type(3) { top: 66%; left: 63%; }
.thumb-target:nth-of-type(4) { top: 43%; left: 40%; }
.thumb-target:nth-of-type(5) { top: 72%; left: 48%; }

.thumb-wave-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid color-mix(in srgb, var(--thumb-accent) 28%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.thumb-wave-ring--one { width: 31%; aspect-ratio: 1; }
.thumb-wave-ring--two { width: 56%; aspect-ratio: 1; opacity: 0.45; }

.thumb-wave-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1px;
  height: 6px;
  transform-origin: 0 0;
}

.thumb-wave-bar:nth-of-type(1) { transform: rotate(0deg) translateY(-34px); height: 8px; }
.thumb-wave-bar:nth-of-type(2) { transform: rotate(12.8deg) translateY(-34px); height: 14px; }
.thumb-wave-bar:nth-of-type(3) { transform: rotate(25.7deg) translateY(-34px); height: 19px; }
.thumb-wave-bar:nth-of-type(4) { transform: rotate(38.5deg) translateY(-34px); height: 12px; }
.thumb-wave-bar:nth-of-type(5) { transform: rotate(51.4deg) translateY(-34px); height: 23px; }
.thumb-wave-bar:nth-of-type(6) { transform: rotate(64.2deg) translateY(-34px); height: 17px; }
.thumb-wave-bar:nth-of-type(7) { transform: rotate(77.1deg) translateY(-34px); height: 9px; }
.thumb-wave-bar:nth-of-type(8) { transform: rotate(90deg) translateY(-34px); height: 16px; }
.thumb-wave-bar:nth-of-type(9) { transform: rotate(102.8deg) translateY(-34px); height: 23px; }
.thumb-wave-bar:nth-of-type(10) { transform: rotate(115.7deg) translateY(-34px); height: 13px; }
.thumb-wave-bar:nth-of-type(11) { transform: rotate(128.5deg) translateY(-34px); height: 19px; }
.thumb-wave-bar:nth-of-type(12) { transform: rotate(141.4deg) translateY(-34px); height: 8px; }
.thumb-wave-bar:nth-of-type(13) { transform: rotate(154.2deg) translateY(-34px); height: 15px; }
.thumb-wave-bar:nth-of-type(14) { transform: rotate(167.1deg) translateY(-34px); height: 21px; }
.thumb-wave-bar:nth-of-type(15) { transform: rotate(180deg) translateY(-34px); height: 11px; }
.thumb-wave-bar:nth-of-type(16) { transform: rotate(192.8deg) translateY(-34px); height: 18px; }
.thumb-wave-bar:nth-of-type(17) { transform: rotate(205.7deg) translateY(-34px); height: 9px; }
.thumb-wave-bar:nth-of-type(18) { transform: rotate(218.5deg) translateY(-34px); height: 22px; }
.thumb-wave-bar:nth-of-type(19) { transform: rotate(231.4deg) translateY(-34px); height: 14px; }
.thumb-wave-bar:nth-of-type(20) { transform: rotate(244.2deg) translateY(-34px); height: 18px; }
.thumb-wave-bar:nth-of-type(21) { transform: rotate(257.1deg) translateY(-34px); height: 7px; }
.thumb-wave-bar:nth-of-type(22) { transform: rotate(270deg) translateY(-34px); height: 20px; }
.thumb-wave-bar:nth-of-type(23) { transform: rotate(282.8deg) translateY(-34px); height: 12px; }
.thumb-wave-bar:nth-of-type(24) { transform: rotate(295.7deg) translateY(-34px); height: 18px; }
.thumb-wave-bar:nth-of-type(25) { transform: rotate(308.5deg) translateY(-34px); height: 8px; }
.thumb-wave-bar:nth-of-type(26) { transform: rotate(321.4deg) translateY(-34px); height: 17px; }
.thumb-wave-bar:nth-of-type(27) { transform: rotate(334.2deg) translateY(-34px); height: 12px; }
.thumb-wave-bar:nth-of-type(28) { transform: rotate(347.1deg) translateY(-34px); height: 9px; }

.thumb-wave-bar:nth-of-type(3n) { background: var(--thumb-accent); box-shadow: 0 0 4px var(--thumb-accent); }
.thumb-wave-bar:nth-of-type(3n + 1) { background: color-mix(in srgb, var(--thumb-accent) 58%, white 12%); }
.thumb-wave-bar:nth-of-type(3n + 2) { background: color-mix(in srgb, var(--thumb-accent) 42%, transparent); }

.thumb-wave-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  border: 1px solid color-mix(in srgb, var(--thumb-accent) 55%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 13px color-mix(in srgb, var(--thumb-accent) 35%, transparent);
}

.thumb-frame-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: var(--thumb-accent);
  border-style: solid;
  opacity: 0.75;
}

.thumb-frame-corner--tl { top: 12px; left: 16px; border-width: 1px 0 0 1px; }
.thumb-frame-corner--tr { top: 12px; right: 16px; border-width: 1px 1px 0 0; }
.thumb-frame-corner--bl { bottom: 12px; left: 16px; border-width: 0 0 1px 1px; }
.thumb-frame-corner--br { right: 16px; bottom: 12px; border-width: 0 1px 1px 0; }

.thumb-frame-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52%;
  height: 40%;
  border: 1px solid color-mix(in srgb, var(--thumb-accent) 17%, transparent);
  transform: translate(-50%, -50%);
}

.thumb-frame-content {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 42%;
  transform: translate(-50%, -50%);
}

.thumb-frame-content i {
  display: block;
  height: 2px;
  background: color-mix(in srgb, var(--thumb-accent) 34%, transparent);
}

.thumb-frame-content i:nth-child(2) { width: 67%; background: color-mix(in srgb, var(--thumb-accent) 70%, transparent); }
</style>
