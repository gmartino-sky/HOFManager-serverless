// File: utils/date.js

const { DateTime } = require('luxon');

/**
 * Converts an ISO date string to "Week XX - Month" format.
 * Example: "Week 17 - April"
 */
function getWeekStringFromDate(dateInput) {
    const date = DateTime.fromISO(dateInput, { zone: 'America/Sao_Paulo' }); // adjust timezone if needed
    const weekNumber = date.weekNumber;
    const monthName = date.toFormat('LLLL');
    return `Week ${weekNumber} - ${monthName}`;
}

/**
 * Returns today's week in "Week XX - Month" format.
 */
function getCurrentWeekString() {
    const now = DateTime.now().setZone('America/Sao_Paulo');
    const weekNumber = now.weekNumber;
    const monthName = now.toFormat('LLLL');
    return `Week ${weekNumber} - ${monthName}`;
}

/**
 * Returns the current server time as a Luxon DateTime object.
 */
function getCurrentServerTime() {
    return DateTime.now().setZone('America/Sao_Paulo');
}

/**
 * Parses and validates a date string.
 */
function parseDate(dateInput) {
    const date = DateTime.fromISO(dateInput, { zone: 'America/Sao_Paulo' });
    return date.isValid ? date : null;
}

function formatWeek(date) {
    const dt = DateTime.fromJSDate(date, { zone: 'America/Sao_Paulo' });
    const weekNumber = dt.weekNumber;
    const monthName = dt.toFormat('LLLL');
    return `Week ${weekNumber} - ${monthName}`;
}

module.exports = {
    getWeekStringFromDate,
    getCurrentWeekString,
    getCurrentServerTime,
    parseDate,
    formatWeek // <-- agregar acá la exportación
};