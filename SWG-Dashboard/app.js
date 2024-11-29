const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const { executeQuery } = require("./modules/db");

const app = express();
const PORT = 4020;






app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 




/*************************************************
 * 
 *                  ROUTES
 * 
 ************************************************/

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/logs', (req, res) => {
    res.render("displayLogs");
});

app.get('/rules', (req, res) => {
    res.render("rules");
});


app.get('/server-stats', (req, res) => {
    res.render("serverStats");
});



/*************************************************
 * 
 *                  RULES API
 * 
 ************************************************/



/*  
    Fecth rules from the database :: Table Name -> domain_block 
    consists of regex and type of blocking pattern
    blocking pattern can be fqdn or keywords based 
    fqdn -> fully qualified domain name blocks the entire domain including sub domains
    keywords based -> blocks certain subdomain instead of entire domain
 */

app.get('/get-rules', async (req, res) => {
    try {
        const rules = await executeQuery('SELECT * FROM domain_block');
        res.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ message: 'Failed to fetch rules' });
    }
});



/*  
    Add  rules to  the database :: Tdata -> domain_block 
 */
app.post("/add-rule", async (req, res) => {
    var { domain, block_type, keywords, regex } = req.body;
    const createdBy = 1; 
    const isActive = 1; 
    const validBlockTypes = ['fqdn', 'keyword'];
    if (!validBlockTypes.includes(block_type)) {
        return res.status(400).json({ message: "Invalid block type. Must be 'fqdn' or 'keyword'." });
    }
    if (block_type === 'fqdn') {
        keywords = null;  
    }
    const query = `
        INSERT INTO domain_block (domain, block_type, keywords, regex, created_by, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {

        const result = await executeQuery(query, [domain, block_type, keywords, regex, createdBy, isActive]);
        res.json({ message: "Rule added successfully", domain, block_type, keywords, regex });
    } catch (err) {
        console.error("Error inserting rule:", err);
        return res.status(500).json({ message: "Error adding rule" });
    }
});




/*  
    Deletes rules from the database :: Table Name -> domain_block 

 */
app.delete('/deleterule/:id', async (req, res) => {
    const ruleId = parseInt(req.params.id, 10);
    try {
        await executeQuery('DELETE FROM domain_block WHERE id = ?', [ruleId]);   
        res.json({ message: 'Rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ message: 'Failed to delete rule' });
    }
});


/*
    Toggle function for rules 
    used for enabling or disabling a rule
*/
app.put('/update-status/:id', async (req, res) => {
    const ruleId = req.params.id;
    const { is_active } = req.body;
    if (is_active !== 0 && is_active !== 1) {
        return res.status(400).json({ message: 'Invalid or missing is_active value. Use 0 for deactivated, 1 for activated.' });
    }
    try {
        await executeQuery('UPDATE domain_block SET is_active = ? WHERE id = ?', [is_active, ruleId]);
        res.json({ message: 'Rule status updated successfully' });
    } catch (error) {
        console.error('Error updating rule status:', error);
        res.status(500).json({ message: 'Failed to update rule status' });
    }
});



/***********************************************************************************
 * 
 *                        Fetch Logs from the database
 * 
************************************************************************************/
app.post('/logs', async (req, res) => {
    try {
        const { timestamp, ip_address, user_id, url, action_taken, device_id, request_type, protocol, severity, reason, location, user_agent, content_type } = req.body;

        let sql = 'SELECT * FROM proxy_logs WHERE 1=1';
        const params = [];

        if (timestamp) {
            sql += ' AND timestamp LIKE ?';
            params.push(`%${timestamp}%`);
        }
        if (ip_address) {
            sql += ' AND ip_address LIKE ?';
            params.push(`%${ip_address}%`);
        }
        if (user_id) {
            sql += ' AND user_id LIKE ?';
            params.push(`%${user_id}%`);
        }
        if (url) {
            sql += ' AND url LIKE ?';
            params.push(`%${url}%`);
        }
        if (action_taken) {
            sql += ' AND action_taken = ?';
            params.push(action_taken);
        }
        if (device_id) {
            sql += ' AND device_id = ?';
            params.push(device_id);
        }
        if (request_type) {
            sql += ' AND request_type = ?';
            params.push(request_type);
        }
        if (protocol) {
            sql += ' AND protocol = ?';
            params.push(protocol);
        }
        if (severity) {
            sql += ' AND severity = ?';
            params.push(severity);
        }
        if (reason) {
            sql += ' AND reason LIKE ?';
            params.push(`%${reason}%`);
        }
        if (location) {
            sql += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }
        if (user_agent) {
            sql += ' AND user_agent LIKE ?';
            params.push(`%${user_agent}%`);
        }
        if (content_type) {
            sql += ' AND content_type LIKE ?';
            params.push(`%${content_type}%`);
        }

        const logs = await executeQuery(sql, params);
        res.json(logs);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ error: "Error fetching logs" });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
