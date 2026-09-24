export const partListBrands = ['NWB', 'NOK', '555', 'GMB', 'Seiken', '3K Battery', 'KJLEX', 'NKN', 'Compact Brakes', 'NSK', 'Showa', 'KJ Shock Absorber', 'KJTRIC', 'New-Era', 'Mitsuboshi', 'RBI', 'KJ Hydraulics', 'KJ Steering']

// Product ranges transcribed from the user-provided text and brand artwork.
// Existing showcase products are merged in the viewer; no 3D asset is implied.
export const brandProductCatalog = {
  // Keep brands visible while their product lists are unavailable.
  "3K Battery": [],
  "KJLEX": ["Accelerator Cable", "Clutch Cable", "Engine Stop Cable", "Transmission Cable", "Hand Brake Cable"],
  "KJ Hydraulics": [],
  "555": [
    "Ball Joints",
    "Bell Crank",
    "Pitman Arm",
    "Side Rod Assy",
    "Rack End",
    "Idler Arm",
    "Bushing",
    "Tie Rods",
    "Upper Shaft",
    "Housing",
    "Stabilizer Link",
    "Drag Link"
  ],
  "NSK": [
    "Ball Bearing",
    "Clutch Release Bearing",
    "Engine Bearing",
    "Pinion Bearing",
    "Steering Bearing",
    "Wheel Bearing"
  ],
  "Seiken": [
    "Brake Master Cylinder Assy",
    "Tandem Master Cylinder Repair Kits",
    "Disc Brake Seal Kits",
    "Clutch Master Cylinder Assy",
    "Disc Brake",
    "Brake Booster Assy",
    "Wheel Cylinder Assy",
    "Cups",
    "Clutch Operating Cylinder Assy",
    "Boot Kit Shaft",
    "Caliper Piston"
  ],
  "NWB": [
    "Rubber Wiper",
    "Aqua Graphite",
    "Design Wiper",
    "Water Repellent Wiper"
  ],
  "GMB": [
    "Water Pump",
    "Universal Joint"
  ],
  "Compact Brakes": [
    "Crown Brake Shoe",
    "Nano X Brake Pad",
    "DC Silver Brake Pad",
    "Enduro Brake Lining"
  ],
  "NKN": [
    "Drive Shaft Assy",
    "CV Joint Outer",
    "CV Joint Inner"
  ],
  "Showa": [
    "Shock Absorber"
  ],
  "NOK": [
    "Automotive Oil Seals",
    "Mechanical Seals for Automotive",
    "Valve Stem Seals"
  ],
  "Mitsuboshi": [
    "Multiple V Belt Type A & B",
    "Raw Edge Type Belt",
    "Ribstar Belt"
  ],
  "New-Era": [
    "Condenser Distributor",
    "I.C. Regulator",
    "Idler Arm Assy",
    "Ignition Coil",
    "Starter Switch",
    "Rectifier Assy",
    "Solenoid / Starter Switch",
    "Regulator"
  ]
}

// Brand summaries based on the supplied product lists and artwork.
export const additionalBrandDetails = {
  "3K Battery": { brandLogo: "/images/brands/3k-battery.png" },
  "KJ Hydraulics": { brandLogo: "/images/brands/kjhydraulic.png" },
  "KJLEX": { brandLogo: "/images/brands/kjlex.png" },
  "NWB": {
    "brandLogo": "/images/brands/nwb.png",
    "description": {
      "id": "Merek produk wiper dengan pilihan Rubber Wiper, Aqua Graphite, Design Wiper, dan Water Repellent Wiper.",
      "en": "Wiper products including Rubber Wiper, Aqua Graphite, Design Wiper, and Water Repellent Wiper."
    },
    "category": {
      "id": "Kategori: wiper kendaraan",
      "en": "Category: vehicle wipers"
    }
  },
  "NKN": {
    "brandLogo": "/images/brands/nkn.png",
    "description": {
      "id": "NKN menyediakan Drive Shaft Assy serta CV Joint Outer dan Inner untuk sistem penggerak kendaraan.",
      "en": "NKN offers Drive Shaft Assy, CV Joint Outer, and CV Joint Inner for vehicle drivetrains."
    },
    "category": {
      "id": "Kategori: drive shaft dan CV joint",
      "en": "Category: drive shafts and CV joints"
    },
    "advantages": [
      {
        "id": "Presisi tinggi",
        "en": "High precision"
      },
      {
        "id": "Tahan lama",
        "en": "Durability"
      },
      {
        "id": "Performa stabil",
        "en": "Stable performance"
      },
      {
        "id": "Pelumas berkualitas",
        "en": "Quality lubricant"
      }
    ]
  },
  "Mitsuboshi": {
    "brandLogo": "/images/brands/mitsuboshi.png",
    "description": {
      "id": "Mitsuboshi menawarkan automotive belts dengan pilihan Multiple V Belt Type A & B, Raw Edge Type Belt, dan Ribstar Belt.",
      "en": "Mitsuboshi offers automotive belts including Multiple V Belt Type A & B, Raw Edge Type Belt, and Ribstar Belt."
    },
    "category": {
      "id": "Kategori: sabuk kendaraan (automotive belts)",
      "en": "Category: automotive belts"
    }
  },
  "New-Era": {
    "brandLogo": "/images/brands/new-era.png",
    "description": {
      "id": "New-Era menawarkan automotive electrical parts, termasuk regulator, ignition coil, starter switch, dan rectifier assy.",
      "en": "New-Era offers automotive electrical parts including regulators, ignition coils, starter switches, and rectifier assemblies."
    },
    "category": {
      "id": "Kategori: komponen kelistrikan otomotif",
      "en": "Category: automotive electrical parts"
    }
  }
}
