// Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');

// Express App Setup
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// SQL Server Configuration
const config = {
    server: 'FRIDAY',
    database: 'community',
    options: {
        instanceName: 'MSSQLSERVER01',
        trustServerCertificate: true
    },
    authentication: {
        type: 'default',
        options: {
            userName: 'ahim',
            password: 'Ahim2446stha!@'
        }
    }
};

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/loginPage');
});

// Route for Handling Signup
app.post('/loginPage', (req, res) => {
    const {
        username,
        email,
        password,
        role
    } = req.body;
    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }
        const request = new sql.Request();
        request.input('username', sql.NVarChar(20), username);
        request.input('email', sql.NVarChar(30), email);
        request.input('password', sql.NVarChar(30), password);
        request.input('role', sql.NVarChar(50), role);
        const query = `INSERT INTO [User](Name, Email, Password, Role) VALUES (@username, @email, @password, @role)`;
        request.query(query, (err, result) => {
            if (err) {
                console.log('Query error:', err);
                res.status(500).send('Signup failed!');
                return;
            }
            res.status(200).send('Signup Successful!');
        });
    });
});

// Route for Handling Login
app.post('/login', (req, res) => {
    const {
        email,
        password,
        role
    } = req.body;
    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }
        const request = new sql.Request();
        request.input('email', sql.NVarChar(30), email);
        request.input('password', sql.NVarChar(30), password);
        request.input('role', sql.NVarChar(50), role);
        const query = `SELECT * FROM [User] WHERE Email = @email AND Password = @password AND Role = @role`;
        request.query(query, (err, result) => {
            if (err) {
                console.log('Query error:', err);
                res.status(500).send('Login failed!');
                return;
            }
            if (result.recordset.length > 0) {
                res.status(200).json({
                    message: 'Login Successful!',
                    role: result.recordset[0].Role
                });
            } else {
                res.status(401).send('Invalid credentials!');
            }
        });
    });
});

// Route for the Signup Page
app.get('/loginPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'loginPage.html'));
});

// Route for Student Home Page
app.get('/stHome.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'stHome.html'));
});

// Route for Admin Home Page
app.get('/adHome.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'adHome.html'));
});

// Route to serve adManageUsers.html
app.get('/adManageUsers.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'adManageUsers.html'));
});

// Route to serve adManageEvents.html
app.get('/adManageEvents.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'adManageEvents.html'));
});

// Route to get all users (for admin)
app.get('/admin/users', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }
        const request = new sql.Request();
        const query = `SELECT UserID, Name, Email, Role FROM [User]`;
        request.query(query, (err, result) => {
            if (err) {
                console.log('Query error:', err);
                res.status(500).send('Failed to retrieve users!');
                return;
            }
            res.status(200).json(result.recordset);
        });
    });
});

// Route to update a user (for admin)
app.put('/admin/users/:id', (req, res) => {
    const userId = req.params.id;
    const {
        Name,
        Email,
        Role
    } = req.body;

    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }

        const request = new sql.Request();
        request.input('UserID', sql.Int, userId);
        request.input('Name', sql.NVarChar(20), Name);
        request.input('Email', sql.NVarChar(30), Email);
        request.input('Role', sql.NVarChar(50), Role);

        const query = `
            UPDATE [User]
            SET Name = @Name,
                Email = @Email,
                Role = @Role
            WHERE UserID = @UserID;
        `;

        request.query(query, (err, result) => {
            if (err) {
                console.log('Update query error:', err);
                res.status(500).send('Failed to update user!');
                return;
            }

            if (result.rowsAffected[0] === 0) {
                res.status(404).send('User not found!');
                return;
            }

            res.status(200).send('User updated successfully!');
        });
    });
});

// Route to delete a user (for admin)
app.delete('/admin/users/:id', (req, res) => {
    const userId = req.params.id;

    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }

        const request = new sql.Request();
        request.input('UserID', sql.Int, userId);

        const query = `DELETE FROM [User] WHERE UserID = @UserID`;

        request.query(query, (err, result) => {
            if (err) {
                console.log('Delete query error:', err);
                res.status(500).send('Failed to delete user!');
                return;
            }

            if (result.rowsAffected[0] === 0) {
                res.status(404).send('User not found!');
                return;
            }

            res.status(200).send('User deleted successfully!');
        });
    });
});

// Route to get all events (for admin)
app.get('/admin/events', (req, res) => {
    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }
        const request = new sql.Request();
        const query = `SELECT EventID, ClubID, Title, Description, EventDate, Location, CreatedBy, CreatedDate FROM dbo.Events`;
        request.query(query, (err, result) => {
            if (err) {
                console.log('Query error:', err);
                res.status(500).send('Failed to retrieve events!');
                return;
            }
            res.status(200).json(result.recordset);
        });
    });
});

// Route to create a new event (for admin)
app.post('/admin/events', (req, res) => {
    const {
        ClubID,
        Title,
        Description,
        EventDate,
        Location,
        CreatedBy
    } = req.body;

    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }

        const request = new sql.Request();
        request.input('ClubID', sql.Int, ClubID);
        request.input('Title', sql.NVarChar, Title);
        request.input('Description', sql.NVarChar, Description);
        request.input('EventDate', sql.DateTime, EventDate);
        request.input('Location', sql.NVarChar, Location);
        request.input('CreatedBy', sql.Int, CreatedBy);

        const query = `
            INSERT INTO dbo.Events (ClubID, Title, Description, EventDate, Location, CreatedBy)
            VALUES (@ClubID, @Title, @Description, @EventDate, @Location, @CreatedBy)
        `;

        request.query(query, (err, result) => {
            if (err) {
                console.log('Create event query error:', err);
                res.status(500).send('Failed to create event!');
                return;
            }
            res.status(201).send('Event created successfully!');
        });
    });
});

// Route to update an event (for admin)
app.put('/admin/events/:id', (req, res) => {
    const eventId = req.params.id;
    const {
        ClubID,
        Title,
        Description,
        EventDate,
        Location,
        CreatedBy
    } = req.body;

    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }

        const request = new sql.Request();
        request.input('EventID', sql.Int, eventId);
        request.input('ClubID', sql.Int, ClubID);
        request.input('Title', sql.NVarChar, Title);
        request.input('Description', sql.NVarChar, Description);
        request.input('EventDate', sql.DateTime, EventDate);
        request.input('Location', sql.NVarChar, Location);
        request.input('CreatedBy', sql.Int, CreatedBy);

        const query = `
            UPDATE dbo.Events
            SET ClubID = @ClubID,
                Title = @Title,
                Description = @Description,
                EventDate = @EventDate,
                Location = @Location,
                CreatedBy = @CreatedBy
            WHERE EventID = @EventID;
        `;

        request.query(query, (err, result) => {
            if (err) {
                console.log('Update event query error:', err);
                res.status(500).send('Failed to update event!');
                return;
            }

            if (result.rowsAffected[0] === 0) {
                res.status(404).send('Event not found!');
                return;
            }

            res.status(200).send('Event updated successfully!');
        });
    });
});

// Route to delete an event (for admin)
app.delete('/admin/events/:id', (req, res) => {
    const eventId = req.params.id;

    sql.connect(config, err => {
        if (err) {
            console.log('Database connection error:', err);
            res.status(500).send('Database connection failed!');
            return;
        }

        const request = new sql.Request();
        request.input('EventID', sql.Int, eventId);

        const query = `DELETE FROM dbo.Events WHERE EventID = @EventID`;

        request.query(query, (err, result) => {
            if (err) {
                console.log('Delete event query error:', err);
                res.status(500).send('Failed to delete event!');
                return;
            }

            if (result.rowsAffected[0] === 0) {
                res.status(404).send('Event not found!');
                return;
            }

            res.status(200).send('Event deleted successfully!');
        });
    });
});

// Route to get upcoming events for students
app.get('/student/events', async (req, res) => {
    try {
        // Connect to the database
        await sql.connect(config);
        console.log('Connected to the database');

        // Create a request object
        const request = new sql.Request();

        // Define the query
        const query = `
            SELECT EventID, Title, Description, EventDate, Location
            FROM dbo.Events
            WHERE EventDate >= GETDATE()
            ORDER BY EventDate ASC;
        `;

        // Execute the query
        const result = await request.query(query);
        console.log('Query executed successfully');

        // Send the result as JSON
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send('Failed to retrieve events!');
    } finally {
        // Close the database connection
        await sql.close();
        console.log('Database connection closed');
    }
});
// get clubs name admin
app.get('/admin/clubs', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT * FROM Clubs');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching clubs');
    }
});



// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
