const express = require('express');
const { executeQuery } = require("./modules/db");
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS 
app.use(cors());





// Returns composition of blocked and allowed requests
app.get('/reqdata',async (req, res) => {
    const query = `
        SELECT DATE(timestamp) as date, 
        SUM(action_taken = 'block') AS blocked_requests, 
        SUM(action_taken = 'allow') AS allowed_requests 
        FROM proxy_logs 
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp);
    `;
     const result= await executeQuery(query);
     res.json(result)
});


// Return no of requests corresponsing to the hours of the day
app.get('/requests-by-hour', async (req, res) => {
    const query = `
        SELECT HOUR(timestamp) AS hour_of_day, COUNT(*) AS request_count
        FROM proxy_logs
        GROUP BY hour_of_day
        ORDER BY hour_of_day;
    `;
    const result= await executeQuery(query);
        const processedResults = result.map(row => ({
            hour_of_day: row.hour_of_day,
            request_count: Number(row.request_count) 
        }));
        res.json(processedResults);
});


// Distinct IPS or users connected to the SWG
app.get('/connected-users', async (req, res) => {
    try {
        const query = `
           SELECT COUNT(ip_address) AS distinct_ip_count
            FROM (
            SELECT DISTINCT SUBSTRING_INDEX(ip_address, ':', 1) AS ip_address
             FROM proxy_logs
            ) AS distinct_ips; 
        `;
        const result = await executeQuery(query);   
        res.json({ total_users: Number(result[0].distinct_ip_count) });
    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Server Error');
    }
});

// Returns the total number of requests for the current date
app.get('/requests-today', async (req, res) => {
    try {
        const query = `
                    SELECT COUNT(*) AS total_requests
                    FROM proxy_logs
                    WHERE DATE(timestamp) = CURDATE();
        `;

        const result = await executeQuery(query);
        res.json({ total_requests: Number(result[0].total_requests) });
    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Server Error');
    }
});



// Returns the composition of methods
app.get('/methods-composition', async (req, res) => {
    try {
        const query = `
        SELECT request_type, COUNT(*) AS method_count
        FROM proxy_logs
        WHERE DATE(timestamp) = CURDATE()
        GROUP BY request_type;
        `;

        const result = await executeQuery(query);
        const methodComposition = result.map(row => ({
            request_type: row.request_type,
            method_count: Number(row.method_count)
        }));

        res.json({ method_composition: methodComposition });

    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Server Error');
    }
});



app.get('/requests-composition', async (req, res) => {
    try {
        const query = `
            SELECT action_taken, COUNT(*) AS count
            FROM proxy_logs
            GROUP BY action_taken;
        `;
        const result = await executeQuery(query);

        let allowed = 0;
        let blocked = 0;

        result.forEach(row => {
            if (row.action_taken.toLowerCase() === 'allow' ||row.action_taken.toLowerCase() === 'allowed' ) {
                allowed = Number(row.count);
            } else if (row.action_taken.toLowerCase() === 'block') {
                blocked = Number(row.count);
            }
        });

        res.json({ allowed, blocked });
    } catch (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Server Error');
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
