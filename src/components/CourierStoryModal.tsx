import React, { useEffect, useState } from 'react';
import { CourierProfile } from '../types';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
  Thermometer,
  X,
  Zap,
} from 'lucide-react';

interface CourierStoryModalProps {
  courier: CourierProfile | null;
  onClose: () => void;
}

export const CourierStoryModal: React.FC<CourierStoryModalProps> = ({ courier, onClose }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveSlideIndex(0);
    setProgress(0);
    setIsPaused(false);
  }, [courier]);

  useEffect(() => {
    if (!courier || isPaused) return;
    const slides = courier.stories;
    const currentSlide = slides[activeSlideIndex];
    const durationMs = (currentSlide?.durationSec || 5) * 1000;
    const stepMs = 50;
    const increment = (stepMs / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          if (activeSlideIndex < slides.length - 1) {
            setActiveSlideIndex((idx) => idx + 1);
            return 0;
          } else {
            setIsPaused(true);
            return 100;
          }
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [courier, activeSlideIndex, isPaused]);

  if (!courier) return null;

  const slides = courier.stories;
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const isVip = courier.category === 'vip';

  const handlePrev = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
      setProgress(0);
      setIsPaused(false);
    } else {
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
      setProgress(0);
      setIsPaused(false);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Stories de Inspeção de ${courier.name}`}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Story Progress Bars (5 seconds per slide) */}
        <div className="px-4 pt-4 pb-2 bg-gradient-to-b from-slate-950/90 to-transparent">
          <div className="flex items-center gap-1.5 mb-3">
            {slides.map((slide, idx) => {
              const barWidth =
                idx < activeSlideIndex ? 100 : idx === activeSlideIndex ? progress : 0;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setProgress(0);
                    setIsPaused(false);
                  }}
                  className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
                  aria-label={`Ver etapa ${idx + 1}`}
                >
                  <div
                    className={`h-full transition-all duration-75 ${
                      isVip ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </button>
              );
            })}
          </div>

          {/* Courier Header Lockup */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-sm shrink-0 border-2 ${
                  isVip
                    ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                }`}
              >
                {courier.avatarInitials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-white truncate">
                    {courier.name}
                  </h3>
                  <span
                    className={`text-xs font-semibold ${
                      isVip ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    · {isVip ? 'VIP Express' : 'Classe Regular'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {courier.vehicleModel} · {courier.vehiclePlate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label={isPaused ? 'Retomar vídeo de 5s' : 'Pausar vídeo de 5s'}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar Stories"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Visual Canvas for 5-second Story Slide */}
        <div className="px-5 py-4 flex-1 flex flex-col justify-between gap-4">
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800/90 p-5 overflow-hidden">
            {/* Subtle top-right timer indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
              <span className="font-medium text-slate-300">
                Story Sob Demanda ({activeSlideIndex + 1}/{slides.length})
              </span>
              <span className="font-mono tabular-nums text-amber-400">
                {Math.max(0, (5 - (progress / 100) * 5)).toFixed(1)}s / 5.0s
              </span>
            </div>

            {/* Dynamic SVG Scene depending on slide type */}
            {currentSlide.type === 'driver_profile' && (
              <div className="flex flex-col items-center text-center py-2">
                <div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 mb-3 relative ${
                    isVip
                      ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-amber-400'
                      : 'bg-gradient-to-br from-emerald-500/20 to-slate-900 border-emerald-400'
                  }`}
                >
                  <ShieldCheck
                    className={`w-12 h-12 ${isVip ? 'text-amber-400' : 'text-emerald-400'}`}
                  />
                  <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono font-semibold text-white">
                    {courier.rating.toFixed(2)} ★
                  </div>
                </div>
                <h4 className="font-display font-bold text-base text-white mt-1">
                  {currentSlide.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{currentSlide.subtitle}</p>
              </div>
            )}

            {currentSlide.type === 'vehicle_inspection' && (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-full h-28 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-3 relative overflow-hidden">
                  <svg
                    viewBox="0 0 320 110"
                    className="w-64 h-24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Road line */}
                    <line
                      x1="20"
                      y1="92"
                      x2="300"
                      y2="92"
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="8 6"
                    />
                    {/* Wheels */}
                    <circle
                      cx="85"
                      cy="74"
                      r="18"
                      stroke={isVip ? '#f59e0b' : '#10b981'}
                      strokeWidth="4"
                      fill="#090d16"
                    />
                    <circle
                      cx="225"
                      cy="74"
                      r="18"
                      stroke={isVip ? '#f59e0b' : '#10b981'}
                      strokeWidth="4"
                      fill="#090d16"
                    />
                    {/* Electric Scooter Chassis */}
                    <path
                      d="M85 74 L125 42 L185 42 L225 74 M125 42 L150 74 L195 74"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Reinforced Dual Thermal Cargo Box */}
                    <rect
                      x="52"
                      y="16"
                      width="56"
                      height="36"
                      rx="6"
                      fill="#1e293b"
                      stroke={isVip ? '#f59e0b' : '#10b981'}
                      strokeWidth="2.5"
                    />
                    <text
                      x="80"
                      y="38"
                      fill={isVip ? '#fbbf24' : '#34d399'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isVip ? 'VIP BOX' : '45L BOX'}
                    </text>
                  </svg>
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  {currentSlide.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{currentSlide.subtitle}</p>
              </div>
            )}

            {currentSlide.type === 'thermal_sensor' && (
              <div className="flex flex-col items-center text-center py-2">
                <div className="grid grid-cols-2 gap-3 w-full mb-3">
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-left">
                    <div className="flex items-center justify-between text-amber-400 text-xs font-medium">
                      <span>Câmara Quente</span>
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div className="font-mono font-bold text-xl text-white mt-1 tabular-nums">
                      {courier.thermalTempHot.toFixed(1)} °C
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Sensor Ativo Estabilizado
                    </div>
                  </div>
                  <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-3 text-left">
                    <div className="flex items-center justify-between text-sky-400 text-xs font-medium">
                      <span>Câmara Fria</span>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="font-mono font-bold text-xl text-white mt-1 tabular-nums">
                      {courier.thermalTempCold.toFixed(1)} °C
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Isolamento Duplo Ativo
                    </div>
                  </div>
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  {currentSlide.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{currentSlide.subtitle}</p>
              </div>
            )}

            {/* Structured Metrics List */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
              {currentSlide.metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between text-xs gap-2"
                >
                  <span className="text-slate-400">{m.label}</span>
                  <span className="font-mono font-semibold text-slate-100 tabular-nums">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Note Box */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                isVip ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
            <div>
              <span className="font-semibold text-white block mb-0.5">
                {courier.verifiedDate}
              </span>
              {currentSlide.inspectionNote}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeSlideIndex === 0}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Award className={`w-4 h-4 ${isVip ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>Transparência Total 5s</span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isVip
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <span>{activeSlideIndex < slides.length - 1 ? 'Seguinte' : 'Concluir'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
