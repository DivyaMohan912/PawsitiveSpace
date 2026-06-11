"use client";

import { useState } from "react";

type UserRole = "admin" | "foster" | "reporter" | null;
type ShareType = "story" | "post" | "reel";

interface ShareToInstagramProps {
  imageUrl: string | null;
  caption: string;
  className?: string;
  size?: "sm" | "md";
  role?: UserRole;
  entityId?: string; // listing or case ID — used for once-per-day tracking
}

const DAILY_SHARE_KEY = "ig_shared_today";

function hasSharedToday(entityId: string): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(DAILY_SHARE_KEY) || "{}");
    const lastShared = stored[entityId];
    if (!lastShared) return false;
    const today = new Date().toDateString();
    return new Date(lastShared).toDateString() === today;
  } catch {
    return false;
  }
}

function markSharedToday(entityId: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(DAILY_SHARE_KEY) || "{}");
    stored[entityId] = new Date().toISOString();
    localStorage.setItem(DAILY_SHARE_KEY, JSON.stringify(stored));
  } catch {
    // silent
  }
}

// Viewers (role=null) should never see this component — parent pages control that.
// Fosters/Reporters: story only, once per day
// Admins: post or reel, no daily limit

export default function ShareToInstagram({
  imageUrl,
  caption,
  className = "",
  size = "sm",
  role = null,
  entityId = "",
}: ShareToInstagramProps) {
  const [posting, setPosting] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  // Don't render for viewers
  if (!role) return null;

  const isAdmin = role === "admin";
  const alreadyShared = entityId ? hasSharedToday(entityId) : false;

  // Non-admins: block if already shared today
  if (!isAdmin && alreadyShared) {
    return (
      <div className={`relative inline-block ${className}`}>
        <span className={`inline-flex items-center gap-1.5 ${size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} font-semibold rounded-lg bg-gray-100 text-gray-400`}>
          <IgIcon /> Shared today ✓
        </span>
      </div>
    );
  }

  async function handleShare(shareType: ShareType) {
    if (!imageUrl) {
      setResult("error");
      setErrorMsg("No photo available. Upload a photo first.");
      setTimeout(() => setResult(null), 4000);
      return;
    }

    setPosting(true);
    setResult(null);
    setErrorMsg("");
    setShowTypeMenu(false);

    try {
      const res = await fetch("/api/instagram/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, caption, shareType }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult("success");
        if (entityId) markSharedToday(entityId);
      } else {
        setResult("error");
        setErrorMsg(data.error || "Failed to share to Instagram");
      }
    } catch {
      setResult("error");
      setErrorMsg("Network error. Try again.");
    } finally {
      setPosting(false);
      setTimeout(() => setResult(null), 5000);
    }
  }

  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <div className={`relative inline-block ${className}`}>
      {isAdmin ? (
        /* Admin: dropdown to pick post type */
        <>
          <button
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            disabled={posting}
            className={`inline-flex items-center gap-1.5 ${sizeClasses} font-semibold rounded-lg transition
              ${posting
                ? "bg-gray-100 text-gray-400 cursor-wait"
                : result === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:brightness-110"
              } disabled:opacity-60`}
          >
            {posting ? (
              <><Spinner /> Sharing…</>
            ) : result === "success" ? (
              <>✅ Shared!</>
            ) : (
              <><IgIcon /> Share to IG ▾</>
            )}
          </button>
          {showTypeMenu && !posting && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
              <button onClick={() => handleShare("story")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                📱 Story
              </button>
              <button onClick={() => handleShare("post")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                🖼️ Post
              </button>
              <button onClick={() => handleShare("reel")} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                🎬 Reel
              </button>
            </div>
          )}
        </>
      ) : (
        /* Foster/Reporter: story only */
        <button
          onClick={() => handleShare("story")}
          disabled={posting}
          className={`inline-flex items-center gap-1.5 ${sizeClasses} font-semibold rounded-lg transition
            ${posting
              ? "bg-gray-100 text-gray-400 cursor-wait"
              : result === "success"
                ? "bg-green-100 text-green-700"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:brightness-110"
            } disabled:opacity-60`}
        >
          {posting ? (
            <><Spinner /> Sharing…</>
          ) : result === "success" ? (
            <>✅ Shared!</>
          ) : (
            <><IgIcon /> Share Story</>
          )}
        </button>
      )}

      {result === "error" && errorMsg && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-2 whitespace-nowrap shadow-lg">
          {errorMsg}
        </div>
      )}
    </div>
  );
}

function IgIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
  );
}
