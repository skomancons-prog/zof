import React, { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Warehouse,
  ShieldAlert,
  ArrowUpRight,
  Edit2,
  Trash2,
  FileText,
  Clock,
  Layers,
  Building,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export type InventoryCategory =
  | "All"
  | "Selflock Panels"
  | "Structural Timber"
  | "Metal Sheeting"
  | "Waterproofing"
  | "Civil & Steel"
  | "Interior & Ceilings"
  | "Hardware & Accessories";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: "Selflock Panels" | "Structural Timber" | "Metal Sheeting" | "Waterproofing" | "Civil & Steel" | "Interior & Ceilings" | "Hardware & Accessories";
  quantity: number;
  unit: string;
  minThreshold: number;
  unitCost: number; // in GHS
  sellingPrice: number; // in GHS
  location: string;
  lastRestocked: string;
  leadTimeDays: number;
  criticalItem?: boolean;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  // --- CRITICAL SELFLOCK PANELS ---
  {
    id: "item-1",
    sku: "SL-CHR-050",
    name: "Selflock® Charcoal Architectural Panels (0.50mm AZ150)",
    category: "Selflock Panels",
    quantity: 380,
    unit: "m²",
    minThreshold: 800,
    unitCost: 145,
    sellingPrice: 185,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Oct 24, 2026",
    leadTimeDays: 3,
    criticalItem: true
  },
  {
    id: "item-2",
    sku: "SL-BLU-055",
    name: "Selflock® Deep Ocean Blue Panels (0.55mm Marine Grade)",
    category: "Selflock Panels",
    quantity: 260,
    unit: "m²",
    minThreshold: 600,
    unitCost: 160,
    sellingPrice: 205,
    location: "Takoradi Maritime Depot",
    lastRestocked: "Oct 22, 2026",
    leadTimeDays: 4,
    criticalItem: true
  },
  {
    id: "item-3",
    sku: "SL-WDL-050",
    name: "Selflock® Woodland Forest Green Panels (0.50mm AZ150)",
    category: "Selflock Panels",
    quantity: 420,
    unit: "m²",
    minThreshold: 500,
    unitCost: 145,
    sellingPrice: 185,
    location: "Kumasi Mega-Hub",
    lastRestocked: "Oct 28, 2026",
    leadTimeDays: 3,
    criticalItem: true
  },

  // --- CRITICAL STRUCTURAL TIMBER ---
  {
    id: "item-4",
    sku: "TM-TRS-6X2",
    name: "High-Tensile Kiln-Dried Timber Trusses (6x2 Treated Hardwood)",
    category: "Structural Timber",
    quantity: 18,
    unit: "units",
    minThreshold: 60,
    unitCost: 3200,
    sellingPrice: 4500,
    location: "Kumasi Mega-Hub & Timber Yard",
    lastRestocked: "Oct 19, 2026",
    leadTimeDays: 7,
    criticalItem: true
  },
  {
    id: "item-5",
    sku: "TM-PRL-4X2",
    name: "Treated Structural Sawn Timber Purlins (4x2 Boron Preserved)",
    category: "Structural Timber",
    quantity: 110,
    unit: "pcs",
    minThreshold: 350,
    unitCost: 65,
    sellingPrice: 95,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Oct 21, 2026",
    leadTimeDays: 5,
    criticalItem: true
  },
  {
    id: "item-6",
    sku: "TM-WLP-4X3",
    name: "Heavy-Duty Structural Timber Wall Plates (4x3 Kiln-Dried)",
    category: "Structural Timber",
    quantity: 42,
    unit: "pcs",
    minThreshold: 100,
    unitCost: 85,
    sellingPrice: 125,
    location: "Tamale Savanna Hub",
    lastRestocked: "Oct 15, 2026",
    leadTimeDays: 6,
    criticalItem: true
  },

  // --- METAL SHEETING & WATERPROOFING ---
  {
    id: "item-7",
    sku: "IBR-ALZ-050",
    name: "IBR Corrugated Marine Aluzinc 0.50mm Roofing Sheets",
    category: "Metal Sheeting",
    quantity: 1650,
    unit: "m²",
    minThreshold: 1000,
    unitCost: 110,
    sellingPrice: 145,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Nov 02, 2026",
    leadTimeDays: 2
  },
  {
    id: "item-8",
    sku: "IDT-IND-060",
    name: "IDT Industrial High-Span Fluted Sheeting (0.60mm Commercial)",
    category: "Metal Sheeting",
    quantity: 920,
    unit: "m²",
    minThreshold: 500,
    unitCost: 135,
    sellingPrice: 175,
    location: "Takoradi Maritime Depot",
    lastRestocked: "Oct 29, 2026",
    leadTimeDays: 3
  },
  {
    id: "item-9",
    sku: "WP-ELM-020",
    name: "High-Build Liquid Elastomeric Waterproofing Pails (20L)",
    category: "Waterproofing",
    quantity: 26,
    unit: "pails",
    minThreshold: 60,
    unitCost: 950,
    sellingPrice: 1250,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Oct 18, 2026",
    leadTimeDays: 4,
    criticalItem: true
  },
  {
    id: "item-10",
    sku: "WP-TOR-004",
    name: "4mm APP Modified Bitumen Torch-On Rolls (10m x 1m)",
    category: "Waterproofing",
    quantity: 34,
    unit: "rolls",
    minThreshold: 80,
    unitCost: 480,
    sellingPrice: 650,
    location: "Kumasi Mega-Hub",
    lastRestocked: "Oct 16, 2026",
    leadTimeDays: 5
  },

  // --- INTERIOR, CIVIL & HARDWARE ---
  {
    id: "item-11",
    sku: "POP-GYP-012",
    name: "Moisture-Resistant Gypsum Ceiling Boards (12mm Board)",
    category: "Interior & Ceilings",
    quantity: 85,
    unit: "sheets",
    minThreshold: 180,
    unitCost: 95,
    sellingPrice: 140,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Oct 20, 2026",
    leadTimeDays: 3
  },
  {
    id: "item-12",
    sku: "ST-REB-016",
    name: "High-Yield Reinforced Steel Rebar (16mm Structural Grade)",
    category: "Civil & Steel",
    quantity: 9.5,
    unit: "tonnes",
    minThreshold: 5.0,
    unitCost: 7800,
    sellingPrice: 9400,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Nov 04, 2026",
    leadTimeDays: 2
  },
  {
    id: "item-13",
    sku: "GTR-ALM-070",
    name: "Seamless Aluminum Rainwater Gutter Coils (0.70mm Raw Coil)",
    category: "Hardware & Accessories",
    quantity: 580,
    unit: "meters",
    minThreshold: 400,
    unitCost: 42,
    sellingPrice: 65,
    location: "Accra Flagship HQ (Spintex Yard)",
    lastRestocked: "Oct 31, 2026",
    leadTimeDays: 3
  },
  {
    id: "item-14",
    sku: "FST-SCW-500",
    name: "Self-Drilling Hex Screws with EPDM Washers (Boxes of 500)",
    category: "Hardware & Accessories",
    quantity: 64,
    unit: "boxes",
    minThreshold: 30,
    unitCost: 110,
    sellingPrice: 155,
    location: "Kumasi Mega-Hub",
    lastRestocked: "Nov 01, 2026",
    leadTimeDays: 2
  }
];

export function InventoryManagementPanel() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);
  const [alertDismissed, setAlertDismissed] = useState<boolean>(false);

  // Restock modal state
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockAddQty, setRestockAddQty] = useState<number>(50);

  // New item modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    sku: "",
    name: "",
    category: "Selflock Panels",
    quantity: 100,
    unit: "m²",
    minThreshold: 200,
    unitCost: 100,
    sellingPrice: 150,
    location: "Accra Flagship HQ (Spintex Yard)",
    leadTimeDays: 3,
    criticalItem: false
  });

  // Calculate live low stock and critical items
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minThreshold);
  }, [inventory]);

  const criticalLowStockItems = useMemo(() => {
    return inventory.filter(
      (item) => item.quantity <= item.minThreshold * 0.5 && item.criticalItem
    );
  }, [inventory]);

  // Total valuation
  const inventoryMetrics = useMemo(() => {
    const totalItems = inventory.length;
    const totalCostValue = inventory.reduce((acc, curr) => acc + curr.quantity * curr.unitCost, 0);
    const totalSalesValue = inventory.reduce((acc, curr) => acc + curr.quantity * curr.sellingPrice, 0);
    const lowCount = lowStockItems.length;
    const criticalCount = criticalLowStockItems.length;

    return {
      totalItems,
      totalCostValue,
      totalSalesValue,
      lowCount,
      criticalCount
    };
  }, [inventory, lowStockItems, criticalLowStockItems]);

  // Filtered Inventory List
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesLocation = selectedLocation === "All Locations" || item.location === selectedLocation;
      const matchesLowStock = !filterLowStockOnly || item.quantity <= item.minThreshold;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      return matchesCategory && matchesLocation && matchesLowStock && matchesSearch;
    });
  }, [inventory, selectedCategory, selectedLocation, filterLowStockOnly, searchQuery]);

  // Handle quick stock adjustment (+ / -)
  const handleAdjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQty
          };
        }
        return item;
      })
    );
  };

  // Submit Restock
  const handleConfirmRestock = () => {
    if (!restockModalItem) return;
    const added = Number(restockAddQty) || 0;
    if (added <= 0) return;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === restockModalItem.id) {
          return {
            ...item,
            quantity: item.quantity + added,
            lastRestocked: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
          };
        }
        return item;
      })
    );
    setRestockModalItem(null);
  };

  // Add New Item
  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.sku) return;

    const itemToAdd: InventoryItem = {
      id: `item-${Date.now()}`,
      sku: newItem.sku.toUpperCase(),
      name: newItem.name,
      category: (newItem.category as any) || "Selflock Panels",
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit || "m²",
      minThreshold: Number(newItem.minThreshold) || 100,
      unitCost: Number(newItem.unitCost) || 0,
      sellingPrice: Number(newItem.sellingPrice) || 0,
      location: newItem.location || "Accra Flagship HQ (Spintex Yard)",
      lastRestocked: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      leadTimeDays: Number(newItem.leadTimeDays) || 3,
      criticalItem: Boolean(newItem.criticalItem)
    };

    setInventory((prev) => [itemToAdd, ...prev]);
    setIsAddModalOpen(false);
    setNewItem({
      sku: "",
      name: "",
      category: "Selflock Panels",
      quantity: 100,
      unit: "m²",
      minThreshold: 200,
      unitCost: 100,
      sellingPrice: 150,
      location: "Accra Flagship HQ (Spintex Yard)",
      leadTimeDays: 3,
      criticalItem: false
    });
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to remove this SKU from active inventory tracking?")) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // ==========================================
  // EXPORT INVENTORY AUDIT AS PDF VIA JSPDF
  // ==========================================
  const exportInventoryPdf = (onlyLowStock: boolean = false) => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const itemsToExport = onlyLowStock
        ? inventory.filter((item) => item.quantity <= item.minThreshold)
        : filteredInventory;

      const reportDate = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      const reportTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });

      // --- PAGE HEADER & BRANDING ---
      doc.setFillColor(34, 27, 19); // Rich charcoal / dark slate
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ZOF GROUP OFFICIAL INVENTORY AUDIT", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(243, 188, 118); // Amber accent
      doc.text(
        onlyLowStock
          ? "EMERGENCY LOW-STOCK PROCUREMENT RE-ORDER REPORT"
          : "REAL-TIME LOGISTICS & FACTORY WAREHOUSE STOCK LEDGER",
        14,
        22
      );

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.text(`Generated: ${reportDate} at ${reportTime} GMT | Audit ID: ZOF-INV-${Date.now().toString().slice(-6)}`, 14, 29);

      // --- SUMMARY METRICS TILES ---
      let currentY = 44;

      doc.setFillColor(250, 243, 224); // Warm light cream tile
      doc.roundedRect(14, currentY, 43, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(116, 97, 78);
      doc.text("TOTAL TRACKED ITEMS", 18, currentY + 6);
      doc.setFontSize(13);
      doc.setTextColor(34, 27, 19);
      doc.text(`${itemsToExport.length} SKUs`, 18, currentY + 14);

      doc.setFillColor(250, 243, 224);
      doc.roundedRect(61, currentY, 43, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(116, 97, 78);
      doc.text("TOTAL COST VALUATION", 65, currentY + 6);
      doc.setFontSize(11);
      doc.setTextColor(21, 81, 143);
      const totalCost = itemsToExport.reduce((a, b) => a + b.quantity * b.unitCost, 0);
      doc.text(`GHS ${totalCost.toLocaleString()}`, 65, currentY + 14);

      doc.setFillColor(254, 242, 242); // Red tint for alerts
      doc.roundedRect(108, currentY, 43, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(185, 28, 28);
      doc.text("CRITICAL ALERTS", 112, currentY + 6);
      doc.setFontSize(13);
      doc.setTextColor(185, 28, 28);
      const criticalCount = itemsToExport.filter((i) => i.quantity <= i.minThreshold).length;
      doc.text(`${criticalCount} Under Min`, 112, currentY + 14);

      doc.setFillColor(250, 243, 224);
      doc.roundedRect(155, currentY, 41, 18, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(116, 97, 78);
      doc.text("WAREHOUSES SURVEYED", 159, currentY + 6);
      doc.setFontSize(10);
      doc.setTextColor(34, 27, 19);
      doc.text("4 Regional Hubs", 159, currentY + 14);

      currentY += 26;

      // --- CRITICAL ALERT CALLOUT ---
      if (criticalCount > 0) {
        doc.setFillColor(254, 226, 226);
        doc.setDrawColor(239, 68, 68);
        doc.roundedRect(14, currentY, 182, 12, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(153, 27, 27);
        doc.text(
          "URGENT RESTOCK ALERT: Immediate factory production order required for flagged Selflock Panels & Timber.",
          18,
          currentY + 7.5
        );
        currentY += 17;
      }

      // --- TABLE HEADER ---
      doc.setFillColor(235, 219, 192);
      doc.rect(14, currentY, 182, 7.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(44, 34, 25);

      doc.text("SKU", 16, currentY + 5);
      doc.text("ITEM NAME & SPECIFICATION", 42, currentY + 5);
      doc.text("LOCATION", 112, currentY + 5);
      doc.text("QTY", 145, currentY + 5);
      doc.text("MIN", 160, currentY + 5);
      doc.text("STATUS", 175, currentY + 5);

      currentY += 7.5;

      // --- TABLE ROWS ---
      itemsToExport.forEach((item, index) => {
        // Page overflow check
        if (currentY > 265) {
          doc.addPage();
          currentY = 20;

          // Repeat header on new page
          doc.setFillColor(235, 219, 192);
          doc.rect(14, currentY, 182, 7.5, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(44, 34, 25);
          doc.text("SKU", 16, currentY + 5);
          doc.text("ITEM NAME & SPECIFICATION", 42, currentY + 5);
          doc.text("LOCATION", 112, currentY + 5);
          doc.text("QTY", 145, currentY + 5);
          doc.text("MIN", 160, currentY + 5);
          doc.text("STATUS", 175, currentY + 5);
          currentY += 7.5;
        }

        const isLow = item.quantity <= item.minThreshold;
        const isCritical = item.quantity <= item.minThreshold * 0.5;

        // Alternate row fill
        if (index % 2 === 1) {
          doc.setFillColor(250, 248, 242);
          doc.rect(14, currentY, 182, 8, "F");
        }

        doc.setFont("courier", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(21, 81, 143);
        doc.text(item.sku, 16, currentY + 5.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(34, 27, 19);
        const truncatedName = item.name.length > 40 ? item.name.substring(0, 38) + "..." : item.name;
        doc.text(truncatedName, 42, currentY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        const truncatedLoc = item.location.split("(")[0].trim();
        doc.text(truncatedLoc, 112, currentY + 5.5);

        // Qty
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        if (isCritical) {
          doc.setTextColor(220, 38, 38);
        } else if (isLow) {
          doc.setTextColor(217, 119, 6);
        } else {
          doc.setTextColor(16, 149, 90);
        }
        doc.text(`${item.quantity} ${item.unit}`, 145, currentY + 5.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(`${item.minThreshold}`, 160, currentY + 5.5);

        // Status badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        if (isCritical) {
          doc.setTextColor(220, 38, 38);
          doc.text("CRITICAL", 175, currentY + 5.5);
        } else if (isLow) {
          doc.setTextColor(217, 119, 6);
          doc.text("LOW STOCK", 175, currentY + 5.5);
        } else {
          doc.setTextColor(16, 149, 90);
          doc.text("OPTIMAL", 175, currentY + 5.5);
        }

        // Row underline
        doc.setDrawColor(230, 220, 205);
        doc.line(14, currentY + 8, 196, currentY + 8);

        currentY += 8;
      });

      // --- SIGN-OFF & MD VERIFICATION STAMP ---
      if (currentY > 240) {
        doc.addPage();
        currentY = 30;
      } else {
        currentY += 12;
      }

      doc.setDrawColor(210, 195, 175);
      doc.line(14, currentY, 196, currentY);
      currentY += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(34, 27, 19);
      doc.text("MD AUDIT & LOGISTICS SIGN-OFF", 14, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Chief Operating Officer / Warehouse Director", 14, currentY + 6);
      doc.text("Authorized Signature: F. O. Dugbazah MD", 14, currentY + 11);
      doc.text("Digital Seal: SHA256-AUTHENTICATED-STOCK-CLEARANCE", 14, currentY + 16);

      doc.setFont("helvetica", "bold");
      doc.text("Warehouse Supervisor Clearance", 125, currentY);
      doc.line(125, currentY + 12, 185, currentY + 12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Authorized Signature & Date", 125, currentY + 16);

      // Save PDF directly to user's device
      const filename = onlyLowStock
        ? `ZOF_Low_Stock_Emergency_Report_${Date.now().toString().slice(-4)}.pdf`
        : `ZOF_Inventory_Audit_Report_${Date.now().toString().slice(-4)}.pdf`;

      doc.save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error generating Inventory PDF report. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header & Export Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={22} className="text-blue-700" />
            Real-Time Inventory & Material Supply Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live warehouse stock monitoring, automated low-stock procurement triggers, and PDF audit exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportInventoryPdf(true)}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Generate procurement re-order sheet for low stock items only"
          >
            <AlertTriangle size={15} />
            <span>Export Low-Stock PDF</span>
          </button>

          <button
            onClick={() => exportInventoryPdf(false)}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Download complete inventory report as official PDF"
          >
            <Download size={15} />
            <span>{exportingPdf ? "Generating PDF..." : "Export Full Audit PDF"}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Add SKU</span>
          </button>
        </div>
      </div>

      {/* Real-time Critical Low-Stock Warning Banner */}
      {criticalLowStockItems.length > 0 && !alertDismissed && (
        <div className="rounded-2xl border-2 border-red-500/70 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/5 p-4 sm:p-5 shadow-md relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <ShieldAlert size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">
                    CRITICAL LOW STOCK ALERT
                  </span>
                  <span className="text-xs font-mono font-bold text-red-900">
                    {criticalLowStockItems.length} Key Materials Require Immediate Re-Order
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  <strong>Selflock Panels & High-Tensile Structural Timber</strong> have dropped below emergency threshold buffers. Replenishment orders must be scheduled to prevent active client construction site stoppages.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {filterLowStockOnly ? "Show All Items" : "View Critical Items Only"}
              </button>
              <button
                onClick={() => setAlertDismissed(true)}
                className="p-2 text-red-700 hover:text-red-900 rounded-lg hover:bg-red-100/50"
                title="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total SKUs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Active SKUs</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Package size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{inventoryMetrics.totalItems} Items</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Across 4 Regional Warehouses</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`rounded-2xl border p-5 shadow-xs transition-all cursor-pointer ${
            filterLowStockOnly
              ? "border-red-500 bg-red-50/50 ring-2 ring-red-400"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low-Stock Alerts</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-700">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-red-600">{inventoryMetrics.lowCount} SKUs</p>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {inventoryMetrics.criticalCount} Critical
            </span>
          </div>
          <div className="mt-1 text-xs text-blue-700 font-semibold">
            {filterLowStockOnly ? "✓ Showing filtered low stock" : "Click to isolate low stock items"}
          </div>
        </div>

        {/* Total Cost Valuation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inventory Cost Value</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            GHS {inventoryMetrics.totalCostValue.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <span>Audited replacement cost</span>
          </div>
        </div>

        {/* Total Sales Market Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Projected Sales Value</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Warehouse size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            GHS {inventoryMetrics.totalSalesValue.toLocaleString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <span>GHS {(inventoryMetrics.totalSalesValue - inventoryMetrics.totalCostValue).toLocaleString()} Gross Spread</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, Selflock, Timber, IBR..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            "All",
            "Selflock Panels",
            "Structural Timber",
            "Metal Sheeting",
            "Waterproofing",
            "Civil & Steel"
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as InventoryCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:border-blue-600"
          >
            <option value="All Locations">All Warehouses (4)</option>
            <option value="Accra Flagship HQ (Spintex Yard)">Accra Flagship HQ</option>
            <option value="Kumasi Mega-Hub">Kumasi Mega-Hub</option>
            <option value="Takoradi Maritime Depot">Takoradi Maritime Depot</option>
            <option value="Tamale Savanna Hub">Tamale Savanna Hub</option>
          </select>
        </div>

      </div>

      {/* Main Real-Time Inventory Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-sm">Active Material Inventory</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredInventory.length} matching SKUs)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Optimal
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Low Stock
            </span>
            <span className="inline-flex items-center gap-1 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Critical Buffer
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Material Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Warehouse Location</th>
                <th className="px-6 py-3">Live Stock</th>
                <th className="px-6 py-3">Min Buffer</th>
                <th className="px-6 py-3">Stock Status</th>
                <th className="px-6 py-3">Unit Price</th>
                <th className="px-6 py-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                const isCritical = item.quantity <= item.minThreshold * 0.5;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCritical ? "bg-red-50/30" : isLow ? "bg-amber-50/20" : ""
                    }`}
                  >
                    {/* SKU */}
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {item.sku}
                    </td>

                    {/* Name */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.name}</span>
                        {item.criticalItem && (
                          <span className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 px-1.5 py-0.2 rounded">
                            Critical Item
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Last restocked: {item.lastRestocked} • {item.leadTimeDays}d lead time
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-600">
                      {item.location}
                    </td>

                    {/* Live Quantity with + / - controls */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjustStock(item.id, -10)}
                          className="h-6 w-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95"
                          title="Decrease 10 units"
                        >
                          -
                        </button>
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            isCritical ? "text-red-600 font-black" : isLow ? "text-amber-600" : "text-slate-900"
                          }`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleAdjustStock(item.id, 10)}
                          className="h-6 w-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95"
                          title="Increase 10 units"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Min Threshold */}
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono text-slate-500 font-medium">
                      {item.minThreshold} {item.unit}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          <span className="h-2 w-2 rounded-full bg-red-600" />
                          Critical Alert
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Optimal
                        </span>
                      )}
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">GHS {item.sellingPrice}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Cost: GHS {item.unitCost}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockAddQty(item.minThreshold);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] cursor-pointer"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete SKU"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No materials found matching your filters. Try clearing search filters or category toggles.
          </div>
        )}
      </div>

      {/* RESTOCK ACTION MODAL */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Restock Material Order</h4>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-700 uppercase">
                  {restockModalItem.sku}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{restockModalItem.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Location: {restockModalItem.location}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-bold text-slate-900">
                    {restockModalItem.quantity} {restockModalItem.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Minimum Buffer Threshold:</span>
                  <span className="font-mono text-slate-700">
                    {restockModalItem.minThreshold} {restockModalItem.unit}
                  </span>
                </div>
                <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-slate-200">
                  <span>New Total After Restock:</span>
                  <span>
                    {restockModalItem.quantity + Number(restockAddQty || 0)} {restockModalItem.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to Add ({restockModalItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAddQty}
                  onChange={(e) => setRestockAddQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestock}
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW SKU MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">Add New Material SKU</h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SL-RED-050"
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Selflock Panels">Selflock Panels</option>
                    <option value="Structural Timber">Structural Timber</option>
                    <option value="Metal Sheeting">Metal Sheeting</option>
                    <option value="Waterproofing">Waterproofing</option>
                    <option value="Civil & Steel">Civil & Steel</option>
                    <option value="Interior & Ceilings">Interior & Ceilings</option>
                    <option value="Hardware & Accessories">Hardware & Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name & Specification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Selflock® Manor Red Panels (0.50mm AZ150)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Qty *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit (m², pcs, etc) *</label>
                  <input
                    type="text"
                    required
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Buffer Alert *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Cost (GHS) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (GHS) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Location *</label>
                <select
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Accra Flagship HQ (Spintex Yard)">Accra Flagship HQ (Spintex Yard)</option>
                  <option value="Kumasi Mega-Hub & Timber Yard">Kumasi Mega-Hub & Timber Yard</option>
                  <option value="Takoradi Maritime Depot">Takoradi Maritime Depot</option>
                  <option value="Tamale Savanna Hub">Tamale Savanna Hub</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="criticalItemCheckbox"
                  checked={newItem.criticalItem}
                  onChange={(e) => setNewItem({ ...newItem, criticalItem: e.target.checked })}
                  className="rounded text-blue-600 h-4 w-4"
                />
                <label htmlFor="criticalItemCheckbox" className="text-slate-700 font-semibold cursor-pointer">
                  Mark as Critical Item (Triggers urgent top-level low-stock alarms)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm"
                >
                  Save Material SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print-Friendly Paginated Inventory Report Source (utilized by index.css #print-root) */}
      <div id="admin-active-print-report" className="hidden" aria-hidden="true">
        {(() => {
          const itemsPerPage = 12;
          const totalPages = Math.max(1, Math.ceil(filteredInventory.length / itemsPerPage));
          const generatedAt = new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return Array.from({ length: totalPages }).map((_, pageIdx) => {
            const pageItems = filteredInventory.slice(
              pageIdx * itemsPerPage,
              (pageIdx + 1) * itemsPerPage
            );

            return (
              <div key={pageIdx} className="print-page">
                <div className="printable-page-clone">
                  <div>
                    <div className="bg-[#10223D] p-3 rounded-lg flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="text-amber-300 font-mono font-bold uppercase tracking-wider text-xs">
                          ZOF ROOFING SYSTEMS LTD · WAREHOUSE STOCK REPORT
                        </p>
                        <h2 className="font-sans font-black text-white mt-0.5">
                          Real-Time Inventory &amp; Low-Stock Audit Ledger
                        </h2>
                      </div>
                      <div className="text-right font-mono text-xs shrink-0">
                        <p className="text-amber-300 font-bold">
                          Page {pageIdx + 1} of {totalPages}
                        </p>
                        <p className="text-white">Generated: {generatedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border border-stone-800 rounded-lg px-3 py-2 mb-3 font-mono text-xs">
                      <span>
                        Category: <strong>{selectedCategory}</strong> · Hub:{" "}
                        <strong>{selectedLocation}</strong>
                        {filterLowStockOnly ? " · Low-Stock Only" : ""}
                      </span>
                      <span className="tabular-nums font-bold">
                        Matching SKUs: {filteredInventory.length}
                      </span>
                    </div>

                    {pageIdx === 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3 font-mono text-center">
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Active SKUs</div>
                          <div className="font-bold text-sm tabular-nums">{inventoryMetrics.totalItems}</div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Cost Valuation</div>
                          <div className="font-bold text-sm tabular-nums">
                            GHS {inventoryMetrics.totalCostValue.toLocaleString()}
                          </div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Low-Stock Alerts</div>
                          <div className="font-bold text-sm tabular-nums">{inventoryMetrics.lowCount}</div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Critical Buffers</div>
                          <div className="font-bold text-sm tabular-nums">{inventoryMetrics.criticalCount}</div>
                        </div>
                      </div>
                    )}

                    <table className="w-full border-collapse border border-stone-800 text-left font-mono">
                      <thead>
                        <tr className="border-b border-stone-800">
                          <th className="border border-stone-800">SKU</th>
                          <th className="border border-stone-800">Material Description</th>
                          <th className="border border-stone-800">Location</th>
                          <th className="border border-stone-800 text-right">Stock</th>
                          <th className="border border-stone-800 text-right">Min Buffer</th>
                          <th className="border border-stone-800 text-right">Unit Cost</th>
                          <th className="border border-stone-800">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map((item) => {
                          const isCritical = item.quantity <= item.minThreshold * 0.5;
                          const isLow = item.quantity <= item.minThreshold;
                          return (
                            <tr key={item.id} className="border-b border-stone-800">
                              <td className="border border-stone-800 font-bold">{item.sku}</td>
                              <td className="border border-stone-800">{item.name}</td>
                              <td className="border border-stone-800">{item.location}</td>
                              <td className="border border-stone-800 text-right tabular-nums">
                                {item.quantity.toLocaleString()} {item.unit}
                              </td>
                              <td className="border border-stone-800 text-right tabular-nums">
                                {item.minThreshold.toLocaleString()}
                              </td>
                              <td className="border border-stone-800 text-right tabular-nums">
                                GHS {item.unitCost.toLocaleString()}
                              </td>
                              <td className="border border-stone-800 font-bold uppercase">
                                {isCritical ? "Critical" : isLow ? "Low Stock" : "Optimal"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-stone-800 pt-2 mt-3 flex items-center justify-between font-mono text-xs">
                    <span>ZOF Roofing Systems Ltd · Inventory Control · zofroofingsystem.com</span>
                    <span>Inventory Audit · {generatedAt}</span>
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

    </div>
  );
}
