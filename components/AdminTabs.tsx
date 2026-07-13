"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function AdminTabs({ activeTab, newContacts }: { activeTab: string; newContacts: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const tabs = [
    { id: "orders",    label: "Orders" },
    { id: "contacts",  label: "Messages", badge: newContacts > 0 ? newContacts : null },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 overflow-x-auto" style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.15s" }}>
      {tabs.map(tab => (
        <Link key={tab.id} href={`/admin?tab=${tab.id}`}
          onClick={(e) => { e.preventDefault(); startTransition(() => router.push(`/admin?tab=${tab.id}`)); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
            activeTab === tab.id ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}>
          {tab.label}
          {tab.badge != null && (
            <span className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold ${
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
            }`}>
              {tab.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
