"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedTime = void 0;
const getFormattedTime = () => {
    const now = new Date();
    // Format the date and time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    // Combine into desired format
    return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}.${milliseconds}`;
};
exports.getFormattedTime = getFormattedTime;
