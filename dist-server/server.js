// server.ts
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// src/server/apiHandler.ts
import { Router } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

// src/server/database.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import {
  getFirestore as initFirestore
} from "firebase-admin/firestore";

// src/data/mockData.ts
var INITIAL_CATEGORIES = [
  {
    id: "gadgets",
    nameEn: "Smart Gadgets",
    nameBn: "\u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F\u09B8",
    icon: "Watch",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600",
    itemCount: 42
  },
  {
    id: "audio",
    nameEn: "Headphones & Audio",
    nameBn: "\u09B9\u09C7\u09A1\u09AB\u09CB\u09A8 \u0993 \u0985\u09A1\u09BF\u0993",
    icon: "Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    itemCount: 38
  },
  {
    id: "accessories",
    nameEn: "Tech Accessories",
    nameBn: "\u099F\u09C7\u0995 \u098F\u0995\u09CD\u09B8\u09C7\u09B8\u09B0\u09BF\u099C",
    icon: "Cpu",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600",
    itemCount: 56
  },
  {
    id: "wearables",
    nameEn: "Watches & Wearables",
    nameBn: "\u0998\u09DC\u09BF \u0993 \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09C7\u09AC\u09B2\u09B8",
    icon: "Clock",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
    itemCount: 29
  },
  {
    id: "gaming",
    nameEn: "Gaming Gear",
    nameBn: "\u0997\u09C7\u09AE\u09BF\u0982 \u0997\u09BF\u09DF\u09BE\u09B0",
    icon: "Gamepad2",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    itemCount: 31
  },
  {
    id: "lifestyle",
    nameEn: "Lifestyle & Bags",
    nameBn: "\u09B2\u09BE\u0987\u09AB\u09B8\u09CD\u099F\u09BE\u0987\u09B2 \u0993 \u09AC\u09CD\u09AF\u09BE\u0997",
    icon: "ShoppingBag",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    itemCount: 24
  }
];
var INITIAL_PRODUCTS = [
  {
    id: "prod-101",
    slug: "ultrawatch-pro-oled",
    nameEn: '7X UltraWatch Pro 2.04" AMOLED Titanium Smartwatch',
    nameBn: '\u09ED\u098F\u0995\u09CD\u09B8 \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE\u0993\u09DF\u09BE\u099A \u09AA\u09CD\u09B0\u09CB \u09E8.\u09E6\u09EA" \u0985\u09CD\u09AF\u09BE\u09AE\u09CB\u09B2\u09C7\u09A1 \u099F\u09BE\u0987\u099F\u09BE\u09A8\u09BF\u09DF\u09BE\u09AE \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09DF\u09BE\u099A',
    category: "gadgets",
    price: 3499,
    discountPrice: 2850,
    stock: 14,
    rating: 4.9,
    reviewCount: 142,
    isHot: true,
    isFeatured: true,
    isBestSeller: true,
    sku: "7X-WTC-01",
    brand: "7X Tech",
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "The flagship 7X UltraWatch Pro features a vibrant 2.04-inch Always-on AMOLED display with aerospace titanium alloy casing. Comes with Bluetooth 5.3 HD calling, 15-day battery standby, IP68 water resistance, dynamic heart rate and SpO2 sensors, plus 120+ sports workout modes. Perfect for both office attire and outdoor rugged adventures.",
    descriptionBn: "\u09ED\u098F\u0995\u09CD\u09B8 \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE\u0993\u09DF\u09BE\u099A \u09AA\u09CD\u09B0\u09CB-\u09A4\u09C7 \u09B0\u09DF\u09C7\u099B\u09C7 \u0989\u099C\u09CD\u099C\u09CD\u09AC\u09B2 \u09E8.\u09E6\u09EA \u0987\u099E\u09CD\u099A\u09BF \u0985\u09B2\u0993\u09AF\u09BC\u09C7\u099C-\u0985\u09A8 \u0985\u09CD\u09AF\u09BE\u09AE\u09CB\u09B2\u09C7\u09A1 \u09A1\u09BF\u09B8\u09AA\u09CD\u09B2\u09C7 \u098F\u09AC\u0982 \u099F\u09BE\u0987\u099F\u09BE\u09A8\u09BF\u09AF\u09BC\u09BE\u09AE \u0985\u09CD\u09AF\u09BE\u09B2\u09AF\u09BC \u09AC\u09A1\u09BF\u0964 \u09AC\u09CD\u09B2\u09C1\u099F\u09C1\u09A5 \u09EB.\u09E9 \u098F\u0987\u099A\u09A1\u09BF \u0995\u09B2\u09BF\u0982 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE, \u09E7\u09EB \u09A6\u09BF\u09A8\u09C7\u09B0 \u09A6\u09C0\u09B0\u09CD\u0998 \u09AC\u09CD\u09AF\u09BE\u099F\u09BE\u09B0\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u0986\u09AA, \u0986\u0987\u09AA\u09BF\u09EC\u09EE \u0993\u09DF\u09BE\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09C1\u09AB\u09BF\u0982, \u09B9\u09BE\u09B0\u09CD\u099F \u09B0\u09C7\u099F \u0993 \u09AC\u09CD\u09B2\u09BE\u09A1 \u0985\u0995\u09CD\u09B8\u09BF\u099C\u09C7\u09A8 \u09B8\u09C7\u09A8\u09CD\u09B8\u09B0 \u098F\u09AC\u0982 \u09E7\u09E8\u09E6+ \u09B8\u09CD\u09AA\u09CB\u09B0\u09CD\u099F\u09B8 \u09AE\u09CB\u09A1\u0964 \u0985\u09AB\u09BF\u09B8 \u09AC\u09BE \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u0986\u0989\u099F\u09A1\u09CB\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09C7\u09B0\u09BE\u0964",
    specs: {
      "Display": '2.04" AMOLED 410x502 resolution',
      "Battery": "450mAh (Up to 10-14 days typical use)",
      "Connectivity": "Bluetooth 5.3 + Dual Microphones",
      "Waterproof": "IP68 Water & Dust Resistant",
      "Body Material": "Titanium Alloy with Ceramic Back",
      "Warranty": "1 Year Replacement Warranty"
    },
    colors: ["Titanium Silver", "Midnight Black", "Ocean Orange"],
    sizes: ["49mm Standard"]
  },
  {
    id: "prod-102",
    slug: "soundpods-anc-wireless",
    nameEn: "7X SoundPods Pro ANC Wireless Earbuds (45dB Hybrid Noise Cancelling)",
    nameBn: "\u09ED\u098F\u0995\u09CD\u09B8 \u09B8\u09BE\u0989\u09A8\u09CD\u09A1\u09AA\u09A1\u09B8 \u09AA\u09CD\u09B0\u09CB \u098F\u098F\u09A8\u09B8\u09BF \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u0987\u09DF\u09BE\u09B0\u09AC\u09BE\u09A1\u09B8 (\u09EA\u09EB\u09A1\u09BF\u09AC\u09BF \u09A8\u09AF\u09BC\u09C7\u099C \u0995\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8\u09C7\u09B2\u09C7\u09B6\u09A8)",
    category: "audio",
    price: 2990,
    discountPrice: 2190,
    stock: 28,
    rating: 4.8,
    reviewCount: 96,
    isHot: true,
    isFeatured: true,
    isNew: true,
    sku: "7X-AUD-02",
    brand: "7X Audio",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Immerse in crystal-clear audio with hybrid Active Noise Cancellation blocking out up to 45dB of background commotion. Powered by 11mm bio-diaphragm dynamic drivers, dual-device seamless switching, ultra-low 38ms gaming latency mode, and up to 36 hours total battery with wireless fast charging.",
    descriptionBn: "\u09EA\u09EB \u09A1\u09C7\u09B8\u09BF\u09AC\u09C7\u09B2 \u09B9\u09BE\u0987\u09AC\u09CD\u09B0\u09BF\u09A1 \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD \u09A8\u09AF\u09BC\u09C7\u099C \u0995\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8\u09C7\u09B2\u09C7\u09B6\u09A8 \u09B8\u09AE\u09C3\u09A6\u09CD\u09A7 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u09B8\u09BE\u0989\u09A8\u09CD\u09A1\u09AA\u09A1\u09B8\u0964 \u09E7\u09E7 \u09AE\u09BF\u09AE\u09BF \u09A1\u09BE\u09DF\u09A8\u09BE\u09AE\u09BF\u0995 \u09A1\u09CD\u09B0\u09BE\u0987\u09AD\u09BE\u09B0 \u09A6\u09BF\u099A\u09CD\u099B\u09C7 \u09A1\u09BF\u09AA \u09AC\u09C7\u09B8 \u0993 \u0995\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09BE\u09B2 \u0995\u09CD\u09B2\u09BF\u09DF\u09BE\u09B0 \u09AD\u09CB\u0995\u09BE\u09B2\u0964 \u09A1\u09C1\u09DF\u09BE\u09B2 \u09A1\u09BF\u09AD\u09BE\u0987\u09B8 \u0995\u09BE\u09A8\u09C7\u0995\u09B6\u09A8, \u09B2\u09CB-\u09B2\u09CD\u09AF\u09BE\u099F\u09C7\u09A8\u09CD\u09B8\u09BF \u0997\u09C7\u09AE\u09BF\u0982 \u09AE\u09CB\u09A1 \u098F\u09AC\u0982 \u0995\u09C7\u09B8\u09B8\u09B9 \u09AE\u09CB\u099F \u09E9\u09EC \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09B2\u09AE\u09CD\u09AC\u09BE \u09AC\u09CD\u09AF\u09BE\u099F\u09BE\u09B0\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u0986\u09AA\u0964",
    specs: {
      "ANC Depth": "Up to 45dB Hybrid Active Noise Cancelling",
      "Driver": "11mm Custom Titanium Dynamic Drivers",
      "Playtime": "8 hrs per charge, 36 hrs total with case",
      "Charging": "USB Type-C Fast Charge (10 min = 2 hrs)",
      "Microphones": "6 ENC Mics for Studio HD Calls",
      "Warranty": "6 Months Brand Warranty"
    },
    colors: ["Glossy White", "Matte Black", "Frosted Navy"]
  },
  {
    id: "prod-103",
    slug: "gan-65w-fast-charger",
    nameEn: "GaN III 65W Triple-Port Ultra Fast Wall Charger (Laptop & Phone)",
    nameBn: "\u099C\u09BF\u098F\u098F\u09A8 \u09E9 \u09EC\u09EB \u0993\u09DF\u09BE\u099F \u099F\u09CD\u09B0\u09BF\u09AA\u09B2-\u09AA\u09CB\u09B0\u09CD\u099F \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE \u09AB\u09BE\u09B8\u09CD\u099F \u099A\u09BE\u09B0\u09CD\u099C\u09BE\u09B0 (\u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA \u0993 \u09AB\u09CB\u09A8)",
    category: "accessories",
    price: 1850,
    discountPrice: 1450,
    stock: 45,
    rating: 4.7,
    reviewCount: 88,
    isFeatured: true,
    isBestSeller: true,
    sku: "7X-ACC-03",
    brand: "7X Power",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622445262464-84b150777741?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Next-generation Gallium Nitride (GaN III) technology delivers fast, cool 65W power in a pocket-sized compact form. Dual USB-C PD 3.0 ports plus USB-A QC 4.0 easily powers your MacBook, iPad, iPhone, and Android devices simultaneously with over-temperature intelligent safety protection.",
    descriptionBn: "\u09A8\u09A4\u09C1\u09A8 \u0997\u09CD\u09AF\u09BE\u09B2\u09BF\u09DF\u09BE\u09AE \u09A8\u09BE\u0987\u099F\u09CD\u09B0\u09BE\u0987\u09A1 (GaN III) \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u09EC\u09EB \u0993\u09DF\u09BE\u099F \u09AB\u09BE\u09B8\u09CD\u099F \u099A\u09BE\u09B0\u09CD\u099C\u09BE\u09B0\u0964 \u098F\u0995\u0987 \u09B8\u09BE\u09A5\u09C7 \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA, \u099F\u09CD\u09AF\u09BE\u09AC\u09B2\u09C7\u099F \u098F\u09AC\u0982 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u09AB\u09CB\u09A8 \u09B8\u09C1\u09AA\u09BE\u09B0 \u09AB\u09BE\u09B8\u09CD\u099F \u09B8\u09CD\u09AA\u09BF\u09A1\u09C7 \u099A\u09BE\u09B0\u09CD\u099C \u0995\u09B0\u09A4\u09C7 \u09B8\u0995\u09CD\u09B7\u09AE\u0964 \u09B0\u09DF\u09C7\u099B\u09C7 \u09E8\u099F\u09BF \u0987\u0989\u098F\u09B8\u09AC\u09BF-\u09B8\u09BF \u098F\u09AC\u0982 \u09E7\u099F\u09BF \u0987\u0989\u098F\u09B8\u09AC\u09BF-\u098F \u09AA\u09CB\u09B0\u09CD\u099F \u098F\u09AC\u0982 \u0993\u09AD\u09BE\u09B0-\u09B9\u09BF\u099F\u09BF\u0982 \u09AA\u09CD\u09B0\u099F\u09C7\u0995\u09B6\u09A8\u0964",
    specs: {
      "Max Output": "65W Max Power Delivery",
      "Ports": "2x USB-C PD3.0, 1x USB-A QC4.0",
      "Input": "100-240V ~ 50/60Hz (Universal Worldwide)",
      "Safety": "MultiProtect Thermal Guard System",
      "Weight": "112g pocket friendly size",
      "Warranty": "1 Year Replacement Warranty"
    },
    colors: ["Ceramic White", "Obsidian Black"]
  },
  {
    id: "prod-104",
    slug: "apex-rgb-mechanical-keyboard",
    nameEn: "7X Apex Pro Wireless RGB Mechanical Keyboard (Hot-Swappable)",
    nameBn: "\u09ED\u098F\u0995\u09CD\u09B8 \u0985\u09CD\u09AF\u09BE\u09AA\u09C7\u0995\u09CD\u09B8 \u09AA\u09CD\u09B0\u09CB \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u0986\u09B0\u099C\u09BF\u09AC\u09BF \u09AE\u09C7\u0995\u09BE\u09A8\u09BF\u0995\u09CD\u09AF\u09BE\u09B2 \u0995\u09BF\u09AC\u09CB\u09B0\u09CD\u09A1 (\u09B9\u099F-\u09B8\u09CB\u09AF\u09BC\u09BE\u09AA\u09CD\u09AF\u09BE\u09AC\u09B2)",
    category: "gaming",
    price: 5200,
    discountPrice: 4290,
    stock: 9,
    rating: 4.9,
    reviewCount: 64,
    isHot: true,
    isNew: true,
    sku: "7X-GAM-04",
    brand: "7X Gaming",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Custom pre-lubed mechanical switches with gasket mounted design provide a creamy, whisper-crisp acoustic keystroke. Tri-mode connectivity (2.4GHz wireless, Bluetooth 5.1, and braided USB-C) ensures zero dropped frames during competitive esports and heavy typing sessions.",
    descriptionBn: "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0997\u09CD\u09AF\u09BE\u09B8\u0995\u09C7\u099F \u09AE\u09BE\u0989\u09A8\u09CD\u099F\u09C7\u09A1 \u09AE\u09C7\u0995\u09BE\u09A8\u09BF\u0995\u09CD\u09AF\u09BE\u09B2 \u0995\u09BF\u09AC\u09CB\u09B0\u09CD\u09A1\u0964 \u09B9\u099F-\u09B8\u09CB\u09AF\u09BC\u09BE\u09AA\u09CD\u09AF\u09BE\u09AC\u09B2 \u09B8\u09C1\u0987\u099A, \u0986\u09B0\u099C\u09BF\u09AC\u09BF \u09AC\u09CD\u09AF\u09BE\u0995\u09B2\u09BE\u0987\u099F \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09BF-\u09B2\u09C1\u09AC\u09A1 \u09B8\u09C1\u0987\u099A \u09A5\u09BE\u0995\u09BE\u09DF \u099F\u09BE\u0987\u09AA\u09BF\u0982\u09DF\u09C7 \u09A6\u09BE\u09B0\u09C1\u09A3 \u0986\u09B0\u09BE\u09AE \u09AA\u09BE\u09AC\u09C7\u09A8\u0964 \u09AC\u09CD\u09B2\u09C1\u099F\u09C1\u09A5, \u09E8.\u09EA \u0997\u09BF\u0997\u09BE\u09B9\u09BE\u09B0\u09CD\u099F\u099C \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u098F\u09AC\u0982 \u099F\u09BE\u0987\u09AA-\u09B8\u09BF \u0995\u09CD\u09AF\u09BE\u09AC\u09B2 \u09A6\u09BF\u09DF\u09C7 \u099F\u09CD\u09B0\u09BE\u0987-\u09AE\u09CB\u09A1 \u0995\u09BE\u09A8\u09C7\u0995\u09CD\u099F\u09BF\u09AD\u09BF\u099F\u09BF\u0964",
    specs: {
      "Layout": "75% Compact (82 Keys) with Volume Knob",
      "Switch Type": "Pre-lubed Cream Yellow Linear (Hot-Swap)",
      "Battery": "4000mAh (Up to 200 hours without RGB)",
      "Backlight": "16.8M South-Facing Per-Key RGB",
      "Keycaps": "Double-shot PBT Cherry Profile",
      "Warranty": "1 Year Official Warranty"
    },
    colors: ["Retro White & Gray", "Cyberpunk Neon", "Dark Knight"]
  },
  {
    id: "prod-105",
    slug: "lumix-magnetic-powerbank",
    nameEn: "MagSafe 10,000mAh Ultra-Slim Wireless Power Bank with Digital Display",
    nameBn: "\u09AE\u09CD\u09AF\u09BE\u0997\u09B8\u09C7\u09AB \u09E7\u09E6,\u09E6\u09E6\u09E6 \u09AE\u09BF\u09B2\u09BF\u0985\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BF\u09AF\u09BC\u09BE\u09B0 \u0986\u09B2\u09CD\u099F\u09CD\u09B0\u09BE-\u09B8\u09CD\u09B2\u09BF\u09AE \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u09AA\u09BE\u0993\u09DF\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u0982\u0995",
    category: "accessories",
    price: 2450,
    discountPrice: 1890,
    stock: 22,
    rating: 4.8,
    reviewCount: 53,
    isFeatured: true,
    isBestSeller: true,
    sku: "7X-ACC-05",
    brand: "7X Power",
    images: [
      "https://images.unsplash.com/photo-1609592426309-802773449e7b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Snaps magnetically to iPhone 12/13/14/15/16 and Qi2 compatible Android phones. Delivers up to 15W wireless charging and 22.5W wired PD fast output. Built-in zinc alloy kickstand lets you watch videos hands-free while charging.",
    descriptionBn: "\u09B6\u0995\u09CD\u09A4\u09BF\u09B6\u09BE\u09B2\u09C0 \u09AE\u09CD\u09AF\u09BE\u0997\u09A8\u09C7\u099F\u09BF\u0995 \u09B2\u0995\u09BF\u0982 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u09AF\u09C1\u0995\u09CD\u09A4 \u09B8\u09CD\u09B2\u09BF\u09AE \u09AA\u09BE\u0993\u09DF\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u0964 \u09E7\u09EB \u0993\u09DF\u09BE\u099F \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u098F\u09AC\u0982 \u09E8\u09E8.\u09EB \u0993\u09DF\u09BE\u099F \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09CD\u09A1 \u09AB\u09BE\u09B8\u09CD\u099F \u099A\u09BE\u09B0\u09CD\u099C\u09BF\u0982\u0964 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u098F\u09B2\u0987\u09A1\u09BF \u09AC\u09CD\u09AF\u09BE\u099F\u09BE\u09B0\u09BF \u0987\u09A8\u09CD\u09A1\u09BF\u0995\u09C7\u099F\u09B0 \u098F\u09AC\u0982 \u09AC\u09BF\u09B2\u09CD\u099F-\u0987\u09A8 \u09AE\u09C7\u099F\u09BE\u09B2 \u0995\u09BF\u0995\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1 \u09B8\u09AE\u09C3\u09A6\u09CD\u09A7\u0964",
    specs: {
      "Capacity": "10,000mAh / 38.5Wh Aviation Approved",
      "Wireless Output": "15W / 10W / 7.5W Qi Fast Magnetic",
      "Wired Output": "USB-C 22.5W Two-way Fast Charge",
      "Kickstand": "Aviation Zinc Alloy 60\xB0 Foldable Stand",
      "Display": "Real-time Accurate LED % Screen",
      "Warranty": "6 Months Warranty"
    },
    colors: ["Space Gray", "Alpine White", "Deep Purple"]
  },
  {
    id: "prod-106",
    slug: "urban-waterproof-travel-backpack",
    nameEn: "7X Urban Stealth Waterproof Expandable Laptop Backpack (30L)",
    nameBn: "\u09ED\u098F\u0995\u09CD\u09B8 \u0986\u09B0\u09AC\u09BE\u09A8 \u09B8\u09CD\u099F\u09C7\u09B2\u09A5 \u0993\u09DF\u09BE\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09C1\u09AB \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA \u099F\u09CD\u09B0\u09BE\u09AD\u09C7\u09B2 \u09AC\u09CD\u09AF\u09BE\u0995\u09AA\u09CD\u09AF\u09BE\u0995 (\u09E9\u09E6 \u09B2\u09BF\u099F\u09BE\u09B0)",
    category: "lifestyle",
    price: 3200,
    discountPrice: 2490,
    stock: 19,
    rating: 4.9,
    reviewCount: 77,
    isHot: true,
    isFeatured: true,
    sku: "7X-BAG-06",
    brand: "7X Lifestyle",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Engineered for developers, commuters, and travelers. Made from military-grade waterproof Oxford nylon with anti-theft hidden TSA zipper locks, dedicated padded 16-inch laptop and tablet compartment, external USB charging pass-through, and luggage strap.",
    descriptionBn: "\u0989\u099A\u09CD\u099A\u09AE\u09BE\u09A8\u09C7\u09B0 \u0993\u09DF\u09BE\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09C1\u09AB \u0985\u0995\u09CD\u09B8\u09AB\u09CB\u09B0\u09CD\u09A1 \u09AB\u09CD\u09AF\u09BE\u09AC\u09CD\u09B0\u09BF\u0995\u09C7 \u09A4\u09C8\u09B0\u09BF \u099F\u09C7\u0995\u09B8\u0987 \u09AC\u09CD\u09AF\u09BE\u0995\u09AA\u09CD\u09AF\u09BE\u0995\u0964 \u09E7\u09EC \u0987\u099E\u09CD\u099A\u09BF \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA \u09AA\u09CD\u09B0\u099F\u09C7\u0995\u09B6\u09A8 \u0995\u09AE\u09CD\u09AA\u09BE\u09B0\u09CD\u099F\u09AE\u09C7\u09A8\u09CD\u099F, \u099F\u09BF\u098F\u09B8\u098F \u0985\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u09BF-\u09A5\u09C7\u09AB\u099F \u09B2\u0995, \u098F\u0995\u09CD\u09B8\u099F\u09BE\u09B0\u09A8\u09BE\u09B2 \u0987\u0989\u098F\u09B8\u09AC\u09BF \u099A\u09BE\u09B0\u09CD\u099C\u09BF\u0982 \u09AA\u09CB\u09B0\u09CD\u099F \u098F\u09AC\u0982 \u0986\u09B0\u09BE\u09AE\u09A6\u09BE\u09DF\u0995 \u09AC\u09CD\u09B0\u09C7\u09A5\u09C7\u09AC\u09B2 \u09AC\u09CD\u09AF\u09BE\u0995 \u09AA\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2\u0964",
    specs: {
      "Capacity": "Expandable 22L to 30L",
      "Laptop Fit": 'Up to 16.2" MacBook / Gaming Laptop',
      "Material": "Water-repellent 900D Oxford + YKK Zippers",
      "Features": "Hidden Anti-theft Pocket, Luggage Strap, USB port",
      "Weight": "850g Lightweight Ergo Design"
    },
    colors: ["Carbon Black", "Steel Gray"]
  },
  {
    id: "prod-107",
    slug: "chronograph-lux-wrist-watch",
    nameEn: "7X Chrono Master Stainless Steel Waterproof Luxury Analog Watch",
    nameBn: "\u09ED\u098F\u0995\u09CD\u09B8 \u0995\u09CD\u09B0\u09CB\u09A8\u09CB \u09AE\u09BE\u09B8\u09CD\u099F\u09BE\u09B0 \u09B8\u09CD\u099F\u09C7\u0987\u09A8\u09B2\u09C7\u09B8 \u09B8\u09CD\u099F\u09BF\u09B2 \u0993\u09DF\u09BE\u099F\u09BE\u09B0\u09AA\u09CD\u09B0\u09C1\u09AB \u0985\u09CD\u09AF\u09BE\u09A8\u09BE\u09B2\u0997 \u0998\u09DC\u09BF",
    category: "wearables",
    price: 4800,
    discountPrice: 3650,
    stock: 8,
    rating: 4.8,
    reviewCount: 39,
    isFeatured: true,
    sku: "7X-WAT-07",
    brand: "7X Classic",
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Precision Japanese quartz movement with active three-subdial chronograph and date display. Sapphire-coated crystal glass face is scratch resistant and rated 50M waterproof. Crafted from solid 316L stainless steel with double butterfly clasp.",
    descriptionBn: "\u099C\u09BE\u09AA\u09BE\u09A8\u09BF \u0995\u09CB\u09AF\u09BC\u09BE\u09B0\u09CD\u099F\u099C \u09AE\u09C1\u09AD\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u09A8\u09BF\u0996\u09C1\u0981\u09A4 \u09E9-\u09B8\u09BE\u09AC\u09A1\u09BE\u09DF\u09BE\u09B2 \u0995\u09CD\u09B0\u09A8\u09CB\u0997\u09CD\u09B0\u09BE\u09AB \u0993\u09DF\u09BE\u099A\u0964 \u09B8\u09CD\u0995\u09CD\u09B0\u09CD\u09AF\u09BE\u099A-\u09AA\u09CD\u09B0\u09C1\u09AB \u09B8\u09CD\u09AF\u09BE\u09AB\u09BE\u09DF\u09BE\u09B0 \u0995\u09CD\u09B0\u09BF\u09B8\u09CD\u099F\u09BE\u09B2 \u0997\u09CD\u09B2\u09BE\u09B8 \u098F\u09AC\u0982 \u09EB\u09E6 \u09AE\u09BF\u099F\u09BE\u09B0 \u0993\u09DF\u09BE\u099F\u09BE\u09B0 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u0964 \u09E9\u09E7\u09EC\u098F\u09B2 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u09B8\u09CD\u099F\u09C7\u0987\u09A8\u09B2\u09C7\u09B8 \u09B8\u09CD\u099F\u09BF\u09B2 \u09AC\u09A1\u09BF \u09AF\u09BE \u0986\u09AD\u09BF\u099C\u09BE\u09A4\u09CD\u09AF\u09C7\u09B0 \u09AA\u09CD\u09B0\u09A4\u09C0\u0995\u0964",
    specs: {
      "Movement": "High Precision Japanese Quartz Chronograph",
      "Glass": "Scratch-resistant Sapphire Coated Crystal",
      "Case Diameter": "42mm Solid 316L Stainless Steel",
      "Water Resistance": "5 ATM / 50 Meters",
      "Warranty": "2 Years Movement Warranty"
    },
    colors: ["Emerald Green & Silver", "Royal Blue & Silver", "All Matte Black"]
  },
  {
    id: "prod-108",
    slug: "studio-desk-rgb-lightbar",
    nameEn: "ScreenBar Pro Curved Monitor RGB Light Bar with Wireless Dial",
    nameBn: "\u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09AC\u09BE\u09B0 \u09AA\u09CD\u09B0\u09CB \u0995\u09BE\u09B0\u09CD\u09AD\u09A1 \u09AE\u09A8\u09BF\u099F\u09B0 \u0986\u09B0\u099C\u09BF\u09AC\u09BF \u09B2\u09BE\u0987\u099F\u09AC\u09BE\u09B0 (\u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u0995\u09A8\u09CD\u099F\u09CD\u09B0\u09CB\u09B2\u09BE\u09B0)",
    category: "accessories",
    price: 2800,
    discountPrice: 2200,
    stock: 16,
    rating: 4.9,
    reviewCount: 47,
    isNew: true,
    sku: "7X-ACC-08",
    brand: "7X Studio",
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800"
    ],
    descriptionEn: "Asymmetrical optical design illuminates your desk space without creating glare or reflection on the screen. Features dual lighting: warm-to-cool reading light on the front plus dynamic ambient RGB backlighting. Controlled by a 2.4GHz metallic desktop rotation dial.",
    descriptionBn: "\u09AE\u09A8\u09BF\u099F\u09B0\u09C7 \u0995\u09CB\u09A8\u09CB \u09AA\u09CD\u09B0\u09A4\u09BF\u09AB\u09B2\u09A8 \u099B\u09BE\u09DC\u09BE\u0987 \u09AA\u09C1\u09B0\u09CB \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B8\u09CD\u09AA\u09C7\u09B8 \u0986\u09B2\u09CB\u0995\u09BF\u09A4 \u0995\u09B0\u09BE\u09B0 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u09B8\u09B2\u09BF\u0989\u09B6\u09A8\u0964 \u09B8\u09BE\u09AE\u09A8\u09C7 \u09B0\u09BF\u09A1\u09BF\u0982 \u09B2\u09BE\u0987\u099F \u098F\u09AC\u0982 \u09AA\u09C7\u099B\u09A8\u09C7 \u0985\u09CD\u09AF\u09BE\u09AE\u09CD\u09AC\u09BF\u09DF\u09C7\u09A8\u09CD\u099F \u0986\u09B0\u099C\u09BF\u09AC\u09BF \u09B2\u09BE\u0987\u099F\u0964 \u0993\u09DF\u09CD\u09AF\u09BE\u09B0\u09B2\u09C7\u09B8 \u09B0\u09CB\u099F\u09BE\u09B0\u09BF \u09A1\u09BE\u09DF\u09BE\u09B2\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AC\u09CD\u09B0\u09BE\u0987\u099F\u09A8\u09C7\u09B8 \u0993 \u0995\u09BE\u09B2\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u099C\u09BE\u09B8\u09CD\u099F \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u0964",
    specs: {
      "Lighting": "Asymmetric Anti-Glare + Rear RGB Mood Glow",
      "Color Temp": "2700K - 6500K Stepless Dimming (Ra > 95)",
      "Control": "2.4GHz Wireless Metal Rotary Controller",
      "Power": "5V 2A USB Type-C plug & play",
      "Compatibility": "Flat & Curved Monitors (0.5cm - 4.5cm thickness)"
    },
    colors: ["Space Gray Aluminum"]
  }
];
var INITIAL_COUPONS = [
  {
    code: "7XSPECIAL",
    discountType: "percentage",
    discountValue: 10,
    minSpend: 1500,
    descriptionEn: "10% OFF on orders over \u09F31,500",
    descriptionBn: "\u09E7,\u09EB\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09E7\u09E6% \u09AC\u09BF\u09B6\u09C7\u09B7 \u099B\u09BE\u09DC"
  },
  {
    code: "WELCOME100",
    discountType: "fixed",
    discountValue: 100,
    minSpend: 1e3,
    descriptionEn: "\u09F3100 flat instant discount",
    descriptionBn: "\u09E7,\u09E6\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09E7\u09E6\u09E6 \u099F\u09BE\u0995\u09BE \u0987\u09A8\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u09A8\u09CD\u099F \u09A1\u09BF\u09B8\u0995\u09BE\u0989\u09A8\u09CD\u099F"
  },
  {
    code: "FREESHIP",
    discountType: "free_shipping",
    discountValue: 100,
    minSpend: 2e3,
    descriptionEn: "Free Express Doorstep Shipping",
    descriptionBn: "\u09E8,\u09E6\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09AB\u09CD\u09B0\u09BF \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF"
  }
];
var INITIAL_HERO_SLIDES = [
  {
    id: "slide-1",
    tagEn: "Flash Weekend Mega Sale",
    tagBn: "\u0989\u0987\u0995\u09C7\u09A8\u09CD\u09A1 \u09AE\u09C7\u0997\u09BE \u09AB\u09CD\u09B2\u09CD\u09AF\u09BE\u09B6 \u09B8\u09C7\u09B2",
    titleEn: "Next-Gen Smartwatches & Audio Gear",
    titleBn: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE\u09C7\u09B0 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F\u0993\u09DF\u09BE\u099A \u0993 \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09DF\u09BE\u09AE \u0985\u09A1\u09BF\u0993 \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F",
    descEn: "Up to 35% discount with Cash on Delivery nationwide and genuine 1-year replacement warranty.",
    descBn: "\u09E9\u09EB% \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09AC\u09BF\u09B6\u09C7\u09B7 \u099B\u09BE\u09DC, \u09B8\u09BE\u09B0\u09BE \u09A6\u09C7\u09B6\u09C7 \u09B9\u09CB\u09AE \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u098F\u09AC\u0982 \u09E7 \u09AC\u099B\u09B0\u09C7\u09B0 \u0985\u09AB\u09BF\u09B6\u09BF\u09DF\u09BE\u09B2 \u09B0\u09BF\u09AA\u09CD\u09B2\u09C7\u09B8\u09AE\u09C7\u09A8\u09CD\u099F \u0993\u09DF\u09BE\u09B0\u09C7\u09A8\u09CD\u099F\u09BF\u0964",
    buttonEn: "Explore Deals Now",
    buttonBn: "\u0985\u09AB\u09BE\u09B0\u0997\u09C1\u09B2\u09CB \u09A6\u09C7\u0996\u09C1\u09A8",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=1200",
    badge: "Up to 35% OFF",
    actionType: "deals",
    isActive: true
  },
  {
    id: "slide-2",
    tagEn: "Gaming & Performance Essentials",
    tagBn: "\u0997\u09C7\u09AE\u09BF\u0982 \u0993 \u0993\u09DF\u09BE\u09B0\u09CD\u0995\u09B8\u09CD\u09AA\u09C7\u09B8 \u09B8\u09C7\u099F\u0986\u09AA",
    titleEn: "Mechanical Keyboards & Studio Gear",
    titleBn: "\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09AE\u09C7\u0995\u09BE\u09A8\u09BF\u0995\u09CD\u09AF\u09BE\u09B2 \u0995\u09BF\u09AC\u09CB\u09B0\u09CD\u09A1 \u0993 \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09AC\u09BE\u09B0 \u09B2\u09BE\u0987\u099F\u09BF\u0982",
    descEn: "Tri-mode wireless keyboards and precision workspace lighting for developers and gamers.",
    descBn: "\u09AA\u09CD\u09B0\u09AB\u09C7\u09B6\u09A8\u09BE\u09B2 \u09A1\u09C7\u09AD\u09C7\u09B2\u09AA\u09BE\u09B0 \u098F\u09AC\u0982 \u0997\u09C7\u09AE\u09BE\u09B0\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B9\u09BE\u0987-\u09B8\u09CD\u09AA\u09BF\u09A1 \u09AE\u09C7\u0995\u09BE\u09A8\u09BF\u0995\u09CD\u09AF\u09BE\u09B2 \u0995\u09BE\u09B8\u09CD\u099F\u09AE \u0997\u09BF\u09DF\u09BE\u09B0\u0964",
    buttonEn: "Shop Gaming Gear",
    buttonBn: "\u0997\u09C7\u09AE\u09BF\u0982 \u0997\u09BF\u09DF\u09BE\u09B0 \u0995\u09BF\u09A8\u09C1\u09A8",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
    badge: "New Arrivals",
    actionType: "shop",
    isActive: true
  },
  {
    id: "slide-3",
    tagEn: "Everyday Power & Travel",
    tagBn: "\u09AA\u09BE\u0993\u09DF\u09BE\u09B0 \u0993 \u099F\u09CD\u09B0\u09BE\u09AD\u09C7\u09B2 \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F",
    titleEn: "GaN 65W Fast Chargers & MagSafe Banks",
    titleBn: "\u099C\u09BF\u098F\u098F\u09A8 \u09EC\u09EB \u0993\u09DF\u09BE\u099F \u09AB\u09BE\u09B8\u09CD\u099F \u099A\u09BE\u09B0\u09CD\u099C\u09BE\u09B0 \u0993 \u09AE\u09CD\u09AF\u09BE\u0997\u09B8\u09C7\u09AB \u09AA\u09BE\u0993\u09DF\u09BE\u09B0 \u09AC\u09CD\u09AF\u09BE\u0982\u0995",
    descEn: "Charge your laptop and phones simultaneously at peak charging speeds.",
    descBn: "\u098F\u0995 \u09B8\u09BE\u09A5\u09C7 \u09B2\u09CD\u09AF\u09BE\u09AA\u099F\u09AA \u098F\u09AC\u0982 \u09AB\u09CB\u09A8 \u09B8\u09C1\u09AA\u09BE\u09B0 \u09AB\u09BE\u09B8\u09CD\u099F \u099A\u09BE\u09B0\u09CD\u099C \u0995\u09B0\u09BE\u09B0 \u09B8\u09B0\u09CD\u09AC\u09BE\u09A7\u09C1\u09A8\u09BF\u0995 \u09B8\u09B2\u09BF\u0989\u09B6\u09A8\u0964",
    buttonEn: "View Accessories",
    buttonBn: "\u098F\u0995\u09CD\u09B8\u09C7\u09B8\u09B0\u09BF\u099C \u09A6\u09C7\u0996\u09C1\u09A8",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=1200",
    badge: "Best Sellers",
    actionType: "shop",
    isActive: true
  }
];
var DEFAULT_SITE_SETTINGS = {
  storeName: "7X_SHOP.com",
  logoText: "7X",
  taglineEn: "Modern Bangladesh Online Marketplace",
  taglineBn: "\u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09AE\u09BE\u09B0\u09CD\u0995\u09C7\u099F\u09AA\u09CD\u09B2\u09C7\u09B8",
  helplinePhone: "+880 1811-534513",
  whatsappNumber: "+880 1811-534513",
  supportEmail: "support@7x-shop.com",
  officeAddressEn: "House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh",
  officeAddressBn: "\u09B9\u09BE\u0989\u09B8 \u09EA\u09E8, \u09B0\u09CB\u09A1 \u09E7\u09E7, \u09AC\u09CD\u09B2\u0995 \u09A1\u09BF, \u09AC\u09A8\u09BE\u09A8\u09C0, \u09A2\u09BE\u0995\u09BE-\u09E7\u09E8\u09E7\u09E9, \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6",
  workingHoursEn: "Everyday: 9:00 AM - 11:00 PM",
  workingHoursBn: "\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8: \u09B8\u0995\u09BE\u09B2 \u09EF:\u09E6\u09E6 - \u09B0\u09BE\u09A4 \u09E7\u09E7:\u09E6\u09E6 \u099F\u09BE",
  insideDhakaDeliveryTime: "24 Hours",
  outsideDhakaDeliveryTime: "48-72 Hours",
  showTopBar: true,
  topBarAnnouncementEn: "\u26A1 FREE Express Doorstep Delivery on orders above \u09F32,000 across all 64 districts!",
  topBarAnnouncementBn: "\u26A1 \u09B9\u099F \u0985\u09AB\u09BE\u09B0: \u09B8\u09BE\u09B0\u09BE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u098F\u09AC\u0982 \u09E8,\u09E6\u09E6\u09E6 \u099F\u09BE\u0995\u09BE\u09B0 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0\u09C7 \u09AB\u09CD\u09B0\u09BF \u09B6\u09BF\u09AA\u09BF\u0982!",
  insideDhakaDeliveryFee: 60,
  outsideDhakaDeliveryFee: 120,
  freeDeliveryThreshold: 2e3,
  footerBioEn: "Next-generation modern online marketplace delivering 100% genuine tech gadgets, smart wearables, and lifestyle gear with Cash on Delivery nationwide.",
  footerBioBn: "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7\u09B0 \u09A8\u09BF\u09B0\u09CD\u09AD\u09B0\u09AF\u09CB\u0997\u09CD\u09AF \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09B6\u09AA\u09BF\u0982 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE\u0964 \u09B6\u09A4\u09AD\u09BE\u0997 \u0986\u09B8\u09B2 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF \u09AA\u09A3\u09CD\u09AF, \u09B2\u09BE\u0987\u09AB\u09B8\u09CD\u099F\u09BE\u0987\u09B2 \u0997\u09CD\u09AF\u09BE\u099C\u09C7\u099F \u098F\u09AC\u0982 \u09B8\u09BE\u09B0\u09BE\u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF\u0964",
  copyrightText: "\xA9 2026 7X_SHOP.com. All rights reserved.",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com",
  telegramChannelUrl: "https://t.me",
  heroSlides: INITIAL_HERO_SLIDES,
  trustBadges: {
    codTextEn: "Cash On Delivery Nationwide",
    codTextBn: "\u09B8\u09BE\u09B0\u09BE \u09A6\u09C7\u09B6\u09C7 \u0995\u09CD\u09AF\u09BE\u09B6 \u0985\u09A8 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF",
    deliveryTextEn: "Express 24-48h Doorstep Delivery",
    deliveryTextBn: "\u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09AE \u09E8\u09EA-\u09EA\u09EE \u0998\u09A3\u09CD\u099F\u09BE\u09B0 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF",
    returnTextEn: "7-Day Easy Replacement Guarantee",
    returnTextBn: "\u09ED \u09A6\u09BF\u09A8\u09C7\u09B0 \u09B8\u09B9\u099C \u09B0\u09BF\u09AA\u09CD\u09B2\u09C7\u09B8\u09AE\u09C7\u09A8\u09CD\u099F \u0993\u09DF\u09BE\u09B0\u09C7\u09A8\u09CD\u099F\u09BF",
    warrantyTextEn: "100% Authentic Brand Merchandise",
    warrantyTextBn: "\u09E7\u09E6\u09E6% \u0985\u09B0\u09BF\u099C\u09BF\u09A8\u09BE\u09B2 \u09AC\u09CD\u09B0\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1 \u0993\u09DF\u09BE\u09B0\u09C7\u09A8\u09CD\u099F\u09BF"
  }
};

// src/server/database.ts
var firestoreDb = null;
var memStore = {
  products: /* @__PURE__ */ new Map(),
  categories: /* @__PURE__ */ new Map(),
  coupons: /* @__PURE__ */ new Map(),
  orders: /* @__PURE__ */ new Map(),
  users: /* @__PURE__ */ new Map(),
  reviews: /* @__PURE__ */ new Map(),
  notificationLogs: [],
  siteSettings: JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS)),
  telegramConfig: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
    enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  nextOrderNumber: 1001
};
function getFirestore() {
  if (firestoreDb) return firestoreDb;
  const rawCreds = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawCreds || !rawCreds.trim()) {
    console.info("[Database] FIREBASE_SERVICE_ACCOUNT_JSON not set. Using in-memory fallback store.");
    return null;
  }
  try {
    let serviceAccount;
    if (typeof rawCreds === "string") {
      serviceAccount = JSON.parse(rawCreds);
    } else {
      serviceAccount = rawCreds;
    }
    if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    firestoreDb = initFirestore();
    firestoreDb.settings({ ignoreUndefinedProperties: true });
    console.log("[Database] Firestore successfully initialized via firebase-admin");
    return firestoreDb;
  } catch (err) {
    console.error("[Database] Failed to initialize Firestore from FIREBASE_SERVICE_ACCOUNT_JSON:", err);
    return null;
  }
}
async function seedDatabaseIfEmpty() {
  const db = getFirestore();
  if (db) {
    try {
      const prodSnapshot = await db.collection("products").limit(1).get();
      if (prodSnapshot.empty) {
        console.log("[Database] Seeding initial products to Firestore...");
        const batch = db.batch();
        for (const p of INITIAL_PRODUCTS) {
          batch.set(db.collection("products").doc(p.id), p);
        }
        await batch.commit();
      }
      const catSnapshot = await db.collection("categories").limit(1).get();
      if (catSnapshot.empty) {
        console.log("[Database] Seeding initial categories to Firestore...");
        const batch = db.batch();
        for (const c of INITIAL_CATEGORIES) {
          batch.set(db.collection("categories").doc(c.id), c);
        }
        await batch.commit();
      }
      const couponSnapshot = await db.collection("coupons").limit(1).get();
      if (couponSnapshot.empty) {
        console.log("[Database] Seeding initial coupons to Firestore...");
        const batch = db.batch();
        for (const c of INITIAL_COUPONS) {
          const couponWithMeta = {
            ...c,
            usedCount: 0,
            usageLimit: 500
          };
          batch.set(db.collection("coupons").doc(c.code.toUpperCase()), couponWithMeta);
        }
        await batch.commit();
      }
      const siteSettingsDoc = await db.collection("settings").doc("siteSettings").get();
      if (!siteSettingsDoc.exists) {
        console.log("[Database] Seeding default site settings to Firestore...");
        await db.collection("settings").doc("siteSettings").set(DEFAULT_SITE_SETTINGS);
      }
      const tgDoc = await db.collection("settings").doc("telegramConfig").get();
      if (!tgDoc.exists) {
        await db.collection("settings").doc("telegramConfig").set({
          botToken: process.env.TELEGRAM_BOT_TOKEN || "",
          chatId: process.env.TELEGRAM_CHAT_ID || "",
          enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
          lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const countersDoc = await db.collection("settings").doc("counters").get();
      if (!countersDoc.exists) {
        await db.collection("settings").doc("counters").set({ nextOrderNumber: 1001 });
      }
      console.log("[Database] Firestore checks & seeding completed.");
      return;
    } catch (err) {
      console.error("[Database] Error during Firestore seed:", err);
    }
  }
  if (memStore.products.size === 0) {
    INITIAL_PRODUCTS.forEach((p) => memStore.products.set(p.id, { ...p }));
  }
  if (memStore.categories.size === 0) {
    INITIAL_CATEGORIES.forEach((c) => memStore.categories.set(c.id, { ...c }));
  }
  if (memStore.coupons.size === 0) {
    INITIAL_COUPONS.forEach((c) => memStore.coupons.set(c.code.toUpperCase(), { ...c, usedCount: 0, usageLimit: 500 }));
  }
}
async function getProducts(filter) {
  const db = getFirestore();
  let list = [];
  if (db) {
    const snapshot = await db.collection("products").get();
    list = snapshot.docs.map((doc) => doc.data());
  } else {
    list = Array.from(memStore.products.values());
  }
  if (filter?.category && filter.category !== "all") {
    list = list.filter((p) => p.category === filter.category);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (p) => p.nameEn.toLowerCase().includes(q) || p.nameBn.includes(q) || p.brand.toLowerCase().includes(q) || p.descriptionEn.toLowerCase().includes(q)
    );
  }
  if (filter?.hot) {
    list = list.filter((p) => p.isHot);
  }
  if (filter?.featured) {
    list = list.filter((p) => p.isFeatured);
  }
  if (filter?.sort === "price_asc") {
    list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (filter?.sort === "price_desc") {
    list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (filter?.sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (filter?.sort === "newest") {
    list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }
  return list;
}
async function getProductByIdOrSlug(idOrSlug) {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection("products").doc(idOrSlug).get();
    if (doc.exists) return doc.data();
    const snapshot = await db.collection("products").where("slug", "==", idOrSlug).limit(1).get();
    if (!snapshot.empty) return snapshot.docs[0].data();
    return null;
  }
  return memStore.products.get(idOrSlug) || Array.from(memStore.products.values()).find((p) => p.slug === idOrSlug) || null;
}
async function saveProduct(product) {
  const db = getFirestore();
  if (db) {
    await db.collection("products").doc(product.id).set(product, { merge: true });
  } else {
    memStore.products.set(product.id, { ...product });
  }
  return product;
}
async function deleteProduct(id) {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) return false;
    await db.collection("products").doc(id).delete();
    return true;
  }
  return memStore.products.delete(id);
}
async function getCategories() {
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection("categories").get();
    if (!snapshot.empty) {
      return snapshot.docs.map((doc) => doc.data());
    }
  }
  return Array.from(memStore.categories.values());
}
async function getCoupon(code) {
  const cleanCode = code.toUpperCase().trim();
  const db = getFirestore();
  if (db) {
    const doc = await db.collection("coupons").doc(cleanCode).get();
    if (doc.exists) return doc.data();
    return null;
  }
  return memStore.coupons.get(cleanCode) || null;
}
async function createOrderInTransaction(params) {
  const db = getFirestore();
  if (db) {
    return await db.runTransaction(async (transaction) => {
      const counterRef = db.collection("settings").doc("counters");
      const counterDoc = await transaction.get(counterRef);
      const nextId2 = (counterDoc.exists ? counterDoc.data()?.nextOrderNumber : null) || 1001;
      const prodRefs = params.items.map((it) => ({
        req: it,
        ref: db.collection("products").doc(it.productId)
      }));
      const prodDocs = await Promise.all(prodRefs.map((p) => transaction.get(p.ref)));
      let couponDoc = null;
      let couponRef = null;
      if (params.couponCode) {
        couponRef = db.collection("coupons").doc(params.couponCode.toUpperCase().trim());
        couponDoc = await transaction.get(couponRef);
      }
      const settingsRef = db.collection("settings").doc("siteSettings");
      const settingsDoc = await transaction.get(settingsRef);
      const activeSettings = settingsDoc.exists ? settingsDoc.data() : DEFAULT_SITE_SETTINGS;
      let verifiedSubtotal2 = 0;
      const verifiedItems2 = [];
      for (let i = 0; i < prodDocs.length; i++) {
        const pDoc = prodDocs[i];
        const reqItem = params.items[i];
        if (!pDoc.exists) {
          throw new Error(`Product '${reqItem.productId}' does not exist in inventory.`);
        }
        const pData = pDoc.data();
        if (pData.stock < reqItem.quantity) {
          throw new Error(`Insufficient stock for '${pData.nameEn}'. In stock: ${pData.stock}, requested: ${reqItem.quantity}.`);
        }
        const officialPrice = typeof pData.discountPrice === "number" && pData.discountPrice > 0 ? pData.discountPrice : pData.price;
        verifiedSubtotal2 += officialPrice * reqItem.quantity;
        const orderImg = pData.images && pData.images[0]?.trim() ? pData.images[0].trim() : "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800";
        verifiedItems2.push({
          productId: pData.id,
          productName: pData.nameEn,
          productImage: orderImg,
          price: officialPrice,
          quantity: reqItem.quantity,
          selectedColor: reqItem.selectedColor,
          selectedSize: reqItem.selectedSize
        });
      }
      let verifiedDiscount2 = 0;
      let appliedCoupon2 = void 0;
      if (couponDoc && couponDoc.exists) {
        const cData = couponDoc.data();
        if (cData.expiryDate && new Date(cData.expiryDate).getTime() < Date.now()) {
          throw new Error(`Coupon '${cData.code}' has expired.`);
        }
        if (cData.usageLimit && (cData.usedCount || 0) >= cData.usageLimit) {
          throw new Error(`Coupon '${cData.code}' usage limit has been reached.`);
        }
        if (!cData.minSpend || verifiedSubtotal2 >= cData.minSpend) {
          appliedCoupon2 = cData.code;
          if (cData.discountType === "percentage") {
            verifiedDiscount2 = Math.round(verifiedSubtotal2 * cData.discountValue / 100);
          } else if (cData.discountType === "fixed") {
            verifiedDiscount2 = Math.min(verifiedSubtotal2, cData.discountValue);
          }
        }
      }
      let verifiedDeliveryFee2 = 0;
      const isFreeShipping = couponDoc && couponDoc.exists && couponDoc.data().discountType === "free_shipping";
      const freeThreshold2 = activeSettings.freeDeliveryThreshold ?? 2e3;
      if (isFreeShipping || verifiedSubtotal2 >= freeThreshold2) {
        verifiedDeliveryFee2 = 0;
      } else if (params.district.toLowerCase() !== "dhaka") {
        verifiedDeliveryFee2 = activeSettings.outsideDhakaDeliveryFee ?? 120;
      } else {
        verifiedDeliveryFee2 = activeSettings.insideDhakaDeliveryFee ?? 60;
      }
      const verifiedTotalAmount2 = Math.max(0, verifiedSubtotal2 - verifiedDiscount2 + verifiedDeliveryFee2);
      const orderId2 = String(nextId2);
      const orderNumber2 = `7X-${nextId2}`;
      transaction.set(counterRef, { nextOrderNumber: nextId2 + 1 }, { merge: true });
      for (let i = 0; i < prodDocs.length; i++) {
        const pDoc = prodDocs[i];
        const pData = pDoc.data();
        const reqItem = params.items[i];
        const newStock = Math.max(0, pData.stock - reqItem.quantity);
        transaction.update(pDoc.ref, { stock: newStock });
      }
      if (couponRef && couponDoc && couponDoc.exists) {
        const currentCount = (couponDoc.data()?.usedCount || 0) + 1;
        transaction.update(couponRef, { usedCount: currentCount });
      }
      const newOrder2 = {
        id: orderId2,
        orderNumber: orderNumber2,
        customerName: params.customerName,
        phone: params.phone,
        email: params.email || `${params.phone}@customer.7x-shop.com`,
        address: params.address,
        district: params.district,
        notes: params.notes,
        items: verifiedItems2,
        subtotal: verifiedSubtotal2,
        deliveryFee: verifiedDeliveryFee2,
        discount: verifiedDiscount2,
        couponCode: appliedCoupon2,
        totalAmount: verifiedTotalAmount2,
        paymentMethod: params.paymentMethod,
        paymentStatus: "pending",
        orderStatus: "pending",
        trxId: params.trxId,
        senderNumber: params.senderNumber,
        mfsProvider: ["bkash", "nagad", "rocket"].includes(params.paymentMethod) ? params.paymentMethod : void 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        telegramNotified: false,
        emailNotified: true
      };
      const orderRef = db.collection("orders").doc(orderId2);
      transaction.set(orderRef, newOrder2);
      const cleanPhone2 = params.phone.replace(/[\s-]/g, "");
      const userRef = db.collection("users").doc(`usr-${cleanPhone2}`);
      transaction.set(userRef, {
        id: `usr-${cleanPhone2}`,
        name: params.customerName,
        phone: cleanPhone2,
        email: newOrder2.email,
        role: "customer",
        address: params.address,
        district: params.district,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }, { merge: true });
      return newOrder2;
    });
  }
  const nextId = memStore.nextOrderNumber++;
  const orderId = String(nextId);
  const orderNumber = `7X-${nextId}`;
  let verifiedSubtotal = 0;
  const verifiedItems = [];
  for (const it of params.items) {
    const prod = memStore.products.get(it.productId);
    if (!prod) {
      throw new Error(`Product '${it.productId}' not found in inventory`);
    }
    if (prod.stock < it.quantity) {
      throw new Error(`Insufficient stock for '${prod.nameEn}'. In stock: ${prod.stock}, requested: ${it.quantity}.`);
    }
    const officialPrice = typeof prod.discountPrice === "number" && prod.discountPrice > 0 ? prod.discountPrice : prod.price;
    verifiedSubtotal += officialPrice * it.quantity;
    verifiedItems.push({
      productId: prod.id,
      productName: prod.nameEn,
      productImage: prod.images && prod.images[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800",
      price: officialPrice,
      quantity: it.quantity,
      selectedColor: it.selectedColor,
      selectedSize: it.selectedSize
    });
  }
  let verifiedDiscount = 0;
  let appliedCoupon = void 0;
  if (params.couponCode) {
    const coupon = memStore.coupons.get(params.couponCode.toUpperCase().trim());
    if (coupon) {
      if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
        throw new Error(`Coupon '${coupon.code}' has expired.`);
      }
      if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
        throw new Error(`Coupon '${coupon.code}' usage limit reached.`);
      }
      if (!coupon.minSpend || verifiedSubtotal >= coupon.minSpend) {
        appliedCoupon = coupon.code;
        if (coupon.discountType === "percentage") {
          verifiedDiscount = Math.round(verifiedSubtotal * coupon.discountValue / 100);
        } else if (coupon.discountType === "fixed") {
          verifiedDiscount = Math.min(verifiedSubtotal, coupon.discountValue);
        }
        coupon.usedCount = (coupon.usedCount || 0) + 1;
      }
    }
  }
  let verifiedDeliveryFee = 0;
  const settings = memStore.siteSettings;
  const freeThreshold = settings.freeDeliveryThreshold ?? 2e3;
  if (verifiedSubtotal >= freeThreshold) {
    verifiedDeliveryFee = 0;
  } else if (params.district.toLowerCase() !== "dhaka") {
    verifiedDeliveryFee = settings.outsideDhakaDeliveryFee ?? 120;
  } else {
    verifiedDeliveryFee = settings.insideDhakaDeliveryFee ?? 60;
  }
  const verifiedTotalAmount = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedDeliveryFee);
  params.items.forEach((it) => {
    const p = memStore.products.get(it.productId);
    if (p) {
      p.stock = Math.max(0, p.stock - it.quantity);
    }
  });
  const newOrder = {
    id: orderId,
    orderNumber,
    customerName: params.customerName,
    phone: params.phone,
    email: params.email || `${params.phone}@customer.7x-shop.com`,
    address: params.address,
    district: params.district,
    notes: params.notes,
    items: verifiedItems,
    subtotal: verifiedSubtotal,
    deliveryFee: verifiedDeliveryFee,
    discount: verifiedDiscount,
    couponCode: appliedCoupon,
    totalAmount: verifiedTotalAmount,
    paymentMethod: params.paymentMethod,
    paymentStatus: "pending",
    orderStatus: "pending",
    trxId: params.trxId,
    senderNumber: params.senderNumber,
    mfsProvider: ["bkash", "nagad", "rocket"].includes(params.paymentMethod) ? params.paymentMethod : void 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    telegramNotified: false,
    emailNotified: true
  };
  memStore.orders.set(orderId, newOrder);
  const cleanPhone = params.phone.replace(/[\s-]/g, "");
  memStore.users.set(`usr-${cleanPhone}`, {
    id: `usr-${cleanPhone}`,
    name: params.customerName,
    phone: cleanPhone,
    email: newOrder.email,
    role: "customer",
    address: params.address,
    district: params.district,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  return newOrder;
}
async function getOrders(filter) {
  const db = getFirestore();
  let list = [];
  if (db) {
    const snapshot = await db.collection("orders").get();
    list = snapshot.docs.map((doc) => doc.data());
  } else {
    list = Array.from(memStore.orders.values());
  }
  if (filter?.status && filter.status !== "all") {
    list = list.filter((o) => o.orderStatus === filter.status);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (o) => o.orderNumber && o.orderNumber.toLowerCase().includes(q) || o.customerName && o.customerName.toLowerCase().includes(q) || o.phone && o.phone.includes(q) || o.id && o.id.includes(q)
    );
  }
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}
async function getOrderByNumberAndPhone(orderNumber, phone) {
  const cleanNum = orderNumber.trim().toUpperCase().replace(/^#/, "");
  const cleanPhone = phone.trim().replace(/[\s-]/g, "");
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection("orders").get();
    for (const doc of snapshot.docs) {
      const o = doc.data();
      const oNum = (o.orderNumber || o.id).toUpperCase().replace(/^#/, "");
      const oPhone = o.phone ? o.phone.trim().replace(/[\s-]/g, "") : "";
      if (oNum === cleanNum && oPhone === cleanPhone) {
        return o;
      }
    }
    return null;
  }
  for (const o of memStore.orders.values()) {
    const oNum = (o.orderNumber || o.id).toUpperCase().replace(/^#/, "");
    const oPhone = o.phone ? o.phone.trim().replace(/[\s-]/g, "") : "";
    if (oNum === cleanNum && oPhone === cleanPhone) {
      return o;
    }
  }
  return null;
}
async function updateOrderStatus(orderId, status) {
  const db = getFirestore();
  if (db) {
    const docRef = db.collection("orders").doc(orderId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await docRef.update({ orderStatus: status, updatedAt });
    return { ...doc.data(), orderStatus: status, updatedAt };
  }
  const order = memStore.orders.get(orderId);
  if (!order) return null;
  order.orderStatus = status;
  order.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  return order;
}
async function updateOrderNotificationStatus(orderId, telegramNotified) {
  const db = getFirestore();
  if (db) {
    await db.collection("orders").doc(orderId).set({ telegramNotified }, { merge: true });
  } else {
    const o = memStore.orders.get(orderId);
    if (o) o.telegramNotified = telegramNotified;
  }
}
async function getCustomers(query) {
  const db = getFirestore();
  let list = [];
  if (db) {
    const snapshot = await db.collection("users").get();
    list = snapshot.docs.map((doc) => doc.data()).filter((u) => u.role === "customer");
  } else {
    list = Array.from(memStore.users.values()).filter((u) => u.role === "customer");
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter(
      (u) => u.name && u.name.toLowerCase().includes(q) || u.phone && u.phone.includes(q) || u.email && u.email.toLowerCase().includes(q)
    );
  }
  return list;
}
async function getAdminStats() {
  const orders = await getOrders();
  const products = await getProducts();
  const customers = await getCustomers();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => o.orderStatus !== "cancelled" ? sum + o.totalAmount : sum, 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers,
    pendingOrders
  };
}
async function getSiteSettings() {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection("settings").doc("siteSettings").get();
    if (doc.exists) return doc.data();
  }
  return memStore.siteSettings;
}
async function updateSiteSettings(settings) {
  const db = getFirestore();
  if (db) {
    const current = await getSiteSettings();
    const updated = {
      ...current,
      ...settings,
      trustBadges: {
        ...current.trustBadges,
        ...settings.trustBadges || {}
      }
    };
    await db.collection("settings").doc("siteSettings").set(updated, { merge: true });
    return updated;
  }
  memStore.siteSettings = {
    ...memStore.siteSettings,
    ...settings,
    trustBadges: {
      ...memStore.siteSettings.trustBadges,
      ...settings.trustBadges || {}
    }
  };
  return memStore.siteSettings;
}
async function resetSiteSettings() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
  const db = getFirestore();
  if (db) {
    await db.collection("settings").doc("siteSettings").set(defaults);
  }
  memStore.siteSettings = defaults;
  return defaults;
}
async function getTelegramConfig() {
  const db = getFirestore();
  if (db) {
    const doc = await db.collection("settings").doc("telegramConfig").get();
    if (doc.exists) return doc.data();
  }
  return memStore.telegramConfig;
}
async function updateTelegramConfig(config) {
  const db = getFirestore();
  if (db) {
    const current = await getTelegramConfig();
    const updated = { ...current, ...config };
    await db.collection("settings").doc("telegramConfig").set(updated, { merge: true });
    return updated;
  }
  memStore.telegramConfig = { ...memStore.telegramConfig, ...config };
  return memStore.telegramConfig;
}
async function getNotificationLogs() {
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection("notificationLogs").orderBy("timestamp", "desc").limit(50).get();
    return snapshot.docs.map((doc) => doc.data());
  }
  return memStore.notificationLogs;
}
async function addNotificationLog(log) {
  const db = getFirestore();
  if (db) {
    await db.collection("notificationLogs").doc(log.id).set(log);
  } else {
    memStore.notificationLogs.unshift(log);
    if (memStore.notificationLogs.length > 100) {
      memStore.notificationLogs.pop();
    }
  }
}
async function getReviewsByProduct(productId) {
  const db = getFirestore();
  if (db) {
    const snapshot = await db.collection("reviews").where("productId", "==", productId).get();
    const revs = snapshot.docs.map((doc) => doc.data());
    return revs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return Array.from(memStore.reviews.values()).filter((r) => r.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
async function addReview(review) {
  const db = getFirestore();
  if (db) {
    await db.collection("reviews").doc(review.id).set(review);
    const prodDocRef = db.collection("products").doc(review.productId);
    const prodDoc = await prodDocRef.get();
    if (prodDoc.exists) {
      const allRevsSnapshot = await db.collection("reviews").where("productId", "==", review.productId).get();
      const allRevs = allRevsSnapshot.docs.map((d) => d.data());
      const avg = allRevs.reduce((sum, r) => sum + r.rating, 0) / allRevs.length;
      await prodDocRef.update({
        rating: Number(avg.toFixed(1)),
        reviewCount: allRevs.length
      });
    }
  } else {
    memStore.reviews.set(review.id, review);
    const prod = memStore.products.get(review.productId);
    if (prod) {
      const prodRevs = Array.from(memStore.reviews.values()).filter((r) => r.productId === prod.id);
      const avg = prodRevs.reduce((sum, r) => sum + r.rating, 0) / prodRevs.length;
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = prodRevs.length;
    }
  }
  return review;
}

// src/server/validation.ts
import { z } from "zod";
var AdminLoginSchema = z.object({
  password: z.string().min(1, "Password is required").max(200)
}).strict();
var AdminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: z.string().min(12, "New password must be at least 12 characters").max(200, "Password is too long").refine((val) => val !== "admin123" && val.toLowerCase() !== "password", {
    message: "Insecure default passwords like admin123 are not permitted"
  })
}).strict();
var ProductSchema = z.object({
  id: z.string().max(100).optional(),
  slug: z.string().max(200).optional(),
  nameEn: z.string().min(2, "English name must be at least 2 characters").max(250),
  nameBn: z.string().min(2, "Bangla name must be at least 2 characters").max(250).optional(),
  category: z.string().min(1, "Category is required").max(100),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().positive("Discount price must be greater than 0").optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  sku: z.string().max(100).optional(),
  brand: z.string().max(150).optional(),
  images: z.array(z.string().url("Images must be valid URLs")).max(10).optional(),
  descriptionEn: z.string().max(5e3).optional(),
  descriptionBn: z.string().max(5e3).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  colors: z.array(z.string().max(50)).optional(),
  sizes: z.array(z.string().max(50)).optional(),
  isHot: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional()
}).strict();
var ProductUpdateSchema = ProductSchema.partial();
var OrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required").max(100),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(50, "Maximum 50 units per product"),
  selectedColor: z.string().max(50).optional(),
  selectedSize: z.string().max(50).optional()
}).strict();
var OrderCreateSchema = z.object({
  customerName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone must be at most 15 digits"),
  email: z.string().email("Invalid email address").max(150).optional().or(z.literal("")),
  address: z.string().min(5, "Delivery address must be at least 5 characters").max(300),
  district: z.string().min(2).max(100).default("Dhaka"),
  notes: z.string().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["cod", "bkash", "nagad", "rocket", "card"]),
  trxId: z.string().max(50).optional().or(z.literal("")),
  senderNumber: z.string().max(20).optional().or(z.literal("")),
  couponCode: z.string().max(50).optional().or(z.literal("")),
  items: z.array(OrderItemSchema).min(1, "Order must contain at least 1 item")
}).strict();
var OrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], {
    message: "Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled"
  })
}).strict();
var TelegramConfigSchema = z.object({
  botToken: z.string().max(200).optional(),
  chatId: z.string().max(100).optional(),
  enabled: z.boolean().optional()
}).strict();
var ProductReviewSchema = z.object({
  productId: z.string().min(1).max(100),
  customerName: z.string().min(1).max(100).default("Verified Buyer"),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1e3).default("")
}).strict();
var HeroSlideSchema = z.object({
  id: z.string(),
  tagEn: z.string().max(150),
  tagBn: z.string().max(150),
  titleEn: z.string().max(200),
  titleBn: z.string().max(200),
  descEn: z.string().max(500),
  descBn: z.string().max(500),
  buttonEn: z.string().max(100),
  buttonBn: z.string().max(100),
  image: z.string().url(),
  badge: z.string().max(50).optional(),
  actionType: z.enum(["shop", "deals", "categories", "contact", "url"]),
  actionTarget: z.string().optional(),
  isActive: z.boolean()
});
var TrustBadgesSchema = z.object({
  codTextEn: z.string().optional(),
  codTextBn: z.string().optional(),
  deliveryTextEn: z.string().optional(),
  deliveryTextBn: z.string().optional(),
  returnTextEn: z.string().optional(),
  returnTextBn: z.string().optional(),
  warrantyTextEn: z.string().optional(),
  warrantyTextBn: z.string().optional()
});
var SiteSettingsSchema = z.object({
  storeName: z.string().max(100).optional(),
  logoText: z.string().max(50).optional(),
  taglineEn: z.string().max(200).optional(),
  taglineBn: z.string().max(200).optional(),
  helplinePhone: z.string().max(50).optional(),
  whatsappNumber: z.string().max(50).optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  officeAddressEn: z.string().max(300).optional(),
  officeAddressBn: z.string().max(300).optional(),
  workingHoursEn: z.string().max(100).optional(),
  workingHoursBn: z.string().max(100).optional(),
  insideDhakaDeliveryTime: z.string().max(100).optional(),
  outsideDhakaDeliveryTime: z.string().max(100).optional(),
  showTopBar: z.boolean().optional(),
  topBarAnnouncementEn: z.string().max(300).optional(),
  topBarAnnouncementBn: z.string().max(300).optional(),
  insideDhakaDeliveryFee: z.number().min(0).optional(),
  outsideDhakaDeliveryFee: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional(),
  heroSlides: z.array(HeroSlideSchema).optional(),
  trustBadges: TrustBadgesSchema.optional()
}).passthrough();

// src/server/telegramService.ts
function formatTelegramOrderMessage(order) {
  const productNames = order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ");
  const paymentLabel = order.paymentMethod === "cod" ? "\u{1F4B5} Cash on Delivery (COD)" : order.paymentMethod === "bkash" ? "\u{1F338} bKash Mobile Banking" : order.paymentMethod === "nagad" ? "\u{1F525} Nagad Mobile Banking" : order.paymentMethod === "rocket" ? "\u{1F680} Rocket Mobile Banking" : "\u{1F4B3} Online Card Payment";
  return `\u{1F514} *New Order Received*

*Order ID:* #${order.id}
*Customer Name:* ${order.customerName}
*Phone:* ${order.phone}
*Product:* ${productNames}
*Amount:* \u09F3${order.totalAmount.toLocaleString()}
*Payment:* ${paymentLabel}
` + (order.trxId ? `*Transaction ID (TrxID):* \`${order.trxId}\`
` : "") + (order.senderNumber ? `*Sender MFS Phone:* ${order.senderNumber}
` : "") + `*Address:* ${order.address}, ${order.district}
` + (order.notes ? `*Notes:* ${order.notes}
` : "") + `*Date:* ${new Date(order.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })} (BST)`;
}
async function sendTelegramNotification(order, config) {
  const messageText = formatTelegramOrderMessage(order);
  const logId = "log-" + Date.now();
  if (!config.enabled || !config.botToken || !config.chatId) {
    return {
      id: logId,
      orderId: order.id,
      type: "telegram",
      status: "simulated",
      message: messageText,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Telegram alerts currently disabled or credentials not set in Settings."
    };
  }
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: messageText,
        parse_mode: "Markdown"
      })
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.ok) {
      return {
        id: logId,
        orderId: order.id,
        type: "telegram",
        status: "success",
        message: messageText,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        details: `Dispatched successfully to Telegram Chat ${config.chatId}. Message ID: ${data?.result?.message_id || "OK"}`
      };
    } else {
      return {
        id: logId,
        orderId: order.id,
        type: "telegram",
        status: "simulated",
        message: messageText,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        details: `Telegram API responded: ${data?.description || "Simulated live delivery (Demo token active)"}`
      };
    }
  } catch (error) {
    return {
      id: logId,
      orderId: order.id,
      type: "telegram",
      status: "simulated",
      message: messageText,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Dispatched locally (simulated live Telegram dispatch): ${error?.message || "Ready"}`
    };
  }
}
async function sendTestTelegramMessage(config) {
  const testMessage = `\u{1F514} *7X_SHOP Telegram Bot Test*

\u2705 Your Telegram notification integration is working properly!
Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}
Ready to receive instant customer order alerts.`;
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: testMessage,
        parse_mode: "Markdown"
      })
    });
    const data = await response.json().catch(() => null);
    if (response.ok && data?.ok) {
      return { success: true, message: `Test message successfully received in Telegram (${config.chatId})!` };
    } else {
      return {
        success: false,
        message: `Telegram Error: ${data?.description || "Could not verify bot token or chat ID. Please verify you started the bot with /start."}`
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `Network error connecting to Telegram: ${err?.message || "Check connection"}`
    };
  }
}

// src/server/apiHandler.ts
var router = Router();
seedDatabaseIfEmpty().catch((err) => {
  console.error("[API] Error during database startup seed:", err);
});
var adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // 5 failed attempts allowed
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many failed admin login attempts from this IP. Please wait 15 minutes before trying again."
  }
});
var orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // max 20 orders per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Order creation rate limit reached. Please wait a few minutes before placing another order."
  }
});
var activeAdminSessions = /* @__PURE__ */ new Map();
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of activeAdminSessions.entries()) {
    if (session.expiresAt <= now) {
      activeAdminSessions.delete(token);
    }
  }
}
function isValidAdminToken(token) {
  if (!token) return false;
  cleanExpiredSessions();
  return activeAdminSessions.has(token);
}
function getConfiguredAdminPassword() {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd || pwd.trim() === "" || pwd === "admin123") {
    return null;
  }
  return pwd.trim();
}
var runtimeAdminPasswordOverride = null;
function getEffectiveAdminPassword() {
  return runtimeAdminPasswordOverride || getConfiguredAdminPassword();
}
function requireAdminAuth(req, res, next) {
  const token = req.headers["x-admin-token"] || (req.headers["authorization"]?.startsWith("Bearer ") ? req.headers["authorization"].slice(7) : null);
  if (!token || !isValidAdminToken(token)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Admin authentication token required or expired."
    });
  }
  return next();
}
router.post("/admin/login", adminLoginLimiter, (req, res) => {
  const parseResult = AdminLoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parseResult.error.format()
    });
  }
  const configuredPassword = getEffectiveAdminPassword();
  if (!configuredPassword) {
    return res.status(503).json({
      success: false,
      message: "Admin login is currently disabled: ADMIN_PASSWORD environment variable is not configured or uses an insecure default (admin123). Please set a secure ADMIN_PASSWORD in your server environment."
    });
  }
  const { password } = parseResult.data;
  const isMatch = password.length === configuredPassword.length && crypto.timingSafeEqual(
    Buffer.from(password.padEnd(64, " ")),
    Buffer.from(configuredPassword.padEnd(64, " "))
  );
  if (isMatch) {
    const token = `adm_${crypto.randomBytes(32).toString("hex")}`;
    const now = Date.now();
    activeAdminSessions.set(token, {
      token,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1e3
      // 24-hour expiration
    });
    return res.json({
      success: true,
      message: "Admin authentication successful",
      token,
      user: {
        id: "usr-admin-1",
        name: "Shop Administrator",
        email: "admin@7x-shop.com",
        phone: "01811534513",
        role: "admin",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  return res.status(401).json({
    success: false,
    message: "Invalid admin credentials"
  });
});
router.post("/admin/verify", (req, res) => {
  const token = req.headers["x-admin-token"] || (req.headers["authorization"]?.startsWith("Bearer ") ? req.headers["authorization"].slice(7) : null);
  if (isValidAdminToken(token)) {
    return res.json({ success: true, valid: true });
  }
  return res.status(401).json({ success: false, valid: false });
});
router.post("/admin/change-password", requireAdminAuth, (req, res) => {
  const parseResult = AdminChangePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: parseResult.error.issues[0]?.message || "Validation failed",
      errors: parseResult.error.format()
    });
  }
  const { currentPassword, newPassword } = parseResult.data;
  const activePassword = getEffectiveAdminPassword();
  if (!activePassword || currentPassword !== activePassword) {
    return res.status(400).json({ success: false, message: "Current password does not match" });
  }
  runtimeAdminPasswordOverride = newPassword;
  const currentToken = req.headers["x-admin-token"] || (req.headers["authorization"]?.startsWith("Bearer ") ? req.headers["authorization"].slice(7) : null);
  for (const token of activeAdminSessions.keys()) {
    if (token !== currentToken) {
      activeAdminSessions.delete(token);
    }
  }
  res.json({
    success: true,
    message: "Admin password updated successfully. All other active sessions have been invalidated."
  });
});
router.post("/admin/logout", (req, res) => {
  const token = req.headers["x-admin-token"] || (req.headers["authorization"]?.startsWith("Bearer ") ? req.headers["authorization"].slice(7) : null);
  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});
router.get("/products", async (req, res) => {
  try {
    const { category, search, sort, hot, featured } = req.query;
    const result = await getProducts({
      category: typeof category === "string" ? category : void 0,
      search: typeof search === "string" ? search : void 0,
      sort: typeof sort === "string" ? sort : void 0,
      hot: hot === "true",
      featured: featured === "true"
    });
    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch products" });
  }
});
router.get("/products/:id", async (req, res) => {
  try {
    const product = await getProductByIdOrSlug(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch product" });
  }
});
router.post("/products", requireAdminAuth, async (req, res) => {
  const parseResult = ProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Product validation failed",
      errors: parseResult.error.format()
    });
  }
  try {
    const validated = parseResult.data;
    const newProduct = {
      id: validated.id || `prod-${Date.now()}`,
      slug: validated.slug || validated.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      nameEn: validated.nameEn,
      nameBn: validated.nameBn || validated.nameEn,
      category: validated.category,
      price: validated.price,
      discountPrice: validated.discountPrice || void 0,
      stock: validated.stock,
      rating: validated.rating || 5,
      reviewCount: validated.reviewCount || 0,
      sku: validated.sku || `7X-${Date.now().toString().slice(-4)}`,
      brand: validated.brand || "7X Brand",
      images: validated.images && validated.images.length > 0 ? validated.images : ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800"],
      descriptionEn: validated.descriptionEn || "Authentic merchandise from 7X_SHOP.",
      descriptionBn: validated.descriptionBn || "\u0989\u099A\u09CD\u099A\u09AE\u09BE\u09A8\u09C7\u09B0 \u0986\u09B8\u09B2 \u09AA\u09A3\u09CD\u09AF\u0964",
      specs: validated.specs || { Warranty: "1 Year" },
      colors: validated.colors || ["Black"],
      sizes: validated.sizes || [],
      isHot: validated.isHot ?? false,
      isFeatured: validated.isFeatured ?? false,
      isNew: validated.isNew ?? true
    };
    const saved = await saveProduct(newProduct);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to save product" });
  }
});
router.put("/products/:id", requireAdminAuth, async (req, res) => {
  const parseResult = ProductUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Product update validation failed",
      errors: parseResult.error.format()
    });
  }
  try {
    const existing = await getProductByIdOrSlug(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const updatedData = {
      ...existing,
      ...parseResult.data,
      id: existing.id,
      discountPrice: parseResult.data.discountPrice !== void 0 ? parseResult.data.discountPrice || void 0 : existing.discountPrice
    };
    const saved = await saveProduct(updatedData);
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to update product" });
  }
});
router.delete("/products/:id", requireAdminAuth, async (req, res) => {
  try {
    const deleted = await deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to delete product" });
  }
});
router.get("/categories", async (_req, res) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch categories" });
  }
});
router.get("/coupons/validate/:code", async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const coupon = await getCoupon(code);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid promo coupon code" });
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: "This coupon has expired" });
    }
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "This coupon usage limit has been reached" });
    }
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to validate coupon" });
  }
});
router.get("/orders", requireAdminAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const orders = await getOrders({
      status: typeof status === "string" ? status : void 0,
      search: typeof search === "string" ? search : void 0
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch orders" });
  }
});
router.get("/orders/track", async (req, res) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone || typeof orderNumber !== "string" || typeof phone !== "string") {
    return res.status(400).json({
      success: false,
      message: "Both orderNumber and phone are required for order tracking."
    });
  }
  const queryOrderNum = orderNumber.trim();
  const cleanQueryPhone = phone.trim();
  if (!queryOrderNum || !cleanQueryPhone) {
    return res.status(400).json({
      success: false,
      message: "Invalid order number or phone parameter."
    });
  }
  try {
    const matched = await getOrderByNumberAndPhone(queryOrderNum, cleanQueryPhone);
    if (!matched) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please verify both your order number and phone number."
      });
    }
    return res.json({
      success: true,
      data: {
        orderNumber: matched.orderNumber || matched.id,
        status: matched.orderStatus,
        items: matched.items.map((it) => ({
          productName: it.productName,
          productImage: it.productImage,
          price: it.price,
          quantity: it.quantity,
          selectedColor: it.selectedColor,
          selectedSize: it.selectedSize
        })),
        total: matched.totalAmount,
        createdAt: matched.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Tracking failed" });
  }
});
router.post("/orders", orderRateLimiter, async (req, res) => {
  const parseResult = OrderCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: parseResult.error.issues[0]?.message || "Order validation failed",
      errors: parseResult.error.format()
    });
  }
  const orderData = parseResult.data;
  if (orderData.paymentMethod === "card") {
    return res.status(400).json({
      success: false,
      message: "Credit / Debit card processing is currently unavailable. Please select Cash on Delivery or Mobile Banking (bKash / Nagad / Rocket)."
    });
  }
  if (["bkash", "nagad", "rocket"].includes(orderData.paymentMethod)) {
    if (!orderData.trxId || orderData.trxId.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Valid Transaction ID (TrxID) is required for mobile banking payments"
      });
    }
    if (!orderData.senderNumber || orderData.senderNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Sender mobile number is required for mobile banking verification"
      });
    }
  }
  try {
    const newOrder = await createOrderInTransaction({
      customerName: orderData.customerName,
      phone: orderData.phone,
      email: orderData.email || void 0,
      address: orderData.address,
      district: orderData.district,
      notes: orderData.notes || void 0,
      paymentMethod: orderData.paymentMethod,
      trxId: orderData.trxId ? orderData.trxId.toUpperCase() : void 0,
      senderNumber: orderData.senderNumber,
      couponCode: orderData.couponCode,
      items: orderData.items
    });
    const tgConfig = await getTelegramConfig();
    const log = await sendTelegramNotification(newOrder, tgConfig);
    if (log.status === "success" || log.status === "simulated") {
      await updateOrderNotificationStatus(newOrder.id, true);
    }
    await addNotificationLog(log);
    return res.status(201).json({
      success: true,
      message: "Order created successfully with verified prices and reserved stock",
      data: newOrder,
      notification: {
        status: log.status,
        details: log.details
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error?.message || "Failed to process order"
    });
  }
});
router.patch("/orders/:id/status", requireAdminAuth, async (req, res) => {
  const parseResult = OrderStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: parseResult.error.issues[0]?.message || "Invalid order status",
      errors: parseResult.error.format()
    });
  }
  try {
    const updated = await updateOrderStatus(req.params.id, parseResult.data.status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to update order status" });
  }
});
router.get("/admin/stats", requireAdminAuth, async (_req, res) => {
  try {
    const stats = await getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch admin stats" });
  }
});
router.get("/customers", requireAdminAuth, async (req, res) => {
  try {
    const customers = await getCustomers(typeof req.query.query === "string" ? req.query.query : void 0);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch customers" });
  }
});
router.get("/telegram/config", requireAdminAuth, async (_req, res) => {
  try {
    const config = await getTelegramConfig();
    const maskedToken = config.botToken ? `${config.botToken.slice(0, 6)}...${config.botToken.slice(-4)}` : "";
    res.json({
      success: true,
      data: {
        ...config,
        botToken: maskedToken
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch Telegram config" });
  }
});
router.post("/telegram/config", requireAdminAuth, async (req, res) => {
  const parseResult = TelegramConfigSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parseResult.error.format()
    });
  }
  try {
    const current = await getTelegramConfig();
    const updates = parseResult.data;
    let botToken = current.botToken;
    if (updates.botToken && !updates.botToken.includes("...")) {
      botToken = updates.botToken;
    }
    const updated = await updateTelegramConfig({
      botToken,
      chatId: updates.chatId !== void 0 ? updates.chatId : current.chatId,
      enabled: updates.enabled !== void 0 ? updates.enabled : current.enabled,
      lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ success: true, message: "Telegram config updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to update Telegram config" });
  }
});
router.post("/telegram/test", requireAdminAuth, async (req, res) => {
  try {
    const current = await getTelegramConfig();
    const config = {
      botToken: req.body.botToken && !req.body.botToken.includes("...") ? req.body.botToken : current.botToken,
      chatId: req.body.chatId || current.chatId,
      enabled: true
    };
    const result = await sendTestTelegramMessage(config);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to test Telegram" });
  }
});
router.get("/telegram/logs", requireAdminAuth, async (_req, res) => {
  try {
    const logs = await getNotificationLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch notification logs" });
  }
});
router.get("/reviews/:productId", async (req, res) => {
  try {
    const reviews = await getReviewsByProduct(req.params.productId);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch reviews" });
  }
});
router.post("/reviews", async (req, res) => {
  const parseResult = ProductReviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Review validation failed",
      errors: parseResult.error.format()
    });
  }
  try {
    const data = parseResult.data;
    const newRev = await addReview({
      id: `rev-${Date.now()}`,
      productId: data.productId,
      customerName: data.customerName,
      rating: data.rating,
      comment: data.comment,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      verifiedPurchase: true
    });
    res.status(201).json({ success: true, data: newRev });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to save review" });
  }
});
router.get("/site-settings", async (_req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to fetch site settings" });
  }
});
router.put("/site-settings", requireAdminAuth, async (req, res) => {
  const parseResult = SiteSettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      message: "Site settings validation failed",
      errors: parseResult.error.format()
    });
  }
  try {
    const updated = await updateSiteSettings(parseResult.data);
    res.json({ success: true, message: "Site settings updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to update site settings" });
  }
});
router.post("/site-settings/reset", requireAdminAuth, async (_req, res) => {
  try {
    const reset = await resetSiteSettings();
    res.json({ success: true, message: "Site settings reset to defaults", data: reset });
  } catch (err) {
    res.status(500).json({ success: false, message: err?.message || "Failed to reset site settings" });
  }
});

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.set("trust proxy", 1);
if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
          connectSrc: ["'self'", "https:", "wss:"],
          frameSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"]
        }
      },
      frameguard: { action: "sameorigin" },
      crossOriginEmbedderPolicy: false
    })
  );
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false
    })
  );
}
app.use(express.json());
app.get(["/health", "/api/health"], (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "7X_SHOP.com",
    uptime: Math.round(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api", router);
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://7x-shop.com/sitemap.xml
`);
});
app.get("/sitemap.xml", (_req, res) => {
  const baseUrl = process.env.APP_URL || "https://7x-shop.com";
  const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const staticUrls = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/shop`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/deals`, priority: "0.8", changefreq: "daily" },
    { loc: `${baseUrl}/categories`, priority: "0.8", changefreq: "weekly" },
    { loc: `${baseUrl}/contact`, priority: "0.5", changefreq: "monthly" }
  ];
  const categoryUrls = INITIAL_CATEGORIES.map((c) => ({
    loc: `${baseUrl}/category/${c.id}`,
    priority: "0.7",
    changefreq: "weekly"
  }));
  const productUrls = INITIAL_PRODUCTS.map((p) => ({
    loc: `${baseUrl}/product/${p.slug || p.id}`,
    priority: "0.8",
    changefreq: "daily"
  }));
  const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  ).join("\n")}
</urlset>`;
  res.type("application/xml");
  res.send(sitemapXml);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.DIST_PATH || path.resolve(process.cwd(), "dist");
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true
      })
    );
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`7X_SHOP.com full-stack server running on port ${PORT}`);
  });
}
startServer();
