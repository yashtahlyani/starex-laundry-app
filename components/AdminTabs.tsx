"use client";

export default function AdminTabs({
  activeTab,
  openIssues,
  newContacts,
}: {
  activeTab: string;
  openIssues: number;
  newContacts: number;
}) {
  const tabs = [
    { id: "orders", label: "Orders" },
    { id: "issues", label: "Issues", badge: openIssues > 0 ? openIssues : null },
    { id: "contacts", label: "Messages", badge: newContacts > 0 ? newContacts : null },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={`/admin?tab=${tab.id}`}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-brand text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          {tab.label}
          {tab.badge != null && (
            <span
              className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
              }`}
            >
              {tab.badge}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
