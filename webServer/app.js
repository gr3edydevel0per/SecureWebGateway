const express = require('express');
const path = require('path'); // Import the path module
const { blob } = require('stream/consumers');

const app = express();
const PORT = 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Join current directory and 'views'
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/blocked', (req, res) => {
    const blockedURL = req.query.url; // Retrieve the URL parameter
    res.render('blocked', { blockedURL }); // Pass the URL to the template
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
