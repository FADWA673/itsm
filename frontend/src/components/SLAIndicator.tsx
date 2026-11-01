import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";

interface SLAIndicatorProps {
  slaDeadline: string | null;
  slaBreached: boolean;
  status: string;
  compact?: boolean; // Mode compact pour tableaux
  showDetails?: boolean; // Afficher détails complets (pour page détail)
}

interface SLAInfo {
  icon: string;
  color: string;
  label: string;
  minutesRemaining: number;
  percentageConsumed: number;
  formattedTime: string;
}

function SLAIndicator({
  slaDeadline,
  slaBreached,
  status,
  compact = false,
  showDetails = false,
}: SLAIndicatorProps) {
  const [slaInfo, setSlaInfo] = useState<SLAInfo | null>(null);

  useEffect(() => {
    calculateSLA();
    // Mettre à jour toutes les minutes
    const interval = setInterval(calculateSLA, 60000);
    return () => clearInterval(interval);
  }, [slaDeadline, slaBreached, status]);

  const calculateSLA = () => {
    // Si pas de deadline, pas de SLA
    if (!slaDeadline) {
      setSlaInfo(null);
      return;
    }

    // Si en attente utilisateur, pausé
    if (status === "WAITING_FOR_USER") {
      setSlaInfo({
        icon: "⏸️",
        color: "#6B7280",
        label: "PAUSED",
        minutesRemaining: 0,
        percentageConsumed: 0,
        formattedTime: "Paused",
      });
      return;
    }

    // Si fermé, afficher le résultat final
    if (status === "CLOSED" || status === "RESOLVED") {
      if (slaBreached) {
        setSlaInfo({
          icon: "🔴",
          color: "#DC2626",
          label: "BREACHED",
          minutesRemaining: 0,
          percentageConsumed: 100,
          formattedTime: "Exceeded",
        });
      } else {
        setSlaInfo({
          icon: "🟢",
          color: "#10B981",
          label: "RESPECTED",
          minutesRemaining: 0,
          percentageConsumed: 100,
          formattedTime: "Met SLA",
        });
      }
      return;
    }

    const now = new Date().getTime();
    const deadline = new Date(slaDeadline).getTime();
    const remainingMs = deadline - now;
    const minutesRemaining = Math.floor(remainingMs / 60000);

    // Si dépassé
    if (minutesRemaining < 0) {
      const minutesOver = Math.abs(minutesRemaining);
      setSlaInfo({
        icon: "🔴",
        color: "#DC2626",
        label: "BREACHED",
        minutesRemaining: minutesOver,
        percentageConsumed: 100,
        formattedTime: `-${formatMinutes(minutesOver)}`,
      });
      return;
    }

    // Calculer pourcentage (estimé sur durée totale - simplifié)
    // Note: Le vrai calcul devrait tenir compte de createdAt, mais pour l'affichage on simplifie
    const hoursRemaining = minutesRemaining / 60;
    let percentageConsumed = 0;

    // Estimer basé sur le temps restant
    if (hoursRemaining <= 1) percentageConsumed = 90;
    else if (hoursRemaining <= 2) percentageConsumed = 80;
    else if (hoursRemaining <= 4) percentageConsumed = 70;
    else if (hoursRemaining <= 8) percentageConsumed = 60;
    else if (hoursRemaining <= 24) percentageConsumed = 40;
    else percentageConsumed = 20;

    // Déterminer statut
    let icon = "🟢";
    let color = "#10B981";
    let label = "OK";

    if (percentageConsumed >= 75) {
      icon = "🟠";
      color = "#F59E0B";
      label = "AT RISK";
    }

    setSlaInfo({
      icon,
      color,
      label,
      minutesRemaining,
      percentageConsumed,
      formattedTime: formatMinutes(minutesRemaining),
    });
  };

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  };

  // Pas de SLA défini
  if (!slaInfo) {
    return compact ? (
      <Typography variant="body2" sx={{ color: "#9CA3AF", fontSize: 12 }}>
        -
      </Typography>
    ) : (
      <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
        No SLA
      </Typography>
    );
  }

  // Mode compact (pour tableaux)
  if (compact) {
    return (
      <Tooltip title={`SLA: ${slaInfo.label} - ${slaInfo.formattedTime}`} arrow>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: 14 }}>{slaInfo.icon}</Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: slaInfo.color,
            }}
          >
            {slaInfo.formattedTime}
          </Typography>
        </Box>
      </Tooltip>
    );
  }

  // Mode détaillé (pour page détail)
  if (showDetails) {
    return (
      <Box
        sx={{
          p: 2.5,
          bgcolor: `${slaInfo.color}08`,
          border: `1px solid ${slaInfo.color}40`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 24 }}>{slaInfo.icon}</Typography>
            <Box>
              <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
                SLA Status
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: slaInfo.color }}>
                {slaInfo.label}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
              {slaInfo.label === "BREACHED" ? "Exceeded by" : "Time Remaining"}
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: slaInfo.color }}>
              {slaInfo.formattedTime}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        {status !== "CLOSED" && status !== "RESOLVED" && slaInfo.label !== "PAUSED" && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(slaInfo.percentageConsumed, 100)}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: "#E5E7EB",
                "& .MuiLinearProgress-bar": {
                  bgcolor: slaInfo.color,
                  borderRadius: 1,
                },
              }}
            />
            <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.5, textAlign: "right" }}>
              {slaInfo.percentageConsumed}% elapsed
            </Typography>
          </Box>
        )}

        {/* Info */}
        <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 1.5 }}>
          {slaInfo.label === "PAUSED"
            ? "⏸️ SLA timer is paused while waiting for user response"
            : slaInfo.label === "BREACHED"
            ? "⚠️ This ticket has exceeded its SLA deadline"
            : slaInfo.label === "AT RISK"
            ? "⚠️ This ticket is at risk of breaching SLA"
            : "✅ This ticket is within SLA compliance"}
        </Typography>
      </Box>
    );
  }

  // Mode normal (chip)
  return (
    <Chip
      icon={<Typography sx={{ fontSize: 14, ml: 0.5 }}>{slaInfo.icon}</Typography>}
      label={`${slaInfo.label} - ${slaInfo.formattedTime}`}
      size="small"
      sx={{
        bgcolor: `${slaInfo.color}15`,
        color: slaInfo.color,
        fontWeight: 600,
        fontSize: 12,
        "& .MuiChip-icon": {
          color: slaInfo.color,
        },
      }}
    />
  );
}

export default SLAIndicator;
