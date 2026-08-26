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
  position: fixed;
  right: 20px;
  top: calc(var(--topbar-h, 58px) / 2);
  transform: translateY(-50%);
  z-index: 10000;
  height: 26px;
  display: flex;
  align-items: stretch;
  border-radius: 5px;
  border: 1px solid rgba(0,102,230,0.18);
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
  padding: 0 9px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  color: rgba(0,40,90,0.4);
  transition: color .2s, background .2s;
}
.lt-opt.active {
  color: #fff;
  background: #0066E6;
}
</style>