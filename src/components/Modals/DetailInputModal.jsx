import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export function DetailInputModal({ isOpen, onClose, onConfirm, user, startDate, endDate }) {
    const [details, setDetails] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(details);
        setDetails(''); // Reset after submit
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">세부 일정 입력</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-bold text-gray-900 dark:text-white">{user?.name}</span>님의 일정
                        </div>
                        <div className="text-xs text-gray-400">
                            {startDate?.toLocaleDateString()} ~ {endDate?.toLocaleDateString()}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">사유 / 내용</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="예: 정기 휴가, 외출, 병가 등"
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none h-24"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={18} />
                        등록하기
                    </button>
                </form>
            </div>
        </div>
    );
}
