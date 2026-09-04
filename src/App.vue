<template>
  <div id="wrapper" :style="{ '--topbar-h': topbarHeight + 'px' }">

    <LangToggle />

    <Transition name="screen-fade">
      <StandbyScreen v-if="screen === 'standby'" @start="goToViewer" />
    </Transition>

    <Transition name="zoom-exterior">
      <CarViewer
        v-if="screen === 'viewer'"
        :active="screen === 'viewer'"
        :model-path="modelPath"
        @back="goToStandby"
        @chassis="goToChassis"
      />
    </Transition>

    <Transition name="zoom-chassis">
      <ChassisViewer
        v-if="screen === 'chassis'"
        @exterior="goToViewer"
        @back="goToStandby"
      />
    </Transition>

    <div class="transition-flash" :class="{ active: flashing }"></div>

    <div class="cinematic-black" :class="{ active: switchingToChassis }"></div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StandbyScreen from './components/StandbyScreen.vue'
import CarViewer     from './components/CarViewer.vue'
import ChassisViewer from './components/ChassisViewer.vue'
import LangToggle     from './components/LangToggle.vue'

const screen             = ref('standby')
const flashing           = ref(false)
const switchingToChassis = ref(false)
const modelPath          = '/models/car.glb'

const topbarHeight = computed(() => ({
  standby: 72,
  viewer: 52,
  chassis: 58,
}[screen.value] ?? 58))

function flash(cb) {
  flashing.value = true
  setTimeout(() => {
    cb()
    setTimeout(() => { flashing.value = false }, 300)
  }, 150)
}

function goToViewer()  { flash(() => { screen.value = 'viewer'  }) }
function goToStandby() { flash(() => { screen.value = 'standby' }) }

function goToChassis() {
  switchingToChassis.value = true
  setTimeout(() => {
    screen.value = 'chassis'
    setTimeout(() => { switchingToChassis.value = false }, 700)
  }, 250)
}
</script>

<style scoped>
#wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.transition-flash {
  position: absolute; inset: 0;
  background: white;
  opacity: 0;
  pointer-events: none;
  z-index: 999;
  transition: opacity 0.15s ease;
}
.transition-flash.active { opacity: 1; }

.cinematic-black {
  position: absolute; inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
  z-index: 998;
  transition: opacity 0.35s ease;
}
.cinematic-black.active { opacity: 1; }

.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 0.5s ease;
  position: absolute; inset: 0;
}
.screen-fade-enter-from,
.screen-fade-leave-to { opacity: 0; }

.zoom-exterior-enter-active {
  transition: opacity 0.55s ease-out, transform 0.55s cubic-bezier(0.25, 1, 0.5, 1);
  position: absolute; inset: 0;
}
.zoom-exterior-enter-from {
  opacity: 0;
  transform: scale(1.04);
}
.zoom-exterior-leave-active {
  transition: opacity 0.5s ease-in, transform 0.5s ease-in;
  position: absolute; inset: 0;
}
.zoom-exterior-leave-to {
  opacity: 0;
  transform: scale(1.08);
}

.zoom-chassis-enter-active {
  transition: opacity 0.65s ease-out, transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
  position: absolute; inset: 0;
}
.zoom-chassis-enter-from {
  opacity: 0;
  transform: scale(1.12);
}
.zoom-chassis-leave-active {
  transition: opacity 0.4s ease-in, transform 0.4s ease-in;
  position: absolute; inset: 0;
}
.zoom-chassis-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>