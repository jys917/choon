import React from 'react';
import { X } from 'lucide-react';
import { USERS } from '../../constants';
import clsx from 'clsx';

export function UserSelectionModal({ isOpen, onClose, onSelectUser }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">누구의 휴가인가요?</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 grid grid-cols-3 gap-3">
                    {USERS.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => onSelectUser(user)}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <div className={clsx(
                                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform",
                                user.color
                            )}>
                                {user.name[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                {user.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
