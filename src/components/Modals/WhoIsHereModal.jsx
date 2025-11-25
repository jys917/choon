import React, { useState, useMemo } from 'react';
import { X, Search, Calendar } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx';
import { USER_COLORS } from '../../constants';

export function WhoIsHereModal({ isOpen, onClose, schedules }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const presentUsers = useMemo(() => {
        if (!startDate || !endDate) return [];

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Reset hours
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const users = new Set();

        schedules.forEach(schedule => {
            const sStart = new Date(schedule.startDate);
            const sEnd = new Date(schedule.endDate);
            sStart.setHours(0, 0, 0, 0);
            sEnd.setHours(0, 0, 0, 0);

            // Check overlap
            if (sStart <= end && sEnd >= start) {
                users.add(schedule);
            }
        });

        // Group by user to avoid duplicates if multiple schedules? 
        // Requirement says "show user names". 
        // Let's show unique users.
        const uniqueUsers = new Map();
        schedules.forEach(schedule => {
            const sStart = new Date(schedule.startDate);
            const sEnd = new Date(schedule.endDate);
            sStart.setHours(0, 0, 0, 0);
            sEnd.setHours(0, 0, 0, 0);

            if (sStart <= end && sEnd >= start) {
                if (!uniqueUsers.has(schedule.userId)) {
                    uniqueUsers.set(schedule.userId, {
                        id: schedule.userId,
                        name: schedule.userName,
                        color: USER_COLORS[schedule.userId]
                    });
                }
            }
        });

        return Array.from(uniqueUsers.values());
    }, [startDate, endDate, schedules]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">누가 있나요?</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">시작일</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">종료일</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="min-h-[150px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                        {!startDate || !endDate ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Search size={24} />
                                <span className="text-sm">날짜를 선택해주세요</span>
                            </div>
                        ) : presentUsers.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Calendar size={24} />
                                <span className="text-sm">휴가자가 없습니다</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {presentUsers.map(user => (
                                    <div key={user.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", user.color)}>
                                            {user.name[0]}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
