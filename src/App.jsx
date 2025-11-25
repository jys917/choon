import React, { useState, useEffect } from 'react'; // Force redeploy
import clsx from 'clsx';
import { Header } from './components/Header';
import { CalendarView } from './components/Calendar/CalendarView';
import { UserSelectionModal } from './components/Modals/UserSelectionModal';
import { WhoIsHereModal } from './components/Modals/WhoIsHereModal';

import { supabase } from './lib/supabase';

import { DetailInputModal } from './components/Modals/DetailInputModal';

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

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);

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

  const handleDelete = async (user, start, end, isSilent = false) => {
    const { data: userSchedules } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id);

    const updates = [];
    const deletions = [];
    const insertions = [];

    const normalize = (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const rangeStart = normalize(start);
    const rangeEnd = normalize(end);

    userSchedules?.forEach(s => {
      const sStart = normalize(s.start_date);
      const sEnd = normalize(s.end_date);

      if (sStart <= rangeEnd && sEnd >= rangeStart) {
        if (rangeStart <= sStart && rangeEnd >= sEnd) {
          deletions.push(s.id);
        }
        else if (rangeStart <= sStart && rangeEnd < sEnd) {
          const newStart = new Date(rangeEnd);
          newStart.setDate(newStart.getDate() + 1);
          updates.push({ id: s.id, start_date: newStart.toISOString() });
        }
        else if (rangeStart > sStart && rangeEnd >= sEnd) {
          const newEnd = new Date(rangeStart);
          newEnd.setDate(newEnd.getDate() - 1);
          updates.push({ id: s.id, end_date: newEnd.toISOString() });
        }
        else if (rangeStart > sStart && rangeEnd < sEnd) {
          const firstPartEnd = new Date(rangeStart);
          firstPartEnd.setDate(firstPartEnd.getDate() - 1);
          updates.push({ id: s.id, end_date: firstPartEnd.toISOString() });

          const secondPartStart = new Date(rangeEnd);
          secondPartStart.setDate(secondPartStart.getDate() + 1);

          insertions.push({
            user_id: s.user_id,
            user_name: s.user_name,
            start_date: secondPartStart.toISOString(),
            end_date: s.end_date,
            details: s.details
          });
        }
      }
    });

    if (deletions.length > 0) await supabase.from('schedules').delete().in('id', deletions);
    for (const update of updates) await supabase.from('schedules').update(update).eq('id', update.id);
    if (insertions.length > 0) await supabase.from('schedules').insert(insertions);

    if (!isSilent) {
      if (deletions.length === 0 && updates.length === 0 && insertions.length === 0) {
        alert('삭제할 일정이 없습니다.');
      } else {
        alert('삭제(및 수정)되었습니다.');
      }
    }

    // Refresh
    const { data } = await supabase.from('schedules').select('*');
    if (data) setSchedules(data);
  };

  const handleDetailConfirm = async (details) => {
    if (!pendingSelection) return;

    const { user, start, end } = pendingSelection;

    try {
      // Step 1: Clear the space (Delete/Resize existing schedules to make room)
      // We will "Delete" the range first to clear it. We need to silently delete.
      await handleDelete(user, start, end, true);
      // Step 2: Insert new schedule
      const payload = {
        user_id: user.id,
        user_name: user.name,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        details: details
      };

      const { error } = await supabase.from('schedules').insert([payload]);
      if (error) throw error;

      // Refresh
      const { data } = await supabase.from('schedules').select('*');
      if (data) setSchedules(data);

      setMode('VIEW');

    } catch (e) {
      console.error(e);
      alert('오류가 발생했습니다: ' + e.message);
    } finally {
      setIsDetailModalOpen(false);
      setPendingSelection(null);
    }
  };

  const handleDateClick = async (date) => {
    if (!selection.isActive) return;

    if (!selection.startDate) {
      setSelection(prev => ({ ...prev, startDate: date }));
    } else {
      try {
        // Complete selection
        const start = selection.startDate < date ? selection.startDate : date;
        const end = selection.startDate < date ? date : selection.startDate;

        const updates = [];
        const deletions = [];
        const insertions = [];

        // Helper to normalize date (00:00:00)
        const normalize = (d) => {
          const date = new Date(d);
          date.setHours(0, 0, 0, 0);
          return date;
        };

        const rangeStart = normalize(start);
        const rangeEnd = normalize(end);

        userSchedules?.forEach(s => {
          const sStart = normalize(s.start_date);
          const sEnd = normalize(s.end_date);

          // Check if this schedule overlaps with the delete range
          if (sStart <= rangeEnd && sEnd >= rangeStart) {
            // Case 1: Delete range covers the entire schedule
            if (rangeStart <= sStart && rangeEnd >= sEnd) {
              deletions.push(s.id);
            }
            // Case 2: Delete range covers the start of the schedule
            // (Delete: 10-15, Schedule: 10-18) -> New Start: 16
            else if (rangeStart <= sStart && rangeEnd < sEnd) {
              const newStart = new Date(rangeEnd);
              newStart.setDate(newStart.getDate() + 1);
              updates.push({ id: s.id, start_date: newStart.toISOString() });
            }
            // Case 3: Delete range covers the end of the schedule
            // (Delete: 15-18, Schedule: 10-18) -> New End: 14
            else if (rangeStart > sStart && rangeEnd >= sEnd) {
              const newEnd = new Date(rangeStart);
              newEnd.setDate(newEnd.getDate() - 1);
              updates.push({ id: s.id, end_date: newEnd.toISOString() });
            }
            // Case 4: Delete range is in the middle (Split)
            // (Delete: 12-14, Schedule: 10-18) -> 10-11 AND 15-18
            else if (rangeStart > sStart && rangeEnd < sEnd) {
              // 1. Update original to end at rangeStart - 1
              const firstPartEnd = new Date(rangeStart);
              firstPartEnd.setDate(firstPartEnd.getDate() - 1);
              updates.push({ id: s.id, end_date: firstPartEnd.toISOString() });

              // 2. Insert new schedule starting at rangeEnd + 1
              const secondPartStart = new Date(rangeEnd);
              secondPartStart.setDate(secondPartStart.getDate() + 1);

              insertions.push({
                user_id: s.user_id,
                user_name: s.user_name,
                start_date: secondPartStart.toISOString(),
                end_date: s.end_date // Keep original end
              });
            }
          }
        });

        // Execute operations
        if (deletions.length > 0) {
          await supabase.from('schedules').delete().in('id', deletions);
        }

        for (const update of updates) {
          await supabase.from('schedules').update(update).eq('id', update.id);
        }

        if (insertions.length > 0) {
          await supabase.from('schedules').insert(insertions);
        }

        if (deletions.length === 0 && updates.length === 0 && insertions.length === 0) {
          alert('삭제할 일정이 없습니다.');
        } else {
          alert('삭제(및 수정)되었습니다.');
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

      <DetailInputModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setPendingSelection(null);
          setMode('VIEW');
        }}
        onConfirm={handleDetailConfirm}
        user={pendingSelection?.user}
        startDate={pendingSelection?.start}
        endDate={pendingSelection?.end}
      />
    </div>
  );
}

export default App;
