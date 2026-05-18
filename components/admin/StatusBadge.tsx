"use client";

const statusStyles: Record<string, string> = {
  // Case statuses
  open: "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-500",
  // Animal statuses
  stray: "bg-red-100 text-red-700",
  rescued: "bg-blue-100 text-blue-700",
  fostered: "bg-teal-100 text-teal-700",
  adopted: "bg-green-100 text-green-700",
  deceased: "bg-gray-200 text-gray-500",
  // Adoption statuses
  enquiry: "bg-amber-100 text-amber-700",
  application: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
