import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Day } from './Day';

export function Month({ date, schedules, onDateClick, selectionMode }) {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding days for the start of the month
    const startDay = getDay(monthStart);
    const paddingDays = Array(startDay).fill(null);

    // Filter schedules for this month to optimize passing down
    // In a real app with many schedules, we might optimize this further
    const getSchedulesForDay = (dayDate) => {
        if (!dayDate) return [];
        return schedules.filter(s => {
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            // Reset hours to compare dates only
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            const current = new Date(dayDate);
            current.setHours(0, 0, 0, 0);

            return current >= start && current <= end;
        });
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-black px-6 mb-4 text-gray-900 dark:text-white sticky top-0 bg-gray-50/95 dark:bg-gray-950/95 py-4 z-10 backdrop-blur-sm">
                {format(date, 'M월', { locale: ko })} <span className="text-sm font-normal text-gray-400">{format(date, 'yyyy')}</span>
            </h2>

            <div className="grid grid-cols-7 px-2">
                {/* Day Headers */}
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={`
            py-2 text-center text-xs font-bold
            ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}
          `}>
                        {day}
                    </div>
                ))}

                {/* Padding Days */}
                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className="min-h-[120px]" />
                ))}

                {/* Calendar Days */}
                {daysInMonth.map((day) => (
                    <Day
                        key={day.toISOString()}
                        date={day}
                        schedules={getSchedulesForDay(day)}
                        onDateClick={onDateClick}
                        selectionMode={selectionMode}
                    />
                ))}
            </div>
        </div>
    );
}
