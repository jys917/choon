import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET /api/schedules
app.get('/api/schedules', (req, res) => {
    const schedules = readData();
    res.json(schedules);
});

// POST /api/schedules
app.post('/api/schedules', (req, res) => {
    const newSchedule = req.body;
    const schedules = readData();

    // Overlap Validation
    const hasOverlap = schedules.some(s => {
        if (s.userId !== newSchedule.userId) return false;

        const startA = new Date(s.startDate);
        const endA = new Date(s.endDate);
        const startB = new Date(newSchedule.startDate);
        const endB = new Date(newSchedule.endDate);

        startA.setHours(0, 0, 0, 0);
        endA.setHours(0, 0, 0, 0);
        startB.setHours(0, 0, 0, 0);
        endB.setHours(0, 0, 0, 0);

        return startA <= endB && endA >= startB;
    });

    if (hasOverlap) {
        return res.status(400).json({ error: '이미 해당 기간에 휴가가 등록되어 있습니다.' });
    }

    schedules.push(newSchedule);
    writeData(schedules);
    res.json(newSchedule);
});

// DELETE /api/schedules
app.delete('/api/schedules', (req, res) => {
    const { userId, startDate, endDate } = req.body;
    let schedules = readData();

    const startTarget = new Date(startDate);
    const endTarget = new Date(endDate);
    startTarget.setHours(0, 0, 0, 0);
    endTarget.setHours(0, 0, 0, 0);

    const initialLength = schedules.length;

    schedules = schedules.filter(s => {
        if (s.userId !== userId) return true;

        const sStart = new Date(s.startDate);
        const sEnd = new Date(s.endDate);
        sStart.setHours(0, 0, 0, 0);
        sEnd.setHours(0, 0, 0, 0);

        const overlaps = sStart <= endTarget && sEnd >= startTarget;
        return !overlaps;
    });

    if (schedules.length === initialLength) {
        return res.status(404).json({ message: '삭제할 일정이 없습니다.' });
    }

    writeData(schedules);
    res.json({ message: '삭제되었습니다.', count: initialLength - schedules.length });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
