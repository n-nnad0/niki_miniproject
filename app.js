const express = require('express');
const app = express();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

// Create MySQL connection
const connection = mysql.createConnection({
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'c237_styleitapp',
    host: 'mysql-niki.alwaysdata.net',
    user: 'niki',
    password: 'NNKndlbma@2006',
    database: 'niki_miniproject',
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Enable form processing
app.use(express.urlencoded({ extended: false }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original filename; consider adding unique identifier
    }
});
const upload = multer({ storage: storage });

// Routes for rendering pages

// Homepage - Render index.ejs with clothing items
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM `clothing item`';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving items:', error);
            return res.status(500).send('Error retrieving items');
        }
        res.render('index', { items: results });
    });
});

// Route to render Zara catalogue page
app.get('/zaraCatalogue', (req, res) => {
    const sql = 'SELECT * FROM `zaraCatalogue`';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving Zara items:', error);
            return res.status(500).send('Error retrieving Zara items');
        }
        res.render('zaraCatalogue', { items: results });
    });
});

// Route to render Uniqlo catalogue page
app.get('/uniqloCatalogue', (req, res) => {
    const sql = 'SELECT * FROM `uniqloCatalogue`';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving Uniqlo items:', error);
            return res.status(500).send('Error retrieving Uniqlo items');
        }
        res.render('uniqloCatalogue', { items: results });
    });
});

// Route to retrieve all outfits
app.get('/outfits', (req, res) => {
    const sql = 'SELECT * FROM outfit';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving outfits:', error);
            return res.status(500).send('Error retrieving outfits');
        }
        res.render('outfits', { outfits: results });
    });
});

// Route to handle saving an outfit
app.get('/addOutfit', (req, res) => {
    // Logic to render addOutfit.ejs form
    res.render('addOutfit');
});

// POST route to handle adding an outfit
app.post('/addOutfit', upload.single('outfitImage'), (req, res) => {
    const { outfitName, outfitDescription } = req.body;
    let outfitImage;

    if (req.file) {
        outfitImage = req.file.filename;
    } else {
        outfitImage = null;
    }

    const sql = 'INSERT INTO outfit (outfitName, outfitDescription, outfitImage) VALUES (?, ?, ?)';
    connection.query(sql, [outfitName, outfitDescription, outfitImage], (error, results) => {
        if (error) {
            console.error('Error creating outfit:', error);
            return res.status(500).send('Error creating outfit');
        }
        res.render('successful', { message: 'Outfit added successfully!' });
    });
});

// Route to update an outfit by ID - Retrieve
app.get('/editOutfit/:id', (req, res) => {
    const outfitId = req.params.id;
    const sql = 'SELECT * FROM outfit WHERE outfitID = ?';
    connection.query(sql, [outfitId], (error, results) => {
        if (error) {
            console.error('Error retrieving outfit:', error);
            return res.status(500).send('Error retrieving outfit');
        }
        if (results.length > 0) {
            res.render('editOutfit', { outfit: results[0] });
        } else {
            res.status(404).send('Outfit not found');
        }
    });
});

// POST route to handle editing an outfit
app.post('/editOutfit/:id', upload.single('outfitImage'), (req, res) => {
    const outfitId = req.params.id;
    const { outfitName, outfitDescription } = req.body;
    let outfitImage = req.body.currentImage; // Existing image filename from form

    if (req.file) {
        outfitImage = req.file.filename; // Use new uploaded image if provided
    }

    const sql = 'UPDATE outfit SET outfitName = ?, outfitDescription = ?, outfitImage = ? WHERE outfitID = ?';
    connection.query(sql, [outfitName, outfitDescription, outfitImage, outfitId], (error, results) => {
        if (error) {
            console.error('Error updating outfit:', error);
            return res.status(500).send('Error updating outfit');
        }
        res.redirect('/outfits'); // Redirect to outfits page after update
    });
});


// Route to delete an outfit by ID
app.post('/deleteOutfit/:id', (req, res) => {
    const outfitId = req.params.id;
    const sql = 'DELETE FROM Outfit WHERE outfitID = ?';
    connection.query(sql, [outfitId], (error, results) => {
        if (error) {
            console.error('Error deleting outfit:', error);
            return res.status(500).send('Error deleting outfit');
        }
        res.redirect('/outfits');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
