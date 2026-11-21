import React, { useState, useMemo } from "react";
import renovationImg from "../assets/images/beautiful_renovation_extension_1782231175276.jpg";
import metalFabImg from "../assets/images/zof_metal_fab_accessories_1782225925551.jpg";
import solarFarmImg from "../assets/images/zof_solar_farm_integration_1782227056149.jpg";
import waterproofingImg from "../assets/images/premium_waterproofing_1782227491989.jpg";
import paintingImg from "../assets/images/premium_exterior_painting_1782227719269.jpg";
import { Gallery } from "./Gallery";
import { MaintenanceTutorialVideoSection } from "./MaintenanceTutorialVideoSection";
import { 
  Home, 
  Wrench, 
  Layers, 
  Sun, 
  Hammer, 
  Paintbrush, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Package, 
  HardHat, 
  Compass, 
  Ruler, 
  Palette, 
  Building2, 
  FileCheck2, 
  Search, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  ChevronRight,
  Warehouse,
  Coins
} from "lucide-react";

export type ServiceCategory = "all" | "civil" | "consultancy" | "interior" | "roofing";

export interface ServiceItem {
  id: string;
  category: "civil" | "consultancy" | "interior" | "roofing";
  categoryLabel: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  imageUrl: string;
  services: string[];
  smartBenefit: string;
  hotMarket?: boolean;
  featured?: boolean;
}

export const EXPANDED_SERVICES: ServiceItem[] = [
  // --- 1. CIVIL ENGINEERING & STRUCTURAL WORKS ---
  {
    id: "civil-concrete",
    category: "civil",
    categoryLabel: "Civil Engineering Works",
    title: "Civil Engineering & Reinforced Concrete Works",
    shortDesc: "Foundation engineering, reinforced columns, beams, suspended slabs & retaining walls.",
    longDesc: "Full-scale structural civil engineering compliant with the Ghana Building Code and Eurocodes. From deep raft foundations, pad footings, and retaining walls to suspended multi-storey concrete slabs and structural masonry. Our certified Ghanaian site engineers supervise every batch mix, cube test, and laser-guided level check.",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb1861564?q=80&w=800&auto=format&fit=crop",
    services: [
      "Reinforced Concrete Columns, Beams & Suspended Slabs",
      "Pad, Strip, Stepped & Heavy Raft Foundation Engineering",
      "Retaining Walls, Bulk Earthworks & Soil Retention Systems",
      "Heavy Interlocking Concrete Block Pavements & Drainage Gutters"
    ],
    smartBenefit: "Guarantees zero differential foundation settlement, prevents structural slab deflections, and eliminates basement water ingress.",
    hotMarket: true,
    featured: true
  },
  {
    id: "structural-steel",
    category: "civil",
    categoryLabel: "Civil Engineering Works",
    title: "Industrial Steel Portal Frames & Warehouse Construction",
    shortDesc: "Clear-span steel portal structures for factories, logistics hubs & commercial plazas.",
    longDesc: "Precision-engineered structural steel fabrication and erection for commercial plazas, industrial warehouses, church auditoriums, and logistics depots. Features computerized stress-testing, bolted moment connections, crane runway beams, and hot-dip zinc anti-corrosion defense.",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    services: [
      "Heavy Clear-Span Steel Portal Frame Fabrication & Hoisting",
      "Logistics Warehouses & Factory Production Enclosures",
      "Mezzanine Deck Flooring, Steel Stairwells & Catwalks",
      "Epoxy Coating & Galvanized Marine Anti-Rust Priming"
    ],
    smartBenefit: "Unlocks column-free interior floor areas up to 45 meters wide, reducing construction time by 50% compared to traditional masonry.",
    featured: true
  },
  {
    id: "renovation-extensions",
    category: "civil",
    categoryLabel: "Civil Engineering Works",
    title: "Building Extensions, Storey Additions & Structural Remodeling",
    shortDesc: "Vertical floor additions, terrace conversions & load-bearing wall alterations.",
    longDesc: "Safely expand your residential villa or commercial premises. We handle vertical storey additions, terrace conversions, building annexes, and structural wall removals with steel universal beam insertions without disrupting ongoing occupancy.",
    imageUrl: renovationImg,
    services: [
      "Vertical Upper-Storey Structural Additions & Roof Conversions",
      "Terrace Enclosures, Veranda Extensions & Custom Porches",
      "Load-Bearing Masonry Demolition with Steel I-Beam Support",
      "Comprehensive Facade Modernization & Parapet Restyling"
    ],
    smartBenefit: "Coordinated civil engineering checks ensure new upper storeys never exceed foundation load capacities."
  },

  // --- 2. CIVIL ENGINEERING CONSULTANCY & AUDITS ---
  {
    id: "civil-consultancy",
    category: "consultancy",
    categoryLabel: "Engineering Consultancy",
    title: "Civil Engineering Consultancy & Structural Design",
    shortDesc: "Structural calculations, 2D/3D BIM modeling, CAD shop drawings & permit approvals.",
    longDesc: "Professional civil engineering consulting provided by licensed Ghanaian structural engineers. We produce certified structural calculations (dead, live, wind, and seismic loads), rebar bending schedules, and stamped submission drawings for municipal building permit clearance across all 16 regions of Ghana.",
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop",
    services: [
      "Certified Structural Calculations & Official Permit Submission Sets",
      "2D/3D BIM Structural Modeling & Rebar Bending Schedules",
      "Soil Bearing Capacity Analysis & Geotechnical Recommendations",
      "Wind Load & Coastal Salt-Spray Vulnerability Engineering"
    ],
    smartBenefit: "Secures swift municipal planning approvals without bureaucratic delays and prevents costly over-engineering or unsafe under-reinforcement.",
    hotMarket: true,
    featured: true
  },
  {
    id: "integrity-audits",
    category: "consultancy",
    categoryLabel: "Engineering Consultancy",
    title: "Structural Integrity Audits, Crack Diagnostics & Forensics",
    shortDesc: "Non-destructive rebound hammer tests, damp diagnostics & safety audits.",
    longDesc: "Specialized engineering forensic inspection for existing buildings, cracked suspended slabs, uncompleted diaspora structures, or sagging roof frames. We utilize non-destructive rebound hammer testing, ultrasonic pulse velocity, and moisture scanning to deliver stamped forensic safety certificates.",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop",
    services: [
      "Non-Destructive Concrete Compressive Strength Testing",
      "Foundation Settlement & Wall Crack Diagnostic Forensics",
      "Drone-Assisted Roof Truss & Parapet Structural Health Audits",
      "Pre-Purchase Building Safety Certification for Buyers & Diaspora"
    ],
    smartBenefit: "Identifies hidden structural hazards before buying or remodeling, saving clients hundreds of thousands of Cedis in emergency retrofitting."
  },
  {
    id: "boq-management",
    category: "consultancy",
    categoryLabel: "Engineering Consultancy",
    title: "Bill of Quantities (BOQ), Cost Take-offs & Diaspora Project Management",
    shortDesc: "Unbiased material take-offs, transparent budgeting & remote webcam clerk-of-works.",
    longDesc: "Professional quantity surveying and construction management created specifically to protect homeowners, institutional developers, and diaspora clients from contractor overpricing and ghost billing. We generate itemized Bill of Quantities (BOQ), verify daily site progress with timestamped drone footage, and audit material receipts.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    services: [
      "Itemized Bill of Quantities (BOQ) & Material Take-off Schedules",
      "Cost Engineering, Contractor Bid Audits & Value Engineering",
      "Clerk-of-Works Site Quality Assurance & Milestone Sign-offs",
      "Dedicated Diaspora Live Drone Video Inspection & Progress Logs"
    ],
    smartBenefit: "Eliminates the typical 25–40% contractor budget padding, ensuring every single bag of cement and tonne of iron rod is strictly verified.",
    hotMarket: true
  },

  // --- 3. INTERIOR DECOR, ARCHITECTURE & LUXURY FINISHING ---
  {
    id: "interior-decor",
    category: "interior",
    categoryLabel: "Interior Decor & Finishing",
    title: "Turnkey Interior Design, Spatial Planning & 3D Visualization",
    shortDesc: "Bespoke turnkey interior concepts, spatial architecture & photorealistic 3D visual walkthroughs.",
    longDesc: "Transform bare building shells into breathtaking luxury residential villas, executive offices, and hospitality spaces. Our in-house interior architects craft custom spatial plans, color palettes, lighting schemes, and photorealistic 3D rendering walkthroughs prior to physical execution.",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
    services: [
      "Turnkey Interior Architecture, Space Planning & Furniture Layouts",
      "Photorealistic 3D Interior & Exterior CGI Walkthrough Renderings",
      "Architectural Lighting Design & Ambient Scene Controls",
      "Executive Corporate Office, Boutique Hotel & Villa Fit-outs"
    ],
    smartBenefit: "Experience and adjust your finished interior with millimeter precision in 3D before committing capital to furniture or finishes.",
    hotMarket: true,
    featured: true
  },
  {
    id: "pop-ceilings",
    category: "interior",
    categoryLabel: "Interior Decor & Finishing",
    title: "Master Plaster of Paris (POP) & Architectural Acoustic Ceilings",
    shortDesc: "Handcrafted POP artistry, hidden LED coves, bulkheads & acoustic slatted baffles.",
    longDesc: "Every master roof deserves a stunning interior ceiling. We craft bespoke Plaster of Paris (POP) false ceilings with integrated indirect lighting troughs, curvilinear bulkheads, and architectural cornices. For commercial projects, we supply and install moisture-proof acoustic gypsum boards, suspended mineral fiber tiles, and anti-sag PVC ceiling systems.",
    imageUrl: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop",
    services: [
      "Hand-Molded Plaster of Paris (POP) Architectural False Ceilings",
      "Recessed Bulkheads with Concealed LED Strip Lighting Coves",
      "Moisture-Shielded Gypsum Boards & Acoustic Slatted Baffles",
      "Heavy-Duty Anti-Sag PVC Tongue-and-Groove Ceiling Systems"
    ],
    smartBenefit: "Structurally suspended directly from roof trusses with anti-sag galvanized hangers, preventing humidity cracks and ceiling sagging forever."
  },
  {
    id: "tiling-cabinetry",
    category: "interior",
    categoryLabel: "Interior Decor & Finishing",
    title: "Luxury Floor/Wall Tiling & Bespoke Architectural Cabinetry",
    shortDesc: "Italian porcelain, granite, marble cladding, custom fitted kitchens & wardrobes.",
    longDesc: "Flawless floor and wall finishes laid with laser-calibrated leveling clips. We install large-format porcelain slabs, natural marble, and non-slip exterior granite paving. Paired with custom fitted modular kitchens, marine-board cabinetry, walk-in closets, and acoustic fluted wall cladding crafted in our joinery workshop.",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop",
    services: [
      "Large-Format Italian Porcelain, Granite & Natural Marble Tiling",
      "Laser-Guided Floor Screeding & Non-Slip Outdoor Patio Cladding",
      "Custom Fitted Modular Kitchens with Quartz Countertops",
      "Bespoke Walk-in Closets, Wardrobes & Fluted Acoustic Wall Panels"
    ],
    smartBenefit: "Eliminates hollow or uneven tiles forever with polymer-modified bonding adhesives and delivers moisture-proof marine-board cabinetry."
  },
  {
    id: "painting",
    category: "interior",
    categoryLabel: "Interior Decor & Finishing",
    title: "Luxury Architectural Painting & Exterior UV Weather-Shield",
    shortDesc: "Anti-fungal interior paints, satin textures & salt-spray resistant exterior coatings.",
    longDesc: "Our high-durability acrylic exterior systems resist blistering, torrential moisture, and intense West African UV radiation. We color-coordinate interior walls with designer washable paints and protect exterior facades with weather-shield coatings that maintain pristine curb appeal for decades.",
    imageUrl: paintingImg,
    services: [
      "Washable Luxury Interior Matt, Silk & Satin Emulsions",
      "Coastal Weather-Shield Anti-Fungal Exterior Coatings",
      "Decorative Architectural Moulding & Textured Feature Walls",
      "Aluzinc Roof Spray Reconditioning & Thermal Barrier Enamels"
    ],
    smartBenefit: "Repels tropical humidity and coastal salt-spray, preventing unsightly mildew discoloration and masonry efflorescence."
  },

  // --- 4. BUILDING, ROOFING & WATERPROOFING ---
  {
    id: "timber-trusses",
    category: "roofing",
    categoryLabel: "Building & Certified Roofing",
    title: "Certified High-Tensile Timber & Steel Truss Systems",
    shortDesc: "Computer-modeled structural timber trusses, sawn hardwood purlins & hurricane tie-downs.",
    longDesc: "Ghana's benchmark in certified structural roof framing. We pre-fabricate high-tensile treated timber trusses from sustainably sourced hardwood and softwood pressure-treated with anti-termite and boron preservatives. Paired with lightweight cold-formed galvanized steel trusses for ultra-wide spans.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop",
    services: [
      "Certified High-Tensile Timber Truss Pre-Fabrication & On-Site Erection",
      "Lightweight Cold-Formed Galvanized Steel Trusses (C-Sections & Top Hats)",
      "Computerized Roof Pitch Calculations & Severe Storm Tie-Down Straps",
      "On-Site Crane Hoisting & Mobile Assembly across all 16 Regions"
    ],
    smartBenefit: "100% insect and fungal decay resistant with structural deflection guarantees that hold heavy clay tiles or steel sheets without sagging.",
    hotMarket: true,
    featured: true
  },
  {
    id: "roofing-sheeting",
    category: "roofing",
    categoryLabel: "Building & Certified Roofing",
    title: "Architectural Sheeting: Selflock®, IBR, IDT & Steptiles",
    shortDesc: "Concealed fastener anti-leak Selflock, deep trough IBR & marine-grade aluzinc.",
    longDesc: "Premium architectural roofing sheets roll-formed from genuine AZ150 aluminum-zinc alloy coils (0.45mm to 0.70mm). Features our signature concealed-fix Selflock system that completely eliminates exterior piercing screws to deliver a 100% watertight roof under torrential monsoons.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    services: [
      "Concealed-Fastener Selflock® Zero-Leak Roofing System",
      "Heavy-Gauge IBR (Inverted Box Rib) & IDT Industrial Profiles",
      "Architectural Steptile & Standing Seam Metal Panels",
      "Anti-Saline Marine Grade Coating (Coastal AZ150+ Certification)"
    ],
    smartBenefit: "Concealed fasteners eliminate screw oxidation, thermal expansion leaks, and wind uplift while delivering a sleek modern aesthetic.",
    featured: true
  },
  {
    id: "waterproofing",
    category: "roofing",
    categoryLabel: "Building & Certified Roofing",
    title: "High-Build Waterproofing & Flat Concrete Deck Sealing",
    shortDesc: "Liquid elastomeric polymer membranes, 4mm torch-on bitumen & basement tanking.",
    longDesc: "Complete damp-proofing and leak eradication for flat concrete roofs, parapet gutters, basements, swimming pools, and balconies. We apply multi-layer liquid elastomeric membranes reinforced with geo-textile mesh, torch-on modified bitumen sheets, and crystalline damp barriers that permanently stop water ingress.",
    imageUrl: waterproofingImg,
    services: [
      "Multi-Layer Liquid Elastomeric Membrane Flat Concrete Roof Sealing",
      "4mm APP Modified Bitumen Torch-On Waterproofing Membranes",
      "Negative-Side Crystalline Basement & Foundation Tanking",
      "Expansion Joint Sealing & Parapet Flashing Waterproofing"
    ],
    smartBenefit: "Withstands severe ponding water during monsoon downpours and prevents damp ceilings, peeling interior paint, and rebar corrosion."
  },
  {
    id: "metal-fab",
    category: "roofing",
    categoryLabel: "Building & Certified Roofing",
    title: "Seamless On-Site Roll-Formed Gutters & Rainwater Systems",
    shortDesc: "Continuous joint-free aluminum gutters, custom valley flashings & rainwater harvesting.",
    longDesc: "Fabricated directly at your building site using our mobile roll-forming machines. Continuous, seamless gutters with zero mid-run joints mean zero leaks. We install heavy-gauge concealed brackets, custom architectural valley flashings, leaf guards, and high-capacity downpipes linked to rainwater harvesting cisterns.",
    imageUrl: metalFabImg,
    services: [
      "On-Site Mobile Continuous Roll-Formed Aluminum Gutters",
      "Heavy-Gauge Custom Valley Gutters, Apron & Barge Flashings",
      "Architectural Downspout Assemblies & First-Flush Diverters",
      "Integrated Rainwater Harvesting Storage Connections"
    ],
    smartBenefit: "Protects building foundations from soil erosion, eliminates splash back on exterior walls, and harvests hundreds of liters of clean water."
  },
  {
    id: "solar",
    category: "roofing",
    categoryLabel: "Building & Certified Roofing",
    title: "Rooftop Solar PV Installation & Integration",
    shortDesc: "Penetration-free roof clamping, off-grid & hybrid solar generation packages.",
    longDesc: "Clean solar power integration engineered specifically for metal and tile roof profiles without voiding your roofing warranty. We use non-penetrating standing seam clamps and EPDM-sealed brackets to mount high-efficiency solar modules, hybrid inverters, and lithium energy storage systems.",
    imageUrl: solarFarmImg,
    services: [
      "Leak-Proof Standing Seam & Corrugated Bracket Clamping",
      "Hybrid & Off-Grid Solar Power System Integration",
      "Pre-Wired Rooftop Electrical Conduits & Surge Protection",
      "Combined Roof & Solar Generation Structural Warranties"
    ],
    smartBenefit: "Slashes monthly electricity bills by up to 80% with zero risk of roof leaks or structural wind detachment.",
    hotMarket: true
  },
  {
    id: "materials",
    category: "roofing",
    categoryLabel: "Building & Certified Roofing",
    title: "Direct Factory Materials Supply & Bulk Trade Logistics",
    shortDesc: "Wholesale direct supply of certified roofing sheets, timber, rebar & accessories.",
    longDesc: "Buy certified building supplies directly from our factory yards in Accra and Kumasi. We supply genuine 0.50mm–0.70mm Aluzinc coils, treated timber purlins, structural steel sections, waterproof membranes, and heavy fasteners to contractors and builders across all 16 regions of Ghana.",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
    services: [
      "Factory-Direct Aluzinc Sheets, Selflock & IBR Profiles",
      "Sawn Timber Rafters, Purlins & Battens (Kiln-Dried & Treated)",
      "Waterproofing Bitumen Rolls, Elastomeric Pails & Adhesives",
      "High-Tensile Fasteners, EPDM Washers & Valley Sheets"
    ],
    smartBenefit: "Genuine certified gauges backed by factory thickness certificates, avoiding the undersized 0.25mm–0.30mm counterfeits common in retail markets."
  }
];

interface ExpandedServicesProps {
  onSelectProjectForEstimate?: (projectTitle: string) => void;
  onScrollToConsultation?: () => void;
}

export function ExpandedServices({ onSelectProjectForEstimate, onScrollToConsultation }: ExpandedServicesProps = {}) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("all");
  const [activeServiceId, setActiveServiceId] = useState<string>("civil-concrete");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Combo package selection
  const [selectedComboServices, setSelectedComboServices] = useState<string[]>([
    "civil-concrete",
    "roofing",
    "ceiling",
    "waterproofing"
  ]);

  // Filter services by category and search query
  const filteredServices = useMemo(() => {
    return EXPANDED_SERVICES.filter((svc) => {
      const matchesCategory = activeCategory === "all" || svc.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        svc.title.toLowerCase().includes(query) ||
        svc.shortDesc.toLowerCase().includes(query) ||
        svc.categoryLabel.toLowerCase().includes(query) ||
        svc.services.some((s) => s.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const activeServiceDetails = useMemo(() => {
    return (
      filteredServices.find((s) => s.id === activeServiceId) ||
      filteredServices[0] ||
      EXPANDED_SERVICES[0]
    );
  }, [filteredServices, activeServiceId]);

  const toggleComboService = (svcKey: string) => {
    if (selectedComboServices.includes(svcKey)) {
      if (selectedComboServices.length > 1) {
        setSelectedComboServices(selectedComboServices.filter((s) => s !== svcKey));
      }
    } else {
      setSelectedComboServices([...selectedComboServices, svcKey]);
    }
  };

  // Dynamic estimate benefits for combos
  const getComboPackageMetrics = () => {
    const counts = selectedComboServices.length;
    let savings = "0%";
    let duration = "Standard schedule";
    let warranty = "15 Years Baseline";
    let label = "Basic Selection";

    if (counts >= 5) {
      savings = "20% Master Enterprise Discount";
      duration = "Unified 14-21 Day Phased Delivery";
      warranty = "50-Year Comprehensive Structural Guarantee";
      label = "🏆 ZOF Full Multidisciplinary Turnkey Package";
    } else if (counts === 4) {
      savings = "15% Full Bundle Discount";
      duration = "Unified 10-14 Day Coordinated Work";
      warranty = "40-Year Combined Integrity Guarantee";
      label = "🔥 ZOF Smart Quad Combo (Highly Recommended)";
    } else if (counts === 3) {
      savings = "10% Trio Discount";
      duration = "7-10 Day Coordinated Work";
      warranty = "30-Year Protection Scope";
      label = "Triple Synergy Pack";
    } else if (counts === 2) {
      savings = "5% Duo Discount";
      duration = "5-8 Day Combined Work";
      warranty = "20-Year Protection Scope";
      label = "Coordinated Duo";
    }

    return { savings, duration, warranty, label };
  };

  const comboMetrics = getComboPackageMetrics();

  const handleBookService = (service: ServiceItem) => {
    if (onSelectProjectForEstimate) {
      onSelectProjectForEstimate(service.title);
    }
    if (onScrollToConsultation) {
      onScrollToConsultation();
    } else {
      const consultationEl = document.getElementById("consultation");
      if (consultationEl) {
        consultationEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getServiceIcon = (id: string, category: string) => {
    if (id.includes("civil") || id.includes("concrete")) return <HardHat className="h-4 w-4" />;
    if (id.includes("steel")) return <Building2 className="h-4 w-4" />;
    if (id.includes("consultancy")) return <Compass className="h-4 w-4" />;
    if (id.includes("audits") || id.includes("integrity")) return <FileCheck2 className="h-4 w-4" />;
    if (id.includes("boq")) return <Ruler className="h-4 w-4" />;
    if (id.includes("interior") || id.includes("decor")) return <Palette className="h-4 w-4" />;
    if (id.includes("ceiling") || id.includes("pop")) return <Layers className="h-4 w-4" />;
    if (id.includes("tiling") || id.includes("cabinetry")) return <Hammer className="h-4 w-4" />;
    if (id.includes("painting")) return <Paintbrush className="h-4 w-4" />;
    if (id.includes("solar")) return <Sun className="h-4 w-4" />;
    if (id.includes("waterproofing")) return <Wrench className="h-4 w-4" />;
    if (id.includes("materials")) return <Package className="h-4 w-4" />;
    return <Home className="h-4 w-4" />;
  };

  return (
    <>
      <section id="specialty-services" className="py-24 bg-[#F3E5C8] border-b border-stone-300/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-left max-w-4xl mb-12">
            <div className="inline-flex items-center space-x-2.5 bg-blue-100/80 border border-blue-200/90 rounded-full px-4 py-1.5 text-xs text-blue-800 select-none font-bold mb-4 shadow-2xs">
              <Sparkles className="h-4 w-4 text-blue-700" />
              <span className="font-mono uppercase tracking-wider">
                Full-Service Building, Civil Engineering & Interior Architecture
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-stone-950 tracking-tight leading-none mb-4">
              Civil Engineering, Master Roofing <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-amber-600 bg-clip-text text-transparent">
                & Luxury Interior Decor
              </span>
            </h2>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium">
              Why coordinate with multiple disjointed subcontractors when ZOF Group delivers full top-to-interior turnkey execution? From <strong>reinforced concrete structures</strong> and <strong>civil engineering consultancy</strong> to <strong>certified timber trusses, aluzinc roofing, POP ceilings, luxury tiling, and waterproofing</strong>, enjoy one unified engineering team, zero scheduling lag, and 50-year structural integrity guarantees.
            </p>
          </div>

          {/* Interactive Categories Bar & Live Search */}
          <div className="bg-white/95 border border-stone-300/80 rounded-2xl p-4 mb-8 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Services (16)", icon: Building2 },
                { id: "civil", label: "Civil Engineering Works", icon: HardHat },
                { id: "consultancy", label: "Engineering Consultancy", icon: Compass },
                { id: "interior", label: "Interior Decor & Finishing", icon: Palette },
                { id: "roofing", label: "Roofing, Trusses & Envelope", icon: Layers }
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id as ServiceCategory);
                    }}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-stone-900 text-white shadow-xs"
                        : "bg-[#FAF3E0] text-stone-700 hover:bg-stone-200/80"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Search */}
            <div className="relative max-w-xs w-full">
              <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. concrete, POP, BOQ)..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAF3E0] border border-stone-300/70 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-blue-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

          </div>

          {/* Main Services Spotlight Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
            
            {/* Left Column: Scrollable Services Directory */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-stone-300/60 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-600 font-bold">
                  Available Multidisciplinary Services ({filteredServices.length})
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  Select to view specs
                </span>
              </div>

              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1.5 scrollbar-thin">
                {filteredServices.map((svc) => {
                  const isActive = svc.id === activeServiceDetails.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setActiveServiceId(svc.id)}
                      className={`flex items-start space-x-3 text-left w-full p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-50/90 border-blue-500 text-stone-900 shadow-md ring-1 ring-blue-400"
                          : "bg-white hover:bg-stone-50/80 border-stone-250 text-stone-700 shadow-2xs"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-[#FAF3E0] border border-stone-250 text-stone-600"
                        }`}
                      >
                        {getServiceIcon(svc.id, svc.category)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded">
                            {svc.categoryLabel}
                          </span>
                          {svc.hotMarket && (
                            <span className="text-[8px] bg-amber-500 font-black text-slate-950 px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                              HIGH DEMAND ⚡
                            </span>
                          )}
                        </div>

                        <h4 className="font-sans font-bold text-xs sm:text-sm text-stone-900 tracking-tight truncate mt-1">
                          {svc.title}
                        </h4>

                        <p className={`text-[11px] line-clamp-1 mt-0.5 font-medium ${isActive ? "text-stone-700" : "text-stone-500"}`}>
                          {svc.shortDesc}
                        </p>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform mt-2 ${
                          isActive ? "text-blue-600 translate-x-0.5" : "text-stone-400"
                        }`}
                      />
                    </button>
                  );
                })}

                {filteredServices.length === 0 && (
                  <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-250">
                    No services match your query "{searchQuery}". Try selecting another category above.
                  </div>
                )}
              </div>

              {/* Civil & Architectural Assurance Callout */}
              <div className="p-4 bg-white/80 border border-stone-300/80 rounded-2xl text-left hidden lg:block shadow-xs">
                <div className="flex items-start space-x-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-stone-900 font-sans uppercase tracking-wide">
                      Certified Registered Engineers
                    </h5>
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      All civil structural works and engineering consultancy drawings are stamped by registered Ghanaian engineers in full accordance with the Ghana Building Code and municipal permit mandates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Specification Spotlight */}
            <div className="lg:col-span-7 bg-white border border-stone-300/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-left shadow-xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <div>
                {/* Header Tag and Title */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-blue-700 font-extrabold bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      {activeServiceDetails.categoryLabel}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Nationwide Execution
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    Code: ZOF-{activeServiceDetails.id.toUpperCase()}
                  </span>
                </div>

                {/* Hero Title & Long Description */}
                <h3 className="font-display font-black text-2xl sm:text-3xl text-stone-900 tracking-tight mt-4 leading-tight">
                  {activeServiceDetails.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-700 mt-3 leading-relaxed font-medium">
                  {activeServiceDetails.longDesc}
                </p>

                {/* Photo & Execution Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 my-6">
                  {/* Photo Preview */}
                  <div className="sm:col-span-5 rounded-2xl overflow-hidden border border-stone-200 aspect-video sm:aspect-auto shadow-sm relative group">
                    <img
                      src={activeServiceDetails.imageUrl}
                      alt={activeServiceDetails.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xs px-2 py-1 rounded">
                      Verified ZOF Standard
                    </div>
                  </div>

                  {/* Execution Deliverables */}
                  <div className="sm:col-span-7 bg-[#FAF3E0] p-4 rounded-2xl border border-stone-200/90 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-stone-600 uppercase tracking-widest font-bold mb-2.5">
                        Technical Deliverables Included:
                      </p>
                      <div className="space-y-2">
                        {activeServiceDetails.services.map((sub, sIdx) => (
                          <div key={sIdx} className="flex items-start space-x-2 text-stone-850">
                            <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="font-sans text-xs font-semibold text-stone-800 leading-snug">
                              {sub}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-300/60 text-[10px] font-mono text-stone-600">
                      Standard: BS 8110 / EC2 / Ghana Building Code Compliant
                    </div>
                  </div>
                </div>

                {/* Integrated Advantage Card */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="flex items-start space-x-2.5">
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center p-0.5 shrink-0 shadow-xs">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h5 className="font-sans font-black text-xs text-emerald-950 uppercase tracking-wide">
                        The ZOF Engineering Advantage:
                      </h5>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed font-medium">
                        {activeServiceDetails.smartBenefit}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-stone-200 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-stone-600 text-xs font-mono">
                  <span>Available in: </span>
                  <strong className="text-stone-900">All 16 Regions of Ghana</strong>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleBookService(activeServiceDetails)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-sans text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Request Service Quote</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Dynamic Interactive Smart Multidisciplinary Combo Builder */}
          <div id="smart-combo-section" className="bg-gradient-to-br from-[#F3E5C8] via-[#FAF3E0] to-white rounded-3xl border border-stone-300/90 p-6 sm:p-10 shadow-xl relative overflow-hidden text-left text-stone-850">
            
            <div className="absolute -top-12 -left-12 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              {/* Combo Explanation Copy */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full shadow-xs">
                  <span>🔑 Multidisciplinary Turnkey Model</span>
                </div>

                <h3 className="font-sans font-black text-2xl sm:text-3xl text-stone-950 tracking-tight leading-tight">
                  Stop Managing Disconnected Contractors.<br />
                  <span className="text-amber-600">Combine & Protect Your Build!</span>
                </h3>

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                  By bundling your <strong>Civil Engineering Works, Certified Roofing, POP Interior Ceilings, Waterproofing, and Engineering Consultancy</strong> under ZOF Group, you eliminate the single biggest risk in Ghanaian construction: subcontractors blaming each other for cracks, leaks, and delays. One single unified engineering firm with single-source accountability.
                </p>

                {/* Pillars checklist */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-stone-850">
                  <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-xl border border-stone-250">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>1. Civil Works & Concrete Slabs</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-xl border border-stone-250">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>2. Certified Roofing & Trusses</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-xl border border-stone-250">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>3. Master POP & Interior Decor</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-xl border border-stone-250">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>4. Waterproofing & Concrete Seal</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/70 p-2 rounded-xl border border-stone-250 sm:col-span-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>5. Civil Consultancy, BOQ & Diaspora Drone Oversight</span>
                  </div>
                </div>
              </div>

              {/* Interactive Selector Planner */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-stone-300/80 shadow-lg">
                <h4 className="font-sans font-black text-sm text-stone-900 tracking-tight mb-4 flex items-center justify-between">
                  <span>Multidisciplinary Bundle Planner</span>
                  <span className="text-[10px] font-mono text-stone-500 font-bold">Pick your project scope</span>
                </h4>

                <div className="space-y-2.5">
                  {[
                    {
                      id: "civil-concrete",
                      title: "01. Civil Concrete Works & Foundations",
                      desc: "Columns, beams, suspended floor slabs & retaining walls"
                    },
                    {
                      id: "roofing",
                      title: "02. Certified High-Tensile Trusses & Selflock® Sheeting",
                      desc: "Computerized timber trusses, hurricane tie-downs & zero-leak panels"
                    },
                    {
                      id: "ceiling",
                      title: "03. POP False Ceilings & Interior Finishing",
                      desc: "Handcrafted POP bulkheads, cove LED lighting & porcelain tiling"
                    },
                    {
                      id: "waterproofing",
                      title: "04. Flat Concrete Deck Waterproofing & Drainage",
                      desc: "Multi-layer elastomeric polymer membrane & seamless on-site gutters"
                    },
                    {
                      id: "consultancy",
                      title: "05. Civil Engineering Consultancy & BOQ Supervision",
                      desc: "Structural calculations, permit submission sets & diaspora video logs"
                    }
                  ].map((item) => {
                    const isSelected = selectedComboServices.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleComboService(item.id)}
                        className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-400 text-stone-900 shadow-2xs"
                            : "bg-[#FAF3E0]/50 border-stone-200 text-stone-500 hover:bg-[#FAF3E0]"
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-stone-300"
                            }`}
                          >
                            {isSelected && <span className="text-[9px] font-bold">✓</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-sans text-xs font-bold text-stone-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-stone-500 truncate">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold shrink-0 ml-2 ${isSelected ? "text-blue-700" : "text-stone-400"}`}>
                          {isSelected ? "Selected" : "+ Add"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Combo Metrics Dynamic Panel */}
                <div className="mt-5 pt-4 border-t border-stone-200 space-y-3.5">
                  <div className="bg-[#FAF3E0] p-3.5 rounded-xl border border-stone-250 flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="text-[9px] font-mono text-stone-500 uppercase tracking-wider font-bold">
                        Configuration Tier
                      </p>
                      <p className="font-sans text-xs font-black text-stone-900 mt-0.5">
                        {comboMetrics.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-amber-800 font-black uppercase tracking-wide">
                        Bundle Savings
                      </p>
                      <p className="font-sans text-sm font-black text-amber-600">
                        {comboMetrics.savings}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-left text-[11px]">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <p className="text-[9px] font-mono text-stone-400 uppercase font-bold">Turnaround Schedule:</p>
                      <p className="font-bold text-stone-800 mt-0.5">{comboMetrics.duration}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <p className="text-[9px] font-mono text-stone-400 uppercase font-bold">Warranty Scope:</p>
                      <p className="font-bold text-stone-800 mt-0.5">{comboMetrics.warranty}</p>
                    </div>
                  </div>

                  <a
                    href="#consultation"
                    className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans text-xs font-black uppercase tracking-wider rounded-xl text-center transition-all cursor-pointer select-none shadow-md hover:shadow-lg active:scale-98"
                  >
                    Confirm Bundle in Free Engineering Consultation &rarr;
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Maintenance Tutorial Video Section for Aluzinc Care */}
      <MaintenanceTutorialVideoSection />

      {/* High-Resolution Project Photo Gallery nested under Specialty Services */}
      <Gallery
        onSelectProjectForEstimate={onSelectProjectForEstimate}
        onScrollToConsultation={onScrollToConsultation}
      />
    </>
  );
}
