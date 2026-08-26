<template>
  <div class="viewer" ref="viewerEl">
    <!-- Photo background (dark futuristic showroom w/ floating parts) -->
    <div class="bg-photo"></div>
    <div class="bg-overlay"></div>
    <div class="bg-vignette"></div>

    <!-- Rushing light streaks — sells "parts are moving" -->
    <div class="speed-lines">
      <div v-for="i in 14" :key="i" class="speed-line" :style="speedLineStyle(i)"></div>
    </div>

    <!-- Radial glow pulses -->
    <div class="hero-glow"></div>
    <div class="hero-glow hero-glow--orange"></div>

    <!-- Grid overlay -->
    <div class="grid-bg"></div>

    <!-- Animated watermark logo -->
    <div class="bg-logo-wrap" :class="{ visible: isReady }">
      <img src="/images/TRAD Logo.png" alt="" class="bg-logo-img" />
    </div>

    <canvas ref="canvasRef" class="three-canvas"></canvas>
    <div class="ambient-scan" :class="{ visible: isReady }"></div>

    <!-- Loading -->
    <Transition name="fade">
      <div v-if="!isReady" class="loading-overlay">
        <div class="loading-bg-photo"></div>
        <div class="loading-bg-overlay"></div>
        <div class="loading-bg-vignette"></div>
        <div class="loading-speed-lines">
          <div v-for="i in 10" :key="i" class="speed-line" :style="speedLineStyle(i)"></div>
        </div>
        <div class="loading-inner">
          <div class="loading-ring">
            <svg viewBox="0 0 60 60" class="loading-svg">
              <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(80,160,255,0.18)" stroke-width="2"/>
              <circle cx="30" cy="30" r="26" fill="none" stroke="#3399FF" stroke-width="2"
                stroke-linecap="round" stroke-dasharray="40 200" class="loading-arc"/>
            </svg>
            <span class="loading-pct">{{ loadPct }}</span>
          </div>
          <p class="loading-text">{{ t('loading_model') }}</p>
          <div class="loading-bar-wrap">
            <div class="loading-bar-fill" :style="{ width: loadPct + '%' }"></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Top bar -->
    <div class="topbar" :class="{ visible: bootStage >= 3 }">
      <div class="topbar-left">
        <img src="/images/TRAD Logo.png" alt="TRAD" class="trad-logo-bar" />
        <div class="tb-sep"></div>
        <span class="topbar-brand">CAR <span class="blue">360°</span></span>
        <div class="tb-sep"></div>
        <span class="topbar-sub">{{ t('exterior_360') }}</span>
      </div>
      <div class="topbar-right">
        <button class="tab active">{{ t('tab_exterior') }}</button>
        <button class="tab" @click="handleChassisClick">
          <span class="tab-ripple"></span>{{ t('tab_chassis') }}
        </button>
        <button class="btn-back" @click="$emit('back')">{{ t('btn_back') }}</button>
      </div>
    </div>

    <!-- LEFT SIDEBAR: Stat card / CTA panel -->
    <div class="left-sidebar" :class="{ visible: bootStage >= 2 }">
      <div class="spark-panel">
        <div class="spark-inner">

          <div class="spark-badge">
            <span class="spark-badge-dot"></span>
            <span>{{ t('spark_badge') }}</span>
          </div>

          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-val">16</span>
              <span class="stat-lbl">{{ t('side_hotspots') }}</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-val">360°</span>
              <span class="stat-lbl">{{ t('side_rotation') }}</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-item">
              <span class="stat-val stat-val--orange">3D</span>
              <span class="stat-lbl">{{ t('side_chassis') }}</span>
            </div>
          </div>

          <button class="spark-cta" @click="handleChassisClick">
            <span class="spark-cta-shine"></span>
            <span class="spark-cta-text">{{ t('spark_cta') }}</span>
            <svg viewBox="0 0 16 16" class="spark-cta-icon">
              <path d="M3 8 H12 M8 4 L12 8 L8 12" fill="none" stroke="currentColor"
                stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

        </div>
      </div>
    </div>

    <!-- RIGHT SIDEBAR: gauge only -->
    <div class="right-sidebar" :class="{ visible: bootStage >= 1 }">
      <div class="deg-ring">
        <svg viewBox="0 0 80 80" class="deg-svg">
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0044BB"/>
              <stop offset="100%" stop-color="#00C2FF"/>
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,102,230,0.08)" stroke-width="4"/>
          <circle
            v-for="n in 24" :key="n"
            :cx="40 + 36 * Math.cos((n * 15 - 90) * Math.PI / 180)"
            :cy="40 + 36 * Math.sin((n * 15 - 90) * Math.PI / 180)"
            :r="n % 6 === 0 ? 1.3 : 0.7"
            :fill="n % 6 === 0 ? 'rgba(0,102,230,0.4)' : 'rgba(0,102,230,0.15)'"
          />
          <circle cx="40" cy="40" r="32" fill="none"
            stroke="url(#arcGrad)" stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="`${(yawDeg/360)*201} 201`"
            stroke-dashoffset="0"
            transform="rotate(-90 40 40)"
            class="deg-arc"
          />
          <g :transform="`rotate(${yawDeg} 40 40)`" class="deg-needle-group">
            <line x1="40" y1="40" x2="40" y2="13" stroke="url(#arcGrad)" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="40" y1="40" x2="40" y2="48" stroke="rgba(0,102,230,0.25)" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="40" cy="40" r="3.2" fill="#0066E6" stroke="rgba(255,255,255,0.9)" stroke-width="1.2"/>
          </g>
        </svg>
        <div class="deg-val">{{ yawDeg }}<span class="deg-sym">°</span></div>
        <div class="deg-label">{{ t('yaw') }}</div>
      </div>
    </div>

    <!-- Parts Detail Hotspot -->
    <Transition name="pop-in">
      <button
        v-if="bootStage >= 3 && dotVisible"
        type="button"
        class="parts-hotspot"
        :style="{ left: dotX + 'px', top: dotY + 'px' }"
        @click="handleChassisClick"
      >
        <span class="parts-target" aria-hidden="true"><span class="parts-target-core"></span></span>
        <span class="parts-connector" aria-hidden="true"></span>
        <span class="parts-label">
          <span class="parts-index">01</span>
          <span class="parts-label-text">{{ t('parts_detail') }}</span>
        </span>
      </button>
    </Transition>

    <!-- Bottom HUD -->
    <div class="bottom-hud" :class="{ visible: bootStage >= 3 }">
      <div class="hud-left">
        <div class="hud-item">
          <span class="hud-dot green"></span>
          <span>{{ t('hud_status') }}</span>
          <span class="hud-val blue">{{ t('hud_ready') }}</span>
        </div>
        <div class="hud-sep"></div>
        <div class="hud-item">
          <span>{{ t('hud_render') }}</span>
          <span class="hud-val">{{ t('hud_realtime') }}</span>
        </div>
      </div>
      <div class="hud-center">{{ t('hud_center') }}</div>
      <div class="hud-right">
        <div class="hud-item">
          <span>{{ t('yaw') }}</span>
          <span class="hud-val blue">{{ yawDeg }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js' 
import { t } from '../composables/useLang.js'

const props = defineProps({
  modelPath: { type: String, default: '/models/car.glb' },
  active:    { type: Boolean, default: false }
})

const emit = defineEmits(['back', 'chassis', 'ready'])

const viewerEl   = ref(null)
const canvasRef  = ref(null)
const isReady    = ref(false)
const loadPct    = ref(0)
const yawDeg     = ref(0)
const dotX       = ref(-999)
const dotY       = ref(-999)
const dotVisible = ref(true)
const bootStage  = ref(0)

// Warna cat mobil — biru muda
const CAR_PAINT_COLOR = 0x6FA8FF

let renderer, scene, camera, animId
let car = null
let isDragging = false, lastX = 0, prevX = 0
let yaw = 0, yawVel = 0
let camZ = 6.0
const CAM_Z_MIN = 3.0, CAM_Z_MAX = 10.0
const CAM_Y    = 1.5
const CAM_LOOK = new THREE.Vector3(0, 0.6, 0)
let entryActive = false, entryT = 0
const ENTRY_X_START  = 14
const ENTRY_DURATION = 1.6
let carHalfWidth = 2.0
let carMidY      = 0.8

function speedLineStyle(i) {
  const top     = 5 + (i * 6.3) % 90
  const w       = 60 + (i * 41) % 140
  const delay   = (i * 0.34) % 4
  const dur     = 2.6 + (i * 0.21) % 2.4
  const opacity = 0.08 + (i % 5) * 0.045
  return {
    top: top + '%',
    width: w + 'px',
    animationDelay: delay + 's',
    animationDuration: dur + 's',
    opacity,
  }
}

function startBootSequence() {
  bootStage.value = 0
  setTimeout(() => { bootStage.value = 1 }, 80)
  setTimeout(() => { bootStage.value = 2 }, 400)
  setTimeout(() => { bootStage.value = 3 }, 750)
}

let isTransitioning = false

function handleChassisClick() {
  if (isTransitioning || !car) return
  isTransitioning = true
  yawVel = 0
  const targetZ = 1.5, duration = 1400, startZ = camZ, startTime = performance.now()
  function zoomStep(now) {
    const t = Math.min((now - startTime) / duration, 1)
    camZ = startZ + (targetZ - startZ) * (t * t * t * t * t)
    if (t < 1) requestAnimationFrame(zoomStep)
    else { emit('chassis'); setTimeout(() => { camZ = 6.0; isTransitioning = false }, 1200) }
  }
  requestAnimationFrame(zoomStep)
}

function init() {
  const W = window.innerWidth, H = window.innerHeight
  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.shadowMap.enabled   = true
  renderer.shadowMap.type      = THREE.PCFSoftShadowMap
  renderer.toneMapping         = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 2.2
  renderer.outputColorSpace    = THREE.SRGBColorSpace
  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200)
  camera.position.set(0, CAM_Y, camZ)
  camera.lookAt(CAM_LOOK)
  buildLights(); buildGround(); loadModel()
  canvasRef.value.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('resize', onResize)
  animate()
}

function buildLights() {
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  const envScene = new THREE.Scene()
  const panelGeo = new THREE.PlaneGeometry(20, 20)
  const panelMat = (i) => new THREE.MeshBasicMaterial({ color: new THREE.Color(i, i, i), side: THREE.BackSide })
  const top    = new THREE.Mesh(panelGeo, panelMat(1.0)); top.position.y =  8; top.rotation.x =  Math.PI/2; envScene.add(top)
  const front  = new THREE.Mesh(panelGeo, panelMat(1.0)); front.position.z = -8; envScene.add(front)
  const back   = new THREE.Mesh(panelGeo, panelMat(0.9)); back.position.z =  8; back.rotation.y = Math.PI; envScene.add(back)
  const left   = new THREE.Mesh(panelGeo, panelMat(0.9)); left.position.x = -8; left.rotation.y =  Math.PI/2; envScene.add(left)
  const right  = new THREE.Mesh(panelGeo, panelMat(0.9)); right.position.x =  8; right.rotation.y = -Math.PI/2; envScene.add(right)
  const bottom = new THREE.Mesh(panelGeo, panelMat(0.5)); bottom.position.y = -8; bottom.rotation.x = -Math.PI/2; envScene.add(bottom)
  scene.environment = pmrem.fromScene(envScene).texture
  scene.environmentIntensity = 2.2
  pmrem.dispose()
  scene.add(new THREE.AmbientLight(0xffffff, 1.6))
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
  keyLight.position.set(4, 4, 5); keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near = 0.5; keyLight.shadow.camera.far = 30
  keyLight.shadow.camera.left = -5; keyLight.shadow.camera.right = 5
  keyLight.shadow.camera.top = 5; keyLight.shadow.camera.bottom = -5
  scene.add(keyLight)
  const fl = new THREE.DirectionalLight(0xffffff, 1.8); fl.position.set(-4,2,5); scene.add(fl)
  const rl = new THREE.DirectionalLight(0xddeeff, 1.0); rl.position.set(0,3,-6); scene.add(rl)
}

function buildGround() {
  // Contact shadow only — the podium/ring visual now comes from the bg photo,
  // so no extra glowing ring mesh is added here.
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.ShadowMaterial({ opacity: 0.15 }))
  sp.rotation.x = -Math.PI/2; sp.receiveShadow = true; scene.add(sp)
}

function loadModel() {
  let timer = setInterval(() => {
    if (loadPct.value < 85) loadPct.value += 10 + Math.floor(Math.random()*8)
    else loadPct.value = Math.min(loadPct.value+1, 95)
  }, 150)
  new GLTFLoader().load(props.modelPath, (gltf) => {
    clearInterval(timer); loadPct.value = 100
    const model = gltf.scene
    const box0 = new THREE.Box3().setFromObject(model)
    const size0 = box0.getSize(new THREE.Vector3())
    model.scale.setScalar(4.0/Math.max(size0.x,size0.y,size0.z))
    model.updateMatrixWorld(true)
    const box1 = new THREE.Box3().setFromObject(model)
    const center = box1.getCenter(new THREE.Vector3())
    model.position.x -= center.x; model.position.z -= center.z; model.position.y -= box1.min.y
    model.updateMatrixWorld(true)
    car = new THREE.Group(); car.add(model)
    model.traverse(n => {
      if (!n.isMesh) return
      n.castShadow = true; n.receiveShadow = true; n.frustumCulled = false
      const mats = Array.isArray(n.material) ? n.material : [n.material]
      mats.forEach(m => {
        if (!m) return
        const mn = (m.name||'').toLowerCase()
        if (mn.includes('carpaint')||mn.includes('car_paint')||mn.includes('body_paint')) {
          // Ganti warna cat jadi biru muda
          if (m.color) m.color.set(CAR_PAINT_COLOR)
          m.roughness=0.15; m.metalness=0.85; m.envMapIntensity=2.2; m.needsUpdate=true; return
        }
        if (mn.includes('glass')||mn.includes('window')||mn.includes('windshield')||mn.includes('kaca')) { m.transparent=true; m.opacity=0.88; m.roughness=0; m.metalness=0.3; m.envMapIntensity=2.5; m.depthWrite=true; m.needsUpdate=true; return }
        if (mn.includes('light')||mn.includes('lamp')||mn.includes('lens')||mn.includes('blinker')) { m.roughness=0.05; m.metalness=0.9; m.envMapIntensity=3.0; m.needsUpdate=true; return }
        if (m.isMeshStandardMaterial||m.isMeshPhysicalMaterial) { m.envMapIntensity=(m.envMapIntensity||1)*1.4; m.needsUpdate=true }
      })
    })
    const bf = new THREE.Box3().setFromObject(car)
    const sf = bf.getSize(new THREE.Vector3())
    carHalfWidth = sf.x/2+0.4; carMidY = sf.y*0.45
    car.position.x = ENTRY_X_START; scene.add(car)
    entryActive = true; entryT = 0
  }, undefined, (err) => { console.error('GLB error:', err); clearInterval(timer) })
}

function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2,-10*t) }

function animate() {
  animId = requestAnimationFrame(animate)
  if (!car) { renderer.render(scene, camera); return }
  if (entryActive) {
    entryT = Math.min(entryT + 1/(ENTRY_DURATION*60), 1)
    car.position.x = ENTRY_X_START*(1-easeOutExpo(entryT))
    if (entryT > 0.85) car.position.y = Math.sin((entryT-0.85)/0.15*Math.PI)*0.05
    if (entryT >= 1) { car.position.set(0,0,0); entryActive=false; isReady.value=true; startBootSequence() }
  }
  if (!isDragging && !isTransitioning) {
    yawVel *= 0.92; yaw += yawVel*0.004
    if (Math.abs(yawVel) < 0.05 && !entryActive) yaw += 0.002
  }
  car.rotation.y = yaw
  yawDeg.value = Math.round(((yaw*180/Math.PI)%360+360)%360)
  camera.position.z += (camZ-camera.position.z)*0.08
  camera.lookAt(CAM_LOOK)
  if (isReady.value) {
    const wp = new THREE.Vector3(carHalfWidth, carMidY, 0)
    const ndc = wp.clone().project(camera)
    const W = renderer.domElement.clientWidth, H = renderer.domElement.clientHeight
    dotX.value = (ndc.x*0.5+0.5)*W; dotY.value = (-ndc.y*0.5+0.5)*H
    dotVisible.value = ndc.z < 1
  }
  renderer.render(scene, camera)
}

function onWheel(e) { if (!isTransitioning) camZ = Math.max(CAM_Z_MIN, Math.min(CAM_Z_MAX, camZ+e.deltaY*0.007)) }
function onResize() { const W=window.innerWidth,H=window.innerHeight; renderer.setSize(W,H); camera.aspect=W/H; camera.updateProjectionMatrix() }

let lastPinchDist = 0
function onPointerDown(e) { if (entryActive||isTransitioning) return; isDragging=true; lastX=prevX=e.clientX??e.touches?.[0]?.clientX??0; yawVel=0 }
function onPointerMove(e) { if (!isDragging) return; const x=e.clientX??e.touches?.[0]?.clientX??0; yaw+=(x-lastX)*0.010; yawVel=x-prevX; prevX=lastX; lastX=x }
function onPointerUp() { isDragging=false }
function onTouchStart(e) { if (e.touches.length===2) lastPinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); else onPointerDown(e) }
function onTouchMove(e) { if (e.touches.length===2) { const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY); camZ=Math.max(CAM_Z_MIN,Math.min(CAM_Z_MAX,camZ+(lastPinchDist-d)*0.025)); lastPinchDist=d } else onPointerMove(e) }

onMounted(() => {
  init()
  const el = viewerEl.value
  el.addEventListener('pointerdown', onPointerDown)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerup', onPointerUp)
  el.addEventListener('pointerleave', onPointerUp)
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  el.addEventListener('touchend', onPointerUp)
})
onUnmounted(() => { cancelAnimationFrame(animId); renderer?.dispose(); window.removeEventListener('resize', onResize) })
</script>

<style scoped>
.viewer {
  position: absolute; inset: 0; overflow: hidden;
}

/* ── Photo background ── */
.bg-photo {
  position: absolute; inset: 0; z-index: 0;
  background-image: url('/images/background/bg_car.png');
  background-size: cover;
  /* Vertical anchor — tweak this % if the podium ring drifts out of
     alignment with the car on your actual screen resolution. Higher %
     moves the photo's platform further UP the screen. */
  background-position: center 78%;
  transform-origin: 50% 78%;
  animation: bg-drift 24s ease-in-out infinite alternate;
}
@keyframes bg-drift {
  from { transform: scale(1.04); }
  to   { transform: scale(1.09); }
}
.bg-overlay {
  position: absolute; inset: 0; z-index: 0;
  background:
    linear-gradient(180deg, rgba(3,6,14,0.82) 0%, rgba(4,8,18,0.55) 22%, rgba(4,8,18,0.6) 78%, rgba(3,6,14,0.88) 100%),
    linear-gradient(100deg, rgba(2,5,12,0.45) 0%, rgba(2,5,12,0.1) 45%, rgba(2,5,12,0.45) 100%);
}
.bg-vignette {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(ellipse 78% 78% at 50% 48%, transparent 45%, rgba(1,3,8,0.5) 100%);
}

/* Rushing light streaks — gives the floating parts a sense of motion */
.speed-lines { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
.speed-line {
  position: absolute; left: -180px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(90,180,255,0.85), transparent);
  animation: rush linear infinite;
}
@keyframes rush {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100vw + 240px)); }
}

/* Radial glow pulses */
.hero-glow {
  position: absolute; left: 50%; top: 42%;
  width: 900px; height: 560px; transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(0,120,255,0.14) 0%, rgba(0,150,255,0.06) 45%, transparent 70%);
  pointer-events: none; z-index: 1;
  animation: glow-pulse 4.5s ease-in-out infinite;
}
.hero-glow--orange {
  width: 560px; height: 360px;
  left: 50%; top: auto; bottom: -100px; transform: translateX(-50%);
  background: radial-gradient(ellipse at center, rgba(255,90,31,0.09) 0%, transparent 70%);
  animation: glow-pulse 5.5s 1s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.7; transform: translate(-50%,-50%) scale(0.97); }
  50%       { opacity: 1;   transform: translate(-50%,-50%) scale(1.03); }
}
.hero-glow--orange { animation-name: glow-pulse-orange; }
@keyframes glow-pulse-orange {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(0.97); }
  50%       { opacity: 1;   transform: translateX(-50%) scale(1.05); }
}

/* Subtle grid */
.grid-bg {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background-image:
    linear-gradient(rgba(80,160,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,160,255,0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 75% at 50% 50%, black, transparent 82%);
}

.three-canvas {
  position: absolute; inset: 0;
  width: 100% !important; height: 100% !important;
  cursor: grab; z-index: 1;
}
.three-canvas:active { cursor: grabbing; }

/* ── Ambient scan ── */
.ambient-scan {
  position: absolute; left: 0; right: 0; top: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(60,150,255,0.55), transparent);
  opacity: 0; pointer-events: none; z-index: 3;
}
.ambient-scan.visible { opacity: 1; animation: scan-sweep 7s ease-in-out infinite; }
@keyframes scan-sweep {
  0%   { top: 6%;  opacity: 0; }
  8%   { opacity: 0.7; }
  46%  { opacity: 0.5; }
  54%  { top: 90%; opacity: 0; }
  100% { top: 90%; opacity: 0; }
}

/* ── Loading ── */
.loading-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; z-index: 50;
  background: #05070D;
}
.loading-bg-photo {
  position: absolute; inset: 0; z-index: 0;
  background-image: url('/images/background/bg_loading.png');
  background-size: cover;
  background-position: center;
  animation: bg-drift 20s ease-in-out infinite alternate;
}
.loading-bg-overlay {
  position: absolute; inset: 0; z-index: 0;
  background:
    linear-gradient(180deg, rgba(3,6,14,0.86) 0%, rgba(4,8,18,0.6) 30%, rgba(4,8,18,0.68) 75%, rgba(3,6,14,0.92) 100%);
}
.loading-bg-vignette {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(ellipse 78% 78% at 50% 48%, transparent 40%, rgba(1,3,8,0.6) 100%);
}
.loading-speed-lines { position: absolute; inset: 0; pointer-events: none; z-index: 1; }

.loading-inner {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  background: rgba(4,8,16,0.72);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(80,160,255,0.22);
  border-radius: 20px;
  padding: 32px 48px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
}
.loading-ring { position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
.loading-svg { width: 60px; height: 60px; position: absolute; inset: 0; animation: spin 1.4s linear infinite; }
.loading-arc { animation: arc-grow 1.4s ease-in-out infinite; filter: drop-shadow(0 0 6px rgba(51,153,255,0.7)); }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes arc-grow { 0%,100% { stroke-dasharray: 20 200; } 50% { stroke-dasharray: 110 200; } }
.loading-pct { font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: #FFFFFF; text-shadow: 0 0 12px rgba(51,153,255,0.8); }
.loading-text { font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .2em; color: #DCEAFF; margin: 0; text-transform: uppercase; }
.loading-bar-wrap { width: 180px; height: 2px; background: rgba(80,160,255,0.18); border-radius: 1px; overflow: hidden; }
.loading-bar-fill { height: 100%; background: linear-gradient(90deg, #0066E6, #3399FF); box-shadow: 0 0 8px rgba(51,153,255,0.6); transition: width 0.2s; }

/* ── Topbar ── */
.topbar {
  position: absolute; top: 0; left: 0; right: 0; height: 52px;
  background: rgba(6,10,20,0.72);
  backdrop-filter: blur(16px);
  border-bottom: 1.5px solid rgba(60,150,255,0.22);
  box-shadow: 0 2px 24px rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 130px 0 24px; z-index: 10;
  opacity: 0; transform: translateY(-100%);
  transition: opacity 0.5s, transform 0.5s;
}
.topbar.visible { opacity: 1; transform: translateY(0); }
.topbar-left { display: flex; align-items: center; gap: 16px; }
.trad-logo-bar { height: 24px; width: auto; object-fit: contain; flex-shrink: 0; filter: drop-shadow(0 0 8px rgba(0,120,255,0.35)); }
.topbar-brand { font-family: var(--font-display); font-size: 14px; font-weight: 700; letter-spacing: .05em; color: #F2F6FF; }
.blue { color: #58AEFF; }
.tb-sep { width: 1px; height: 18px; background: rgba(80,160,255,0.25); }
.topbar-sub { font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em; color: #7FC0FF; }
.topbar-right { display: flex; align-items: center; gap: 8px; }
.tab {
  position: relative; overflow: hidden;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
  padding: 6px 14px; border-radius: 4px; border: 1px solid rgba(80,160,255,0.25);
  background: rgba(10,18,32,0.5); color: rgba(180,205,240,0.75); cursor: pointer; transition: all .2s;
}
.tab.active { background: #0066E6; border-color: #3399FF; color: white; box-shadow: 0 0 14px rgba(0,102,230,0.45); }
.tab:hover:not(.active) { border-color: #3399FF; color: #7FC0FF; background: rgba(0,119,255,0.14); }
.tab-ripple {
  position: absolute; inset: 0; border-radius: 4px;
  background: radial-gradient(circle, rgba(51,153,255,0.3) 0%, transparent 70%);
  opacity: 0; transform: scale(0.5); transition: opacity .4s, transform .4s; pointer-events: none;
}
.tab:active .tab-ripple { opacity: 1; transform: scale(1.4); transition: none; }
.btn-back {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
  padding: 6px 14px; border-radius: 4px; border: 1px solid rgba(80,160,255,0.25);
  background: rgba(10,18,32,0.5); color: rgba(210,228,255,0.8); cursor: pointer; margin-left: 8px; transition: all .2s;
}
.btn-back:hover { border-color: #3399FF; color: #7FC0FF; background: rgba(0,119,255,0.14); }

/* ── Animated watermark logo ── */
.bg-logo-wrap {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  z-index: 0; pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.bg-logo-wrap.visible { opacity: 1; }
.bg-logo-img {
  width: 38vw; max-width: 560px; min-width: 260px;
  object-fit: contain;
  opacity: 0.05;
  filter: saturate(1.4) brightness(1.6);
  animation: logo-float 10s ease-in-out infinite, logo-fade 6s ease-in-out infinite;
}
@keyframes logo-float {
  0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
  50%      { transform: scale(1.06) rotate(1.2deg) translateY(-10px); }
}
@keyframes logo-fade {
  0%, 100% { opacity: 0.04; }
  50%      { opacity: 0.09; }
}

/* ── LEFT SIDEBAR ── */
.left-sidebar {
  position: absolute; left: 20px; top: 62px;
  width: 252px; z-index: 10;
  opacity: 0; transform: translateX(-16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.left-sidebar.visible { opacity: 1; transform: translateX(0); }

/* ── Spark Panel (animated gradient border) ── */
.spark-panel {
  position: relative;
  border-radius: 20px;
  padding: 2px;
  overflow: hidden;
  box-shadow: 0 10px 34px rgba(0,40,120,0.16);
  animation: spark-panel-float 5s ease-in-out infinite;
}
@keyframes spark-panel-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
.spark-panel::before {
  content: '';
  position: absolute; inset: -60%;
  background: conic-gradient(from 0deg, #0066E6, #00C2FF, #7C3AED, #FF5A1F, #00C2FF, #0066E6);
  animation: spark-border-spin 5s linear infinite;
}
@keyframes spark-border-spin { to { transform: rotate(360deg); } }

.spark-inner {
  position: relative; z-index: 1;
  background: rgba(4,8,16,0.96);
  backdrop-filter: blur(14px);
  border-radius: 18px;
  padding: 18px 18px 14px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}

.spark-badge {
  align-self: flex-start;
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .16em;
  color: #7FC0FF;
  background: rgba(0,102,230,0.14);
  border: 1px solid rgba(80,160,255,0.3);
  border-radius: 20px;
  padding: 4px 10px;
  margin-bottom: 18px;
}
.spark-badge-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #3399FF;
  box-shadow: 0 0 6px rgba(51,153,255,0.8);
  animation: promo-pulse-anim 2s ease-in-out infinite;
}

/* ── Stat grid ── */
.stat-grid {
  display: flex; align-items: center; justify-content: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 18px;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-val {
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  font-size: 26px; font-weight: 800; color: #58AEFF;
  line-height: 1; letter-spacing: -0.02em;
  text-shadow: 0 0 14px rgba(0,140,255,0.4);
}
.stat-val--orange { color: #FF7A47; text-shadow: 0 0 14px rgba(255,90,31,0.4); }
.stat-lbl {
  font-family: var(--font-mono);
  font-size: 8px; letter-spacing: .18em;
  color: rgba(160,200,255,0.6); text-transform: uppercase;
  white-space: nowrap;
}
.stat-sep { width: 1px; height: 30px; background: rgba(80,160,255,0.22); flex-shrink: 0; }

.spark-cta {
  position: relative; overflow: hidden;
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: .12em;
  padding: 11px 10px; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #0066E6, #00A8FF);
  color: white; cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,102,230,0.4);
  transition: transform .2s, box-shadow .2s;
}
.spark-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(0,102,230,0.5); }
.spark-cta:active { transform: translateY(0); }
.spark-cta-shine {
  position: absolute; top: 0; bottom: 0; width: 40%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
  transform: translateX(-160%);
  animation: spark-shine-sweep 2.6s ease-in-out infinite;
}
@keyframes spark-shine-sweep {
  0%, 30%  { transform: translateX(-160%); }
  70%, 100% { transform: translateX(280%); }
}
.spark-cta-text { position: relative; z-index: 1; }
.spark-cta-icon { width: 14px; height: 14px; position: relative; z-index: 1; animation: cta-arrow-nudge 1.4s ease-in-out infinite; }
@keyframes cta-arrow-nudge {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(3px); }
}

@keyframes promo-pulse-anim {
  0%,100% { opacity: 1; box-shadow: 0 0 0 2px rgba(51,153,255,0.3); }
  50% { opacity: 0.5; box-shadow: 0 0 0 4px rgba(51,153,255,0.08); }
}

/* ── RIGHT SIDEBAR ── */
.right-sidebar {
  position: absolute; right: 20px; top: 62px;
  width: 96px; z-index: 10;
  opacity: 0; transform: translateX(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.right-sidebar.visible { opacity: 1; transform: translateX(0); }

/* ── Degree gauge ── */
.deg-ring {
  width: 96px; text-align: center;
  background: rgba(8,14,26,0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(80,160,255,0.25);
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
.deg-svg { width: 76px; height: 76px; display: block; margin: 0 auto; }
.deg-arc { transition: stroke-dasharray .05s linear; }
.deg-needle-group { transition: transform .05s linear; }
.deg-val { font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: #F2F6FF; }
.deg-sym { font-size: 10px; color: #58AEFF; }
.deg-label { font-family: var(--font-mono); font-size: 8px; letter-spacing: .2em; color: #7FC0FF; opacity: 0.8; }

/* ── Parts hotspot ── */
.parts-hotspot {
  position: absolute; transform: translate(0, -50%); padding: 10px 0;
  display: flex; flex-direction: row; align-items: center;
  border: 0; background: transparent; cursor: pointer; z-index: 20;
}
.parts-target {
  position: relative; width: 24px; height: 24px; flex-shrink: 0;
  border: 1px solid rgba(88,174,255,.75); border-radius: 50%;
  background: rgba(4,12,26,.38); box-shadow: 0 0 12px rgba(0,130,255,.35);
}
.parts-target::before, .parts-target::after {
  content: ''; position: absolute; background: #58AEFF; opacity: .75;
}
.parts-target::before { width: 6px; height: 1px; top: 11px; left: -4px; }
.parts-target::after { width: 1px; height: 6px; top: -4px; left: 11px; }
.parts-target-core {
  position: absolute; width: 5px; height: 5px; top: 8px; left: 8px;
  border-radius: 50%; background: #00C2FF; box-shadow: 0 0 10px #00C2FF;
}
.parts-connector {
  width: 38px; height: 1px; flex-shrink: 0;
  background: linear-gradient(90deg, #58AEFF, rgba(88,174,255,.18));
  position: relative;
}
.parts-connector::after {
  content: ''; position: absolute; right: 0; top: -2px; width: 5px; height: 5px;
  border-radius: 50%; background: #58AEFF; box-shadow: 0 0 7px rgba(88,174,255,.8);
}
.parts-label {
  position: relative; display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono); white-space: nowrap; color: #EAF3FF;
  background: rgba(5,12,25,.42); backdrop-filter: blur(8px);
  padding: 7px 12px 7px 9px; border: 1px solid rgba(80,160,255,.3);
  border-radius: 3px; box-shadow: 0 3px 14px rgba(0,0,0,.24);
  transition: color .2s, background .2s, border-color .2s, box-shadow .2s, transform .2s;
}
.parts-index { font-size: 8px; letter-spacing: .12em; color: #00C2FF; }
.parts-label-text { font-size: 10px; font-weight: 700; letter-spacing: .14em; }
.parts-hotspot:hover .parts-label,
.parts-hotspot:focus-visible .parts-label {
  background: rgba(0,102,230,.72); border-color: #58AEFF; color: white;
  box-shadow: 0 0 18px rgba(0,145,255,.4);
  transform: translateX(3px);
}
.parts-hotspot:hover .parts-target { box-shadow: 0 0 0 5px rgba(0,194,255,.1), 0 0 18px rgba(0,194,255,.8); }
.parts-hotspot:focus-visible { outline: 1px solid #58AEFF; outline-offset: 5px; }

/* ── Bottom HUD ── */
.bottom-hud {
  position: absolute; bottom: 0; left: 0; right: 0; height: 44px;
  background: rgba(5,9,18,0.82);
  backdrop-filter: blur(16px);
  border-top: 1.5px solid rgba(80,160,255,0.22);
  box-shadow: 0 -2px 24px rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; z-index: 10;
  opacity: 0; transform: translateY(100%);
  transition: opacity 0.5s, transform 0.5s;
}
.bottom-hud.visible { opacity: 1; transform: translateY(0); }
.hud-left, .hud-right { display: flex; align-items: center; gap: 10px; }
.hud-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; color: rgba(160,200,255,0.6); }
.hud-val { color: rgba(220,234,255,0.9); font-weight: 600; }
.hud-val.blue { color: #7FC0FF; }
.hud-sep { width: 1px; height: 14px; background: rgba(80,160,255,0.2); }
.hud-dot { width: 6px; height: 6px; border-radius: 50%; }
.hud-dot.green { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.6); }
.hud-center { font-family: var(--font-mono); font-size: 10px; letter-spacing: .06em; color: rgba(160,200,255,0.45); }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity .4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-in-enter-active { transition: all .4s cubic-bezier(0.16,1,0.3,1); }
.pop-in-enter-from { opacity: 0; transform: translate(0,-50%) scale(0.8); }

@media (prefers-reduced-motion: reduce) {
  .bg-photo, .bg-logo-img, .speed-line, .hero-glow, .loading-bg-photo { animation: none !important; }
  .ambient-scan, .spark-panel, .spark-panel::before, .spark-badge-dot, .spark-cta-shine, .spark-cta-icon {
    animation: none !important;
  }
  .deg-arc, .deg-needle-group { transition: none !important; }
}
</style>