const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const axios = require('axios');
const ping = require('ping'); 
const { exec } = require('child_process'); 
const app = express();
const port = 3050;




app.use(cors());




// Function to check the status of a service
// for checking whether services like database ,webserver , antivirus is running or not
function checkServiceStatus(serviceName) {
    return new Promise((resolve, reject) => {
        exec(`systemctl is-active ${serviceName}`, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(`${serviceName} service not found or error occurred.`);
            } else {
                resolve(stdout.trim() === 'active' ? 'Running' : 'Stopped');
            }
        });
    });
}

// Endpoint to get system stats
app.get('/api/system-stats', async (req, res) => {
    try {
        const cpu = await si.currentLoad();
        const memory = await si.mem();
        const disk = await si.fsSize(); 
        const network = await si.networkStats();
        const uptime = await si.time();
        const temperature = await si.cpuTemperature();
        const networkInterfaces = await si.networkInterfaces();
        const power = await si.battery();
        const activeConnections = await si.networkStats();
        const pingResponse = await ping.promise.probe('8.8.8.8');
        const publicIpResponse = await axios.get('https://api.ipify.org?format=json');
        const publicIp = publicIpResponse.data.ip;
        const localIp = networkInterfaces[0]?.ip4 || 'N/A';
        if (!disk || disk.length === 0 || !network || network.length === 0) {
            return res.status(500).json({ error: 'Invalid disk or network data' });
        }
        const mysqlStatus = await checkServiceStatus('mariadb');
        
        res.json({
            cpuUsage: cpu.currentLoad.toFixed(2), 
            memoryUsage: ((memory.used / memory.total) * 100).toFixed(2), 
            diskUsage: ((disk[0].used / disk[0].size) * 100).toFixed(2), 
            networkActivity: (network[0].rx_bytes / 1024 / 1024).toFixed(2), 
            uptime: (uptime.uptime / 3600).toFixed(2), 
            cpuTemp: temperature.main.toFixed(2),
            networkSpeed: {
                downloadSpeed: (network[0].rx_bytes / 1024 / 1024).toFixed(2), 
                uploadSpeed: (network[0].tx_bytes / 1024 / 1024).toFixed(2) 
            },
            ipAddressInfo: {
                publicIp: publicIp,
                localIp: localIp,  
                networkInterfaces: networkInterfaces
            },
            powerConsumption: {
                powerUsage: power.isCharging ? `${power.percent}%` : 'N/A', 
            },
            activeConnections: activeConnections, 
            pingResponseTime: pingResponse.time, 
            serviceStatus: {
                mysql: mysqlStatus
            }
        });
    } catch (error) {
        console.error('Error fetching system data:', error);
        res.status(500).json({ error: 'Error fetching system data' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
