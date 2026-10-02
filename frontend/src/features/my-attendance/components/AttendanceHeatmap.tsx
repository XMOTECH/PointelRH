import React, { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AttendanceHeatmapProps {
  attendances: any[];
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ attendances }) => {
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    status: 'present' | 'late' | 'absent' | 'weekend' | 'future';
    attendance?: any;
  } | null>(null);

  // Generate 52 weeks (364 days) up to today
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 364);

    // Map attendances by YYYY-MM-DD
    const attendanceMap = new Map<string, any>();
    attendances.forEach((att) => {
      const rawDate = att.work_date || att.checked_in_at || att.clock_in || att.clockIn || att.createdAt;
      if (rawDate) {
        const key = format(new Date(rawDate), 'yyyy-MM-dd');
        attendanceMap.set(key, att);
      }
    });

    const allDays = eachDayOfInterval({ start: startDate, end: today });
    const weeksArr: Array<Array<{ date: Date; status: 'present' | 'late' | 'absent' | 'weekend' | 'future'; attendance?: any }>> = [];
    let currentWeek: Array<{ date: Date; status: 'present' | 'late' | 'absent' | 'weekend' | 'future'; attendance?: any }> = [];

    // Pad first week
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: subDays(startDate, firstDayOfWeek - i), status: 'future' });
    }

    allDays.forEach((date) => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const att = attendanceMap.get(dateKey);
      const isWeekEndDay = isWeekend(date);
      const isPast = date < today && !isSameDay(date, today);

      let status: 'present' | 'late' | 'absent' | 'weekend' | 'future' = 'future';

      if (att) {
        const isLate = (att.late_minutes && att.late_minutes > 0) || (att.lateMinutes && att.lateMinutes > 0) || att.is_late || att.isLate;
        status = isLate ? 'late' : 'present';
      } else if (isWeekEndDay) {
        status = 'weekend';
      } else if (isPast) {
        status = 'absent';
      }

      currentWeek.push({ date, status, attendance: att });

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    // Month Labels Calculation
    const months: Array<{ name: string; weekIndex: number }> = [];
    let lastMonth = -1;

    weeksArr.forEach((w, weekIndex) => {
      const validDay = w.find((d) => d.date);
      if (validDay) {
        const m = validDay.date.getMonth();
        if (m !== lastMonth) {
          months.push({
            name: format(validDay.date, 'MMM', { locale: fr }),
            weekIndex,
          });
          lastMonth = m;
        }
      }
    });

    return { weeks: weeksArr, monthLabels: months };
  }, [attendances]);

  const getCellColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500';
      case 'late':
        return 'bg-amber-500';
      case 'absent':
        return 'bg-rose-500/80';
      case 'weekend':
        return 'bg-surface-container-high/40';
      default:
        return 'bg-surface-container-high/20';
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl p-5 shadow-none space-y-3">
      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-1 relative">
        <div className="min-w-[720px]">
          {/* Month Labels */}
          <div className="flex text-[10px] font-semibold text-on-surface-variant mb-1 pl-8">
            {monthLabels.map((m, idx) => (
              <div
                key={idx}
                style={{
                  width: `${(100 / weeks.length) * 4}%`,
                }}
                className="capitalize"
              >
                {m.name}
              </div>
            ))}
          </div>

          {/* Grid Rows (Days of Week + 52 Weeks) */}
          <div className="flex gap-1">
            {/* Days Label Column */}
            <div className="flex flex-col justify-between text-[10px] font-semibold text-on-surface-variant/70 pr-2 py-0.5 select-none">
              <span>Lun</span>
              <span>Mer</span>
              <span>Ven</span>
            </div>

            {/* Weeks Matrix */}
            <div className="flex-1 flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className={`w-3 h-3 rounded-[3px] transition-opacity hover:opacity-80 cursor-pointer ${getCellColor(day.status)}`}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip detail bar when hovered - NO EMOJIS */}
      <div className="h-5 text-xs flex items-center justify-between text-on-surface-variant px-1 border-t border-on-surface/10 pt-2">
        {hoveredDay ? (
          <div className="flex items-center gap-2 font-medium">
            <span className="font-semibold text-on-surface capitalize">
              {format(hoveredDay.date, 'EEEE d MMMM yyyy', { locale: fr })} :
            </span>
            {hoveredDay.status === 'present' && (
              <span className="text-emerald-600 font-bold">Présent à l'heure</span>
            )}
            {hoveredDay.status === 'late' && (
              <span className="text-amber-600 font-bold">En retard</span>
            )}
            {hoveredDay.status === 'absent' && (
              <span className="text-rose-600 font-bold">Aucun pointage (Absence)</span>
            )}
            {hoveredDay.status === 'weekend' && (
              <span className="text-on-surface-variant font-medium">Repos (Week-end)</span>
            )}
            {hoveredDay.status === 'future' && (
              <span className="text-on-surface-variant/60 font-medium">À venir</span>
            )}
          </div>
        ) : (
          <span />
        )}

        <div className="text-[11px] font-mono text-on-surface-variant/70">
          52 semaines
        </div>
      </div>
    </div>
  );
};
