import React from 'react';
import { Users, CalendarPlus, Trash2, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

export function Header({ onOpenWhoIsHere, onOpenAddSchedule, onOpenDeleteSchedule, isDarkMode, toggleTheme }) {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-full shadow-2xl px-2 py-2 flex items-center gap-1 max-w-full overflow-x-auto no-scrollbar">

        <button
          onClick={toggleTheme}
          className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

        <button
          onClick={onOpenWhoIsHere}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          <Users size={18} />
          <span>누구?</span>
        </button>

        <button
          onClick={onOpenAddSchedule}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg whitespace-nowrap"
        >
          <CalendarPlus size={18} />
          <span>등록</span>
        </button>

        <button
          onClick={onOpenDeleteSchedule}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
        >
          <Trash2 size={18} />
          <span>삭제</span>
        </button>
      </header>
    </div>
  );
}
