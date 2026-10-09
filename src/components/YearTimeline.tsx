import React, { useRef, useEffect } from 'react';
import { TargetYear, SUPPORTED_YEARS } from '../types/earthsim.ts';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar
} from 'lucide-react';

interface YearTimelineProps {
  selectedYear: TargetYear;
  onSelectYear: (year: TargetYear) => void;
  isSimulating?: boolean;
}

export const YearTimeline: React.FC<YearTimelineProps> = ({
  selectedYear,
  onSelectYear,
  isSimulating = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);

  // Automatically scroll selected year into center view
  useEffect(() => {
    if (activeYearRef.current) {
      activeYearRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedYear]);

  const handlePrevYear = () => {
    const currentIndex = SUPPORTED_YEARS.indexOf(selectedYear);
    if (currentIndex > 0) {
      onSelectYear(SUPPORTED_YEARS[currentIndex - 1]);
    }
  };

  const handleNextYear = () => {
    const currentIndex = SUPPORTED_YEARS.indexOf(selectedYear);
    if (currentIndex < SUPPORTED_YEARS.length - 1) {
      onSelectYear(SUPPORTED_YEARS[currentIndex + 1]);
    }
  };

  const getYearLabel = (yr: TargetYear) => {
    if (yr === 2025) return 'Baseline';
    if (yr === 2030) return '5-Year';
    if (yr === 2035) return '10-Year';
    if (yr === 2040) return '15-Year';
    const delta = yr - 2025;
    return `+${delta}y`;
  };

  return (
    <div className="bg-white border border-[#DDE4DA] rounded-xl p-3 sm:p-4 shadow-xs">
      {/* Timeline Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#E7EEE5] border border-[#DDE4DA] flex items-center justify-center text-[#245B43]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#183D30] uppercase tracking-wider">
              Simulation Horizon Timeline
            </span>
            <span className="text-xs text-[#66736A] hidden sm:inline ml-2">
              Select any individual year from 2025 through 2040 to project environmental risks &amp; population
            </span>
          </div>
        </div>

        {/* Selected Horizon Callout */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#66736A]">Active Horizon:</span>
          <span className="text-xs font-mono font-bold text-[#245B43] bg-[#E7EEE5] border border-[#DDE4DA] px-2.5 py-0.5 rounded-md">
            {selectedYear} {selectedYear === 2025 ? '(Current Baseline)' : `(+${selectedYear - 2025} Years Ahead)`}
          </span>
        </div>
      </div>

      {/* Timeline Navigation Controls & Scrollable Track */}
      <div className="relative flex items-center gap-1.5">
        {/* Step Previous Year Arrow */}
        <button
          onClick={handlePrevYear}
          disabled={selectedYear === 2025 || isSimulating}
          className="p-1.5 sm:p-2 bg-white hover:bg-[#F6F7F1] disabled:opacity-30 disabled:hover:bg-white text-[#26332C] rounded-lg border border-[#DDE4DA] transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
          title="Previous Year"
          aria-label="Previous Year"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontally Scrollable Year Reel */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-none py-1.5 px-1 scroll-smooth"
          style={{ scrollSnapType: 'x proximity' }}
        >
          <div className="flex items-center gap-2 min-w-max">
            {SUPPORTED_YEARS.map((yr) => {
              const isSelected = selectedYear === yr;
              const isMilestone = yr === 2025 || yr === 2030 || yr === 2035 || yr === 2040;

              return (
                <button
                  key={yr}
                  ref={isSelected ? activeYearRef : null}
                  onClick={() => onSelectYear(yr)}
                  disabled={isSimulating}
                  className={`group relative flex flex-col items-center justify-center px-3 sm:px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#245B43] text-white border-[#183D30] shadow-sm scale-105 z-10'
                      : isMilestone
                      ? 'bg-[#E7EEE5] text-[#183D30] border-[#DDE4DA] hover:bg-[#DDE4DA] font-semibold'
                      : 'bg-[#F6F7F1] text-[#66736A] border-[#DDE4DA] hover:bg-white hover:text-[#26332C]'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <span
                    className={`font-mono text-xs sm:text-sm font-bold tracking-tight ${
                      isSelected ? 'text-white' : isMilestone ? 'text-[#183D30]' : 'text-[#26332C]'
                    }`}
                  >
                    {yr}
                  </span>

                  <span
                    className={`text-[10px] tracking-tight ${
                      isSelected
                        ? 'text-emerald-100 font-medium'
                        : isMilestone
                        ? 'text-[#245B43] font-medium'
                        : 'text-[#66736A]'
                    }`}
                  >
                    {getYearLabel(yr)}
                  </span>

                  {/* Active Indicator Pin */}
                  {isSelected && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Next Year Arrow */}
        <button
          onClick={handleNextYear}
          disabled={selectedYear === 2040 || isSimulating}
          className="p-1.5 sm:p-2 bg-white hover:bg-[#F6F7F1] disabled:opacity-30 disabled:hover:bg-white text-[#26332C] rounded-lg border border-[#DDE4DA] transition-colors flex-shrink-0 cursor-pointer shadow-2xs"
          title="Next Year"
          aria-label="Next Year"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
