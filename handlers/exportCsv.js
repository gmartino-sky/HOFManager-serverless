// File: handlers/exportCsv.js
// Note: This handler is deprecated in serverless version
// CSV export is now handled directly in weekReport command with S3 signed URLs

async function handleExportCsv(interaction) {
    // No longer used - CSV is now automatically included as a download link in the report
    return {
        type: 4,
        data: {
            content: '❌ CSV export is now handled automatically in the /report-week command.',
            flags: 64
        }
    };
}

module.exports = { handleExportCsv };
