// Transcribed from the reference sheets supplied by the user.
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
// Additional reference sheets supplied by the user: KJSteering, KJ Hydraulics,
// New Era and KJTRIC. KJTRIC's brake-parts wording follows its source sheet.
const kjAdvantages = () => [
  point('Wide fitment range covering popular Japanese and Asian vehicle models', 'Cakupan kesesuaian luas untuk model kendaraan Jepang dan Asia yang populer', 'global'),
  point('Easy installation with OEM-compatible mounting dimensions', 'Pemasangan mudah dengan dimensi dudukan yang kompatibel dengan OEM', 'precision'),
  point('Good service life for everyday passenger vehicle applications', 'Masa pakai yang baik untuk penggunaan kendaraan penumpang sehari-hari', 'comfort'),
]
const kjBase = () => ({
  ...base(null, 'Indonesia', 'Indonesia'),
  hq: 'PT TIMUR RAYA ANUGERAH DAMAI',
  hqLabel: 'Brand Owner',
  advantages: kjAdvantages(),
})
const brakeProfile = () => [
  point('Aftermarket brake parts (wheel cylinder, brake master assy, master clutch assy, dll.) brand under PT Timur Raya Anugerah Damai, developed for Indonesian replacement parts market', 'Merek komponen rem aftermarket (wheel cylinder, brake master assy, master clutch assy, dll.) di bawah PT Timur Raya Anugerah Damai, dikembangkan untuk pasar suku cadang pengganti Indonesia'),
  point('Factory supplies automotive brake parts to aftermarket brands worldwide.', 'Pabrik memasok komponen rem otomotif untuk merek aftermarket di seluruh dunia.'),
  point('ISO, IATF quality management system certified.', 'Tersertifikasi sistem manajemen mutu ISO, IATF.'),
]
const brakeHighlights = () => [
  point('Value for money', 'Harga sepadan', 'price'),
  point('High quality', 'Kualitas tinggi', 'gear'),
  point('Advanced material', 'Material canggih', 'material'),
]
Object.assign(referenceBrandProfiles, {
  'KJ Steering': {
    ...kjBase(),
    profile: [
      point('Aftermarket rack steering assy brand under PT Timur Raya Anugerah Damai, developed for Indonesian replacement parts market', 'Merek rack steering assy aftermarket di bawah PT Timur Raya Anugerah Damai, dikembangkan untuk pasar suku cadang pengganti Indonesia'),
      point('Factory supplies automotive rack steering assy to aftermarket brands worldwide.', 'Pabrik memasok rack steering assy otomotif untuk merek aftermarket di seluruh dunia.'),
      point('ISO, IATF quality management system certified.', 'Tersertifikasi sistem manajemen mutu ISO, IATF.'),
    ],
    productHighlights: [
      point('Value for money', 'Harga sepadan', 'price'),
      point('High quality', 'Kualitas tinggi', 'gear'),
      point('Long lasting', 'Tahan lama', 'clock'),
    ],
  },
  'KJ Hydraulics': {
    ...kjBase(),
    profile: brakeProfile(),
    productHighlights: brakeHighlights(),
  },
  KJTRIC: {
    ...kjBase(),
    profile: brakeProfile(),
    productHighlights: brakeHighlights(),
  },
  'New-Era': {
    ...base('1939', 'Japan', 'Jepang'),
    historyHighlight: [
      point('1939 Fuji Electric Co., Ltd was established and manufacturing of magnetic switch', '1939 Fuji Electric Co., Ltd didirikan dan memproduksi magnetic switch'),
      point('1946 Development of Condenser was started', '1946 Pengembangan Condenser dimulai'),
      point('1959 Starter switch started supplying to OE mass production', '1959 Starter switch mulai dipasok untuk produksi massal OE'),
      point('1965 24V Starter Switch (for diesel) was developed', '1965 Starter Switch 24V (untuk diesel) dikembangkan'),
      point('1981 New Era Co., Ltd. was founded', '1981 New Era Co., Ltd. didirikan'),
      point('1991 New Head Factory was completed', '1991 Pabrik utama baru selesai dibangun'),
      point('2009 New Era International Co., Ltd was established in Thailand', '2009 New Era International Co., Ltd didirikan di Thailand'),
      point('2013 New Era (HK) Precision Co., Ltd was established in Hongkong', '2013 New Era (HK) Precision Co., Ltd didirikan di Hongkong'),
    ],
    profile: [
      point('Supplying for both OEM and aftermarket sectors globally', 'Memasok sektor OEM dan aftermarket secara global'),
      point('Global supply chain distribution to Asian, European and American market', 'Distribusi rantai pasok global ke pasar Asia, Eropa, dan Amerika'),
    ],
    productHighlights: [
      point('OEM quality product', 'Produk berkualitas OEM', 'oem'),
      point('Precision engineered', 'Direkayasa secara presisi', 'precision'),
      point('Strong durability', 'Daya tahan kuat', 'shield'),
    ],
  },
})

// NKN and KJLEX reference sheets supplied by the user.
Object.assign(referenceBrandProfiles, {
  NKN: {
    ...base('1958', 'Japan', 'Jepang'),
    historyHighlight: [
      point('1958 Founder, Mr. Shigeo Nakatsuji started production of automobile parts', '1958 Pendiri, Bapak Shigeo Nakatsuji memulai produksi suku cadang mobil'),
      point('1964 Establishment of Nakatsuji Iron Industry Co., Ltd.', '1964 Pendirian Nakatsuji Iron Industry Co., Ltd.'),
      point('1981 Establishment of Kawamata factory', '1981 Pendirian pabrik Kawamata'),
      point('1985 Started production and sales of drive shaft and cv joints', '1985 Memulai produksi dan penjualan drive shaft dan CV joint'),
      point('1989 Company name became NKN Ltd., Factory expansion and completed the new head office building', '1989 Nama perusahaan menjadi NKN Ltd., perluasan pabrik dan penyelesaian gedung kantor pusat baru'),
      point('1997 New warehouse was completed with fully automated production line', '1997 Gudang baru selesai dibangun dengan lini produksi yang sepenuhnya otomatis'),
      point('2011 Received ISO 9001 certification', '2011 Memperoleh sertifikasi ISO 9001'),
      point('2014 Production and sales of driveshaft for racing cars and EV sport cars', '2014 Produksi dan penjualan driveshaft untuk mobil balap dan mobil sport listrik'),
    ],
    profile: [
      point('Global network in Middle East, Southeast Asia, Latin America, etc.', 'Jaringan global di Timur Tengah, Asia Tenggara, Amerika Latin, dan lainnya.'),
      point('Wide range fitment for Japanese and Asian vehicle models', 'Cakupan kesesuaian luas untuk model kendaraan Jepang dan Asia'),
      point('ISO9001 certified', 'Tersertifikasi ISO9001'),
    ],
    productHighlights: [
      point('Precision engineered', 'Direkayasa secara presisi', 'precision'),
      point('Japan Quality', 'Kualitas Jepang', 'japan'),
      point('Anti-rust coating', 'Lapisan antikarat', 'coating'),
      point('Advanced material', 'Material canggih', 'material'),
    ],
  },
  KJLEX: {
    ...base(null, 'Indonesia', 'Indonesia'),
    hq: 'PT Timur Raya Anugerah Damai',
    hqLabel: 'Brand Owner',
    oem: 'Toyota, Honda, Mitsubishi, Nissan, Mazda, Suzuki, Isuzu, etc.',
    profile: [
      point('Wide range of product variant such as accelerator cable, clutch cable, engine stop cable, transmission cable, hand brake cable, etc.', 'Beragam varian produk seperti kabel akselerator, kabel kopling, kabel penghenti mesin, kabel transmisi, kabel rem tangan, dan lainnya.'),
      point('Factory supplies automotive cable to OE market globally', 'Pabrik memasok kabel otomotif ke pasar OE secara global'),
    ],
    advantages: [
      point('Wide fitment range for Japanese and Asian car models', 'Cakupan kesesuaian luas untuk model mobil Jepang dan Asia', 'global'),
      point('OEM-compatible product quality for maximum performance and easy installation', 'Kualitas produk kompatibel OEM untuk performa maksimal dan pemasangan mudah', 'precision'),
    ],
    productHighlights: [
      point('OEM quality product', 'Produk berkualitas OEM', 'oem'),
      point('Precision engineered', 'Direkayasa secara presisi', 'precision'),
      point('Global brand in 18 countries', 'Merek global di 18 negara', 'global'),
    ],
  },
})
