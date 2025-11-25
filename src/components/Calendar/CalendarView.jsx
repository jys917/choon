import React, { useState, useEffect, useRef } from 'react';
import { addMonths, startOfMonth } from 'date-fns';
import { Month } from './Month';

import { calculateScheduleLayout } from '../../utils/layout';

export function CalendarView({ schedules, onDateClick, selectionMode }) {
    const [months, setMonths] = useState(() => {
        const current = startOfMonth(new Date());
        return [
            current,
            addMonths(current, 1),
            addMonths(current, 2),
        ];
    });

    // Calculate layout whenever schedules change
    // We memoize this to avoid expensive recalculations on every render if schedules haven't changed
    const scheduleLayout = React.useMemo(() => calculateScheduleLayout(schedules), [schedules]);

    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    setMonths((prev) => {
                        const lastMonth = prev[prev.length - 1];
                        return [
                            ...prev,
                            addMonths(lastMonth, 1),
                            addMonths(lastMonth, 2),
                        ];
                    });
                }
            },
            { threshold: 0.1 }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 pb-20 pt-24">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
                {months.map((date) => (
                    <Month
                        key={date.toISOString()}
                        date={date}
                        schedules={schedules}
                        scheduleLayout={scheduleLayout}
                        onDateClick={onDateClick}
                        selectionMode={selectionMode}
                    />
                ))}

                <div ref={loaderRef} className="h-20 flex items-center justify-center text-gray-400">
                    <span className="animate-pulse">Loading more months...</span>
                </div>
            </div>
        </div>
    );
}
