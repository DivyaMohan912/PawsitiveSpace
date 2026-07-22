"use client";

export default function MaskedPhone({ number }: { number: string }) {
  const digits = number.replace(/\D/g, "");
  const tel = digits.startsWith("91") ? `+${digits}` : digits.length === 10 ? `+91${digits}` : `+${digits}`;
  return (
    <a href={`tel:${tel}`} className="font-mono text-sm text-brand-orange font-semibold hover:underline">
      {tel}
    </a>
  );
}
