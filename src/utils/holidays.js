import { getYear, getMonth, getDate } from 'date-fns';

// Simple fixed holidays for demonstration. 
// In a real app, this might come from an API or a more comprehensive library.
const HOLIDAYS = {
    '1-1': '신정',
    '3-1': '삼일절',
    '5-5': '어린이날',
    '6-6': '현충일',
    '8-15': '광복절',
    '10-3': '개천절',
    '10-9': '한글날',
    '12-25': '크리스마스',
};

export function getHolidayName(date) {
    const month = getMonth(date) + 1;
    const day = getDate(date);
    const key = `${month}-${day}`;
    return HOLIDAYS[key] || null;
}

export function isHoliday(date) {
    return !!getHolidayName(date);
}
