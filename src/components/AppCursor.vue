<template>
  <div
    class="cursor-dot"
    :style="{ left: x + 'px', top: y + 'px' }"
    :class="{ pressing }"
  ></div>
  <div
    class="cursor-ring"
    :style="{ left: rx + 'px', top: ry + 'px' }"
    :class="{ pressing }"
  ></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(-100), y = ref(-100)
const rx = ref(-100), ry = ref(-100)
const pressing = ref(false)

let raf
let tx = -100, ty = -100

function lerp(a, b, t) { return a + (b - a) * t }

function loop() {
  rx.value = lerp(rx.value, tx, 0.14)
  ry.value = lerp(ry.value, ty, 0.14)
  raf = requestAnimationFrame(loop)
}

function onMove(e) {
  const cx = e.touches ? e.touches[0].clientX : e.clientX
  const cy = e.touches ? e.touches[0].clientY : e.clientY
  x.value = cx; y.value = cy
  tx = cx; ty = cy
}

onMounted(() => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mousedown', () => pressing.value = true)
  window.addEventListener('mouseup',   () => pressing.value = false)
  loop()
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.cursor-dot {
  position: fixed;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--cyan);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  transition: width .12s, height .12s, background .12s;
}
.cursor-dot.pressing {
  width: 4px; height: 4px;
  background: var(--white);
}

.cursor-ring {
  position: fixed;
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0,170,255,0.6);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9998;
  transition: width .15s, height .15s, border-color .15s;
}
.cursor-ring.pressing {
  width: 22px; height: 22px;
  border-color: rgba(0,170,255,0.9);
}
</style>
