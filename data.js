// SB Burger Week 2026 — Restaurant Data
// Event: February 19–25, 2026
// Source: Santa Barbara Independent
const SOURCE_URL = "https://www.independent.com/2026/02/05/burger-week-2026/";

const AREA_COLORS = {
  "Downtown SB": "#e63946",
  "Goleta": "#2d6a4f",
  "Carpinteria": "#1d3557",
  "Isla Vista": "#7b2cbf",
  "Santa Ynez": "#e76f51",
  "Other SB": "#e07a5f"
};

const restaurants = [
  // --- Downtown SB ---
  {
    name: "Baudough's",
    address: "501 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4178,
    lng: -119.6968,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=501+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Benchmark Eatery",
    address: "1209 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4263,
    lng: -119.7078,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=1209+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "bouchon",
    address: "9 W Victoria St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4222,
    lng: -119.6988,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=9+W+Victoria+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Bread & Butter",
    address: "820 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4217,
    lng: -119.7008,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=820+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Buena Onda",
    address: "119 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4134,
    lng: -119.6900,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=119+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "The Burger Bus",
    address: "20 E Cota St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4195,
    lng: -119.6975,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=20+E+Cota+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Dargan's Irish Pub",
    address: "18 E Ortega St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4186,
    lng: -119.6973,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=18+E+Ortega+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Eureka!",
    address: "14 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4128,
    lng: -119.6896,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=14+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Finney's Crafthouse",
    address: "907 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4228,
    lng: -119.7020,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=907+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Fresco (Public Market)",
    address: "38 W Victoria St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4228,
    lng: -119.6998,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=38+W+Victoria+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "The Greek House",
    address: "17 W De La Guerra St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4204,
    lng: -119.6988,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=17+W+De+La+Guerra+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Holdren's Steaks & Seafood",
    address: "512 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4180,
    lng: -119.6970,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=512+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Lama Dog Tap Room",
    address: "3422 State St, Santa Barbara, CA",
    area: "Other SB",
    lat: 34.4445,
    lng: -119.7308,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=3422+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Little Bird Kitchen (Public Market)",
    address: "38 W Victoria St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4226,
    lng: -119.6994,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=38+W+Victoria+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Mesa Burger (Downtown)",
    address: "710 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4207,
    lng: -119.6997,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=710+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Mesa Burger (Mesa)",
    address: "1972 Cliff Dr, Santa Barbara, CA",
    area: "Other SB",
    lat: 34.4060,
    lng: -119.7118,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=1972+Cliff+Dr+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Mesa Burger (Goleta)",
    address: "225 N Fairview Ave, Goleta, CA",
    area: "Goleta",
    lat: 34.4390,
    lng: -119.8260,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=225+N+Fairview+Ave+Goleta+CA",
    burger: null,
    description: null
  },
  {
    name: "Milk & Honey",
    address: "30 W Anapamu St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4239,
    lng: -119.7012,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=30+W+Anapamu+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Norton's Pastrami & Deli",
    address: "18 W Figueroa St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4249,
    lng: -119.7038,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=18+W+Figueroa+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "The Palace Grill",
    address: "8 E Cota St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4194,
    lng: -119.6978,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=8+E+Cota+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Que Smoke Shack (Public Market)",
    address: "38 W Victoria St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4230,
    lng: -119.7002,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=38+W+Victoria+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "S&G Burgers N Shakes",
    address: "317 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4160,
    lng: -119.6940,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=317+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Santo Mezcal",
    address: "128 E Canon Perdido St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4200,
    lng: -119.6960,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=128+E+Canon+Perdido+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Seoulmate Kitchen (Public Market)",
    address: "38 W Victoria St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4224,
    lng: -119.6990,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=38+W+Victoria+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Shaker Mill",
    address: "525 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4182,
    lng: -119.6972,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=525+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Sporty's BBQ",
    address: "6 E Cota St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4193,
    lng: -119.6980,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=6+E+Cota+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Taqueria La Unica",
    address: "1614 De La Vina St, Santa Barbara, CA",
    area: "Other SB",
    lat: 34.4305,
    lng: -119.7170,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=1614+De+La+Vina+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "The Shop Kitchen",
    address: "730 N Milpas St, Santa Barbara, CA",
    area: "Other SB",
    lat: 34.4270,
    lng: -119.6870,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=730+N+Milpas+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "The Nugget (Goleta)",
    address: "5709 Calle Real, Goleta, CA",
    area: "Goleta",
    lat: 34.4395,
    lng: -119.8120,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=5709+Calle+Real+Goleta+CA",
    burger: null,
    description: null
  },
  {
    name: "The Nugget (Summerland)",
    address: "2318 Lillie Ave, Summerland, CA",
    area: "Carpinteria",
    lat: 34.4215,
    lng: -119.5955,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=2318+Lillie+Ave+Summerland+CA",
    burger: null,
    description: null
  },
  {
    name: "The Nugget (Carpinteria)",
    address: "4532 Carpinteria Ave, Carpinteria, CA",
    area: "Carpinteria",
    lat: 34.3990,
    lng: -119.5175,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=4532+Carpinteria+Ave+Carpinteria+CA",
    burger: null,
    description: null
  },
  {
    name: "Woodstock's Pizza",
    address: "928 Embarcadero del Norte, Isla Vista, CA",
    area: "Isla Vista",
    lat: 34.4133,
    lng: -119.8580,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=928+Embarcadero+del+Norte+Isla+Vista+CA",
    burger: null,
    description: null
  },
  {
    name: "Shalhoob Funk Zone Patio",
    address: "209 Helena Ave, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4148,
    lng: -119.6885,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=209+Helena+Ave+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Handled Bar",
    address: "121 E Yanonali St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4140,
    lng: -119.6890,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=121+E+Yanonali+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Institution Ale Co.",
    address: "5600 Calle Real, Goleta, CA",
    area: "Goleta",
    lat: 34.4382,
    lng: -119.8090,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=5600+Calle+Real+Goleta+CA",
    burger: null,
    description: null
  },
  {
    name: "Figueroa Mountain Brewing (Buellton)",
    address: "45 Industrial Way, Buellton, CA",
    area: "Santa Ynez",
    lat: 34.6137,
    lng: -120.1927,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=45+Industrial+Way+Buellton+CA",
    burger: null,
    description: null
  },
  {
    name: "Trattoria Grappolo",
    address: "3687 Sagunto St, Santa Ynez, CA",
    area: "Santa Ynez",
    lat: 34.6138,
    lng: -119.9885,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=3687+Sagunto+St+Santa+Ynez+CA",
    burger: null,
    description: null
  },
  {
    name: "Pork & Mindy's",
    address: "436 State St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4172,
    lng: -119.6958,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=436+State+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Three Pickles",
    address: "16 Helena Ave, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4145,
    lng: -119.6880,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=16+Helena+Ave+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "South Coast Deli",
    address: "615 Chapala St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4200,
    lng: -119.7005,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=615+Chapala+St+Santa+Barbara+CA",
    burger: null,
    description: null
  },
  {
    name: "Convivo",
    address: "1 S Milpas St, Santa Barbara, CA",
    area: "Downtown SB",
    lat: 34.4190,
    lng: -119.6865,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=1+S+Milpas+St+Santa+Barbara+CA",
    burger: null,
    description: null
  }
];
