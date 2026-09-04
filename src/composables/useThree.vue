<template>
  <div class="viewer" ref="viewerEl">
    <canvas ref="canvasRef" class="three-canvas"></canvas>

    <Transition name="fade">
      <div v-if="!isReady" class="loading-overlay">
        <div class="loading-inner">
          <div class="loading-spinner"></div>
          <p class="loading-text">MEMUAT MODEL 3D</p>
          <div class="loading-bar-wrap">
            <div class="loading-bar-fill" :style="{ width: loadPct + '%' }"></div>
          </div>
          <p class="loading-pct">{{ loadPct }}%</p>
        </div>
      </div>
    </Transition>

    <div class="topbar" :class="{ visible: isReady }">
      <div class="topbar-left">
        <span class="topbar-brand">CAR <span class="blue">360°</span></span>
        <div class="tb-sep"></div>
        <span class="topbar-sub">EXTERIOR — 360°</span>
      </div>
      <div class="topbar-right">
        <button class="tab active">EXTERIOR</button>
        <button class="tab" @click="$emit('chassis')">CHASSIS</button>
        <button class="btn-back" @click="$emit('back')">← KEMBALI</button>
      </div>
    </div>

    <Transition name="slide-left">
      <div v-if="isReady" class="spec-card">
        <p class="spec-title">SPESIFIKASI</p>
        <div v-for="s in specs" :key="s.label" class="spec-row">
          <span class="spec-label">{{ s.label }}</span>
          <span class="spec-val">{{ s.value }}</span>
        </div>
        <p class="spec-hint">★ REALTIME RENDER</p>
      </div>
    </Transition>

    <Transition name="pop-in">
      <div
        v-if="isReady"
        class="hotspot"
        :style="{ left: hotspotX + 'px', top: hotspotY + 'px' }"
        @click="$emit('chassis')"
      >
        <div class="hs-pulse"></div>
        <div class="hs-dot"></div>
        <div class="hs-label">—— CHASSIS DETAIL</div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isReady" class="deg-ring">
        <svg viewBox="0 0 80 80" class="deg-svg">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,119,255,0.15)" stroke-width="4"/>
          <circle cx="40" cy="40" r="32" fill="none"
            stroke="#0077FF" stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="`${(yawDeg/360)*201} 201`"
            stroke-dashoffset="0"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div class="deg-val">{{ yawDeg }}</div>
        <div class="deg-label">DEG</div>
      </div>
    </Transition>

    <div class="statusbar" :class="{ visible: isReady }">
      <span class="status-item">STATUS <span class="blue">READY</span></span>
      <span class="status-center">⊙ Model siap — drag putar · scroll zoom</span>
      <span class="status-item blue">{{ yawDeg }}°</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps({
  modelPath: { type: String, default: '/models/car.glb' },
  active:    { type: Boolean, default: false }
})
defineEmits(['back', 'chassis', 'ready'])

const viewerEl  = ref(null)
const canvasRef = ref(null)
const isReady   = ref(false)
const loadPct   = ref(0)
const yawDeg    = ref(0)
const hotspotX  = ref(-999)
const hotspotY  = ref(-999)

const specs = [
  { label: 'Dimensi',   value: '4,420 × 2,020 mm' },
  { label: 'Wheelbase', value: '2,660 mm' },
  { label: 'Berat',     value: '1,680 kg' },
  { label: 'Torsi',     value: '450 Nm' },
  { label: 'Suspensi',  value: 'Multi-link' },
]

let renderer, scene, camera, animId
let car = null
let isDragging = false, lastX = 0, prevX = 0
let yaw = 0, yawVel = 0
let camZ = 6.0
const CAM_Z_MIN = 3.0, CAM_Z_MAX = 10.0
const CAM_Y    = 1.5
const CAM_LOOK = new THREE.Vector3(0, 0.6, 0)

let entryActive = false, entryT = 0
const ENTRY_X_START = 14
const ENTRY_DURATION = 1.6

let hotspotLocal = new THREE.Vector3()

function init() {
  const W = window.innerWidth, H = window.innerHeight

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(W, H)
  renderer.shadowMap.enabled   = true
  renderer.shadowMap.type      = THREE.PCFSoftShadowMap
  renderer.toneMapping         = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.6
  renderer.outputColorSpace    = THREE.SRGBColorSpace

  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200)
  camera.position.set(0, CAM_Y, camZ)
  camera.lookAt(CAM_LOOK)

  buildLights()
  buildGround()
  loadModel()

  canvasRef.value.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('resize', onResize)
  animate()
}

function buildLights() {
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()

  const envScene = new THREE.Scene()
  const panelGeo = new THREE.PlaneGeometry(20, 20)
  const panelMat = (intensity) => new THREE.MeshBasicMaterial({
    color: new THREE.Color(intensity, intensity, intensity),
    side: THREE.BackSide
  })

  const top = new THREE.Mesh(panelGeo, panelMat(1.0))
  top.position.y = 8; top.rotation.x = Math.PI / 2
  envScene.add(top)

  const front = new THREE.Mesh(panelGeo, panelMat(0.85))
  front.position.z = -8
  envScene.add(front)

  const back = new THREE.Mesh(panelGeo, panelMat(0.7))
  back.position.z = 8; back.rotation.y = Math.PI
  envScene.add(back)

  const left = new THREE.Mesh(panelGeo, panelMat(0.75))
  left.position.x = -8; left.rotation.y = Math.PI / 2
  envScene.add(left)

  const right = new THREE.Mesh(panelGeo, panelMat(0.75))
  right.position.x = 8; right.rotation.y = -Math.PI / 2
  envScene.add(right)

  const bottom = new THREE.Mesh(panelGeo, panelMat(0.4))
  bottom.position.y = -8; bottom.rotation.x = -Math.PI / 2
  envScene.add(bottom)

  const envTexture = pmrem.fromScene(envScene).texture
  scene.environment = envTexture
  scene.environmentIntensity = 1.6
  pmrem.dispose()

  scene.add(new THREE.AmbientLight(0xffffff, 1.0))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
  keyLight.position.set(4, 4, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near   = 0.5
  keyLight.shadow.camera.far    = 30
  keyLight.shadow.camera.left   = -5
  keyLight.shadow.camera.right  =  5
  keyLight.shadow.camera.top    =  5
  keyLight.shadow.camera.bottom = -5
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.2)
  fillLight.position.set(-4, 2, 5)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xddeeff, 0.6)
  rimLight.position.set(0, 3, -6)
  scene.add(rimLight)
}

function buildGround() {
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.15 })
  )
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.y = 0
  shadowPlane.receiveShadow = true
  scene.add(shadowPlane)
}

function loadModel() {
  let loadTimer = setInterval(() => {
    if (loadPct.value < 85) loadPct.value += 10 + Math.floor(Math.random() * 8)
    else loadPct.value = Math.min(loadPct.value + 1, 95)
  }, 150)

  const loader = new GLTFLoader()
  loader.load(
    props.modelPath,
    (gltf) => {
      clearInterval(loadTimer)
      loadPct.value = 100

      const model = gltf.scene

      const box0   = new THREE.Box3().setFromObject(model)
      const size0  = box0.getSize(new THREE.Vector3())
      const maxDim = Math.max(size0.x, size0.y, size0.z)
      const scale  = 4.0 / maxDim
      model.scale.setScalar(scale)
      model.updateMatrixWorld(true)

      const box1   = new THREE.Box3().setFromObject(model)
      const center = box1.getCenter(new THREE.Vector3())
      model.position.x -= center.x
      model.position.z -= center.z
      model.position.y -= box1.min.y
      model.updateMatrixWorld(true)

      car = new THREE.Group()
      car.add(model)

      model.traverse(n => {
        if (!n.isMesh) return
        n.castShadow    = true
        n.receiveShadow = true
        n.frustumCulled = false

        const mats = Array.isArray(n.material) ? n.material : [n.material]
        mats.forEach(m => {
          if (!m) return
          const mn = (m.name || '').toLowerCase()

          if (
            mn === 'carpaint_color' ||
            mn.includes('carpaint') ||
            mn.includes('car_paint') ||
            mn.includes('body_paint')
          ) {
            m.roughness       = 0.18
            m.metalness       = 0.80
            m.envMapIntensity = 2.0
            m.needsUpdate     = true
            return
          }

          if (
            mn.includes('glass') ||
            mn.includes('window') ||
            mn.includes('windshield') ||
            mn.includes('windscreen') ||
            mn.includes('kaca') ||
            mn.includes('front_glass') ||
            mn.includes('rear_glass') ||
            mn.includes('side_glass')
          ) {
            m.transparent     = true
            m.opacity         = 0.28
            m.roughness       = 0.02
            m.metalness       = 0.05
            m.envMapIntensity = 1.8
            m.depthWrite      = false
            m.color.setRGB(0.7, 0.85, 1.0)
            m.needsUpdate     = true
            return
          }

          if (mn.startsWith('plastic') || mn === 'tyre' || mn === 'tyre.bump') {
            const br = m.color.r * 0.299 + m.color.g * 0.587 + m.color.b * 0.114
            if (br < 0.06) {
              m.color.setRGB(0.10, 0.10, 0.11)
              m.roughness       = 0.75
              m.metalness       = 0.05
              m.envMapIntensity = 0.8
              m.needsUpdate     = true
            }
            return
          }

          if (mn.startsWith('metal-darker')) {
            m.color.r = Math.min(m.color.r * 3, 1)
            m.color.g = Math.min(m.color.g * 3, 1)
            m.color.b = Math.min(m.color.b * 3, 1)
            m.envMapIntensity = 1.5
            m.needsUpdate     = true
            return
          }

          if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
            m.envMapIntensity = (m.envMapIntensity || 1.0) * 1.4
            m.needsUpdate     = true
          }
        })
      })

      const boxFinal = new THREE.Box3().setFromObject(car)
      const sf       = boxFinal.getSize(new THREE.Vector3())
      const mxF      = boxFinal.max
      hotspotLocal.set(0, sf.y * 0.72, mxF.z * 0.50)

      car.position.x = ENTRY_X_START
      scene.add(car)

      entryActive = true
      entryT      = 0
    },
    undefined,
    (err) => { console.error('GLB error:', err); clearInterval(loadTimer) }
  )
}

function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t) }

function animate() {
  animId = requestAnimationFrame(animate)

  if (!car) { renderer.render(scene, camera); return }

  if (entryActive) {
    entryT = Math.min(entryT + (1 / (ENTRY_DURATION * 60)), 1)
    const e = easeOutExpo(entryT)
    car.position.x = ENTRY_X_START * (1 - e)

    if (entryT > 0.85) {
      car.position.y = Math.sin((entryT - 0.85) / 0.15 * Math.PI) * 0.05
    }

    if (entryT >= 1) {
      car.position.set(0, 0, 0)
      entryActive   = false
      isReady.value = true
    }
  }

  if (!isDragging) {
    yawVel *= 0.92
    yaw    += yawVel * 0.004
    if (Math.abs(yawVel) < 0.05 && !entryActive) yaw += 0.002
  }
  car.rotation.y = yaw
  yawDeg.value   = Math.round(((yaw * 180 / Math.PI) % 360 + 360) % 360)

  camera.position.z += (camZ - camera.position.z) * 0.1
  camera.lookAt(CAM_LOOK)

  if (isReady.value) {
    const wp  = hotspotLocal.clone()
    wp.applyEuler(new THREE.Euler(0, car.rotation.y, 0))
    wp.add(car.position)
    const ndc = wp.clone().project(camera)
    const W   = renderer.domElement.clientWidth
    const H   = renderer.domElement.clientHeight
    hotspotX.value = ( ndc.x *  0.5 + 0.5) * W
    hotspotY.value = (-ndc.y *  0.5 + 0.5) * H
  }

  renderer.render(scene, camera)
}

function onWheel(e) {
  camZ = Math.max(CAM_Z_MIN, Math.min(CAM_Z_MAX, camZ + e.deltaY * 0.007))
}
function onResize() {
  const W = window.innerWidth, H = window.innerHeight
  renderer.setSize(W, H)
  camera.aspect = W / H
  camera.updateProjectionMatrix()
}

let lastPinchDist = 0
function onPointerDown(e) {
  if (entryActive) return
  isDragging = true
  lastX = prevX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  yawVel = 0
}
function onPointerMove(e) {
  if (!isDragging) return
  const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  yaw    += (x - lastX) * 0.010
  yawVel  = x - prevX
  prevX   = lastX; lastX = x
}
function onPointerUp() { isDragging = false }

function onTouchStart(e) {
  if (e.touches.length === 2) {
    lastPinchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  } else onPointerDown(e)
}
function onTouchMove(e) {
  if (e.touches.length === 2) {
    const d = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    camZ = Math.max(CAM_Z_MIN, Math.min(CAM_Z_MAX, camZ + (lastPinchDist - d) * 0.025))
    lastPinchDist = d
  } else onPointerMove(e)
}

onMounted(() => {
  init()
  const el = viewerEl.value
  el.addEventListener('pointerdown',  onPointerDown)
  el.addEventListener('pointermove',  onPointerMove)
  el.addEventListener('pointerup',    onPointerUp)
  el.addEventListener('pointerleave', onPointerUp)
  el.addEventListener('touchstart',   onTouchStart,  { passive: true })
  el.addEventListener('touchmove',    onTouchMove,   { passive: true })
  el.addEventListener('touchend',     onPointerUp)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  renderer?.dispose()
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.viewer {
  position: absolute; inset: 0;
  background: linear-gradient(155deg, #F0F2F5 0%, #E8ECF2 50%, #EEF1F7 100%);
  overflow: hidden;
}

.three-canvas {
  position: absolute; inset: 0;
  width: 100% !important; height: 100% !important;
  cursor: grab;
}
.three-canvas:active { cursor: grabbing; }

.loading-overlay {
  position: absolute; inset: 0;
  background: rgba(240,242,245,0.92);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.loading-inner { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.loading-spinner {
  width: 40px; height: 40px;
  border: 1.5px solid rgba(0,119,255,0.2);
  border-top-color: #0077FF;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text {
  font-family: var(--font-mono); font-size: 11px;
  letter-spacing: 0.2em; color: #0077FF;
}
.loading-bar-wrap {
  width: 180px; height: 2px;
  background: rgba(0,119,255,0.15); border-radius: 1px; overflow: hidden;
}
.loading-bar-fill { height: 100%; background: #0077FF; transition: width 0.2s; }
.loading-pct {
  font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: #0077FF;
}

.topbar {
  position: absolute; top: 0; left: 0; right: 0; height: 52px;
  background: rgba(255,255,255,0.78); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,119,255,0.1);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; z-index: 10;
  opacity: 0; transform: translateY(-100%);
  transition: opacity 0.5s, transform 0.5s;
}
.topbar.visible { opacity: 1; transform: translateY(0); }
.topbar-left { display: flex; align-items: center; gap: 16px; }
.topbar-brand { font-family: var(--font-display); font-size: 14px; font-weight: 700; letter-spacing: .05em; color: #0F1117; }
.blue { color: #0077FF; }
.tb-sep { width: 1px; height: 18px; background: #E8EAED; }
.topbar-sub { font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em; color: #0077FF; }
.topbar-right { display: flex; align-items: center; gap: 8px; }

.tab {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
  padding: 6px 14px; border-radius: 4px;
  border: 1px solid #E8EAED; background: transparent;
  color: #8892A0; cursor: pointer; transition: all .2s;
}
.tab.active { background: #0077FF; border-color: #0077FF; color: white; box-shadow: 0 0 12px rgba(0,119,255,0.4); }
.tab:hover:not(.active) { border-color: #0077FF; color: #0077FF; }

.btn-back {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em;
  padding: 6px 14px; border-radius: 4px;
  border: 1px solid #E8EAED; background: white;
  color: #3D4450; cursor: pointer; margin-left: 8px; transition: all .2s;
}

.spec-card {
  position: absolute; left: 24px; top: 68px;
  background: rgba(255,255,255,0.82); backdrop-filter: blur(16px);
  border: 1px solid rgba(0,119,255,0.12); border-radius: 8px;
  padding: 16px 18px; min-width: 200px; z-index: 10;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
}
.spec-title { font-family: var(--font-mono); font-size: 9px; letter-spacing: .25em; color: #0077FF; margin-bottom: 12px; }
.spec-row {
  display: flex; justify-content: space-between; gap: 24px;
  font-size: 12px; padding: 5px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.spec-label { color: #8892A0; }
.spec-val { font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: #0F1117; }
.spec-hint { font-family: var(--font-mono); font-size: 9px; color: #0077FF; margin-top: 10px; letter-spacing: .05em; }

.hotspot {
  position: absolute; transform: translate(-50%, -50%);
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; z-index: 20;
}
.hs-dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: #0077FF; box-shadow: 0 0 0 3px rgba(0,119,255,0.25);
  flex-shrink: 0; position: relative; z-index: 2;
}
.hs-pulse {
  position: absolute; width: 30px; height: 30px; border-radius: 50%;
  background: rgba(0,119,255,0.2); transform: translate(-8px,-8px);
  animation: hs-pulse 2s ease-in-out infinite;
}
@keyframes hs-pulse {
  0%,100% { transform: translate(-8px,-8px) scale(0.8); opacity: 0.8; }
  50%      { transform: translate(-8px,-8px) scale(1.4); opacity: 0; }
}
.hs-label {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em;
  color: #0F1117; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
  padding: 4px 10px; border-radius: 4px;
  border: 1px solid rgba(0,119,255,0.2); white-space: nowrap;
  transition: all .2s;
}
.hotspot:hover .hs-label { background: #0077FF; color: white; }

.deg-ring {
  position: absolute; right: 28px; top: 50%; transform: translateY(-50%);
  width: 96px; text-align: center; z-index: 10;
  background: rgba(255,255,255,0.82); backdrop-filter: blur(12px);
  border: 1px solid rgba(0,119,255,0.1); border-radius: 50%;
  padding: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.deg-svg { width: 76px; height: 76px; display: block; margin: 0 auto; }
.deg-val { font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: #0F1117; }
.deg-label { font-family: var(--font-mono); font-size: 8px; letter-spacing: .2em; color: #0077FF; }

.statusbar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 40px;
  background: rgba(255,255,255,0.75); backdrop-filter: blur(12px);
  border-top: 1px solid rgba(0,119,255,0.08);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; z-index: 10;
  opacity: 0; transform: translateY(100%);
  transition: opacity 0.5s 0.3s, transform 0.5s 0.3s;
}
.statusbar.visible { opacity: 1; transform: translateY(0); }
.status-item { font-family: var(--font-mono); font-size: 10px; letter-spacing: .1em; color: #8892A0; }
.status-center { font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; color: #9EA8B5; }

.fade-enter-active, .fade-leave-active { transition: opacity .4s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.slide-left-enter-active { transition: all .6s .2s cubic-bezier(0.16,1,0.3,1); }
.slide-left-enter-from   { opacity: 0; transform: translateX(-20px); }

.pop-in-enter-active { transition: all .4s .5s cubic-bezier(0.16,1,0.3,1); }
.pop-in-enter-from   { opacity: 0; transform: translate(-50%,-50%) scale(0.5); }
</style>