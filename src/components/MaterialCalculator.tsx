/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calculator, 
  Layers, 
  Maximize, 
  Trees, 
  Hammer, 
  Truck, 
  CheckCircle, 
  Save, 
  HelpCircle, 
  ChevronRight, 
  Sparkles, 
  Info, 
  FileDown, 
  Printer, 
  Eye, 
  RefreshCw, 
  X, 
  FileText, 
  Check,
  Download,
  FileCheck
} from "lucide-react";
import { jsPDF } from "jspdf";
import { PrintableProposalDocument } from "./PrintableProposalDocument";
import { TermsAndConditionsAgreement } from "./TermsAndConditionsAgreement";

interface MaterialCalculatorProps {
  onEstimateSaved?: () => void;
}

export function MaterialCalculator({ onEstimateSaved }: MaterialCalculatorProps) {
  // Dimension inputs
  const [length, setLength] = useState<number>(15);
  const [width, setWidth] = useState<number>(12);
  const [unit, setUnit] = useState<"meters" | "feet">("meters");
  const [roofShape, setRoofShape] = useState<"gable" | "hip" | "flat" | "shed">("gable");
  const [materialProfile, setMaterialProfile] = useState<"selflock" | "ibr" | "step_tiles" | "aluminium_plain">("selflock");
  const [trussType, setTrussType] = useState<"mahogany" | "steel" | "none">("mahogany");

  // Client info for saving to dashboard & personalizing proposal
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCity, setClientCity] = useState("Accra");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // PDF Generation & Preview State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState<"proposal" | "agreement">("proposal");
  const [includeAgreement, setIncludeAgreement] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Currency Selection Parameters
  const [currency, setCurrency] = useState<"GHS" | "USD">("GHS");
  const [exchangeRate, setExchangeRate] = useState<number>(14.50);

  const formatLocalValue = (ghsAmount: number, withLabel = true) => {
    if (currency === "USD") {
      const usdAmount = ghsAmount / exchangeRate;
      return withLabel 
        ? `$ ${usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
        : usdAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return withLabel
      ? `GH₵ ${ghsAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : ghsAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Specifications & price points in GHS per unit of area (meters squared base, with feet conversion)
  const multipliers = {
    gable: 1.15,
    hip: 1.30,
    flat: 1.05,
    shed: 1.10
  };

  const materialRates = {
    selflock: 125.00, // GHS / sq meter
    ibr: 105.00,
    step_tiles: 115.00,
    aluminium_plain: 140.00
  };

  const trussRates = {
    mahogany: 85.00, // GHS / sq meter
    steel: 150.00,
    none: 0
  };

  const laborRate = 35.00; // GHS / sq meter
  const transportBase = 850.00; // GHS flat

  // Area conversion factors
  const getSqMetersArea = () => {
    const rawArea = length * width;
    const factor = multipliers[roofShape];
    const surfaceArea = rawArea * factor;
    if (unit === "feet") {
      return surfaceArea / 10.764; // Convert sq ft to sq m
    }
    return surfaceArea;
  };

  const sqMeters = getSqMetersArea();
  const surfaceAreaDisplay = unit === "feet" ? length * width * multipliers[roofShape] : sqMeters;

  // Cost calculations
  const materialCost = sqMeters * materialRates[materialProfile];
  const trussCost = sqMeters * trussRates[trussType];
  const installationCost = sqMeters * laborRate;
  const grandTotal = materialCost + trussCost + installationCost + transportBase;

  // Handle saving estimate as a consultation submission
  const handleSaveToDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !clientEmail) {
      setSaveError("Please enter your complete contact details to register this project.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const roofLabel = {
      selflock: "0.50mm Selflock Aluzinc Panel",
      ibr: "Premium IBR Angular Sheets",
      step_tiles: "Mediterranean Step Tiles",
      aluminium_plain: "Marine-Grade Plain Aluminium"
    }[materialProfile];

    const shapeLabel = {
      gable: "Gable Profile",
      hip: "High-Slope Hip Roof",
      flat: "Low-Slope Flat Roof",
      shed: "Mono-Pitch Shed Design"
    }[roofShape];

    const trussLabel = {
      mahogany: "High-Strength Treated Mahogany Timber",
      steel: "Structural Light-Gauge Galvanized Steel Trusses",
      none: "Pre-existing Roof Framework (Labor Only)"
    }[trussType];

    const payload = {
      fullName: clientName,
      email: clientEmail,
      phone: clientPhone,
      city: clientCity,
      preferredDate: new Date().toISOString().split('T')[0],
      roofCondition: "leaking",
      undertakings: ["Free Estimate", "Calculator Pre-Estimate"],
      notes: `AUTOMATED MATERIAL CALCULATOR LEDGER SUMMARY:
- Roof Footprint: ${length} x ${width} ${unit}
- Calculated Slope Profile: ${shapeLabel}
- Structural Area: ${surfaceAreaDisplay.toFixed(1)} sq ${unit === "meters" ? "m" : "sq ft"} (${sqMeters.toFixed(1)} sq m equivalent)
- Sheet Choice: ${roofLabel} (₵${materialRates[materialProfile]}/sq m)
- Truss Frame: ${trussLabel} (₵${trussRates[trussType]}/sq m)
- Computed Project Value: GH₵ ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      estimateDetails: {
        roofType: roofLabel,
        areaSqFt: unit === "feet" ? surfaceAreaDisplay : surfaceAreaDisplay * 10.764,
        totalEstimatedMin: grandTotal,
        totalEstimatedMax: grandTotal * 1.12
      }
    };

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to register and synchronize estimate. Please try again.");
      }

      setSaveSuccess(true);
      if (onEstimateSaved) {
        onEstimateSaved();
      }
    } catch (err: any) {
      setSaveError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const resetCalculatorForm = () => {
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setSaveSuccess(false);
  };

  const proposalDocNumber = `ZOF-PROP-2026-${Math.abs(Math.floor((length * 100 + width * 10 + sqMeters) % 8999 + 1000))}`;

  // Generate executive, branded PDF quotation using jsPDF with vector-grade styling
  const generateBrandedQuotationPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryAmber: [number, number, number] = [229, 142, 26]; // #E58E1A
    const darkCharcoal: [number, number, number] = [28, 25, 23]; // #1C1917
    const softBg: [number, number, number] = [248, 250, 252];
    const borderGrey: [number, number, number] = [226, 232, 240];
    const textMuted: [number, number, number] = [100, 116, 139];

    const client = clientName.trim() || "Valued Property Developer";
    const phone = clientPhone.trim() || "+233 (0) 24 286 6658";
    const email = clientEmail.trim() || "client@property.gh";
    const city = clientCity || "Accra";
    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const roofProfileNames: Record<string, string> = {
      selflock: "ZOF 0.50mm Selflock® Interlocking Aluzinc (Concealed Clips)",
      ibr: "ZOF 0.50mm Premium IBR Angular Corrugated Panels",
      step_tiles: "ZOF 0.50mm Mediterranean Step Tile Architectural Sheets",
      aluminium_plain: "ZOF 0.70mm Marine-Grade Plain Aluminium Coastal Alloy",
    };

    const roofShapeNames: Record<string, string> = {
      gable: "Gable Dual-Pitch Design (1.15x Slope Factor)",
      hip: "Hip Roof Multi-Slope Profile (1.30x Slope Factor)",
      flat: "Low-Slope Contemporary Flat Roof (1.05x Slope Factor)",
      shed: "Mono-Pitch Architectural Shed Design (1.10x Slope Factor)",
    };

    const trussNames: Record<string, string> = {
      mahogany: "High-Strength Pressure-Treated Hardwood Mahogany Timber",
      steel: "Structural Light-Gauge Galvanized Steel Trusses (Rust-Proof)",
      none: "Existing Structural Framework (Labor & Fasteners Only)",
    };

    const formatGHS = (val: number) => `GHc ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatUSD = (val: number) => `$ ${(val / exchangeRate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // === PAGE 1: OFFICIAL CLIENT QUOTATION & BOQ ===
    // Top Corporate Amber Accent Ribbon
    doc.setFillColor(primaryAmber[0], primaryAmber[1], primaryAmber[2]);
    doc.rect(0, 0, 210, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("ZOF ROOFING SYSTEMS LTD • GHANA COMMERCIAL CORRIDOR • ACCRA HQ", 105, 5, { align: "center" });

    // Corporate Brand Header (Left)
    doc.setFontSize(15);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.setFont("helvetica", "bold");
    doc.text("ZOF ROOFING SYSTEMS LTD", 14, 17);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryAmber[0], primaryAmber[1], primaryAmber[2]);
    doc.text("ARCHITECTURAL STRUCTURAL ENGINEERING & PREMIUM ALUZINC SYSTEMS", 14, 21.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Spintex Road Commercial Corridor, Accra, Ghana • Digital Address: GC-088-4481", 14, 25.5);
    doc.text("Tel: +233 (0) 24 286 6658 / 0577796161 • Email: zofroofingsyst@gmail.com • www.zofroofingsystem.com", 14, 29);

    // Metadata Card (Right)
    doc.setFillColor(softBg[0], softBg[1], softBg[2]);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(138, 10, 58, 22, 2, 2, "FD");

    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont("helvetica", "bold");
    doc.text("PROPOSAL REF:", 141, 14.5);
    doc.setTextColor(primaryAmber[0], primaryAmber[1], primaryAmber[2]);
    doc.text(proposalDocNumber, 166, 14.5);

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("ISSUE DATE:", 141, 19);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(currentDate, 166, 19);

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("VALIDITY:", 141, 23.5);
    doc.setTextColor(16, 185, 129); // emerald
    doc.text("14 Calendar Days", 166, 23.5);

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("TIN / REG:", 141, 28);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("C0004928190", 166, 28);

    // Document Title Banner
    doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.roundedRect(14, 34, 182, 8, 1.5, 1.5, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text("OFFICIAL CLIENT COST QUOTATION & BILL OF QUANTITIES (BOQ)", 18, 39.5);
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("AZ150 Aluzinc High-Grade Specification", 192, 39.5, { align: "right" });

    // Client Details & Scope Cards (Side-by-side)
    // Left: Client Details
    doc.setFillColor(softBg[0], softBg[1], softBg[2]);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(14, 45, 89, 23, 2, 2, "FD");
    doc.setFontSize(6.8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENT & CONTACT DETAILS", 17, 49.5);
    doc.setFontSize(8.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(client, 17, 54.5);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Phone: ${phone}`, 17, 59.5);
    doc.text(`Email: ${email}`, 17, 64);

    // Right: Site Location & Scope
    doc.roundedRect(107, 45, 89, 23, 2, 2, "FD");
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "bold");
    doc.text("PROJECT SITE LOCATION & STRUCTURAL SCOPE", 110, 49.5);
    doc.setFontSize(8.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text(`${city}, Greater Accra / Region, Ghana`, 110, 54.5);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Footprint: ${length}${unit === "meters" ? "m" : "ft"} x ${width}${unit === "meters" ? "m" : "ft"} (${(length * width).toFixed(1)} ${unit === "meters" ? "m² base" : "sq ft base"})`, 110, 59.5);
    doc.text(`Profile: ${roofShapeNames[roofShape] || "Custom Profile"}`, 110, 64);

    // 1.0 Dimensional Audit Grid
    doc.setFontSize(7.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("1.0 STRUCTURAL DIMENSIONAL AUDIT & MATERIAL MATRIX", 14, 72);

    const dimWidth = 43.5;
    const dimCards = [
      { title: "Net Base Area", val: `${(length * width).toFixed(1)} m²`, sub: `(${((length * width) * 10.764).toFixed(0)} sq ft)` },
      { title: "Calculated Slope Area", val: `${sqMeters.toFixed(1)} m²`, sub: `(${surfaceAreaDisplay.toFixed(0)} sq ${unit})` },
      { title: "Roof Panel Count", val: `${Math.ceil(sqMeters * 1.08)} Panels`, sub: "(Incl. 8% overlap/eaves)" },
      { title: "Aluzinc Coating", val: "AZ150 Standard", sub: "55% Al-Zn Anti-Rust" },
    ];

    dimCards.forEach((c, idx) => {
      const xPos = 14 + idx * 46;
      doc.setFillColor(softBg[0], softBg[1], softBg[2]);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.roundedRect(xPos, 74, dimWidth, 14, 1.5, 1.5, "FD");

      doc.setFontSize(6.2);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont("helvetica", "normal");
      doc.text(c.title.toUpperCase(), xPos + 2.5, 78);

      doc.setFontSize(8.2);
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.setFont("helvetica", "bold");
      doc.text(c.val, xPos + 2.5, 82.5);

      doc.setFontSize(6);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setFont("helvetica", "normal");
      doc.text(c.sub, xPos + 2.5, 86);
    });

    // 2.0 Itemized Bill of Quantities Table
    doc.setFontSize(7.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("2.0 ITEMIZED BILL OF QUANTITIES & CONTRACT VALUE", 14, 93);

    // Table Header
    const tableY = 95;
    doc.setFillColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.rect(14, tableY, 182, 7, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ITEM DESCRIPTION & TECHNICAL SCOPE", 17, tableY + 4.8);
    doc.text("UNIT / AREA", 120, tableY + 4.8, { align: "center" });
    doc.text("AMOUNT (GHc)", 156, tableY + 4.8, { align: "right" });
    doc.text("AMOUNT (USD)", 192, tableY + 4.8, { align: "right" });

    // Rows
    const items = [
      {
        name: "0.50mm Premium Roof Sheeting Panels",
        desc: roofProfileNames[materialProfile] || "Premium Aluzinc Roofing Panels",
        qty: `${sqMeters.toFixed(1)} m²`,
        ghs: materialCost,
      },
      {
        name: "Truss Framework Construction Matrix",
        desc: trussNames[trussType] || "Truss Framework Structure",
        qty: trussType === "none" ? "N/A" : `${sqMeters.toFixed(1)} m²`,
        ghs: trussCost,
      },
      {
        name: "Architectural Carpentry & Expert Installation",
        desc: "Master roofing technicians, valley flashings, fascia alignment, and waterproof torque fastening",
        qty: `${sqMeters.toFixed(1)} m²`,
        ghs: installationCost,
      },
      {
        name: "Site Haulage, Crane Offloading & Transit Insurance",
        desc: `Direct haulage to site in ${city} with protective bubble interleaving and transit coverage`,
        qty: "1 Site Trip",
        ghs: transportBase,
      },
    ];

    let currentY = tableY + 7;
    items.forEach((it, index) => {
      const isEven = index % 2 === 1;
      if (isEven) {
        doc.setFillColor(softBg[0], softBg[1], softBg[2]);
        doc.rect(14, currentY, 182, 11, "F");
      }
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.line(14, currentY + 11, 196, currentY + 11);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.text(it.name, 17, currentY + 4.2);

      doc.setFontSize(6.2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const truncatedDesc = doc.splitTextToSize(it.desc, 98);
      doc.text(truncatedDesc[0] || "", 17, currentY + 8);

      doc.setFontSize(7.5);
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.text(it.qty, 120, currentY + 5.5, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.text(it.ghs === 0 ? "Excluded" : formatGHS(it.ghs), 156, currentY + 5.5, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(it.ghs === 0 ? "—" : formatUSD(it.ghs), 192, currentY + 5.5, { align: "right" });

      currentY += 11;
    });

    // Total Row
    doc.setFillColor(254, 243, 199); // Amber tint
    doc.setDrawColor(245, 158, 11);
    doc.rect(14, currentY, 182, 9, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("TOTAL CONTRACT VALUE (NET ESTIMATE)", 17, currentY + 5.8);

    doc.setTextColor(primaryAmber[0], primaryAmber[1], primaryAmber[2]);
    doc.setFontSize(9.5);
    doc.text(formatGHS(grandTotal), 156, currentY + 6, { align: "right" });

    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.setFontSize(8);
    doc.text(formatUSD(grandTotal), 192, currentY + 5.8, { align: "right" });

    currentY += 13;

    // 3.0 Warranties & Guarantees
    doc.setFontSize(7.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("3.0 TECHNICAL CERTIFICATIONS & COMPREHENSIVE WARRANTIES", 14, currentY);
    currentY += 2;

    const wColW = 59;
    const warranties = [
      { title: "15-Year Material Warranty", text: "Guaranteed against corrosion, rust, and tropical UV sun fading." },
      { title: "5-Year Workmanship Guarantee", text: "Free structural adjustments on carpentry joins & roof leak points." },
      { title: "Rainy Season Storm Audit", text: "Complimentary 6-month post-installation storm audit and gutter check." },
    ];

    warranties.forEach((w, i) => {
      const xPos = 14 + i * 61.5;
      doc.setFillColor(softBg[0], softBg[1], softBg[2]);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.roundedRect(xPos, currentY, wColW, 13, 1.5, 1.5, "FD");

      doc.setFontSize(6.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.text(w.title, xPos + 2.5, currentY + 4.5);

      doc.setFontSize(5.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      const lines = doc.splitTextToSize(w.text, wColW - 5);
      doc.text(lines, xPos + 2.5, currentY + 8.2);
    });

    currentY += 17;

    // 4.0 Payment Terms & Banking
    doc.setFillColor(softBg[0], softBg[1], softBg[2]);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(14, currentY, 89, 21, 2, 2, "FD");

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("STANDARD MILESTONE PAYMENT SCHEDULE", 17, currentY + 4.5);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("• 70% Initial Material Deposit: Mobilization & coil fabrication", 17, currentY + 9);
    doc.text("• 20% Framework Stage: Upon truss erection & sheet delivery", 17, currentY + 13.5);
    doc.text("• 10% Handover: Upon final water tightness test & sign-off", 17, currentY + 18);

    // Bank Info (Right)
    doc.roundedRect(107, currentY, 89, 21, 2, 2, "FD");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("CORPORATE BANKING ACCOUNTS (GHANA)", 110, currentY + 4.5);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("Bank: Guaranty Trust Bank (GTBank) Ghana", 110, currentY + 9);
    doc.text("Account Name: ZOF ROOFING SYSTEMS LTD", 110, currentY + 13.5);
    doc.text("Account Number: 3221-00101-5330 • MoMo: 0597391978", 110, currentY + 18);

    currentY += 25;

    // 5.0 Signatures & Official Stamp
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.line(14, currentY, 196, currentY);
    currentY += 3;

    // MD Signature Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("Mr. Francis O. Dugbazah", 14, currentY + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Managing Director • ZOF Group", 14, currentY + 10.5);

    // Official Stamp in center
    doc.setDrawColor(185, 28, 28);
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(82, currentY - 1, 46, 13, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(185, 28, 28);
    doc.text("★ ZOF ROOFING SYSTEMS ★", 105, currentY + 3, { align: "center" });
    doc.setFontSize(5.5);
    doc.text("APPROVED COMMERCIAL QUOTATION", 105, currentY + 7, { align: "center" });
    doc.text(currentDate, 105, currentY + 10.5, { align: "center" });

    // Estimator Signature Block (Right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
    doc.text("Samson Kwakye", 196, currentY + 7, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("Chief Estimator & Project Lead", 196, currentY + 10.5, { align: "right" });

    // Footer Security Note
    doc.setFontSize(5.8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text("This document is an official quotation produced by ZOF Roofing Systems Ltd. For verification, contact Accra HQ: +233 (0) 24 286 6658 • Page 1 of 2", 105, 290, { align: "center" });

    // === PAGE 2: TERMS & CONDITIONS AGREEMENT (if requested) ===
    if (includeAgreement) {
      doc.addPage();

      // Top Amber Ribbon
      doc.setFillColor(primaryAmber[0], primaryAmber[1], primaryAmber[2]);
      doc.rect(0, 0, 210, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("ZOF ROOFING SYSTEMS LTD • STANDARD COMMERCIAL TERMS OF ENGAGEMENT", 105, 5, { align: "center" });

      // Header
      doc.setFontSize(14);
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.text("STANDARD TERMS OF ENGAGEMENT & WARRANTY AGREEMENT", 14, 16);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Proposal Ref: ${proposalDocNumber} • Client: ${client} • Date: ${currentDate}`, 14, 20.5);

      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.line(14, 22.5, 196, 22.5);

      const clauses = [
        {
          num: "1.0",
          title: "SCOPE OF WORK & STRUCTURAL INTEGRITY",
          body: "ZOF Roofing Systems Ltd undertakes to supply, fabricate, and install the roofing system strictly in accordance with the measurements and specifications set forth in this quotation. Any structural modifications required on site prior to installation shall be formally notified to the client.",
        },
        {
          num: "2.0",
          title: "MATERIAL SPECIFICATIONS & COIL STANDARDS",
          body: "All Aluzinc profiles supplied are guaranteed to be manufactured from prime AZ150 coated Aluzinc coils (55% Aluminium, 43.4% Zinc, 1.6% Silicon) with certified nominal thickness of 0.50mm / 0.70mm as specified in the BOQ.",
        },
        {
          num: "3.0",
          title: "MILESTONE PAYMENT PROTOCOL",
          body: "Execution commences upon receipt of the 70% mobilization deposit. An interim 20% payment becomes due upon completion of framework erection and site delivery of sheets. The residual 10% balance is payable immediately upon practical completion and final water tightness sign-off.",
        },
        {
          num: "4.0",
          title: "SITE ACCESS, HAULAGE & OFFLOADING",
          body: "The client shall grant unrestricted vehicular access to the project site for haulage trucks and crane offloading. ZOF Roofing Systems assumes full transit risk until delivery and offloading at the designated site location.",
        },
        {
          num: "5.0",
          title: "INSTALLATION TIMELINE & WEATHER CONTINGENCIES",
          body: "Installation works typically span 3 to 7 working days depending on roof square meterage and pitch complexity. Time extensions shall be granted automatically in the event of adverse weather conditions, uncompleted masonry, or electrical safety hazards.",
        },
        {
          num: "6.0",
          title: "VARIATIONS, ALTERATIONS & ADDITIONAL WORKS",
          body: "Any amendments to roof dimensions, additions to fascia coverings, or changes in truss timber profile requested after contract ratification shall be calculated as a variation order and billed at agreed schedule rates.",
        },
        {
          num: "7.0",
          title: "COMPREHENSIVE 15-YEAR MATERIAL WARRANTY & 5-YEAR WORKMANSHIP GUARANTEE",
          body: "ZOF Roofing Systems guarantees all installed AZ150 Aluzinc sheets against corrosion perforation and finish degradation for 15 years. Workmanship is guaranteed for 5 years with free remedial service on carpentry joins, torque fasteners, and valley gutters.",
        },
        {
          num: "8.0",
          title: "GOVERNING LAW & JURISDICTION",
          body: "This agreement is governed by the laws of the Republic of Ghana. Any disputes arising shall first be subject to mutual executive mediation, failing which the courts of Ghana shall have exclusive jurisdiction.",
        },
      ];

      let clauseY = 27;
      clauses.forEach((c) => {
        doc.setFontSize(7.2);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryAmber[0], primaryAmber[1], primaryAmber[2]);
        doc.text(c.num, 14, clauseY);

        doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
        doc.text(c.title, 22, clauseY);

        doc.setFontSize(6.2);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        const lines = doc.splitTextToSize(c.body, 174);
        doc.text(lines, 22, clauseY + 3.8);

        clauseY += 4 + lines.length * 2.8 + 2;
      });

      // Acceptance Signatures Box
      clauseY = Math.max(clauseY + 3, 235);
      doc.setFillColor(softBg[0], softBg[1], softBg[2]);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.roundedRect(14, clauseY, 182, 38, 2, 2, "FD");

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.text("FORMAL EXECUTION & CONTRACT ACCEPTANCE", 18, clauseY + 5.5);

      // Left: ZOF
      doc.setFontSize(6.8);
      doc.setFont("helvetica", "bold");
      doc.text("FOR: ZOF ROOFING SYSTEMS LTD", 18, clauseY + 11.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.2);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text("Authorised Officer: Mr. Francis O. Dugbazah", 18, clauseY + 16);
      doc.text("Designation: Managing Director", 18, clauseY + 20);
      doc.line(18, clauseY + 29, 85, clauseY + 29);
      doc.text("Signature & Corporate Seal • Date: " + currentDate, 18, clauseY + 33);

      // Right: Client
      doc.setFontSize(6.8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkCharcoal[0], darkCharcoal[1], darkCharcoal[2]);
      doc.text("FOR: CLIENT / PROPERTY DEVELOPER", 110, clauseY + 11.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.2);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text(`Client Name: ${client}`, 110, clauseY + 16);
      doc.text(`Site: ${city}, Ghana`, 110, clauseY + 20);
      doc.line(110, clauseY + 29, 180, clauseY + 29);
      doc.text("Signature of Acceptance • Date: ______________", 110, clauseY + 33);

      doc.setFontSize(5.8);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text("ZOF Roofing Systems Ltd • Spintex Road Commercial Corridor, Accra, Ghana • Page 2 of 2", 105, 290, { align: "center" });
    }

    // Save the PDF file directly to downloads!
    const sanitizedClient = client.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `ZOF_Official_Quotation_${sanitizedClient}_${proposalDocNumber}.pdf`;
    doc.save(fileName);
    return fileName;
  };

  // Handle Download Proposal as PDF using both direct PDF export and the established index.css print architecture
  const handleDownloadProposalPDF = (actionType: "download" | "print" = "download") => {
    setIsGeneratingPDF(true);
    setToastMessage(null);

    // Setup print-optimization DOM in #print-root matching index.css requirements
    try {
      let printRoot = document.getElementById("print-root");
      if (!printRoot) {
        printRoot = document.createElement("div");
        printRoot.id = "print-root";
        document.body.appendChild(printRoot);
      }
      printRoot.innerHTML = "";

      // Page 1: Proposal Document Area (conforming to index.css #printable-document-area-clone)
      const proposalElem = document.getElementById("printable-proposal-calc-area");
      if (proposalElem) {
        const page1Div = document.createElement("div");
        page1Div.className = "print-page";
        const clone1 = proposalElem.cloneNode(true) as HTMLElement;
        clone1.id = "printable-document-area-clone";
        page1Div.appendChild(clone1);
        printRoot.appendChild(page1Div);
      }

      // Page 2: Terms & Conditions Sheet (conforming to index.css #terms-conditions-sheet-clone)
      if (includeAgreement) {
        const termsElem = document.getElementById("terms-conditions-sheet-calc");
        if (termsElem) {
          const page2Div = document.createElement("div");
          page2Div.className = "print-page";
          const clone2 = termsElem.cloneNode(true) as HTMLElement;
          clone2.id = "terms-conditions-sheet-clone";
          page2Div.appendChild(clone2);
          printRoot.appendChild(page2Div);
        }
      }

      // Activate print mode helper class on document.body as defined in index.css
      document.body.classList.add("is-printing");

      setTimeout(() => {
        if (actionType === "download") {
          // Generate vector PDF file via jsPDF and trigger browser download
          const fileName = generateBrandedQuotationPDF();
          document.body.classList.remove("is-printing");
          if (printRoot) printRoot.innerHTML = "";
          setIsGeneratingPDF(false);
          setToastMessage(`Branded PDF Quotation downloaded successfully (${fileName})! Formatted for A4 print.`);
          setTimeout(() => setToastMessage(null), 6000);
        } else {
          // Trigger browser print dialog utilizing the print styles from index.css
          window.print();
          document.body.classList.remove("is-printing");
          if (printRoot) printRoot.innerHTML = "";
          setIsGeneratingPDF(false);
          setToastMessage("Official ZOF Quotation opened in print engine! Select 'Save as PDF' to save your file.");
          setTimeout(() => setToastMessage(null), 6000);
        }
      }, 300);
    } catch (err) {
      console.error("Error generating proposal PDF", err);
      document.body.classList.remove("is-printing");
      setIsGeneratingPDF(false);
      setToastMessage("Could not complete PDF generation. Please try again.");
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <section id="material-calculator" className="py-20 bg-stone-900 text-stone-100 border-t border-stone-850 relative overflow-hidden text-left scroll-mt-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-xs text-amber-400 mb-4 select-none font-semibold">
            <Calculator className="h-4 w-4 text-amber-500" />
            <span className="font-mono uppercase tracking-wider">Accra Region Structural Specs</span>
          </div>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-white tracking-tight leading-none mb-4">
            Interactive Roof Material Estimator
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Specify your building dimensions, roof pitch design, and preferred aluzinc profiling. Our real-time calculator produces immediate cost benchmarks matching local materials price codes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Inputs Section */}
          <div className="lg:col-span-7 bg-stone-950/80 border border-stone-800 p-6 sm:p-8 rounded-3xl space-y-8 backdrop-blur-md shadow-2xl">
            
            {/* Part 1: Dimensional Matrix */}
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-5">
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                  <Maximize className="h-4 w-4" />
                  <span>1. Roof Dimensional Footprint</span>
                </h3>
                
                {/* Unit selector switch */}
                <div className="flex border border-stone-800 rounded-lg overflow-hidden p-0.5 bg-stone-900">
                  <button
                    type="button"
                    onClick={() => setUnit("meters")}
                    className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer ${
                      unit === "meters" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    METERS
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit("feet")}
                    className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer ${
                      unit === "feet" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    FEET
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono text-stone-450 text-stone-400 uppercase tracking-wider mb-2">
                    Horizontal Roof Length ({unit === "meters" ? "m" : "ft"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={length}
                    onChange={(e) => setLength(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-3 text-white font-mono font-black text-sm focus:outline-none focus:ring-1 focus:ring-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-450 text-stone-400 uppercase tracking-wider mb-2">
                    Horizontal Roof Width ({unit === "meters" ? "m" : "ft"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-3 text-white font-mono font-black text-sm focus:outline-none focus:ring-1 focus:ring-stone-600"
                  />
                </div>
              </div>
            </div>

            {/* Part 2: Structural Profile & Pitch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <span>2. Roof Pitch / Shape</span>
                  <HelpCircle className="h-3.5 w-3.5 text-stone-500" title="Determines slope surface area factor" />
                </label>
                <select
                  value={roofShape}
                  onChange={(e) => setRoofShape(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-3 text-white font-sans text-xs focus:outline-none focus:ring-1 focus:ring-stone-600 font-bold"
                >
                  <option value="gable">Gable Design (1.15x Slope Factor)</option>
                  <option value="hip">Hip Roof Complex (1.30x Slope Factor)</option>
                  <option value="shed">Shed / Pent Single-Slope (1.10x Slope Factor)</option>
                  <option value="flat">Flat / Low Slope (1.05x Slope Factor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-2">
                  3. Metal Sheeting Profile
                </label>
                <select
                  value={materialProfile}
                  onChange={(e) => setMaterialProfile(e.target.value as any)}
                  className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-3 text-white font-sans text-xs focus:outline-none focus:ring-1 focus:ring-stone-600 font-bold"
                >
                  <option value="selflock">Concealed Selflock® Aluzinc (₵125/m²)</option>
                  <option value="ibr">Premium IBR Sheets (₵105/m²)</option>
                  <option value="step_tiles">Mediterranean Step Tiles (₵115/m²)</option>
                  <option value="aluminium_plain">Plain Aluminium Coastal Alloy (₵140/m²)</option>
                </select>
              </div>
            </div>

            {/* Part 3: Framework Trusses */}
            <div>
              <label className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-3">
                4. Structural Truss Framework Structure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "mahogany", name: "Mahogany Timber", desc: "Chemical Treated Wood", rate: "₵85/m²" },
                  { id: "steel", name: "Light Galvanized Steel", desc: "Industrial Structural Grade", rate: "₵150/m²" },
                  { id: "none", name: "None (Labor Only)", desc: "Truss framework exists", rate: "₵0" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTrussType(item.id as any)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      trussType === item.id
                        ? "bg-stone-900 border-amber-500 ring-1 ring-amber-500/20 text-white"
                        : "bg-stone-900/40 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900 text-stone-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-bold text-xs">{item.name}</span>
                      <span className="text-[9px] font-mono font-bold bg-stone-950 px-1.5 py-0.5 rounded text-amber-400 border border-stone-800">
                        {item.rate}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Part 4: Dynamic Calculator Ledger Output */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 sm:p-5 text-left">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-800 pb-2 mb-4">
                Real-Time Material & Structural Requirements
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs text-stone-350">
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase">Base Footprint</span>
                  <span className="text-white font-bold text-sm block mt-0.5">
                    {(length * width).toFixed(1)} {unit === "meters" ? "m²" : "ft²"}
                  </span>
                </div>

                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase">Surface Area</span>
                  <span className="text-amber-400 font-bold text-sm block mt-0.5">
                    {surfaceAreaDisplay.toFixed(1)} {unit === "meters" ? "m²" : "ft²"}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] block uppercase">Roof Sheets required</span>
                  <span className="text-white font-bold text-sm block mt-0.5">
                    {Math.ceil(sqMeters * 1.08)} Panels
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Estimates & Save Form Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Pricing Breakdown Card */}
            <div className="bg-[#1C1917] border border-stone-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
                <Calculator className="h-44 w-44 text-amber-500" />
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans font-black text-lg text-white flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-amber-500" />
                  <span>Estimated Budget Summary</span>
                </h3>
                <div className="inline-flex rounded-lg p-0.5 bg-stone-950 border border-stone-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrency("GHS")}
                    className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      currency === "GHS"
                        ? "bg-amber-500 text-stone-950 font-black"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    GHS
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                      currency === "USD"
                        ? "bg-amber-500 text-stone-950 font-black"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    USD
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 border-b border-stone-800 pb-5 mb-5 font-mono text-xs text-stone-400">
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5">
                    <Maximize className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <span>0.50mm Roofing Sheets:</span>
                  </span>
                  <span className="text-stone-200 font-bold">
                    {formatLocalValue(materialCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5">
                    <Trees className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <span>Truss Framework Matrix:</span>
                  </span>
                  <span className="text-stone-200 font-bold">
                    {trussType === "none" ? "Excluded" : formatLocalValue(trussCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5">
                    <Hammer className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <span>Expert Carpentry Labor:</span>
                  </span>
                  <span className="text-stone-200 font-bold">
                    {formatLocalValue(installationCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-1.5">
                    <Truck className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <span>Site Transport & Logistics:</span>
                  </span>
                  <span className="text-stone-200 font-bold">
                    {formatLocalValue(transportBase)}
                  </span>
                </div>

              </div>

              {/* Grand Estimate Total */}
              <div className="space-y-1 mb-2">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block">
                  Computed Contract Sum estimate ({currency})
                </span>
                <span className="text-3xl font-mono font-black text-amber-400 block tracking-tight">
                  {formatLocalValue(grandTotal)}
                </span>
                <span className="text-[10px] text-stone-500 leading-snug block font-sans">
                  *Disclaimer: This is a system-generated structural estimate using a mock conversion rate of 1 USD = 14.50 GHS. Final costs may vary based on exact timber profile measurements and layout complexities.
                </span>
              </div>

              {/* Quick Client Customization for Official Quotation */}
              <div className="mt-5 pt-4 border-t border-stone-800 space-y-3 bg-stone-950/70 p-4 rounded-2xl border border-stone-850">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="h-4 w-4 text-amber-400" />
                    <span className="font-mono text-xs font-bold uppercase text-stone-300">
                      Client & Proposal Customizer
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                    Ref: {proposalDocNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">
                      Client / Developer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Samuel Adjetey"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-lg p-2 text-white text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">
                      Client Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +233 24 286 6658"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-lg p-2 text-white text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">
                      Project Site Location
                    </label>
                    <select
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-lg p-2 text-white text-xs font-medium focus:outline-none"
                    >
                      <option value="Accra">Accra (HQ Area)</option>
                      <option value="Tema">Tema Industrial Zone</option>
                      <option value="Kumasi">Kumasi Metropolitan</option>
                      <option value="Koforidua">Koforidua East</option>
                      <option value="Takoradi">Takoradi Harbor Region</option>
                      <option value="Cape Coast">Cape Coast Coastal</option>
                      <option value="Tamale">Tamale Northern Corridor</option>
                      <option value="Ho">Ho Volta Basin</option>
                      <option value="Sunyani">Sunyani Central</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">
                      Client Email (For Digital Copy)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. developer@estate.gh"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-lg p-2 text-white text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Branded PDF Quotation Generation Suite (Utilizing index.css Print Engine & jsPDF) */}
              <div className="space-y-3 pt-2">
                {/* Primary Action: Download Branded PDF Quotation */}
                <button
                  type="button"
                  id="btn-generate-download-pdf-quotation"
                  onClick={() => handleDownloadProposalPDF("download")}
                  disabled={isGeneratingPDF}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-sans font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2.5 shadow-xl shadow-amber-500/20 cursor-pointer transition-all active:scale-[0.98] border border-amber-300"
                >
                  {isGeneratingPDF ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-stone-950 shrink-0" />
                      <span>Compiling Branded PDF Quotation...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 shrink-0 stroke-[2.5]" />
                      <span>Generate & Download Branded PDF Quotation</span>
                      <span className="text-[10px] bg-stone-950/25 text-stone-950 px-2 py-0.5 rounded font-mono font-black">
                        .PDF
                      </span>
                    </>
                  )}
                </button>

                {/* Secondary Actions: Print A4 Dialog & Interactive Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-print-system-dialog"
                    onClick={() => handleDownloadProposalPDF("print")}
                    disabled={isGeneratingPDF}
                    className="py-2.5 px-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 font-sans font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    title="Print directly or save via browser system dialog utilizing index.css print-optimization styles"
                  >
                    <Printer className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Print via A4 Engine</span>
                  </button>

                  <button
                    type="button"
                    id="btn-preview-proposal-modal"
                    onClick={() => setShowPreviewModal(true)}
                    className="py-2.5 px-3 bg-stone-900 hover:bg-stone-850 active:bg-stone-800 text-stone-200 hover:text-white border border-stone-800 font-sans font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    title="Preview official proposal before printing or downloading"
                  >
                    <Eye className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Preview Document</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-1 pt-1 border-t border-stone-850">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeAgreement}
                      onChange={(e) => setIncludeAgreement(e.target.checked)}
                      className="rounded bg-stone-900 border-stone-700 text-amber-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                    />
                    <span className="text-stone-300">Attach Standard Terms (Page 2)</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                    <span>A4 Print Optimized</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Submit / Sync to Ads Portal Card */}
            <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="h-20 w-20 text-amber-500" />
              </div>

              <div className="flex items-center space-x-2.5 mb-5">
                <div className="h-7 w-7 bg-amber-500 text-stone-950 rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">
                  <Save className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                    Synchronize to Corporate HQ
                  </h4>
                  <p className="text-[10px] text-stone-550 text-stone-400">
                    Save this estimate to our Ads Portal, prompting a dedicated manager to lock in your pricing.
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {saveSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4 text-center py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4"
                  >
                    <CheckCircle className="h-10 w-10 text-amber-500 mx-auto" />
                    <div>
                      <h5 className="font-sans font-bold text-sm text-white">Estimate Registered Successfully</h5>
                      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                        Your calculated roof metrics have been transferred to our Central Admin Panel. Staff will review the ledger and can compile your official Proforma invoice in a click.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetCalculatorForm}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-amber-400 border border-stone-800 font-sans font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Estimate Another Project
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSaveToDashboard}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div>
                      <label className="block text-[10px] font-mono text-stone-450 text-stone-450 text-stone-400 uppercase tracking-wider mb-1.5">
                        Client / Developer Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel Adjetey"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-stone-450 text-stone-400 uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0242866658"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-stone-450 text-stone-400 uppercase tracking-wider mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="developer@example.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-stone-405 text-stone-400 uppercase tracking-wider mb-1.5">
                        Project Site Location / City
                      </label>
                      <select
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                      >
                        <option value="Accra">Accra (HQ Area)</option>
                        <option value="Tema">Tema Industrial Zone</option>
                        <option value="Kumasi">Kumasi Metropolitan</option>
                        <option value="Koforidua">Koforidua East</option>
                        <option value="Takoradi">Takoradi Harbor Region</option>
                        <option value="Cape Coast">Cape Coast Coastal Area</option>
                      </select>
                    </div>

                    {saveError && (
                      <p className="text-red-400 text-xs font-mono font-bold">
                        Error: {saveError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-sans font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md select-none transition-all active:scale-98"
                    >
                      {saving ? (
                        <span>Synchronizing Estimate...</span>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Push Estimate to Admin Portal</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>

      {/* Floating Toast Notification for PDF Action Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-950 text-white border border-amber-500/40 p-4 rounded-2xl shadow-2xl flex items-center space-x-3.5"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Check className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-400 font-sans">Document Prepared for PDF Download</p>
              <p className="text-[11px] text-stone-300 font-mono mt-0.5 leading-tight">{toastMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-stone-400 hover:text-white text-xs font-mono p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Full Proposal Document Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-left shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800 pb-4 mb-4 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-base sm:text-lg text-white">
                      Official Cost Proposal Document Preview
                    </h3>
                    <p className="text-xs font-mono text-stone-400">
                      Ref: <span className="text-amber-400">{proposalDocNumber}</span> • Ready for A4 Print & PDF Download
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleDownloadProposalPDF("download");
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-black text-xs uppercase rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPreviewModal(false);
                      handleDownloadProposalPDF("print");
                    }}
                    className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white font-sans font-bold text-xs uppercase rounded-xl flex items-center space-x-1.5 cursor-pointer border border-stone-700 transition-all active:scale-95"
                  >
                    <Printer className="h-4 w-4 text-amber-400" />
                    <span>Print via A4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl cursor-pointer transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Multi-Page Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div className="flex space-x-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("proposal")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                      previewTab === "proposal" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Page 1: Scope Proposal & BOQ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("agreement")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                      previewTab === "agreement" ? "bg-amber-500 text-stone-950 font-black" : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Page 2: Terms & Conditions
                  </button>
                </div>

                <div className="text-[11px] font-mono text-stone-400 hidden sm:block">
                  ZOF Enterprise Architecture Spec
                </div>
              </div>

              {/* Scrollable Document Area */}
              <div className="overflow-y-auto flex-1 pr-1 bg-stone-950 p-2 sm:p-4 rounded-2xl border border-stone-800/80">
                {previewTab === "proposal" ? (
                  <PrintableProposalDocument
                    clientName={clientName || "Valued Property Developer"}
                    clientPhone={clientPhone || "+233 (0) 24 286 6658"}
                    clientEmail={clientEmail || "info@zofroofingsystem.com"}
                    clientCity={clientCity}
                    length={length}
                    width={width}
                    unit={unit}
                    roofShape={roofShape}
                    materialProfile={materialProfile}
                    trussType={trussType}
                    currency={currency}
                    exchangeRate={exchangeRate}
                    proposalNumber={proposalDocNumber}
                    materialCost={materialCost}
                    trussCost={trussCost}
                    installationCost={installationCost}
                    transportBase={transportBase}
                    grandTotal={grandTotal}
                    sqMeters={sqMeters}
                    surfaceAreaDisplay={surfaceAreaDisplay}
                  />
                ) : (
                  <TermsAndConditionsAgreement
                    data={{
                      clientName: clientName || "Valued Client",
                      clientPhone: clientPhone || "+233 (0) 24 286 6658",
                      invoiceRef: proposalDocNumber,
                      validityDays: 14,
                      depositPercent: 70,
                      finalPercent: 10
                    }}
                  />
                )}
              </div>

              {/* Footer Modal Note */}
              <div className="pt-3 border-t border-stone-800 mt-3 flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>Print engine formats both pages automatically into standard A4 PDF dimensions.</span>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-stone-300 hover:text-white underline cursor-pointer"
                >
                  Close Preview
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offscreen / Hidden Source Elements for Instant Print Extraction */}
      <div className="hidden">
        <PrintableProposalDocument
          id="printable-proposal-calc-area"
          clientName={clientName || "Valued Property Developer"}
          clientPhone={clientPhone || "+233 (0) 24 286 6658"}
          clientEmail={clientEmail || "info@zofroofingsystem.com"}
          clientCity={clientCity}
          length={length}
          width={width}
          unit={unit}
          roofShape={roofShape}
          materialProfile={materialProfile}
          trussType={trussType}
          currency={currency}
          exchangeRate={exchangeRate}
          proposalNumber={proposalDocNumber}
          materialCost={materialCost}
          trussCost={trussCost}
          installationCost={installationCost}
          transportBase={transportBase}
          grandTotal={grandTotal}
          sqMeters={sqMeters}
          surfaceAreaDisplay={surfaceAreaDisplay}
        />

        <TermsAndConditionsAgreement
          id="terms-conditions-sheet-calc"
          data={{
            clientName: clientName || "Valued Client",
            clientPhone: clientPhone || "+233 (0) 24 286 6658",
            invoiceRef: proposalDocNumber,
            validityDays: 14,
            depositPercent: 70,
            finalPercent: 10
          }}
          isPrintVersion={true}
        />
      </div>

    </section>
  );
}
