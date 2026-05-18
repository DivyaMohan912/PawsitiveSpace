"use client";

export default function MaskedPhone({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const prefix = digits.startsWith("91") ? "+91" : "+";
  return <span className="font-mono text-sm text-gray-500">{prefix} ****{last4}</span>;
}
