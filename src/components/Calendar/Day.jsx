import React from 'react';
import { getDate, isSameDay, isToday, format } from 'date-fns';
import clsx from 'clsx';
import { getHolidayName } from '../../utils/holidays';
import { USER_COLORS, USER_TEXT_COLORS } from '../../constants';

export function Day({ date, schedules = [], onDateClick, selectionMode }) {
    const dayNumber = getDate(date);
    const holidayName = getHolidayName(date);
    const isDateToday = isToday(date);
    const isSunday = date.getDay() === 0;
    const isSaturday = date.getDay() === 6;

    const isRedDay = isSunday || !!holidayName;

    // Selection Logic
    const isSelectionActive = selectionMode?.isActive;
    const isSelectedStart = isSelectionActive && selectionMode.startDate && isSameDay(date, selectionMode.startDate);

    const handleClick = () => {
        if (onDateClick) {
            onDateClick(date);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={clsx(
                "min-h-[120px] p-1 relative flex flex-col transition-all duration-200 rounded-2xl m-0.5",
                isDateToday && "bg-black/5 dark:bg-white/10",
                !isDateToday && "hover:bg-gray-50 dark:hover:bg-gray-800",
                isSelectionActive && "cursor-pointer active:scale-95",
                isSelectedStart && "bg-black text-white dark:bg-white dark:text-black ring-4 ring-black/20 dark:ring-white/20 z-10 shadow-xl"
            )}
        >
            <div className="flex justify-between items-start mb-1 px-1">
                <span className={clsx(
                    "text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full",
                    isDateToday && !isSelectedStart ? "bg-black text-white dark:bg-white dark:text-black" :
                        isSelectedStart ? "text-current" :
                            isRedDay ? "text-red-500" :
                                isSaturday ? "text-blue-500" : "text-gray-900 dark:text-gray-100"
                )}>
                    {dayNumber}
                </span>
                {holidayName && (
                    <span className="text-[10px] text-red-500 font-bold truncate max-w-[40px]">
                        {holidayName}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-1 overflow-hidden flex-1">
                {schedules.map((schedule) => (
                    <div
                        key={schedule.id}
                        className={clsx(
                            "h-5 rounded-md w-full flex items-center justify-center text-[10px] font-bold shadow-sm",
                            USER_COLORS[schedule.user_id] || 'bg-gray-400',
                            USER_TEXT_COLORS[schedule.user_id] || 'text-white'
                        )}
                        title={schedule.user_name}
                    >
                        {schedule.user_name}
                    </div>
                ))}
            </div>
        </div>
    );
}
