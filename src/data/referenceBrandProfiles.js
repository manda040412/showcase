// Transcribed from the four reference sheets supplied by the user.
// Missing sections stay empty; do not infer specifications or claims.
const point = (en, id, icon) => ({ en, id, ...(icon ? { icon: icon + '.png' } : {}) })
const applicable = 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, Lexus, etc.'
const base = (founded, en, id) => ({
  founded, country: { en, id }, oem: applicable, oemLabel: 'Applicable to',
  specifications: [], advantages: [], historyHighlight: [],
})
export const referenceBrandProfiles = {
  NWB: {
    ...base('1965', 'Japan', 'Jepang'),
    historyHighlight: [
      point('1965 Nippon Wiperblade Co., Ltd. was established in Saitama City.', '1965 Nippon Wiperblade Co., Ltd. didirikan di Kota Saitama.'),
      point('1987 Established Korea Overseas trade and Korea Wiper Co., Ltd.', '1987 Mendirikan Korea Overseas trade dan Korea Wiper Co., Ltd.'),
      point('1991 HQ and factory relocated to Saitama Prefecture', '1991 Kantor pusat dan pabrik dipindahkan ke Prefektur Saitama'),
      point('1995 Establishment of NWB in Malaysia', '1995 Pendirian NWB di Malaysia'),
      point('1996 Establishment of NWB in the USA', '1996 Pendirian NWB di Amerika Serikat'),
      point('1999 Obtained ISO 9001 certification', '1999 Memperoleh sertifikasi ISO 9001'),
      point('2000 Obtained ISO 14001 certification', '2000 Memperoleh sertifikasi ISO 14001'),
      point('2019 Merger with Asahi Seisakusho Co., Ltd. becomes Denso Wiper Systems Co., Ltd.', '2019 Merger dengan Asahi Seisakusho Co., Ltd. menjadi Denso Wiper Systems Co., Ltd.'),
    ],
    profile: [
      point('Japan no. 1 OE Wiper maker for global car brands', 'Produsen wiper OE no. 1 Jepang untuk merek mobil global'),
      point('Genuine wiper blade quality specially designed for OE car glass windshield', 'Kualitas wiper blade asli yang dirancang khusus untuk kaca depan mobil OE'),
      point('Wide fitment to various car brands for Asia, America, and European cars', 'Kesesuaian luas untuk berbagai merek mobil Asia, Amerika, dan Eropa'),
      point('Wiper rubber replacement available', 'Tersedia karet wiper pengganti'),
    ],
    productHighlights: [
      point('OEM quality product', 'Produk berkualitas OEM', 'oem'),
      point('Genuine frame fit', 'Kesesuaian rangka asli', 'precision'),
      point('Japan no. 1 OE Wiper maker', 'Produsen wiper OE no. 1 Jepang', 'japan'),
    ],
  },
  '3K Battery': {
    ...base('1986', 'Thailand', 'Thailand'),
    historyHighlight: [
      point('1986 Thai Storage Battery (TSB) was founded', '1986 Thai Storage Battery (TSB) didirikan'),
      point('1994 TSB became a public company under Thai Storage Battery Public Co Ltd', '1994 TSB menjadi perusahaan publik dengan nama Thai Storage Battery Public Co Ltd'),
      point('2000 Joint Venture with Thai Storage Battery Japan Co., Ltd to oversee distribution of automotive and industrial batteries including service aftersale for Japan market', '2000 Usaha patungan dengan Thai Storage Battery Japan Co., Ltd untuk mengelola distribusi baterai otomotif dan industri termasuk layanan purnajual untuk pasar Jepang'),
      point('2004 TSB received ISO 14001:2004, expand capacity from 250,000 to 300,000 unit/month', '2004 TSB memperoleh ISO 14001:2004 dan meningkatkan kapasitas dari 250.000 menjadi 300.000 unit/bulan'),
      point('2012 Launched the first Sealed Maintenance Free Battery in Thailand', '2012 Meluncurkan Sealed Maintenance Free Battery pertama di Thailand'),
      point('2016 Expanded capacity of Traction Battery to 400 sets/month', '2016 Meningkatkan kapasitas Traction Battery menjadi 400 set/bulan'),
      point('2019 Become Hitachi Chemical Storage Battery (Thailand) Public Co., Ltd.', '2019 Menjadi Hitachi Chemical Storage Battery (Thailand) Public Co., Ltd.'),
      point('2021 Received TAQA (Thailand Automotive Quality Award), Platinum Excellence Award for 1 decade', '2021 Menerima TAQA (Thailand Automotive Quality Award), Platinum Excellence Award selama 1 dekade'),
    ],
    profile: [
      point('Formerly Hitachi Storage Battery', 'Sebelumnya Hitachi Storage Battery'),
      point('OE battery supplier to Mitsubishi, Nissan, Isuzu Thailand', 'Pemasok baterai OE untuk Mitsubishi, Nissan, Isuzu Thailand'),
      point('ISO 9001, ISO 14001, SNI certified', 'Tersertifikasi ISO 9001, ISO 14001, SNI'),
      point('Available for automotive battery, EB, Traction, Golf cart and Lighting batteries', 'Tersedia baterai otomotif, EB, Traction, golf cart, dan penerangan'),
    ],
    productHighlights: [
      point('OEM quality product', 'Produk berkualitas OEM', 'oem'),
      point('Japan Quality', 'Kualitas Jepang', 'japan'),
      point('Wide fitment for car application', 'Kesesuaian luas untuk aplikasi mobil', 'global'),
    ],
  },
  RBI: {
    ...base('1974', 'Thailand', 'Thailand'),
    profile: [
      point("One of Southeast Asia's earliest dedicated automotive rubber-metal bonded component manufacturers.", 'Salah satu produsen awal di Asia Tenggara yang berfokus pada komponen otomotif dengan ikatan karet-logam.'),
      point('Exported to 60+ countries worldwide including Indonesia, Malaysia, the Philippines, Vietnam, India, Kenya, Nigeria, and the UAE.', 'Diekspor ke lebih dari 60 negara termasuk Indonesia, Malaysia, Filipina, Vietnam, India, Kenya, Nigeria, dan Uni Emirat Arab.'),
      point('Rubber compounds specifically formulated for tropical heat and humidity', 'Kompon karet diformulasikan khusus untuk panas dan kelembapan tropis'),
      point('Facilities certified to international quality standards.', 'Fasilitas tersertifikasi sesuai standar kualitas internasional.'),
      point('Over 50 years of specialized rubber component manufacturing experience', 'Lebih dari 50 tahun pengalaman khusus dalam manufaktur komponen karet'),
    ],
    advantages: [
      point('Excellent vibration absorption reduces NVH (noise, vibration, harshness)', 'Penyerapan getaran yang sangat baik mengurangi NVH (kebisingan, getaran, kekasaran)', 'vibration'),
      point('Strong rubber-to-metal bonding prevents slippage under load', 'Ikatan karet-logam yang kuat mencegah selip saat menerima beban', 'strength'),
      point('Broad product range covering Japanese, Korean, and European applications', 'Rangkaian produk luas untuk aplikasi Jepang, Korea, dan Eropa', 'global'),
    ],
    productHighlights: [
      point('Made in Thailand', 'Buatan Thailand', 'thailand'),
      point('Excellent rubber', 'Karet unggul', 'precision'),
      point('Strong durability', 'Daya tahan kuat', 'shield'),
    ],
  },
  Mitsuboshi: {
    ...base('1919', 'Japan', 'Jepang'),
    historyHighlight: [
      point('1919 Mitsuboshi Shokai was founded at Kobe Plant site', '1919 Mitsuboshi Shokai didirikan di lokasi Pabrik Kobe'),
      point('1936 Start manufacturing conveyor belts', '1936 Mulai memproduksi conveyor belt'),
      point('1940 Start manufacturing V-belt', '1940 Mulai memproduksi V-belt'),
      point('1947 Start manufacturing bicycle tires and tubes', '1947 Mulai memproduksi ban dan ban dalam sepeda'),
      point('1957 Start manufacturing timing belt', '1957 Mulai memproduksi timing belt'),
      point('1988 Establishment of PT Mitsuboshi Belting Indonesia', '1988 Pendirian PT Mitsuboshi Belting Indonesia'),
      point('2003 Consolidated Mitsuboshi Overseas HQ Ltd', '2003 Konsolidasi Mitsuboshi Overseas HQ Ltd'),
      point('2021 Establishment of PT Mitsuboshi Belting Sales Indonesia', '2021 Pendirian PT Mitsuboshi Belting Sales Indonesia'),
    ],
    profile: [
      point('Global network in 15 countries worldwide', 'Jaringan global di 15 negara'),
      point('Plants and sales offices in Japan, Asia, Europe and America', 'Pabrik dan kantor penjualan di Jepang, Asia, Eropa, dan Amerika'),
      point('Various application for automotive belts including OE and aftermarket', 'Berbagai aplikasi sabuk otomotif termasuk OE dan aftermarket'),
    ],
    productHighlights: [
      point('OEM quality product', 'Produk berkualitas OEM', 'oem'),
      point('Precision engineered', 'Direkayasa secara presisi', 'precision'),
      point('Strong durability', 'Daya tahan kuat', 'shield'),
    ],
  },
}