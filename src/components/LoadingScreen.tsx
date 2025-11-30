import { useEffect, useState } from 'react';
import fridgeHero from '@/assets/fridge-hero.jpg';

const magnetLines = [
  { name: 'Woman', color: 'bg-[hsl(var(--line-woman))]', x: 45, y: 20 },
  { name: 'Classic', color: 'bg-[hsl(var(--line-classic))]', x: 55, y: 35 },
  { name: 'Cottage', color: 'bg-[hsl(var(--line-cottage))]', x: 35, y: 50 },
  { name: 'Formals', color: 'bg-[hsl(var(--line-formals))]', x: 60, y: 65 },
  { name: 'Ming', color: 'bg-[hsl(var(--line-ming))]', x: 40, y: 75 },
];

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="relative w-full max-w-2xl px-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[hsl(var(--line-woman))] via-[hsl(var(--line-classic))] to-[hsl(var(--line-ming))] bg-clip-text text-transparent">
            Magnets
          </h1>
          <p className="text-muted-foreground text-sm">Real-Time Sample Tracking System</p>
        </div>

        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-2xl">
          <img src={fridgeHero} alt="Fridge with magnets" className="w-full h-full object-cover" />
          
          <div className="absolute inset-0">
            {magnetLines.map((magnet, index) => (
              <div
                key={magnet.name}
                className={`absolute ${magnet.color} rounded-full px-4 py-2 text-sm font-medium text-background shadow-lg transform transition-all duration-1000`}
                style={{
                  left: `${magnet.x}%`,
                  top: `${magnet.y}%`,
                  opacity: progress > index * 20 ? 1 : 0,
                  transform: `translate(-50%, -50%) ${progress > index * 20 ? 'scale(1)' : 'scale(0.5)'}`,
                }}
              >
                {magnet.name}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[hsl(var(--line-woman))] via-[hsl(var(--line-classic))] to-[hsl(var(--line-ming))] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Loading your workspace... {progress}%
        </p>
      </div>
    </div>
  );
};