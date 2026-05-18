"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [status, setStatus] = useState("Processing login…");

  useEffect(() => {
    async function handle() {
      try {
        // 1. Check for existing session
        let { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setStatus("No session found. Attempting code exchange…");

          // Supabase OAuth returns tokens in the URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              setStatus(`Session set error: ${error.message}`);
              setTimeout(() => router.push("/admin/login"), 4000);
              return;
            }
            session = data.session;
          }
        }

        if (!session) {
          setStatus("Could not establish session. Redirecting to login…");
          setTimeout(() => router.push("/admin/login"), 3000);
          return;
        }

        const email = session.user.email;
        setStatus(`Signed in as ${email}. Checking admin access…`);

        // 2. Check admin role
        const { data: volunteer, error: volErr } = await supabase
          .from("volunteers")
          .select("id, name, role")
          .eq("email", email)
          .eq("role", "admin")
          .single();

        if (volErr || !volunteer) {
          setStatus(`Access denied for ${email}. Not found as admin in volunteers table.`);
          setTimeout(async () => {
            await supabase.auth.signOut();
            router.push("/admin/login");
          }, 5000);
          return;
        }

        setStatus(`Welcome ${volunteer.name}! Redirecting…`);
        router.push("/admin/dashboard");
      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
      }
    }

    handle();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <div className="text-4xl mb-4">🐾</div>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
}
