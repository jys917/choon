import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Header } from './components/Header';
import { CalendarView } from './components/Calendar/CalendarView';
import { UserSelectionModal } from './components/Modals/UserSelectionModal';
import { WhoIsHereModal } from './components/Modals/WhoIsHereModal';

import { supabase } from './lib/supabase';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [schedules, setSchedules] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isWhoIsHereOpen, setIsWhoIsHereOpen] = useState(false);

  // Selection Mode: 'ADD' or 'DELETE'
  const [mode, setMode] = useState('VIEW'); // VIEW, ADD, DELETE

  const [selection, setSelection] = useState({
    isActive: false,
    user: null,
    startDate: null,
  });

  // Fetch data periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*');

        if (error) throw error;
        if (data) setSchedules(data);
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
      }
    };

    fetchData();
    // Real-time subscription could be added here, but polling is fine for now
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleOpenWhoIsHere = () => {
    setIsWhoIsHereOpen(true);
  };

  const handleOpenAddSchedule = () => {
    setMode('ADD');
    setIsUserModalOpen(true);
  };

  const handleOpenDeleteSchedule = () => {
    setMode('DELETE');
    setIsUserModalOpen(true);
  };

  const handleSelectUser = (user) => {
    setSelection({
      isActive: true,
      user: user,
      startDate: null,
    });
    setIsUserModalOpen(false);
  };

  const handleDateClick = async (date) => {
    if (!selection.isActive) return;

    if (!selection.startDate) {
      setSelection(prev => ({ ...prev, startDate: date }));
    } else {
      // Complete selection
      const start = selection.startDate < date ? selection.startDate : date;
      const end = selection.startDate < date ? date : selection.startDate;

      const payload = {
        user_id: selection.user.id,
        user_name: selection.user.name,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };

      try {
        if (mode === 'ADD') {
          // 1. Check for overlap (Client-side check for simplicity)
          const { data: existing } = await supabase
            .from('schedules')
            .select('*')
            .eq('user_id', selection.user.id);

          const hasOverlap = existing?.some(s => {
            const sStart = new Date(s.start_date);
            const sEnd = new Date(s.end_date);
            sStart.setHours(0, 0, 0, 0);
            sEnd.setHours(0, 0, 0, 0);

            // Overlap logic
            return sStart <= end && sEnd >= start;
          });

          if (hasOverlap) {
            alert('이미 해당 기간에 휴가가 등록되어 있습니다.');
            setSelection({ isActive: false, user: null, startDate: null });
            setMode('VIEW');
            return;
          }

          // 2. Insert
          const { error } = await supabase
            .from('schedules')
            .insert([payload]);

          if (error) throw error;

        } else if (mode === 'DELETE') {
          // Delete logic: Delete schedules for this user that overlap with the range
          // Supabase doesn't support complex "delete if overlap" in one go easily without RPC.
          // So we fetch, filter, then delete by ID.

          const { data: userSchedules } = await supabase
            .from('schedules')
            .select('*')
            .eq('user_id', selection.user.id);

          const toDelete = userSchedules?.filter(s => {
            const sStart = new Date(s.start_date);
            const sEnd = new Date(s.end_date);
            sStart.setHours(0, 0, 0, 0);
            sEnd.setHours(0, 0, 0, 0);
            return sStart <= end && sEnd >= start;
          }).map(s => s.id);

          if (toDelete?.length > 0) {
            const { error } = await supabase
              .from('schedules')
              .delete()
              .in('id', toDelete);

            if (error) throw error;
            alert('삭제되었습니다.');
          } else {
            alert('삭제할 일정이 없습니다.');
          }
        }
      } catch (e) {
        console.error(e);
        alert('오류가 발생했습니다: ' + e.message);
      }

      // Reset
      setSelection({ isActive: false, user: null, startDate: null });
      setMode('VIEW');

      // Refresh
      const { data } = await supabase.from('schedules').select('*');
      if (data) setSchedules(data);
    }
  };

  const cancelSelection = () => {
    setSelection({ isActive: false, user: null, startDate: null });
    setMode('VIEW');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <Header
        onOpenWhoIsHere={handleOpenWhoIsHere}
        onOpenAddSchedule={handleOpenAddSchedule}
        onOpenDeleteSchedule={handleOpenDeleteSchedule}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {selection.isActive && (
        <div className={clsx(
          "px-4 py-3 text-center text-sm font-medium animate-in slide-in-from-top sticky top-20 z-40 shadow-lg mx-4 rounded-xl flex justify-between items-center backdrop-blur-md",
          mode === 'ADD' ? "bg-blue-600/90 text-white" : "bg-red-600/90 text-white"
        )}>
          <span>
            {selection.startDate
              ? "마지막 날짜를 선택해주세요"
              : `${selection.user.name}님의 ${mode === 'ADD' ? '휴가 시작일' : '삭제할 기간의 시작일'}을 선택해주세요`}
          </span>
          <button
            onClick={cancelSelection}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            취소
          </button>
        </div>
      )}

      <main className="flex-1 overflow-hidden flex flex-col">
        <CalendarView
          schedules={schedules}
          onDateClick={handleDateClick}
          selectionMode={selection}
        />
      </main>

      <UserSelectionModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSelectUser={handleSelectUser}
      />

      <WhoIsHereModal
        isOpen={isWhoIsHereOpen}
        onClose={() => setIsWhoIsHereOpen(false)}
        schedules={schedules}
      />
    </div>
  );
}

export default App;
