<template>
    <div class="chassis-viewer" ref="viewerEl" :class="{ 'has-active': activeHs !== null }">

      <div class="cursor-dot" ref="cursorDot"></div>
      <div class="cursor-ring" ref="cursorRing">
        <svg class="cursor-svg" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="rgba(0,102,230,0.5)" stroke-width="1" stroke-dasharray="4 3"/>
        </svg>
      </div>

      <div class="bg-photo"></div>
      <div class="bg-overlay"></div>
      <div class="bg-vignette"></div>
      <div class="bg-grid"></div>
      <div class="bg-radial"></div>
      <div class="bg-scan"></div>

      <div class="hero-glow"></div>
      <div class="hero-glow hero-glow--orange"></div>

      <div class="bg-logo-wrap">
        <div class="bg-logo-ring bg-logo-ring-1"></div>
        <div class="bg-logo-ring bg-logo-ring-2"></div>
        <img src="/images/TRAD Logo.png" alt="" class="bg-logo-img" />
      </div>

      <div class="speed-lines">
        <div v-for="i in 10" :key="i" class="speed-line" :style="speedStyle(i)"></div>
      </div>

      <div class="hud-corner hud-tl"><div class="hud-h"></div><div class="hud-v"></div><span class="hud-lbl">{{ t('chassis_view') }}</span></div>
      <div class="hud-corner hud-tr"><div class="hud-h"></div><div class="hud-v"></div><span class="hud-lbl">{{ hotspots.length }} {{ t('parts_count_suffix') }}</span></div>
      <div class="hud-corner hud-bl"><div class="hud-h"></div><div class="hud-v"></div><span class="hud-lbl">{{ t('zoom_prefix') }}{{ Math.round(scale * 100) }}%</span></div>
      <div class="hud-corner hud-br"><div class="hud-h"></div><div class="hud-v"></div><span   class="hud-lbl">{{ t('drag_pan') }}</span></div>

      <div class="topbar">
        <div class="topbar-left">
          <img src="/images/TRAD Logo.png" alt="TRAD" class="trad-logo-bar" />
          <div class="tb-sep"></div>
          <div class="topbar-text-group">
            <span class="topbar-brand">CAR <span class="accent">360°</span></span>
            <span class="topbar-sub">{{ t('chassis_detail_view') }}</span>
          </div>
        </div>
        <div class="topbar-center">
          <div class="topbar-pill">
            <span class="topbar-pill-dot"></span>
            <span>{{ hotspots.length }} {{ t('suspension_parts_suffix') }}</span>
          </div>
        </div>
        <div class="topbar-right">
          <button class="tab" @click="$emit('exterior')">{{ t('tab_exterior') }}</button>
          <button class="tab tab--active">{{ t('tab_chassis') }}</button>
        </div>
      </div>

      <div class="left-sidebar" :class="{ hidden: activeHs !== null }">
        <div class="sidebar-header">
          <div class="sidebar-dot"></div>
          <span class="sidebar-title">{{ t('part_list') }}</span>
        </div>
        <div class="sidebar-list">
          <div
            v-for="(hs, i) in hotspots"
            :key="i"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': activeHs === i, 'sidebar-item--empty': !hs.brandVariants || !hs.brandVariants.length }"
            role="button"
            tabindex="0"
            @click="openPopup(i)"
            @keydown.enter="openPopup(i)"
            @keydown.space.prevent="openPopup(i)"
          >
            <span class="sidebar-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="sidebar-item-info">
              <span class="sidebar-name">{{ hs.label }}</span>
              <div class="sidebar-brands">
                <span v-for="(bv, bi) in hs.brandVariants" :key="bi" class="sidebar-brand-dot" :title="bv.brand">{{ bv.brand }}</span>
                <span v-if="!hs.brandVariants || !hs.brandVariants.length" class="sidebar-brand-dot sidebar-brand-dot--empty">{{ t('no_data') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="zoom-controls">
        <button class="zoom-btn" @click="zoomIn">
          <svg viewBox="0 0 16 16" fill="none"><line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="zoom-track">
          <div class="zoom-fill" :style="{ height: ((scale - 0.4) / 3.6 * 100) + '%' }"></div>
          <div class="zoom-thumb" :style="{ bottom: ((scale - 0.4) / 3.6 * 100) + '%' }"></div>
        </div>
        <button class="zoom-btn" @click="zoomOut">
          <svg viewBox="0 0 16 16" fill="none"><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        <div class="zoom-divider"></div>
        <button class="zoom-btn zoom-btn--reset" @click="resetView">
          <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/></svg>
        </button>
        <span class="zoom-pct">{{ Math.round(scale * 100) }}%</span>
      </div>

      <div
        class="canvas-area"
        ref="canvasEl"
        @wheel.prevent="onWheel"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerUp"
      >
        <div class="canvas-inner" :class="{ 'animate-transform': !isPanning }"
          :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale})`, transformOrigin: '50% 50%' }">

          <div class="stage">
            <div class="img-wrap">
              <div class="img-halo"></div>
              <div class="img-ring img-ring--1"></div>
              <div class="img-ring img-ring--2"></div>
              <div class="img-float">
                <img class="chassis-img" src="/images/chassis.png" alt="Chassis"
                  draggable="false" ref="imgRef" @load="onImgLoad"
                  decoding="async" fetchpriority="high" />
              </div>
            </div>

            <div v-for="(hs, i) in hotspots" :key="i"
              v-if="!isGroupedFollower(i)"
              class="hotspot" :class="{ active: activeHs === i, 'hotspot--empty': !hs.brandVariants || !hs.brandVariants.length }"
              :style="hotspotStyle(i)"
              @click.stop="handleHotspotClick(i)">
              <div class="hs-pulse hs-p1"></div>
              <div class="hs-pulse hs-p2"></div>
              <div class="hs-core">
                <div class="hs-num">{{ hotspotNumber(i) }}</div>
              </div>
              <div class="hs-tag" :class="hs.labelDir || 'right'">
                <span class="hs-tag-line"></span>
                <div class="hs-tag-body">
                  <span class="hs-tag-name">{{ hs.label }}</span>
                  <span v-if="hs.brandVariants && hs.brandVariants.length" class="hs-tag-brand">{{ hs.brandVariants.map(b => b.brand).join(' · ') }}</span>
                <span v-else class="hs-tag-brand hs-tag-brand--empty">{{ t('no_data_yet') }}</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      <Transition name="popup">
        <div v-if="choicePair" class="part-choice-overlay" @click.self="choicePair = null">
          <div class="part-choice-card">
            <span class="part-choice-title">{{ t('part_list') }}</span>
            <span class="part-choice-sub">PILIH NOMOR PART</span>
            <div class="part-choice-buttons">
              <button v-for="index in choicePair" :key="index" class="part-choice-btn" @click="selectGroupedPart(index)">
                {{ String(index + 1).padStart(2, '0') }}
              </button>
            </div>
            <button class="part-choice-close" @click="choicePair = null">×</button>
          </div>
        </div>
      </Transition>

      <Transition name="popup">
        <div v-if="activeHs !== null" class="popup-overlay" @click.self="closePopup">

          <div class="popup-card popup-card--redesign">

            <div class="rd-bg"></div>
            <div class="rd-bg-overlay"></div>

            <!-- Close -->
            <button class="popup-close" @click="closePopup">✕</button>

            <div class="rd-layout">

              <div v-if="currentHs.brandVariants.length > 1" class="rd-brand-select">
                <span class="rd-brand-select-label">{{ t('select_brand') }}</span>
                <div class="rd-brand-tabs">
                  <button
                    v-for="(bv, bi) in currentHs.brandVariants" :key="bi"
                    class="rd-brand-tab" :class="{ 'rd-brand-tab--active': activeBrand === bi }"
                    @click="switchBrand(bi)"
                  >
                    <span v-if="bv.brandLogo" class="rd-brand-tab-logo-box"><img :src="bv.brandLogo" :alt="bv.brand" class="rd-brand-tab-logo" /></span>
                    <span v-else class="rd-brand-tab-name">{{ bv.brand }}</span>
                    <span v-if="activeBrand === bi" class="rd-brand-tab-check">✓</span>
                  </button>
                </div>
              </div>

              <div class="rd-header">
                <span class="rd-index">{{ String(activeHs + 1).padStart(2, '0') }}</span>
                <div class="rd-header-text">
                  <span class="rd-eyebrow">{{ t('suspension_component') }}</span>
                  <h2 class="rd-title">{{ currentHs.label }}</h2>
                </div>
              </div>

              <div class="rd-tabs" role="tablist" aria-label="Part information">
                <button class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'model' }" @click="popupTab = 'model'">3D MODEL</button>
                <button v-if="specifications.length" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'specs' }" @click="popupTab = 'specs'">SPESIFIKASI</button>
                <button v-if="currentVariant.profile" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'brand' }" @click="popupTab = 'brand'">PROFIL MEREK</button>
                <button v-if="productHighlights.length || currentVariant.profile?.advantages?.length" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'highlights' }" @click="popupTab = 'highlights'">HIGHLIGHT</button>
              </div>

              <div class="rd-main" :class="{
                'rd-main--highlights': popupTab === 'highlights',
                'rd-main--brand': popupTab === 'brand'
              }">

                <div class="rd-specs" v-if="popupTab === 'specs' && specifications.length">
                  <span class="rd-panel-title">{{ bl({ en: 'Specifications', id: 'Spesifikasi' }) }}</span>
                  <div class="rd-specs-list">
                    <div v-for="(spec, si) in specifications" :key="si" class="rd-spec-item">
                      <img v-if="spec.icon" :src="iconSrc(spec.icon)" class="rd-icon-slot rd-icon-slot--filled" alt="" />
                      <span v-else class="rd-icon-slot"></span>
                      <span class="rd-spec-text">{{ bl(spec) }}</span>
                    </div>
                  </div>
                </div>

                <div class="rd-stage">

                  <div v-if="popupTab === 'highlights' && productHighlights.length" class="rd-features">
                    <span class="rd-features-label">{{ bl({ en: 'Product Highlights', id: 'Highlight Produk' }) }} ///</span>
                    <div class="rd-features-row">
                      <div v-for="(ph, pi) in productHighlights" :key="'f' + pi" class="rd-feature">
                        <img v-if="ph.icon" :src="iconSrc(ph.icon)" class="rd-icon-slot rd-icon-slot--lg rd-icon-slot--filled" alt="" />
                        <span v-else class="rd-icon-slot rd-icon-slot--lg"></span>
                        <span class="rd-feature-label">{{ bl(ph) }}</span>
                        <span v-if="pi < productHighlights.length - 1" class="rd-feature-connector"></span>
                      </div>
                    </div>
                  </div>

                  <div v-if="popupTab === 'model'" class="rd-stage-visual">

                    <Transition name="hero-swap" mode="out-in">
                      <PartModelViewer
                        v-if="currentVariant.model && !modelFailed[currentVariant.model]"
                        :key="currentVariant.model"
                        :src="currentVariant.model"
                        :tint-color="currentVariant.modelColor"
                        :base-rotation-x="currentVariant.baseRotationX || 0"
                        :camera-zoom="currentVariant.cameraZoom || 1"
                        class="rd-stage-img rd-stage-model"
                        @error="onModelError(currentVariant.model)"
                      />
                      <img
                        v-else-if="currentVariant.image"
                        :key="currentVariant.image"
                        :src="currentVariant.image"
                        :alt="currentHs.label"
                        class="rd-stage-img"
                        decoding="async"
                      />
                      <div v-else :key="'placeholder-' + activeBrand" class="rd-stage-img-placeholder">
                        <span>{{ currentHs.icon }}</span>
                      </div>
                    </Transition>

                    <div class="rd-pedestal-glow"></div>
                  </div>

                </div>

                <Transition name="content-swap" mode="out-in">
                  <div :key="activeBrand" class="rd-profile" v-if="popupTab === 'brand' && currentVariant.profile">

                    <div class="rd-profile-card">
                      <div class="rd-profile-card-header">
                        <span class="rd-profile-dot"></span>
                        <span class="rd-profile-card-title">{{ t('brand_profile') }} ///</span>
                      </div>
                      <div class="rd-profile-brand-row">
                        <span v-if="currentVariant.brandLogo" class="rd-profile-logo-box">
                          <img :src="currentVariant.brandLogo" :alt="currentVariant.brand" />
                        </span>
                        <span v-else class="rd-icon-slot rd-icon-slot--logo"></span>
                        <span class="rd-profile-brand-name">{{ currentVariant.brand }}</span>
                      </div>
                      <div class="rd-profile-facts">
                        <div class="rd-profile-fact" v-if="currentVariant.profile.founded">
                          <span class="rd-fact-lbl">{{ t('founded') }}</span>
                          <span class="rd-fact-val">{{ currentVariant.profile.founded }}</span>
                        </div>
                        <div class="rd-profile-fact" v-if="currentVariant.profile.country">
                          <span class="rd-fact-lbl">{{ t('country') }}</span>
                          <span class="rd-fact-val">{{ bl(currentVariant.profile.country) }}</span>
                        </div>
                        <div class="rd-profile-fact" v-if="currentVariant.profile.hq">
                          <span class="rd-fact-lbl">{{ t('hq') }}</span>
                          <span class="rd-fact-val">{{ currentVariant.profile.hq }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="rd-section" v-if="oemList.length">
                      <span class="rd-panel-title">{{ bl({ en: 'OEM Partner', id: 'Mitra OEM' }) }} ///</span>
                      <div class="rd-oem-list">
                        <span v-for="(name, ni) in oemList" :key="ni" class="rd-icon-slot rd-icon-slot--oem" :title="name">
                          <img :src="oemSrc(name)" :alt="name" v-if="oemSrc(name)" />
                        </span>
                      </div>
                    </div>

                    <div class="rd-section" v-if="currentVariant.profile.specialization">
                      <span class="rd-panel-title">{{ bl({ en: 'Specialization', id: 'Spesialisasi' }) }} ///</span>
                      <div class="rd-spec-block">
                        <img v-if="currentVariant.profile.specialization.icon" :src="iconSrc(currentVariant.profile.specialization.icon)" class="rd-icon-slot rd-icon-slot--filled" alt="" />
                        <span v-else class="rd-icon-slot"></span>
                        <p class="rd-spec-block-text">{{ bl(currentVariant.profile.specialization) }}</p>
                      </div>
                    </div>

                    <div class="rd-section" v-if="currentVariant.profile.historyHighlight && currentVariant.profile.historyHighlight.length">
                      <span class="rd-panel-title">{{ bl({ en: 'History Highlight', id: 'Sorotan Sejarah' }) }} ///</span>
                      <div class="rd-timeline">
                        <div v-for="(step, sti) in currentVariant.profile.historyHighlight" :key="sti" class="rd-timeline-node">
                          <span class="rd-timeline-dot"></span>
                          <span class="rd-timeline-label">{{ bl(step) }}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </Transition>
              </div>

              <div class="rd-advantages" v-if="popupTab === 'highlights' && currentVariant.profile && currentVariant.profile.advantages && currentVariant.profile.advantages.length">
                <span class="rd-panel-title rd-panel-title--boxed">{{ t('advantages') }} ///</span>
                <div class="rd-adv-row">
                  <div v-for="(adv, ai) in currentVariant.profile.advantages" :key="ai" class="rd-adv-col">
                    <img v-if="adv.icon" :src="iconSrc(adv.icon)" class="rd-icon-slot rd-icon-slot--adv rd-icon-slot--filled" alt="" />
                    <span v-else class="rd-icon-slot rd-icon-slot--adv"></span>
                    <span class="rd-adv-label">{{ bl(adv) }}</span>
                  </div>
                </div>
              </div>

              <div class="rd-nav">
                <button class="rd-nav-btn" @click="prevPart" :disabled="activeHs === 0">{{ t('prev') }}</button>
                <button class="rd-nav-cta" @click="closePopup">{{ t('back_to_chassis') }}</button>
                <button class="rd-nav-btn" @click="nextPart" :disabled="activeHs === hotspots.length - 1">{{ t('next') }}</button>
              </div>

            </div>
          </div>

          <div class="video-widget" :class="{ 'video-widget--open': videoExpanded }">

            <button v-if="!videoExpanded" class="vw-fab" @click="videoExpanded = true">
              <span class="vw-fab-ring"></span>
              <svg class="vw-fab-play" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#0066E6"/><polygon points="9,7 16,11 9,15" fill="white"/></svg>
              <span class="vw-fab-label">{{ t('company_profile') }}</span>
            </button>

            <div v-else class="video-widget-card">
              <div class="vw-card-header">
                <span class="vw-logo-box">
                  <img
                    :src="currentVariant?.brandLogo || '/images/TRAD Logo.png'"
                    :alt="currentVariant?.brand || 'TRAD'"
                    class="vw-logo"
                  />
                </span>
                <span class="vw-label">{{ currentVariant?.brand ? currentVariant.brand + ' · ' : '' }}{{ t('company_profile') }}</span>
                <span class="vw-stats">{{ hotspots.length }} {{ t('stat_parts') }} · {{ trustBrands.length }} {{ t('stat_brands') }}</span>
                <button class="vw-close-btn" @click="videoExpanded = false">✕</button>
              </div>
              <div class="video-widget-body">
                <div class="vw-video-wrap">
                  <span class="vw-video-corner vw-video-corner-tl"></span>
                  <span class="vw-video-corner vw-video-corner-br"></span>
                  <iframe
                    v-if="currentVideoConfig.type === 'youtube'"
                    class="vw-iframe"
                    :key="currentVideoKey"
                    :src="currentVideoUrl"
                    :title="(currentVariant?.brand || 'TRAD') + ' Company Profile'"
                    frameborder="0"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
                  <video
                    v-else
                    class="vw-iframe" 
                    :src="currentVideoConfig.src"
                    autoplay
                    muted
                    loop
                    playsinline
                    controls
                  ></video>
                </div>
                <div class="vw-trust-marquee">
                  <div class="vw-trust-track">
                    <span v-for="b in trustBrands" :key="'a-'+b" class="vw-trust-chip">{{ b }}</span>
                    <span v-for="b in trustBrands" :key="'b-'+b" class="vw-trust-chip">{{ b }}</span>
                  </div>
                </div>
                <p class="vw-caption">{{ t('video_caption') }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <div class="statusbar">
        <div class="status-left">
          <span class="status-dot"></span>
          <span class="status-text">{{ t('status_chassis_view') }}</span>
          <span class="status-sep">·</span>
          <span class="status-text dim">{{ t('status_toyota_parts') }}</span>
        </div>
        <div class="status-center">{{ t('status_center') }}</div>
        <div class="status-right">
          <span class="status-text dim">{{ t('status_zoom') }}</span>
          <span class="status-text">{{ Math.round(scale * 100) }}%</span>
          <span class="status-sep">·</span>
          <span class="status-text dim">{{ t('status_parts') }}</span>
          <span class="status-text">{{ hotspots.length }}</span>
        </div>
      </div>

    </div>
  </template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { t, lang } from '../composables/useLang.js'
import PartModelViewer from './PartModelViewer.vue'

defineEmits(['back', 'exterior'])

const viewerEl   = ref(null)
const canvasEl   = ref(null)
const imgRef     = ref(null)
const cursorDot  = ref(null)
const cursorRing = ref(null)

const scale    = ref(0.85)
const panX     = ref(0)
const panY     = ref(0)
const activeHs = ref(null)
const activeBrand = ref(0)
const videoExpanded = ref(false)
const choicePair = ref(null)
const popupTab = ref('model')

const SCALE_MIN    = 0.4
const SCALE_MAX    = 4.0
const ZOOM_HOTSPOT = 2.2
const BASE_SCALE   = 0.85
let portraitBaseScale = BASE_SCALE

let isPanning = false
let lastPanX  = 0
let lastPanY  = 0
const activePointers = new Map()
let lastPinchDistance = 0

// Custom cursor
let ringX = 0, ringY = 0, dotX = 0, dotY = 0
let rafCursor = null

function updateCursor(e) {
  dotX = e.clientX; dotY = e.clientY
  if (cursorDot.value) {
    cursorDot.value.style.left = dotX + 'px'
    cursorDot.value.style.top  = dotY + 'px'
  }
}
function animateCursorRing() {
  ringX += (dotX - ringX) * 0.11
  ringY += (dotY - ringY) * 0.11
  if (cursorRing.value) {
    cursorRing.value.style.left = ringX + 'px'
    cursorRing.value.style.top  = ringY + 'px'
  }
  rafCursor = requestAnimationFrame(animateCursorRing)
}

function speedStyle(i) {
  return {
    top: (8 + i * 8.5) + '%',
    width: (50 + (i * 43) % 110) + 'px',
    animationDuration: (2.8 + (i * 0.21) % 1.8) + 's',
    animationDelay:    ((i * 0.37) % 3.5) + 's',
    opacity: 0.03 + (i % 4) * 0.015,
  }
}

function bl(field) {
  if (field == null) return field
  if (typeof field === 'object' && !Array.isArray(field) && ('en' in field || 'id' in field)) {
    return field[lang.value] ?? field.en ?? field.id
  }
  return field
}

const ICON_BASE = '/images/icons/'
const OEM_BASE = '/images/oem/'
function iconSrc(name) {
  if (!name) return null
  return ICON_BASE + name
}
function oemSrc(name) {
  if (!name) return null
  return OEM_BASE + String(name).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.png'
}

const modelFailed = ref({})
function onModelError(src) { modelFailed.value[src] = true }

const BP = {
  Showa: {
    founded: '1938',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Gyoda, Saitama, Japan (now under Hitachi Astemo)',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Suzuki, Daihatsu',
    specifications: [
      { icon: 'factory.png', en: 'Core OEM suspension supplier to Honda since 1938, now under Hitachi Astemo', id: 'Pemasok OEM suspensi utama Honda sejak 1938, kini di bawah Hitachi Astemo' },
      { icon: 'gear.png', en: 'Specializes in shock absorbers and hydraulic damper systems', id: 'Spesialis shock absorber dan sistem peredam hidrolik' },
      { icon: 'vibration.png', en: 'Decades of hydraulic damping engineering experience', id: 'Puluhan tahun pengalaman rekayasa peredam hidrolik' },
      { icon: 'car.png', en: 'Trusted across Indonesia, Malaysia, Thailand, Philippines, Vietnam', id: 'Dipercaya di Indonesia, Malaysia, Thailand, Filipina, Vietnam' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Shock absorbers and suspension damper systems', id: 'Shock absorber dan sistem peredam suspensi' },
      { icon: 'vibration.png', en: 'Hydraulic damping technology', id: 'Teknologi peredam hidrolik' },
      { icon: 'car.png', en: 'OEM suspension assemblies supplied to Honda', id: 'Rakitan suspensi OEM dipasok ke Honda' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Automotive shock absorbers and damper systems, backed by decades of hydraulic damping engineering.',
      id: 'Shock absorber otomotif dan sistem peredam, didukung rekayasa teknologi peredam hidrolik selama beberapa dekade.',
    },
    historyHighlight: [
      { en: '1938 Established in Japan', id: '1938 Didirikan di Jepang' },
      { en: 'Core OEM supplier to Honda', id: 'Pemasok OEM utama Honda' },
      { en: '2021 Merged into Hitachi Astemo', id: '2021 Bergabung ke Hitachi Astemo' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'car.png', en: 'Primary OEM supplier to Honda for shock absorbers and suspension systems', id: 'Pemasok OEM utama kepada Honda untuk shock absorber dan sistem suspensi otomotif' },
      { icon: 'vibration.png', en: 'Excellent vibration damping across varied road surfaces', id: 'Peredaman getaran yang sangat baik pada berbagai kondisi jalan' },
      { icon: 'gear.png', en: 'Consistent hydraulic performance throughout service life', id: 'Performa hidrolik yang konsisten sepanjang masa pakai' },
      { icon: 'comfort.png', en: 'Superior ride comfort in passenger and performance applications', id: 'Kenyamanan berkendara superior untuk aplikasi penumpang maupun performa' },
      { icon: 'engineering.png', en: 'Advanced engineering heritage from aircraft and motorsport development', id: 'Warisan rekayasa canggih dari pengembangan penerbangan dan motorsport' },
      { icon: 'puzzle.png', en: 'Broad compatibility with Japanese and Asian vehicle platforms', id: 'Kompatibilitas luas dengan platform kendaraan Jepang dan Asia' },
    ],
  },

  KJ: {
    founded: null,
    country: { en: 'Indonesia', id: 'Indonesia' },
    hq: 'Jakarta, Indonesia (TRA Group / PT. Timur Raya Anugerah Damai)',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'factory.png', en: 'Aftermarket suspension brand under PT. Timur Raya Anugerah Damai (TRAD)', id: 'Merek suspensi aftermarket di bawah PT. Timur Raya Anugerah Damai (TRAD)' },
      { icon: 'engineering.png', en: 'Engineered for Japanese and Asian platforms, focused on easy installation', id: 'Direkayasa untuk platform Jepang dan Asia, fokus kemudahan pemasangan' },
      { icon: 'car.png', en: 'Developed for the Indonesian and Southeast Asian replacement market', id: 'Dikembangkan untuk pasar suku cadang pengganti Indonesia dan Asia Tenggara' },
      { icon: 'gear.png', en: "Supported by TRAD's nationwide distribution network", id: 'Didukung jaringan distribusi TRAD di seluruh Indonesia' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Aftermarket shock absorber assemblies', id: 'Rakitan shock absorber aftermarket' },
      { icon: 'puzzle.png', en: 'OEM-compatible mounting dimensions', id: 'Dimensi mounting kompatibel OEM' },
      { icon: 'car.png', en: 'Front and rear suspension dampers', id: 'Damper suspensi depan dan belakang' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Aftermarket suspension developed for the Indonesian and Southeast Asian replacement parts market, engineered for easy installation and consistent damping.',
      id: 'Suspensi aftermarket dikembangkan untuk pasar suku cadang pengganti Indonesia dan Asia Tenggara, direkayasa untuk kemudahan pemasangan dan peredaman konsisten.',
    },
    historyHighlight: [
      { en: 'Developed under TRA Group', id: 'Dikembangkan oleh TRA Group' },
      { en: 'Distributed nationwide via TRAD', id: 'Didistribusikan secara nasional lewat TRAD' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'factory.png', en: 'Competitively priced replacement solution for budget-conscious workshops', id: 'Solusi pengganti berharga kompetitif untuk bengkel yang sadar anggaran' },
      { icon: 'vibration.png', en: 'Reliable damping performance suited to Southeast Asian road conditions', id: 'Performa peredaman yang andal sesuai kondisi jalan Asia Tenggara' },
      { icon: 'puzzle.png', en: 'Wide fitment range covering popular Japanese and Asian vehicle models', id: 'Jangkauan kesesuaian luas mencakup model kendaraan Jepang dan Asia populer' },
      { icon: 'gear.png', en: 'Easy installation with OEM-compatible mounting dimensions', id: 'Pemasangan mudah dengan dimensi mounting yang kompatibel dengan OEM' },
      { icon: 'factory.png', en: 'Strong distribution network ensuring consistent availability', id: 'Jaringan distribusi kuat yang menjamin ketersediaan produk secara konsisten' },
      { icon: 'car.png', en: 'Good service life for everyday passenger vehicle applications', id: 'Masa pakai yang baik untuk aplikasi kendaraan penumpang sehari-hari' },
    ],
  },

  '555': {
    founded: '1960',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Ritto, Shiga, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'factory.png', en: 'Manufactured by Sankei Industry Co., Ltd since 1960', id: 'Diproduksi oleh Sankei Industry Co., Ltd sejak 1960' },
      { icon: 'engineering.png', en: 'ISO 9001 certified since 1999', id: 'Tersertifikasi ISO 9001 sejak 1999' },
      { icon: 'car.png', en: 'Registered in 89 countries, exported to 120+', id: 'Terdaftar di 89 negara, diekspor ke 120+ negara' },
      { icon: 'gear.png', en: '100% dedicated aftermarket manufacturer', id: '100% produsen khusus aftermarket' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Upper control arm assemblies', id: 'Rakitan upper control arm' },
      { icon: 'puzzle.png', en: 'Lower arms, tie rod ends, ball joints, stabilizer links', id: 'Lower arm, tie rod end, ball joint, link stabilizer' },
      { icon: 'engineering.png', en: 'CNC-machined to strict dimensional tolerances', id: 'Dikerjakan CNC sesuai toleransi dimensi yang ketat' },
    ],
    specialization: {
      icon: 'engineering.png',
      en: 'Precision steering and suspension components — upper arms, lower arms, tie rod ends, ball joints, and stabilizer links — all CNC-machined to strict dimensional tolerances.',
      id: 'Komponen kemudi dan suspensi presisi — upper arm, lower arm, tie rod end, ball joint, dan link stabilizer — semua dikerjakan CNC sesuai toleransi dimensi yang ketat.',
    },
    historyHighlight: [
      { en: '1960 Sankei Industry established', id: '1960 Sankei Industry didirikan' },
      { en: '1999 ISO 9001 certified', id: '1999 Sertifikasi ISO 9001' },
      { en: 'Exported to 120+ countries', id: 'Diekspor ke 120+ negara' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'engineering.png', en: 'Manufactured to OEM dimensional tolerances for precise fitment', id: 'Diproduksi sesuai toleransi dimensi OEM untuk kesesuaian yang presisi' },
      { icon: 'factory.png', en: 'High-strength forged steel construction for load-bearing durability', id: 'Konstruksi baja tempa berkekuatan tinggi untuk daya tahan beban' },
      { icon: 'gear.png', en: 'Maintains correct suspension geometry under dynamic driving conditions', id: 'Mempertahankan geometri suspensi yang tepat dalam kondisi berkendara dinamis' },
      { icon: 'car.png', en: 'Supports accurate wheel alignment and consistent tire wear', id: 'Mendukung penyetelan roda yang akurat dan keausan ban yang konsisten' },
      { icon: 'puzzle.png', en: 'Comprehensive vehicle coverage across Japanese and Asian models', id: 'Cakupan kendaraan komprehensif untuk model Jepang dan Asia' },
      { icon: 'factory.png', en: 'Trusted in 120+ countries including Indonesia, Malaysia, Thailand, Philippines, Vietnam', id: 'Dipercaya di lebih dari 120 negara termasuk Indonesia, Malaysia, Thailand, Filipina, Vietnam' },
    ],
  },

  '555-lower': {
    founded: '1960',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Ritto, Shiga, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'engineering.png', en: 'High-tensile steel alloys, precision forged', id: 'Paduan baja tarik tinggi, tempa presisi' },
      { icon: 'gear.png', en: 'CNC-machined mounting points', id: 'Titik mounting dikerjakan CNC' },
      { icon: 'factory.png', en: 'Rigorous fatigue and load testing per unit', id: 'Pengujian kelelahan dan beban ketat per unit' },
      { icon: 'car.png', en: 'Stocked across 120+ countries', id: 'Tersedia di 120+ negara' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Lower control arm assemblies', id: 'Rakitan lower control arm' },
      { icon: 'engineering.png', en: 'High-tensile forged arm units', id: 'Unit arm baja tarik tinggi tempa' },
      { icon: 'factory.png', en: 'Fatigue-tested replacement arms', id: 'Arm pengganti teruji kelelahan' },
    ],
    specialization: {
      icon: 'engineering.png',
      en: 'High-tensile steel lower control arms, precision forged and CNC-machined, verified through rigorous fatigue and load testing.',
      id: 'Lower control arm baja tarik tinggi, ditempa presisi dan dikerjakan CNC, diverifikasi melalui pengujian kelelahan dan beban yang ketat.',
    },
    historyHighlight: [
      { en: '1960 Manufacturing begins', id: '1960 Manufaktur dimulai' },
      { en: 'Rigorous fatigue & load testing standard', id: 'Standar uji kelelahan & beban ketat' },
      { en: 'Stocked in 120+ countries', id: 'Tersedia di 120+ negara' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'engineering.png', en: 'High-tensile steel construction handles heavy load and road impact', id: 'Konstruksi baja tarik tinggi menangani beban berat dan benturan jalan' },
      { icon: 'gear.png', en: 'Precision-machined mounting points maintain correct suspension geometry', id: 'Titik mounting yang dikerjakan secara presisi mempertahankan geometri suspensi yang tepat' },
      { icon: 'factory.png', en: 'Corrosion-resistant surface treatment extends service life', id: 'Perlakuan permukaan tahan korosi memperpanjang masa pakai' },
      { icon: 'puzzle.png', en: 'Compatible with OEM-specification bushings and ball joints', id: 'Kompatibel dengan bushing dan ball joint spesifikasi OEM' },
      { icon: 'gear.png', en: 'Rigorously tested for fatigue resistance under dynamic loads', id: 'Diuji secara ketat untuk ketahanan kelelahan di bawah beban dinamis' },
      { icon: 'car.png', en: 'Widely stocked for fast replacement turnaround in workshops', id: 'Tersedia luas untuk pergantian cepat di bengkel' },
    ],
  },

  '555-tierod': {
    founded: '1960',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Ritto, Shiga, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'engineering.png', en: 'Hardened ball stud materials', id: 'Material ball stud yang dikeraskan' },
      { icon: 'puzzle.png', en: 'Sealed dust boots resist contamination', id: 'Penutup debu tersegel tahan kontaminasi' },
      { icon: 'gear.png', en: 'Tight angular clearance tolerances', id: 'Toleransi kelonggaran sudut yang ketat' },
      { icon: 'factory.png', en: 'Individual QC: ball stud torque, seal integrity, thread precision', id: 'QC individual: torsi ball stud, integritas segel, presisi ulir' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Tie rod end assemblies', id: 'Rakitan tie rod end' },
      { icon: 'engineering.png', en: 'Hardened ball stud tie rods', id: 'Tie rod dengan ball stud dikeraskan' },
      { icon: 'puzzle.png', en: 'Sealed dust boot design', id: 'Desain penutup debu tersegel' },
    ],
    specialization: {
      icon: 'engineering.png',
      en: 'Tie rod assemblies with hardened ball studs and sealed dust boots, individually quality-checked for ball stud torque, seal integrity, and thread precision.',
      id: 'Rakitan tie rod dengan ball stud yang dikeraskan dan penutup debu tersegel, diperiksa kualitasnya secara individual untuk torsi ball stud, integritas segel, dan presisi ulir.',
    },
    historyHighlight: [
      { en: '1960 Manufacturing begi ns', id: '1960 Manufaktur dimulai' },
      { en: 'Individual QC per assembly', id: 'QC individual tiap rakitan' },
      { en: 'Proven in high-mileage driving', id: 'Terbukti pada berkendara jarak tinggi' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'engineering.png', en: 'Precision ball joint construction minimizes steering play', id: 'Konstruksi ball joint presisi meminimalkan kelonggaran kemudi' },
      { icon: 'factory.png', en: 'Hardened ball stud material resists wear under repeated articulation', id: 'Material ball stud yang dikeraskan menahan keausan akibat artikulasi berulang' },
      { icon: 'puzzle.png', en: 'Quality dust boots protect against contamination in all environments', id: 'Penutup debu berkualitas melindungi dari kontaminasi di semua lingkungan' },
      { icon: 'gear.png', en: 'Tight angular tolerances ensure responsive and accurate steering feel', id: 'Toleransi sudut yang ketat memastikan respons kemudi yang akurat' },
      { icon: 'car.png', en: 'OEM-equivalent thread specifications for straightforward installation', id: 'Spesifikasi ulir setara OEM untuk pemasangan yang mudah' },
      { icon: 'factory.png', en: 'Proven durability in high-mileage urban and rural driving applications', id: 'Ketahanan terbukti dalam aplikasi berkendara jarak tinggi di perkotaan dan pedesaan' },
    ],
  },

  '555-link': {
    founded: '1960',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Ritto, Shiga, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'engineering.png', en: 'Precision-formed ball joints at each end', id: 'Ball joint dibentuk presisi di tiap ujung' },
      { icon: 'factory.png', en: 'Case-hardened steel studs', id: 'Stud baja case-hardened' },
      { icon: 'puzzle.png', en: 'UV-resistant dust boots', id: 'Penutup debu tahan UV' },
      { icon: 'car.png', en: 'Validated across passenger car & LCV applications', id: 'Divalidasi di aplikasi mobil penumpang & niaga ringan' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Stabilizer link assemblies', id: 'Rakitan link stabilizer' },
      { icon: 'engineering.png', en: 'Case-hardened ball stud links', id: 'Link dengan ball stud case-hardened' },
      { icon: 'puzzle.png', en: 'UV-resistant sealed joints', id: 'Sambungan tersegel tahan UV' },
    ],
    specialization: {
      icon: 'engineering.png',
      en: 'Stabilizer link assemblies with precision-formed ball joints, case-hardened steel studs, and UV-resistant dust boots, validated across Japanese passenger and light commercial vehicles.',
      id: 'Rakitan link stabilizer dengan ball joint dibentuk presisi, stud baja case-hardened, dan penutup debu tahan UV, divalidasi di platform kendaraan penumpang dan niaga ringan Jepang.',
    },
    historyHighlight: [
      { en: '1960 Sankei Industry established', id: '1960 Sankei Industry didirikan' },
      { en: 'Extension of core suspension expertise', id: 'Perluasan keahlian suspensi inti' },
      { en: 'Validated across passenger & LCV platforms', id: 'Divalidasi di platform penumpang & niaga ringan' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'vibration.png', en: 'Reduces body roll during cornering for improved handling stability', id: 'Mengurangi body roll saat menikung untuk stabilitas pengendalian yang lebih baik' },
      { icon: 'engineering.png', en: 'Case-hardened steel ball studs resist lateral stress and wear', id: 'Ball stud baja case-hardened menahan tekanan dan keausan lateral' },
      { icon: 'puzzle.png', en: 'UV-resistant dust boots maintain seal integrity in tropical climates', id: 'Penutup debu tahan UV menjaga integritas segel di iklim tropis' },
      { icon: 'gear.png', en: 'Correct articulation range preserves anti-roll bar geometry', id: 'Rentang artikulasi yang tepat mempertahankan geometri anti-roll bar' },
      { icon: 'car.png', en: 'Compatible with OEM mounting specifications across Japanese platforms', id: 'Kompatibel dengan spesifikasi mounting OEM di berbagai platform Jepang' },
      { icon: 'factory.png', en: 'Restores factory handling balance when used as a direct replacement', id: 'Mengembalikan keseimbangan pengendalian pabrik saat digunakan sebagai pengganti langsung' },
    ],
  },

  RBI: {
    founded: '1975',
    country: { en: 'Thailand', id: 'Thailand' },
    hq: 'Samutprakarn (near Bangkok), Thailand',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Daihatsu, Suzuki, Isuzu, Hino',
    specifications: [
      { icon: 'factory.png', en: "One of Southeast Asia's earliest rubber-metal bonded component makers", id: 'Salah satu produsen komponen karet-logam bonded tertua di Asia Tenggara' },
      { icon: 'vibration.png', en: 'Rubber compounds formulated for tropical heat and humidity', id: 'Kompon karet diformulasikan untuk panas dan kelembapan tropis' },
      { icon: 'engineering.png', en: 'Facilities certified to international quality standards', id: 'Fasilitas tersertifikasi standar kualitas internasional' },
      { icon: 'car.png', en: 'Exported to 60+ countries', id: 'Diekspor ke 60+ negara' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Arm and suspension bushings', id: 'Bushing arm dan suspensi' },
      { icon: 'engineering.png', en: 'Engine mounts and shock absorber mounts', id: 'Engine mount dan shock absorber mount' },
      { icon: 'puzzle.png', en: 'Stabilizer links and steering gear boots', id: 'Link stabilizer dan steering gear boot' },
    ],
    specialization: {
      icon: 'vibration.png',
      en: 'Rubber-to-metal bonded bushings, engine mounts, stabilizer links, and steering gear boots, with compounds formulated for tropical heat and humidity.',
      id: 'Bushing, engine mount, link stabilizer, dan steering gear boot karet-logam bonded, dengan kompon diformulasikan untuk panas dan kelembapan tropis.',
    },
    historyHighlight: [
      { en: '1975 Manufacturing begins in Thailand', id: '1975 Manufaktur dimulai di Thailand' },
      { en: 'Exported to 60+ countries', id: 'Diekspor ke 60+ negara' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'vibration.png', en: 'Rubber compounds specifically formulated for tropical heat and humidity', id: 'Kompon karet yang diformulasikan khusus untuk panas dan kelembapan tropis' },
      { icon: 'comfort.png', en: 'Excellent vibration absorption reduces NVH (noise, vibration, harshness)', id: 'Penyerapan getaran yang sangat baik mengurangi NVH' },
      { icon: 'engineering.png', en: 'Strong rubber-to-metal bonding prevents slippage under load', id: 'Ikatan karet-ke-logam yang kuat mencegah pergeseran di bawah beban' },
      { icon: 'puzzle.png', en: 'Broad product range covering Japanese, Korean, and European applications', id: 'Rangkaian produk luas mencakup aplikasi kendaraan Jepang, Korea, dan Eropa' },
      { icon: 'factory.png', en: 'Over 50 years of specialized rubber component manufacturing experience', id: 'Lebih dari 50 tahun pengalaman manufaktur komponen karet spesialis' },
      { icon: 'car.png', en: 'Exported to 60+ countries including Indonesia, Malaysia, Thailand, Philippines, Vietnam, India, UAE', id: 'Diekspor ke 60+ negara termasuk Indonesia, Malaysia, Thailand, Filipina, Vietnam, India, dan UEA' },
    ],
  },

  KJTRIC: {
    founded: null,
    country: { en: 'Indonesia', id: 'Indonesia' },
    hq: 'Jakarta, Indonesia (TRA Group / PT. Timur Raya Anugerah Damai)',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'factory.png', en: 'Aftermarket rubber component brand under TRA Group', id: 'Merek komponen karet aftermarket di bawah TRA Group' },
      { icon: 'car.png', en: 'Engineered for high-volume Japanese vehicles in Indonesia', id: 'Direkayasa untuk kendaraan Jepang volume tinggi di Indonesia' },
      { icon: 'vibration.png', en: 'Rubber compounds selected for tropical compatibility', id: 'Kompon karet dipilih untuk kompatibilitas tropis' },
      { icon: 'gear.png', en: "Distributed via TRAD's established network", id: 'Didistribusikan lewat jaringan TRAD yang mapan' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Control arm bushings', id: 'Bushing lengan kontrol' },
      { icon: 'engineering.png', en: 'Subframe mounts', id: 'Mount subframe' },
      { icon: 'puzzle.png', en: 'Sway bar bushings', id: 'Bushing sway bar' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Control arm bushings, subframe mounts, and sway bar bushings, engineered for high-volume Japanese vehicle applications common in Indonesia.',
      id: 'Bushing lengan kontrol, mount subframe, dan bushing sway bar, untuk aplikasi kendaraan Jepang volume tinggi yang umum di Indonesia.',
    },
    historyHighlight: [
      { en: 'Developed within TRA Group portfolio', id: 'Dikembangkan dalam portofolio TRA Group' },
      { en: 'Distributed via TRAD network', id: 'Didistribusikan lewat jaringan TRAD' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'factory.png', en: 'Affordable pricing suitable for price-sensitive aftermarket segments', id: 'Harga terjangkau yang sesuai untuk segmen aftermarket yang sensitif terhadap harga' },
      { icon: 'vibration.png', en: 'Rubber formulation compatible with tropical road and temperature conditions', id: 'Formulasi karet kompatibel dengan kondisi jalan dan suhu tropis' },
      { icon: 'comfort.png', en: 'Good vibration isolation restores ride comfort on worn suspensions', id: 'Isolasi getaran yang baik mengembalikan kenyamanan berkendara pada suspensi yang aus' },
      { icon: 'car.png', en: 'Wide vehicle coverage for popular Japanese models in the Indonesian market', id: 'Cakupan kendaraan luas untuk model Jepang populer di pasar Indonesia' },
      { icon: 'gear.png', en: 'Easy installation with OEM-equivalent dimensions and fitment', id: 'Pemasangan mudah dengan dimensi dan kesesuaian setara OEM' },
      { icon: 'factory.png', en: "Consistent availability through the TRA Group's distribution network", id: 'Ketersediaan konsisten melalui jaringan distribusi TRA Group' },
    ],
  },

  NOK: {
    founded: '1939',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Tokyo, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu, Hino, Lexus',
    specifications: [
      { icon: 'factory.png', en: "Japan's first domestic oil seal manufacturer (1939)", id: 'Produsen oil seal dalam negeri pertama Jepang (1939)' },
      { icon: 'gear.png', en: '60+ global sealing facilities', id: '60+ fasilitas penyegelan global' },
      { icon: 'engineering.png', en: 'Advanced polymer science for custom formulations', id: 'Ilmu polimer canggih untuk formulasi khusus' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Oil seals and mechanical seals', id: 'Oil seal dan mechanical seal' },
      { icon: 'engineering.png', en: 'Valve stem seals', id: 'Valve stem seal' },
      { icon: 'puzzle.png', en: 'Ball joint dust covers', id: 'Dust cover ball joint' },
      { icon: 'vibration.png', en: 'Vibration isolators', id: 'Isolator getaran' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Oil seals, mechanical seals, valve stem seals, ball joint dust covers, and vibration isolators, supplied as Tier-1 OEM to major Japanese manufacturers.',
      id: 'Oil seal, mechanical seal, valve stem seal, dust cover ball joint, dan isolator getaran, dipasok sebagai OEM Tier-1 kepada produsen Jepang utama.',
    },
    historyHighlight: [
      { en: "1939 Established as Japan's first oil seal maker", id: '1939 Didirikan sebagai produsen oil seal pertama Jepang' },
      { en: '60+ global facilities today', id: '60+ fasilitas global saat ini' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'car.png', en: 'Tier-1 OEM supplier to Toyota, Honda, Nissan, Mitsubishi, and Isuzu', id: 'Pemasok OEM Tier-1 untuk Toyota, Honda, Nissan, Mitsubishi, dan Isuzu' },
      { icon: 'engineering.png', en: 'Advanced polymer science producing superior rubber compound durability', id: 'Ilmu polimer canggih menghasilkan ketahanan kompon karet yang superior' },
      { icon: 'gear.png', en: 'Excellent heat and chemical resistance for demanding engine bay environments', id: 'Ketahanan panas dan bahan kimia yang sangat baik untuk lingkungan mesin yang menuntut' },
      { icon: 'puzzle.png', en: 'Precise dimensional manufacturing ensures consistent fitment and sealing', id: 'Manufaktur berdimensi presisi memastikan kesesuaian dan penyegelan yang konsisten' },
      { icon: 'car.png', en: 'Extensive product catalog covering a broad range of vehicle applications', id: 'Katalog produk ekstensif mencakup berbagai aplikasi kendaraan' },
      { icon: 'factory.png', en: 'Over 85 years of specialized rubber and sealing technology expertise', id: 'Lebih dari 85 tahun keahlian teknologi karet dan penyegelan khusus' },
    ],
  },

  'NOK-steering': {
    founded: '1939',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Tokyo, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu, Lexus',
    specifications: [
      { icon: 'gear.png', en: 'Rack seals and power steering fluid seals used as OE', id: 'Rack seal dan power steering fluid seal digunakan sebagai OE' },
      { icon: 'engineering.png', en: 'Withstands continuous hydraulic pressure and thermal cycling', id: 'Tahan tekanan hidrolik berkelanjutan dan siklus termal' },
      { icon: 'factory.png', en: "Part of NOK's 60+ facility global sealing operation", id: 'Bagian dari operasi penyegelan global NOK di 60+ fasilitas' },
      { icon: 'car.png', en: 'Enables cost-effective rack rebuilds', id: 'Memungkinkan rebuild rack hemat biaya' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Rack seals', id: 'Rack seal' },
      { icon: 'engineering.png', en: 'Power steering fluid seals', id: 'Power steering fluid seal' },
      { icon: 'puzzle.png', en: 'Rack rebuild seal kits', id: 'Kit segel rebuild rack' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Rack seals and power steering fluid seals resistant to hydraulic pressure, thermal cycling, and fluid exposure, enabling cost-effective rack rebuilding.',
      id: 'Rack seal dan power steering fluid seal tahan tekanan hidrolik, siklus termal, dan paparan cairan, memungkinkan rebuild rack yang hemat biaya.',
    },
    historyHighlight: [
      { en: '1939 NOK established', id: '1939 NOK didirikan' },
      { en: '60+ global sealing facilities', id: '60+ fasilitas penyegelan global' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'car.png', en: 'Tier-1 OEM sealing supplier to Toyota, Honda, Nissan, Mitsubishi, and Isuzu', id: 'Pemasok segel OEM Tier-1 untuk Toyota, Honda, Nissan, Mitsubishi, dan Isuzu' },
      { icon: 'gear.png', en: 'Hydraulic seals maintain correct power steering pressure throughout service life', id: 'Segel hidrolik mempertahankan tekanan power steering yang tepat sepanjang masa pakai' },
      { icon: 'engineering.png', en: 'Advanced polymer compounds resist power steering fluid degradation', id: 'Kompon polimer canggih menahan degradasi cairan power steering' },
      { icon: 'factory.png', en: 'Thermal and pressure cycling resistance prevents premature seal failure', id: 'Ketahanan siklus termal dan tekanan mencegah kegagalan segel dini' },
      { icon: 'puzzle.png', en: 'Enables cost-effective rack rebuilding as an alternative to full assembly replacement', id: 'Memungkinkan rebuild rack yang hemat biaya sebagai alternatif penggantian rakitan penuh' },
      { icon: 'engineering.png', en: 'Over 85 years of specialized hydraulic and pneumatic sealing expertise', id: 'Lebih dari 85 tahun keahlian penyegelan hidrolik dan pneumatik khusus' },
    ],
  },

  Seiken: {
    founded: '1959',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Tokyo, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'factory.png', en: "Spun off from Meiji Sangyo's Brake Laboratory (import/mfg since 1933)", id: 'Memisahkan diri dari Brake Laboratory Meiji Sangyo (impor/produksi sejak 1933)' },
      { icon: 'gear.png', en: 'Specializes in hydraulic brake and clutch components', id: 'Spesialis komponen hidrolik rem dan kopling' },
      { icon: 'engineering.png', en: 'Safety-critical manufacturing culture over 65+ years', id: 'Budaya manufaktur kritis keselamatan selama 65+ tahun' },
      { icon: 'car.png', en: 'Used across Indonesia, Malaysia, Thailand, Philippines, Vietnam, Japan', id: 'Digunakan di Indonesia, Malaysia, Thailand, Filipina, Vietnam, Jepang' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Brake caliper repair kits', id: 'Kit perbaikan kaliper rem' },
      { icon: 'engineering.png', en: 'Wheel cylinder kits', id: 'Kit silinder roda' },
      { icon: 'gear.png', en: 'Master cylinder repair kits', id: 'Kit perbaikan master cylinder' },
      { icon: 'puzzle.png', en: 'Clutch hydraulic components', id: 'Komponen hidrolik kopling' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Brake caliper repair kits, wheel cylinder kits, master cylinder repair kits, and clutch hydraulic components, backed by a safety-critical manufacturing culture developed over 65+ years.',
      id: 'Kit perbaikan kaliper rem, kit silinder roda, kit perbaikan master cylinder, dan komponen hidrolik kopling, didukung budaya manufaktur kritis keselamatan yang dikembangkan selama 65+ tahun.',
    },
    historyHighlight: [
      { en: '1933 Brake Laboratory origins (Meiji Sangyo)', id: '1933 Awal Brake Laboratory (Meiji Sangyo)' },
      { en: '1959 Seiken established', id: '1959 Seiken didirikan' },
      { en: '65+ years safety-critical culture', id: '65+ tahun budaya safety-critical' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'gear.png', en: 'Specialized hydraulic expertise applied directly to disc brake and clutch system reliability', id: 'Keahlian hidrolik khusus yang diterapkan langsung pada keandalan sistem rem disc brake dan kopling' },
      { icon: 'engineering.png', en: 'High-grade rubber seals prevent brake fluid leakage under thermal stress', id: 'Segel karet berkualitas tinggi mencegah kebocoran cairan rem di bawah tekanan termal' },
      { icon: 'gear.png', en: 'Precision-machined cylinder bores maintain correct hydraulic pressure', id: 'Silinder yang dikerjakan presisi mempertahankan tekanan hidrolik yang tepat' },
      { icon: 'puzzle.png', en: 'Comprehensive coverage of Japanese and Asian vehicle disc brake hydraulic systems', id: 'Cakupan komprehensif sistem hidrolik disc brake kendaraan Jepang dan Asia' },
      { icon: 'factory.png', en: 'Safety-critical manufacturing standards developed over 65+ years', id: 'Standar manufaktur kritis keselamatan yang dikembangkan selama 65+ tahun' },
      { icon: 'car.png', en: 'Trusted by professional workshops for reliable brake restoration', id: 'Dipercaya oleh bengkel profesional untuk pemulihan rem yang andal' },
    ],
  },

  'Compact Brakes': {
    founded: '1994',
    country: { en: 'Thailand', id: 'Thailand' },
    hq: 'Bangkok, Thailand',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'factory.png', en: 'Compact International (1994) Co., Ltd., based in Bangkok', id: 'Compact International (1994) Co., Ltd., berbasis di Bangkok' },
      { icon: 'gear.png', en: 'Full verified range: pads, shoes, lining, rotors, fluid, shims', id: 'Rangkaian lengkap terverifikasi: kampas, sepatu rem, lining, rotor, cairan rem, shim' },
      { icon: 'engineering.png', en: 'Heat-resistant friction compounds for cars, pickups, and vans', id: 'Kompon gesek tahan panas untuk mobil, pickup, dan van' },
      { icon: 'car.png', en: 'Cost-effective without compromising safety standards', id: 'Hemat biaya tanpa mengorbankan standar keselamatan' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Disc brake pads', id: 'Kampas rem disc brake' },
      { icon: 'puzzle.png', en: 'Brake shoes and lining', id: 'Sepatu rem dan brake lining' },
      { icon: 'engineering.png', en: 'Brake fluid and anti-squeal shims', id: 'Cairan rem dan anti-squeal shim' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Heat-resistant friction brake pads for passenger cars, pickups, and vans, balancing stopping power with progressive, predictable wear.',
      id: 'Kampas rem berkompon tahan panas untuk mobil penumpang, pickup, dan van, menyeimbangkan daya pengereman dengan keausan progresif yang dapat diprediksi.',
    },
    historyHighlight: [
      { en: '1994 Compact International established in Bangkok', id: '1994 Compact International didirikan di Bangkok' },
      { en: 'Full-range verified product line', id: 'Rangkaian produk lengkap terverifikasi' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'engineering.png', en: 'Friction material formulated for consistent stopping performance', id: 'Material gesek yang diformulasikan untuk performa pengereman yang konsisten' },
      { icon: 'gear.png', en: 'Good thermal management reduces risk of brake fade under repeated use', id: 'Manajemen termal yang baik mengurangi risiko brake fade akibat penggunaan berulang' },
      { icon: 'factory.png', en: 'Progressive wear characteristics for predictable pad life', id: 'Karakteristik keausan progresif untuk masa pakai kampas yang dapat diprediksi' },
      { icon: 'car.png', en: 'Cost-effective pricing suitable for high-volume workshop applications', id: 'Harga ekonomis yang sesuai untuk aplikasi bengkel volume tinggi' },
      { icon: 'puzzle.png', en: 'Wide fitment range across popular Japanese and Asian vehicle models', id: 'Jangkauan kesesuaian luas di berbagai model kendaraan Jepang dan Asia populer' },
      { icon: 'engineering.png', en: 'Controlled production standards ensure reliable braking safety', id: 'Standar produksi terkontrol memastikan keamanan pengereman yang andal' },
    ],
  },

  'Compact Brakes-rotor': {
    founded: '1994',
    country: { en: 'Thailand', id: 'Thailand' },
    hq: 'Bangkok, Thailand',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu',
    specifications: [
      { icon: 'gear.png', en: 'Y Groove Technology channels dust, water, and heat', id: 'Teknologi Y Groove menyalurkan debu, air, dan panas' },
      { icon: 'engineering.png', en: 'Precise thickness, flatness, and runout tolerances', id: 'Toleransi ketebalan, kerataan, dan runout presisi' },
      { icon: 'factory.png', en: 'Anti-corrosion surface finish for storage/transit', id: 'Finishing permukaan anti-korosi untuk penyimpanan/pengiriman' },
      { icon: 'car.png', en: 'Verified to meet international braking standards', id: 'Diverifikasi memenuhi standar pengereman internasional' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Y-groove disc rotors', id: 'Disc rotor beralur Y' },
      { icon: 'engineering.png', en: 'Grey iron alloy rotor construction', id: 'Konstruksi rotor paduan besi abu-abu' },
      { icon: 'factory.png', en: 'Anti-corrosion coated rotors', id: 'Rotor dengan lapisan anti-korosi' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Y-groove disc rotors manufactured to precise thickness, flatness, and runout tolerances, with anti-corrosion surface finishing.',
      id: 'Disc rotor beralur Y, diproduksi dengan toleransi ketebalan, kerataan, dan runout yang presisi, dengan finishing permukaan anti-korosi.',
    },
    historyHighlight: [
      { en: '1994 Compact International established', id: '1994 Compact International didirikan' },
      { en: 'Y Groove Technology introduced', id: 'Y Groove Technology diperkenalkan' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'engineering.png', en: 'Grey iron alloy construction with controlled carbon content for thermal stability', id: 'Konstruksi paduan besi abu-abu dengan kandungan karbon terkontrol untuk stabilitas termal' },
      { icon: 'gear.png', en: 'Accurate dimensional tolerances minimize brake judder and vibration', id: 'Toleransi dimensi yang akurat meminimalkan brake judder dan getaran' },
      { icon: 'vibration.png', en: 'Good heat dissipation reduces rotor warping during heavy braking', id: 'Disipasi panas yang baik mengurangi pelengkungan rotor saat pengereman berat' },
      { icon: 'factory.png', en: 'Anti-corrosion surface treatment protects during storage and shipping', id: 'Perlakuan permukaan anti-korosi melindungi selama penyimpanan dan pengiriman' },
      { icon: 'puzzle.png', en: 'Matched to Compact Brakes pad compounds for optimized bed-in performance', id: 'Cocok dengan kompon kampas Compact Brakes untuk performa bed-in yang optimal' },
      { icon: 'car.png', en: 'Economical replacement solution for routine brake service applications', id: 'Solusi pengganti ekonomis untuk aplikasi servis rem rutin' },
    ],
  },

  NSK: {
    founded: '1916',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Tokyo, Japan',
    oem: 'Toyota, Honda, Nissan, Mazda, Mitsubishi, Isuzu, Hino, Lexus',
    specifications: [
      { icon: 'factory.png', en: "Japan's first domestic ball bearing manufacturer (1916)", id: 'Produsen bantalan bola dalam negeri pertama Jepang (1916)' },
      { icon: 'engineering.png', en: 'Top-3 global bearing producer alongside SKF and Schaeffler', id: 'Top-3 produsen bantalan dunia bersama SKF dan Schaeffler' },
      { icon: 'car.png', en: 'Tier-1 OEM supplier across 30+ countries', id: 'Pemasok OEM Tier-1 di 30+ negara' },
      { icon: 'gear.png', en: '~24,000 employees worldwide', id: '~24.000 karyawan di seluruh dunia' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: 'Wheel bearing units', id: 'Unit wheel bearing' },
      { icon: 'engineering.png', en: 'Hub unit assemblies', id: 'Rakitan hub unit' },
      { icon: 'gear.png', en: 'Precision bearings', id: 'Bantalan presisi' },
    ],
    specialization: {
      icon: 'gear.png',
      en: 'Wheel bearings, hub unit assemblies, and precision bearings supplied as Tier-1 OEM across 30+ countries, recognized as the aftermarket quality benchmark.',
      id: 'Wheel bearing, rakitan hub unit, dan bantalan presisi dipasok sebagai OEM Tier-1 di 30+ negara, diakui sebagai tolok ukur kualitas aftermarket.',
    },
    historyHighlight: [
      { en: "1916 Established as Japan's first ball bearing maker", id: '1916 Didirikan sebagai produsen bantalan bola pertama Jepang' },
      { en: 'Grew into top-3 global bearing producer', id: 'Berkembang menjadi top-3 produsen bantalan dunia' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'factory.png', en: 'Over 100 years of precision bearing manufacturing expertise', id: 'Lebih dari 100 tahun keahlian manufaktur bantalan presisi' },
      { icon: 'car.png', en: 'Tier-1 OEM supplier to Toyota, Honda, Nissan, Mazda, Mitsubishi, and Isuzu', id: 'Pemasok OEM Tier-1 untuk Toyota, Honda, Nissan, Mazda, Mitsubishi, dan Isuzu' },
      { icon: 'engineering.png', en: 'Advanced internal geometry for minimal friction and low rolling resistance', id: 'Geometri internal canggih untuk gesekan minimal dan hambatan gulir rendah' },
      { icon: 'gear.png', en: 'High radial and axial load capacity for demanding driving conditions', id: 'Kapasitas beban radial dan aksial tinggi untuk kondisi berkendara yang menuntut' },
      { icon: 'engineering.png', en: 'Rigorous fatigue life testing ensures long-term bearing reliability', id: 'Pengujian masa pakai kelelahan yang ketat memastikan keandalan bantalan jangka panjang' },
      { icon: 'factory.png', en: 'Globally recognized quality benchmark in OEM and aftermarket segments', id: 'Tolok ukur kualitas yang diakui secara global di segmen OEM dan aftermarket' },
    ],
  },

  GMB: {
    founded: '1943',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Nara, Japan',
    oem: 'Toyota, Honda, Nissan, Mitsubishi, Mazda, Daihatsu, Suzuki, Isuzu, Hino',
    specifications: [
      { icon: 'factory.png', en: '700+ wheel bearing types manufactured', id: '700+ jenis wheel bearing diproduksi' },
      { icon: 'gear.png', en: 'Also produces water pumps, U-joints, ball joints, tie rod ends', id: 'Juga memproduksi pompa air, universal joint, ball joint, tie rod end' },
      { icon: 'car.png', en: 'Exported to 100+ countries', id: 'Diekspor ke 100+ negara' },
      { icon: 'puzzle.png', en: 'Strong coverage for Toyota, Nissan, Honda, Isuzu', id: 'Cakupan kuat untuk Toyota, Nissan, Honda, Isuzu' },
    ],
    productHighlights: [
      { icon: 'gear.png', en: '700+ wheel bearing types', id: '700+ jenis wheel bearing' },
      { icon: 'engineering.png', en: 'Water pumps', id: 'Pompa air' },
      { icon: 'puzzle.png', en: 'Universal joints, ball joints, tie rod ends', id: 'Universal joint, ball joint, tie rod end' },
    ],
    specialization: {
      icon: 'gear.png',
      en: '700+ wheel bearing types, water pumps, universal joints, ball joints, and tie rod ends, exported to 100+ countries.',
      id: '700+ jenis wheel bearing, pompa air, universal joint, ball joint, dan tie rod end, diekspor ke 100+ negara.',
    },
    historyHighlight: [
      { en: '1943 Established in Nara, Japan', id: '1943 Didirikan di Nara, Jepang' },
      { en: 'Exported to 100+ countries', id: 'Diekspor ke 100+ negara' },
      { en: 'Present Day', id: 'Present Day' },
    ],
    advantages: [
      { icon: 'factory.png', en: 'Over 80 years of bearing and drivetrain component manufacturing', id: 'Lebih dari 80 tahun manufaktur komponen bantalan dan drivetrain' },
      { icon: 'car.png', en: 'Strong product coverage for Toyota, Nissan, Honda, and Isuzu applications', id: 'Cakupan produk kuat untuk aplikasi Toyota, Nissan, Honda, dan Isuzu' },
      { icon: 'factory.png', en: 'Exported to 100+ countries including Indonesia, Malaysia, Thailand, Australia, Saudi Arabia, UAE', id: 'Diekspor ke 100+ negara termasuk Indonesia, Malaysia, Thailand, Australia, Arab Saudi, dan UEA' },
      { icon: 'engineering.png', en: 'Quality steel alloys provide reliable load capacity and fatigue resistance', id: 'Paduan baja berkualitas memberikan kapasitas beban dan ketahanan kelelahan yang andal' },
      { icon: 'puzzle.png', en: 'Competitive pricing makes GMB an accessible alternative to premium brands', id: 'Harga kompetitif menjadikan GMB alternatif yang terjangkau dibanding merek premium' },
      { icon: 'gear.png', en: 'Comprehensive catalog includes wheel bearings, water pumps, and U-joints', id: 'Katalog produk komprehensif mencakup wheel bearing, pompa air, dan universal joint' },
    ],
  },
}

const trustBrands = ['SHOWA', 'KJ', '555', 'RBI', 'NOK', 'SEIKEN', 'COMPACT BRAKES', 'NSK', 'GMB', 'KJTRIC']
const originCountries = computed(() => new Set(Object.values(BP).map(b => b.country?.en).filter(Boolean)).size)

const hotspots = [
  {
    x: 20, y: 28, label: 'Shock Absorber', labelDir: 'right', icon: '🔧',
    brandVariants: [
      { brand: 'Showa', brandLogo: '/images/brands/showa.png', image: '/images/parts/shock_absorber_front.png',
        model: '/models/shock_absorber.glb',
        desc: {
          en: 'The front-left shock absorber dampens vibration and shock from the road surface, keeping the tire in contact with the asphalt for optimal handling and ride comfort.',
          id: 'Shock absorber depan-kiri meredam getaran dan guncangan dari permukaan jalan, menjaga ban tetap menapak aspal untuk handling dan kenyamanan berkendara yang optimal.',
        }, profile: BP.Showa },
      { brand: 'KJ Shock Absorber', brandLogo: '/images/brands/kj.png', image: '/images/parts/shock_absorber_front_kj.png',
        model: '/models/shock_absorber.glb',
        desc: {
          en: 'The front-left KJ shock absorber offers an affordable, reliable replacement solution engineered for Southeast Asian road conditions, with OEM-compatible mounting dimensions for easy installation.',
          id: 'Shock absorber KJ depan-kiri menawarkan solusi pengganti yang terjangkau dan andal, direkayasa untuk kondisi jalan Asia Tenggara, dengan dimensi mounting yang kompatibel OEM untuk pemasangan mudah.',
        }, profile: BP.KJ },
    ],
  },

  {
    x: 16, y: 35, label: 'Upper Arm', labelDir: 'right', icon: '🔩',
    brandVariants: [
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/upper_arm.png', model: '/models/upper_arm.glb',
        desc: {
          en: 'The upper control arm connects the steering knuckle to the chassis at the top. It controls front wheel camber and caster angle as the suspension moves. CNC-machined to strict OEM tolerances by Sankei Industry (555).',
          id: 'Upper control arm menghubungkan steering knuckle ke chassis di bagian atas. Komponen ini mengatur sudut camber dan caster roda depan saat suspensi bergerak. Dikerjakan CNC sesuai toleransi ketat OEM oleh Sankei Industry (555).',
        }, profile: BP['555'] },
    ],
  },

  {
    x: 14, y: 43, label: 'Bushing', labelDir: 'right', icon: '⭕',
    brandVariants: [
      { brand: 'RBI', brandLogo: '/images/brands/rbi.png', image: '/images/parts/bushing.png', model: '/models/bushing.glb',
        desc: {
          en: 'The rubber bushing dampens vibration between suspension components and the chassis, keeping suspension geometry precise while isolating road noise. RBI compounds are formulated for tropical heat and humidity.',
          id: 'Bushing karet meredam getaran antara komponen suspensi dan chassis, menjaga geometri suspensi tetap presisi sambil meredam suara jalan. Kompon RBI diformulasikan untuk panas dan kelembapan tropis.',
        }, profile: BP.RBI },
      { brand: 'KJTRIC', brandLogo: '/images/brands/kjtric.png', image: '/images/parts/bushing.png', model: '/models/bushing.glb',
        desc: {
          en: 'KJTRIC offers an affordable rubber-to-metal bonded bushing engineered for high-volume Japanese vehicles in Indonesia, restoring ride comfort on worn suspensions.',
          id: 'KJTRIC menawarkan bushing karet-logam bonded yang terjangkau, direkayasa untuk kendaraan Jepang volume tinggi di Indonesia, mengembalikan kenyamanan berkendara pada suspensi yang aus.',
        }, profile: BP.KJTRIC },
    ],
  },

  {
    x: 17, y: 66, label: 'Lower Arm', labelDir: 'right', icon: '🔩',
    brandVariants: [
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/lower_arm.png', model: '/models/lower_arm.glb',
        desc: {
          en: 'The lower control arm is a key suspension component connecting the wheel hub to the chassis at the bottom, controlling the lateral and vertical movement of the wheel. Precision-forged from high-tensile steel by Sankei Industry (555).',
          id: 'Lower control arm adalah komponen suspensi utama yang menghubungkan wheel hub ke chassis di bagian bawah, mengatur pergerakan lateral dan vertikal roda. Ditempa presisi dari baja tarik tinggi oleh Sankei Industry (555).',
        }, profile: BP['555-lower'] },
    ],
  },

  {
    x: 21, y: 74, label: 'Tie Rod', labelDir: 'right', icon: '↔️',
    brandVariants: [
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/tie_rod.png', model: '/models/tie_rod.glb',
        desc: {
          en: 'The tie rod connects the steering rack to the wheel knuckle, transmitting steering input to the wheel. The tie rod end can be adjusted to set toe angle.',
          id: 'Tie rod menghubungkan steering rack ke wheel knuckle, meneruskan input kemudi ke roda. Tie rod end dapat disetel untuk mengatur sudut toe.',
        }, profile: BP['555-tierod'] },
    ],
  },

  {
    x: 25, y: 78, label: 'Brake Pad', labelDir: 'right', icon: '🔴',
    brandVariants: [
      { brand: 'Compact Brakes', brandLogo: '/images/brands/compact-brakes.png', image: '/images/parts/brake_front.png',
        model: '/models/brake_pad.glb',
        desc: {
          en: 'The front brake pad presses against the disc rotor to generate stopping friction. Compact Brakes uses heat-resistant friction compounds formulated for consistent, progressive wear.',
          id: 'Brake pad depan menekan disc rotor untuk menghasilkan friksi pengereman. Compact Brakes menggunakan kompon gesek tahan panas yang diformulasikan untuk keausan konsisten dan progresif.',
        }, profile: BP['Compact Brakes'] },
    ],
  },

  {
    x: 20, y: 89, label: 'Disc Rotor', labelDir: 'right', icon: '⭕',
    brandVariants: [
      { brand: 'Compact Brakes', brandLogo: '/images/brands/compact-brakes.png', image: '/images/parts/disc_rotor.png',
        model: '/models/disk_rotor.glb', baseRotationX: Math.PI / 2,
        desc: {
          en: 'The ventilated disc rotor absorbs and dissipates heat generated during braking. Compact Brakes rotors use Y Groove Technology to channel away dust, water, and heat for improved cooling.',
          id: 'Disc rotor berventilasi menyerap dan melepaskan panas yang dihasilkan saat pengereman. Rotor Compact Brakes menggunakan Y Groove Technology untuk menyalurkan debu, air, dan panas demi pendinginan yang lebih baik.',
        }, profile: BP['Compact Brakes-rotor'] },
    ],
  },

  {
    x: 32, y: 81, label: 'Wheel Bearing', labelDir: 'right', icon: '🔵',
    brandVariants: [
      { brand: 'NSK', brandLogo: '/images/brands/nsk.png', image: '/images/parts/wheel_bearing.png',
        model: '/models/wheel_bearing.glb',
        desc: {
          en: 'The wheel bearing allows the wheel to rotate with minimal friction against the hub. NSK is Japan\'s first ball bearing maker and a Tier-1 supplier, engineered for low rolling resistance and long fatigue life.',
          id: 'Wheel bearing memungkinkan roda berputar dengan friksi minimal terhadap hub. NSK adalah produsen bantalan bola pertama Jepang dan pemasok Tier-1, direkayasa untuk hambatan gulir rendah dan masa pakai kelelahan panjang.',
        }, profile: BP.NSK },
      { brand: 'GMB', brandLogo: '/images/brands/gmb.png', image: '/images/parts/wheel_bearing.png',
        model: '/models/wheel_bearing.glb',
        desc: {
          en: 'GMB manufactures 700+ wheel bearing types with quality steel alloys, exported to 100+ countries as a competitively priced alternative to premium brands.',
          id: 'GMB memproduksi 700+ jenis wheel bearing dengan paduan baja berkualitas, diekspor ke 100+ negara sebagai alternatif dengan harga kompetitif dibanding merek premium.',
        }, profile: BP.GMB },
    ],
  },

  {
    x: 33, y: 82, label: 'Rack Steering Assy', labelDir: 'right', icon: '🎯',
    brandVariants: [
      { brand: 'NOK', brandLogo: '/images/brands/nok.png', image: '/images/parts/rack_steering.png', model: '/models/rack_steering_assy.glb', cameraZoom: 0.68,
        desc: {
          en: 'NOK rack seals and power steering fluid seals resist hydraulic pressure and thermal cycling, enabling a cost-effective rack rebuild as an alternative to full assembly replacement.',
          id: 'Rack seal dan power steering fluid seal NOK tahan tekanan hidrolik dan siklus termal, memungkinkan rebuild rack yang hemat biaya sebagai alternatif penggantian rakitan penuh.',
        }, profile: BP['NOK-steering'] },
    ],
  },

  {
    x: 48, y: 83, label: 'Wheel Bearing', labelDir: 'left', icon: '🔵',
    brandVariants: [
      { brand: 'NSK', brandLogo: '/images/brands/nsk.png', image: '/images/parts/wheel_bearing.png',
        model: '/models/wheel_bearing.glb',
        desc: {
          en: 'The front-right wheel bearing allows the wheel to spin smoothly. NSK is recognized as the aftermarket quality benchmark, Tier-1 OEM across 30+ countries.',
          id: 'Wheel bearing depan-kanan memungkinkan roda berputar dengan lancar. NSK diakui sebagai tolok ukur kualitas aftermarket, OEM Tier-1 di 30+ negara.',
        }, profile: BP.NSK },
      { brand: 'GMB', brandLogo: '/images/brands/gmb.png', image: '/images/parts/wheel_bearing.png',
        model: '/models/wheel_bearing.glb',
        desc: {
          en: 'GMB wheel bearings offer strong coverage for Toyota, Nissan, Honda, and Isuzu applications with reliable load capacity and fatigue resistance.',
          id: 'Wheel bearing GMB menawarkan cakupan kuat untuk aplikasi Toyota, Nissan, Honda, dan Isuzu dengan kapasitas beban dan ketahanan kelelahan yang andal.',
        }, profile: BP.GMB },
    ],
  },

  {
    x: 85, y: 15, label: 'Shock Absorber', labelDir: 'left', icon: '🔧',
    brandVariants: [
      { brand: 'Showa', brandLogo: '/images/brands/showa.png', image: '/images/parts/shock_absorber_rear.png', model: '/models/shock_absorber.glb',
        desc: {
          en: 'The rear-right shock absorber uses twin-tube technology to absorb impacts. A dedicated valve optimizes damping across a range of road conditions.',
          id: 'Shock absorber belakang-kanan menggunakan teknologi twin-tube untuk meredam benturan. Katup khusus mengoptimalkan peredaman di berbagai kondisi jalan.',
        }, profile: BP.Showa },
      { brand: 'KJ Shock Absorber', brandLogo: '/images/brands/kj.png', image: '/images/parts/shock_absorber_rear_kj.png', model: '/models/shock_absorber.glb',
        desc: {
          en: 'KJ rear shock absorber delivers reliable damping suited to Southeast Asian road conditions, with wide fitment coverage and strong distribution availability across the region.',
          id: 'Shock absorber belakang KJ memberikan peredaman andal yang sesuai kondisi jalan Asia Tenggara, dengan cakupan kecocokan luas dan ketersediaan distribusi yang kuat di kawasan ini.',
        }, profile: BP.KJ },
    ],
  },

  {
    x: 87, y: 26, label: 'Upper Arm', labelDir: 'left', icon: '🔩',
    brandVariants: [
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/upper_arm_rear.png', model: '/models/upper_arm.glb',
        desc: {
          en: 'The rear-right upper arm controls wheel geometry within an independent multi-link system, delivering precise handling and ride comfort. CNC-machined to OEM tolerances by Sankei Industry (555).',
          id: 'Upper arm belakang-kanan mengatur geometri roda dalam sistem multi-link independen, memberikan handling presisi dan kenyamanan berkendara. Dikerjakan CNC sesuai toleransi OEM oleh Sankei Industry (555).',
        }, profile: BP['555'] },
    ],
  },

  {
    x: 88, y: 29, label: 'Bushing', labelDir: 'left', icon: '⭕',
    brandVariants: [
      { brand: 'RBI', brandLogo: '/images/brands/rbi.png', image: '/images/parts/bushing_rear.png', model: '/models/bushing.glb',
        desc: {
          en: 'The rear rubber bushing dampens vibration and noise transmitted from the suspension to the cabin. RBI compounds are formulated for tropical heat and humidity.',
          id: 'Bushing karet belakang meredam getaran dan suara yang diteruskan dari suspensi ke kabin. Kompon RBI diformulasikan untuk panas dan kelembapan tropis.',
        }, profile: BP.RBI },
      { brand: 'KJTRIC', brandLogo: '/images/brands/kjtric.png', image: '/images/parts/bushing_rear.png', model: '/models/bushing.glb',
        desc: {
          en: 'KJTRIC offers an affordable rear bushing option engineered for high-volume Japanese vehicles common in Indonesia.',
          id: 'KJTRIC menawarkan bushing belakang yang terjangkau, direkayasa untuk kendaraan Jepang volume tinggi yang umum di Indonesia.',
        }, profile: BP.KJTRIC },
    ],
  },

  {
    x: 85, y: 40, label: 'Link Stabilizer', labelDir: 'left', icon: '↔️',
    brandVariants: [
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/stabilizer.png', model: '/models/link_stabilizer.glb',
        desc: {
          en: 'The link stabilizer (sway bar link) connects the anti-roll bar to the suspension, reducing body roll during cornering and keeping the vehicle balanced.',
          id: 'Link stabilizer (sway bar link) menghubungkan anti-roll bar ke suspensi, mengurangi body roll saat menikung dan menjaga keseimbangan kendaraan.',
        }, profile: BP['555-link'] },
    ],
  },

  {
    x: 90, y: 44, label: 'Lower Arm', labelDir: 'left', icon: '🔩',
    brandVariants: [
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/lower_arm_rear.png', model: '/models/lower_arm.glb',
        desc: {
          en: 'The rear-right lower arm is a key component of the multi-link system that independently controls rear wheel movement for optimal ride comfort. High-tensile forged steel by Sankei Industry (555).',
          id: 'Lower arm belakang-kanan adalah komponen kunci dalam sistem multi-link yang mengontrol pergerakan roda belakang secara independen untuk kenyamanan berkendara optimal. Baja tarik tinggi tempa oleh Sankei Industry (555).',
        }, profile: BP['555-lower'] },
    ],
  },

  {
    x: 93, y: 42, label: 'Brake Pad / Disc Rotor', labelDir: 'left', icon: '🔴',
    brandVariants: [
      { brand: 'Compact Brakes', brandLogo: '/images/brands/compact-brakes.png', image: '/images/parts/disc_rotor.png',
        model: '/models/disk_rotor.glb', baseRotationX: Math.PI / 2,
        desc: {
          en: 'The rear-right brake pad and disc rotor work together with ABS for optimal front-to-rear brake distribution. Compact Brakes rotors use Y Groove Technology for improved cooling.',
          id: 'Brake pad dan disc rotor belakang-kanan bekerja sama dengan ABS untuk distribusi pengereman depan-belakang yang optimal. Rotor Compact Brakes menggunakan Y Groove Technology untuk pendinginan yang lebih baik.',
        }, profile: BP['Compact Brakes-rotor'] },
    ],
  },
]

// Computed helpers
const currentHs = computed(() => activeHs.value !== null ? hotspots[activeHs.value] : null)
const currentVariant = computed(() => currentHs.value ? currentHs.value.brandVariants[activeBrand.value] : null)

const specifications = computed(() => currentVariant.value?.profile?.specifications || [])

const productHighlights = computed(() => currentVariant.value?.profile?.productHighlights || [])

const oemList = computed(() => {
  const oem = currentVariant.value?.profile?.oem
  if (!oem) return []
  return oem.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8)
})

const DEFAULT_VIDEO = { type: 'youtube', id: '7ciFbh99P9U' } 
const BRAND_VIDEOS = {
  'Showa':           { type: 'youtube', id: 'D_3ZpJAX33A' },
  'KJ':              { type: 'youtube', id: '7ciFbh99P9U' }, 
  'RBI':             { type: 'youtube', id: '7ciFbh99P9U' }, 
  'NOK':             { type: 'youtube', id: '7ciFbh99P9U' }, 
  'NSK':             { type: 'youtube', id: 'ZZuBGQMbvPY' },
  'GMB':             { type: 'youtube', id: 'rFBkQmhtRjM' },
  'KJTRIC':          { type: 'youtube', id: '7ciFbh99P9U' }, 
  '555': { type: 'local', src: '/videos/555 Factory.mp4' },
  'Compact Brakes': { type: 'youtube', id: 'l8zUNcN-T5k' },
  'Seiken': { type: 'local', src: '/videos/SEIKEN 1.mp4' },
}
const currentVideoConfig = computed(() => BRAND_VIDEOS[currentVariant.value?.brand] || DEFAULT_VIDEO)
const currentVideoUrl = computed(() => {
  const v = currentVideoConfig.value
  return v.type === 'youtube'
    ? `https://www.youtube.com/embed/${v.id}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}`
    : ''
})

const currentVideoKey = computed(() => {
  const v = currentVideoConfig.value
  return v.type === 'youtube' ? v.id : v.src
})
function shortLabel(field, max = 24) {
  const s = bl(field) || ''
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s
}

const imgCache = new Set()
function preloadOne(src) {
  if (!src || imgCache.has(src)) return
  imgCache.add(src)
  const img = new Image()
  img.decoding = 'async'
  img.src = src
}
function preloadAllPartImages() {
  hotspots.forEach(hs => {
    hs.brandVariants?.forEach(bv => {
      preloadOne(bv.image)
      preloadOne(bv.brandLogo)
    })
  })
}

const HOTSPOT_GROUPS = [
  [7, 8],
  [11, 12],
]
const GROUP_FOLLOWERS = new Set(HOTSPOT_GROUPS.flatMap(([, follower]) => [follower]))

function hotspotGroup(index) {
  return HOTSPOT_GROUPS.find(group => group.includes(index))
}
function isGroupedFollower(index) {
  return GROUP_FOLLOWERS.has(index)
}
function hotspotNumber(index) {
  const group = hotspotGroup(index)
  return group ? group.map(item => String(item + 1).padStart(2, '0')).join('/') : String(index + 1).padStart(2, '0')
}
function hotspotStyle(index) {
  const group = hotspotGroup(index)
  if (!group) return { left: hotspots[index].x + '%', top: hotspots[index].y + '%' }
  const items = group.map(item => hotspots[item])
  return {
    left: (items.reduce((sum, item) => sum + item.x, 0) / items.length) + '%',
    top: (items.reduce((sum, item) => sum + item.y, 0) / items.length) + '%',
  }
}
function handleHotspotClick(index) {
  const group = hotspotGroup(index)
  if (group) choicePair.value = group
  else openPopup(index)
}
function selectGroupedPart(index) {
  choicePair.value = null
  openPopup(index)
}

function openPopup(i) {
  const hs = hotspots[i]
  if (!hs.brandVariants || hs.brandVariants.length === 0) return
  activeBrand.value = 0
  popupTab.value = 'model'
  const img = imgRef.value
  if (!img) { activeHs.value = i; return }
  const imgW = img.clientWidth, imgH = img.clientHeight
  panX.value = -((hs.x / 100) * imgW - imgW / 2) * ZOOM_HOTSPOT
  panY.value = -((hs.y / 100) * imgH - imgH / 2) * ZOOM_HOTSPOT
  scale.value = ZOOM_HOTSPOT
  setTimeout(() => { activeHs.value = i }, 300)
}
function closePopup()  { activeHs.value = null; activeBrand.value = 0; popupTab.value = 'model'; videoExpanded.value = false; scale.value = portraitBaseScale; panX.value = 0; panY.value = 0 }
function prevPart() {
  let i = activeHs.value - 1
  while (i >= 0 && (!hotspots[i].brandVariants || hotspots[i].brandVariants.length === 0)) i--
  if (i >= 0) openPopup(i)
}
function nextPart() {
  let i = activeHs.value + 1
  while (i < hotspots.length && (!hotspots[i].brandVariants || hotspots[i].brandVariants.length === 0)) i++
  if (i < hotspots.length) openPopup(i)
}
function zoomIn()      { scale.value = Math.min(SCALE_MAX, scale.value * 1.2) }
function zoomOut()     { scale.value = Math.max(SCALE_MIN, scale.value / 1.2) }
function resetView()   { scale.value = portraitBaseScale; panX.value = 0; panY.value = 0 }
function switchBrand(i) { activeBrand.value = i }

function onWheel(e) {
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newS  = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale.value * delta))
  const rect  = canvasEl.value.getBoundingClientRect()
  const mx    = e.clientX - rect.left - rect.width  / 2
  const my    = e.clientY - rect.top  - rect.height / 2
  const ratio = newS / scale.value
  panX.value  = mx + (panX.value - mx) * ratio
  panY.value  = my + (panY.value - my) * ratio
  scale.value = newS
}

function onPointerDown(e) {
  if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('button, .hotspot, [role="button"]')) return
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (activePointers.size === 2) {
    lastPinchDistance = getPointerDistance()
    isPanning = false
    return
  }
  isPanning = true
  lastPanX = e.clientX
  lastPanY = e.clientY
  e.currentTarget.setPointerCapture?.(e.pointerId)
  if (cursorRing.value) cursorRing.value.classList.add('grabbing')
}
function onPointerMove(e) {
  if (activePointers.has(e.pointerId)) activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (activePointers.size >= 2) {
    const distance = getPointerDistance()
    if (lastPinchDistance > 0) scale.value = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale.value * distance / lastPinchDistance))
    lastPinchDistance = distance
    return
  }
  if (!isPanning) return
  panX.value += e.clientX - lastPanX
  panY.value += e.clientY - lastPanY
  lastPanX = e.clientX
  lastPanY = e.clientY
}
function onPointerUp(e) {
  activePointers.delete(e.pointerId)
  if (activePointers.size === 1) {
    const remaining = activePointers.values().next().value
    lastPanX = remaining.x
    lastPanY = remaining.y
    isPanning = true
  } else {
    isPanning = false
  }
  lastPinchDistance = 0
  if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  if (cursorRing.value) cursorRing.value.classList.remove('grabbing')
}
function getPointerDistance() {
  const pointers = [...activePointers.values()]
  return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
}
function onImgLoad()     {}

onMounted(() => {
  if (window.innerWidth / window.innerHeight < 0.75) {
    portraitBaseScale = 0.7
    scale.value = portraitBaseScale
  }
  window.addEventListener('mousemove', updateCursor)
  rafCursor = requestAnimationFrame(animateCursorRing)

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadAllPartImages, { timeout: 2000 })
  } else {
    setTimeout(preloadAllPartImages, 800)
  }
})
onUnmounted(() => { window.removeEventListener('mousemove', updateCursor); if (rafCursor) cancelAnimationFrame(rafCursor) })
</script>

  <style scoped>

  * { cursor: none !important; }
  .cursor-dot {
    position: fixed; width: 8px; height: 8px;
    background: #0066E6; border-radius: 50%;
    transform: translate(-50%,-50%);
    pointer-events: none; z-index: 9999;
    box-shadow: 0 0 12px rgba(0,102,230,0.7);
    transition: width .15s, height .15s, background .15s;
  }
  .cursor-ring {
    position: fixed; width: 38px; height: 38px;
    transform: translate(-50%,-50%);
    pointer-events: none; z-index: 9998;
    transition: width .3s ease, height .3s ease;
  }
  .cursor-ring.grabbing { width: 56px; height: 56px; }
  .cursor-svg { width: 100%; height: 100%; animation: cursor-spin 8s linear infinite; }
  @keyframes cursor-spin { to { transform: rotate(360deg); } }

  .chassis-viewer {
    position: absolute; inset: 0; overflow: hidden;
    background: #05070D;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
  }

  .bg-photo {
    position: absolute; inset: 0; z-index: 0;
    background-image: url('/images/background/bg_chassis.png');
    background-size: cover;
    background-position: center 52%;
    animation: bg-drift 24s ease-in-out infinite alternate;
  }
  @keyframes bg-drift {
    from { transform: scale(1.04); }
    to   { transform: scale(1.1) translate(-1%, -0.5%); }
  }
  .bg-overlay {
    position: absolute; inset: 0; z-index: 0;
    background:
      linear-gradient(180deg, rgba(3,6,14,0.82) 0%, rgba(4,8,18,0.5) 24%, rgba(4,8,18,0.58) 76%, rgba(3,6,14,0.9) 100%),
      linear-gradient(100deg, rgba(2,5,12,0.5) 0%, rgba(2,5,12,0.1) 45%, rgba(2,5,12,0.5) 100%);
  }
  .bg-vignette {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(ellipse 78% 78% at 50% 48%, transparent 42%, rgba(1,3,8,0.55) 100%);
  }
  .bg-grid {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image:
      linear-gradient(rgba(80,160,255,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(80,160,255,0.07) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 80%);
  }
  .bg-radial {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(ellipse 65% 65% at 55% 52%, rgba(0,120,255,0.1) 0%, transparent 65%);
    animation: radial-breathe 6s ease-in-out infinite;
  }
  @keyframes radial-breathe { 0%,100% { opacity: 0.7; transform: scale(0.97); } 50% { opacity: 1; transform: scale(1.03); } }
  .bg-scan {
    position: absolute; left: 0; right: 0; height: 1px; z-index: 2;
    background: linear-gradient(90deg, transparent, rgba(60,150,255,0.5), transparent);
    animation: scan-sweep 10s ease-in-out infinite; pointer-events: none;
  }
  @keyframes scan-sweep { 0% { top: 10%; opacity: 0; } 6% { opacity: 0.7; } 44% { opacity: 0.35; } 50% { top: 90%; opacity: 0; } 100% { top: 90%; opacity: 0; } }

  .hero-glow {
    position: absolute; left: 50%; top: 46%;
    width: 900px; height: 560px; transform: translate(-50%, -50%);
    background: radial-gradient(ellipse at center, rgba(0,120,255,0.14) 0%, rgba(0,150,255,0.06) 45%, transparent 70%);
    pointer-events: none; z-index: 1;
    animation: glow-pulse 4.5s ease-in-out infinite;
  }
  .hero-glow--orange {
    width: 560px; height: 360px;
    left: 50%; top: auto; bottom: -100px; transform: translateX(-50%);
    background: radial-gradient(ellipse at center, rgba(255,90,31,0.09) 0%, transparent 70%);
    animation: glow-pulse-orange 5.5s 1s ease-in-out infinite;
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.7; transform: translate(-50%,-50%) scale(0.97); }
    50%       { opacity: 1;   transform: translate(-50%,-50%) scale(1.03); }
  }
  @keyframes glow-pulse-orange {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(0.97); }
    50%       { opacity: 1;   transform: translateX(-50%) scale(1.05); }
  }

  .bg-logo-wrap {
    position: absolute; inset: 0; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .bg-logo-ring {
    position: absolute;
    border-radius: 50%;
    aspect-ratio: 1;
  }
  .bg-logo-ring-1 {
    width: 46vw; max-width: 680px; min-width: 300px;
    border: 1px dashed rgba(80,160,255,0.16);
    animation: bg-ring-spin 42s linear infinite;
  }
  .bg-logo-ring-2 {
    width: 56vw; max-width: 820px; min-width: 360px;
    border: 1px dotted rgba(80,160,255,0.1);
    animation: bg-ring-spin-rev 60s linear infinite;
  }
  @keyframes bg-ring-spin     { to { transform: rotate(360deg); } }
  @keyframes bg-ring-spin-rev { to { transform: rotate(-360deg); } }
  .bg-logo-img {
    position: relative; z-index: 1;
    width: 38vw; max-width: 560px; min-width: 240px;
    object-fit: contain;
    opacity: 0.05;
    filter: saturate(1.4) brightness(1.6);
    animation: logo-float 12s ease-in-out infinite, logo-fade 7s ease-in-out infinite;
  }
  @keyframes logo-float {
    0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
    50%      { transform: scale(1.06) rotate(1.2deg) translateY(-12px); }
  }
  @keyframes logo-fade {
    0%, 100% { opacity: 0.04; }
    50%      { opacity: 0.09; }
  }

  .speed-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
  .speed-line {
    position: absolute; left: -200px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(90,180,255,0.85), transparent);
    animation: speed-rush linear infinite;
  }
  @keyframes speed-rush { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 250px)); } }

  .hud-corner { position: absolute; width: 44px; height: 44px; pointer-events: none; z-index: 15; }
  .hud-tl { top: 66px; left: 286px; }
  .hud-tr { top: 66px; right: 68px; }
  .hud-bl { bottom: 48px; left: 286px; }
  .hud-br { bottom: 48px; right: 68px; }
  .hud-h { position: absolute; top: 0; left: 0; width: 22px; height: 1.5px; background: rgba(80,160,255,0.5); box-shadow: 0 0 6px rgba(51,153,255,0.4); }
  .hud-v { position: absolute; top: 0; left: 0; width: 1.5px; height: 22px; background: rgba(80,160,255,0.5); box-shadow: 0 0 6px rgba(51,153,255,0.4); }
  .hud-tr .hud-h { left: auto; right: 0; }
  .hud-tr .hud-v { left: auto; right: 0; }
  .hud-bl .hud-h { top: auto; bottom: 0; }
  .hud-bl .hud-v { top: auto; bottom: 0; }
  .hud-br .hud-h { top: auto; bottom: 0; left: auto; right: 0; }
  .hud-br .hud-v { top: auto; bottom: 0; left: auto; right: 0; }
  .hud-lbl { position: absolute; bottom: -17px; left: 0; font-size: 7px; letter-spacing: .17em; color: rgba(140,190,255,0.55); white-space: nowrap; text-transform: uppercase; }
  .hud-tr .hud-lbl, .hud-br .hud-lbl { left: auto; right: 0; }
  .hud-bl .hud-lbl, .hud-br .hud-lbl { bottom: auto; top: -17px; }

  .topbar {
    position: absolute; top: 0; left: 0; right: 0; height: 58px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 130px 0 20px;
    background: rgba(6,10,20,0.72); backdrop-filter: blur(18px);
    border-bottom: 1.5px solid rgba(60,150,255,0.22);
    z-index: 20; box-shadow: 0 2px 24px rgba(0,0,0,0.4);
  }
  .topbar-left  { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .trad-logo-bar { height: 34px; width: auto; object-fit: contain; flex-shrink: 0; filter: drop-shadow(0 0 8px rgba(0,120,255,0.35)); }
  .tb-sep { width: 1px; height: 26px; background: rgba(80,160,255,0.25); }
  .topbar-text-group { display: flex; flex-direction: column; gap: 1px; }
  .topbar-brand { font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif); font-size: 15px; font-weight: 800; letter-spacing: .07em; color: #F2F6FF; text-transform: uppercase; line-height: 1; }
  .accent { color: #58AEFF; }
  .topbar-sub { font-size: 9px; letter-spacing: .24em; color: rgba(160,200,255,0.6); text-transform: uppercase; }
  .topbar-center { display: flex; align-items: center; justify-content: center; flex: 1; }
  .topbar-pill { display: flex; align-items: center; gap: 7px; background: rgba(0,119,255,0.1); border: 1px solid rgba(60,150,255,0.35); border-radius: 20px; padding: 6px 14px; font-size: 10px; letter-spacing: .14em; color: #7FC0FF; }
  .topbar-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #3399FF; box-shadow: 0 0 6px rgba(51,153,255,.8); animation: dot-pulse 1.8s ease-in-out infinite; }
  @keyframes dot-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.7); } }
  .topbar-right { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
  .tab { min-height: 44px; font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .12em; padding: 7px 15px; border-radius: 4px; border: 1px solid rgba(80,160,255,0.22); background: rgba(10,18,32,0.5); color: rgba(180,205,240,.65); transition: all .2s; }
  .tab--active { background: #0066E6; border-color: #3399FF; color: white; box-shadow: 0 0 14px rgba(0,102,230,.5); }
  .tab:hover:not(.tab--active) { border-color: rgba(80,160,255,.5); color: #7FC0FF; background: rgba(0,119,255,.14); }
  .btn-back { min-height: 44px; font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .1em; padding: 7px 15px; border-radius: 4px; border: 1px solid rgba(80,160,255,.22); background: rgba(10,18,32,0.5); color: rgba(210,228,255,0.8); margin-left: 4px; transition: all .2s; }
  .btn-back:hover { border-color: #3399FF; color: #7FC0FF; background: rgba(0,119,255,.14); }

  .left-sidebar {
    position: absolute; left: 0; top: 58px; bottom: 40px;
    width: 280px; z-index: 15;
    background: rgba(6,10,20,0.8); backdrop-filter: blur(16px);
    border-right: 1.5px solid rgba(80,160,255,0.22);
    display: flex; flex-direction: column;
    box-shadow: 4px 0 30px rgba(0,0,0,0.45);
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
  }
  .left-sidebar.hidden { transform: translateX(-100%); opacity: 0; }
  .sidebar-header { display: flex; align-items: center; gap: 10px; padding: 18px 20px 14px; border-bottom: 1px solid rgba(80,160,255,0.15); }
  .sidebar-dot { width: 8px; height: 8px; border-radius: 50%; background: #3399FF; box-shadow: 0 0 8px rgba(51,153,255,.8); animation: dot-pulse 2s ease-in-out infinite; flex-shrink: 0; }
  .sidebar-title { font-size: 13px; letter-spacing: .18em; color: #8FCBFF; text-transform: uppercase; font-weight: 800; }
  .sidebar-list { flex: 1; overflow-y: auto; padding: 8px 0; }
  .sidebar-list::-webkit-scrollbar { width: 4px; }
  .sidebar-list::-webkit-scrollbar-track { background: transparent; }
  .sidebar-list::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.3); border-radius: 2px; }
  .sidebar-item { width: 100%; min-height: 54px; display: flex; align-items: flex-start; gap: 12px; padding: 13px 20px; border: 0; border-left: 3px solid transparent; background: transparent; color: inherit; text-align: left; transition: all .15s ease; touch-action: manipulation; }
  .sidebar-item:hover { background: rgba(0,119,255,0.1); border-left-color: rgba(80,160,255,.4); }
  .sidebar-item--active { background: rgba(0,119,255,0.16); border-left-color: #3399FF; }
  .sidebar-num { font-size: 14px; font-weight: 800; color: rgba(150,195,255,.6); letter-spacing: .02em; flex-shrink: 0; width: 26px; padding-top: 2px; font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif); }
  .sidebar-item--active .sidebar-num { color: #58AEFF; }
  .sidebar-item-info { flex: 1; min-width: 0; }
  .sidebar-name { font-size: 14px; font-weight: 600; letter-spacing: .01em; color: #F2F6FF; display: block; white-space: normal; word-break: break-word; line-height: 1.4; }
  .sidebar-item--active .sidebar-name { color: #8FCBFF; font-weight: 700; }
  .sidebar-brands { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .sidebar-brand-dot { font-size: 10px; font-weight: 600; letter-spacing: .05em; color: rgba(190,215,245,.85); text-transform: uppercase; background: rgba(80,160,255,0.14); border: 1px solid rgba(80,160,255,0.22); border-radius: 4px; padding: 2px 7px; }
  .sidebar-item--empty { cursor: default; opacity: 0.55; }
  .sidebar-item--empty:hover { background: transparent; border-left-color: transparent; }
  .sidebar-brand-dot--empty { color: rgba(160,170,190,.7); background: rgba(140,150,170,0.1); font-style: italic; }

  .zoom-controls { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 7px; background: rgba(8,14,26,0.75); backdrop-filter: blur(16px); border: 1px solid rgba(80,160,255,0.25); border-radius: 12px; padding: 12px 9px; z-index: 15; box-shadow: 0 4px 30px rgba(0,0,0,0.45); }
  .zoom-btn { width: 44px; height: 44px; border-radius: 6px; border: 1px solid rgba(80,160,255,0.28); background: rgba(10,18,32,0.6); color: rgba(180,205,240,.8); display: flex; align-items: center; justify-content: center; transition: all .2s; touch-action: manipulation; }
  .zoom-btn:hover { background: rgba(0,119,255,0.16); border-color: rgba(80,160,255,.6); color: #7FC0FF; }
  .zoom-btn svg { width: 14px; height: 14px; }
  .zoom-track { width: 4px; height: 72px; background: rgba(80,160,255,0.18); border-radius: 2px; position: relative; overflow: visible; }
  .zoom-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, #0066E6, #3399FF); border-radius: 2px; transition: height .15s ease; box-shadow: 0 0 8px rgba(51,153,255,0.5); }
  .zoom-thumb { position: absolute; left: 50%; width: 12px; height: 12px; background: white; border: 2px solid #3399FF; border-radius: 50%; transform: translate(-50%, 50%); box-shadow: 0 0 8px rgba(51,153,255,.6); transition: bottom .15s ease; }
  .zoom-divider { width: 20px; height: 1px; background: rgba(80,160,255,0.2); }
  .zoom-pct { font-size: 8px; letter-spacing: .08em; color: rgba(160,200,255,.55); white-space: nowrap; }

  .canvas-area { position: absolute; inset: 58px 0 40px 280px; overflow: hidden; display: flex; align-items: center; justify-content: center; z-index: 5; touch-action: none; user-select: none; }
  .has-active .canvas-area { left: 0; }
  .canvas-inner { position: relative; display: inline-block; will-change: transform; z-index: 3; }
  .canvas-inner.animate-transform { transition: transform .55s cubic-bezier(0.16,1,0.3,1); }
  .img-wrap { position: relative; display: inline-block; }
  .stage { position: relative; display: inline-block; transform: translateY(9%); }
  .img-halo { position: absolute; inset: -60px; background: radial-gradient(ellipse at center, rgba(0,120,255,0.14) 0%, transparent 60%); pointer-events: none; animation: radial-breathe 5s ease-in-out infinite; }
  .img-ring { position: absolute; left: 50%; top: 50%; border-radius: 50%; pointer-events: none; transform: translate(-50%,-50%); }
  .img-ring--1 { width: 108%; height: 108%; border: 1px dashed rgba(80,160,255,0.18); animation: bg-ring-spin 34s linear infinite; }
  .img-ring--2 { width: 122%; height: 122%; border: 1px dotted rgba(80,160,255,0.12); animation: bg-ring-spin-rev 48s linear infinite; }

  .img-float { animation: chassis-float 6s ease-in-out infinite; transform-origin: 50% 85%; }
  @keyframes chassis-float {
    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
    50%       { transform: translateY(-10px) rotate(0.35deg) scale(1.008); }
  }
  .chassis-img { display: block; max-width: 1020px; width: 68vw; height: auto; border-radius: 12px; pointer-events: none; filter: drop-shadow(0 30px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 40px rgba(0,120,255,0.12)); }

  .hotspot { position: absolute; width: 30px; height: 30px; padding: 0; border: 0; background: transparent; color: inherit; appearance: none; transform: translate(-50%,-50%); z-index: 10; cursor: pointer; touch-action: manipulation; }
  .hs-pulse { position: absolute; width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(51,153,255,0.38); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; opacity: .55; }
  .hs-p1, .hs-p2 { animation: none; }
  @keyframes hs-pulse { 0% { transform: translate(-50%,-50%) scale(.4); opacity: .9; } 100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
  .hs-core { position: absolute; top: 50%; left: 50%; width: 20px; height: 20px; border-radius: 50%; background: #0066E6; border: 2px solid rgba(150,205,255,0.9); display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); box-shadow: 0 0 8px rgba(51,153,255,0.5), 0 2px 6px rgba(0,0,0,0.4); transition: none; }
  .hotspot:hover .hs-core, .hotspot.active .hs-core { transform: translate(-50%, -50%); background: #0066E6; border-color: rgba(150,205,255,0.9); box-shadow: 0 0 8px rgba(51,153,255,0.5), 0 2px 6px rgba(0,0,0,0.4); }
  .hs-num { font-size: 7px; font-weight: 800; color: #ffffff; letter-spacing: -.02em; line-height: 1; transition: color .2s; }
  .hotspot:hover .hs-num, .hotspot.active .hs-num { color: white; }
  .hotspot:active .hs-core { transform: translate(-50%, -50%); }
  .hs-tag { position: absolute; top: 50%; display: flex; align-items: center; gap: 0; pointer-events: none; opacity: 0; transition: opacity .2s, transform .2s; }
  .hs-tag.right { left: 26px; transform: translateY(-50%); }
  .hs-tag.left  { right: 26px; transform: translateY(-50%); flex-direction: row-reverse; }
  .hotspot:hover .hs-tag, .hotspot.active .hs-tag { opacity: 1; }
  .hs-tag-line { display: block; width: 16px; height: 1px; background: rgba(80,160,255,0.6); flex-shrink: 0; }
  .hs-tag-body { display: flex; flex-direction: column; gap: 1px; background: rgba(6,10,20,0.9); backdrop-filter: blur(10px); border: 1px solid rgba(80,160,255,0.35); border-radius: 5px; padding: 4px 9px; box-shadow: 0 3px 16px rgba(0,0,0,0.5); }
  .hs-tag-name { font-size: 9px; font-weight: 600; letter-spacing: .06em; color: #F2F6FF; white-space: nowrap; line-height: 1.2; }
  .hs-tag-brand { font-size: 7.5px; letter-spacing: .1em; color: rgba(160,200,255,.7); text-transform: uppercase; white-space: nowrap; }
  .hs-tag-brand--empty { color: rgba(160,165,180,.65); font-style: italic; }
  .hotspot--empty { cursor: default; }
  .hotspot--empty .hs-core { background: rgba(30,36,50,0.75); border-color: rgba(150,160,180,0.4); box-shadow: 0 0 8px rgba(0,0,0,0.3); }
  .hotspot--empty .hs-num { color: rgba(180,186,200,.65); }
  .hotspot--empty:hover .hs-core { transform: translate(-50%, -50%); background: rgba(40,46,60,0.85); border-color: rgba(150,160,180,0.5); }
  .hotspot--empty:hover .hs-num { color: rgba(200,206,220,.75); }
  .hotspot--empty .hs-pulse { border-color: rgba(150,160,180,0.25); }

  .popup-overlay {
    position: absolute; inset: 58px 0 40px 0;
    background: rgba(3,6,14,0.6); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 10px;
  }

  .popup-close {
    position: absolute; top: 14px; right: 14px; width: 44px; height: 44px;
    border-radius: 50%; border: 1px solid rgba(80,160,255,0.25);
    background: rgba(8,14,26,0.75); color: #DCEAFF; font-size: 13px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s; z-index: 30; backdrop-filter: blur(6px);
  }
  .popup-close:hover { background: #E02020; color: white; border-color: #E02020; }

  .popup-card--redesign {
    position: relative;
    background: #05070D;
    border-radius: 20px;
    width: 98vw; max-width: 1760px; height: 95vh; max-height: 980px;
    box-shadow: 0 32px 90px rgba(0,10,40,0.5);
    overflow: hidden;
    border: 1px solid rgba(80,160,255,0.18);
    font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
  }
  .rd-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image: url('/images/background/bg_popup.png');
    background-size: cover;
    background-position: center;
  }
  .rd-bg-overlay {
    position: absolute; inset: 0; z-index: 1;
    background:
      linear-gradient(180deg, rgba(3,6,14,0.88) 0%, rgba(3,6,14,0.7) 30%, rgba(3,6,14,0.78) 75%, rgba(3,6,14,0.92) 100%),
      radial-gradient(ellipse 60% 60% at 50% 42%, transparent 0%, rgba(2,4,10,0.55) 100%);
  }

  .rd-layout {
    position: relative; z-index: 2;
    height: 100%; display: flex; flex-direction: column;
    padding: 20px 28px 16px;
    overflow-y: auto;
  }
  .rd-layout::-webkit-scrollbar { width: 5px; }
  .rd-layout::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.25); border-radius: 3px; }

  .rd-icon-slot {
    display: inline-flex; flex-shrink: 0;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px dashed rgba(90,170,255,0.4);
    background: rgba(90,170,255,0.05);
  }
  .rd-icon-slot--lg { width: 60px; height: 60px; border-radius: 18px; }
  .rd-icon-slot--logo { width: 44px; height: 44px; border-radius: 10px; }

  .rd-icon-slot--filled {
    border-style: solid;
    border-color: rgba(90,170,255,0.3);
    background: rgba(90,170,255,0.08);
    object-fit: contain;
    padding: 8px;
    box-sizing: border-box;
  }

  .rd-panel-title {
    display: block; font-family: var(--font-mono, monospace); font-size: 10px;
    letter-spacing: .2em; color: rgba(150,195,255,.7); text-transform: uppercase;
    margin-bottom: 12px;
  }

  .rd-brand-select { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; flex-shrink: 0; }
  .rd-brand-select-label { font-family: var(--font-mono, monospace); font-size: 9.5px; letter-spacing: .2em; color: rgba(150,195,255,.55); text-transform: uppercase; }
  .rd-brand-tabs { display: flex; gap: 10px; flex-wrap: wrap; }
  .rd-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding: 8px;
    margin: 0 0 14px;
    border: 1px solid rgba(80,160,255,0.16);
    border-radius: 10px;
    background: rgba(8,14,26,0.58);
    flex-shrink: 0;
  }
  .rd-tab {
    min-height: 36px;
    padding: 7px 12px;
    border: 1px solid rgba(80,160,255,0.2);
    border-radius: 6px;
    background: rgba(10,18,32,0.6);
    color: rgba(190,215,245,.7);
    font-family: var(--font-mono, monospace);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .08em;
    touch-action: manipulation;
  }
  .rd-tab--active {
    color: #fff;
    border-color: #3399FF;
    background: #0066E6;
    box-shadow: 0 0 12px rgba(0,102,230,.3);
  }
  .rd-brand-tab {
    position: relative; display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 10px; min-width: 70px;
    border: 1.5px solid rgba(80,160,255,0.2); background: rgba(10,18,32,0.55);
    transition: all .22s cubic-bezier(0.16,1,0.3,1);
  }
  .rd-brand-tab:hover:not(.rd-brand-tab--active) { border-color: rgba(80,160,255,.5); background: rgba(0,80,220,0.12); }
  .rd-brand-tab--active { border-color: #3399FF; background: rgba(0,102,230,0.16); box-shadow: 0 0 0 3px rgba(0,102,230,0.16); }
  .rd-brand-tab-logo-box { background: #fff; border-radius: 6px; padding: 3px 8px; display: flex; align-items: center; justify-content: center; }
  .rd-brand-tab-logo { max-height: 22px; max-width: 52px; object-fit: contain; }
  .rd-brand-tab-name { font-family: var(--font-mono, monospace); font-size: 11px; font-weight: 700; letter-spacing: .06em; color: #DCEAFF; }
  .rd-brand-tab-check { position: absolute; top: -6px; right: -6px; width: 16px; height: 16px; border-radius: 50%; background: #3399FF; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(51,153,255,.7); }

  /* ── Header ── */
  .rd-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 12px; flex-shrink: 0; }
  .rd-index { font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif); font-size: 42px; font-weight: 800; color: rgba(80,160,255,0.26); line-height: 1; }
  .rd-header-text { display: flex; flex-direction: column; gap: 4px; padding-top: 6px; }
  .rd-eyebrow { font-family: var(--font-mono, monospace); font-size: 10.5px; letter-spacing: .26em; color: rgba(130,190,255,.75); text-transform: uppercase; }
  .rd-title { font-size: 29px; font-weight: 800; color: #F8FAFF; margin: 0; letter-spacing: -.01em; position: relative; display: inline-block; padding-bottom: 6px; }
  .rd-title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 44px; height: 3px; border-radius: 2px; background: linear-gradient(90deg, #0066E6, #3399FF); }

  .rd-main {
    position: relative;
    display: flex;
    gap: 20px;
    flex: 1;
    min-height: 0;
    margin-bottom: 14px;
    padding-right: 400px;
  }

  .rd-specs {
    width: 300px; flex-shrink: 0;
    background: rgba(8,14,26,0.5); backdrop-filter: blur(10px);
    border: 1px solid rgba(80,160,255,0.18); border-radius: 16px;
    padding: 20px; align-self: flex-start;
  }
  .rd-specs-list { display: flex; flex-direction: column; gap: 16px; }
  .rd-spec-item { display: flex; align-items: flex-start; gap: 13px; }
  .rd-spec-item .rd-icon-slot { width: 38px; height: 38px; }
  .rd-spec-text {
    font-size: 13.5px; line-height: 1.55; color: rgba(230,240,255,0.9); padding-top: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .rd-stage { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }

  .rd-features { width: 100%; margin-bottom: 10px; }
  .rd-features-label {
    display: block; text-align: center; font-family: var(--font-mono, monospace); font-size: 9.5px;
    letter-spacing: .2em; color: rgba(150,195,255,.5); text-transform: uppercase; margin-bottom: 10px;
  }
  .rd-features-row { display: flex; align-items: flex-start; justify-content: center; gap: 6px; flex-wrap: wrap; }
  .rd-feature { display: flex; flex-direction: column; align-items: center; gap: 9px; width: 180px; position: relative; }
  .rd-feature-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: .03em; color: rgba(220,235,255,.85); text-align: center; text-transform: uppercase; line-height: 1.45;
    white-space: normal;
    overflow-wrap: break-word;
  }
  .rd-feature-connector { position: absolute; top: 30px; left: calc(50% + 52px); width:(100% - 52px); height: 1px; border-top: 1px dashed rgba(90,170,255,0.35); }

  .rd-stage-visual {
    position: relative; width: 100%; max-width: 480px; aspect-ratio: 1.15;
    display: flex; align-items: center; justify-content: center;
    min-height: 360px;
    flex-shrink: 0;
  }
  .rd-stage-halo {
    position: absolute; left: 50%; top: 38%; width: 130%; height: 110%;
    transform: translate(-50%, -50%); z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 50% 62% at center, rgba(50,150,255,0.5) 0%, rgba(20,120,255,0.28) 32%, rgba(0,90,220,0.14) 52%, rgba(0,70,200,0.05) 70%, transparent 82%);
    filter: blur(6px);
    animation: rd-halo-pulse 4.5s ease-in-out infinite;
  }
  @keyframes rd-halo-pulse { 0%,100% { opacity: .85; } 50% { opacity: 1; } }
  .rd-stage-ring { position: absolute; left: 50%; top: 58%; border-radius: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .rd-stage-ring--1 { width: 96%; height: 96%; border: 1px dashed rgba(90,170,255,0.3); animation: bg-ring-spin 40s linear infinite; }
  .rd-stage-ring--2 { width: 76%; height: 76%; border: 1px dotted rgba(90,170,255,0.24); animation: bg-ring-spin-rev 55s linear infinite; }
  .rd-stage-ring--3 { width: 56%; height: 56%; border: 1px solid rgba(90,170,255,0.18); }
  .rd-car-silhouette { position: absolute; bottom: 4%; left: 50%; transform: translateX(-50%); width: 96%; opacity: .9; pointer-events: none; z-index: 1; }
  .rd-orbit-dot {
    position: absolute; left: 50%; top: 58%; width: 6px; height: 6px; border-radius: 50%;
    background: #3399FF; box-shadow: 0 0 10px rgba(51,153,255,.9);
    animation: rd-orbit 6s linear infinite;
  }
  @keyframes rd-orbit {
    0%   { transform: rotate(0deg) translateX(170px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(170px) rotate(-360deg); }
  }
  .rd-stage-img { position: relative; z-index: 2; max-height: 84%; max-width: 62%; object-fit: contain; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 34px rgba(80,195,255,0.7)); animation: stage-img-float 5s ease-in-out infinite; }
  @keyframes stage-img-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .rd-stage-model { width: 62%; height: 78%; max-width: none; max-height: none; animation: none; }
  .rd-stage-img-placeholder { position: relative; z-index: 2; font-size: 60px; }
  .rd-pedestal-glow {
    position: absolute; bottom: 16%; left: 50%; width: 46%; height: 46px;
    transform: translateX(-50%); z-index: 1;
    background: radial-gradient(ellipse at center, rgba(20,170,255,0.55) 0%, rgba(0,150,255,0.18) 55%, transparent 75%);
    filter: blur(3px);
    animation: pedestal-pulse 3s ease-in-out infinite;
  }
  @keyframes pedestal-pulse { 0%,100% { opacity: .7; } 50% { opacity: 1; } }

.rd-profile {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-right: 6px; 
}

.rd-profile::-webkit-scrollbar { width: 4px; }
.rd-profile::-webkit-scrollbar-track { background: transparent; }
.rd-profile::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.25); border-radius: 3px; }
  .rd-profile-card {
    background: rgba(8,14,26,0.55); backdrop-filter: blur(10px);
    border: 1px solid rgba(80,160,255,0.18); border-radius: 16px; padding: 20px;
    flex-shrink: 0;
  }
  .rd-profile-card-header { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; }
  .rd-profile-dot { width: 8px; height: 8px; border-radius: 50%; background: #FF5A1F; box-shadow: 0 0 8px rgba(255,90,31,.5); flex-shrink: 0; }
  .rd-profile-card-title { font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 700; letter-spacing: .18em; color: #8FCBFF; text-transform: uppercase; }
  .rd-profile-brand-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .rd-profile-logo-box {
    width: 92px; height: 52px; border-radius: 10px; background: #fff;
    display: flex; align-items: center; justify-content: center; padding: 8px 12px;
    box-shadow: 0 3px 12px rgba(0,0,0,0.3); flex-shrink: 0;
  }
  .rd-profile-logo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .rd-profile-brand-name { font-size: 17px; font-weight: 700; color: #F2F6FF; }
  .rd-profile-facts { display: flex; flex-wrap: wrap; gap: 18px; }
  .rd-profile-fact { display: flex; flex-direction: column; gap: 3px; }
  .rd-fact-lbl { font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .14em; color: rgba(150,195,255,.55); text-transform: uppercase; }
  .rd-fact-val { font-size: 15px; font-weight: 600; color: #EAF3FF; }

  .rd-section { padding-top: 2px; flex-shrink: 0; }
  .rd-section .rd-panel-title {
    position: relative; padding-bottom: 10px; margin-bottom: 14px;
    border-bottom: 1px solid rgba(80,160,255,0.16);
  }

  .rd-oem-list { display: flex; flex-wrap: wrap; gap: 14px; }
  .rd-icon-slot--oem { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.04); }
  .rd-icon-slot--oem img { width: 100%; height: 100%; object-fit: contain; }

  .rd-spec-block { display: flex; align-items: flex-start; gap: 13px; }
  .rd-spec-block .rd-icon-slot { width: 40px; height: 40px; }
  .rd-spec-block-text { margin: 0; padding-top: 6px; font-size: 13.5px; line-height: 1.6; color: rgba(230,240,255,0.9); }

  .rd-timeline { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; position: relative; padding-top: 5px; flex-wrap: wrap; }
  .rd-timeline::before { content: ''; position: absolute; top: 9px; left: 6%; right: 6%; height: 1px; background: rgba(80,160,255,0.2); }
  .rd-timeline-node { display: flex; flex-direction: column; align-items: center; gap: 7px; flex: 1; min-width: 72px; }
  .rd-timeline-dot { width: 9px; height: 9px; border-radius: 50%; background: #3399FF; box-shadow: 0 0 9px rgba(51,153,255,.7); position: relative; z-index: 1; }
  .rd-timeline-label { font-size: 10.5px; font-weight: 600; color: rgba(210,228,255,.85); text-align: center; line-height: 1.35; }

  .rd-advantages {
    position: relative;
    z-index: 3;
    flex-shrink: 0; margin-bottom: 14px;
    background: rgba(8,14,26,0.94); backdrop-filter: blur(10px);
    border: 1px solid rgba(80,160,255,0.22); border-radius: 16px;
    padding: 16px 18px 18px;
  }
  .rd-panel-title--boxed { margin-bottom: 14px; }
  .rd-adv-row { display: flex; align-items: flex-start; }
  .rd-adv-col {
    flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 9px;
    padding: 0 10px; position: relative;
  }
  .rd-adv-col:not(:last-child)::after {
    content: ''; position: absolute; right: 0; top: 4px; bottom: 4px; width: 1px;
    background: rgba(80,160,255,0.16);
  }
  .rd-icon-slot--adv { width: 46px; height: 46px; }
  .rd-adv-label { font-size: 10.5px; font-weight: 700; letter-spacing: .02em; line-height: 1.4; color: #EAF3FF; text-align: center; text-transform: uppercase; }

  .rd-nav { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
  .rd-nav-btn { min-height: 48px; font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: .1em; padding: 13px 16px; border-radius: 8px; flex-shrink: 0; border: 1px solid rgba(80,160,255,0.25); background: rgba(10,18,32,0.5); color: rgba(180,205,240,.75); transition: all .2s; touch-action: manipulation; }
  .rd-nav-btn:hover:not(:disabled) { background: rgba(0,119,255,0.14); border-color: #3399FF; color: #7FC0FF; }
  .rd-nav-btn:disabled { opacity: 0.28; }
  .rd-nav-cta { min-height: 48px; font-family: var(--font-mono, monospace); font-size: 12px; font-weight: 700; letter-spacing: .1em; padding: 14px 16px; border-radius: 8px; flex: 1; border: none; background: #0066E6; color: white; box-shadow: 0 4px 16px rgba(0,102,230,.35); transition: all .2s; touch-action: manipulation; }
  .rd-nav-cta:hover { background: #0044BB; box-shadow: 0 6px 20px rgba(0,102,230,.5); }

  .video-widget {
    position: absolute; right: 20px; bottom: 20px; z-index: 40;
  }

  .vw-fab {
    position: relative; display: flex; align-items: center; gap: 9px;
    background: rgba(8,14,26,0.9); backdrop-filter: blur(12px);
    border: 1px solid rgba(80,160,255,0.3); border-radius: 30px;
    padding: 8px 16px 8px 8px; cursor: pointer;
    box-shadow: 0 10px 28px rgba(0,0,0,0.5);
    transition: transform .2s, box-shadow .2s;
  }
  .vw-fab:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(0,0,0,0.55); }
  .vw-fab-ring {
    position: absolute; left: 8px; top: 50%; width: 30px; height: 30px;
    transform: translateY(-50%); border-radius: 50%;
    border: 1.5px solid rgba(51,153,255,0.55);
    animation: hs-pulse 2.4s ease-out infinite;
  }
  .vw-fab-play { width: 30px; height: 30px; flex-shrink: 0; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); }
  .vw-fab-label { font-family: var(--font-mono, monospace); font-size: 10.5px; font-weight: 700; letter-spacing: .08em; color: #F2F6FF; white-space: nowrap; }

  .video-widget-card {
    width: 300px;
    background: rgba(8,14,26,0.92);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(80,160,255,0.28);
    border-radius: 16px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.55);
    overflow: hidden;
  }
  .vw-card-header {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 10px 10px 12px;
    border-bottom: 1px solid rgba(80,160,255,0.14);
  }
  .vw-logo-box {
    flex-shrink: 0; height: 26px; min-width: 26px; border-radius: 7px;
    background: #fff; display: flex; align-items: center; justify-content: center;
    padding: 3px 7px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  .vw-logo { height: 16px; width: auto; max-width: 60px; object-fit: contain; display: block; }
  .vw-label { font-family: var(--font-mono, monospace); font-size: 10px; font-weight: 700; letter-spacing: .1em; color: #F2F6FF; white-space: nowrap; }
  .vw-stats { flex: 1; min-width: 0; font-size: 9px; color: rgba(160,200,255,.55); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vw-close-btn {
    flex-shrink: 0; width: 44px; height: 44px; border-radius: 6px;
    border: 1px solid rgba(80,160,255,0.22); background: rgba(255,255,255,0.04);
    color: rgba(200,220,255,.8); font-size: 11px; display: flex; align-items: center; justify-content: center;
  }
  .vw-close-btn:hover { background: #E02020; border-color: #E02020; color: white; }

  .video-widget-body { padding: 10px 12px 12px; }
  .vw-video-wrap { position: relative; width: 100%; padding-top: 56%; border-radius: 10px; overflow: hidden; background: #000; margin-bottom: 9px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .vw-iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
  .vw-video-corner { position: absolute; width: 12px; height: 12px; border: 1.5px solid rgba(255,255,255,0.75); z-index: 2; pointer-events: none; }
  .vw-video-corner-tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
  .vw-video-corner-br { bottom: 6px; right: 6px; border-left: none; border-top: none; }
  .vw-trust-marquee { overflow: hidden; width: 100%; mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent); margin-bottom: 7px; }
  .vw-trust-track { display: flex; gap: 5px; width: max-content; animation: vw-trust-scroll 16s linear infinite; }
  @keyframes vw-trust-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .vw-trust-chip { flex-shrink: 0; font-family: var(--font-mono, monospace); font-size: 8px; font-weight: 700; letter-spacing: .05em; color: #7FC0FF; background: rgba(0,100,230,0.14); border: 1px solid rgba(80,160,255,0.2); border-radius: 4px; padding: 3px 7px; white-space: nowrap; }
  .vw-caption { font-size: 9.5px; line-height: 1.5; color: rgba(170,205,255,.6); margin: 0; }

  .vw-expand-enter-active, .vw-expand-leave-active { transition: opacity .2s ease, max-height .25s ease; overflow: hidden; }
  .vw-expand-enter-from, .vw-expand-leave-to { opacity: 0; max-height: 0; }
  .vw-expand-enter-to, .vw-expand-leave-from { opacity: 1; max-height: 320px; }

  .statusbar { position: absolute; bottom: 0; left: 0; right: 0; height: 40px; background: rgba(5,9,18,0.85); backdrop-filter: blur(16px); border-top: 1.5px solid rgba(80,160,255,0.22); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 20; box-shadow: 0 -2px 24px rgba(0,0,0,0.4); }
  .status-left, .status-right { display: flex; align-items: center; gap: 7px; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 7px rgba(34,197,94,.55); animation: dot-pulse 2.2s ease-in-out infinite; }
  .status-text { font-size: 9px; font-weight: 600; letter-spacing: .12em; color: #7FC0FF; text-transform: uppercase; }
  .status-text.dim { font-weight: 400; color: rgba(160,200,255,.4); }
  .status-sep { color: rgba(80,160,255,.3); font-size: 10px; }
  .status-center { font-size: 9px; letter-spacing: .08em; color: rgba(160,200,255,.4); }

  .popup-enter-active { transition: all .38s cubic-bezier(0.16,1,0.3,1); }
  .popup-leave-active { transition: all .22s ease; }
  .popup-enter-from, .popup-leave-to { opacity: 0; }
  .popup-enter-from .popup-card--redesign,
  .popup-enter-from .video-widget { transform: scale(.93) translateY(22px); }
  .popup-leave-to   .popup-card--redesign,
  .popup-leave-to   .video-widget { transform: scale(.96) translateY(12px); }

  .hero-swap-enter-active { transition: opacity .25s ease, transform .28s cubic-bezier(0.16,1,0.3,1); }
  .hero-swap-leave-active { transition: opacity .18s ease, transform .18s ease; }
  .hero-swap-enter-from   { opacity: 0; transform: scale(1.04); }
  .hero-swap-leave-to     { opacity: 0; transform: scale(0.96); }

  .content-swap-enter-active { transition: opacity .3s ease, transform .32s cubic-bezier(0.16,1,0.3,1); }
  .content-swap-leave-active { transition: opacity .18s ease; }
  .content-swap-enter-from   { opacity: 0; transform: translateX(12px); }
  .content-swap-leave-to     { opacity: 0; }

  @media (max-width: 1500px) {
    .rd-profile { width: 340px; }
    .rd-specs { width: 260px; }
  }
  @media (max-width: 1380px) {
    .video-widget { display: none; }
  }
  @media (min-width: 1600px) {
    .left-sidebar { width: 300px; }
    .canvas-area { left: 300px; }
    .chassis-img { max-width: 1180px; }
  }
@media (max-width: 1200px) {
  .rd-main { flex-direction: column; align-items: stretch; padding-right: 0; }
  .rd-specs, .rd-profile {
    width: 100%;
    position: static;
    max-height: none;
    overflow-y: visible;
  }
  .rd-adv-row { flex-wrap: wrap; gap: 14px 0; }
  .rd-adv-col { flex: 1 1 30%; }
  .rd-adv-col::after { display: none; }
}
  @media (max-width: 860px) {
    .left-sidebar { display: none; }
    .canvas-area  { inset: 58px 0 40px 0 !important; }
    .hud-tl, .hud-bl { left: 16px; }
    .topbar-center { display: none; }
    .rd-layout { padding: 18px; }
    .rd-features { display: block; overflow: hidden; }
    .rd-features-row { justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; padding: 2px 4px 8px; scrollbar-width: thin; }
    .rd-feature { flex: 0 0 132px; width: 132px; gap: 6px; }
    .rd-feature .rd-icon-slot--lg { width: 42px; height: 42px; border-radius: 12px; }
    .rd-feature-label { font-size: 8px; line-height: 1.25; }
    .rd-feature-connector { display: none; }
    .rd-adv-col { flex: 1 1 45%; }
    .rd-nav { flex-wrap: wrap; }
  }
  @media (max-width: 600px) {
    .topbar { height: 54px; padding: 0 68px 0 12px; }
    .trad-logo-bar { height: 27px; }
    .topbar-text-group, .topbar-sub, .topbar-center { display: none; }
    .topbar-right { gap: 4px; }
    .tab, .btn-back { min-height: 40px; padding: 6px 9px; font-size: 8px; letter-spacing: .06em; }
    .zoom-controls { right: 10px; top: auto; bottom: 52px; transform: none; flex-direction: row; padding: 6px; gap: 5px; }
    .zoom-track, .zoom-divider, .zoom-pct { display: none; }
    .zoom-btn { width: 42px; height: 42px; }
    .canvas-area { inset: 54px 0 40px 0 !important; }
    .stage { transform: translateY(4%); }
    .chassis-img { width: 112vw; max-width: 760px; }
    .hs-tag { display: none; }
    .popup-overlay { inset: 54px 0 40px; padding: 6px; align-items: stretch; }
    .popup-card--redesign { width: 100%; height: 100%; max-height: none; border-radius: 12px; }
    .rd-layout { padding: 14px; }
    .rd-header { padding-right: 48px; }
    .rd-index { font-size: 30px; }
    .rd-title { font-size: 21px; }
    .rd-main { gap: 12px; }
    .rd-specs, .rd-profile { padding: 12px; }
    .rd-adv-col { flex: 1 1 100%; }
    .rd-nav { gap: 6px; }
    .rd-nav-btn, .rd-nav-cta { min-height: 44px; padding: 10px 9px; font-size: 9px; }
    .video-widget { right: 8px; bottom: 48px; }
    .vw-fab { min-height: 44px; padding-right: 10px; }
    .statusbar { height: 40px; padding: 0 10px; }
    .status-center, .status-left .dim, .status-right .dim { display: none; }
  }
  @media (orientation: portrait) {
    .topbar { height: 58px; padding: 0 66px 0 10px; }
    .topbar-left { gap: 7px; }
    .topbar-text-group, .topbar-sub, .topbar-center { display: none; }
    .trad-logo-bar { height: 28px; }
    .topbar-right { gap: 4px; }
    .tab { min-height: 40px; padding: 6px 9px; font-size: 8px; }

    .left-sidebar {
      display: flex;
      left: 0;
      top: 58px;
      right: 0;
      bottom: auto;
      width: 100%;
      height: 168px;
      flex-direction: column;
      border-right: 0;
      border-bottom: 1px solid rgba(80,160,255,0.22);
      box-shadow: 0 4px 22px rgba(0,0,0,0.35);
    }
    .left-sidebar.hidden { transform: translateY(-100%); }
    .sidebar-header {
      flex: 0 0 25px;
      gap: 6px;
      padding: 5px 12px 3px;
      border-bottom: 1px solid rgba(80,160,255,0.12);
    }
    .sidebar-dot { width: 5px; height: 5px; }
    .sidebar-title { font-size: 8px; letter-spacing: .14em; }
    .sidebar-list {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-template-rows: repeat(4, 30px);
      grid-auto-flow: row;
      width: 100%;
      flex: 1;
      overflow-x: hidden;
      overflow-y: hidden;
      padding: 4px 8px 5px;
      gap: 5px;
      scrollbar-width: thin;
    }
    .sidebar-list::-webkit-scrollbar { height: 3px; width: auto; }
    .sidebar-item {
      width: 100%;
      min-width: 0;
      min-height: 0;
      height: 30px;
      align-items: center;
      gap: 5px;
      padding: 4px 6px;
      border-left: 0;
      border-bottom: 2px solid transparent;
      border-radius: 4px;
      background: rgba(10,18,32,0.45);
    }
    .sidebar-item--active { border-left: 0; border-bottom-color: #3399FF; }
    .sidebar-num { width: auto; padding-top: 0; font-size: 9px; }
    .sidebar-name { max-width: 100%; white-space: normal; font-size: 7px; line-height: 1.05; }
    .sidebar-brands { display: none; }
    .canvas-area { inset: 226px 0 42px 0 !important; }
    .zoom-controls { right: 14px; top: auto; bottom: 54px; transform: none; flex-direction: row; padding: 6px; gap: 5px; }
    .zoom-track, .zoom-divider, .zoom-pct { display: none; }
    .zoom-btn { width: 42px; height: 42px; }
    .stage { transform: translateY(3%); }
    .chassis-img { width: 88vw; max-width: 900px; }
    .hud-tl, .hud-tr { top: 170px; }
    .hud-tl, .hud-bl { left: 8px; }
    .hud-tr, .hud-br { right: 8px; }
    .hud-bl, .hud-br { bottom: 50px; }
    .hotspot { width: 30px; height: 30px; }
    .hs-p1, .hs-p2 { width: 26px; height: 26px; }
    .hs-core { width: 18px; height: 18px; }
    .hs-num { font-size: 6px; }
    .part-choice-overlay {
      position: absolute;
      inset: 226px 0 42px;
      z-index: 45;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(3,6,14,0.42);
      backdrop-filter: blur(4px);
    }
    .part-choice-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      min-width: 170px;
      padding: 16px 22px 18px;
      border: 1px solid rgba(80,160,255,0.4);
      border-radius: 10px;
      background: rgba(5,12,26,0.94);
      box-shadow: 0 10px 34px rgba(0,0,0,0.55), 0 0 24px rgba(0,100,230,0.18);
    }
    .part-choice-title { color: #8FCBFF; font-size: 9px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .part-choice-sub { color: rgba(190,215,245,.6); font-size: 7px; letter-spacing: .12em; }
    .part-choice-buttons { display: flex; gap: 10px; margin-top: 4px; }
    .part-choice-btn { min-width: 52px; min-height: 42px; border: 1px solid rgba(80,160,255,.4); border-radius: 5px; background: #0066E6; color: #fff; font-size: 12px; font-weight: 800; }
    .part-choice-btn:hover { background: #1685ff; }
    .part-choice-close { position: absolute; top: 5px; right: 7px; border: 0; background: transparent; color: rgba(210,228,255,.7); font-size: 18px; line-height: 1; }
    .hs-tag { display: none; }
    .statusbar { height: 42px; padding: 0 14px; }
    .status-center, .status-left .dim, .status-right .dim { display: none; }

    .popup-overlay { inset: 58px 0 42px; padding: 6px; align-items: stretch; }
    .popup-card--redesign { width: 100%; height: 100%; max-height: none; border-radius: 12px; }
    .rd-layout { padding: 12px; overflow-y: auto; }
    .rd-header { margin-bottom: 8px; }
    .rd-index { font-size: 30px; }
    .rd-eyebrow { font-size: 8px; }
    .rd-title { font-size: 20px; }
    .rd-tabs { margin-bottom: 10px; padding: 6px; gap: 4px; }
    .rd-tab { min-height: 34px; padding: 6px 8px; font-size: 7px; }
    .rd-main { flex-direction: column; gap: 8px; padding-right: 0; overflow: visible; }
    .rd-main--highlights {
      display: block;
      flex: 0 0 auto;
      min-height: 0;
      margin-bottom: 10px;
      overflow: visible;
    }
    .rd-main--highlights .rd-stage {
      display: block;
      width: 100%;
      min-height: 0;
    }
    .rd-main--highlights .rd-features {
      width: 100%;
      margin: 0;
      padding: 0 2px 10px;
    }
    .rd-main--highlights .rd-features-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 8px;
      overflow: visible;
    }
    .rd-main--highlights .rd-feature {
      width: auto;
      min-width: 0;
      gap: 5px;
    }
    .rd-main--highlights .rd-feature-label {
      font-size: 7px;
      line-height: 1.25;
    }
    .rd-main--brand {
      display: block;
      flex: 0 0 auto;
      min-height: 0;
      margin-bottom: 10px;
      overflow: visible;
    }
    .rd-main--brand .rd-stage { display: none; }
    .rd-main--brand .rd-profile {
      position: static;
      display: flex;
      width: 100%;
      max-height: none;
      overflow: visible;
      padding: 0 2px;
      gap: 14px;
    }
    .rd-main--brand .rd-profile-card {
      padding: 14px;
      border-radius: 12px;
    }
    .rd-main--brand .rd-profile-card-header { margin-bottom: 12px; }
    .rd-main--brand .rd-profile-brand-row { margin-bottom: 12px; }
    .rd-main--brand .rd-profile-facts { gap: 12px; }
    .rd-main--brand .rd-section { padding: 0 2px; }
    .rd-main--brand .rd-section .rd-panel-title { margin-bottom: 9px; padding-bottom: 7px; }
    .rd-main--brand .rd-oem-list { gap: 8px; }
    .rd-main--brand .rd-icon-slot--oem { width: 44px; height: 44px; }
    .rd-main--brand .rd-spec-block-text { font-size: 11px; line-height: 1.4; }
    .rd-main--brand .rd-timeline { gap: 6px; }
    .rd-main--brand .rd-timeline-label { font-size: 8px; }
    .rd-stage { order: -1; width: 100%; }
    .rd-stage-visual { width: 100%; height: 230px; min-height: 230px; max-height: 230px; aspect-ratio: auto; }
    .rd-stage-model {
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
    }
    .rd-stage-img { max-width: 72%; max-height: 78%; }
    .rd-stage-visual > .rd-stage-model {
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
    }
    .rd-specs, .rd-profile { width: 100%; position: static; max-height: none; overflow: visible; padding: 12px; }
    .rd-features { margin-bottom: 0; }
    .rd-features-row { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; padding-bottom: 4px; }
    .rd-feature { flex: 0 0 112px; width: 112px; gap: 5px; }
    .rd-feature .rd-icon-slot--lg { width: 38px; height: 38px; border-radius: 10px; }
    .rd-feature-label { font-size: 7px; line-height: 1.2; }
    .rd-advantages {
      position: relative;
      clear: both;
      margin: 0 0 10px;
      padding: 12px;
      overflow: visible;
    }
    .rd-adv-row { flex-wrap: wrap; gap: 10px 0; }
    .rd-adv-col { flex: 1 1 45%; padding: 0 5px; }
    .rd-adv-label { font-size: 8px; }
    .rd-nav { gap: 5px; }
    .rd-nav-btn, .rd-nav-cta { min-height: 42px; padding: 9px 8px; font-size: 8px; }
    .rd-main--brand + .rd-nav {
      position: relative;
      z-index: 3;
      margin-top: 0;
      padding-top: 4px;
      background: #05070D;
    }
    .rd-stage:has(.rd-features) { display: block; }
    .rd-stage:has(.rd-features) .rd-stage-visual { display: none; }
    .rd-stage:has(.rd-features) { order: 0; }
  }
  @media (max-height: 800px) and (min-width: 861px) {
    .popup-overlay { align-items: stretch; padding-top: 0; padding-bottom: 0; }
    .popup-card--redesign { height: 100%; max-height: 100%; }
    .rd-layout { min-height: 0; overflow: hidden; }
    .rd-layout { padding-top: 14px; padding-bottom: 10px; }
    .rd-brand-select, .rd-header { margin-bottom: 8px; }
    .rd-main { flex: 1 1 auto; min-height: 0; margin-bottom: 8px; overflow: hidden; }
    .rd-specs, .rd-profile { height: 100%; overflow-y: auto; max-height: 100%; }
    .rd-specs { padding: 14px; }
    .rd-specs-list { gap: 10px; }
    .rd-stage { justify-content: flex-start; }
    .rd-stage-visual { width: 100%; height: 220px; min-height: 220px; max-height: 220px; aspect-ratio: auto; }
    .rd-advantages { padding: 10px 14px 12px; margin: 0 0 8px; }
    .rd-panel-title--boxed { margin-bottom: 8px; }
    .rd-icon-slot--adv { width: 36px; height: 36px; }
    .rd-adv-col { gap: 6px; padding: 0 6px; }
    .rd-adv-label { font-size: 9px; }
  }
  @media (max-height: 720px) and (min-width: 861px) {
    .rd-features { margin-bottom: 4px; }
    .rd-features-label { margin-bottom: 4px; }
    .rd-feature { width: 138px; }
    .rd-feature .rd-icon-slot--lg { width: 42px; height: 42px; border-radius: 12px; }
    .rd-feature-label { font-size: 8px; line-height: 1.25; }
    .rd-feature-connector { display: none; }
    .rd-stage-visual { height: 180px; min-height: 180px; max-height: 180px; }
    .rd-advantages { padding-top: 8px; padding-bottom: 8px; }
    .rd-adv-col { gap: 4px; }
  }
  @media (min-width: 861px) and (max-height: 800px) {
    .rd-layout { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto auto; overflow-y: auto; }
    .rd-main { display: grid; grid-template-columns: minmax(220px, 27%) minmax(0, 1fr) 31%; gap: 14px; padding-right: 0; align-items: stretch; overflow: visible; }
    .rd-specs { width: auto; max-height: 100%; overflow-y: auto; }
    .rd-stage { min-width: 0; min-height: 0; justify-content: flex-start; overflow: visible; }
    .rd-profile { position: static; width: auto; max-height: 100%; overflow-y: auto; }
    .rd-features { transform: translateY(-78px); }
    .rd-features-row { flex-wrap: nowrap; gap: 3px; }
    .rd-feature { width: auto; flex: 1 1 0; min-width: 0; }
    .rd-feature-label { font-size: 8px; }
    .rd-feature .rd-icon-slot--lg { width: 42px; height: 42px; border-radius: 12px; }
    .rd-feature-connector { display: none; }
    .rd-stage-visual { flex: 1 1 auto; width: 100%; height: auto; min-height: 150px; max-height: 100%; aspect-ratio: auto; }
    .rd-stage-model { transform: translateY(-42px) scale(2.2); }
    .rd-advantages { max-height: 116px; overflow-y: auto; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bg-scan, .hs-pulse, .speed-line, .bg-radial, .img-halo, .cursor-svg,
    .bg-logo-img, .bg-logo-ring-1, .bg-logo-ring-2, .bg-photo,
    .hero-glow, .hero-glow--orange, .img-float, .img-ring--1, .img-ring--2,
    .rd-pedestal-glow, .rd-stage-img, .rd-orbit-dot, .rd-stage-ring--1, .rd-stage-ring--2,
    .vw-trust-track { animation: none !important; }
  }
  </style>