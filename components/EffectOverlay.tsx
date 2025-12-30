
import React, { useEffect, useState } from 'react';
import { EffectType } from '../types';

interface EffectOverlayProps {
  type: EffectType;
}

export const EffectOverlay: React.FC<EffectOverlayProps> = ({ type }) => {
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string; duration: string; color?: string }[]>([]);

  useEffect(() => {
    if (type === EffectType.NONE) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      color: type === EffectType.CONFETTI ? `hsl(${Math.random() * 360}, 70%, 60%)` : undefined
    }));
    setParticles(newParticles);
  }, [type]);

  if (type === EffectType.NONE) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {type === EffectType.SNOW && particles.map(p => (
        <div
          key={p.id}
          className="snow-particle"
          style={{
            left: p.left,
            width: '8px',
            height: '8px',
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
      {type === EffectType.CONFETTI && particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
      {type === EffectType.FIREWORKS && particles.map(p => (
        <div
          key={p.id}
          className="firework-particle"
          style={{
            left: p.left,
            top: `${Math.random() * 80}%`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};
