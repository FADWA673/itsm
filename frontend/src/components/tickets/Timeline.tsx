import React from "react";
import type { TicketHistoryEntry } from "../../types/ticket.types";

interface TimelineProps {
  history: TicketHistoryEntry[];
  loading?: boolean;
}

const getActionIcon = (action: string) => {
  const iconStyle = { width: "20px", height: "20px" };
  
  switch (action) {
    case "CREATED":
      return <span style={{ color: "#3B82F6", fontSize: "20px" }}>▶</span>;
    case "ASSIGNED":
    case "CLAIMED":
      return <span style={{ color: "#10B981", fontSize: "20px" }}>👤</span>;
    case "STATUS_CHANGED":
      return <span style={{ color: "#EAB308", fontSize: "20px" }}>🔄</span>;
    case "PUT_ON_HOLD":
      return <span style={{ color: "#F97316", fontSize: "20px" }}>⏸</span>;
    case "RESUMED":
      return <span style={{ color: "#3B82F6", fontSize: "20px" }}>▶</span>;
    case "RESOLVED":
      return <span style={{ color: "#059669", fontSize: "20px" }}>✅</span>;
    case "CLOSED":
      return <span style={{ color: "#6B7280", fontSize: "20px" }}>❌</span>;
    case "REOPENED":
      return <span style={{ color: "#A855F7", fontSize: "20px" }}>🔁</span>;
    case "CANCELLED":
      return <span style={{ color: "#DC2626", fontSize: "20px" }}>🚫</span>;
    case "COMMENT_ADDED":
      return <span style={{ color: "#6366F1", fontSize: "20px" }}>💬</span>;
    default:
      return <span style={{ color: "#9CA3AF", fontSize: "20px" }}>🕐</span>;
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case "CREATED":
      return "Ticket créé";
    case "ASSIGNED":
      return "Assigné";
    case "CLAIMED":
      return "Pris en charge";
    case "STATUS_CHANGED":
      return "Statut modifié";
    case "PUT_ON_HOLD":
      return "Mis en attente";
    case "RESUMED":
      return "Repris";
    case "RESOLVED":
      return "Résolu";
    case "CLOSED":
      return "Fermé";
    case "REOPENED":
      return "Réouvert";
    case "CANCELLED":
      return "Annulé";
    case "COMMENT_ADDED":
      return "Commentaire ajouté";
    default:
      return action;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const Timeline: React.FC<TimelineProps> = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span style={{ fontSize: "48px", display: "block", marginBottom: "8px", color: "#D1D5DB" }}>🕐</span>
        <p>Aucun historique disponible</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((entry, index) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {index !== history.length - 1 && (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                {/* Icon */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                    {getActionIcon(entry.action)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {entry.user.firstName} {entry.user.lastName}
                      </span>
                      <span className="ml-2 text-gray-500 text-xs uppercase">
                        {entry.user.role}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">{getActionLabel(entry.action)}</span>
                    {entry.comment && (
                      <p className="mt-1 text-gray-600">{entry.comment}</p>
                    )}
                    {entry.oldValue && entry.newValue && (
                      <p className="mt-1 text-xs text-gray-500">
                        <span className="line-through">{entry.oldValue}</span>
                        {" → "}
                        <span className="font-medium">{entry.newValue}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
