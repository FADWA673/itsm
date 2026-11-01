import { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import {
  AccessTime,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
} from '@mui/icons-material';

interface SLATimerProps {
  deadline: string | null | undefined;
  breached: boolean;
  status: string;
  priority?: string;
}

/**
 * Composant SLATimer
 * 
 * Affiche un compteur en temps réel du temps restant avant la deadline SLA.
 * Change de couleur selon l'urgence :
 * - Vert : > 25% du temps restant
 * - Orange : 10-25% du temps restant
 * - Rouge : < 10% du temps restant ou breached
 * 
 * @param deadline - Date/heure limite SLA (ISO string)
 * @param breached - Si le SLA a été dépassé
 * @param status - Statut actuel du ticket
 * @param priority - Priorité du ticket (pour l'affichage)
 */
export function SLATimer({ deadline, breached, status, priority }: SLATimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Pas de SLA pour les tickets résolus ou fermés
    if (!deadline || ['RESOLVED', 'CLOSED'].includes(status)) {
      return;
    }

    // Fonction pour calculer et mettre à jour le temps restant
    const updateTimer = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('BREACHED');
        setPercentage(100);
        return;
      }

      // Calculer les heures et minutes restantes
      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      // Formater l'affichage
      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m`);
      } else {
        setTimeLeft(`${mins}m`);
      }

      // Calculer le pourcentage de temps consommé (approximatif)
      // On estime le temps total en fonction de la priorité
      const estimatedTotalMinutes = getEstimatedTotalMinutes(priority || 'MEDIUM');
      const consumedPercentage = ((estimatedTotalMinutes - totalMinutes) / estimatedTotalMinutes) * 100;
      setPercentage(Math.max(0, Math.min(100, consumedPercentage)));
    };

    // Première mise à jour immédiate
    updateTimer();

    // Mise à jour toutes les 10 secondes
    const interval = setInterval(updateTimer, 10000);

    return () => clearInterval(interval);
  }, [deadline, status, priority]);

  // Pas d'affichage si pas de deadline ou si ticket terminé
  if (!deadline || ['RESOLVED', 'CLOSED'].includes(status)) {
    return null;
  }

  // Déterminer la couleur selon l'urgence
  const getColor = (): 'success' | 'warning' | 'error' | 'default' => {
    if (breached || isExpired) return 'error';
    if (percentage > 75) return 'error'; // < 25% restant
    if (percentage > 50) return 'warning'; // 25-50% restant
    return 'success'; // > 50% restant
  };

  // Déterminer l'icône
  const getIcon = () => {
    if (breached || isExpired) return <ErrorIcon />;
    if (percentage > 75) return <Warning />;
    if (percentage > 50) return <AccessTime />;
    return <CheckCircle />;
  };

  // Tooltip avec informations détaillées
  const tooltipTitle = (
    <div>
      <div>
        <strong>SLA Deadline:</strong> {new Date(deadline).toLocaleString()}
      </div>
      <div>
        <strong>Status:</strong> {breached || isExpired ? 'BREACHED' : `${Math.round(100 - percentage)}% remaining`}
      </div>
      {priority && (
        <div>
          <strong>Priority:</strong> {priority}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Chip
        label={timeLeft}
        color={getColor()}
        icon={getIcon()}
        size="small"
        sx={{
          fontWeight: 'bold',
          minWidth: '80px',
          animation: (breached || isExpired || percentage > 85) ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 },
          },
        }}
      />
    </Tooltip>
  );
}

/**
 * Estimer le temps total en minutes selon la priorité
 * (utilisé pour calculer le pourcentage)
 */
function getEstimatedTotalMinutes(priority: string): number {
  switch (priority.toUpperCase()) {
    case 'CRITICAL':
      return 240; // 4 heures
    case 'HIGH':
      return 480; // 8 heures
    case 'MEDIUM':
      return 1440; // 24 heures
    case 'LOW':
      return 4320; // 72 heures
    default:
      return 1440; // Par défaut 24h
  }
}
