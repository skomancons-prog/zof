import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Sparkles,
  MessageSquareQuote,
  Check,
  X,
  MapPin,
  Maximize2,
  Play,
  ShieldCheck,
  Camera,
  Plus,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { ClientReviewSubmission } from "../types";
import { triggerAdminPrintReport } from "../utils/adminPrintReport";

interface PendingApprovalViewProps {
  onPendingCountChange?: (count: number) => void;
}

export function PendingApprovalView({ onPendingCountChange }: PendingApprovalViewProps) {
  const [reviews, setReviews] = useState<ClientReviewSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "all" | "approved" | "featured" | "rejected">("pending");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Batch Selection & Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [isBatchApproveModalOpen, setIsBatchApproveModalOpen] = useState(false);
  const [batchApproveNotes, setBatchApproveNotes] = useState("");
  const [isBatchRejectModalOpen, setIsBatchRejectModalOpen] = useState(false);
  const [batchRejectNotes, setBatchRejectNotes] = useState("");
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);

  // Lightbox / Media Modals
  const [activePhotoModal, setActivePhotoModal] = useState<{ photos: string[]; index: number; title: string } | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string } | null>(null);

  // Rejection Reason Modal
  const [rejectingReview, setRejectingReview] = useState<ClientReviewSubmission | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  // Confirm Delete Modal (avoiding window.confirm)
  const [deletingReview, setDeletingReview] = useState<ClientReviewSubmission | null>(null);

  // Add / Edit Submission Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ClientReviewSubmission | null>(null);
  const [formClientName, setFormClientName] = useState("");
  const [formClientRole, setFormClientRole] = useState("Property Owner");
  const [formClientCity, setFormClientCity] = useState("Accra");
  const [formProjectTitle, setFormProjectTitle] = useState("");
  const [formCategory, setFormCategory] = useState<ClientReviewSubmission["category"]>("Selflock & PVC");
  const [formRoofArea, setFormRoofArea] = useState("4,800 sq ft");
  const [formDuration, setFormDuration] = useState("5 Days");
  const [formRating, setFormRating] = useState(5);
  const [formQuote, setFormQuote] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [formContractRef, setFormContractRef] = useState("");

  const PRESET_PHOTO_OPTIONS = [
    { label: "East Legon Villa Selflock", url: "/src/assets/images/completed_villa_eastlegon_1794301912764.jpg" },
    { label: "Cantonments Commercial Aluminum", url: "/src/assets/images/completed_commercial_cantonments_1794301913682.jpg" },
    { label: "Polycarbonate Daylight Pergola", url: "/src/assets/images/completed_patio_polycarbonate_1794301913187.jpg" },
    { label: "Selflock Sheeting Finished", url: "/src/assets/images/beautiful_selflock_sheeting_1782230951805.jpg" },
    { label: "Renovation Extension", url: "/src/assets/images/beautiful_renovation_extension_1782231175276.jpg" },
    { label: "Metal Fab & Trusses", url: "/src/assets/images/zof_metal_fab_accessories_1782225925551.jpg" },
  ];

  const notifyUpdate = (nextList: ClientReviewSubmission[]) => {
    const pendingCount = nextList.filter((r) => r.status === "pending").length;
    if (onPendingCountChange) {
      onPendingCountChange(pendingCount);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("zof-reviews-updated"));
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/showcase/reviews");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
          const pendingCount = data.reviews.filter((r: ClientReviewSubmission) => r.status === "pending").length;
          if (onPendingCountChange) {
            onPendingCountChange(pendingCount);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch review submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      featured: reviews.filter((r) => r.status === "featured").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesStatus = selectedStatus === "all" ? true : r.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" ? true : r.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        r.clientName.toLowerCase().includes(q) ||
        r.projectTitle.toLowerCase().includes(q) ||
        r.clientCity.toLowerCase().includes(q) ||
        r.testimonialQuote.toLowerCase().includes(q) ||
        r.verifiedContractRef.toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [reviews, selectedStatus, selectedCategory, searchQuery]);

  // Keep selectedIds synced to currently visible submissions so filters/actions never leave stale hidden IDs
  useEffect(() => {
    const visibleIds = new Set(filteredReviews.map((r) => r.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredReviews]);

  const allVisibleSelected =
    filteredReviews.length > 0 && filteredReviews.every((r) => selectedIds.includes(r.id));
  const someVisibleSelected = selectedIds.length > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const selectedReviews = useMemo(
    () => filteredReviews.filter((r) => selectedIds.includes(r.id)),
    [filteredReviews, selectedIds]
  );

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReviews.map((r) => r.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBatchApproveConfirm = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const res = await fetch("/api/showcase/reviews/approve-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          staffReviewNotes:
            batchApproveNotes.trim() ||
            "Batch approved via Admin Dashboard Pending Approval queue for public display.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const nextList: ClientReviewSubmission[] = Array.isArray(data.reviews) ? data.reviews : reviews;
        setReviews(nextList);
        notifyUpdate(nextList);
        setSelectedIds([]);
        showToast(
          `${data.updatedCount ?? selectedIds.length} submission(s) approved and published to the public Showcase & Testimonials.`
        );
      }
    } catch (err) {
      console.error("Failed to batch approve reviews", err);
    } finally {
      setBatchActionLoading(false);
      setIsBatchApproveModalOpen(false);
      setBatchApproveNotes("");
    }
  };

  const handleBatchRejectConfirm = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const res = await fetch("/api/showcase/reviews/reject-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          staffReviewNotes:
            batchRejectNotes.trim() ||
            "Batch rejected during moderation: requires clearer project photos or verified client details.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const nextList: ClientReviewSubmission[] = Array.isArray(data.reviews) ? data.reviews : reviews;
        setReviews(nextList);
        notifyUpdate(nextList);
        setSelectedIds([]);
        showToast(
          `${data.updatedCount ?? selectedIds.length} submission(s) rejected and withheld from public display.`
        );
      }
    } catch (err) {
      console.error("Failed to batch reject reviews", err);
    } finally {
      setBatchActionLoading(false);
      setIsBatchRejectModalOpen(false);
      setBatchRejectNotes("");
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/showcase/reviews/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffReviewNotes: "Approved via Admin Dashboard Pending Approval queue for public display.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const nextList = reviews.map((r) => (r.id === id ? data.review : r));
        setReviews(nextList);
        notifyUpdate(nextList);
        showToast(`Submission ${id} approved and published to the public Showcase & Testimonials.`);
      }
    } catch (err) {
      console.error("Failed to approve review", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeature = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/showcase/reviews/${id}/feature`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const nextList = reviews.map((r) => (r.id === id ? data.review : r));
        setReviews(nextList);
        notifyUpdate(nextList);
        showToast(
          data.review.status === "featured"
            ? `Submission ${id} pinned as Featured Spotlight on the public Showcase.`
            : `Submission ${id} updated to standard Approved status.`
        );
      }
    } catch (err) {
      console.error("Failed to toggle feature", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingReview) return;
    const id = rejectingReview.id;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/showcase/reviews/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffReviewNotes: rejectNotes.trim() || "Rejected during moderation: requires clearer project photos or verified client details.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const nextList = reviews.map((r) => (r.id === id ? data.review : r));
        setReviews(nextList);
        notifyUpdate(nextList);
        showToast(`Submission ${id} rejected and removed from public display queue.`);
      }
    } catch (err) {
      console.error("Failed to reject review", err);
    } finally {
      setActionLoadingId(null);
      setRejectingReview(null);
      setRejectNotes("");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    const id = deletingReview.id;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/showcase/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        const nextList = reviews.filter((r) => r.id !== id);
        setReviews(nextList);
        notifyUpdate(nextList);
        showToast(`Submission ${id} permanently deleted.`);
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    } finally {
      setActionLoadingId(null);
      setDeletingReview(null);
    }
  };

  const openAddModal = () => {
    setEditingReview(null);
    setFormClientName("");
    setFormClientRole("Property Owner");
    setFormClientCity("East Legon, Accra");
    setFormProjectTitle("");
    setFormCategory("Selflock & PVC");
    setFormRoofArea("4,800 sq ft");
    setFormDuration("5 Days");
    setFormRating(5);
    setFormQuote("");
    setFormPhotos([PRESET_PHOTO_OPTIONS[0].url]);
    setNewPhotoUrl("");
    setFormContractRef(`ZOF-CN-2026-${Math.floor(100 + Math.random() * 900)}`);
    setIsFormModalOpen(true);
  };

  const openEditModal = (review: ClientReviewSubmission) => {
    setEditingReview(review);
    setFormClientName(review.clientName);
    setFormClientRole(review.clientRole);
    setFormClientCity(review.clientCity);
    setFormProjectTitle(review.projectTitle);
    setFormCategory(review.category);
    setFormRoofArea(review.roofArea);
    setFormDuration(review.duration);
    setFormRating(review.rating);
    setFormQuote(review.testimonialQuote);
    setFormPhotos(review.photos || []);
    setNewPhotoUrl("");
    setFormContractRef(review.verifiedContractRef);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formQuote.trim()) return;

    const payload = {
      clientName: formClientName.trim(),
      clientRole: formClientRole.trim() || "Property Developer",
      clientCity: formClientCity.trim() || "Accra",
      projectTitle: formProjectTitle.trim() || `${formClientName.trim()}'s Completed Project`,
      category: formCategory,
      roofArea: formRoofArea.trim() || "4,500 sq ft",
      duration: formDuration.trim() || "5 Days",
      rating: formRating,
      testimonialQuote: formQuote.trim(),
      photos: formPhotos,
      verifiedContractRef: formContractRef.trim() || `ZOF-CN-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: editingReview ? editingReview.status : "pending",
    };

    try {
      if (editingReview) {
        const res = await fetch(`/api/showcase/reviews/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const nextList = reviews.map((r) => (r.id === editingReview.id ? data.review : r));
          setReviews(nextList);
          notifyUpdate(nextList);
          showToast(`Submission ${editingReview.id} updated.`);
        }
      } else {
        const res = await fetch("/api/showcase/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const nextList = [data.review, ...reviews];
          setReviews(nextList);
          notifyUpdate(nextList);
          setSelectedStatus("pending");
          showToast(`New testimonial & project photos queued for Pending Approval.`);
        }
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error("Failed to save review submission", err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-stone-900 border border-emerald-500/40 px-4 py-3 text-xs font-medium text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <h2 className="font-sans font-black text-xl text-white flex items-center gap-2.5">
            <MessageSquareQuote className="h-5 w-5 text-amber-400 shrink-0" />
            <span>Pending Approval — Public Showcase &amp; Testimonials</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Review submitted client testimonials and completed project photos before approving them for live display on the public website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => triggerAdminPrintReport(["admin-active-print-report"])}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Download Report</span>
          </button>

          <button
            type="button"
            onClick={fetchReviews}
            disabled={loading}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Submit Review / Photo</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setSelectedStatus("pending")}
          className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "pending"
              ? "bg-amber-500/15 border-amber-500/50"
              : "bg-stone-900 border-stone-800 hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 uppercase tracking-wider">
            <span>Pending Approval</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl font-mono font-black text-white tabular-nums mt-1.5">{stats.pending}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Awaiting Approve / Reject decision</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("approved")}
          className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "approved"
              ? "bg-emerald-500/15 border-emerald-500/50"
              : "bg-stone-900 border-stone-800 hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
            <span>Approved Public</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-mono font-black text-white tabular-nums mt-1.5">{stats.approved}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Live on public Showcase</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("featured")}
          className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "featured"
              ? "bg-blue-500/15 border-blue-500/50"
              : "bg-stone-900 border-stone-800 hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 uppercase tracking-wider">
            <span>Featured Spotlight</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-2xl font-mono font-black text-white tabular-nums mt-1.5">{stats.featured}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Pinned to top of portfolio</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("rejected")}
          className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
            selectedStatus === "rejected"
              ? "bg-rose-500/15 border-rose-500/50"
              : "bg-stone-900 border-stone-800 hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-rose-400 uppercase tracking-wider">
            <span>Rejected</span>
            <XCircle className="h-4 w-4" />
          </div>
          <p className="text-2xl font-mono font-black text-white tabular-nums mt-1.5">{stats.rejected}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Withheld from public display</p>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "pending", label: "Pending Approval", count: stats.pending },
            { id: "all", label: "All Submissions", count: stats.total },
            { id: "approved", label: "Approved", count: stats.approved },
            { id: "featured", label: "Featured", count: stats.featured },
            { id: "rejected", label: "Rejected", count: stats.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-amber-500 text-stone-950 font-black"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] tabular-nums ${
                  selectedStatus === tab.id ? "bg-stone-950/20 text-stone-950" : "bg-stone-800 text-stone-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="Selflock & PVC">Selflock &amp; PVC</option>
            <option value="Metal & Aluminium">Metal &amp; Aluminium</option>
            <option value="Step Tiles & Shingles">Step Tiles &amp; Shingles</option>
            <option value="Gutters & Polycarbonate">Gutters &amp; Polycarbonate</option>
            <option value="Civil & Structural">Civil &amp; Structural</option>
          </select>

          <div className="relative flex-1 sm:flex-initial">
            <Search className="h-3.5 w-3.5 text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search client, city, contract ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Selection & Batch Action Bar */}
      {!loading && filteredReviews.length > 0 && (
        <div
          className={`rounded-2xl border px-4 py-3 transition-all flex flex-wrap items-center justify-between gap-3 ${
            selectedIds.length > 0
              ? "sticky top-4 z-20 bg-stone-900/95 backdrop-blur-md border-amber-500/60 shadow-2xl"
              : "bg-stone-900/70 border-stone-800"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2.5 text-xs font-mono text-stone-200 cursor-pointer select-none">
              <input
                ref={selectAllCheckboxRef}
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                aria-label="Select all visible submissions"
                className="h-4 w-4 rounded border-stone-700 bg-stone-950 accent-amber-500 cursor-pointer"
              />
              <span className="font-bold">
                {allVisibleSelected ? "Deselect All" : "Select All"}
              </span>
              <span className="text-stone-400 tabular-nums">({filteredReviews.length})</span>
            </label>

            {selectedIds.length > 0 && (
              <>
                <span className="text-stone-700" aria-hidden="true">|</span>
                <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                  {selectedIds.length} Selected
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={batchActionLoading}
                  className="text-xs font-mono text-stone-400 hover:text-white underline underline-offset-2 cursor-pointer disabled:opacity-50"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => {
                  setBatchApproveNotes("");
                  setIsBatchApproveModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Approve Selected ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => {
                  setBatchRejectNotes("");
                  setIsBatchRejectModalOpen(true);
                }}
                className="px-4 py-2 bg-rose-600/15 hover:bg-rose-600 disabled:opacity-50 text-rose-400 hover:text-white border border-rose-500/40 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
                <span>Reject Selected ({selectedIds.length})</span>
              </button>
            </div>
          ) : (
            <p className="text-[11px] font-mono text-stone-400">
              Select multiple submissions for batch moderation
            </p>
          )}
        </div>
      )}

      {/* Submissions List */}
      {loading ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-stone-400">Loading submitted testimonials and project photos...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-sm font-bold text-white">
            {selectedStatus === "pending" ? "All Pending Testimonials Reviewed" : "No Submissions Found"}
          </h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            {selectedStatus === "pending"
              ? "There are currently no pending testimonials or photos awaiting approval. Switch to All Submissions or submit a new client review."
              : "No submissions match your active filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isPending = review.status === "pending";
            const isApproved = review.status === "approved";
            const isFeatured = review.status === "featured";
            const isRejected = review.status === "rejected";
            const isBusy = actionLoadingId === review.id || batchActionLoading;
            const isSelected = selectedIds.includes(review.id);

            return (
              <div
                key={review.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isSelected
                    ? "bg-stone-900 border-amber-500 ring-1 ring-amber-500/40"
                    : isPending
                    ? "bg-stone-900 border-amber-500/40"
                    : isFeatured
                    ? "bg-stone-900 border-blue-500/40"
                    : isRejected
                    ? "bg-stone-950 border-rose-500/30 opacity-90"
                    : "bg-stone-900 border-stone-800"
                }`}
              >
                {/* Metadata Header Row (Zero-pill typographic separators) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-stone-400">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectId(review.id)}
                      aria-label={`Select submission ${review.id} by ${review.clientName}`}
                      className="h-4 w-4 rounded border-stone-700 bg-stone-950 accent-amber-500 cursor-pointer shrink-0"
                    />
                    <span className="text-amber-400 font-bold">{review.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>Contract: {review.verifiedContractRef}</span>
                    <span aria-hidden="true">·</span>
                    <span>{review.submittedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-200">{review.category}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold">
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 text-amber-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Pending Approval</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approved · Public</span>
                      </span>
                    )}
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1.5 text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Featured Spotlight</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Testimonial & Client Info */}
                  <div className="lg:col-span-7 space-y-3">
                    <div>
                      <h3 className="font-sans font-bold text-base sm:text-lg text-white">
                        {review.projectTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 mt-1">
                        <span className="font-semibold text-stone-200">{review.clientName}</span>
                        <span>({review.clientRole})</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-stone-300">
                          <MapPin className="h-3 w-3 text-amber-400" />
                          <span>{review.clientCity}</span>
                        </span>
                      </div>
                    </div>

                    {/* Rating & Quantitative Scope */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400">
                      <div className="flex items-center gap-0.5" aria-label={`Rated ${review.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-stone-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-stone-200 font-bold tabular-nums">{review.rating}.0 / 5</span>
                      <span aria-hidden="true">·</span>
                      <span>Area: {review.roofArea}</span>
                      <span aria-hidden="true">·</span>
                      <span>Duration: {review.duration}</span>
                    </div>

                    {/* Client Quote */}
                    <blockquote className="bg-stone-950 border border-stone-800 rounded-xl p-4 text-xs sm:text-sm text-stone-200 leading-relaxed italic">
                      &ldquo;{review.testimonialQuote}&rdquo;
                    </blockquote>

                    {/* Staff Review Notes */}
                    {review.staffReviewNotes && (
                      <div className="flex items-start gap-2 text-[11px] font-mono text-stone-400 bg-stone-950/60 border border-stone-800/80 rounded-xl p-3">
                        <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-stone-300 font-bold">Moderation Note: </span>
                          <span>{review.staffReviewNotes}</span>
                          {review.reviewedBy && (
                            <span className="text-stone-500 ml-1.5">
                              — {review.reviewedBy} ({review.reviewedAt})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submitted Images & Media Preview */}
                  <div className="lg:col-span-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-300">
                      <span className="flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-amber-400" />
                        <span>Submitted Photos ({review.photos?.length || 0})</span>
                      </span>
                      {review.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setActiveVideoModal({ url: review.videoUrl!, title: review.projectTitle })}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-amber-400" />
                          <span>Drone Clip</span>
                        </button>
                      )}
                    </div>

                    {review.photos && review.photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        {review.photos.map((photo, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setActivePhotoModal({
                                photos: review.photos,
                                index: idx,
                                title: review.projectTitle,
                              })
                            }
                            className="group relative h-32 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 hover:border-amber-500/60 transition-all cursor-pointer text-left"
                          >
                            <img
                              src={photo}
                              alt={`${review.projectTitle} photo ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="h-4 w-4 text-white" />
                            </div>
                            <span className="absolute bottom-1.5 left-1.5 bg-stone-950/80 text-stone-200 text-[10px] font-mono px-1.5 py-0.5 rounded">
                              Image {idx + 1}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border border-dashed border-stone-800 bg-stone-950/50 flex flex-col items-center justify-center text-stone-500 text-xs gap-1.5">
                        <ImageIcon className="h-5 w-5 text-stone-600" />
                        <span>No images attached to submission</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Bar: Approve / Reject / Spotlight / Edit / Delete */}
                <div className="mt-5 pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Approve Button */}
                    {(!isApproved && !isFeatured) && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleApprove(review.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                      >
                        <Check className="h-4 w-4 stroke-[2.5]" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Pin / Feature Button for Approved entries */}
                    {(isApproved || isFeatured) && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleFeature(review.id)}
                        className={`px-3.5 py-2 text-xs font-sans font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                          isFeatured
                            ? "bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30"
                            : "bg-stone-950 border-stone-700 text-stone-300 hover:text-white hover:border-stone-600"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isFeatured ? "Featured Spotlight (Active)" : "Feature on Showcase"}</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setRejectNotes(review.staffReviewNotes || "");
                          setRejectingReview(review);
                        }}
                        className="px-4 py-2 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <X className="h-4 w-4 stroke-[2.5]" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(review)}
                      className="px-3 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-mono rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingReview(review)}
                      className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-950 rounded-xl transition-colors cursor-pointer"
                      title="Delete submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div>
                <h4 className="text-sm font-bold text-white">{activePhotoModal.title}</h4>
                <p className="text-xs font-mono text-stone-400">
                  Image {activePhotoModal.index + 1} of {activePhotoModal.photos.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="h-[60vh] bg-black flex items-center justify-center relative p-2">
              <img
                src={activePhotoModal.photos[activePhotoModal.index]}
                alt="Submitted completed roof inspection"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              {activePhotoModal.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoModal((prev) =>
                        prev
                          ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length }
                          : null
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                  >
                    &larr;
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoModal((prev) =>
                        prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                  >
                    &rarr;
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drone Video Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <h4 className="text-sm font-bold text-white">{activeVideoModal.title}</h4>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video src={activeVideoModal.url} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>Reject Submission ({rejectingReview.id})</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Record a reason for rejecting this testimonial/photo submission so staff can follow up with the client or site supervisor:
            </p>

            <textarea
              rows={3}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Photos are too blurry or scaffolding still covers the roof ridge..."
              className="w-full bg-stone-950 border border-stone-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="px-4 py-2 text-xs font-mono text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Approve Confirmation Modal */}
      {isBatchApproveModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-approve-modal-title"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 id="batch-approve-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Confirm Bulk Approval ({selectedIds.length} Submission{selectedIds.length === 1 ? "" : "s"})</span>
              </h3>
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => setIsBatchApproveModalOpen(false)}
                aria-label="Close bulk approval confirmation modal"
                className="text-stone-400 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              You are about to approve <span className="font-mono font-bold text-emerald-400 tabular-nums">{selectedIds.length}</span> selected client submission{selectedIds.length === 1 ? "" : "s"} and publish their testimonials and completed project photos to the public Showcase &amp; Testimonials.
            </p>

            {/* Selected Items Preview List */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
              {selectedReviews.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-[11px] font-mono border-b border-stone-800/70 last:border-b-0 pb-1.5 last:pb-0"
                >
                  <div className="min-w-0 truncate text-stone-200">
                    <span className="text-amber-400 font-bold">{item.id}</span>
                    <span className="text-stone-500 mx-1.5">·</span>
                    <span className="font-sans font-semibold">{item.clientName}</span>
                    <span className="text-stone-500 mx-1.5">·</span>
                    <span className="text-stone-400">{item.projectTitle}</span>
                  </div>
                  <span className="text-stone-500 shrink-0 tabular-nums">
                    {item.photos?.length || 0} photo{(item.photos?.length || 0) === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1.5">
                Optional Moderation Note
              </label>
              <textarea
                rows={2}
                value={batchApproveNotes}
                onChange={(e) => setBatchApproveNotes(e.target.value)}
                placeholder="e.g. Verified client contracts and inspected final installation photos for public gallery..."
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => setIsBatchApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-stone-400 hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={handleBatchApproveConfirm}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{batchActionLoading ? "Approving..." : `Confirm Approve (${selectedIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Reject Confirmation & Reason Modal */}
      {isBatchRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-reject-modal-title"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 id="batch-reject-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Confirm Bulk Rejection ({selectedIds.length} Submission{selectedIds.length === 1 ? "" : "s"})</span>
              </h3>
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => setIsBatchRejectModalOpen(false)}
                aria-label="Close bulk rejection confirmation modal"
                className="text-stone-400 hover:text-white cursor-pointer disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              You are about to reject <span className="font-mono font-bold text-rose-400 tabular-nums">{selectedIds.length}</span> selected client submission{selectedIds.length === 1 ? "" : "s"} and withhold them from the public Showcase &amp; Testimonials.
            </p>

            {/* Selected Items Preview List */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
              {selectedReviews.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-[11px] font-mono border-b border-stone-800/70 last:border-b-0 pb-1.5 last:pb-0"
                >
                  <div className="min-w-0 truncate text-stone-200">
                    <span className="text-amber-400 font-bold">{item.id}</span>
                    <span className="text-stone-500 mx-1.5">·</span>
                    <span className="font-sans font-semibold">{item.clientName}</span>
                    <span className="text-stone-500 mx-1.5">·</span>
                    <span className="text-stone-400">{item.projectTitle}</span>
                  </div>
                  <span className="text-stone-500 shrink-0 tabular-nums">
                    {item.photos?.length || 0} photo{(item.photos?.length || 0) === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1.5">
                Shared Moderation Note
              </label>
              <textarea
                rows={3}
                value={batchRejectNotes}
                onChange={(e) => setBatchRejectNotes(e.target.value)}
                placeholder="e.g. Submitted photos require higher resolution or removal of temporary site scaffolding..."
                className="w-full bg-stone-950 border border-stone-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => setIsBatchRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-mono text-stone-400 hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={handleBatchRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <X className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{batchActionLoading ? "Rejecting..." : `Confirm Reject (${selectedIds.length})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Delete Submission {deletingReview.id}?</h3>
            <p className="text-xs text-stone-400">
              This will permanently remove {deletingReview.clientName}&apos;s testimonial and attached photos from the moderation ledger.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 text-xs font-mono text-stone-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Submission Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl max-h-[90vh] flex flex-col my-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingReview ? `Edit Submission (${editingReview.id})` : "Submit Client Testimonial & Completed Photos"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Samuel Boateng"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Client Role</label>
                  <input
                    type="text"
                    value={formClientRole}
                    onChange={(e) => setFormClientRole(e.target.value)}
                    placeholder="e.g. UK Diaspora Homeowner"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Site Location</label>
                  <input
                    type="text"
                    value={formClientCity}
                    onChange={(e) => setFormClientCity(e.target.value)}
                    placeholder="e.g. East Legon, Accra"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Contract Reference</label>
                  <input
                    type="text"
                    value={formContractRef}
                    onChange={(e) => setFormContractRef(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  value={formProjectTitle}
                  onChange={(e) => setFormProjectTitle(e.target.value)}
                  placeholder="e.g. Contemporary Residence Selflock® Installation"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Selflock & PVC">Selflock &amp; PVC</option>
                    <option value="Metal & Aluminium">Metal &amp; Aluminium</option>
                    <option value="Step Tiles & Shingles">Step Tiles &amp; Shingles</option>
                    <option value="Gutters & Polycarbonate">Gutters &amp; Polycarbonate</option>
                    <option value="Civil & Structural">Civil &amp; Structural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Roof Area</label>
                  <input
                    type="text"
                    value={formRoofArea}
                    onChange={(e) => setFormRoofArea(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Rating</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Testimonial Quote *</label>
                <textarea
                  rows={3}
                  required
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder="Client review about workmanship, remote updates, and roofing quality..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Attached Project Photos</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_PHOTO_OPTIONS.map((opt) => (
                    <button
                      key={opt.url}
                      type="button"
                      onClick={() => {
                        if (!formPhotos.includes(opt.url)) {
                          setFormPhotos([...formPhotos, opt.url]);
                        }
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border cursor-pointer ${
                        formPhotos.includes(opt.url)
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:text-white"
                      }`}
                    >
                      + {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste image URL..."
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoUrl.trim()) {
                        setFormPhotos([...formPhotos, newPhotoUrl.trim()]);
                        setNewPhotoUrl("");
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {formPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {formPhotos.map((p, i) => (
                      <div key={i} className="relative h-16 rounded-lg overflow-hidden border border-stone-800">
                        <img src={p} alt="selected" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/80 text-white cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-stone-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-black text-xs uppercase rounded-xl cursor-pointer"
                >
                  {editingReview ? "Save Changes" : "Queue for Pending Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print-Friendly Paginated Report Source (utilized by index.css #print-root) */}
      <div id="admin-active-print-report" className="hidden" aria-hidden="true">
        {(() => {
          const itemsPerPage = 3;
          const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
          const generatedAt = new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return Array.from({ length: totalPages }).map((_, pageIdx) => {
            const pageItems = filteredReviews.slice(
              pageIdx * itemsPerPage,
              (pageIdx + 1) * itemsPerPage
            );

            return (
              <div key={pageIdx} className="print-page">
                <div className="printable-page-clone">
                  <div>
                    {/* Branded Executive Report Header */}
                    <div className="bg-[#10223D] p-3 rounded-lg flex items-center justify-between gap-4 mb-3">
                      <div>
                        <p className="text-amber-300 font-mono font-bold uppercase tracking-wider text-xs">
                          ZOF ROOFING SYSTEMS LTD · SHOWCASE MODERATION REPORT
                        </p>
                        <h2 className="font-sans font-black text-white mt-0.5">
                          Client Testimonials &amp; Completed Project Gallery Ledger
                        </h2>
                      </div>
                      <div className="text-right font-mono text-xs shrink-0">
                        <p className="text-amber-300 font-bold">
                          Page {pageIdx + 1} of {totalPages}
                        </p>
                        <p className="text-white">Generated: {generatedAt}</p>
                      </div>
                    </div>

                    {/* Active Filter Metadata */}
                    <div className="flex items-center justify-between border border-stone-800 rounded-lg px-3 py-2 mb-3 font-mono text-xs">
                      <span>
                        Status Filter: <strong>{selectedStatus.toUpperCase()}</strong> · Category:{" "}
                        <strong>{selectedCategory === "all" ? "All Categories" : selectedCategory}</strong>
                        {searchQuery.trim() ? ` · Search: "${searchQuery.trim()}"` : ""}
                      </span>
                      <span className="tabular-nums font-bold">
                        Matching Records: {filteredReviews.length}
                      </span>
                    </div>

                    {/* KPI Summary Strip on Page 1 */}
                    {pageIdx === 0 && (
                      <div className="grid grid-cols-5 gap-2 mb-3 font-mono text-center">
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Total</div>
                          <div className="font-bold text-sm tabular-nums">{stats.total}</div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Pending</div>
                          <div className="font-bold text-sm tabular-nums">{stats.pending}</div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Approved</div>
                          <div className="font-bold text-sm tabular-nums">{stats.approved}</div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Featured</div>
                          <div className="font-bold text-sm tabular-nums">{stats.featured}</div>
                        </div>
                        <div className="border border-stone-800 rounded p-2">
                          <div className="text-xs uppercase">Rejected</div>
                          <div className="font-bold text-sm tabular-nums">{stats.rejected}</div>
                        </div>
                      </div>
                    )}

                    {/* Testimonial Entries */}
                    {pageItems.length === 0 ? (
                      <div className="border border-stone-800 rounded-lg p-6 text-center font-mono text-xs">
                        No testimonial submissions match the currently active filters.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pageItems.map((rev) => (
                          <div key={rev.id} className="border border-stone-800 rounded-lg p-3 space-y-1.5">
                            <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 font-mono text-xs">
                              <span>
                                <strong>{rev.id}</strong> · Contract: {rev.verifiedContractRef} ·{" "}
                                {rev.submittedAt} · {rev.category}
                              </span>
                              <span className="font-bold uppercase">
                                Status: {rev.status}
                              </span>
                            </div>

                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <h3 className="font-sans font-bold">
                                  {rev.projectTitle} — {rev.clientName} ({rev.clientRole})
                                </h3>
                                <p className="font-mono text-xs">
                                  Location: {rev.clientCity} · Rating: {rev.rating}.0 / 5 · Area:{" "}
                                  {rev.roofArea} · Duration: {rev.duration} · Photos Attached:{" "}
                                  {rev.photos?.length || 0}
                                </p>
                                <p className="italic">
                                  &ldquo;{rev.testimonialQuote}&rdquo;
                                </p>
                                {rev.staffReviewNotes && (
                                  <p className="font-mono text-xs">
                                    <strong>Moderation Note:</strong> {rev.staffReviewNotes}
                                    {rev.reviewedBy ? ` — ${rev.reviewedBy} (${rev.reviewedAt})` : ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Report Page Footer */}
                  <div className="border-t border-stone-800 pt-2 mt-3 flex items-center justify-between font-mono text-xs">
                    <span>ZOF Roofing Systems Ltd · zofroofingsystem.com · GS 1059:2019 Certified</span>
                    <span>Admin Moderation Report · {generatedAt}</span>
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
export default PendingApprovalView;
