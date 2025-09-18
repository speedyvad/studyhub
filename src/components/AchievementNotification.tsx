import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Trophy, X } from 'lucide-react';

export default function AchievementNotification() {
  const { achievements } = useStore();
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  useEffect(() => {
    // Simular desbloqueio de conquista
    const recentlyUnlocked = achievements.find(
      achievement => 
        achievement.unlocked && 
        achievement.unlockedAt && 
        new Date(achievement.unlockedAt).getTime() > Date.now() - 5000 // Últimos 5 segundos
    );

    if (recentlyUnlocked) {
      setCurrentAchievement(recentlyUnlocked);
      setShowNotification(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  }, [achievements]);

  if (!showNotification || !currentAchievement) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-xl shadow-lg border border-gamification-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gamification-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{currentAchievement.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Trophy className="w-4 h-4 text-gamification" />
              <span className="text-sm font-medium text-gamification">Conquista Desbloqueada!</span>
            </div>
            <h4 className="font-semibold text-text-primary text-sm mb-1">
              {currentAchievement.title}
            </h4>
            <p className="text-xs text-text-secondary mb-2">
              {currentAchievement.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gamification">
                +{currentAchievement.points} pontos
              </span>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
