export interface DistributionCenter {
  id: string;
  name: string;
  region: string;
  zone: "coastal" | "middle" | "northern";
  city: string;
  lat: number;
  lng: number;
  address: string;
  landmark: string;
  phone: string;
  whatsapp: string;
  manager: string;
  type: "National Headquarters" | "Regional Mega-Hub" | "Authorized Distribution Depot";
  turnaround: string;
  services: string[];
  stockHighlights: string;
  coverage: string;
}

export const GHANA_REGIONAL_CENTERS: DistributionCenter[] = [
  {
    id: "depot-accra",
    name: "ZOF National HQ & Flagship Production Yard",
    region: "Greater Accra Region",
    zone: "coastal",
    city: "Accra (Spintex / Heavy Industrial Area)",
    lat: 5.6037,
    lng: -0.0934,
    address: "Plot 24, Spintex Commercial Corridor, Near Coca-Cola Roundabout",
    landmark: "Directly opposite Spintex Industrial Estate Gate 2",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Ing. Frank O. Dugbazah (Managing Director)",
    type: "National Headquarters",
    turnaround: "Same-Day Express Dispatch across Greater Accra",
    services: [
      "Continuous Roll-Forming Lines (Selflock, IBR, IDT)",
      "Automated High-Tensile Timber Truss Fabrication",
      "Executive Architectural Roof Design Studio",
      "Structural On-site Drone Scans & Moisture Audits",
      "Certified Aluzinc Sheeting Supply & Custom Flashings"
    ],
    stockHighlights: "Full Inventory: Selflock 0.45mm-0.70mm, Treated Timber Trusses, Rainwater Gutters",
    coverage: "Accra Metro, Tema, Kasoa, Adenta, Dawhenya, Madina, Prampram & Pokuase"
  },
  {
    id: "depot-kumasi",
    name: "ZOF Ashanti Regional Mega-Hub & Timber Fabrication Yard",
    region: "Ashanti Region",
    zone: "middle",
    city: "Kumasi (Kaase Light Industrial Zone)",
    lat: 6.6885,
    lng: -1.6244,
    address: "Plot 12, Kaase Commercial Way, Off Kumasi-Obuasi Highway",
    landmark: "Adjacent GCB Kaase Branch & Suame Supply Depot",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Kwame Appiah-Danquah (Ashanti Regional Operations)",
    type: "Regional Mega-Hub",
    turnaround: "Same-Day Delivery across Kumasi Metro; 24h Regional Haulage",
    services: [
      "Kiln-Dried Hardwood & Softwood Timber Seasoning",
      "Light Gauge Steel & Timber Truss Pre-Assembly",
      "Architectural Selflock & Steptile Cutting",
      "On-site Inspection & Professional Carpentry Support"
    ],
    stockHighlights: "Heavy Treated Timber Rafters, Charcoal Selflock, Corrugated Aluzinc, IDT Profiles",
    coverage: "Kumasi, Obuasi, Ejisu, Mampong, Offinso, Bekwai, Konongo & Tepa"
  },
  {
    id: "depot-takoradi",
    name: "ZOF Western Maritime & Coastal Supply Depot",
    region: "Western Region",
    zone: "coastal",
    city: "Sekondi-Takoradi (Harbour Industrial Link)",
    lat: 4.9016,
    lng: -1.7831,
    address: "Harbour Commercial Enclave, Near Takoradi Port Container Terminal",
    landmark: "Close to GPHA Gate 3, Beach Road Junction",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Nana Ekow Baidoo (Coastal Logistics Lead)",
    type: "Regional Mega-Hub",
    turnaround: "24-Hour Express Coastal Haulage",
    services: [
      "Anti-Saline Marine Grade Coating Certification (AZ150+)",
      "High-Wind Fastening Anchors for Coastal Storms",
      "Industrial Corrugated & Selflock Sheeting",
      "Offshore & Marine Warehouse Roofing Assemblies"
    ],
    stockHighlights: "0.55mm Marine Aluzinc, Anti-Corrosion Fasteners, Pre-Treated Coastal Battens",
    coverage: "Takoradi, Sekondi, Tarkwa, Axim, Agona Nkwanta, Half Assini & Elubo Border"
  },
  {
    id: "depot-capecoast",
    name: "ZOF Central Heritage & Commercial Depot",
    region: "Central Region",
    zone: "coastal",
    city: "Cape Coast (Pedu / University Highway)",
    lat: 5.1053,
    lng: -1.2466,
    address: "University Highway Junction, Pedu Commercial Strip",
    landmark: "Directly opposite Cape Coast Stadium bypass",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Sarah Arthur (Central Region Representative)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Dispatch across Central Region",
    services: [
      "Institutional & Educational Campus Roofing Packages",
      "Historic Restorations & Architectural Woodwork",
      "Rainwater Harvesting Gutter Systems"
    ],
    stockHighlights: "Selflock Charcoal, IBR Profiles, Anti-Termite Seasoned Timber Rafters",
    coverage: "Cape Coast, Elmina, Saltpond, Mankessim, Winneba, Swedru, Kasoa West & Assin Foso"
  },
  {
    id: "depot-koforidua",
    name: "ZOF Eastern Highland & Quarry Basin Depot",
    region: "Eastern Region",
    zone: "middle",
    city: "Koforidua (Okorase Commercial Area)",
    lat: 6.0945,
    lng: -0.2591,
    address: "Okorase Road, Near Regional Coordinating Council Enclave",
    landmark: "Adjacent Eastern Regional Agricultural Gateway",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Michael Asante (Eastern District Manager)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Dispatch across Eastern Region",
    services: [
      "Mountain High-Altitude Wind Resistance Truss Engineering",
      "Thermal Insulation Underlay Supply",
      "Seamless Valley Gutters & Custom Ridges"
    ],
    stockHighlights: "Steptile Red, Selflock, Hardwood Structural Purlins, High-Grade Screws",
    coverage: "Koforidua, Akosombo, Nkawkaw, Nsawam, Suhum, Asamankese, Somanya & Begoro"
  },
  {
    id: "depot-tamale",
    name: "ZOF Northern Savanna Mega-Distribution Complex",
    region: "Northern Region",
    zone: "northern",
    city: "Tamale (Tamale-Bolgatanga Industrial Corridor)",
    lat: 9.4008,
    lng: -0.8393,
    address: "Industrial Area, Off Tamale International Airport Highway",
    landmark: "Opposite Northern Regional Grain Reserve Complex",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Alhassan Mohammed (Northern Belt General Manager)",
    type: "Regional Mega-Hub",
    turnaround: "Same-Day Dispatch for Tamale; 24-48h Regional Haulage",
    services: [
      "Severe Dry-Season Heat Reflective Cool-Roof Systems",
      "Heavy Windstorm Tie-Down Structural Brackets",
      "Industrial Grain Warehouse & Agricultural Shed Framing",
      "Mobile On-site Measuring & Installation Squads"
    ],
    stockHighlights: "Deep Trough IBR, Heat-Reflective White/Zinc, High-Span Steel & Timber Trusses",
    coverage: "Tamale, Yendi, Savelugu, Bimbilla, Gushiegu, Tolon, Kumbungu & Salaga"
  },
  {
    id: "depot-ho",
    name: "ZOF Volta Regional Logistics & Distribution Hub",
    region: "Volta Region",
    zone: "coastal",
    city: "Ho (Stadium Road Commercial Area)",
    lat: 6.6111,
    lng: 0.4708,
    address: "Stadium Road, Ho Central, Near Volta Regional Sports Complex",
    landmark: "Adjacent Ho Municipal Assembly Gate",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Mawuli Agbemenya (Volta Regional Lead)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Dispatch across Volta Basin",
    services: [
      "Valley Gutter & Ridge Cap Precision Bending",
      "Cross-Border Transit Packaging for Export Orders",
      "Full Timber Truss Kits with Assembly Layouts"
    ],
    stockHighlights: "IBR Profiles, Standard & Matte Aluzinc, Certified Timber Battens",
    coverage: "Ho, Kpando, Hohoe, Aflao, Sogakope, Akatsi, Anloga & Keta"
  },
  {
    id: "depot-sunyani",
    name: "ZOF Bono Central Commercial Depot",
    region: "Bono Region",
    zone: "middle",
    city: "Sunyani (Fiapre Roundabout / University Bypass)",
    lat: 7.3399,
    lng: -2.3268,
    address: "Sunyani-Kumasi Highway, Near Fiapre Junction",
    landmark: "Opposite Catholic University Fiapre Campus",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Kwaku Ofori (Bono District Coordinator)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Dispatch across Bono Corridor",
    services: [
      "Prime Middle-Belt Hardwood Seasoned Timber Trusses",
      "On-Site Roof Measurement & Pitch Angle Audits",
      "Commercial Warehouse & Church Auditorium Scopes"
    ],
    stockHighlights: "Architectural Selflock, Steptile, Grade-A Treated Purlins & Battens",
    coverage: "Sunyani, Berekum, Dormaa Ahenkro, Wenchi, Sampa & Drobo"
  },
  {
    id: "depot-techiman",
    name: "ZOF Bono East Agricultural Trade Hub",
    region: "Bono East Region",
    zone: "middle",
    city: "Techiman (Tamale Transit Road)",
    lat: 7.5833,
    lng: -1.9333,
    address: "Tamale-Kumasi Transit Corridor, Near Techiman International Market",
    landmark: "Behind Agricultural Transport Terminal 1",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Richard Boakye (Bono East Lead)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Haulage across Bono East",
    services: [
      "Wholesale Bulk Bundles for Regional Contractors",
      "Produce Warehouse & Cold Storage Roof Insulation",
      "Heavy Duty Gutter & Downspout Fabrication"
    ],
    stockHighlights: "IBR, Selflock, High-Yield Rafters, Industrial Screws",
    coverage: "Techiman, Kintampo, Nkoranza, Atebubu, Yeji, Prang & Kwame Danso"
  },
  {
    id: "depot-bolgatanga",
    name: "ZOF Upper East Trans-Sahelian Depot",
    region: "Upper East Region",
    zone: "northern",
    city: "Bolgatanga (Navrongo Commercial Road)",
    lat: 10.7856,
    lng: -0.8514,
    address: "Navrongo Road, Near Bolgatanga Central Market Enclave",
    landmark: "Directly opposite Bolga Regional Hospital junction",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Isaac Atanga (Upper East Operations)",
    type: "Authorized Distribution Depot",
    turnaround: "24-48h Regional Dispatch",
    services: [
      "Extreme UV Radiation Resistance Certification",
      "Thermal Barrier Underlay Supply & Installation",
      "Reinforced Cyclone & Storm Ridge Caps"
    ],
    stockHighlights: "Sahelian Reflective Corrugated, Heavy IBR, Steel & Timber Hybrid Trusses",
    coverage: "Bolgatanga, Navrongo, Bawku, Paga Border, Sandema, Bongo & Zebilla"
  },
  {
    id: "depot-wa",
    name: "ZOF Upper West Regional Distribution Center",
    region: "Upper West Region",
    zone: "northern",
    city: "Wa (Technical University Enclave)",
    lat: 10.0601,
    lng: -2.5099,
    address: "Airport Road, Near Dr. Hilla Limann Technical University, Bamahu",
    landmark: "Opposite Regional Commercial Transport Park",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Adams Suleiman (Upper West Depot Head)",
    type: "Authorized Distribution Depot",
    turnaround: "24-48h Dispatch across Upper West",
    services: [
      "High-Heat Resistance Sheeting & Double Felt Insulation",
      "Storm Season Reinforced Timber Tie-Down Assemblies",
      "On-site Consultation for Municipal Projects"
    ],
    stockHighlights: "IBR Charcoal & Green, Standard Aluzinc, Seasoned Truss Packs",
    coverage: "Wa, Lawra, Jirapa, Tumu, Nandom, Hamile Border & Nadowli"
  },
  {
    id: "depot-dambai",
    name: "ZOF Oti Regional Riverine Transit Depot",
    region: "Oti Region",
    zone: "middle",
    city: "Dambai (Lakeside Commercial Way)",
    lat: 8.0667,
    lng: 0.1833,
    address: "Lakeside High Street, Near Dambai Ferry Crossing Terminal",
    landmark: "Adjacent Oti Regional Coordinating Administration",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Prosper Dzreke (Oti Logistics Officer)",
    type: "Authorized Distribution Depot",
    turnaround: "24-48h Haulage across Oti Basin",
    services: [
      "Moisture & River Mist Corrosion Defense Coating",
      "Direct Ferry Transport Loading for Lakeside Islands",
      "Hardwood Structural Framing Supply"
    ],
    stockHighlights: "Corrugated Aluzinc, IBR, Hardwood Timber Purlins, Heavy Washers",
    coverage: "Dambai, Nkwanta, Jasikan, Kadjebi, Krachi East & West, Chinderi"
  },
  {
    id: "depot-goaso",
    name: "ZOF Ahafo Mining & Forest Zone Depot",
    region: "Ahafo Region",
    zone: "middle",
    city: "Goaso (Regional Administrative Enclave)",
    lat: 6.8000,
    lng: -2.5167,
    address: "Goaso High Street, Near Ahafo Regional Police Headquarters",
    landmark: "Opposite Goaso Government Hospital bypass",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Patrick Kyeremeh (Ahafo Sector Head)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Dispatch across Ahafo",
    services: [
      "Mining Camp Residential & Industrial Building Enclosures",
      "Heavy Tropical Rainstorm Watershed Engineering",
      "Sustainable Hardwood Timber Seasoning"
    ],
    stockHighlights: "IDT Profiles, Selflock Charcoal, High-Density Treated Timber",
    coverage: "Goaso, Mim, Kenyasi, Hwidiem, Kukuom & Bechem"
  },
  {
    id: "depot-sefewiawso",
    name: "ZOF Western North Timber & Agro Depot",
    region: "Western North Region",
    zone: "middle",
    city: "Sefwi Wiawso (Forestry Commercial Bypass)",
    lat: 6.2167,
    lng: -2.4833,
    address: "Commercial Way, Adjacent Forestry Commission Regional Office",
    landmark: "Near Sefwi Wiawso Municipal Assembly",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Ebenezer Mensah (Western North Manager)",
    type: "Authorized Distribution Depot",
    turnaround: "24-Hour Dispatch across Western North",
    services: [
      "FSC-Certified Sustainably Harvested Timber Trusses",
      "Anti-Fungal & Anti-Borer Wood Preservation",
      "High-Tensile Aluzinc Profiles for Cocoa Drying Sheds"
    ],
    stockHighlights: "Heavy Rafters & Tie-Beams, Selflock, Deep Corrugated 0.50mm",
    coverage: "Sefwi Wiawso, Bibiani, Juaboso, Enchi, Bodi, Suaman & Akontombra"
  },
  {
    id: "depot-damongo",
    name: "ZOF Savannah Eco-Industrial & Agro Depot",
    region: "Savannah Region",
    zone: "northern",
    city: "Damongo (Commercial Gateway Strip)",
    lat: 9.0833,
    lng: -1.8167,
    address: "Bole-Damongo Highway, Commercial Gateway, Damongo",
    landmark: "Near Mole National Park Southern Junction",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Yakubu Seidu (Savannah Regional Officer)",
    type: "Authorized Distribution Depot",
    turnaround: "24-48h Dispatch across Savannah Region",
    services: [
      "Eco-Tourism Safari Lodge Custom Timber Trusses & Thatch Anchors",
      "Large-Span Agro Warehouse Framing",
      "Dust & Heat Resilient Fasteners"
    ],
    stockHighlights: "IBR Aluzinc, Selflock, Boron-Treated Structural Wood",
    coverage: "Damongo, Bole, Sawla, Salaga, Daboya, Buipe & Tuna"
  },
  {
    id: "depot-nalerigu",
    name: "ZOF North East Escarpment Depot",
    region: "North East Region",
    zone: "northern",
    city: "Nalerigu (Gambaga-Nalerigu Corridor)",
    lat: 10.5333,
    lng: -0.3667,
    address: "Gambaga-Nalerigu Highway, Opposite Municipal Assembly",
    landmark: "Near Nalerigu Senior High School roundabout",
    phone: "0242 866 658",
    whatsapp: "233546331603",
    manager: "Daniel Bawa (North East Operations)",
    type: "Authorized Distribution Depot",
    turnaround: "24-48h Dispatch across North East",
    services: [
      "Gambaga Escarpment High-Wind Anchor Engineering",
      "Pre-Engineered Truss Kits with Step-by-Step Framing",
      "Extreme Climate Anti-Rust Metal Coatings"
    ],
    stockHighlights: "Heavy IBR 0.50mm, Selflock, Steel & Hardwood Battens",
    coverage: "Nalerigu, Gambaga, Walewale, Bunkpurugu, Chereponi & Yagaba"
  }
];

export const REGION_NAMES = [
  "Greater Accra Region",
  "Ashanti Region",
  "Western Region",
  "Central Region",
  "Eastern Region",
  "Volta Region",
  "Oti Region",
  "Northern Region",
  "Savannah Region",
  "North East Region",
  "Upper East Region",
  "Upper West Region",
  "Bono Region",
  "Bono East Region",
  "Ahafo Region",
  "Western North Region"
];
