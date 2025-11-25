import { eachDayOfInterval, format } from 'date-fns';

/**
 * Calculates the visual layout (lane assignment) for a list of schedules.
 * Algorithm:
 * 1. Sort schedules by ID (Registration Order).
 * 2. For each schedule, find the lowest lane index that is free for its entire duration.
 * 3. Assign that lane.
 * 
 * @param {Array} schedules - List of schedule objects
 * @returns {Object} Map of scheduleId -> laneIndex
 */
export function calculateScheduleLayout(schedules) {
    // 1. Sort by ID (assuming ID increments with registration)
    // If you have a created_at field, use that, but ID is usually a good proxy for 'registration order'
    const sortedSchedules = [...schedules].sort((a, b) => a.id - b.id);

    const scheduleLanes = {}; // scheduleId -> laneIndex
    const laneOccupancy = []; // Array of Sets, where index is laneIndex, Set contains occupied date strings

    sortedSchedules.forEach(schedule => {
        const start = new Date(schedule.start_date);
        const end = new Date(schedule.end_date);

        // Generate all dates covered by this schedule
        const dates = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));

        // Find the first lane that is free for ALL these dates
        let laneIndex = 0;
        while (true) {
            // Ensure the lane set exists
            if (!laneOccupancy[laneIndex]) {
                laneOccupancy[laneIndex] = new Set();
            }

            // Check if this lane has any overlap with the schedule's dates
            const isLaneFree = dates.every(dateStr => !laneOccupancy[laneIndex].has(dateStr));

            if (isLaneFree) {
                // Found a free lane!
                break;
            }
            laneIndex++;
        }

        // Assign lane
        scheduleLanes[schedule.id] = laneIndex;

        // Mark dates as occupied in this lane
        dates.forEach(dateStr => laneOccupancy[laneIndex].add(dateStr));
    });

    return scheduleLanes;
}
