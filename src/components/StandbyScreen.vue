<template>
  <div class="standby" @click="$emit('start')">

    <div class="bg-photo"></div>
    <div class="bg-overlay"></div>
    <div class="bg-vignette"></div>

    <div class="speed-lines">
      <div v-for="i in 18" :key="i" class="speed-line" :style="speedLineStyle(i)"></div>
    </div>

    <div class="hero-glow"></div>
    <div class="hero-glow hero-glow--2"></div>
    <div class="hero-glow hero-glow--orange"></div>

    <div class="grid-bg"></div>

    <div class="hud-corner hud-tl"><div class="hud-h"></div><div class="hud-v"></div></div>
    <div class="hud-corner hud-tr"><div class="hud-h"></div><div class="hud-v"></div></div>
    <div class="hud-corner hud-bl"><div class="hud-h"></div><div class="hud-v"></div></div>
    <div class="hud-corner hud-br"><div class="hud-h"></div><div class="hud-v"></div></div>

    <div class="h-accent h-accent--top"></div>
    <div class="h-accent h-accent--bottom"></div>

    <div class="scan-dot scan-dot--top"></div>
    <div class="scan-dot scan-dot--bottom"></div>

    <div class="topbar">
      <div class="topbar-left">
        <img src="/images/TRAD Logo.png" alt="TRAD" class="trad-logo-top" />
        <div class="topbar-div"></div>
        <div class="topbar-text-group">
          <span class="topbar-title">{{ t('digital_showcase') }}</span>
          <span class="topbar-subtitle">PT TIMUR RAYA ANUGERAH DAMAI</span>
        </div>
      </div>
      <div class="topbar-right">
        <div class="topbar-stat">
          <span class="topbar-stat-val">2026</span>
          <span class="topbar-stat-lbl">AUTOMECHANIKA</span>
        </div>
        <div class="topbar-div"></div>
        <div class="live-badge">
          <div class="live-dot"></div>
          <span class="live-label">{{ t('live_demo') }}</span>
        </div>
      </div>
    </div>

    <div class="content">

      <div class="logo-hero">
        <div class="logo-glow-ring"></div>
        <img src="/images/TRAD Logo.png" alt="TRAD" class="trad-logo-hero" />
        <div class="logo-rule">
          <div class="logo-rule-line"></div>
          <span class="logo-rule-text">{{ t('spare_parts_distributor') }}</span>
          <div class="logo-rule-line"></div>
        </div>
      </div>

      <p class="eyebrow">
        <span class="eyebrow-line"></span>
        {{ t('eyebrow_360') }}
        <span class="eyebrow-line"></span>
      </p>

      <h1 class="headline">
        <span class="line-1">{{ t('headline_line1') }}</span>
        <span class="line-2">{{ t('headline_line2') }}<span class="dot-accent">.</span></span>
      </h1>

      <p class="subtext">{{ t('subtext') }}</p>

      <div class="pills">
        <div class="pill pill--1"><span class="pill-dot"></span>{{ t('pill_rotate') }}</div>
        <div class="pill pill--2"><span class="pill-dot"></span>{{ t('pill_hotspot') }}</div>
        <div class="pill pill--3"><span class="pill-dot pill-dot--orange"></span>{{ t('pill_chassis') }}</div>
      </div>

      <div class="cta-area">
        <div class="cta-orbit">
          <svg class="orbit-svg orbit-outer" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="72" stroke="rgba(80,160,255,0.28)" stroke-width="1" stroke-dasharray="6 5"/>
          </svg>
          <svg class="orbit-svg orbit-inner" viewBox="0 0 160 160" fill="none">
            <circle cx="80" cy="80" r="58" stroke="rgba(80,160,255,0.16)" stroke-width="1"/>
            <circle cx="80" cy="80" r="58" stroke="url(#arcG)" stroke-width="2.5"
              stroke-dasharray="220 145" stroke-dashoffset="0" stroke-linecap="round"/>
            <defs>
              <linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0044BB" stop-opacity="0"/>
                <stop offset="50%" stop-color="#0099FF"/>
                <stop offset="100%" stop-color="#FF5A1F" stop-opacity="0"/>
              </linearGradient>
            </defs>
          </svg>
          <button class="cta-btn">
            <div class="cta-ripple"></div>
            <svg class="play-icon" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
              <polygon points="15,11 27,18 15,25" fill="white"/>
            </svg>
            <span class="cta-label" v-html="t('cta_label')"></span>
          </button>
        </div>
        <p class="cta-hint">{{ t('cta_hint') }}</p>
      </div>

    </div>

    <div class="side-panel">
      <div class="side-item">
        <span class="side-val">16</span>
        <span class="side-lbl">{{ t('side_hotspots') }}</span>
      </div>
      <div class="side-sep"></div>
      <div class="side-item">
        <span class="side-val">360°</span>
        <span class="side-lbl">{{ t('side_rotation') }}</span>
      </div>
      <div class="side-sep"></div>
      <div class="side-item">
        <span class="side-val side-val--orange">3D</span>
        <span class="side-lbl">{{ t('side_chassis') }}</span>
      </div>
    </div>

    <div class="bottombar">
      <div class="bottom-l">
        <img src="/images/TRAD Logo.png" alt="TRAD" class="bottom-logo" />
        <div class="bottom-text-group">
          <span class="bottom-company">PT TIMUR RAYA ANUGERAH DAMAI</span>
          <span class="bottom-tagline">{{ t('bottom_tagline') }}</span>
        </div>
      </div>
      <div class="bottom-c">
        <div class="bottom-event">
          <span class="bottom-event-name">AUTOMECHANIKA</span>
          <span class="bottom-event-year">2026</span>
        </div>
        <div class="bottom-sep-v"></div>
        <span class="bottom-location">{{ t('bottom_location') }}</span>
      </div>
      <div class="bottom-r">
        <div class="bottom-dots">
          <span class="bdot"></span>
          <span class="bdot"></span>
          <span class="bdot bdot--active"></span>
        </div>
        <span class="bottom-version">V 2.0</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { t } from '../composables/useLang.js'

defineEmits(['start'])

function speedLineStyle(i) {
  const top     = 5 + (i * 5.2) % 90
  const w       = 60 + (i * 37) % 140
  const delay   = (i * 0.31) % 4
  const dur     = 2.5 + (i * 0.19) % 2.2
  const opacity = 0.1 + (i % 5) * 0.05
  return {
    top: top + '%',
    width: w + 'px',
    animationDelay: delay + 's',
    animationDuration: dur + 's',
    opacity,
  }
}
</script>

<style scoped>

.standby {
  position: absolute; inset: 0;
  background: #05070D;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; user-select: none;
  overflow: hidden; z-index: 10;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

.bg-photo {
  position: absolute; inset: 0;
  background-image: url('/images/background/bg_stanby.png');
  background-size: cover;
  background-position: center;
  z-index: 0;
  animation: bg-drift 22s ease-in-out infinite alternate;
}
@keyframes bg-drift {
  from { transform: scale(1.04) translate(0, 0); }
  to   { transform: scale(1.1) translate(-1%, -1%); }
}
.bg-overlay {
  position: absolute; inset: 0; z-index: 0;
  background:
    linear-gradient(180deg, rgba(3,6,14,0.88) 0%, rgba(4,8,18,0.72) 22%, rgba(4,8,18,0.75) 78%, rgba(3,6,14,0.92) 100%),
    linear-gradient(100deg, rgba(2,5,12,0.55) 0%, rgba(2,5,12,0.15) 45%, rgba(2,5,12,0.55) 100%);
}
.bg-vignette {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(ellipse 75% 75% at 50% 45%, transparent 40%, rgba(1,3,8,0.55) 100%);
}

.speed-lines { position: absolute; inset: 0; pointer-events: none; z-index: 3; }
.speed-line {
  position: absolute; left: -180px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(90,180,255,0.9), transparent);
  animation: rush linear infinite;
}
@keyframes rush {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(100vw + 240px)); }
}

.hero-glow {
  position: absolute;
  width: 800px; height: 500px;
  background: radial-gradient(ellipse at center,
    rgba(0,120,255,0.16) 0%, rgba(0,150,255,0.07) 45%, transparent 70%);
  pointer-events: none; z-index: 3;
  animation: glow-pulse 4s ease-in-out infinite;
}
.hero-glow--2 {
  width: 1100px; height: 700px;
  background: radial-gradient(ellipse at center,
    rgba(0,90,230,0.08) 0%, transparent 60%);
  animation-delay: 2s;
}
.hero-glow--orange {
  width: 600px; height: 380px;
  left: 50%; bottom: -120px; transform: translateX(-50%);
  background: radial-gradient(ellipse at center,
    rgba(255,90,31,0.1) 0%, transparent 70%);
  animation: glow-pulse 5s 1s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.7; transform: scale(0.97); }
  50%       { opacity: 1;   transform: scale(1.03); }
}

.grid-bg {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(80,160,255,0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,160,255,0.09) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 70% 75% at 50% 50%, black, transparent 80%);
  pointer-events: none; z-index: 3;
}

.hud-corner {
  position: absolute; width: 44px; height: 44px;
  pointer-events: none; z-index: 10;
}
.hud-tl { top: 82px;  left: 20px;  }
.hud-tr { top: 82px;  right: 20px; }
.hud-bl { bottom: 70px; left: 20px;  }
.hud-br { bottom: 70px; right: 20px; }

.hud-h {
  position: absolute; top: 0; left: 0;
  height: 2px; background: #3399FF;
  box-shadow: 0 0 8px rgba(51,153,255,0.7);
  animation: draw-h 0.6s 0.4s ease both;
}
.hud-v {
  position: absolute; top: 0; left: 0;
  width: 2px; background: #3399FF;
  box-shadow: 0 0 8px rgba(51,153,255,0.7);
  animation: draw-v 0.6s 0.4s ease both;
}
.hud-tr .hud-h { left: auto; right: 0; }
.hud-tr .hud-v { left: auto; right: 0; }
.hud-bl .hud-h { top: auto; bottom: 0; }
.hud-bl .hud-v { top: auto; bottom: 0; }
.hud-br .hud-h { top: auto; bottom: 0; left: auto; right: 0; }
.hud-br .hud-v { top: auto; bottom: 0; left: auto; right: 0; }

@keyframes draw-h {
  from { width: 0; opacity: 0; }
  to   { width: 28px; opacity: 1; }
}
@keyframes draw-v {
  from { height: 0; opacity: 0; }
  to   { height: 28px; opacity: 1; }
}

.h-accent {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(60,150,255,0.3) 15%,
    rgba(60,150,255,0.5) 50%,
    rgba(60,150,255,0.3) 85%,
    transparent 100%);
  pointer-events: none; z-index: 5;
}
.h-accent--top    { top: 72px;  animation: fade-in 0.8s 0.3s ease both; }
.h-accent--bottom { bottom: 60px; animation: fade-in 0.8s 0.3s ease both; }

.scan-dot {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #3399FF;
  box-shadow: 0 0 10px 3px rgba(51,153,255,0.7);
  pointer-events: none; z-index: 6;
  animation: scan-ride 5s linear infinite;
}
.scan-dot--top    { top: 70px;   }
.scan-dot--bottom { bottom: 58px; animation-delay: 2.5s; }
@keyframes scan-ride {
  0%   { left: -10px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { left: calc(100% + 10px); opacity: 0; }
}

.topbar {
  position: absolute; top: 0; left: 0; right: 0;
  height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 130px 0 36px;
  background: rgba(6,10,20,0.72);
  backdrop-filter: blur(16px);
  border-bottom: 1.5px solid rgba(60,150,255,0.22);
  z-index: 20;
  box-shadow: 0 2px 24px rgba(0,0,0,0.4);
}
.topbar-left { display: flex; align-items: center; gap: 18px; flex-shrink: 0; }

.trad-logo-top {
  height: 44px; width: auto;
  object-fit: contain; display: block;
  flex-shrink: 0;
  filter: drop-shadow(0 0 10px rgba(0,120,255,0.35));
}

.topbar-div { width: 1px; height: 34px; background: rgba(80,160,255,0.25); flex-shrink: 0; }

.topbar-text-group {
  display: flex; flex-direction: column; gap: 2px;
}
.topbar-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #F2F6FF;
  text-transform: uppercase;
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  line-height: 1;
}
.topbar-subtitle {
  font-size: 10px;
  letter-spacing: 0.22em;
  color: rgba(160,200,255,0.6);
  text-transform: uppercase;
}

.topbar-right {
  display: flex; align-items: center; gap: 18px; flex-shrink: 0;
}

.topbar-stat {
  display: flex; flex-direction: column; align-items: flex-end; gap: 1px;
}
.topbar-stat-val {
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  font-size: 26px; font-weight: 800;
  color: #58AEFF; line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: 0 0 16px rgba(0,140,255,0.4);
}
.topbar-stat-lbl {
  font-size: 9px; letter-spacing: 0.22em;
  color: rgba(160,200,255,0.55);
  text-transform: uppercase;
}

.live-badge {
  display: flex; align-items: center; gap: 7px;
  background: rgba(0,119,255,0.1);
  border: 1px solid rgba(60,150,255,0.35);
  border-radius: 24px; padding: 7px 16px;
}
.live-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #3399FF; flex-shrink: 0;
  box-shadow: 0 0 8px rgba(51,153,255,0.8);
  animation: pulse-dot 1.6s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px rgba(51,153,255,0.8); }
  50%       { opacity: 0.5; transform: scale(0.7); box-shadow: 0 0 4px rgba(51,153,255,0.4); }
}
.live-label {
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.18em; color: #7FC0FF;
  text-transform: uppercase;
  white-space: nowrap;
}

.content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column;
  align-items: center; gap: 14px; text-align: center;
}

.logo-hero {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  animation: fade-up 1s 0.2s cubic-bezier(0.16,1,0.3,1) both;
}
.logo-glow-ring {
  position: absolute;
  width: 220px; height: 80px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0,140,255,0.28), transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  animation: glow-pulse 3s ease-in-out infinite;
  pointer-events: none;
}
.trad-logo-hero {
  height: 80px; width: auto; object-fit: contain;
  filter: drop-shadow(0 0 28px rgba(0,140,255,0.4)) drop-shadow(0 6px 24px rgba(0,0,0,0.5));
  position: relative; z-index: 1;
}
.logo-rule {
  display: flex; align-items: center; gap: 12px;
}
.logo-rule-line {
  flex: 1; height: 1px; width: 80px;
  background: linear-gradient(90deg, transparent, rgba(80,160,255,0.55));
}
.logo-rule-line:last-child {
  background: linear-gradient(90deg, rgba(80,160,255,0.55), transparent);
}
.logo-rule-text {
  font-size: 12px; font-weight: 600; letter-spacing: 0.26em;
  color: rgba(200,222,255,0.88); text-transform: uppercase;
  white-space: nowrap;
}

.eyebrow {
  display: flex; align-items: center; gap: 12px;
  font-size: 13px; font-weight: 700; letter-spacing: 0.22em;
  color: #7FC0FF; text-transform: uppercase; margin: 0;
  text-shadow: 0 0 18px rgba(0,140,255,0.5);
  animation: fade-up 1s 0.3s ease both;
}
.eyebrow-line {
  display: block; width: 36px; height: 1px;
  background: rgba(60,150,255,0.6);
}

.headline {
  display: flex; flex-direction: column;
  align-items: center; margin: 0; line-height: 0.88;
}
.line-1 {
  display: block;
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  font-weight: 800; text-transform: uppercase;
  font-size: clamp(72px, 10vw, 140px); letter-spacing: -0.02em;
  background: linear-gradient(100deg, #FFFFFF 0%, #7FC0FF 25%, #FFFFFF 50%, #3399FF 75%, #FFFFFF 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  -webkit-text-fill-color: transparent;
  animation:
    reveal-up 0.9s 0.35s cubic-bezier(0.16,1,0.3,1) both,
    gradient-flow 6s 1.3s ease-in-out infinite,
    glow-pulse-1 6s 1.3s ease-in-out infinite;
}
.line-2 {
  display: block;
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  font-weight: 800; text-transform: uppercase;
  font-size: clamp(72px, 10vw, 140px); letter-spacing: -0.02em;
  background: linear-gradient(100deg, #0055CC 0%, #7FC0FF 25%, #DCEBFF 50%, #58AEFF 75%, #0055CC 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  -webkit-text-fill-color: transparent;
  animation:
    reveal-up 0.9s 0.48s cubic-bezier(0.16,1,0.3,1) both,
    gradient-flow 6s 1.3s ease-in-out infinite,
    glow-pulse-2 6s 1.3s ease-in-out infinite;
}
.dot-accent { color: #FF5A1F; -webkit-text-fill-color: #FF5A1F; }
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(40px) skewY(2deg); }
  to   { opacity: 1; transform: translateY(0) skewY(0); }
}
@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
@keyframes glow-pulse-1 {
  0%, 100% { filter: drop-shadow(0 0 22px rgba(0,140,255,0.3)) drop-shadow(0 0 46px rgba(0,140,255,0.12)); }
  50%       { filter: drop-shadow(0 0 42px rgba(80,180,255,0.65)) drop-shadow(0 0 80px rgba(80,180,255,0.3)); }
}
@keyframes glow-pulse-2 {
  0%, 100% { filter: drop-shadow(0 0 22px rgba(0,120,255,0.35)) drop-shadow(0 0 46px rgba(0,120,255,0.15)); }
  50%       { filter: drop-shadow(0 0 46px rgba(80,180,255,0.75)) drop-shadow(0 0 90px rgba(255,90,31,0.18)); }
}

.subtext {
  font-size: 13px; font-weight: 500; letter-spacing: 0.14em;
  color: rgba(210,228,255,0.8); text-transform: uppercase; margin: 0;
  animation: fade-up 1s 0.6s ease both;
}

.pills {
  display: flex; gap: 8px; flex-wrap: wrap;
  justify-content: center;
}
.pill {
  display: flex; align-items: center; gap: 7px;
  background: rgba(10,18,32,0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(80,160,255,0.28);
  border-radius: 24px; padding: 7px 16px;
  font-size: 11px; letter-spacing: 0.1em; color: #DCEAFF;
  box-shadow: 0 2px 16px rgba(0,0,0,0.35);
  transition: all 0.25s ease;
}
.pill:hover {
  background: rgba(0,119,255,0.14);
  border-color: rgba(60,150,255,0.55);
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(0,80,200,0.25);
}
.pill-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #3399FF; flex-shrink: 0;
  box-shadow: 0 0 6px rgba(51,153,255,0.8);
}
.pill-dot--orange { background: #FF5A1F; box-shadow: 0 0 6px rgba(255,90,31,0.8); }
.pill--1 { animation: fade-up 0.8s 0.62s ease both; }
.pill--2 { animation: fade-up 0.8s 0.72s ease both; }
.pill--3 { animation: fade-up 0.8s 0.82s ease both; }

.cta-area {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  animation: fade-up 1s 0.9s ease both;
}
.cta-orbit {
  position: relative; width: 160px; height: 160px;
  display: flex; align-items: center; justify-content: center;
}
.orbit-svg {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none;
}
.orbit-outer { animation: spin-slow 14s linear infinite; }
.orbit-inner { animation: spin-slow 6s linear infinite reverse; }

@keyframes spin-slow { to { transform: rotate(360deg); } }

.cta-btn {
  position: relative; z-index: 2;
  width: 96px; height: 96px; border-radius: 50%;
  background: linear-gradient(145deg, #0088FF 0%, #0044BB 100%);
  border: none; cursor: pointer;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 5px;
  box-shadow:
    0 6px 36px rgba(0,120,255,0.55),
    0 2px 10px rgba(0,60,180,0.35),
    inset 0 1px 0 rgba(255,255,255,0.25);
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
  overflow: hidden;
}
.standby:hover .cta-btn {
  transform: scale(1.08);
  box-shadow:
    0 12px 54px rgba(0,130,255,0.65),
    0 4px 14px rgba(0,60,180,0.4),
    inset 0 1px 0 rgba(255,255,255,0.3);
}
.cta-ripple {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%);
  animation: ripple-in 2.5s ease-in-out infinite;
}
@keyframes ripple-in {
  0%, 100% { transform: scale(0.7); opacity: 0; }
  50%       { transform: scale(1.2); opacity: 1; }
}
.play-icon { width: 30px; height: 30px; position: relative; z-index: 1; }
.cta-label {
  font-size: 8px; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.95); line-height: 1.5;
  text-align: center; position: relative; z-index: 1;
}
.cta-hint {
  font-size: 9px; letter-spacing: 0.22em;
  color: rgba(140,190,255,0.5); text-transform: uppercase;
  animation: breathe 3s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

.side-panel {
  position: absolute; right: 28px; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 18px;
  z-index: 10;
  background: rgba(8,14,26,0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(80,160,255,0.22);
  border-radius: 14px; padding: 22px 18px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.45);
  animation: fade-left 1s 1s cubic-bezier(0.16,1,0.3,1) both;
}
.side-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.side-val {
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  font-size: 30px; font-weight: 800; color: #58AEFF;
  line-height: 1; letter-spacing: -0.02em;
  text-shadow: 0 0 14px rgba(0,140,255,0.4);
}
.side-val--orange { color: #FF7A47; text-shadow: 0 0 14px rgba(255,90,31,0.4); }
.side-lbl {
  font-size: 8px; letter-spacing: 0.22em;
  color: rgba(160,200,255,0.55); text-transform: uppercase;
}
.side-sep { width: 28px; height: 1px; background: rgba(80,160,255,0.25); }

.bottombar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 36px;
  background: rgba(5,9,18,0.85);
  backdrop-filter: blur(16px);
  border-top: 1.5px solid rgba(80,160,255,0.22);
  z-index: 20;
  box-shadow: 0 -2px 24px rgba(0,0,0,0.4);
}

.bottom-l { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.bottom-logo {
  height: 30px; width: auto; object-fit: contain; opacity: 0.9;
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(0,120,255,0.3));
}
.bottom-text-group { display: flex; flex-direction: column; gap: 1px; }
.bottom-company {
  font-size: 13px; font-weight: 800; letter-spacing: 0.14em;
  color: #F2F6FF; text-transform: uppercase;
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  line-height: 1;
}
.bottom-tagline {
  font-size: 9px; letter-spacing: 0.22em;
  color: rgba(160,200,255,0.55); text-transform: uppercase;
}

.bottom-c {
  display: flex; align-items: center; gap: 14px;
  animation: fade-in 1s 0.6s ease both;
}
.bottom-event { display: flex; flex-direction: column; align-items: center; gap: 0; }
.bottom-event-name {
  font-size: 9px; letter-spacing: 0.25em;
  color: rgba(120,180,255,0.6); text-transform: uppercase;
}
.bottom-event-year {
  font-family: var(--font-display, 'Barlow Condensed', Arial, sans-serif);
  font-size: 26px; font-weight: 800;
  color: #58AEFF; line-height: 1; letter-spacing: -0.02em;
  text-shadow: 0 0 14px rgba(0,140,255,0.35);
}
.bottom-sep-v { width: 1px; height: 28px; background: rgba(80,160,255,0.25); }
.bottom-location {
  font-size: 11px; letter-spacing: 0.2em;
  color: rgba(160,200,255,0.6); text-transform: uppercase;
  white-space: nowrap;
}

.bottom-r {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
.bottom-dots { display: flex; gap: 5px; align-items: center; }
.bdot {
  display: block; width: 5px; height: 5px; border-radius: 50%;
  background: rgba(80,160,255,0.3);
}
.bdot--active {
  background: #3399FF;
  box-shadow: 0 0 8px rgba(51,153,255,0.8);
  animation: pulse-dot 1.8s ease-in-out infinite;
}
.bottom-version {
  font-size: 11px; font-weight: 600; letter-spacing: 0.22em;
  color: rgba(160,200,255,0.5); text-transform: uppercase;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fade-right {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fade-left {
  from { opacity: 0; transform: translate(16px, -50%); }
  to   { opacity: 1; transform: translate(0, -50%); }
}
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .line-1, .line-2 { font-size: clamp(48px, 13vw, 80px); }
  .side-panel { display: none; }
  .bottom-c   { display: none; }
  .trad-logo-hero { height: 56px; }
  .topbar { padding: 0 20px; }
  .topbar-subtitle { display: none; }
}
@media (max-width: 600px) {
  .topbar { height: 58px; padding: 0 64px 0 12px; }
  .topbar-left { min-width: 0; }
  .topbar-text-group, .topbar-stat, .topbar-div { display: none; }
  .content { padding: 0 18px; }
  .trad-logo-hero { width: min(220px, 58vw); height: auto; }
  .headline .line-1, .headline .line-2 { font-size: clamp(48px, 16vw, 88px); }
  .subtext { max-width: 300px; font-size: 10px; text-align: center; line-height: 1.5; }
  .pills { max-width: 320px; }
  .pill { padding: 6px 10px; font-size: 9px; }
  .cta-orbit { width: 136px; height: 136px; }
  .cta-btn { width: 84px; height: 84px; }
  .cta-hint { font-size: 8px; text-align: center; }
  .side-panel { display: none; }
  .bottombar { height: 48px; padding: 0 12px; }
  .bottom-logo { height: 23px; }
  .bottom-company { font-size: 8px; }
  .bottom-tagline { display: none; }
}
</style>