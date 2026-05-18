"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase";
import StatusBadge from "@/components/admin/StatusBadge";
import MaskedPhone from "@/components/admin/MaskedPhone";

interface LogRow {
  id: string;
  from_number: string;
  message_body: string;
  parsed_intent: string | null;
  parsed_data: any;
  linked_case_id: string | null;
  created_at: string;
}

const INTENTS = ["all", "REPORT_ANIMAL", "ADOPTION_ENQUIRY", "STATUS_CHECK", "UNKNOWN"];

export default function ReportsPage() {
  const supabase = createBrowserClient();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [intentFilter, setIntentFilter] = useState("all");
  const [linkedFilter, setLinkedFilter] = useState("all");
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [caseIdInput, setCaseIdInput] = useState("");

  const load = useCallback(async () => {
    let q = supabase.from("whatsapp_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (intentFilter !== "all") q = q.eq("parsed_intent", intentFilter);
    if (linkedFilter === "linked") q = q.not("linked_case_id", "is", null);
    if (linkedFilter === "unlinked") q = q.is("linked_case_id", null);
    const { data } = await q;
    setLogs((data ?? []) as LogRow[]);
  }, [intentFilter, linkedFilter]);

  useEffect(() => { load(); }, [load]);

  async function linkToCase(logId: string) {
    if (!caseIdInput.trim()) return;
    // Look up case by partial ID
    const { data } = await supabase
      .from("rescue_cases")
      .select("id")
      .ilike("id", `${caseIdInput}%`)
      .limit(1)
      .single();

    if (data) {
      await supabase.from("whatsapp_logs").update({ linked_case_id: data.id }).eq("id", logId);
      setLinkingId(null);
      setCaseIdInput("");
      load();
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">WhatsApp Reports</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {INTENTS.map((i) => <option key={i} value={i}>{i === "all" ? "All Intents" : i}</option>)}
        </select>
        <select value={linkedFilter} onChange={(e) => setLinkedFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="linked">Linked to case</option>
          <option value="unlinked">Unlinked</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase text-left">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Intent</th>
                <th className="px-4 py-3">Linked Case</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-orange-50/50">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3"><MaskedPhone number={log.from_number} /></td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-600">{log.message_body}</td>
                  <td className="px-4 py-3">
                    {log.parsed_intent ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{log.parsed_intent}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {log.linked_case_id ? (
                      <span className="text-green-600 font-bold">{log.linked_case_id.slice(0, 8).toUpperCase()}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!log.linked_case_id && (
                      linkingId === log.id ? (
                        <div className="flex gap-1">
                          <input
                            className="border rounded px-2 py-1 text-xs w-24"
                            placeholder="Case ID"
                            value={caseIdInput}
                            onChange={(e) => setCaseIdInput(e.target.value)}
                          />
                          <button onClick={() => linkToCase(log.id)} className="text-xs text-brand-orange font-bold">Link</button>
                          <button onClick={() => setLinkingId(null)} className="text-xs text-gray-400">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setLinkingId(log.id); setCaseIdInput(""); }} className="text-xs text-brand-orange font-bold hover:underline">
                          Link to case
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No WhatsApp logs yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
