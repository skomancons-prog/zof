import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  GHANA_REGIONAL_CENTERS,
  DistributionCenter
} from "../data/distributionCenters";
import {
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  Search,
  Navigation,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Warehouse
} from "lucide-react";

interface DistributionMapProps {
  onSelectCenterForQuote?: (center: DistributionCenter) => void;
}

// Ghana Geographic Center & Initial Bounding Settings
const GHANA_CENTER: [number, number] = [7.9465, -1.0232];
const DEFAULT_ZOOM = 7;

// Haversine formula to calculate distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function DistributionMap({ onSelectCenterForQuote }: DistributionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [selectedCenterId, setSelectedCenterId] = useState<string>("depot-accra");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<"all" | "coastal" | "middle" | "northern">("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [nearestCenter, setNearestCenter] = useState<{ center: DistributionCenter; distanceKm: number } | null>(null);

  // Filter centers based on zone and search query
  const filteredCenters = useMemo(() => {
    return GHANA_REGIONAL_CENTERS.filter((center) => {
      const matchesZone = selectedZone === "all" || center.zone === selectedZone;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        center.name.toLowerCase().includes(query) ||
        center.region.toLowerCase().includes(query) ||
        center.city.toLowerCase().includes(query) ||
        center.address.toLowerCase().includes(query) ||
        center.coverage.toLowerCase().includes(query);

      return matchesZone && matchesQuery;
    });
  }, [selectedZone, searchQuery]);

  const activeCenter = useMemo(() => {
    return (
      GHANA_REGIONAL_CENTERS.find((c) => c.id === selectedCenterId) ||
      GHANA_REGIONAL_CENTERS[0]
    );
  }, [selectedCenterId]);

  // Create Custom HTML Pin Icon
  const createCustomMarkerIcon = (center: DistributionCenter, isSelected: boolean) => {
    const isHQ = center.type === "National Headquarters";
    const isMega = center.type === "Regional Mega-Hub";

    const bgColor = isSelected
      ? "#E58E1A" // Active Amber
      : isHQ
      ? "#15518F" // Royal Blue
      : isMega
      ? "#2C2219" // Charcoal
      : "#4E3F30"; // Slate brown

    const ringAnimation = (isHQ || isSelected)
      ? `<span class="animate-ping absolute -top-1 -left-1 inline-flex h-9 w-9 rounded-full bg-amber-400 opacity-60"></span>`
      : "";

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
        isSelected ? "scale-125 z-50" : "hover:scale-110 z-10"
      }">
        ${ringAnimation}
        <div style="background-color: ${bgColor};" class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-xl border-2 ${
          isSelected ? "border-white ring-2 ring-amber-500" : "border-amber-200"
        }">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap bg-stone-900/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow pointer-events-none">
          ${center.city.split(" ")[0]}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-leaflet-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: GHANA_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 6,
        maxZoom: 16,
        scrollWheelZoom: false, // Prevent page hijack while scrolling
        attributionControl: true
      });

      // CartoDB Voyager tiles - Clean, elegant, readable Ghana roads and borders
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker?.remove());
    markersRef.current = {};

    // Render Markers for all filtered centers
    filteredCenters.forEach((center) => {
      const isSelected = center.id === selectedCenterId;
      const marker = L.marker([center.lat, center.lng], {
        icon: createCustomMarkerIcon(center, isSelected),
        title: center.name
      }).addTo(map);

      // Create rich popup
      const popupHtml = `
        <div class="p-4 max-w-xs font-sans text-left">
          <div class="flex items-center justify-between gap-2 pb-2 border-b border-stone-200">
            <span class="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[9px] font-mono font-bold text-blue-700 uppercase">
              ${center.region}
            </span>
            <span class="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified Depot
            </span>
          </div>

          <h4 class="font-sans font-black text-xs text-stone-900 mt-2 leading-tight">
            ${center.name}
          </h4>

          <p class="text-[11px] text-stone-600 mt-1 leading-snug">
            📍 ${center.address}
          </p>

          <p class="text-[10px] text-stone-500 mt-0.5 italic">
            Near: ${center.landmark}
          </p>

          <div class="mt-2.5 pt-2 border-t border-stone-100 space-y-1 text-[10px] font-mono">
            <div class="flex items-center justify-between text-stone-600">
              <span>Haulage Service:</span>
              <span class="font-bold text-amber-700">${center.turnaround.split(";")[0]}</span>
            </div>
            <div class="flex items-center justify-between text-stone-600">
              <span>Officer in Charge:</span>
              <span class="font-bold text-stone-800">${center.manager.split("(")[0]}</span>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-1.5">
            <a
              href="tel:${center.phone.replace(/[^0-9+]/g, '')}"
              class="inline-flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold text-center no-underline"
            >
              📞 Call Depot
            </a>
            <a
              href="https://wa.me/${center.whatsapp}?text=Hello%20ZOF%20Group!%20Inquiry%20regarding%20distribution%20at%20${encodeURIComponent(center.name)}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold text-center no-underline"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoPan: true
      });

      marker.on("click", () => {
        setSelectedCenterId(center.id);
      });

      markersRef.current[center.id] = marker;
    });

    // Handle map resize properly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [filteredCenters, selectedCenterId]);

  // Handle center selection & map flyTo
  const handleSelectCenter = (center: DistributionCenter, shouldFly: boolean = true) => {
    setSelectedCenterId(center.id);

    if (mapInstanceRef.current && shouldFly) {
      mapInstanceRef.current.flyTo([center.lat, center.lng], 11, {
        duration: 1.2
      });

      // Open marker popup after slight delay
      setTimeout(() => {
        const marker = markersRef.current[center.id];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
    }
  };

  // Reset to full Ghana view
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(GHANA_CENTER, DEFAULT_ZOOM, {
        duration: 1.0
      });
    }
  };

  // Locate nearest distribution center via HTML5 Geolocation
  const handleLocateNearest = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });

        // Calculate nearest center from all 16
        let closest = GHANA_REGIONAL_CENTERS[0];
        let minDistance = calculateDistanceKm(userLat, userLng, closest.lat, closest.lng);

        GHANA_REGIONAL_CENTERS.forEach((c) => {
          const dist = calculateDistanceKm(userLat, userLng, c.lat, c.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = c;
          }
        });

        setNearestCenter({ center: closest, distanceKm: minDistance });
        handleSelectCenter(closest, true);
        setGeoLocating(false);
      },
      (err) => {
        console.warn("Geolocation prompt declined or unavailable:", err.message);
        setGeoError("Could not access live location. Select your region manually below.");
        setGeoLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleRequestQuote = (center: DistributionCenter) => {
    if (onSelectCenterForQuote) {
      onSelectCenterForQuote(center);
    } else {
      // Smooth scroll to consultation form and set hash
      const formEl = document.getElementById("consultation");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      id="distribution-map"
      className="py-20 bg-[#F3E5C8] border-t border-stone-300/80 text-stone-900 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-100/70 border border-blue-200/80 rounded-full px-4 py-1.5 text-xs text-blue-800 select-none font-bold">
              <MapPin className="h-4 w-4 text-blue-700" />
              <span className="font-mono uppercase tracking-wider">
                16/16 Ghana Regions Active
              </span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-stone-950 tracking-tight mt-3">
              ZOF Group Authorized <br />
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-amber-600 bg-clip-text text-transparent">
                Distribution Centers & Depots
              </span>
            </h2>

            <p className="text-stone-700 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed font-medium">
              Explore our verified network of 16 regional depots across Ghana. From coastal anti-saline hubs in Takoradi and Cape Coast to savanna mega-complexes in Tamale and Bolgatanga, access certified interlocking sheets, treated timber trusses, and express regional dispatch.
            </p>
          </div>

          {/* Quick Metrics Badge Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/80 border border-stone-300/80 px-4 py-2.5 rounded-2xl shadow-xs">
              <p className="font-display font-black text-xl text-stone-900">16</p>
              <p className="text-[11px] font-mono text-stone-600 uppercase font-semibold">Regional Depots</p>
            </div>
            <div className="bg-white/80 border border-stone-300/80 px-4 py-2.5 rounded-2xl shadow-xs">
              <p className="font-display font-black text-xl text-emerald-700">100%</p>
              <p className="text-[11px] font-mono text-stone-600 uppercase font-semibold">Nationwide Reach</p>
            </div>
            <div className="bg-white/80 border border-stone-300/80 px-4 py-2.5 rounded-2xl shadow-xs">
              <p className="font-display font-black text-xl text-amber-700">24-48h</p>
              <p className="text-[11px] font-mono text-stone-600 uppercase font-semibold">Haulage Window</p>
            </div>
          </div>
        </div>

        {/* Controls Bar: Search, Zone Filters & Locate Nearest */}
        <div className="bg-white/90 border border-stone-300/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, region (e.g. Kumasi, Volta, Tamale)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3E0] border border-stone-300/70 rounded-xl text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Regional Zone Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All 16 Regions (16)" },
              { id: "coastal", label: "Coastal Belt (4)" },
              { id: "middle", label: "Middle Belt (7)" },
              { id: "northern", label: "Northern Belt (5)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedZone(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedZone === tab.id
                    ? "bg-stone-900 text-white shadow-xs"
                    : "bg-[#FAF3E0] text-stone-700 hover:bg-stone-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Geolocation & Reset View Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLocateNearest}
              disabled={geoLocating}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Use GPS to locate closest authorized Zof Depot"
            >
              <Navigation className={`h-3.5 w-3.5 ${geoLocating ? "animate-spin" : ""}`} />
              <span>{geoLocating ? "Locating..." : "Find Nearest Depot"}</span>
            </button>

            <button
              onClick={handleResetView}
              className="inline-flex items-center justify-center gap-1 px-3 py-2.5 bg-[#FAF3E0] hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-300/80 transition-colors cursor-pointer"
              title="Reset map view to whole Ghana"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-600" />
              <span className="hidden sm:inline">Whole Ghana</span>
            </button>
          </div>

        </div>

        {/* Nearest center notification banner if located */}
        {nearestCenter && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Closest Depot to your live location: <span className="font-extrabold">{nearestCenter.center.name}</span>
                </p>
                <p className="text-[11px] font-mono text-emerald-700">
                  Approx. {nearestCenter.distanceKm} km away in {nearestCenter.center.city}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSelectCenter(nearestCenter.center, true)}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
            >
              Focus on Map &rarr;
            </button>
          </div>
        )}

        {/* Geolocation Error banner */}
        {geoError && (
          <div className="mb-4 text-xs font-mono text-amber-900 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            {geoError}
          </div>
        )}

        {/* Main Grid: Interactive Map + Center Detail & Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-300/90 p-2 shadow-xl overflow-hidden relative">
            
            {/* Interactive Leaflet Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-[450px] sm:h-[540px] rounded-2xl overflow-hidden z-10"
              style={{ minHeight: "450px" }}
            />

            {/* Map Overlay Badge & Hint */}
            <div className="absolute top-5 left-5 z-20 pointer-events-none">
              <div className="bg-stone-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl shadow-lg border border-stone-700/80 flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] font-bold">Interactive Ghana Geospatial Map</span>
              </div>
            </div>

            {/* Map Legend */}
            <div className="p-3 bg-stone-50 border-t border-stone-200/80 rounded-b-2xl mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-stone-600">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-blue-700 inline-block border border-white shadow-xs" />
                  <span>National HQ</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-stone-900 inline-block border border-white shadow-xs" />
                  <span>Mega-Hub</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-stone-700 inline-block border border-white shadow-xs" />
                  <span>Authorized Depot</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block border border-white shadow-xs ring-1 ring-amber-600" />
                  <span>Selected</span>
                </span>
              </div>
              <span className="text-stone-500 text-[10px]">
                Click any pin to inspect center
              </span>
            </div>

          </div>

          {/* Right Column: Selected Depot Spotlight & Directory list */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Depot Spotlight Card */}
            <div className="bg-white rounded-3xl border border-stone-300/90 p-6 shadow-xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                      {activeCenter.region}
                    </span>
                    <span className="text-stone-400 font-mono text-xs">•</span>
                    <span className="text-xs font-mono font-semibold text-stone-600">
                      {activeCenter.type}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-stone-900 mt-1.5 leading-snug">
                    {activeCenter.name}
                  </h3>
                  <p className="text-xs font-bold text-blue-700 font-mono mt-0.5">
                    {activeCenter.city}
                  </p>
                </div>

                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-150">
                  <Warehouse className="h-5 w-5" />
                </div>
              </div>

              {/* Location details */}
              <div className="py-4 space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-stone-700">
                  <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900">Address: </span>
                    <span>{activeCenter.address}</span>
                    <p className="text-[11px] text-stone-500 mt-0.5 italic">Landmark: {activeCenter.landmark}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-stone-700 pt-1">
                  <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Coverage & Turnaround: </span>
                    <span className="text-emerald-700 font-semibold">{activeCenter.turnaround}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-stone-700 pt-1">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Manager: </span>
                    <span className="font-mono text-stone-800">{activeCenter.manager}</span>
                  </div>
                </div>
              </div>

              {/* Stock and Capabilities highlights */}
              <div className="bg-[#FAF3E0] p-3.5 rounded-2xl border border-stone-200/80 mb-4">
                <p className="text-[10px] font-mono font-bold uppercase text-stone-600 tracking-wider mb-1.5">
                  📦 On-Site Inventory & Fabrication Services
                </p>
                <p className="text-xs font-semibold text-stone-800 leading-snug">
                  {activeCenter.stockHighlights}
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {activeCenter.services.slice(0, 3).map((svc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[10px] bg-white border border-stone-300/70 text-stone-700 font-medium px-2 py-0.5 rounded-md"
                    >
                      ✓ {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`tel:${activeCenter.phone.replace(/[^0-9+]/g, "")}`}
                  className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors no-underline shadow-xs"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                  <span>Call: {activeCenter.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${activeCenter.whatsapp}?text=Hello%20ZOF%20Group!%20I%20am%20inquiring%20about%20roofing%20materials%20and%20trusses%20from%20the%20${encodeURIComponent(activeCenter.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors no-underline shadow-xs"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-white" />
                  <span>WhatsApp Depot</span>
                </a>

                <button
                  onClick={() => handleRequestQuote(activeCenter)}
                  className="sm:col-span-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-sans font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                >
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>Request Quote For This Region</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Quick Directory List (Scrollable cards of all 16 regions) */}
            <div className="bg-white rounded-3xl border border-stone-300/90 p-5 shadow-lg text-left">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h4 className="font-sans font-bold text-sm text-stone-900">
                  Regional Depots Directory ({filteredCenters.length})
                </h4>
                <span className="text-[10px] font-mono text-stone-500">
                  Select to pan map
                </span>
              </div>

              <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredCenters.map((center) => {
                  const isSelected = center.id === selectedCenterId;
                  return (
                    <button
                      key={center.id}
                      onClick={() => handleSelectCenter(center, true)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300"
                          : "bg-[#FAF3E0]/70 border-stone-200/80 hover:bg-[#FAF3E0] hover:border-stone-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">
                            {center.region.replace(" Region", "")}
                          </span>
                          {center.type === "National Headquarters" && (
                            <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                              HQ
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-stone-900 truncate mt-0.5">
                          {center.name}
                        </p>
                        <p className="text-[10px] text-stone-500 font-mono truncate">
                          {center.city}
                        </p>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? "text-blue-600 translate-x-1" : "text-stone-400"
                        }`}
                      />
                    </button>
                  );
                })}

                {filteredCenters.length === 0 && (
                  <div className="py-8 text-center text-xs text-stone-500">
                    No regional centers match "{searchQuery}". Try searching for another city or region.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
