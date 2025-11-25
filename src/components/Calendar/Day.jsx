import React from 'react';
import { getDate, isSameDay, isToday, format } from 'date-fns';
import clsx from 'clsx';
import { getHolidayName } from '../../utils/holidays';
import { USER_COLORS, USER_TEXT_COLORS } from '../../constants';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

function ScheduleBar({ schedule, isStart, isEnd, isStartOfWeek }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Determine if we should show content (text)
    // Show if it's the start of the schedule OR start of the week (to ensure visibility on new rows)
    const showContent = isStart || isStartOfWeek;

    const displayText = schedule.details || schedule.user_name;
    const hasDetails = !!schedule.details;

    return (
        <div
            className={clsx(
                "h-6 flex items-center text-[11px] font-bold shadow-sm relative group transition-all",
                USER_COLORS[schedule.user_id] || 'bg-gray-400',
                USER_TEXT_COLORS[schedule.user_id] || 'text-white',
                isStart ? "rounded-l-md pl-1" : "rounded-l-none border-l-0",
                isEnd ? "rounded-r-md pr-1" : "rounded-r-none border-r-0",
                isExpanded ? "z-50" : "z-0"
            )}
            title={displayText}
        >
            {showContent && (
                <div className="flex items-center gap-1 w-full overflow-hidden">
                    <span className="truncate flex-1">{displayText}</span>
                    {hasDetails && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-0.5 hover:bg-black/10 rounded-full shrink-0"
                        >
                            {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                    )}
                </div>
            )}

            {isExpanded && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 text-xs font-normal whitespace-normal text-left">
                    <div className="font-bold mb-1">{schedule.user_name}</div>
                    <div>{schedule.details}</div>
                </div>
            )}
        </div>
    );
}

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

    // Sort schedules: Earlier start date first, then longer duration, then created_at
    const sortedSchedules = [...schedules].sort((a, b) => {
        const startA = new Date(a.start_date);
        const startB = new Date(b.start_date);
        if (startA.getTime() !== startB.getTime()) return startA - startB;

        const endA = new Date(a.end_date);
        const endB = new Date(b.end_date);
        if (endA.getTime() !== endB.getTime()) return endB - endA; // Longer first

        return a.id - b.id; // Stable sort
    });

    return (
        <div
            onClick={handleClick}
            className={clsx(
                "min-h-[120px] relative flex flex-col transition-all duration-200 group", // Removed borders
                isDateToday && "bg-black/5 dark:bg-white/10",
                !isDateToday && "hover:bg-gray-50 dark:hover:bg-gray-800",
                isSelectionActive && "cursor-pointer active:scale-95",
                isSelectedStart && "bg-black text-white dark:bg-white dark:text-black ring-4 ring-black/20 dark:ring-white/20 z-10 shadow-xl"
            )}
        >
            <div className="flex justify-between items-start p-1">
                <span className={clsx(
                    "text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full",
                    isDateToday && !isSelectedStart ? "bg-black text-white dark:bg-white dark:text-black" :
                        isSelectedStart ? "text-current" :
                            isRedDay ? "text-red-500" :
                                isSaturday ? "text-blue-500" : "text-gray-900 dark:text-gray-100"
                )}>
                    {dayNumber}
                </span>
            </div>

            <div className="flex flex-col gap-0.5 flex-1">
                {/* Holiday Text (First in list, no box, plain text) */}
                {holidayName && (
                    <div className="text-[11px] font-bold px-1 truncate mb-0.5 text-left text-gray-900 dark:text-white">
                        {holidayName}
                    </div>
                )}

                {sortedSchedules.map((schedule) => {
                    const sStart = new Date(schedule.start_date);
                    const sEnd = new Date(schedule.end_date);
                    sStart.setHours(0, 0, 0, 0);
                    sEnd.setHours(0, 0, 0, 0);

                    const isStart = isSameDay(date, sStart);
                    const isEnd = isSameDay(date, sEnd);

                    return (
                        <ScheduleBar
                            key={schedule.id}
                            schedule={schedule}
                            isStart={isStart}
                            isEnd={isEnd}
                            isStartOfWeek={isSunday}
                        />
                    );
                })}
            </div>
        </div>
    );
}
