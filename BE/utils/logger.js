// utils/logger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __filename and __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the log directory path
const logDirectory = path.resolve(__dirname, '../logs');

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Function to log operations
export const logOperation = (operation, ip, data) => {
    const logFilePath = path.join(logDirectory, 'operations.log');
    const logEntry = `${new Date().toISOString()} ${ip} - ${operation}: ${JSON.stringify(data)}\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log entry:', err);
        }
    });
};
