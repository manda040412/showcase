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
      <div class="hud-corner hud-tr"><div class="hud-h"></div><div class="hud-v"></div><span class="hud-lbl">{{ uniqueParts.length }} {{ t('parts_count_suffix') }}</span></div>
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
            <span>{{ uniqueParts.length }} {{ t('suspension_parts_suffix') }}</span>
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
            v-for="hs in uniqueParts"
            :key="hs.index"
            class="sidebar-item"
            :class="{ 'sidebar-item--active': currentHs?.label === hs.label, 'sidebar-item--empty': !hs.brandVariants || !hs.brandVariants.length }"
            role="button"
            tabindex="0"
            @click="openPopup(hs.index)"
            @keydown.enter="openPopup(hs.index)"
            @keydown.space.prevent="openPopup(hs.index)"
          >
            <span class="sidebar-num">{{ displayNumber(hs.index) }}</span>
            <div class="sidebar-item-info">
              <span class="sidebar-name">{{ hs.label }}<small v-if="hs.brandOnly" class="sidebar-brand-label">BRAND</small></span>
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

            <div v-for="hs in visibleHotspots" :key="hs.index"
              class="hotspot" :class="{ active: activeHs === hs.index, 'hotspot--empty': !hs.brandVariants || !hs.brandVariants.length }"
              :style="hotspotStyle(hs.index)"
              @click.stop="handleHotspotClick(hs.index)">
              <div class="hs-pulse hs-p1"></div>
              <div class="hs-pulse hs-p2"></div>
              <div class="hs-core">
                <div class="hs-num">{{ hotspotNumber(hs.index) }}</div>
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
                {{ displayNumber(index) }}
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

              <div class="rd-header" :class="{ 'rd-header--brand': currentHs.brandOnly }">
                <span class="rd-index">{{ displayNumber(activeHs) }}</span>
                <img v-if="currentHs.brandOnly && currentVariant.brandLogo" :src="currentVariant.brandLogo" :alt="currentVariant.brand" class="catalog-brand-logo" />
                <div class="rd-header-text">
                  <span class="rd-eyebrow">{{ currentHs.brandOnly ? 'BRAND' : t('suspension_component') }}</span>
                  <h2 class="rd-title">{{ currentHs.label }}</h2>
                  
                </div>
              </div>

              <div v-if="availableTabs.length" class="rd-tabs" role="tablist" aria-label="Part information">
                <button v-if="specifications.length" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'specs' }" @click="popupTab = 'specs'">SPESIFIKASI</button>
                <button v-if="availableTabs.includes('brand')" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'brand' }" @click="popupTab = 'brand'">PROFIL MEREK</button>
                <button v-if="advantagesList.length" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'advantages' }" @click="popupTab = 'advantages'">KEUNGGULAN</button>
                <button v-if="productHighlights.length" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'highlights' }" @click="popupTab = 'highlights'">HIGHLIGHT</button>
                <button v-if="brandProducts.length" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'products' }" @click="popupTab = 'products'">{{ bl({ id: 'PRODUK MEREK', en: 'BRAND PRODUCTS' }) }}</button>
                <button v-if="!currentHs.brandOnly && (currentVariant.model || currentVariant.image)" class="rd-tab" :class="{ 'rd-tab--active': popupTab === 'model' }" @click="popupTab = 'model'">3D MODEL</button>
              </div>

              <div class="rd-main" :class="{
                'rd-main--model': popupTab === 'model',
                'rd-main--products': popupTab === 'products',
                'rd-main--highlights': popupTab === 'highlights',
                'rd-main--brand': popupTab === 'brand',
                'rd-main--advantages': popupTab === 'advantages'
              }">

                <p v-if="!availableTabs.length">{{ t('no_data_yet') }}</p>
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

                <div class="rd-specs" v-if="popupTab === 'advantages' && advantagesList.length">
                  <span class="rd-panel-title">{{ bl({ en: 'Advantages', id: 'Keunggulan' }) }}</span>
                  <div class="rd-specs-list">
                    <div v-for="(adv, ai) in advantagesList" :key="ai" class="rd-spec-item">
                      <img v-if="adv.icon" :src="iconSrc(adv.icon)" class="rd-icon-slot rd-icon-slot--filled" alt="" />
                      <span v-else class="rd-icon-slot"></span>
                      <span class="rd-spec-text">{{ bl(adv) }}</span>
                    </div>
                  </div>
                </div>

                <section v-if="popupTab === 'products'" class="rd-products">
                  <h3 class="rd-panel-title">{{ currentVariant.brand }} ? {{ bl({ id: 'Varian Produk', en: 'Product Range' }) }}</h3>
                  <p v-if="!brandProducts.length">{{ t('no_data_yet') }}</p>
                  <div class="rd-products-grid">
                    <component :is="product.index !== undefined ? 'button' : 'div'" v-for="(product, productIndex) in brandProducts" :key="product.label" class="rd-product" :class="{ 'rd-product--catalog': product.index === undefined }" @click="openBrandProduct(product)">
                      <span class="rd-product-number">{{ String(productIndex + 1).padStart(2, '0') }}</span>
                      <span>{{ product.label }}</span>
                      <span v-if="product.index !== undefined" aria-hidden="true">?</span>
                    </component>
                  </div>
                </section>

                <div v-if="popupTab === 'model' || popupTab === 'highlights'" class="rd-stage">

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

                  <div v-if="popupTab === 'model'" class="rd-stage-visual" :class="{ 'rd-stage-visual--brand': currentHs.brandOnly }">

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
                          <span class="rd-fact-lbl">{{ currentVariant.profile.hqLabel || t('hq') }}</span>
                          <span class="rd-fact-val">{{ currentVariant.profile.hq }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="rd-section" v-if="oemList.length">
                      <span class="rd-panel-title">{{ currentVariant.profile.oemLabel || bl({ en: 'OEM Partner', id: 'Mitra OEM' }) }} ///</span>
                      <div class="rd-oem-list">
                        <span v-for="(name, ni) in oemList" :key="ni" class="rd-icon-slot rd-icon-slot--oem" :title="name">
                          <img :src="oemSrc(name)" :alt="name" v-if="oemSrc(name)" />
                        </span>
                      </div>
                    </div>

                    <div class="rd-section" v-if="profilePoints.length">
                      <span class="rd-panel-title">{{ bl({ en: 'Profile', id: 'Profil' }) }} ///</span>
                      <ul class="rd-profile-points">
                        <li v-for="(point, pIndex) in profilePoints" :key="pIndex">{{ bl(point) }}</li>
                      </ul>
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

          <div v-if="currentVideoConfig" class="video-widget" :class="{ 'video-widget--open': videoExpanded }">

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
                <span class="vw-stats">{{ uniqueParts.length }} {{ t('stat_parts') }} · {{ trustBrands.length }} {{ t('stat_brands') }}</span>
                <button class="vw-close-btn" type="button" :aria-label="bl({ en: 'Close video', id: 'Tutup video' })" @click="videoExpanded = false">✕</button>
              </div>
              <div class="video-widget-body">
                <div class="vw-video-wrap">
                  <span class="vw-video-corner vw-video-corner-tl"></span>
                  <span class="vw-video-corner vw-video-corner-br"></span>
                  <iframe
                    class="vw-iframe"
                    :key="currentVideoKey"
                    :src="currentVideoUrl"
                    :title="(currentVariant?.brand || 'TRAD') + ' Company Profile'"
                    frameborder="0"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
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

              <div class="rd-nav">
                <button class="rd-nav-btn" @click="prevPart" :disabled="activePartPosition <= 0">{{ t('prev') }}</button>
                <button class="rd-nav-cta" @click="closePopup">{{ t('back_to_chassis') }}</button>
                <button class="rd-nav-btn" @click="nextPart" :disabled="activePartPosition >= uniqueParts.length - 1">{{ t('next') }}</button>
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
          <span class="status-text">{{ uniqueParts.length }}</span>
        </div>
      </div>

    </div>
  </template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { t, lang } from '../composables/useLang.js'
import PartModelViewer from './PartModelViewer.vue'
import { referenceBrandProfiles } from '../data/referenceBrandProfiles.js'
import { partListBrands, brandProductCatalog, additionalBrandDetails } from '../data/brandProducts.js'

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
    oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, Lexus, etc.',
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
    founded: '1941',
    country: { en: 'Japan', id: 'Jepang' },
    hq: 'Tokyo, Japan',
    oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, Lexus',
    specifications: [
      { icon: 'oem.png', en: "Japan's first oil seal manufacturer, established in 1941", id: 'Produsen oil seal pertama Jepang, didirikan pada 1941' },
      { icon: 'global.png', en: 'Global partnerships in 14 countries with 81 group companies', id: 'Kemitraan global di 14 negara dengan 81 perusahaan grup' },
      { icon: 'material.png', en: 'Oil seals, O-rings, packings, and synthetic rubber-based functional parts', id: 'Oil seal, O-ring, packing, dan komponen fungsional berbasis karet sintetis' },
      { icon: 'factory.png', en: 'Production volume of approximately 26 tons per day', id: 'Volume produksi sekitar 26 ton per hari' },
    ],
    productHighlights: [
      { icon: 'oem.png', en: 'Primary OEM supplier', id: 'Pemasok OEM utama' },
      { icon: 'precision.png', en: 'Precision engineered', id: 'Direkayasa dengan presisi' },
      { icon: 'material.png', en: 'Advanced material', id: 'Material canggih' },
      { icon: 'stars.png', en: 'Longer shelf-life', id: 'Masa simpan lebih panjang' },
    ],
    historyHighlight: [
      { en: '1941 Nippon Bearing Production Co., Ltd. founded', id: '1941 Nippon Bearing Production Co., Ltd. didirikan' },
      { en: '1960 Capital participation agreement with Freudenberg, Germany', id: '1960 Perjanjian partisipasi modal dengan Freudenberg, Jerman' },
      { en: '1973 First overseas production plant established in Singapore', id: '1973 Pabrik produksi luar negeri pertama didirikan di Singapura' },
      { en: '1985 Company name changed to NOK Corporation', id: '1985 Nama perusahaan berubah menjadi NOK Corporation' },
      { en: '1989 Freudenberg-NOK General Partnership established in the USA', id: '1989 Freudenberg-NOK General Partnership didirikan di Amerika Serikat' },
      { en: '1996 PT NOK Indonesia and NOK Asia Company established', id: '1996 PT NOK Indonesia dan NOK Asia Company didirikan' },
      { en: '2003 Okura Plan Ltd. established', id: '2003 Okura Plan Ltd. didirikan' },
      { en: 'Present Day', id: 'Saat Ini' },
    ],
    advantages: [
      { icon: 'oem.png', en: 'Primary OEM supplier for Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, and Lexus', id: 'Pemasok OEM utama untuk Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, dan Lexus' },
      { icon: 'precision.png', en: 'Precision-engineered sealing parts for consistent fit and performance', id: 'Komponen sealing yang direkayasa presisi untuk kecocokan dan performa konsisten' },
      { icon: 'material.png', en: 'Advanced synthetic rubber materials for durable sealing performance', id: 'Material karet sintetis canggih untuk performa sealing yang tahan lama' },
      { icon: 'global.png', en: 'Freudenberg Sealing Technologies partnership with CORTECO product brand', id: 'Kemitraan dengan Freudenberg Sealing Technologies melalui brand produk CORTECO' },
      { icon: 'factory.png', en: 'Global network across 14 countries and 81 group companies', id: 'Jaringan global di 14 negara dan 81 perusahaan grup' },
      { icon: 'stars.png', en: 'Approximately 26 tons of production capacity per day', id: 'Kapasitas produksi sekitar 26 ton per hari' },
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

Object.assign(BP.Showa, {
  founded: '1938',
  country: { en: 'Japan', id: 'Jepang' },
  hq: 'Gyoda, Saitama, Japan (now operating under Hitachi Astemo)',
  hqLabel: 'Headquarters',
  oem: 'Honda, Mitsubishi, Toyota, Nissan, Mazda, etc.',
  oemLabel: 'Applicable to',
  profile: [
    { en: 'Specializes in automotive shock absorbers and damper systems, with decades of engineering in hydraulic damping technology.', id: 'Spesialis shock absorber dan sistem damper otomotif dengan pengalaman puluhan tahun dalam teknologi peredaman hidrolik.' },
    { en: 'Recognized shock absorber brand, trusted by OEM manufacturers and aftermarket worldwide in Asia, Europe and America.', id: 'Brand shock absorber terpercaya oleh produsen OEM dan aftermarket di Asia, Eropa dan Amerika.' },
  ],
  historyHighlight: [
    { en: '1938 Establishment of Showa manufacture aircraft components', id: '1938 Showa didirikan sebagai produsen komponen pesawat' },
    { en: '1946 Production of automobile components', id: '1946 Produksi komponen otomotif' },
    { en: '1993 Renamed as SHOWA CORPORATION', id: '1993 Berganti nama menjadi SHOWA CORPORATION' },
    { en: '2000 Establishment of Showa Regional Center in Thailand', id: '2000 Pendirian Showa Regional Center di Thailand' },
    { en: '2021 Merger of Hitachi Automotive Systems, Showa, Keihin and Nissin Kogyo into Hitachi Astemo', id: '2021 Penggabungan Hitachi Automotive Systems, Showa, Keihin dan Nissin Kogyo menjadi Hitachi Astemo' },
  ],
  productHighlights: [
    { icon: 'oem.png', en: 'Primary OEM supplier to Honda', id: 'Pemasok OEM utama untuk Honda' },
    { icon: 'thailand.png', en: 'Made in Thailand', id: 'Dibuat di Thailand' },
    { icon: 'performance.png', en: 'Excellent vibration damping', id: 'Peredaman getaran sangat baik' },
    { icon: 'hydraulics.png', en: 'Consistent damping performance', id: 'Performa peredaman konsisten' },
    { icon: 'stars.png', en: 'Superior ride comfort', id: 'Kenyamanan berkendara superior' },
  ],
})
Object.assign(BP.KJ, {
  founded: null,
  country: { en: 'Indonesia', id: 'Indonesia' },
  hq: 'PT Timur Raya Anugerah Damai',
  hqLabel: 'Brand Owner',
  oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, etc.',
  oemLabel: 'Applicable to',
  specifications: [
    { icon: 'factory.png', en: 'Aftermarket shock absorber brand under PT Timur Raya Anugerah Damai (TRAD)', id: 'Brand shock absorber aftermarket di bawah PT Timur Raya Anugerah Damai (TRAD)' },
    { icon: 'car.png', en: 'Developed for the Indonesian and Southeast Asian replacement parts market', id: 'Dikembangkan untuk pasar suku cadang pengganti Indonesia dan Asia Tenggara' },
    { icon: 'gear.png', en: 'Factory supplies automotive shock absorber to OE and aftermarket brands worldwide', id: 'Pabrik memasok shock absorber otomotif untuk brand OE dan aftermarket di seluruh dunia' },
    { icon: 'factory.png', en: 'ISO 14001 quality management system certified', id: 'Tersertifikasi sistem manajemen mutu ISO 14001' },
  ],
  profile: [
    { en: 'Aftermarket shock absorber brand under PT Timur Raya Anugerah Damai (TRAD), developed for the Indonesian and Southeast Asian replacement parts market.', id: 'Brand shock absorber aftermarket di bawah PT Timur Raya Anugerah Damai (TRAD), dikembangkan untuk pasar suku cadang pengganti Indonesia dan Asia Tenggara.' },
    { en: 'Factory supplies automotive shock absorber to OE and aftermarket brands worldwide.', id: 'Pabrik memasok shock absorber otomotif untuk brand OE dan aftermarket di seluruh dunia.' },
    { en: 'ISO, IATF quality management system certified.', id: 'Tersertifikasi sistem manajemen mutu ISO, IATF.' },
  ],
  productHighlights: [
    { icon: 'price.png', en: 'Value for money', id: 'Harga sepadan' },
    { icon: 'reliable.png', en: 'Reliable damping performance', id: 'Performa peredaman andal' },
    { icon: 'comfort.png', en: 'Comfort ride', id: 'Kenyamanan berkendara' },
  ], 
})
BP.KJLEX = {
  founded: null,
  country: { en: 'Indonesia', id: 'Indonesia' },
  hq: 'PT Timur Raya Anugerah Damai',
  hqLabel: 'Brand Owner',
  oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, etc.',
  oemLabel: 'Applicable to',
  specifications: [
    { icon: 'parts.png', en: 'Wide range of product variants such as accelerator cable, clutch cable, engine stop cable, transmission cable, hand brake cable, etc.', id: 'Rangkaian varian produk luas seperti kabel akselerator, kabel kopling, kabel engine stop, kabel transmisi, kabel rem tangan, dan lainnya' },
    { icon: 'factory.png', en: 'Factory supplies automotive cable to OE market globally', id: 'Pabrik memasok kabel otomotif ke pasar OE secara global' },
  ],
  profile: [
    { en: 'Wide range of product variants such as accelerator cable, clutch cable, engine stop cable, transmission cable, hand brake cable, etc.', id: 'Rangkaian varian produk luas seperti kabel akselerator, kabel kopling, kabel engine stop, kabel transmisi, kabel rem tangan, dan lainnya.' },
    { en: 'Factory supplies automotive cable to the OE market globally.', id: 'Pabrik memasok kabel otomotif ke pasar OE secara global.' },
  ],
  productHighlights: [
    { icon: 'oem.png', en: 'OEM quality product', id: 'Produk berkualitas OEM' },
    { icon: 'precision.png', en: 'Precision engineered', id: 'Direkayasa dengan presisi' },
    { icon: 'global.png', en: 'Global brand in 18 countries', id: 'Brand global di 18 negara' },
  ],
  historyHighlight: [],
  advantages: [
    { icon: 'global.png', en: 'Wide fitment range for Japanese and Asian car models', id: 'Cakupan kesesuaian luas untuk model mobil Jepang dan Asia' },
    { icon: 'precision.png', en: 'OEM-compatible product quality for maximum performance and easy installation', id: 'Kualitas produk kompatibel OEM untuk performa maksimal dan pemasangan mudah' },
  ],
}
Object.assign(BP['555'], {
  founded: '1960',
  country: { en: 'Japan', id: 'Jepang' },
  hq: null,
  oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, Lexus, etc.',
  oemLabel: 'Applicable to',
  profile: [
    { en: 'Premium suspension and steering parts serving OEM and aftermarket worldwide in more than 120 countries including Japan, Southeast Asia, the Middle East, Europe, America, Africa and Oceania.', id: 'Komponen suspensi dan kemudi premium untuk OEM dan aftermarket di lebih dari 120 negara termasuk Jepang, Asia Tenggara, Timur Tengah, Eropa, Amerika, Afrika dan Oseania.' },
    { en: 'Wide range with more than 2,000 automobile products available.', id: 'Rangkaian luas dengan lebih dari 2.000 produk otomotif tersedia.' },
    { en: 'ISO 9001 certified.', id: 'Tersertifikasi ISO 9001.' },
  ],
  historyHighlight: [
    { en: '1960 Establishment of Gosyu Seiki as mechanical processing of Gosyu Forging Co., Ltd. (now Gosyu Corporation)', id: '1960 Gosyu Seiki didirikan sebagai pemrosesan mekanis Gosyu Forging Co., Ltd. (sekarang Gosyu Corporation)' },
    { en: '1962 Production and sales of Tie Rod end started with 555 brand', id: '1962 Produksi dan penjualan Tie Rod end dimulai dengan brand 555' },
    { en: '1963 Company name became Sankei Industry Co., Ltd.', id: '1963 Nama perusahaan berubah menjadi Sankei Industry Co., Ltd.' },
    { en: '1972 Received plant eligible certification from the Japanese Quality Assurance Organization (JQA)', id: '1972 Menerima sertifikasi pabrik dari Japanese Quality Assurance Organization (JQA)' },
    { en: '1973 Received recommended parts certification from the Japan Automotive Products Association (JAPA)', id: '1973 Menerima sertifikasi suku cadang rekomendasi dari Japan Automotive Products Association (JAPA)' },
    { en: '1999 Received ISO 9001 certification', id: '1999 Menerima sertifikasi ISO 9001' },
    { en: '2010 Established USA affiliate, North American Suspension Inc.', id: '2010 Mendirikan afiliasi Amerika Serikat, North American Suspension Inc.' },
  ],
  productHighlights: [
    { icon: 'oem.png', en: 'Primary OEM supplier', id: 'Pemasok OEM utama' },
    { icon: 'stars.png', en: 'Recommended by Japan Automotive Association', id: 'Direkomendasikan Japan Automotive Association' },
    { icon: 'global.png', en: 'Approved by over 120 countries worldwide', id: 'Disetujui di lebih dari 120 negara di seluruh dunia' },
  ],
})
Object.assign(BP.NSK, {
  founded: '1916',
  country: { en: 'Japan', id: 'Jepang' },
  hq: 'Tokyo, Japan',
  hqLabel: 'Headquarters',
  oem: 'Toyota, Honda, Nissan, Mazda, Mitsubishi, Isuzu, Hino, Lexus, etc.',
  oemLabel: 'Applicable to',
  profile: [
    { en: 'Pioneer and the largest bearing manufacturer in Japan since 1916.', id: 'Pelopor dan produsen bearing terbesar di Jepang sejak 1916.' },
    { en: 'Top 3 bearing manufacturer in the world with more than 100 years history.', id: 'Produsen bearing 3 besar dunia dengan sejarah lebih dari 100 tahun.' },
    { en: 'Supply to OE and aftermarket bearing worldwide with established plants and business locations in over 30 countries.', id: 'Memasok ke OE dan aftermarket bearing di seluruh dunia dengan pabrik dan lokasi bisnis yang telah mapan di lebih dari 30 negara.' },
    { en: 'Broad product range, including bearings for electric motors, hub unit bearings, electric power steering, etc.', id: 'Rangkaian produk luas, termasuk bearing untuk motor listrik, hub unit bearing, electric power steering, dan lainnya.' },
  ],
  historyHighlight: [
    { en: '1916 Production of bearings, establishment of Fujisawa plant', id: '1916 Produksi bearing, pendirian pabrik Fujisawa' },
    { en: '1962 Establishment of sales office in the US, Europe and Australia', id: '1962 Pendirian kantor penjualan di Amerika Serikat, Eropa dan Australia' },
    { en: '1970 Establishment of production plant in Brazil (first outside Japan)', id: '1970 Pendirian pabrik produksi di Brasil (pertama di luar Jepang)' },
    { en: '1994 Establishment of production plant in Indonesia (first in ASEAN)', id: '1994 Pendirian pabrik produksi di Indonesia (pertama di ASEAN)' },
    { en: '2016 100th anniversary of NSK', id: '2016 Hari jadi ke-100 NSK' },
    { en: '2022 Switched to 100% clean energy at sites in Europe and began implementing in Japan', id: '2022 Beralih ke energi bersih 100% di fasilitas Eropa dan mulai menerapkannya di Jepang' },
  ],
  productHighlights: [
    { icon: 'oem.png', en: 'Primary OEM supplier', id: 'Pemasok OEM utama' },
    { icon: 'precision.png', en: 'High precision', id: 'Presisi tinggi' },
    { icon: 'stars.png', en: 'Global standard bearing', id: 'Bearing berstandar global' },
    { icon: 'global.png', en: 'Available worldwide', id: 'Tersedia di seluruh dunia' },
  ],
})
Object.assign(BP.GMB, {
  founded: '1943',
  country: { en: 'Japan', id: 'Jepang' },
  hq: null,
  oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, etc.',
  oemLabel: 'Applicable to',
  profile: [
    { en: 'Over 80 years of experience with ISO 9001, ISO 14001 and IATF 16949 accreditations.', id: 'Lebih dari 80 tahun pengalaman dengan akreditasi ISO 9001, ISO 14001 dan IATF 16949.' },
    { en: 'Product quality is proven worldwide with global partnerships in Japan, Asia, Europe and North America for both OEM and aftermarket.', id: 'Kualitas produk terbukti di seluruh dunia dengan kemitraan global di Jepang, Asia, Eropa dan Amerika Utara untuk OEM dan aftermarket.' },
    { en: 'Production plants and global network in Japan, China, Korea, Thailand, Russia, India, USA, Romania and Australia.', id: 'Pabrik produksi dan jaringan global berada di Jepang, Tiongkok, Korea, Thailand, Rusia, India, Amerika Serikat, Rumania dan Australia.' },
  ],
  historyHighlight: [
    { en: '1943 Founded Matsuoka Seikousyo in Osaka', id: '1943 Matsuoka Seikousyo didirikan di Osaka' },
    { en: '1976 Establishment of GMB Universal Joints Inc. subsidiary in the USA', id: '1976 Pendirian anak perusahaan GMB Universal Joints Inc. di Amerika Serikat' },
    { en: '1989 GMB Corporation is founded', id: '1989 GMB Corporation didirikan' },
    { en: '2002 Head office moved to Nara', id: '2002 Kantor pusat pindah ke Nara' },
    { en: '2009 Establishment of Thai GOWA GMB', id: '2009 Pendirian Thai GOWA GMB' },
    { en: '2013 Establishment of GMB Automotive Company in China', id: '2013 Pendirian GMB Automotive Company di Tiongkok' },
    { en: '2025 Establishment of Osaka branch', id: '2025 Pendirian cabang Osaka' },
  ],
  specifications: [
    { icon: 'factory.png', en: 'Over 80 years of experience with ISO 9001, ISO 14001, and IATF 16949 accreditations', id: 'Lebih dari 80 tahun pengalaman dengan akreditasi ISO 9001, ISO 14001, dan IATF 16949' },
    { icon: 'global.png', en: 'Product quality is proven worldwide with global partnerships in Japan, Asia, Europe and North America for both OEM and aftermarket', id: 'Kualitas produk terbukti di seluruh dunia dengan kemitraan global di Jepang, Asia, Eropa dan Amerika Utara untuk OEM dan aftermarket' },
    { icon: 'factory.png', en: 'Production plants and global network in Japan, China, Korea, Thailand, Russia, India, USA, Romania and Australia', id: 'Pabrik produksi dan jaringan global di Jepang, Tiongkok, Korea, Thailand, Rusia, India, Amerika Serikat, Rumania dan Australia' },
  ],
  productHighlights: [
    { icon: 'oem.png', en: 'Primary OEM supplier', id: 'Pemasok OEM utama' },
    { icon: 'stars.png', en: 'Global standard certified for product safety', id: 'Bersertifikasi standar global untuk keamanan produk' },
    { icon: 'global.png', en: 'Approved by 1,000+ customers worldwide', id: 'Disetujui lebih dari 1.000 pelanggan di seluruh dunia' },
  ],
})
Object.assign(BP.Seiken, {
  founded: '1959',
  country: { en: 'Japan', id: 'Jepang' },
  hq: null,
  oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, etc.',
  oemLabel: 'Applicable to',
  profile: [
    { en: 'Manufacture and sales of automotive brake parts, including hydraulic brake parts, brake fluid, antifreeze, etc.', id: 'Manufaktur dan penjualan komponen rem otomotif, termasuk komponen rem hidrolik, minyak rem, antifreeze dan lainnya.' },
    { en: 'Product quality is proven worldwide with global partnerships for Japanese, Asian, European and American car and motorcycle brands, both OE and aftermarket.', id: 'Kualitas produk terbukti di seluruh dunia dengan kemitraan global untuk brand mobil dan motor Jepang, Asia, Eropa dan Amerika, baik OE maupun aftermarket.' },
    { en: 'Broad product range with more than 30,000 parts available.', id: 'Rangkaian produk luas dengan lebih dari 30.000 komponen tersedia.' },
  ],
  historyHighlight: [
    { en: '1933 Founding of Meiji Shokai', id: '1933 Meiji Shokai didirikan' },
    { en: '1938 Establishment of Brake Machinery Research Institute', id: '1938 Pendirian Brake Machinery Research Institute' },
    { en: '1959 Establishment of Seiken Chemical Industry Co., Ltd., HQ and factory located in Konan, Minato-ku', id: '1959 Pendirian Seiken Chemical Industry Co., Ltd., kantor pusat dan pabrik di Konan, Minato-ku' },
    { en: '1988 Establishment of new factory in Shizuoka', id: '1988 Pendirian pabrik baru di Shizuoka' },
    { en: '2005 Received ISO 9001 Certification', id: '2005 Menerima sertifikasi ISO 9001' },
    { en: '2014 HQ relocated to current address in Tokyo', id: '2014 Kantor pusat pindah ke alamat saat ini di Tokyo' },
    { en: '2024 Establishment of Seiken Center as the core production base', id: '2024 Pendirian Seiken Center sebagai basis produksi utama' },
  ],
  specifications: [
    { icon: 'factory.png', en: 'Manufacture and sales of automotive brake parts, including hydraulic brake parts, brake fluid, antifreeze, etc.', id: 'Manufaktur dan penjualan komponen rem otomotif, termasuk komponen rem hidrolik, minyak rem, antifreeze, dan lainnya' },
    { icon: 'global.png', en: 'Product quality is proven worldwide with global partnerships for Japanese, Asian, European and American car and motorcycle brands', id: 'Kualitas produk terbukti di seluruh dunia dengan kemitraan global untuk brand mobil dan motor Jepang, Asia, Eropa dan Amerika' },
    { icon: 'parts.png', en: 'Broad product range with more than 30,000 parts available', id: 'Rangkaian produk luas dengan lebih dari 30.000 komponen tersedia' },
  ],
  productHighlights: [
    { icon: 'oem.png', en: 'Primary OEM supplier', id: 'Pemasok OEM utama' },
    { icon: 'performance.png', en: 'High performance', id: 'Performa tinggi' },
    { icon: 'stars.png', en: 'Global standard certified for product safety', id: 'Bersertifikasi standar global untuk keamanan produk' },
    { icon: 'global.png', en: 'Approved by customers in more than 150 countries', id: 'Disetujui pelanggan di lebih dari 150 negara' },
  ],
})
Object.assign(BP['Compact Brakes'], {
  founded: '1994',
  country: { en: 'Japan', id: 'Jepang' },
  hq: null,
  oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, etc.',
  oemLabel: 'Applicable to',
  profile: [
    { en: 'Certified with ISO 9001, ISO 14001, IATF 16949, TUV Rheinland.', id: 'Tersertifikasi ISO 9001, ISO 14001, IATF 16949, TUV Rheinland.' },
    { en: 'Product quality is proven worldwide with global partnerships for both OEM and aftermarket in Asia, Europe, America and beyond.', id: 'Kualitas produk terbukti di seluruh dunia dengan kemitraan global untuk OEM dan aftermarket di Asia, Eropa, Amerika dan wilayah lainnya.' },
  ],
  specifications: [
    { icon: 'oem.png', en: 'Certified with ISO 9001, IATF 16949, TUV Rheinland', id: 'Tersertifikasi ISO 9001, IATF 16949, TUV Rheinland' },
    { icon: 'global.png', en: 'Product quality is proven worldwide with global partnerships for both OE and aftermarket in Asia, Europe, America and beyond', id: 'Kualitas produk terbukti di seluruh dunia dengan kemitraan global untuk OE dan aftermarket di Asia, Eropa, Amerika dan wilayah lainnya' },
    { icon: 'global.png', en: 'Collaboration with brake experts around the world including Japan, England, USA, to deliver world-class standard products', id: 'Kolaborasi dengan ahli rem di seluruh dunia termasuk Jepang, Inggris dan Amerika Serikat untuk menghasilkan produk berstandar dunia' },
    { icon: 'parts.png', en: 'Wide product fitment range for Japanese, Asian, American vehicle models', id: 'Cakupan kesesuaian produk luas untuk model kendaraan Jepang, Asia dan Amerika' },
  ],
  productHighlights: [
    { icon: 'organic.png', en: 'Organic formulation', id: 'Formulasi organik' },
    { icon: 'dust.png', en: 'Low dust', id: 'Debu rendah' },
    { icon: 'noise.png', en: 'Low noise', id: 'Suara rendah' },
    { icon: 'drive.png', en: 'Comfort drive performance', id: 'Performa berkendara nyaman' },
  ],
})
Object.assign(BP.NOK, {
  hq: null,
  oemLabel: 'Applicable to',
  profile: [
    { en: "Japan's first oil seal manufacturer in 1941 with a wide range of functional parts such as oil seals, O-rings, packings and other synthetic rubber-based products.", id: 'Produsen oil seal pertama Jepang pada 1941 dengan rangkaian komponen fungsional seperti oil seal, O-ring, packing dan produk berbasis karet sintetis lainnya.' },
    { en: 'Business partnerships with Freudenberg Sealing Technologies with product brand CORTECO.', id: 'Kemitraan bisnis dengan Freudenberg Sealing Technologies melalui brand produk CORTECO.' },
    { en: 'Global partnerships worldwide in 14 countries with 81 group companies.', id: 'Kemitraan global di 14 negara dengan 81 perusahaan grup.' },
    { en: 'Production volume approximately 26 tons per day.', id: 'Volume produksi sekitar 26 ton per hari.' },
  ],
  historyHighlight: [
    { en: '1941 Nippon Bearing Production Co., Ltd. is founded', id: '1941 Nippon Bearing Production Co., Ltd. didirikan' },
    { en: '1960 A capital participation agreement is concluded with Freudenberg, Germany', id: '1960 Perjanjian partisipasi modal dengan Freudenberg, Jerman disepakati' },
    { en: '1973 Establishment of production plant in Singapore as the first overseas production plant', id: '1973 Pendirian pabrik produksi di Singapura sebagai pabrik luar negeri pertama' },
    { en: '1985 Company name becomes NOK Corporation', id: '1985 Nama perusahaan menjadi NOK Corporation' },
    { en: '1989 Freudenberg-NOK General Partnership is established in the USA as a joint venture with Freudenberg', id: '1989 Freudenberg-NOK General Partnership didirikan di Amerika Serikat sebagai joint venture dengan Freudenberg' },
    { en: '1996 PT NOK Indonesia is founded in Indonesia, NOK Asia Company Pte. Ltd. is founded in Singapore', id: '1996 PT NOK Indonesia didirikan di Indonesia, NOK Asia Company Pte. Ltd. didirikan di Singapura' },
    { en: '2003 Okura Plan Ltd. is established', id: '2003 Okura Plan Ltd. didirikan' },
    { en: '2007 Syzygy Co., Ltd. is founded', id: '2007 Syzygy Co., Ltd. didirikan' },
  ],
})

// The reference material only provides Advantages for these three brands.
// Keep every other brand free of inferred or added claims.
Object.values(BP).forEach((brand) => {
  brand.advantages = []
})

BP.KJ.advantages = [
  { icon: 'global.png', en: 'Wide fitment range covering popular Japanese and Asian vehicle models', id: 'Cakupan kesesuaian luas untuk model kendaraan Jepang dan Asia yang populer' },
  { icon: 'precision.png', en: 'Easy installation with OEM compatible mounting dimensions', id: 'Pemasangan mudah dengan dimensi mounting yang kompatibel dengan OEM' },
  { icon: 'comfort.png', en: 'Good service life for everyday passenger vehicle applications', id: 'Masa pakai yang baik untuk penggunaan kendaraan penumpang sehari-hari' },
]

BP['Compact Brakes'].advantages = [
  { icon: 'organic.png', en: 'Available for standard and premium grade brake pads with organic ceramics material', id: 'Tersedia untuk kampas rem grade standar dan premium dengan material keramik organik' },
  { icon: 'dust.png', en: 'Uses copper-free and non-asbestos formulation, and is tested using brake dynamometers', id: 'Menggunakan formulasi bebas tembaga dan non-asbes, serta diuji menggunakan brake dynamometer' },
  { icon: 'global.png', en: 'Wide product fitment range for Japanese, Asian, and American vehicle models', id: 'Cakupan kesesuaian produk luas untuk model kendaraan Jepang, Asia, dan Amerika' },
]

// KJLEX Advantages are taken verbatim from the supplied reference.
BP.KJLEX.advantages = [
  { icon: 'global.png', en: 'Wide fitment range for Japanese and Asian car models', id: 'Cakupan kesesuaian luas untuk model mobil Jepang dan Asia' },
  { icon: 'precision.png', en: 'OEM-compatible product quality for maximum performance and easy installation', id: 'Kualitas produk kompatibel OEM untuk performa maksimal dan pemasangan mudah' },
]

// Apply the supplied reference sheets before linking products.
Object.assign(BP, referenceBrandProfiles)

const originalTrustBrands = ['SHOWA', 'KJ', '555', 'RBI', 'NOK', 'SEIKEN', 'COMPACT BRAKES', 'NSK', 'GMB', 'KJTRIC']
const trustBrands = [...new Set([...originalTrustBrands, ...Object.keys(brandProductCatalog).map(brand => brand.toUpperCase())])]
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
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/bushing.png', model: '/models/bushing.glb',
        desc: {
          en: '555 offers a precision-made rubber-to-metal bonded bushing engineered to restore suspension geometry and ride comfort on worn vehicles.',
          id: '555 menawarkan bushing karet-logam bonded yang dibuat presisi untuk mengembalikan geometri suspensi dan kenyamanan berkendara pada kendaraan yang aus.',
        }, profile: BP['555'] },
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
      { brand: 'Seiken', brandLogo: '/images/brands/seiken.png', image: '/images/parts/disc_rotor.png',
        model: '/models/disk_rotor.glb', baseRotationX: Math.PI / 2,
        desc: {
          en: 'The Seiken disc rotor provides stable braking performance with precise dimensions and reliable heat management for everyday driving.',
          id: 'Disc rotor Seiken memberikan performa pengereman stabil dengan dimensi presisi dan pengelolaan panas yang andal untuk penggunaan sehari-hari.',
        }, profile: BP.Seiken },
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
    ],
  },

  {
    x: 33, y: 82, label: 'Rack Steering Assy', labelDir: 'right', icon: '🎯',
    brandVariants: [
      { brand: 'KJ Steering', brandLogo: '/images/brands/kjsteering.png', image: '/images/parts/rack_steering.png', model: '/models/rack_steering_assy.glb', cameraZoom: 0.68,
        desc: {
          en: 'KJ Steering rack assemblies provide a reliable replacement solution with fitment-focused engineering for popular Japanese vehicle applications.',
          id: 'Rack steering assy KJ Steering memberikan solusi pengganti yang andal dengan rekayasa yang berfokus pada kecocokan untuk kendaraan Jepang populer.',
        }, profile: BP['KJ Steering'] },
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
      { brand: '555', brandLogo: '/images/brands/555.png', image: '/images/parts/bushing_rear.png', model: '/models/bushing.glb',
        desc: {
          en: '555 offers a reliable rear bushing engineered to maintain precise wheel geometry and ride comfort on multi-link suspensions.',
          id: '555 menawarkan bushing belakang yang andal untuk menjaga geometri roda dan kenyamanan berkendara pada suspensi multi-link.',
        }, profile: BP['555'] },
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
      { brand: 'Seiken', brandLogo: '/images/brands/seiken.png', image: '/images/parts/disc_rotor.png',
        model: '/models/disk_rotor.glb', baseRotationX: Math.PI / 2,
        desc: {
          en: 'The rear-right Seiken disc rotor supports stable braking with precise dimensions and dependable heat management.',
          id: 'Disc rotor Seiken belakang-kanan mendukung pengereman stabil dengan dimensi presisi dan pengelolaan panas yang andal.',
        }, profile: BP.Seiken },
    ],
  },

  {
    x: 23, y: 47, label: 'Water Pump', labelDir: 'left', icon: '💧',
    brandVariants: [
      { brand: 'GMB', brandLogo: '/images/brands/gmb.png', image: '/images/parts/wheel_bearing_gmb.png', model: '/models/water-pump.glb',
        desc: {
          en: 'The GMB water pump circulates coolant through the engine to control operating temperature and protect the cooling system under demanding driving conditions.',
          id: 'Water pump GMB mengalirkan coolant ke seluruh mesin untuk mengontrol temperatur kerja dan melindungi sistem pendingin dalam kondisi berkendara yang berat.',
        }, profile: BP.GMB },
    ],
  },

  {
    x: 26, y: 60, label: 'Ignition Coil', labelDir: 'left', icon: '⚡',
    brandVariants: [
      { brand: 'KJTRIC', brandLogo: '/images/brands/kjtric.png', model: '/models/ignition-coil.glb',
        desc: {
          en: 'The KJTRIC ignition coil delivers a strong, consistent spark for reliable engine starting, smooth combustion, and stable performance.',
          id: 'Ignition coil KJTRIC menghasilkan percikan api yang kuat dan konsisten untuk menghidupkan mesin dengan andal, pembakaran halus, dan performa stabil.',
        }, profile: BP.KJTRIC },
    ],
  },

  {
    x: 29, y: 30, label: 'Oil Seals', labelDir: 'right', icon: '⭕',
    brandVariants: [
      { brand: 'NOK', brandLogo: '/images/brands/nok.png', image: '/images/parts/rack_steering.png', model: '/models/oil-seals.glb',
        desc: {
          en: 'NOK oil seals retain lubricants and keep contaminants out of rotating engine and drivetrain components, supporting long service life and reliable operation.',
          id: 'Oil seal NOK menahan pelumas dan mencegah kontaminan masuk ke komponen mesin serta drivetrain yang berputar, mendukung masa pakai panjang dan operasi yang andal.',
        }, profile: BP.NOK },
    ],
  },
]

// Only brands without a showcase product need a separate Part List entry.
for (const brand of partListBrands) {
  if (hotspots.some(part => part.brandVariants.some(variant => variant.brand === brand))) continue
  const details = additionalBrandDetails[brand]
  const products = brandProductCatalog[brand] || []
  const profile = referenceBrandProfiles[brand] || (details?.description ? {
    profile: [details.description],
    specifications: [],
    productHighlights: [],
    advantages: details.advantages || [],
  } : undefined)
  hotspots.push({ label: brand, brandOnly: true, brandVariants: [{
    brand, brandLogo: details?.brandLogo, profile,
  }], icon: '' })
}
// Keep physical hotspots intact; the catalog lists each product type once.
const uniqueParts = computed(() => {
  const seen = new Set()
  return hotspots.flatMap((part, index) => {
    const key = part.label.trim().toLowerCase()
    if (seen.has(key)) return []
    seen.add(key)
    return [{ ...part, index }]
  })
})
const activePartPosition = computed(() => uniqueParts.value.findIndex(part => part.label === currentHs.value?.label))
function displayNumber(index) {
  const position = uniqueParts.value.findIndex(part => part.index === index)
  return position < 0 ? '' : String(position + 1).padStart(2, '0')
}
const visibleHotspots = computed(() => uniqueParts.value.filter(part => !part.brandOnly && !isGroupedFollower(part.index)))
const productKey = label => ({ 'tie rods': 'tie rod', 'stabilizer link': 'link stabilizer' }[label.toLowerCase()] || label.toLowerCase())
const brandProducts = computed(() => {
  const brand = currentVariant.value?.brand
  const available = uniqueParts.value.filter(part => !part.brandOnly).flatMap(part => {
    const variantIndex = part.brandVariants.findIndex(variant => variant.brand === brand)
    return variantIndex < 0 ? [] : [{ index: part.index, variantIndex, label: part.label }]
  })
  const products = new Map()
  for (const label of brandProductCatalog[brand] || []) {
    const key = productKey(label)
    const match = available.find(part => productKey(part.label) === key)
    products.set(key, { ...match, label })
  }
  for (const part of available) if (!products.has(productKey(part.label))) products.set(productKey(part.label), part)
  return [...products.values()]
})
function openBrandProduct(product) {
  if (product.index === undefined) return
  activeHs.value = product.index
  activeBrand.value = product.variantIndex
  videoExpanded.value = false
  popupTab.value = 'model'
}

// Computed helpers
const currentHs = computed(() => activeHs.value !== null ? hotspots[activeHs.value] : null)
const currentVariant = computed(() => currentHs.value ? currentHs.value.brandVariants[activeBrand.value] : null)

function tabsFor(part, variant) {
  if (!part || !variant) return []
  const profile = variant.profile
  const tabs = []
  if (profile?.specifications?.length) tabs.push('specs')
  if (profile && (profile.founded || profile.country || profile.hq || profile.oem ||
      profile.profile?.length || profile.specialization || profile.historyHighlight?.length)) tabs.push('brand')
  if (profile?.advantages?.length) tabs.push('advantages')
  if (profile?.productHighlights?.length) tabs.push('highlights')
  if (brandProductCatalog[variant.brand]?.length ||
      uniqueParts.value.some(p => !p.brandOnly && p.brandVariants.some(v => v.brand === variant.brand))) tabs.push('products')
  if (!part.brandOnly && (variant.model || variant.image)) tabs.push('model')
  return tabs
}
const availableTabs = computed(() => tabsFor(currentHs.value, currentVariant.value))

const specifications = computed(() => currentVariant.value?.profile?.specifications || [])

const productHighlights = computed(() => currentVariant.value?.profile?.productHighlights || [])

const advantagesList = computed(() => currentVariant.value?.profile?.advantages || [])

const profilePoints = computed(() => {
  const profile = currentVariant.value?.profile
  if (!profile) return []
  if (Array.isArray(profile.profile)) return profile.profile
  return profile.specialization ? [profile.specialization] : []
})

const oemList = computed(() => {
  const oem = currentVariant.value?.profile?.oem
  if (!oem) return []
  return oem.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8)
})

// TRAD and KJ brands share the same company profile.
const BRAND_VIDEOS = {
  'TRAD': { id: '_-wA138wzyw' },
  'KJ': { id: '_-wA138wzyw' },
  'KJLEX': { id: '_-wA138wzyw' },
  'KJTRIC': { id: '_-wA138wzyw' },
  'KJ Hydraulics': { id: '_-wA138wzyw' },
  'KJ Shock Absorber': { id: '_-wA138wzyw' },
  'KJ Steering': { id: '_-wA138wzyw' },
  '3K Battery': { id: 'ynEjB_RaZbI' },
  'Compact Brakes': { id: 'XuhpXVFg5d0' },
  'Mitsuboshi': { id: 'yi8vAKEzbQg' },
  'NOK': { id: 'pQOYeRFM-WI' },
  'NSK': { id: 'HcZHvag0fb8' },
  'NWB': { id: 'lUWcNXnvRX4' },
  'RBI': { id: 'X9PXImrG6BA' },
  'Seiken': { id: '0qZLHMDfVpY' },
  'NKN': { id: 'IzbF3JnbSHs' },
  'Showa': { id: 'D_3ZpJAX33A' },
  'GMB': { id: 'rFBkQmhtRjM' },
  '555': { id: 'B_tWUD5UQxc' },
  // New-Era: awaiting company-profile YouTube link.
}
const currentVideoConfig = computed(() => BRAND_VIDEOS[currentVariant.value?.brand] || null)
const currentVideoUrl = computed(() => {
  const video = currentVideoConfig.value
  return video
    ? `https://www.youtube.com/embed/${video.id}?autoplay=1&origin=${encodeURIComponent(window.location.origin)}`
    : ''
})
const currentVideoKey = computed(() => currentVideoConfig.value?.id)

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
  return group ? group.map(item => displayNumber(item)).filter(Boolean).join('/') : displayNumber(index)
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
  videoExpanded.value = false
  activeBrand.value = 0
  if (hs.brandOnly) { activeHs.value = i; popupTab.value = tabsFor(hs, hs.brandVariants[0])[0] || ''; return }
  popupTab.value = tabsFor(hs, hs.brandVariants[0])[0] || ''
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
  const part = uniqueParts.value[activePartPosition.value - 1]
  if (part) openPopup(part.index)
}
function nextPart() {
  const part = uniqueParts.value[activePartPosition.value + 1]
  if (part) openPopup(part.index)
}
function resetView()   { scale.value = portraitBaseScale; panX.value = 0; panY.value = 0 }
function switchBrand(i) {
  activeBrand.value = i
  if (!availableTabs.value.includes(popupTab.value)) popupTab.value = availableTabs.value[0] || ''
}

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
    portraitBaseScale = 0.9
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
    position: fixed; width: calc(var(--ui-unit) * 8); height: calc(var(--ui-unit) * 8);
    background: #0066E6; border-radius: 50%;
    transform: translate(-50%,-50%);
    pointer-events: none; z-index: 9999;
    box-shadow: 0 0 calc(var(--ui-unit) * 12) rgba(0,102,230,0.7);
    transition: width .15s, height .15s, background .15s;
  }
  .cursor-ring {
    position: fixed; width: calc(var(--ui-unit) * 38); height: calc(var(--ui-unit) * 38);
    transform: translate(-50%,-50%);
    pointer-events: none; z-index: 9998;
    transition: width .3s ease, height .3s ease;
  }
  .cursor-ring.grabbing { width: calc(var(--ui-unit) * 56); height: calc(var(--ui-unit) * 56); }
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
      linear-gradient(rgba(80,160,255,0.07) calc(var(--ui-unit) * 1), transparent calc(var(--ui-unit) * 1)),
      linear-gradient(90deg, rgba(80,160,255,0.07) calc(var(--ui-unit) * 1), transparent calc(var(--ui-unit) * 1));
    background-size: calc(var(--ui-unit) * 52) calc(var(--ui-unit) * 52);
    mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 20%, transparent 80%);
  }
  .bg-radial {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: radial-gradient(ellipse 65% 65% at 55% 52%, rgba(0,120,255,0.1) 0%, transparent 65%);
    animation: radial-breathe 6s ease-in-out infinite;
  }
  @keyframes radial-breathe { 0%,100% { opacity: 0.7; transform: scale(0.97); } 50% { opacity: 1; transform: scale(1.03); } }
  .bg-scan {
    position: absolute; left: 0; right: 0; height: calc(var(--ui-unit) * 1); z-index: 2;
    background: linear-gradient(90deg, transparent, rgba(60,150,255,0.5), transparent);
    animation: scan-sweep 10s ease-in-out infinite; pointer-events: none;
  }
  @keyframes scan-sweep { 0% { top: 10%; opacity: 0; } 6% { opacity: 0.7; } 44% { opacity: 0.35; } 50% { top: 90%; opacity: 0; } 100% { top: 90%; opacity: 0; } }

  .hero-glow {
    position: absolute; left: 50%; top: 46%;
    width: calc(var(--ui-unit) * 900); height: calc(var(--ui-unit) * 560); transform: translate(-50%, -50%);
    background: radial-gradient(ellipse at center, rgba(0,120,255,0.14) 0%, rgba(0,150,255,0.06) 45%, transparent 70%);
    pointer-events: none; z-index: 1;
    animation: glow-pulse 4.5s ease-in-out infinite;
  }
  .hero-glow--orange {
    width: calc(var(--ui-unit) * 560); height: calc(var(--ui-unit) * 360);
    left: 50%; top: auto; bottom: calc(var(--ui-unit) * -100); transform: translateX(-50%);
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
    width: 46vw; max-width: calc(var(--ui-unit) * 680); min-width: calc(var(--ui-unit) * 300);
    border: calc(var(--ui-unit) * 1) dashed rgba(80,160,255,0.16);
    animation: bg-ring-spin 42s linear infinite;
  }
  .bg-logo-ring-2 {
    width: 56vw; max-width: calc(var(--ui-unit) * 820); min-width: calc(var(--ui-unit) * 360);
    border: calc(var(--ui-unit) * 1) dotted rgba(80,160,255,0.1);
    animation: bg-ring-spin-rev 60s linear infinite;
  }
  @keyframes bg-ring-spin     { to { transform: rotate(360deg); } }
  @keyframes bg-ring-spin-rev { to { transform: rotate(-360deg); } }
  .bg-logo-img {
    position: relative; z-index: 1;
    width: 38vw; max-width: calc(var(--ui-unit) * 560); min-width: calc(var(--ui-unit) * 240);
    object-fit: contain;
    opacity: 0.05;
    filter: saturate(1.4) brightness(1.6);
    animation: logo-float 12s ease-in-out infinite, logo-fade 7s ease-in-out infinite;
  }
  @keyframes logo-float {
    0%, 100% { transform: scale(1) rotate(0deg) translateY(0); }
    50%      { transform: scale(1.06) rotate(1.2deg) translateY(calc(var(--ui-unit) * -12)); }
  }
  @keyframes logo-fade {
    0%, 100% { opacity: 0.04; }
    50%      { opacity: 0.09; }
  }

  .speed-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
  .speed-line {
    position: absolute; left: calc(var(--ui-unit) * -200); height: calc(var(--ui-unit) * 1);
    background: linear-gradient(90deg, transparent, rgba(90,180,255,0.85), transparent);
    animation: speed-rush linear infinite;
  }
  @keyframes speed-rush { from { transform: translateX(0); } to { transform: translateX(calc(100vw + calc(var(--ui-unit) * 250))); } }

  .hud-corner { position: absolute; width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44); pointer-events: none; z-index: 15; }
  .hud-tl { top: calc(var(--ui-unit) * 66); left: calc(var(--ui-unit) * 286); }
  .hud-tr { top: calc(var(--ui-unit) * 66); right: calc(var(--ui-unit) * 68); }
  .hud-bl { bottom: calc(var(--ui-unit) * 48); left: calc(var(--ui-unit) * 286); }
  .hud-br { bottom: calc(var(--ui-unit) * 48); right: calc(var(--ui-unit) * 68); }
  .hud-h { position: absolute; top: 0; left: 0; width: calc(var(--ui-unit) * 22); height: calc(var(--ui-unit) * 1.5); background: rgba(80,160,255,0.5); box-shadow: 0 0 calc(var(--ui-unit) * 6) rgba(51,153,255,0.4); }
  .hud-v { position: absolute; top: 0; left: 0; width: calc(var(--ui-unit) * 1.5); height: calc(var(--ui-unit) * 22); background: rgba(80,160,255,0.5); box-shadow: 0 0 calc(var(--ui-unit) * 6) rgba(51,153,255,0.4); }
  .hud-tr .hud-h { left: auto; right: 0; }
  .hud-tr .hud-v { left: auto; right: 0; }
  .hud-bl .hud-h { top: auto; bottom: 0; }
  .hud-bl .hud-v { top: auto; bottom: 0; }
  .hud-br .hud-h { top: auto; bottom: 0; left: auto; right: 0; }
  .hud-br .hud-v { top: auto; bottom: 0; left: auto; right: 0; }
  .hud-lbl { position: absolute; bottom: calc(var(--ui-unit) * -17); left: 0; font-size: calc(var(--ui-unit) * 12); letter-spacing: .17em; color: rgba(140,190,255,0.55); white-space: nowrap; text-transform: uppercase; }
  .hud-tr .hud-lbl, .hud-br .hud-lbl { left: auto; right: 0; }
  .hud-bl .hud-lbl, .hud-br .hud-lbl { bottom: auto; top: calc(var(--ui-unit) * -17); }

  .topbar {
    position: absolute; top: 0; left: 0; right: 0; height: calc(var(--ui-unit) * 58);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 calc(var(--ui-unit) * 130) 0 calc(var(--ui-unit) * 20);
    background: rgba(6,10,20,0.72); backdrop-filter: blur(calc(var(--ui-unit) * 18));
    border-bottom: calc(var(--ui-unit) * 1.5) solid rgba(60,150,255,0.22);
    z-index: 20; box-shadow: 0 calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 24) rgba(0,0,0,0.4);
  }
  .topbar-left  { display: flex; align-items: center; gap: calc(var(--ui-unit) * 14); flex-shrink: 0; }
  .trad-logo-bar { height: calc(var(--ui-unit) * 34); width: auto; object-fit: contain; flex-shrink: 0; filter: drop-shadow(0 0 calc(var(--ui-unit) * 8) rgba(0,120,255,0.35)); }
  .tb-sep { width: calc(var(--ui-unit) * 1); height: calc(var(--ui-unit) * 26); background: rgba(80,160,255,0.25); }
  .topbar-text-group { display: flex; flex-direction: column; gap: calc(var(--ui-unit) * 1); }
  .topbar-brand { font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif); font-size: calc(var(--ui-unit) * 20); font-weight: 800; letter-spacing: .07em; color: #F2F6FF; text-transform: uppercase; line-height: 1; }
  .accent { color: #58AEFF; }
  .topbar-sub { font-size: calc(var(--ui-unit) * 12); letter-spacing: .24em; color: rgba(160,200,255,0.6); text-transform: uppercase; }
  .topbar-center { display: flex; align-items: center; justify-content: center; flex: 1; }
  .topbar-pill { display: flex; align-items: center; gap: calc(var(--ui-unit) * 7); background: rgba(0,119,255,0.1); border: calc(var(--ui-unit) * 1) solid rgba(60,150,255,0.35); border-radius: calc(var(--ui-unit) * 20); padding: calc(var(--ui-unit) * 6) calc(var(--ui-unit) * 14); font-size: calc(var(--ui-unit) * 13); letter-spacing: .14em; color: #7FC0FF; }
  .topbar-pill-dot { width: calc(var(--ui-unit) * 6); height: calc(var(--ui-unit) * 6); border-radius: 50%; background: #3399FF; box-shadow: 0 0 calc(var(--ui-unit) * 6) rgba(51,153,255,.8); animation: dot-pulse 1.8s ease-in-out infinite; }
  @keyframes dot-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.7); } }
  .topbar-right { display: flex; align-items: center; gap: calc(var(--ui-unit) * 7); flex-shrink: 0; }
  .tab { min-height: calc(var(--ui-unit) * 44); font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 13); letter-spacing: .12em; padding: calc(var(--ui-unit) * 7) calc(var(--ui-unit) * 15); border-radius: calc(var(--ui-unit) * 4); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.22); background: rgba(10,18,32,0.5); color: rgba(180,205,240,.65); transition: all .2s; }
  .tab--active { background: #0066E6; border-color: #3399FF; color: white; box-shadow: 0 0 calc(var(--ui-unit) * 14) rgba(0,102,230,.5); }
  .tab:hover:not(.tab--active) { border-color: rgba(80,160,255,.5); color: #7FC0FF; background: rgba(0,119,255,.14); }
  .btn-back { min-height: calc(var(--ui-unit) * 44); font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 13); letter-spacing: .1em; padding: calc(var(--ui-unit) * 7) calc(var(--ui-unit) * 15); border-radius: calc(var(--ui-unit) * 4); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,.22); background: rgba(10,18,32,0.5); color: rgba(210,228,255,0.8); margin-left: calc(var(--ui-unit) * 4); transition: all .2s; }
  .btn-back:hover { border-color: #3399FF; color: #7FC0FF; background: rgba(0,119,255,.14); }

  .left-sidebar {
    position: absolute; left: 0; top: calc(var(--ui-unit) * 58); bottom: calc(var(--ui-unit) * 40);
    width: calc(var(--ui-unit) * 280); z-index: 15;
    background: rgba(6,10,20,0.8); backdrop-filter: blur(calc(var(--ui-unit) * 16));
    border-right: calc(var(--ui-unit) * 1.5) solid rgba(80,160,255,0.22);
    display: flex; flex-direction: column;
    box-shadow: calc(var(--ui-unit) * 4) 0 calc(var(--ui-unit) * 30) rgba(0,0,0,0.45);
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
  }
  .left-sidebar.hidden { transform: translateX(-100%); opacity: 0; }
  .sidebar-header { display: flex; align-items: center; gap: calc(var(--ui-unit) * 10); padding: calc(var(--ui-unit) * 18) calc(var(--ui-unit) * 20) calc(var(--ui-unit) * 14); border-bottom: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.15); }
  .sidebar-dot { width: calc(var(--ui-unit) * 8); height: calc(var(--ui-unit) * 8); border-radius: 50%; background: #3399FF; box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,.8); animation: dot-pulse 2s ease-in-out infinite; flex-shrink: 0; }
  .sidebar-title { font-size: calc(var(--ui-unit) * 17); letter-spacing: .18em; color: #8FCBFF; text-transform: uppercase; font-weight: 800; }
  .sidebar-list { flex: 1; overflow-y: auto; padding: calc(var(--ui-unit) * 8) 0; }
  .sidebar-list::-webkit-scrollbar { width: calc(var(--ui-unit) * 4); }
  .sidebar-list::-webkit-scrollbar-track { background: transparent; }
  .sidebar-list::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.3); border-radius: calc(var(--ui-unit) * 2); }
  .sidebar-item { width: 100%; min-height: calc(var(--ui-unit) * 54); display: flex; align-items: flex-start; gap: calc(var(--ui-unit) * 12); padding: calc(var(--ui-unit) * 13) calc(var(--ui-unit) * 20); border: 0; border-left: calc(var(--ui-unit) * 3) solid transparent; background: transparent; color: inherit; text-align: left; transition: all .15s ease; touch-action: manipulation; }
  .sidebar-item:hover { background: rgba(0,119,255,0.1); border-left-color: rgba(80,160,255,.4); }
  .sidebar-item--active { background: rgba(0,119,255,0.16); border-left-color: #3399FF; }
  .sidebar-num { font-size: calc(var(--ui-unit) * 18); font-weight: 800; color: rgba(150,195,255,.6); letter-spacing: .02em; flex-shrink: 0; width: calc(var(--ui-unit) * 26); padding-top: calc(var(--ui-unit) * 2); font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif); }
  .sidebar-item--active .sidebar-num { color: #58AEFF; }
  .sidebar-item-info { flex: 1; min-width: 0; }
  .sidebar-name { font-size: calc(var(--ui-unit) * 18); font-weight: 600; letter-spacing: .01em; color: #F2F6FF; display: block; white-space: normal; word-break: break-word; line-height: 1.4; }
  .sidebar-item--active .sidebar-name { color: #8FCBFF; font-weight: 700; }
  .sidebar-brands { display: flex; flex-wrap: wrap; gap: calc(var(--ui-unit) * 5); margin-top: calc(var(--ui-unit) * 6); }
  .sidebar-brand-dot { font-size: calc(var(--ui-unit) * 13); font-weight: 600; letter-spacing: .05em; color: rgba(190,215,245,.85); text-transform: uppercase; background: rgba(80,160,255,0.14); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.22); border-radius: calc(var(--ui-unit) * 4); padding: calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 7); }
  .sidebar-item--empty { cursor: default; opacity: 0.55; }
  .sidebar-item--empty:hover { background: transparent; border-left-color: transparent; }
  .sidebar-brand-dot--empty { color: rgba(160,170,190,.7); background: rgba(140,150,170,0.1); font-style: italic; }

  .zoom-controls { position: absolute; right: calc(var(--ui-unit) * 20); top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: calc(var(--ui-unit) * 7); background: rgba(8,14,26,0.75); backdrop-filter: blur(calc(var(--ui-unit) * 16)); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.25); border-radius: calc(var(--ui-unit) * 12); padding: calc(var(--ui-unit) * 12) calc(var(--ui-unit) * 9); z-index: 15; box-shadow: 0 calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 30) rgba(0,0,0,0.45); }
  .zoom-btn { width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44); border-radius: calc(var(--ui-unit) * 6); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.28); background: rgba(10,18,32,0.6); color: rgba(180,205,240,.8); display: flex; align-items: center; justify-content: center; transition: all .2s; touch-action: manipulation; }
  .zoom-btn:hover { background: rgba(0,119,255,0.16); border-color: rgba(80,160,255,.6); color: #7FC0FF; }
  .zoom-btn svg { width: calc(var(--ui-unit) * 14); height: calc(var(--ui-unit) * 14); }
  .zoom-track { width: calc(var(--ui-unit) * 4); height: calc(var(--ui-unit) * 72); background: rgba(80,160,255,0.18); border-radius: calc(var(--ui-unit) * 2); position: relative; overflow: visible; }
  .zoom-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, #0066E6, #3399FF); border-radius: calc(var(--ui-unit) * 2); transition: height .15s ease; box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,0.5); }
  .zoom-thumb { position: absolute; left: 50%; width: calc(var(--ui-unit) * 12); height: calc(var(--ui-unit) * 12); background: white; border: calc(var(--ui-unit) * 2) solid #3399FF; border-radius: 50%; transform: translate(-50%, 50%); box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,.6); transition: bottom .15s ease; }
  .zoom-divider { width: calc(var(--ui-unit) * 20); height: calc(var(--ui-unit) * 1); background: rgba(80,160,255,0.2); }
  .zoom-pct { font-size: calc(var(--ui-unit) * 12); letter-spacing: .08em; color: rgba(160,200,255,.55); white-space: nowrap; }

  .canvas-area { position: absolute; inset: calc(var(--ui-unit) * 58) 0 calc(var(--ui-unit) * 40) calc(var(--ui-unit) * 280); overflow: hidden; display: flex; align-items: center; justify-content: center; z-index: 5; touch-action: none; user-select: none; }
  .has-active .canvas-area { left: 0; }
  .canvas-inner { position: relative; display: inline-block; will-change: transform; z-index: 3; }
  .canvas-inner.animate-transform { transition: transform .55s cubic-bezier(0.16,1,0.3,1); }
  .img-wrap { position: relative; display: inline-block; }
  .stage { position: relative; display: inline-block; transform: translateY(9%); }
  .img-halo { position: absolute; inset: calc(var(--ui-unit) * -60); background: radial-gradient(ellipse at center, rgba(0,120,255,0.14) 0%, transparent 60%); pointer-events: none; animation: radial-breathe 5s ease-in-out infinite; }
  .img-ring { position: absolute; left: 50%; top: 50%; border-radius: 50%; pointer-events: none; transform: translate(-50%,-50%); }
  .img-ring--1 { width: 108%; height: 108%; border: calc(var(--ui-unit) * 1) dashed rgba(80,160,255,0.18); animation: bg-ring-spin 34s linear infinite; }
  .img-ring--2 { width: 122%; height: 122%; border: calc(var(--ui-unit) * 1) dotted rgba(80,160,255,0.12); animation: bg-ring-spin-rev 48s linear infinite; }

  .img-float { animation: chassis-float 6s ease-in-out infinite; transform-origin: 50% 85%; }
  @keyframes chassis-float {
    0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
    50%       { transform: translateY(calc(var(--ui-unit) * -10)) rotate(0.35deg) scale(1.008); }
  }
  .chassis-img { display: block; max-width: calc(var(--ui-unit) * 1020); width: 68vw; height: auto; border-radius: calc(var(--ui-unit) * 12); pointer-events: none; filter: drop-shadow(0 calc(var(--ui-unit) * 30) calc(var(--ui-unit) * 60) rgba(0,0,0,0.55)) drop-shadow(0 0 calc(var(--ui-unit) * 40) rgba(0,120,255,0.12)); }

  .hotspot { position: absolute; width: calc(var(--ui-unit) * 30); height: calc(var(--ui-unit) * 30); padding: 0; border: 0; background: transparent; color: inherit; appearance: none; transform: translate(-50%,-50%); z-index: 10; cursor: pointer; touch-action: manipulation; }
  .hs-pulse { position: absolute; width: calc(var(--ui-unit) * 26); height: calc(var(--ui-unit) * 26); border-radius: 50%; border: calc(var(--ui-unit) * 1) solid rgba(51,153,255,0.38); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; opacity: .55; }
  .hs-p1, .hs-p2 { animation: none; }
  @keyframes hs-pulse { 0% { transform: translate(-50%,-50%) scale(.4); opacity: .9; } 100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
  .hs-core { position: absolute; top: 50%; left: 50%; width: calc(var(--ui-unit) * 20); height: calc(var(--ui-unit) * 20); border-radius: 50%; background: #0066E6; border: calc(var(--ui-unit) * 2) solid rgba(150,205,255,0.9); display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,0.5), 0 calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 6) rgba(0,0,0,0.4); transition: none; }
  .hotspot:hover .hs-core, .hotspot.active .hs-core { transform: translate(-50%, -50%); background: #0066E6; border-color: rgba(150,205,255,0.9); box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,0.5), 0 calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 6) rgba(0,0,0,0.4); }
  .hs-num { font-size: calc(var(--ui-unit) * 12); font-weight: 800; color: #ffffff; letter-spacing: -.02em; line-height: 1; transition: color .2s; }
  .hotspot:hover .hs-num, .hotspot.active .hs-num { color: white; }
  .hotspot:active .hs-core { transform: translate(-50%, -50%); }
  .hs-tag { position: absolute; top: 50%; display: flex; align-items: center; gap: 0; pointer-events: none; opacity: 0; transition: opacity .2s, transform .2s; }
  .hs-tag.right { left: calc(var(--ui-unit) * 26); transform: translateY(-50%); }
  .hs-tag.left  { right: calc(var(--ui-unit) * 26); transform: translateY(-50%); flex-direction: row-reverse; }
  .hotspot:hover .hs-tag, .hotspot.active .hs-tag { opacity: 1; }
  .hs-tag-line { display: block; width: calc(var(--ui-unit) * 16); height: calc(var(--ui-unit) * 1); background: rgba(80,160,255,0.6); flex-shrink: 0; }
  .hs-tag-body { display: flex; flex-direction: column; gap: calc(var(--ui-unit) * 1); background: rgba(6,10,20,0.9); backdrop-filter: blur(calc(var(--ui-unit) * 10)); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.35); border-radius: calc(var(--ui-unit) * 5); padding: calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 9); box-shadow: 0 calc(var(--ui-unit) * 3) calc(var(--ui-unit) * 16) rgba(0,0,0,0.5); }
  .hs-tag-name { font-size: calc(var(--ui-unit) * 12); font-weight: 600; letter-spacing: .06em; color: #F2F6FF; white-space: nowrap; line-height: 1.2; }
  .hs-tag-brand { font-size: calc(var(--ui-unit) * 12); letter-spacing: .1em; color: rgba(160,200,255,.7); text-transform: uppercase; white-space: nowrap; }
  .hs-tag-brand--empty { color: rgba(160,165,180,.65); font-style: italic; }
  .hotspot--empty { cursor: default; }
  .hotspot--empty .hs-core { background: rgba(30,36,50,0.75); border-color: rgba(150,160,180,0.4); box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(0,0,0,0.3); }
  .hotspot--empty .hs-num { color: rgba(180,186,200,.65); }
  .hotspot--empty:hover .hs-core { transform: translate(-50%, -50%); background: rgba(40,46,60,0.85); border-color: rgba(150,160,180,0.5); }
  .hotspot--empty:hover .hs-num { color: rgba(200,206,220,.75); }
  .hotspot--empty .hs-pulse { border-color: rgba(150,160,180,0.25); }

  .popup-overlay {
    position: absolute; inset: calc(var(--ui-unit) * 58) 0 calc(var(--ui-unit) * 40) 0;
    background: rgba(3,6,14,0.6); backdrop-filter: blur(calc(var(--ui-unit) * 8));
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: calc(var(--ui-unit) * 10);
  }

  .popup-close {
    position: absolute; top: calc(var(--ui-unit) * 14); right: calc(var(--ui-unit) * 14); width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44);
    border-radius: 50%; border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.25);
    background: rgba(8,14,26,0.75); color: #DCEAFF; font-size: calc(var(--ui-unit) * 17); line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s; z-index: 30; backdrop-filter: blur(calc(var(--ui-unit) * 6));
  }
  .popup-close:hover { background: #E02020; color: white; border-color: #E02020; }

  .popup-card--redesign {
    position: relative;
    background: #05070D;
    border-radius: calc(var(--ui-unit) * 20);
    width: 98vw; max-width: calc(var(--ui-unit) * 1760); height: 95vh; max-height: calc(var(--ui-unit) * 980);
    box-shadow: 0 calc(var(--ui-unit) * 32) calc(var(--ui-unit) * 90) rgba(0,10,40,0.5);
    overflow: hidden;
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.18);
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
    padding: calc(var(--ui-unit) * 20) calc(var(--ui-unit) * 28) calc(var(--ui-unit) * 16);
    overflow-y: auto;
  }
  .rd-layout::-webkit-scrollbar { width: calc(var(--ui-unit) * 5); }
  .rd-layout::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.25); border-radius: calc(var(--ui-unit) * 3); }

  .rd-icon-slot {
    display: inline-flex; flex-shrink: 0;
    width: calc(var(--ui-unit) * 36); height: calc(var(--ui-unit) * 36); border-radius: 50%;
    border: calc(var(--ui-unit) * 1.5) dashed rgba(90,170,255,0.4);
    background: rgba(90,170,255,0.05);
  }
  .rd-icon-slot--lg { width: calc(var(--ui-unit) * 60); height: calc(var(--ui-unit) * 60); border-radius: calc(var(--ui-unit) * 18); }
  .rd-icon-slot--logo { width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44); border-radius: calc(var(--ui-unit) * 10); }

  .rd-icon-slot--filled {
    border-style: solid;
    border-color: rgba(90,170,255,0.3);
    background: rgba(90,170,255,0.08);
    object-fit: contain;
    padding: calc(var(--ui-unit) * 8);
    box-sizing: border-box;
  }

  .rd-panel-title {
    display: block; font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 13);
    letter-spacing: .2em; color: rgba(150,195,255,.7); text-transform: uppercase;
    margin-bottom: calc(var(--ui-unit) * 12);
  }

  .rd-brand-select { display: flex; flex-direction: column; gap: calc(var(--ui-unit) * 6); margin-bottom: calc(var(--ui-unit) * 12); flex-shrink: 0; }
  .rd-brand-select-label { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 12); letter-spacing: .2em; color: rgba(150,195,255,.55); text-transform: uppercase; }
  .rd-brand-tabs { display: flex; gap: calc(var(--ui-unit) * 10); flex-wrap: wrap; }
  .rd-tabs {
    display: flex;
    gap: calc(var(--ui-unit) * 6);
    flex-wrap: wrap;
    padding: calc(var(--ui-unit) * 8);
    margin: 0 0 calc(var(--ui-unit) * 14);
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.16);
    border-radius: calc(var(--ui-unit) * 10);
    background: rgba(8,14,26,0.58);
    flex-shrink: 0;
  }
  .rd-tab {
    min-height: calc(var(--ui-unit) * 36);
    padding: calc(var(--ui-unit) * 7) calc(var(--ui-unit) * 12);
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.2);
    border-radius: calc(var(--ui-unit) * 6);
    background: rgba(10,18,32,0.6);
    color: rgba(190,215,245,.7);
    font-family: var(--font-mono, monospace);
    font-size: calc(var(--ui-unit) * 12);
    font-weight: 700;
    letter-spacing: .08em;
    touch-action: manipulation;
  }
  .rd-tab--active {
    color: #fff;
    border-color: #3399FF;
    background: #0066E6;
    box-shadow: 0 0 calc(var(--ui-unit) * 12) rgba(0,102,230,.3);
  }
  .rd-brand-tab {
    position: relative; display: flex; align-items: center; gap: calc(var(--ui-unit) * 6);
    padding: calc(var(--ui-unit) * 9) calc(var(--ui-unit) * 16); border-radius: calc(var(--ui-unit) * 10); min-width: calc(var(--ui-unit) * 70);
    border: calc(var(--ui-unit) * 1.5) solid rgba(80,160,255,0.2); background: rgba(10,18,32,0.55);
    transition: all .22s cubic-bezier(0.16,1,0.3,1);
  }
  .rd-brand-tab:hover:not(.rd-brand-tab--active) { border-color: rgba(80,160,255,.5); background: rgba(0,80,220,0.12); }
  .rd-brand-tab--active { border-color: #3399FF; background: rgba(0,102,230,0.16); box-shadow: 0 0 0 calc(var(--ui-unit) * 3) rgba(0,102,230,0.16); }
  .rd-brand-tab-logo-box { background: #fff; border-radius: calc(var(--ui-unit) * 6); padding: calc(var(--ui-unit) * 3) calc(var(--ui-unit) * 8); display: flex; align-items: center; justify-content: center; }
  .rd-brand-tab-logo { max-height: calc(var(--ui-unit) * 22); max-width: calc(var(--ui-unit) * 52); object-fit: contain; }
  .rd-brand-tab-name { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 14); font-weight: 700; letter-spacing: .06em; color: #DCEAFF; }
  .rd-brand-tab-check { position: absolute; top: calc(var(--ui-unit) * -6); right: calc(var(--ui-unit) * -6); width: calc(var(--ui-unit) * 16); height: calc(var(--ui-unit) * 16); border-radius: 50%; background: #3399FF; color: white; font-size: calc(var(--ui-unit) * 12); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,.7); }

  /* ── Header ── */
  .rd-header { display: flex; align-items: flex-start; gap: calc(var(--ui-unit) * 16); margin-bottom: calc(var(--ui-unit) * 12); flex-shrink: 0; }
  .rd-index { font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif); font-size: calc(var(--ui-unit) * 55); font-weight: 800; color: rgba(80,160,255,0.26); line-height: 1; }
  .rd-header-text { display: flex; flex-direction: column; gap: calc(var(--ui-unit) * 4); padding-top: calc(var(--ui-unit) * 6); }
  .rd-eyebrow { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 14); letter-spacing: .26em; color: rgba(130,190,255,.75); text-transform: uppercase; }
  .rd-title { font-size: calc(var(--ui-unit) * 38); font-weight: 800; color: #F8FAFF; margin: 0; letter-spacing: -.01em; position: relative; display: inline-block; padding-bottom: calc(var(--ui-unit) * 6); }
  .rd-title::after { content: ''; position: absolute; left: 0; bottom: 0; width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 3); border-radius: calc(var(--ui-unit) * 2); background: linear-gradient(90deg, #0066E6, #3399FF); }

  .rd-main {
    position: relative;
    display: flex;
    gap: calc(var(--ui-unit) * 20);
    flex: 1;
    min-height: 0;
    margin-bottom: calc(var(--ui-unit) * 14);
    padding-right: calc(var(--ui-unit) * 400);
  }

  .rd-specs {
    width: calc(var(--ui-unit) * 300); flex-shrink: 0;
    background: rgba(8,14,26,0.5); backdrop-filter: blur(calc(var(--ui-unit) * 10));
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.18); border-radius: calc(var(--ui-unit) * 16);
    padding: calc(var(--ui-unit) * 20); align-self: flex-start;
  }
  .rd-specs-list { display: flex; flex-direction: column; gap: calc(var(--ui-unit) * 16); }
  .rd-spec-item { display: flex; align-items: flex-start; gap: calc(var(--ui-unit) * 13); }
  .rd-spec-item .rd-icon-slot { width: calc(var(--ui-unit) * 38); height: calc(var(--ui-unit) * 38); }
  .rd-spec-text {
    font-size: calc(var(--ui-unit) * 18); line-height: 1.55; color: rgba(230,240,255,0.9); padding-top: calc(var(--ui-unit) * 6);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .rd-main--advantages {
    display: block;
    padding-right: 0;
    overflow-y: auto;
  }
  .rd-main--advantages .rd-specs {
    width: 100%;
    max-width: none;
    padding: calc(var(--ui-unit) * 22);
  }
  .rd-main--advantages .rd-specs-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: calc(var(--ui-unit) * 14);
  }
  .rd-main--advantages .rd-spec-item {
    min-height: calc(var(--ui-unit) * 92);
    align-items: flex-start;
    padding: calc(var(--ui-unit) * 16);
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.16);
    border-radius: calc(var(--ui-unit) * 12);
    background: rgba(10,18,32,0.52);
  }
  .rd-main--advantages .rd-spec-text {
    padding-top: calc(var(--ui-unit) * 2);
    display: block;
    overflow: visible;
    line-height: 1.55;
  }

  .rd-stage { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }

  .rd-features { width: 100%; flex: 1; display: flex; flex-direction: column; justify-content: center; margin-bottom: calc(var(--ui-unit) * 10); }
  .rd-features-label {
    display: block; text-align: center; font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 14);
    letter-spacing: .2em; color: rgba(150,195,255,.7); text-transform: uppercase; margin-bottom: calc(var(--ui-unit) * 22);
  }
  .rd-features-row { display: flex; align-items: flex-start; justify-content: center; gap: calc(var(--ui-unit) * 18); flex-wrap: wrap; }
  .rd-feature { display: flex; flex-direction: column; align-items: center; gap: calc(var(--ui-unit) * 13); width: calc(var(--ui-unit) * 220); position: relative; }
  .rd-feature .rd-icon-slot--lg { width: calc(var(--ui-unit) * 86); height: calc(var(--ui-unit) * 86); border-radius: calc(var(--ui-unit) * 22); }
  .rd-feature-label {
    font-size: calc(var(--ui-unit) * 16); font-weight: 700; letter-spacing: .03em; color: rgba(220,235,255,.92); text-align: center; text-transform: uppercase; line-height: 1.45;
    white-space: normal;
    overflow-wrap: break-word;
  }
  .rd-feature-connector { position: absolute; top: calc(var(--ui-unit) * 30); left: calc(50% + calc(var(--ui-unit) * 52)); width:(100% - calc(var(--ui-unit) * 52)); height: calc(var(--ui-unit) * 1); border-top: calc(var(--ui-unit) * 1) dashed rgba(90,170,255,0.35); }

  .rd-stage-visual {
    position: relative; width: 100%; max-width: calc(var(--ui-unit) * 480); aspect-ratio: 1.15;
    display: flex; align-items: center; justify-content: center;
    min-height: calc(var(--ui-unit) * 360);
    flex-shrink: 0;
  }
  .rd-stage-halo {
    position: absolute; left: 50%; top: 38%; width: 130%; height: 110%;
    transform: translate(-50%, -50%); z-index: 0; pointer-events: none;
    background: radial-gradient(ellipse 50% 62% at center, rgba(50,150,255,0.5) 0%, rgba(20,120,255,0.28) 32%, rgba(0,90,220,0.14) 52%, rgba(0,70,200,0.05) 70%, transparent 82%);
    filter: blur(calc(var(--ui-unit) * 6));
    animation: rd-halo-pulse 4.5s ease-in-out infinite;
  }
  @keyframes rd-halo-pulse { 0%,100% { opacity: .85; } 50% { opacity: 1; } }
  .rd-stage-ring { position: absolute; left: 50%; top: 58%; border-radius: 50%; transform: translate(-50%,-50%); pointer-events: none; }
  .rd-stage-ring--1 { width: 96%; height: 96%; border: calc(var(--ui-unit) * 1) dashed rgba(90,170,255,0.3); animation: bg-ring-spin 40s linear infinite; }
  .rd-stage-ring--2 { width: 76%; height: 76%; border: calc(var(--ui-unit) * 1) dotted rgba(90,170,255,0.24); animation: bg-ring-spin-rev 55s linear infinite; }
  .rd-stage-ring--3 { width: 56%; height: 56%; border: calc(var(--ui-unit) * 1) solid rgba(90,170,255,0.18); }
  .rd-car-silhouette { position: absolute; bottom: 4%; left: 50%; transform: translateX(-50%); width: 96%; opacity: .9; pointer-events: none; z-index: 1; }
  .rd-orbit-dot {
    position: absolute; left: 50%; top: 58%; width: calc(var(--ui-unit) * 6); height: calc(var(--ui-unit) * 6); border-radius: 50%;
    background: #3399FF; box-shadow: 0 0 calc(var(--ui-unit) * 10) rgba(51,153,255,.9);
    animation: rd-orbit 6s linear infinite;
  }
  @keyframes rd-orbit {
    0%   { transform: rotate(0deg) translateX(calc(var(--ui-unit) * 170)) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(calc(var(--ui-unit) * 170)) rotate(-360deg); }
  }
  .rd-stage-img { position: relative; z-index: 2; max-height: 84%; max-width: 62%; object-fit: contain; filter: drop-shadow(0 calc(var(--ui-unit) * 20) calc(var(--ui-unit) * 30) rgba(0,0,0,0.5)) drop-shadow(0 0 calc(var(--ui-unit) * 34) rgba(80,195,255,0.7)); animation: stage-img-float 5s ease-in-out infinite; }
  @keyframes stage-img-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(calc(var(--ui-unit) * -8)); } }
  .rd-stage-model { width: 62%; height: 78%; max-width: none; max-height: none; animation: none; }
  .rd-stage-img-placeholder { position: relative; z-index: 2; font-size: calc(var(--ui-unit) * 78); }
  .rd-pedestal-glow {
    position: absolute; bottom: 16%; left: 50%; width: 46%; height: calc(var(--ui-unit) * 46);
    transform: translateX(-50%); z-index: 1;
    background: radial-gradient(ellipse at center, rgba(20,170,255,0.55) 0%, rgba(0,150,255,0.18) 55%, transparent 75%);
    filter: blur(calc(var(--ui-unit) * 3));
    animation: pedestal-pulse 3s ease-in-out infinite;
  }
  @keyframes pedestal-pulse { 0%,100% { opacity: .7; } 50% { opacity: 1; } }

.rd-profile {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: calc(var(--ui-unit) * 380);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--ui-unit) * 18);
  padding-right: calc(var(--ui-unit) * 6); 
}

.rd-profile::-webkit-scrollbar { width: calc(var(--ui-unit) * 4); }
.rd-profile::-webkit-scrollbar-track { background: transparent; }
.rd-profile::-webkit-scrollbar-thumb { background: rgba(80,160,255,0.25); border-radius: calc(var(--ui-unit) * 3); }
  .rd-profile-card {
    background: rgba(8,14,26,0.55); backdrop-filter: blur(calc(var(--ui-unit) * 10));
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.18); border-radius: calc(var(--ui-unit) * 16); padding: calc(var(--ui-unit) * 20);
    flex-shrink: 0;
  }
  .rd-profile-card-header { display: flex; align-items: center; gap: calc(var(--ui-unit) * 9); margin-bottom: calc(var(--ui-unit) * 16); }
  .rd-profile-dot { width: calc(var(--ui-unit) * 8); height: calc(var(--ui-unit) * 8); border-radius: 50%; background: #FF5A1F; box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(255,90,31,.5); flex-shrink: 0; }
  .rd-profile-card-title { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 16); font-weight: 700; letter-spacing: .18em; color: #8FCBFF; text-transform: uppercase; }
  .rd-profile-brand-row { display: flex; align-items: center; gap: calc(var(--ui-unit) * 16); margin-bottom: calc(var(--ui-unit) * 16); }
  .rd-profile-logo-box {
    width: calc(var(--ui-unit) * 92); height: calc(var(--ui-unit) * 52); border-radius: calc(var(--ui-unit) * 10); background: #fff;
    display: flex; align-items: center; justify-content: center; padding: calc(var(--ui-unit) * 8) calc(var(--ui-unit) * 12);
    box-shadow: 0 calc(var(--ui-unit) * 3) calc(var(--ui-unit) * 12) rgba(0,0,0,0.3); flex-shrink: 0;
  }
  .rd-profile-logo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .rd-profile-brand-name { font-size: calc(var(--ui-unit) * 22); font-weight: 700; color: #F2F6FF; }
  .rd-profile-facts { display: flex; flex-wrap: wrap; gap: calc(var(--ui-unit) * 18); }
  .rd-profile-fact { display: flex; flex-direction: column; gap: calc(var(--ui-unit) * 3); }
  .rd-fact-lbl { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 13); letter-spacing: .14em; color: rgba(150,195,255,.55); text-transform: uppercase; }
  .rd-fact-val { font-size: calc(var(--ui-unit) * 20); font-weight: 600; color: #EAF3FF; }

  .rd-section { padding-top: calc(var(--ui-unit) * 2); flex-shrink: 0; }
  .rd-section .rd-panel-title {
    position: relative; padding-bottom: calc(var(--ui-unit) * 10); margin-bottom: calc(var(--ui-unit) * 14);
    border-bottom: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.16);
  }

  .rd-oem-list { display: flex; flex-wrap: wrap; gap: calc(var(--ui-unit) * 14); }
  .rd-icon-slot--oem { width: calc(var(--ui-unit) * 48); height: calc(var(--ui-unit) * 48); border-radius: calc(var(--ui-unit) * 10); overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.04); }
  .rd-icon-slot--oem img { width: 100%; height: 100%; object-fit: contain; }

  .rd-profile-points {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-unit) * 12);
  }
  .rd-profile-points li {
    position: relative;
    padding-left: calc(var(--ui-unit) * 18);
    font-size: calc(var(--ui-unit) * 18);
    line-height: 1.6;
    color: rgba(230,240,255,0.9);
  }
  .rd-profile-points li::before {
    content: '';
    position: absolute;
    left: 0;
    top: calc(var(--ui-unit) * 7);
    width: calc(var(--ui-unit) * 6);
    height: calc(var(--ui-unit) * 6);
    border-radius: 50%;
    background: #3399FF;
    box-shadow: 0 0 calc(var(--ui-unit) * 8) rgba(51,153,255,.7);
  }

  .rd-spec-block { display: flex; align-items: flex-start; gap: calc(var(--ui-unit) * 13); }
  .rd-spec-block .rd-icon-slot { width: calc(var(--ui-unit) * 40); height: calc(var(--ui-unit) * 40); }
  .rd-spec-block-text { margin: 0; padding-top: calc(var(--ui-unit) * 6); font-size: calc(var(--ui-unit) * 18); line-height: 1.6; color: rgba(230,240,255,0.9); }

  .rd-timeline { display: flex; align-items: flex-start; justify-content: space-between; gap: calc(var(--ui-unit) * 10); position: relative; padding-top: calc(var(--ui-unit) * 5); flex-wrap: wrap; }
  .rd-timeline::before { content: ''; position: absolute; top: calc(var(--ui-unit) * 9); left: 6%; right: 6%; height: calc(var(--ui-unit) * 1); background: rgba(80,160,255,0.2); }
  .rd-timeline-node { display: flex; flex-direction: column; align-items: center; gap: calc(var(--ui-unit) * 7); flex: 1; min-width: calc(var(--ui-unit) * 72); }
  .rd-timeline-dot { width: calc(var(--ui-unit) * 9); height: calc(var(--ui-unit) * 9); border-radius: 50%; background: #3399FF; box-shadow: 0 0 calc(var(--ui-unit) * 9) rgba(51,153,255,.7); position: relative; z-index: 1; }
  .rd-timeline-label { font-size: calc(var(--ui-unit) * 14); font-weight: 600; color: rgba(210,228,255,.85); text-align: center; line-height: 1.35; }

  .rd-nav {
    position: relative;
    z-index: 6;
    display: flex;
    gap: calc(var(--ui-unit) * 10);
    align-items: center;
    flex-shrink: 0;
    padding-top: calc(var(--ui-unit) * 4);
    background: linear-gradient(180deg, transparent, rgba(5,7,13,.96) 35%);
  }
  .rd-nav-btn { min-height: calc(var(--ui-unit) * 48); font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 13); letter-spacing: .1em; padding: calc(var(--ui-unit) * 13) calc(var(--ui-unit) * 16); border-radius: calc(var(--ui-unit) * 8); flex-shrink: 0; border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.25); background: rgba(10,18,32,0.5); color: rgba(180,205,240,.75); transition: all .2s; touch-action: manipulation; }
  .rd-nav-btn:hover:not(:disabled) { background: rgba(0,119,255,0.14); border-color: #3399FF; color: #7FC0FF; }
  .rd-nav-btn:disabled { opacity: 0.28; }
  .rd-nav-cta { min-height: calc(var(--ui-unit) * 48); font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 16); font-weight: 700; letter-spacing: .1em; padding: calc(var(--ui-unit) * 14) calc(var(--ui-unit) * 16); border-radius: calc(var(--ui-unit) * 8); flex: 1; border: none; background: #0066E6; color: white; box-shadow: 0 calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 16) rgba(0,102,230,.35); transition: all .2s; touch-action: manipulation; }
  .rd-nav-cta:hover { background: #0044BB; box-shadow: 0 calc(var(--ui-unit) * 6) calc(var(--ui-unit) * 20) rgba(0,102,230,.5); }

  .video-widget {
    position: absolute; right: calc(var(--ui-unit) * 20); bottom: calc(var(--ui-unit) * 20); z-index: 40;
  }

  .vw-fab {
    position: relative; display: flex; align-items: center; gap: calc(var(--ui-unit) * 9);
    background: rgba(8,14,26,0.9); backdrop-filter: blur(calc(var(--ui-unit) * 12));
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.3); border-radius: calc(var(--ui-unit) * 30);
    padding: calc(var(--ui-unit) * 8) calc(var(--ui-unit) * 16) calc(var(--ui-unit) * 8) calc(var(--ui-unit) * 8); cursor: pointer;
    box-shadow: 0 calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 28) rgba(0,0,0,0.5);
    transition: transform .2s, box-shadow .2s;
  }
  .vw-fab:hover { transform: translateY(calc(var(--ui-unit) * -2)); box-shadow: 0 calc(var(--ui-unit) * 14) calc(var(--ui-unit) * 34) rgba(0,0,0,0.55); }
  .vw-fab-ring {
    position: absolute; left: calc(var(--ui-unit) * 8); top: 50%; width: calc(var(--ui-unit) * 30); height: calc(var(--ui-unit) * 30);
    transform: translateY(-50%); border-radius: 50%;
    border: calc(var(--ui-unit) * 1.5) solid rgba(51,153,255,0.55);
    animation: hs-pulse 2.4s ease-out infinite;
  }
  .vw-fab-play { width: calc(var(--ui-unit) * 30); height: calc(var(--ui-unit) * 30); flex-shrink: 0; filter: drop-shadow(0 calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 6) rgba(0,0,0,0.4)); }
  .vw-fab-label { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 14); font-weight: 700; letter-spacing: .08em; color: #F2F6FF; white-space: nowrap; }

  .video-widget-card {
    width: calc(var(--ui-unit) * 300);
    background: rgba(8,14,26,0.92);
    backdrop-filter: blur(calc(var(--ui-unit) * 14));
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.28);
    border-radius: calc(var(--ui-unit) * 16);
    box-shadow: 0 calc(var(--ui-unit) * 16) calc(var(--ui-unit) * 40) rgba(0,0,0,0.55);
    overflow: hidden;
  }
  .vw-card-header {
    display: flex; align-items: center; gap: calc(var(--ui-unit) * 9);
    padding: calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 12);
    border-bottom: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.14);
  }
  .vw-logo-box {
    flex-shrink: 0; height: calc(var(--ui-unit) * 26); min-width: calc(var(--ui-unit) * 26); border-radius: calc(var(--ui-unit) * 7);
    background: #fff; display: flex; align-items: center; justify-content: center;
    padding: calc(var(--ui-unit) * 3) calc(var(--ui-unit) * 7); box-shadow: 0 calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 6) rgba(0,0,0,0.3);
  }
  .vw-logo { height: calc(var(--ui-unit) * 16); width: auto; max-width: calc(var(--ui-unit) * 60); object-fit: contain; display: block; }
  .vw-label { font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 13); font-weight: 700; letter-spacing: .1em; color: #F2F6FF; white-space: nowrap; }
  .vw-stats { flex: 1; min-width: 0; font-size: calc(var(--ui-unit) * 12); color: rgba(160,200,255,.55); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vw-close-btn {
    flex-shrink: 0; width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44); border-radius: calc(var(--ui-unit) * 6);
    border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.22); background: rgba(255,255,255,0.04);
    color: rgba(200,220,255,.8); font-size: calc(var(--ui-unit) * 14); display: flex; align-items: center; justify-content: center;
  }
  .vw-close-btn:hover { background: #E02020; border-color: #E02020; color: white; }

  .video-widget-body { padding: calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 12) calc(var(--ui-unit) * 12); }
  .vw-video-wrap { position: relative; width: 100%; padding-top: 56%; border-radius: calc(var(--ui-unit) * 10); overflow: hidden; background: #000; margin-bottom: calc(var(--ui-unit) * 9); box-shadow: 0 calc(var(--ui-unit) * 8) calc(var(--ui-unit) * 24) rgba(0,0,0,0.4); }
  .vw-iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
  .vw-video-corner { position: absolute; width: calc(var(--ui-unit) * 12); height: calc(var(--ui-unit) * 12); border: calc(var(--ui-unit) * 1.5) solid rgba(255,255,255,0.75); z-index: 2; pointer-events: none; }
  .vw-video-corner-tl { top: calc(var(--ui-unit) * 6); left: calc(var(--ui-unit) * 6); border-right: none; border-bottom: none; }
  .vw-video-corner-br { bottom: calc(var(--ui-unit) * 6); right: calc(var(--ui-unit) * 6); border-left: none; border-top: none; }
  .vw-trust-marquee { overflow: hidden; width: 100%; mask-image: linear-gradient(90deg, transparent, black 6%, black 94%, transparent); margin-bottom: calc(var(--ui-unit) * 7); }
  .vw-trust-track { display: flex; gap: calc(var(--ui-unit) * 5); width: max-content; animation: vw-trust-scroll 16s linear infinite; }
  @keyframes vw-trust-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .vw-trust-chip { flex-shrink: 0; font-family: var(--font-mono, monospace); font-size: calc(var(--ui-unit) * 12); font-weight: 700; letter-spacing: .05em; color: #7FC0FF; background: rgba(0,100,230,0.14); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.2); border-radius: calc(var(--ui-unit) * 4); padding: calc(var(--ui-unit) * 3) calc(var(--ui-unit) * 7); white-space: nowrap; }
  .vw-caption { font-size: calc(var(--ui-unit) * 12); line-height: 1.5; color: rgba(170,205,255,.6); margin: 0; }

  .vw-expand-enter-active, .vw-expand-leave-active { transition: opacity .2s ease, max-height .25s ease; overflow: hidden; }
  .vw-expand-enter-from, .vw-expand-leave-to { opacity: 0; max-height: 0; }
  .vw-expand-enter-to, .vw-expand-leave-from { opacity: 1; max-height: calc(var(--ui-unit) * 320); }

  .statusbar { position: absolute; bottom: 0; left: 0; right: 0; height: calc(var(--ui-unit) * 40); background: rgba(5,9,18,0.85); backdrop-filter: blur(calc(var(--ui-unit) * 16)); border-top: calc(var(--ui-unit) * 1.5) solid rgba(80,160,255,0.22); display: flex; align-items: center; justify-content: space-between; padding: 0 calc(var(--ui-unit) * 20); z-index: 20; box-shadow: 0 calc(var(--ui-unit) * -2) calc(var(--ui-unit) * 24) rgba(0,0,0,0.4); }
  .status-left, .status-right { display: flex; align-items: center; gap: calc(var(--ui-unit) * 7); }
  .status-dot { width: calc(var(--ui-unit) * 6); height: calc(var(--ui-unit) * 6); border-radius: 50%; background: #22C55E; box-shadow: 0 0 calc(var(--ui-unit) * 7) rgba(34,197,94,.55); animation: dot-pulse 2.2s ease-in-out infinite; }
  .status-text { font-size: calc(var(--ui-unit) * 12); font-weight: 600; letter-spacing: .12em; color: #7FC0FF; text-transform: uppercase; }
  .status-text.dim { font-weight: 400; color: rgba(160,200,255,.4); }
  .status-sep { color: rgba(80,160,255,.3); font-size: calc(var(--ui-unit) * 13); }
  .status-center { font-size: calc(var(--ui-unit) * 12); letter-spacing: .08em; color: rgba(160,200,255,.4); }

  .popup-enter-active { transition: all .38s cubic-bezier(0.16,1,0.3,1); }
  .popup-leave-active { transition: all .22s ease; }
  .popup-enter-from, .popup-leave-to { opacity: 0; }
  .popup-enter-from .popup-card--redesign,
  .popup-enter-from .video-widget { transform: scale(.93) translateY(calc(var(--ui-unit) * 22)); }
  .popup-leave-to   .popup-card--redesign,
  .popup-leave-to   .video-widget { transform: scale(.96) translateY(calc(var(--ui-unit) * 12)); }

  .hero-swap-enter-active { transition: opacity .25s ease, transform .28s cubic-bezier(0.16,1,0.3,1); }
  .hero-swap-leave-active { transition: opacity .18s ease, transform .18s ease; }
  .hero-swap-enter-from   { opacity: 0; transform: scale(1.04); }
  .hero-swap-leave-to     { opacity: 0; transform: scale(0.96); }

  .content-swap-enter-active { transition: opacity .3s ease, transform .32s cubic-bezier(0.16,1,0.3,1); }
  .content-swap-leave-active { transition: opacity .18s ease; }
  .content-swap-enter-from   { opacity: 0; transform: translateX(calc(var(--ui-unit) * 12)); }
  .content-swap-leave-to     { opacity: 0; }

  @media (max-width: 1500px) {
    .rd-profile { width: calc(var(--ui-unit) * 340); }
    .rd-specs { width: calc(var(--ui-unit) * 260); }
  }
  @media (max-width: 1380px) {
    .video-widget { display: none; }
  }
  @media (min-width: 1600px) {
    .left-sidebar { width: calc(var(--ui-unit) * 300); }
    .canvas-area { left: calc(var(--ui-unit) * 300); }
    .chassis-img { max-width: calc(var(--ui-unit) * 1180); }
  }
  @media (max-width: 1200px) {
  .rd-main { flex-direction: column; align-items: stretch; padding-right: 0; }
  .rd-specs, .rd-profile {
    width: 100%;
    position: static;
    max-height: none;
    overflow-y: visible;
  }
  .rd-main--advantages .rd-specs-list { grid-template-columns: 1fr; }
}
  @media (max-width: 860px) {
    .left-sidebar { display: none; }
    .canvas-area  { inset: calc(var(--ui-unit) * 58) 0 calc(var(--ui-unit) * 40) 0 !important; }
    .hud-tl, .hud-bl { left: calc(var(--ui-unit) * 16); }
    .topbar-center { display: none; }
    .rd-layout { padding: calc(var(--ui-unit) * 18); }
    .rd-features { display: block; overflow: visible; }
    .rd-features-row { justify-content: center; flex-wrap: wrap; overflow: visible; padding: calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 8); }
    .rd-feature { flex: 0 0 calc(var(--ui-unit) * 145); width: calc(var(--ui-unit) * 145); gap: calc(var(--ui-unit) * 8); }
    .rd-feature .rd-icon-slot--lg { width: calc(var(--ui-unit) * 64); height: calc(var(--ui-unit) * 64); border-radius: calc(var(--ui-unit) * 16); }
    .rd-feature-label { font-size: calc(var(--ui-unit) * 12); line-height: 1.3; }
    .rd-feature-connector { display: none; }
    .rd-nav { flex-wrap: wrap; }
  }
  @media (max-width: 600px) {
    .topbar { height: calc(var(--ui-unit) * 54); padding: 0 calc(var(--ui-unit) * 68) 0 calc(var(--ui-unit) * 12); }
    .trad-logo-bar { height: calc(var(--ui-unit) * 27); }
    .topbar-text-group, .topbar-sub, .topbar-center { display: none; }
    .topbar-right { gap: calc(var(--ui-unit) * 4); }
    .tab, .btn-back { min-height: calc(var(--ui-unit) * 40); padding: calc(var(--ui-unit) * 6) calc(var(--ui-unit) * 9); font-size: calc(var(--ui-unit) * 12); letter-spacing: .06em; }
    .zoom-controls { right: calc(var(--ui-unit) * 10); top: auto; bottom: calc(var(--ui-unit) * 52); transform: none; flex-direction: row; padding: calc(var(--ui-unit) * 6); gap: calc(var(--ui-unit) * 5); }
    .zoom-track, .zoom-divider, .zoom-pct { display: none; }
    .zoom-btn { width: calc(var(--ui-unit) * 42); height: calc(var(--ui-unit) * 42); }
    .canvas-area { inset: calc(var(--ui-unit) * 54) 0 calc(var(--ui-unit) * 40) 0 !important; }
    .stage { transform: translateY(4%); }
    .chassis-img { width: 112vw; max-width: calc(var(--ui-unit) * 760); }
    .hs-tag { display: none; }
    .popup-overlay { inset: calc(var(--ui-unit) * 54) 0 calc(var(--ui-unit) * 40); padding: calc(var(--ui-unit) * 6); align-items: stretch; }
    .popup-card--redesign { width: 100%; height: 100%; max-height: none; border-radius: calc(var(--ui-unit) * 12); }
    .rd-layout { padding: calc(var(--ui-unit) * 14); }
    .rd-header { padding-right: calc(var(--ui-unit) * 48); }
    .rd-index { font-size: calc(var(--ui-unit) * 39); }
    .rd-title { font-size: calc(var(--ui-unit) * 27); }
    .rd-main { gap: calc(var(--ui-unit) * 12); }
    .rd-specs, .rd-profile { padding: calc(var(--ui-unit) * 12); }
    .rd-main--advantages .rd-specs { padding: calc(var(--ui-unit) * 12); }
    .rd-main--advantages .rd-spec-item { min-height: 0; padding: calc(var(--ui-unit) * 12); }
    .rd-nav { gap: calc(var(--ui-unit) * 6); }
    .rd-nav-btn, .rd-nav-cta { min-height: calc(var(--ui-unit) * 44); padding: calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 9); font-size: calc(var(--ui-unit) * 12); }
    .video-widget { right: calc(var(--ui-unit) * 8); bottom: calc(var(--ui-unit) * 48); }
    .vw-fab { min-height: calc(var(--ui-unit) * 44); padding-right: calc(var(--ui-unit) * 10); }
    .statusbar { height: calc(var(--ui-unit) * 40); padding: 0 calc(var(--ui-unit) * 10); }
    .status-center, .status-left .dim, .status-right .dim { display: none; }
  }
  @media (orientation: portrait) {
    .topbar { height: calc(var(--ui-unit) * 58); padding: 0 calc(var(--ui-unit) * 90) 0 calc(var(--ui-unit) * 10); }
    .topbar-left { gap: calc(var(--ui-unit) * 7); }
    .topbar-text-group, .topbar-sub, .topbar-center { display: none; }
    .trad-logo-bar { height: calc(var(--ui-unit) * 28); }
    .topbar-right { gap: calc(var(--ui-unit) * 4); }
    .tab { min-height: calc(var(--ui-unit) * 40); padding: calc(var(--ui-unit) * 6) calc(var(--ui-unit) * 9); font-size: calc(var(--ui-unit) * 12); }

    .left-sidebar {
      display: flex;
      left: 0;
      top: calc(var(--ui-unit) * 58);
      right: 0;
      bottom: auto;
      width: 100%;
      height: calc(var(--ui-unit) * 204);
      flex-direction: column;
      border-right: 0;
      border-bottom: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.22);
      box-shadow: 0 calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 22) rgba(0,0,0,0.35);
    }
    .left-sidebar.hidden { transform: translateY(-100%); }
    .sidebar-header {
      flex: 0 0 calc(var(--ui-unit) * 25);
      gap: calc(var(--ui-unit) * 6);
      padding: calc(var(--ui-unit) * 5) calc(var(--ui-unit) * 12) calc(var(--ui-unit) * 3);
      border-bottom: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.12);
    }
    .sidebar-dot { width: calc(var(--ui-unit) * 5); height: calc(var(--ui-unit) * 5); }
    .sidebar-title { font-size: calc(var(--ui-unit) * 12); letter-spacing: .14em; }
    .sidebar-list {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-template-rows: repeat(5, calc(var(--ui-unit) * 30));
      grid-auto-flow: row;
      width: 100%;
      flex: 1;
      overflow-x: hidden;
      overflow-y: hidden;
      padding: calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 8) calc(var(--ui-unit) * 5);
      gap: calc(var(--ui-unit) * 5);
      scrollbar-width: thin;
    }
    .sidebar-list::-webkit-scrollbar { height: calc(var(--ui-unit) * 3); width: auto; }
    .sidebar-item {
      width: 100%;
      min-width: 0;
      min-height: 0;
      height: calc(var(--ui-unit) * 30);
      align-items: center;
      gap: calc(var(--ui-unit) * 5);
      padding: calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 6);
      border-left: 0;
      border-bottom: calc(var(--ui-unit) * 2) solid transparent;
      border-radius: calc(var(--ui-unit) * 4);
      background: rgba(10,18,32,0.45);
    }
    .sidebar-item--active { border-left: 0; border-bottom-color: #3399FF; }
    .sidebar-num { width: auto; padding-top: 0; font-size: calc(var(--ui-unit) * 12); }
    .sidebar-name { max-width: 100%; white-space: normal; font-size: calc(var(--ui-unit) * 12); line-height: 1.05; }
    .sidebar-brands { display: none; }
    .canvas-area { inset: calc(var(--ui-unit) * 262) 0 calc(var(--ui-unit) * 42) 0 !important; }
    .zoom-controls { right: calc(var(--ui-unit) * 14); top: auto; bottom: calc(var(--ui-unit) * 54); transform: none; flex-direction: row; padding: calc(var(--ui-unit) * 6); gap: calc(var(--ui-unit) * 5); }
    .zoom-track, .zoom-divider, .zoom-pct { display: none; }
    .zoom-btn { width: calc(var(--ui-unit) * 42); height: calc(var(--ui-unit) * 42); }
    .stage { transform: translateY(3%); }
    .chassis-img { width: 88vw; max-width: calc(var(--ui-unit) * 900); }
    .hud-tl, .hud-tr { top: calc(var(--ui-unit) * 170); }
    .hud-tl, .hud-bl { left: calc(var(--ui-unit) * 8); }
    .hud-tr, .hud-br { right: calc(var(--ui-unit) * 8); }
    .hud-bl, .hud-br { bottom: calc(var(--ui-unit) * 50); }
    .hotspot { width: calc(var(--ui-unit) * 30); height: calc(var(--ui-unit) * 30); }
    .hs-p1, .hs-p2 { width: calc(var(--ui-unit) * 26); height: calc(var(--ui-unit) * 26); }
    .hs-core { width: calc(var(--ui-unit) * 18); height: calc(var(--ui-unit) * 18); }
    .hs-num { font-size: calc(var(--ui-unit) * 12); }
    .part-choice-overlay {
      position: absolute;
      inset: calc(var(--ui-unit) * 226) 0 calc(var(--ui-unit) * 42);
      z-index: 45;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(3,6,14,0.42);
      backdrop-filter: blur(calc(var(--ui-unit) * 4));
    }
    .part-choice-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(var(--ui-unit) * 7);
      min-width: calc(var(--ui-unit) * 170);
      padding: calc(var(--ui-unit) * 16) calc(var(--ui-unit) * 22) calc(var(--ui-unit) * 18);
      border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,0.4);
      border-radius: calc(var(--ui-unit) * 10);
      background: rgba(5,12,26,0.94);
      box-shadow: 0 calc(var(--ui-unit) * 10) calc(var(--ui-unit) * 34) rgba(0,0,0,0.55), 0 0 calc(var(--ui-unit) * 24) rgba(0,100,230,0.18);
    }
    .part-choice-title { color: #8FCBFF; font-size: calc(var(--ui-unit) * 12); font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .part-choice-sub { color: rgba(190,215,245,.6); font-size: calc(var(--ui-unit) * 12); letter-spacing: .12em; }
    .part-choice-buttons { display: flex; gap: calc(var(--ui-unit) * 10); margin-top: calc(var(--ui-unit) * 4); }
    .part-choice-btn { min-width: calc(var(--ui-unit) * 52); min-height: calc(var(--ui-unit) * 42); border: calc(var(--ui-unit) * 1) solid rgba(80,160,255,.4); border-radius: calc(var(--ui-unit) * 5); background: #0066E6; color: #fff; font-size: calc(var(--ui-unit) * 16); font-weight: 800; }
    .part-choice-btn:hover { background: #1685ff; }
    .part-choice-close { position: absolute; top: calc(var(--ui-unit) * 5); right: calc(var(--ui-unit) * 7); border: 0; background: transparent; color: rgba(210,228,255,.7); font-size: calc(var(--ui-unit) * 23); line-height: 1; }
    .hs-tag { display: none; }
    .statusbar { height: calc(var(--ui-unit) * 42); padding: 0 calc(var(--ui-unit) * 14); }
    .status-center, .status-left .dim, .status-right .dim { display: none; }

    .popup-overlay { inset: calc(var(--ui-unit) * 58) 0 calc(var(--ui-unit) * 42); padding: calc(var(--ui-unit) * 6); align-items: stretch; }
    .popup-card--redesign { width: 100%; height: 100%; max-height: none; border-radius: calc(var(--ui-unit) * 12); }
    .rd-layout { padding: calc(var(--ui-unit) * 12); overflow-y: auto; }
    .rd-header { margin-bottom: calc(var(--ui-unit) * 8); }
    .rd-index { font-size: calc(var(--ui-unit) * 39); }
    .rd-eyebrow { font-size: calc(var(--ui-unit) * 12); }
    .rd-title { font-size: calc(var(--ui-unit) * 26); }
    .rd-tabs { margin-bottom: calc(var(--ui-unit) * 10); padding: calc(var(--ui-unit) * 6); gap: calc(var(--ui-unit) * 4); }
    .rd-tab { min-height: calc(var(--ui-unit) * 34); padding: calc(var(--ui-unit) * 6) calc(var(--ui-unit) * 8); font-size: calc(var(--ui-unit) * 12); }
    .rd-main { flex-direction: column; gap: calc(var(--ui-unit) * 8); padding-right: 0; overflow: visible; }
    .rd-main--highlights {
      display: block;
      flex: 0 0 auto;
      min-height: 0;
      margin-bottom: calc(var(--ui-unit) * 10);
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
      padding: 0 calc(var(--ui-unit) * 2) calc(var(--ui-unit) * 10);
    }
    .rd-main--highlights .rd-features-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: calc(var(--ui-unit) * 12) calc(var(--ui-unit) * 8);
      overflow: visible;
    }
    .rd-main--highlights .rd-feature {
      width: auto;
      min-width: 0;
      gap: calc(var(--ui-unit) * 5);
    }
    .rd-main--highlights .rd-feature-label {
      font-size: calc(var(--ui-unit) * 12);
      line-height: 1.25;
    }
    .rd-main--brand {
      display: block;
      flex: 0 0 auto;
      min-height: 0;
      margin-bottom: calc(var(--ui-unit) * 10);
      overflow: visible;
    }
    .rd-main--brand .rd-stage { display: none; }
    .rd-main--brand .rd-profile {
      position: static;
      display: flex;
      width: 100%;
      max-height: none;
      overflow: visible;
      padding: 0 calc(var(--ui-unit) * 2);
      gap: calc(var(--ui-unit) * 14);
    }
    .rd-main--brand .rd-profile-card {
      padding: calc(var(--ui-unit) * 14);
      border-radius: calc(var(--ui-unit) * 12);
    }
    .rd-main--brand .rd-profile-card-header { margin-bottom: calc(var(--ui-unit) * 12); }
    .rd-main--brand .rd-profile-brand-row { margin-bottom: calc(var(--ui-unit) * 12); }
    .rd-main--brand .rd-profile-facts { gap: calc(var(--ui-unit) * 12); }
    .rd-main--brand .rd-section { padding: 0 calc(var(--ui-unit) * 2); }
    .rd-main--brand .rd-section .rd-panel-title { margin-bottom: calc(var(--ui-unit) * 9); padding-bottom: calc(var(--ui-unit) * 7); }
    .rd-main--brand .rd-oem-list { gap: calc(var(--ui-unit) * 8); }
    .rd-main--brand .rd-icon-slot--oem { width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44); }
    .rd-main--brand .rd-spec-block-text { font-size: calc(var(--ui-unit) * 14); line-height: 1.4; }
    .rd-main--brand .rd-timeline { gap: calc(var(--ui-unit) * 6); }
    .rd-main--brand .rd-timeline-label { font-size: calc(var(--ui-unit) * 12); }
    .rd-stage { order: -1; width: 100%; }
    .rd-stage-visual { width: 100%; height: calc(var(--ui-unit) * 230); min-height: calc(var(--ui-unit) * 230); max-height: calc(var(--ui-unit) * 230); aspect-ratio: auto; }
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
    .rd-specs, .rd-profile { width: 100%; position: static; max-height: none; overflow: visible; padding: calc(var(--ui-unit) * 12); }
    .rd-features { margin-bottom: 0; }
    .rd-features-row { flex-wrap: wrap; justify-content: center; gap: calc(var(--ui-unit) * 18) calc(var(--ui-unit) * 10); overflow: visible; padding-bottom: calc(var(--ui-unit) * 4); }
    .rd-feature { flex: 0 0 calc(var(--ui-unit) * 145); width: calc(var(--ui-unit) * 145); gap: calc(var(--ui-unit) * 8); }
    .rd-feature .rd-icon-slot--lg { width: calc(var(--ui-unit) * 64); height: calc(var(--ui-unit) * 64); border-radius: calc(var(--ui-unit) * 16); }
    .rd-feature-label { font-size: calc(var(--ui-unit) * 12); line-height: 1.3; }
    .rd-nav { gap: calc(var(--ui-unit) * 5); }
    .rd-nav-btn, .rd-nav-cta { min-height: calc(var(--ui-unit) * 42); padding: calc(var(--ui-unit) * 9) calc(var(--ui-unit) * 8); font-size: calc(var(--ui-unit) * 12); }
    .rd-main--brand + .rd-nav {
      position: relative;
      z-index: 3;
      margin-top: 0;
      padding-top: calc(var(--ui-unit) * 4);
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
    .rd-layout { padding-top: calc(var(--ui-unit) * 14); padding-bottom: calc(var(--ui-unit) * 10); }
    .rd-brand-select, .rd-header { margin-bottom: calc(var(--ui-unit) * 8); }
    .rd-main { flex: 1 1 auto; min-height: 0; margin-bottom: calc(var(--ui-unit) * 8); overflow: hidden; }
    .rd-specs, .rd-profile { height: 100%; overflow-y: auto; max-height: 100%; }
    .rd-specs { padding: calc(var(--ui-unit) * 14); }
    .rd-specs-list { gap: calc(var(--ui-unit) * 10); }
    .rd-stage { justify-content: flex-start; }
    .rd-stage-visual { width: 100%; height: calc(var(--ui-unit) * 220); min-height: calc(var(--ui-unit) * 220); max-height: calc(var(--ui-unit) * 220); aspect-ratio: auto; }
  }
  @media (max-height: 720px) and (min-width: 861px) {
    .rd-features { margin-bottom: calc(var(--ui-unit) * 4); }
    .rd-features-label { margin-bottom: calc(var(--ui-unit) * 12); }
    .rd-feature { width: calc(var(--ui-unit) * 145); }
    .rd-feature .rd-icon-slot--lg { width: calc(var(--ui-unit) * 64); height: calc(var(--ui-unit) * 64); border-radius: calc(var(--ui-unit) * 16); }
    .rd-feature-label { font-size: calc(var(--ui-unit) * 12); line-height: 1.25; }
    .rd-feature-connector { display: none; }
    .rd-stage-visual { height: calc(var(--ui-unit) * 180); min-height: calc(var(--ui-unit) * 180); max-height: calc(var(--ui-unit) * 180); }
  }
  @media (min-width: 861px) and (max-height: 800px) {
    .rd-layout { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto auto; overflow-y: auto; }
    .rd-main { display: grid; grid-template-columns: minmax(calc(var(--ui-unit) * 220), 27%) minmax(0, 1fr) 31%; gap: calc(var(--ui-unit) * 14); padding-right: 0; align-items: stretch; overflow: visible; }
    .rd-specs { width: auto; max-height: 100%; overflow-y: auto; }
    .rd-stage { min-width: 0; min-height: 0; justify-content: flex-start; overflow: visible; }
    .rd-profile { position: static; width: auto; max-height: 100%; overflow-y: auto; }
    .rd-features { transform: translateY(calc(var(--ui-unit) * -24)); }
    .rd-features-row { flex-wrap: nowrap; gap: calc(var(--ui-unit) * 12); }
    .rd-feature { width: auto; flex: 1 1 0; min-width: 0; }
    .rd-feature-label { font-size: calc(var(--ui-unit) * 12); }
    .rd-feature .rd-icon-slot--lg { width: calc(var(--ui-unit) * 64); height: calc(var(--ui-unit) * 64); border-radius: calc(var(--ui-unit) * 16); }
    .rd-feature-connector { display: none; }
    .rd-stage-visual { flex: 1 1 auto; width: 100%; height: auto; min-height: calc(var(--ui-unit) * 150); max-height: 100%; aspect-ratio: auto; }
    .rd-stage-model { transform: translateY(calc(var(--ui-unit) * -42)) scale(2.2); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bg-scan, .hs-pulse, .speed-line, .bg-radial, .img-halo, .cursor-svg,
    .bg-logo-img, .bg-logo-ring-1, .bg-logo-ring-2, .bg-photo,
    .hero-glow, .hero-glow--orange, .img-float, .img-ring--1, .img-ring--2,
    .rd-pedestal-glow, .rd-stage-img, .rd-orbit-dot, .rd-stage-ring--1, .rd-stage-ring--2,
    .vw-trust-track { animation: none !important; }
  }
  
/* Larger kiosk controls, including the compact portrait layout. */
.topbar .tab, .topbar .btn-back {
  min-height: calc(var(--ui-unit) * 44);
  font-size: calc(var(--ui-unit) * 12);
  padding: calc(var(--ui-unit) * 8) calc(var(--ui-unit) * 12);
  letter-spacing: .04em;
}

.sidebar-num { color: #8FCBFF; }
.hotspot { width: calc(var(--ui-unit) * 44); height: calc(var(--ui-unit) * 44); }
.hs-core {
  width: auto;
  min-width: calc(var(--ui-unit) * 32);
  height: calc(var(--ui-unit) * 32);
  padding: 0 calc(var(--ui-unit) * 4);
}
.hs-p1, .hs-p2 { width: calc(var(--ui-unit) * 40); height: calc(var(--ui-unit) * 40); }
.hs-num { font-size: calc(var(--ui-unit) * 12); }
.zoom-btn { width: calc(var(--ui-unit) * 54); height: calc(var(--ui-unit) * 54); }
.zoom-btn svg { width: calc(var(--ui-unit) * 22); height: calc(var(--ui-unit) * 22); }
.rd-tab, .rd-nav-btn, .rd-nav-cta, .part-choice-btn {
  min-height: calc(var(--ui-unit) * 48);
  font-size: calc(var(--ui-unit) * 14);
}
.rd-tabs, .rd-nav { flex-wrap: wrap; }
@media (orientation: portrait) {
  .left-sidebar { height: calc(var(--ui-unit) * 350); }
  .sidebar-header { flex-basis: calc(var(--ui-unit) * 32); }
  .sidebar-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(7, calc(var(--ui-unit) * 40));
    overflow-y: auto;
  }
  .sidebar-item {
    height: calc(var(--ui-unit) * 40);
    gap: calc(var(--ui-unit) * 7);
    padding: calc(var(--ui-unit) * 4) calc(var(--ui-unit) * 7);
  }
  .sidebar-name { font-size: calc(var(--ui-unit) * 12); line-height: 1.2; }
  .sidebar-num { font-size: calc(var(--ui-unit) * 15); }
  .canvas-area { inset: calc(var(--ui-unit) * 408) 0 calc(var(--ui-unit) * 42) 0 !important; }
  .part-choice-overlay { top: calc(var(--ui-unit) * 408); }
}

/* Reserve real layout space for the company profile controls. */
.popup-card--redesign .rd-layout { display: flex; flex-direction: column; overflow-y: auto; }
.rd-layout > .video-widget {
  position: relative; inset: auto; display: flex; justify-content: flex-end;
  flex: 0 0 auto; width: 100%; margin: calc(var(--ui-unit) * 10) 0;
}
.rd-layout .video-widget-card { max-width: 100%; }
.rd-main.rd-main--model {
  display: flex; flex: 1 0 calc(var(--ui-unit) * 340);
  min-height: calc(var(--ui-unit) * 340); padding: 0; overflow: hidden;
}
.rd-main--model .rd-stage { width: 100%; min-height: 0; align-self: stretch; }
.rd-main--model .rd-stage-visual {
  flex: 1; width: 100%; height: 100%; min-height: calc(var(--ui-unit) * 340);
  max-width: none; max-height: none; aspect-ratio: auto;
}
.rd-main--model .rd-stage-visual > .rd-stage-model {
  position: absolute; inset: 0; width: 100%; height: 100%;
  max-width: none; max-height: none; transform: none;
}
.rd-main--model .rd-stage-visual > img { max-width: 90%; max-height: 90%; }
.rd-main.rd-main--products { display: block; padding: 0; overflow-y: auto; }
.rd-products { width: 100%; padding: calc(var(--ui-unit) * 12); }
.rd-products-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(var(--ui-unit) * 12); }
.rd-product {
  display: flex; align-items: center; gap: calc(var(--ui-unit) * 10);
  min-height: calc(var(--ui-unit) * 64); padding: calc(var(--ui-unit) * 14);
  border: calc(var(--ui-unit) * 1) solid #28527c; border-radius: calc(var(--ui-unit) * 8);
  background: #0a192c; color: #edf6ff; text-align: left; font-size: calc(var(--ui-unit) * 16);
}
.rd-product:hover, .rd-product:focus-visible { background: #103860; outline: calc(var(--ui-unit) * 2) solid #58aeff; }
.rd-product-number { color: #7fc0ff; font-weight: 800; }
@media (orientation: portrait) {
  .sidebar-list { grid-template-rows: none; grid-auto-rows: calc(var(--ui-unit) * 40); align-content: start; }
  .left-sidebar { height: calc(var(--ui-unit) * 260); }
  .canvas-area { top: calc(var(--ui-unit) * 318) !important; }
  .part-choice-overlay { top: calc(var(--ui-unit) * 318); }
}

.sidebar-brand-label { display: inline-block; margin-left: calc(6 * var(--ui-unit)); font-size: calc(9 * var(--ui-unit)); color: #7fc0ff; }
.catalog-brand-logo { max-width: calc(160 * var(--ui-unit)); max-height: calc(60 * var(--ui-unit)); object-fit: contain; }
.rd-product--catalog { cursor: default; }
.rd-product--catalog:hover { background: #0a192c; outline: none; }
@media (orientation: portrait) {
  .left-sidebar { height: calc(320 * var(--ui-unit)); }
  .canvas-area { top: calc(378 * var(--ui-unit)) !important; }
  .part-choice-overlay { top: calc(378 * var(--ui-unit)); }
}

.catalog-brand-logo { padding: calc(8 * var(--ui-unit)); background: white; border-radius: calc(6 * var(--ui-unit)); }
.rd-main--model .rd-stage-visual--brand > img { width: 80%; height: auto; max-height: 80%; padding: calc(24 * var(--ui-unit)); background: white; border-radius: calc(12 * var(--ui-unit)); animation: none; filter: none; }

.rd-header.rd-header--brand {
  align-items: center; gap: calc(12 * var(--ui-unit)); padding-right: calc(48 * var(--ui-unit));
}
.rd-header--brand .catalog-brand-logo {
  width: calc(72 * var(--ui-unit)); height: calc(54 * var(--ui-unit));
  flex-shrink: 0; object-fit: contain;
}
.rd-header--brand .rd-header-text { min-width: 0; padding-top: 0; }
.rd-header--brand .rd-title { overflow-wrap: anywhere; }

/* Fit advantage cards to the available panel width, including portrait kiosks. */
.rd-main--advantages .rd-specs-list {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, max(240px, calc(var(--ui-unit) * 280))), 1fr));
}
.rd-main--advantages .rd-spec-item { min-width: 0; }
.rd-main--advantages .rd-spec-text { min-width: 0; overflow-wrap: anywhere; }
.rd-main--advantages .rd-spec-item .rd-icon-slot { flex-shrink: 0; }
@media (orientation: portrait), (max-width: 600px) {
  .rd-main.rd-main--advantages { flex: 0 0 auto; overflow: visible; }
  .rd-main--advantages .rd-specs-list { grid-template-columns: minmax(0, 1fr); }
  .rd-main--advantages .rd-spec-item { min-height: 0; }
}

/* Preserve the full video frame; the outer detail panel handles scrolling. */
.rd-layout .video-widget-card {
  display: flex;
  flex-direction: column;
  width: min(100%, max(300px, calc(var(--ui-unit) * 380)));
  max-height: none;
  overflow: hidden;
}
.vw-card-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 44px;
  flex: 0 0 auto;
  gap: 8px;
  padding: 10px;
}
.vw-label { min-width: 0; white-space: normal; overflow-wrap: anywhere; line-height: 1.4; }
.vw-card-header .vw-stats { display: none; }
.vw-card-header .vw-close-btn { width: 44px; height: 44px; min-width: 44px; }
.vw-close-btn:focus-visible { outline: 2px solid #58aeff; outline-offset: 2px; }
.video-widget-body { flex: 0 0 auto; min-height: 0; overflow: visible; }
.vw-video-wrap { aspect-ratio: 16 / 9; padding-top: 0; }
</style>
 