<template>
  <button class="lang-toggle" @click="toggleLang" :aria-label="lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'">
    <span class="lt-opt" :class="{ active: lang === 'id' }">ID</span>
    <span class="lt-opt" :class="{ active: lang === 'en' }">EN</span>
  </button>
</template>

<script setup>
import { lang, toggleLang } from '../composables/useLang.js'
</script>

<style scoped>
.lang-toggle {
  position: absolute;
  right: calc(var(--ui-unit) * 20);
  top: calc(var(--topbar-h, calc(var(--ui-unit) * 58)) / 2);
  transform: translateY(-50%);
  z-index: 10000;
  min-height: calc(var(--ui-unit) * 44);
  display: flex;
  align-items: stretch;
  border-radius: calc(var(--ui-unit) * 5);
  border: calc(var(--ui-unit) * 1) solid rgba(0,102,230,0.18);
  background: rgba(255,255,255,0.55);
  overflow: hidden;
  cursor: pointer;
  transition: border-color .2s;
}
.lang-toggle:hover {
  border-color: rgba(0,102,230,0.4);
}
.lt-opt {
  display: flex;
  align-items: center;
  padding: 0 calc(var(--ui-unit) * 9);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: calc(var(--ui-unit) * 10);
  font-weight: 700;
  letter-spacing: .1em;
  color: rgba(0,40,90,0.4);
  transition: color .2s, background .2s;
}
.lt-opt.active {
  color: #fff;
  background: #0066E6;
}

@media (min-width: 901px) and (max-height: 760px) {
  .lang-toggle {
    right: calc(var(--ui-unit) * 14);
    min-height: calc(var(--ui-unit) * 40);
  }
  .lt-opt { padding: 0 calc(var(--ui-unit) * 7); }
}

@media (orientation: portrait) {
  .lang-toggle {
    right: calc(var(--ui-unit) * 10);
    top: calc(var(--ui-unit) * 10);
    transform: none;
    min-height: calc(var(--ui-unit) * 34);
    border-radius: calc(var(--ui-unit) * 4);
    background: rgba(12, 28, 52, 0.9);
  }
  .lt-opt {
    padding: 0 calc(var(--ui-unit) * 8);
    font-size: calc(var(--ui-unit) * 12);
  }
}
</style>