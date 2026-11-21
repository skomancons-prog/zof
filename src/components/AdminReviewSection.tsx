import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  MessageSquareQuote,
  Check,
  X,
  MapPin,
  Maximize2,
  Play,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Camera,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { ClientReviewSubmission } from "../types";

export function AdminReviewSection() {
  const [reviews, setReviews] = useState<ClientReviewSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePhotoModal, setActivePhotoModal] = useState<{ photos: string[]; index: number; title: string } | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ url: string; title: string } | null>(null);

  // Modal States for Add / Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ClientReviewSubmission | null>(null);
  const [rejectingReview, setRejectingReview] = useState<ClientReviewSubmission | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
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
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formContractRef, setFormContractRef] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"pending" | "approved" | "featured">("approved");

  // Sample photo gallery choices for quick selection
  const PRESET_PHOTO_OPTIONS = [
    { label: "East Legon Villa Selflock", url: "/src/assets/images/completed_villa_eastlegon_1794301912764.jpg" },
    { label: "Cantonments Commercial Aluminum", url: "/src/assets/images/completed_commercial_cantonments_1794301913682.jpg" },
    { label: "Polycarbonate Daylight Pergola", url: "/src/assets/images/completed_patio_polycarbonate_1794301913187.jpg" },
    { label: "Selflock Sheeting Roll-formed", url: "/src/assets/images/beautiful_selflock_sheeting_1782230951805.jpg" },
    { label: "Modern Renovation Extension", url: "/src/assets/images/beautiful_renovation_extension_1782231175276.jpg" },
    { label: "Metal Fabrication & Trusses", url: "/src/assets/images/zof_metal_fab_accessories_1782225925551.jpg" }
  ];

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/showcase/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews from API, using fallback data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "pending").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      featured: reviews.filter((r) => r.status === "featured").length,
      rejected: reviews.filter((r) => r.status === "rejected").length,
    };
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesStatus =
        selectedStatus === "all"
          ? true
          : selectedStatus === "approved_or_featured"
          ? r.status === "approved" || r.status === "featured"
          : r.status === selectedStatus;

      const matchesCategory =
        selectedCategory === "all" ? true : r.category === selectedCategory;

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

  // Handler: Approve Review
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/showcase/reviews/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffReviewNotes: "Verified and approved by staff for public Showcase." }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "approved",
                  reviewedBy: "Staff Admin",
                  reviewedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  staffReviewNotes: "Verified and approved by staff for public Showcase."
                }
              : r
          )
        );
        showToast("Review approved! Now live on public Showcase & Testimonials.");
      }
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  // Handler: Feature Review
  const handleToggleFeature = async (id: string) => {
    try {
      const res = await fetch(`/api/showcase/reviews/${id}/feature`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: data.review.status } : r))
        );
        showToast(
          data.review.status === "featured"
            ? "Project marked as Featured Spotlight on public Showcase!"
            : "Project set to standard approved showcase entry."
        );
      }
    } catch (err) {
      console.error("Feature toggle failed", err);
    }
  };

  // Handler: Reject Review
  const handleRejectConfirm = async () => {
    if (!rejectingReview) return;
    try {
      const res = await fetch(`/api/showcase/reviews/${rejectingReview.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffReviewNotes: rejectNotes || "Requires higher resolution photos or client confirmation." }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === rejectingReview.id
              ? {
                  ...r,
                  status: "rejected",
                  staffReviewNotes: rejectNotes || "Requires higher resolution photos or client confirmation.",
                  reviewedBy: "Staff Admin",
                  reviewedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                }
              : r
          )
        );
        showToast(`Review ${rejectingReview.id} rejected with feedback notes.`);
      }
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setRejectingReview(null);
      setRejectNotes("");
    }
  };

  // Handler: Delete Review
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review submission?")) return;
    try {
      const res = await fetch(`/api/showcase/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast("Review submission removed.");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormClientName("");
    setFormClientRole("Property Owner");
    setFormClientCity("Accra");
    setFormProjectTitle("");
    setFormCategory("Selflock & PVC");
    setFormRoofArea("4,800 sq ft");
    setFormDuration("5 Days");
    setFormRating(5);
    setFormQuote("");
    setFormPhotos([PRESET_PHOTO_OPTIONS[0].url]);
    setNewPhotoUrl("");
    setFormVideoUrl("");
    setFormContractRef(`ZOF-CN-2026-${Math.floor(100 + Math.random() * 900)}`);
    setFormNotes("");
    setFormStatus("approved");
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
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
    setFormVideoUrl(review.videoUrl || "");
    setFormContractRef(review.verifiedContractRef);
    setFormNotes(review.staffReviewNotes || "");
    setFormStatus(review.status === "rejected" ? "pending" : (review.status as any));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formQuote.trim()) {
      alert("Please provide both client name and testimonial quote.");
      return;
    }

    const payload = {
      clientName: formClientName,
      clientRole: formClientRole,
      clientCity: formClientCity,
      projectTitle: formProjectTitle || `${formClientName}'s Completed Roofing Project`,
      category: formCategory,
      roofArea: formRoofArea,
      duration: formDuration,
      rating: formRating,
      testimonialQuote: formQuote,
      photos: formPhotos,
      videoUrl: formVideoUrl || undefined,
      verifiedContractRef: formContractRef || `ZOF-CN-2026-${Math.floor(100 + Math.random() * 900)}`,
      staffReviewNotes: formNotes || "Verified by staff.",
      status: formStatus
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
          setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? data.review : r)));
          showToast("Review & photos updated successfully.");
        }
        setEditingReview(null);
      } else {
        const res = await fetch("/api/showcase/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setReviews((prev) => [data.review, ...prev]);
          showToast("New client testimonial & photos logged successfully.");
        }
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error("Save error", err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span>MarketHub Admin</span>
            <span>/</span>
            <span className="text-blue-700 font-bold">Admin Review Console</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Showcase & Testimonials Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, verify, and approve incoming client reviews, ratings, and site photography before publishing to the public Showcase.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/#showcase"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ExternalLink size={14} className="text-slate-500" />
            <span>Public Showcase ({stats.approved + stats.featured} Live)</span>
          </a>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Client Review & Photos</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Submissions</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums block mt-1">{stats.total}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Lifetime received</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block flex items-center justify-between">
            <span>Pending Review</span>
            <Clock size={14} className="text-amber-600" />
          </span>
          <span className="text-2xl font-bold text-amber-900 font-mono tabular-nums block mt-1">{stats.pending}</span>
          <span className="text-[11px] text-amber-700 mt-0.5 block">Requires staff action</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block flex items-center justify-between">
            <span>Approved Showcase</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </span>
          <span className="text-2xl font-bold text-emerald-900 font-mono tabular-nums block mt-1">{stats.approved}</span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Live on storefront</span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block flex items-center justify-between">
            <span>Featured Spotlight</span>
            <Sparkles size={14} className="text-blue-600" />
          </span>
          <span className="text-2xl font-bold text-blue-900 font-mono tabular-nums block mt-1">{stats.featured}</span>
          <span className="text-[11px] text-blue-700 mt-0.5 block">Pinned to top</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Needs Revision</span>
          <span className="text-2xl font-bold text-slate-700 font-mono tabular-nums block mt-1">{stats.rejected}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Feedback logged</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status segmented control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Submissions", count: stats.total },
            { id: "pending", label: "Pending", count: stats.pending },
            { id: "approved", label: "Approved", count: stats.approved },
            { id: "featured", label: "Featured", count: stats.featured },
            { id: "rejected", label: "Needs Revision", count: stats.rejected }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-blue-700 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  selectedStatus === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Category Filter */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-hidden focus:border-blue-600"
          >
            <option value="all">All Profiles</option>
            <option value="Selflock & PVC">Selflock & PVC</option>
            <option value="Metal & Aluminium">Metal & Aluminium</option>
            <option value="Step Tiles & Shingles">Step Tiles & Shingles</option>
            <option value="Gutters & Polycarbonate">Gutters & Polycarbonate</option>
            <option value="Civil & Structural">Civil & Structural</option>
          </select>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, location, contract ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 sm:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <button
            onClick={fetchReviews}
            title="Refresh submissions"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Submissions Feed / Review Cards */}
      {filteredReviews.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <MessageSquareQuote size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No review submissions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedStatus !== "all"
              ? `There are no review records matching status "${selectedStatus}".`
              : "No reviews match your current filters. Clear filters or add a new completed project review."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-xs font-semibold"
          >
            <Plus size={14} />
            <span>Log First Completed Project Review</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isPending = review.status === "pending";
            const isApproved = review.status === "approved";
            const isFeatured = review.status === "featured";
            const isRejected = review.status === "rejected";

            return (
              <div
                key={review.id}
                className={`rounded-2xl border bg-white p-5 sm:p-6 transition-all shadow-xs ${
                  isPending
                    ? "border-amber-300 ring-1 ring-amber-400/20"
                    : isFeatured
                    ? "border-blue-400 ring-1 ring-blue-500/20 bg-gradient-to-br from-white to-blue-50/30"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Header Row: IDs, Dates, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {review.id}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500">Ref: {review.verifiedContractRef}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{review.submittedAt}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-blue-700 font-semibold">{review.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                        <Clock size={12} />
                        <span>Awaiting Staff Approval</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>Approved for Showcase</span>
                      </span>
                    )}
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
                        <Sparkles size={12} />
                        <span>Featured Spotlight</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
                        <XCircle size={12} />
                        <span>Needs Revision</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Body Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Client & Project Info */}
                  <div className="lg:col-span-7 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900">{review.projectTitle}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">{review.clientName}</span>
                        <span>({review.clientRole})</span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={12} className="text-rose-500" />
                          <span>{review.clientCity}</span>
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5 font-mono">{review.rating}.0 / 5</span>
                      <span className="text-xs text-slate-400 ml-2">·</span>
                      <span className="text-xs text-slate-500 ml-2 font-mono">Area: {review.roofArea}</span>
                      <span className="text-xs text-slate-400 ml-2">·</span>
                      <span className="text-xs text-slate-500 ml-2 font-mono">Turnaround: {review.duration}</span>
                    </div>

                    {/* Testimonial Quote Box */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-700 leading-relaxed italic relative">
                      <span className="font-serif text-3xl text-slate-300 absolute -top-1 left-2 select-none">“</span>
                      <p className="pl-3">{review.testimonialQuote}</p>
                    </div>

                    {/* Staff Notes Log */}
                    {review.staffReviewNotes && (
                      <div className="text-[11px] text-slate-500 font-mono bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 flex items-start gap-1.5">
                        <ShieldCheck size={14} className="text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">Staff Review Log: </span>
                          <span>{review.staffReviewNotes}</span>
                          {review.reviewedBy && (
                            <span className="text-slate-400 ml-1">
                              (by {review.reviewedBy} on {review.reviewedAt})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Photos & Media Gallery */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Camera size={14} className="text-slate-500" />
                        <span>Completed Project Photos ({review.photos?.length || 0})</span>
                      </span>
                      {review.videoUrl && (
                        <button
                          onClick={() => setActiveVideoModal({ url: review.videoUrl!, title: review.projectTitle })}
                          className="flex items-center gap-1 text-blue-700 hover:text-blue-800 text-xs font-medium cursor-pointer"
                        >
                          <Play size={12} className="fill-blue-700" />
                          <span>Watch Drone Tour</span>
                        </button>
                      )}
                    </div>

                    {review.photos && review.photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {review.photos.map((photo, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() =>
                              setActivePhotoModal({ photos: review.photos, index: pIdx, title: review.projectTitle })
                            }
                            className="group relative h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs"
                          >
                            <img
                              src={photo}
                              alt={`${review.projectTitle} - photo ${pIdx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 size={16} />
                            </div>
                            <span className="absolute bottom-1 right-1.5 bg-slate-900/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                              Photo {pIdx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                        <span>No completed site photos attached yet.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Suite */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Primary Approval Button */}
                    {!isApproved && !isFeatured && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check size={14} className="stroke-[3]" />
                        <span>Approve for Showcase</span>
                      </button>
                    )}

                    {/* Feature on Showcase Toggle */}
                    {(isApproved || isFeatured) && (
                      <button
                        onClick={() => handleToggleFeature(review.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                          isFeatured
                            ? "bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Sparkles size={13} className={isFeatured ? "text-blue-700 fill-blue-700" : "text-slate-400"} />
                        <span>{isFeatured ? "Pinned to Spotlight (Active)" : "Pin to Spotlight"}</span>
                      </button>
                    )}

                    {/* Needs Revision / Reject Button */}
                    {!isRejected && (
                      <button
                        onClick={() => setRejectingReview(review)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <X size={14} />
                        <span>Request Revision</span>
                      </button>
                    )}

                    {isRejected && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-semibold cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Re-evaluate & Approve</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(review)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs font-medium cursor-pointer"
                      title="Edit review copy or photos"
                    >
                      <Edit2 size={13} />
                      <span>Edit Details</span>
                    </button>

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Photo Zoom Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">{activePhotoModal.title}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Photo {activePhotoModal.index + 1} of {activePhotoModal.photos.length}
                </p>
              </div>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-[60vh] bg-black flex items-center justify-center relative p-2">
              <img
                src={activePhotoModal.photos[activePhotoModal.index]}
                alt="Enlarged completed project photo"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />

              {activePhotoModal.photos.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: (prev.index - 1 + prev.photos.length) % prev.photos.length,
                            }
                          : null
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white"
                  >
                    ❮
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoModal((prev) =>
                        prev
                          ? {
                              ...prev,
                              index: (prev.index + 1) % prev.photos.length,
                            }
                          : null
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector */}
            {activePhotoModal.photos.length > 1 && (
              <div className="flex items-center gap-2 p-3 bg-slate-950 overflow-x-auto border-t border-slate-800">
                {activePhotoModal.photos.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoModal((prev) => (prev ? { ...prev, index: idx } : null))}
                    className={`h-12 w-16 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                      idx === activePhotoModal.index ? "border-blue-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={p} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Drone Tour Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Play size={14} className="fill-blue-500 text-blue-500" />
                <span>Drone Inspection Walkthrough: {activeVideoModal.title}</span>
              </h4>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <video
                src={activeVideoModal.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Request Revision / Reject Modal */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <XCircle size={16} className="text-rose-600" />
                <span>Request Revision for {rejectingReview.id}</span>
              </h3>
              <button onClick={() => setRejectingReview(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Explain why this submission needs updates before it can be published to the public Showcase section:
            </p>

            <textarea
              rows={4}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Please provide high-resolution photo of the fascia eave alignment without construction scaffolding in the frame..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-hidden focus:border-rose-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Save Feedback & Move to Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Review Modal */}
      {(isAddModalOpen || editingReview) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col my-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingReview ? `Edit Completed Project Review (${editingReview.id})` : "Log Incoming Client Testimonial & Photos"}
                </h3>
                <p className="text-xs text-slate-500">
                  Manage completed project proof and customer feedback for the public Showcase section.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingReview(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Michael Ofori"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Client Role / Profile
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UK Diaspora Client / Developer"
                    value={formClientRole}
                    onChange={(e) => setFormClientRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Project Site / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. East Legon Hills, Accra"
                    value={formClientCity}
                    onChange={(e) => setFormClientCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Verified Contract Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZOF-CN-2026-882"
                    value={formContractRef}
                    onChange={(e) => setFormContractRef(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Executive Villa with Concealed Selflock® Roof"
                  value={formProjectTitle}
                  onChange={(e) => setFormProjectTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Roofing Profile Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="Selflock & PVC">Selflock & PVC</option>
                    <option value="Metal & Aluminium">Metal & Aluminium</option>
                    <option value="Step Tiles & Shingles">Step Tiles & Shingles</option>
                    <option value="Gutters & Polycarbonate">Gutters & Polycarbonate</option>
                    <option value="Civil & Structural">Civil & Structural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Roof Area (sq ft)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5,200 sq ft"
                    value={formRoofArea}
                    onChange={(e) => setFormRoofArea(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Execution Turnaround
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Days"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Star Rating (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormRating(st)}
                      className="p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <Star
                        size={20}
                        className={st <= formRating ? "text-amber-400 fill-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 font-mono ml-2">{formRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Client Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste direct feedback from client regarding installation quality, remote supervision, carpentry, and promptness..."
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:outline-hidden focus:border-blue-600 leading-relaxed"
                />
              </div>

              {/* Photos Management */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Completed Project Photos
                </label>
                
                {/* Current attached photos */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formPhotos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={photo} alt="preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormPhotos((prev) => prev.filter((_, i) => i !== pIdx))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black text-white text-xs"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add from Preset authentic photos */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Select authentic project photo:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PHOTO_OPTIONS.map((opt) => (
                      <button
                        key={opt.url}
                        type="button"
                        onClick={() => {
                          if (!formPhotos.includes(opt.url)) {
                            setFormPhotos([...formPhotos, opt.url]);
                          }
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                          formPhotos.includes(opt.url)
                            ? "bg-blue-100 border-blue-300 text-blue-800"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        + {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Or custom URL input */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Or paste custom image URL / path..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPhotoUrl.trim()) {
                          setFormPhotos([...formPhotos, newPhotoUrl.trim()]);
                          setNewPhotoUrl("");
                        }
                      }}
                      className="px-3 py-1 bg-slate-800 text-white text-xs rounded-lg font-medium hover:bg-slate-900"
                    >
                      Add Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Drone Video Link */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Drone Flyover Video URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://assets.mixkit.co/videos/preview/..."
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Moderation Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Approval Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                  >
                    <option value="approved">Approved (Live on Public Showcase)</option>
                    <option value="featured">Featured Spotlight (Pinned to Top)</option>
                    <option value="pending">Pending Staff Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Staff Review Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified with client via WhatsApp"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingReview(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                >
                  {editingReview ? "Save Changes" : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminReviewSection;
