// File: cron/dailyReminder.js

const cron = require('node-cron');
const { DateTime } = require('luxon');
const { getDonationsByWeek } = require('../db/donations');
const { getMainCharacters } = require('../db/users');

// Main function that runs daily
async function runDailyReminder(client) {
    const now = DateTime.now().setZone('America/Sao_Paulo');
    const saturday = now.endOf('week').minus({ days: 1 });
    const currentWeek = `Week ending ${saturday.toFormat('dd')} - ${saturday.toFormat('LLLL')}`;

    const donations = await getDonationsByWeek(currentWeek);
    const donatedCharacters = new Set(donations.map(d => d.character));

    const mainCharacters = await getMainCharacters();

    for (const main of mainCharacters) {
        if (!donatedCharacters.has(main.name)) {
            try {
                const user = await client.users.fetch(main.discord_user_id);

                const reminderMessage =
                    `📣 Hey ${main.discord_username}! Don't forget to donate your gold for your main character **${main.name}** this week! Thank you 🙌
📣 ¡Hola ${main.discord_username}! No olvides donar tu oro esta semana por tu personaje principal **${main.name}**. ¡Gracias 🙌!
📣 嘿 ${main.discord_username}！别忘了为你的主角色 **${main.name}** 本周捐赠黄金！谢谢 🙌`;

                await user.send(reminderMessage);
            } catch (err) {
                console.error(`❌ Failed to send reminder to ${main.discord_username}`, err);
            }
        }
    }

    console.log(`✅ Daily reminder sent for week ${currentWeek}`);
}

// Schedule it to run every day at 00:00 (GMT-2)
function startDailyReminder(client) {
    cron.schedule('0 0 * * *', () => {
        runDailyReminder(client);
    }, {
        timezone: 'Etc/GMT+2'
    });
}

module.exports = { startDailyReminder };
