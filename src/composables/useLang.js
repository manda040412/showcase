import { ref } from 'vue'

// ─────────────────────────────────────────────────────────────
// Global, app-wide language state (singleton — shared by every
// component that imports this file).
// 'id' = Bahasa Indonesia (default), 'en' = English
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'trad-lang'

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'id' || saved === 'en') return saved
  } catch (e) { /* ignore (e.g. privacy mode) */ }
  return 'id'
}

export const lang = ref(getInitialLang())

export function setLang(l) {
  if (l !== 'id' && l !== 'en') return
  lang.value = l
  try { localStorage.setItem(STORAGE_KEY, l) } catch (e) { /* ignore */ }
}

export function toggleLang() {
  setLang(lang.value === 'id' ? 'en' : 'id')
}

// ─────────────────────────────────────────────────────────────
// Dictionary
// NOTE: spare-part names, brand names, and the company name are
// intentionally NOT in this dictionary — they always stay in
// English / as-is, per product requirement.
// ─────────────────────────────────────────────────────────────
const dict = {
  id: {
    // global
    lang_switch_to: 'EN',

    // StandbyScreen
    digital_showcase: 'PAMERAN DIGITAL',
    live_demo: 'DEMO LANGSUNG',
    spare_parts_distributor: 'DISTRIBUTOR SPARE PART',
    eyebrow_360: 'TAMPILAN KENDARAAN 360° DIGITAL',
    headline_line1: 'RASAKAN',
    headline_line2: 'MASA DEPAN',
    subtext: 'Eksplorasi 3D Interaktif · Spare Part Suspensi Toyota',
    pill_rotate: '360° Putar',
    pill_hotspot: 'Titik Komponen',
    pill_chassis: 'Tampilan Chassis 3D',
    cta_label: 'SENTUH UNTUK<br>MULAI',
    cta_hint: '— Sentuh di mana saja pada layar —',
    side_hotspots: 'TITIK KOMPONEN',
    side_rotation: 'ROTASI',
    side_chassis: 'CHASSIS',
    bottom_tagline: 'DISTRIBUTOR SPARE PART ASLI TOYOTA',
    bottom_location: 'JAKARTA, INDONESIA',

    // CarViewer
    loading_model: 'MEMUAT MODEL 3D',
    exterior_360: 'EKSTERIOR — 360°',
    tab_exterior: 'EKSTERIOR',
    tab_chassis: 'CHASSIS',
    btn_back: '← KEMBALI',
    spark_badge: 'INTERAKTIF 360°',
    spark_headline_1: 'Intip Jeroan',
    spark_headline_2: 'Chassis-nya',
    spark_text_pre: 'Tekan',
    spark_text_highlight: 'DETAIL PART',
    spark_text_post: 'di mobil dan jelajahi tiap komponen secara interaktif.',
    spark_sub_pre: 'Data spare part asli dari',
    spark_brand: 'PT Timur Raya Anugerah Damai',
    spark_sub_post: '.',
    spark_cta: 'MULAI EKSPLORASI',
    spark_footer: 'KATALOG SPARE PART · TRAD',
    parts_detail: 'DETAIL PART',
    hud_status: 'STATUS',
    hud_ready: 'SIAP',
    hud_render: 'RENDER',
    hud_realtime: 'REALTIME',
    hud_center: '⊙ Geser untuk memutar · Scroll untuk zoom · Klik DETAIL PART untuk rincian',
    yaw: 'YAW',

    // ChassisViewer — topbar / chrome
    chassis_view: 'CHASSIS·VIEW',
    parts_count_suffix: 'PARTS',
    zoom_prefix: 'ZOOM·',
    drag_pan: 'GESER·PAN',
    chassis_detail_view: 'CHASSIS — TAMPILAN DETAIL',
    suspension_parts_suffix: 'PART SUSPENSI',
    btn_back_short: '← KEMBALI',
    part_list: 'DAFTAR PART',
    no_data: 'TIDAK ADA DATA',
    no_data_yet: 'BELUM ADA DATA',
    select_brand: 'PILIH MEREK',
    brand_label: 'MEREK',
    category_label: 'KATEGORI',
    suspension: 'SUSPENSI',
    no_label: 'NO',
    chassis_part: 'BAGIAN CHASSIS',
    prev: '← SEBELUMNYA',
    next: 'BERIKUTNYA →',
    back_to_chassis: 'KEMBALI KE CHASSIS',
    suspension_component: 'KOMPONEN SUSPENSI',
    brand_profile: 'PROFIL MEREK',
    founded: 'BERDIRI',
    country: 'NEGARA',
    hq: 'KANTOR PUSAT',
    oem_credentials: 'KREDENSIAL OEM',
    advantages: 'KEUNGGULAN',
    status_chassis_view: 'TAMPILAN CHASSIS',
    status_toyota_parts: 'PART SUSPENSI TOYOTA',
    status_center: '⊙ Scroll untuk zoom · Geser untuk pan · Klik titik untuk rincian',
    status_zoom: 'ZOOM',
    status_parts: 'PARTS',
    company_profile: 'PROFIL PERUSAHAAN',
    live_feed: 'SIARAN LANGSUNG',
    stat_parts: 'PART',
    stat_brands: 'MEREK',
    stat_origins: 'ASAL NEGARA',
    trusted_partners: 'MITRA MEREK TERPERCAYA',
    video_caption: 'Distributor resmi — spare part resmi Toyota & otomotif di seluruh Indonesia.',
    trad_official: 'TRAD · RESMI',
  },
  en: {
    lang_switch_to: 'ID',

    digital_showcase: 'DIGITAL SHOWCASE',
    live_demo: 'LIVE DEMO',
    spare_parts_distributor: 'SPARE PARTS DISTRIBUTOR',
    eyebrow_360: '360° DIGITAL VEHICLE SHOWCASE',
    headline_line1: 'EXPERIENCE',
    headline_line2: 'THE FUTURE',
    subtext: 'Interactive 3D Exploration · Toyota Suspension Parts',
    pill_rotate: '360° Rotate',
    pill_hotspot: 'Part Hotspots',
    pill_chassis: '3D Chassis View',
    cta_label: 'TOUCH TO<br>START',
    cta_hint: '— Tap anywhere on screen —',
    side_hotspots: 'HOTSPOTS',
    side_rotation: 'ROTATION',
    side_chassis: 'CHASSIS',
    bottom_tagline: 'TOYOTA GENUINE PARTS DISTRIBUTOR',
    bottom_location: 'JAKARTA, INDONESIA',

    loading_model: 'LOADING 3D MODEL',
    exterior_360: 'EXTERIOR — 360°',
    tab_exterior: 'EXTERIOR',
    tab_chassis: 'CHASSIS',
    btn_back: '← BACK',
    spark_badge: 'INTERACTIVE 360°',
    spark_headline_1: 'Look Inside the',
    spark_headline_2: 'Chassis',
    spark_text_pre: 'Press',
    spark_text_highlight: 'PARTS DETAIL',
    spark_text_post: 'on the car and explore every component interactively.',
    spark_sub_pre: 'Genuine spare part data from',
    spark_brand: 'PT Timur Raya Anugerah Damai',
    spark_sub_post: '.',
    spark_cta: 'START EXPLORING',
    spark_footer: 'SPARE PART CATALOG · TRAD',
    parts_detail: 'PARTS DETAIL',
    hud_status: 'STATUS',
    hud_ready: 'READY',
    hud_render: 'RENDER',
    hud_realtime: 'REALTIME',
    hud_center: '⊙ Drag to rotate · Scroll to zoom · Click PARTS DETAIL for details',
    yaw: 'YAW',

    chassis_view: 'CHASSIS·VIEW',
    parts_count_suffix: 'PARTS',
    zoom_prefix: 'ZOOM·',
    drag_pan: 'DRAG·PAN',
    chassis_detail_view: 'CHASSIS — DETAIL VIEW',
    suspension_parts_suffix: 'SUSPENSION PARTS',
    btn_back_short: '← BACK',
    part_list: 'PART LIST',
    no_data: 'NO DATA',
    no_data_yet: 'NO DATA YET',
    select_brand: 'SELECT BRAND',
    brand_label: 'BRAND',
    category_label: 'CATEGORY',
    suspension: 'SUSPENSION',
    no_label: 'NO',
    chassis_part: 'CHASSIS PART',
    prev: '← PREV',
    next: 'NEXT →',
    back_to_chassis: 'BACK TO CHASSIS',
    suspension_component: 'SUSPENSION COMPONENT',
    brand_profile: 'BRAND PROFILE',
    founded: 'FOUNDED',
    country: 'COUNTRY',
    hq: 'HQ',
    oem_credentials: 'OEM CREDENTIALS',
    advantages: 'ADVANTAGES',
    status_chassis_view: 'CHASSIS VIEW',
    status_toyota_parts: 'TOYOTA SUSPENSION PARTS',
    status_center: '⊙ Scroll to zoom · Drag to pan · Click point for detail',
    status_zoom: 'ZOOM',
    status_parts: 'PARTS',
    company_profile: 'COMPANY PROFILE',
    live_feed: 'LIVE FEED',
    stat_parts: 'PARTS',
    stat_brands: 'BRANDS',
    stat_origins: 'ORIGINS',
    trusted_partners: 'TRUSTED BRAND PARTNERS',
    video_caption: 'Authorized distributor — official Toyota & automotive spare parts across Indonesia.',
    trad_official: 'TRAD · OFFICIAL',
  },
}

export function t(key) {
  return dict[lang.value]?.[key] ?? dict.en[key] ?? key
}