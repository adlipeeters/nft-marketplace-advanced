import express from 'express';
import cron from 'node-cron';
import { pickWinners, getAuctions } from './functions';


// npm run dev uses nodemon to run the server
// npm run dev:ts-node-dev uses ts-node-dev to run the server

const app = express();
// const port = process.env.PORT || 3000;
const port = 3001;

// '*/5 * * * * *' -> every 5 seconds
// cron every minute
cron.schedule('* * * * *', async () => {
    await pickWinners();
    console.log('Cron job executed: Picked winners for ended auctions');
});

// Just for testing
// app.get('/pick-winners', async (req, res) => {
//     try {
//         await pickWinners();
//         res.json({ success: 'Picked winners for ended auctions' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to pick winners' });
//     }
// })

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
