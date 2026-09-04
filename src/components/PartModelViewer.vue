<template>
  <div class="part-model-viewer" ref="wrapEl">
    <canvas ref="canvasEl"></canvas>
    <div v-if="loading" class="pmv-loading">
      <span class="pmv-spinner"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const props = defineProps({
  src: { type: String, required: true },
  autoRotate: { type: Boolean, default: true },
  tintColor: { type: String, default: null },  
  metalness: { type: Number, default: null },
  roughness: { type: Number, default: null },
  baseRotationX: { type: Number, default: 0 },
  cameraZoom: { type: Number, default: 1 },
})
const emit = defineEmits(['error', 'loaded'])

const wrapEl   = ref(null)
const canvasEl = ref(null)
const loading  = ref(true)

let renderer, scene, camera, model, animId, resizeObserver
let isDragging = false, lastX = 0, lastY = 0
let rotX = 0.12, rotY = 0.5
let velX = 0, velY = 0

let distance = 2.0
const DEFAULT_DISTANCE   = 2.0
const ZOOM_MAX_DISTANCE  = 6
const FALLBACK_MIN_DIST  = 1.6
let safeMinDistance = FALLBACK_MIN_DIST

function init() {
  const w = wrapEl.value.clientWidth  || 400
  const h = wrapEl.value.clientHeight || 400

  scene  = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100)

  renderer = new THREE.WebGLRenderer({ canvas: canvasEl.value, antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  envScene.add(new THREE.HemisphereLight(0xd7e8ff, 0x0a0f1a, 1.8))
  scene.environment = pmrem.fromScene(envScene, 0.04).texture

  scene.add(new THREE.AmbientLight(0xffffff, 0.85))

  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(3, 4, 4)
  scene.add(key)

  const rim = new THREE.DirectionalLight(0x4fa8ff, 1.3)
  rim.position.set(-4, 2, -3)
  scene.add(rim)

  const rim2 = new THREE.DirectionalLight(0x6fc0ff, 1.0)
  rim2.position.set(4, 1.5, -2)
  scene.add(rim2)

  const fill = new THREE.DirectionalLight(0x88c4ff, 0.9)
  fill.position.set(0, -3, 3)
  scene.add(fill)

  const fill2 = new THREE.DirectionalLight(0xffffff, 0.6)
  fill2.position.set(0, 0, 5)
  scene.add(fill2)

  loadModel(props.src)
  animate()

  resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(wrapEl.value)
}

const MATERIAL_PROFILES = [
  { match: /disk_rotor|disc_rotor|rotor/i, color: '#7d8085', metalness: 0.7,  roughness: 0.4  },
  { match: /wheel_bearing|bearing/i,       color: '#d3d7dc', metalness: 0.8,  roughness: 0.25 },
  { match: /brake_pad/i,                   color: '#63656a', metalness: 0.2,  roughness: 0.62 },
  { match: /shock_absorber/i,              color: '#565a60', metalness: 0.5,  roughness: 0.35 },
  { match: /bushing/i,                     color: '#5c5f64', metalness: 0.05, roughness: 0.78 },
  { match: /link_stabilizer/i,             color: '#8f9297', metalness: 0.7,  roughness: 0.35 },
  { match: /lower_arm/i,                   color: '#83868b', metalness: 0.65, roughness: 0.4  },
  { match: /upper_arm/i,                   color: '#8a8d92', metalness: 0.65, roughness: 0.4  },
  { match: /tie_rod/i,                     color: '#9ea1a6', metalness: 0.7,  roughness: 0.32 },
  { match: /rack_steering_assy/i,          color: '#aeb2b7', metalness: 0.6,  roughness: 0.35 },
]
const DEFAULT_PROFILE = { color: '#93969b', metalness: 0.5, roughness: 0.45 }

function resolveMaterial(src) {
  const found = MATERIAL_PROFILES.find(p => p.match.test(src || '')) || DEFAULT_PROFILE
  return {
    color:     props.tintColor ?? found.color,
    metalness: props.metalness ?? found.metalness,
    roughness: props.roughness ?? found.roughness,
  }
}

function applyTint(root, src) {
  const { color, metalness, roughness } = resolveMaterial(src)
  root.traverse((child) => {
    if (child.isMesh) {
      const oldMats = Array.isArray(child.material) ? child.material : [child.material]
      const newMats = oldMats.map((old) => {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          metalness,
          roughness,
          map: old?.map || null,
          normalMap: old?.normalMap || null,
        })
        old?.dispose?.()
        return mat
      })
      child.material = Array.isArray(child.material) ? newMats : newMats[0]
    }
  })
}

const FORCE_DEBUG_MATERIAL = false
function forceDebugMaterial(root) {
  root.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    }
  })
}

function loadModel(src) {
  loading.value = true
  const loader = new GLTFLoader()
  loader.load(
    src,
    (gltf) => {
      if (model) { scene.remove(model); disposeModel(model) }
      model = gltf.scene

      console.log('[PartModelViewer] ✅ loaded:', src)
      let meshCount = 0
      model.traverse((child) => { if (child.isMesh) meshCount++ })
      console.log('[PartModelViewer] total mesh ditemukan:', meshCount)

      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3();   box.getSize(size)
      const center = new THREE.Vector3(); box.getCenter(center)

      console.log('[PartModelViewer] size:', { x: size.x, y: size.y, z: size.z })
      console.log('[PartModelViewer] center (sebelum scale):', { x: center.x, y: center.y, z: center.z })

      const sphere = box.getBoundingSphere(new THREE.Sphere())
      const sphereRadius = sphere.radius || 0.7

      const TARGET_RADIUS = 1.2
      const scaleFactor = TARGET_RADIUS / sphereRadius

      model.scale.setScalar(scaleFactor)
      model.position.set(
        -center.x * scaleFactor,
        -center.y * scaleFactor,
        -center.z * scaleFactor
      )

      const scaledSizeX = size.x * scaleFactor
      const scaledSizeY = size.y * scaleFactor
      const scaledSizeZ = size.z * scaleFactor

      const cylinderRadius = 0.5 * Math.sqrt(scaledSizeX * scaledSizeX + scaledSizeZ * scaledSizeZ)
      const halfHeight = scaledSizeY / 2

      const vFovRad = THREE.MathUtils.degToRad(camera.fov)
      const canvasAspect = camera.aspect || 1
      const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * canvasAspect)

      const distForHeight = halfHeight / Math.tan(vFovRad / 2)
      const distForWidth  = cylinderRadius / Math.tan(hFovRad / 2)

      const ZOOM_MARGIN = 1.08
      const rawMinDist = Math.max(distForHeight, distForWidth)
      safeMinDistance = Math.max(0.4, rawMinDist * ZOOM_MARGIN)

      console.log('[PartModelViewer] cylinder radius / halfHeight (scaled):', cylinderRadius.toFixed(3), halfHeight.toFixed(3))
      console.log('[PartModelViewer] safeMinDistance:', safeMinDistance.toFixed(3))

      const zoom = Math.max(0.5, Math.min(1, props.cameraZoom))
      distance = Math.max(safeMinDistance * zoom, Math.min(DEFAULT_DISTANCE * zoom, ZOOM_MAX_DISTANCE))

      if (FORCE_DEBUG_MATERIAL) {
        forceDebugMaterial(model)
        console.log('[PartModelViewer] 🔴 FORCE_DEBUG_MATERIAL aktif')
      } else {
        applyTint(model, src)
      }

      scene.add(model)
      loading.value = false
      emit('loaded')
    },
    undefined,
    (err) => {
      console.error('[PartModelViewer] ❌ Gagal load model:', src, err)
      loading.value = false
      emit('error')
    }
  )
}

function disposeModel(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => { Object.values(m).forEach(v => v?.isTexture && v.dispose()); m.dispose() })
    }
  })
}

function onResize() {
  if (!wrapEl.value || !renderer) return
  const w = wrapEl.value.clientWidth, h = wrapEl.value.clientHeight
  if (!w || !h) return
  renderer.setSize(w, h)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
}

function animate() {
  animId = requestAnimationFrame(animate)
  if (!isDragging && props.autoRotate) rotY += 0.0035
  rotY += velX; rotX += velY
  velX *= 0.9; velY *= 0.9
  rotX = Math.max(-0.6, Math.min(0.6, rotX))

  if (model) {
    model.rotation.y = rotY
    model.rotation.x = props.baseRotationX + rotX * 0.4
  }

  camera.position.set(Math.sin(rotY * 0.001) * 0, 0.5, distance)
  camera.lookAt(0, 0, 0)
  renderer.render(scene, camera)
}

function onPointerDown(e) { isDragging = true; lastX = e.clientX; lastY = e.clientY }
function onPointerMove(e) {
  if (!isDragging) return
  velX = (e.clientX - lastX) * 0.006
  velY = -(e.clientY - lastY) * 0.006
  lastX = e.clientX; lastY = e.clientY
}
function onPointerUp() { isDragging = false }
function onWheel(e) {
  e.preventDefault()
  distance = Math.max(safeMinDistance, Math.min(ZOOM_MAX_DISTANCE, distance + e.deltaY * 0.0025))
}

watch(() => props.src, (newSrc) => {
  if (renderer && newSrc) loadModel(newSrc)
})

watch(() => [props.tintColor, props.metalness, props.roughness], () => {
  if (model && !FORCE_DEBUG_MATERIAL) applyTint(model, props.src)
})

onMounted(() => {
  init()
  const el = wrapEl.value
  el.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  el.addEventListener('wheel', onWheel, { passive: false })
})
onUnmounted(() => {
  cancelAnimationFrame(animId)
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (model) disposeModel(model)
  renderer?.dispose()
})
</script>

<style scoped>
.part-model-viewer { position: relative; width: 100%; height: 100%; touch-action: none; cursor: grab; }
.part-model-viewer:active { cursor: grabbing; }
canvas { display: block; width: 100%; height: 100%; }
.pmv-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.pmv-spinner { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(80,160,255,0.25); border-top-color: #3399FF; animation: pmv-spin 0.8s linear infinite; }
@keyframes pmv-spin { to { transform: rotate(360deg); } }
</style> 