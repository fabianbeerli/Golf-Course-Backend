// Imports
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // See https://www.mongodb.com/docs/drivers/node/current/quick-start/
const cors = require('cors')
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./config');

// Set up App
const app = express();
app.use(cors()); // Allow all cross-origing requests. More information: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.static('public')); // Host all static files in the folder /public
app.use(bodyParser.json()); // Support json encoded bodies
const port = process.env.PORT || '3001'; // Use the PORT variable if set (e.g., when deploying to Heroku)
app.set('port', port);

const server = http.createServer(app);


// Create the client and connect to the database
let database;
const client = new MongoClient(config.mongodb_connection_string);
client.connect((error, db) => {
    if (error || !db) {
        console.log("Could not connect to MongoDB:")
        console.log(error.message);
    }
    else {
        database = db.db('golf');
        console.log("Successfully connected to MongoDB.");
    }
})

//##################################################################################################
// ENDPOINTS 
//##################################################################################################

//--------------------------------------------------------------------------------------------------
// Welcome message
//--------------------------------------------------------------------------------------------------
app.get('/api', async (req, res) => {
    res.send("Welcome to the Golf Course Database API");
})

//--------------------------------------------------------------------------------------------------
// Get all golf courses
//--------------------------------------------------------------------------------------------------
app.get('/api/courses', async (req, res) => {
    try {
        const collection = database.collection('golf_course');

        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};

        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get a golf course by their id
//--------------------------------------------------------------------------------------------------
app.get('/api/course/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const collection = database.collection('golf_course');
        const query = { golf_course_id: parseInt(id) }; // filter by id
        const result = await collection.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No golf course with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Create a new golf course
//--------------------------------------------------------------------------------------------------
app.post('/api/courses', async (req, res) => {

    try {
        const collection = database.collection('golf_courses');

        var course = {
            golf_course_id: req.body.golf_course_id,
            location: req.body.location,
            size: req.body.size
        };
        const result = await collection.insertOne(course);

        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Update an existing golf course
//--------------------------------------------------------------------------------------------------
app.put('/api/courses/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;
    let course = req.body;
    delete course._id; // delete the _id from the object, because the _id cannot be updated

    try {
        const collection = database.collection('golf_course');
        const query = { golf_course_id: parseInt(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: course });

        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No golf course with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Golf course with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Delete an existing golf course
//--------------------------------------------------------------------------------------------------
app.delete('/api/courses/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const collection = database.collection('golf_course');
        const query = { golf_course_id: parseInt(id) }; // filter by id
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            let responseBody = {
                status: "No golf course with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            let responseBody = {
                status: "Golf course with id " + id + " has been successfully deleted."
            }
            res.send(responseBody);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get all players
//--------------------------------------------------------------------------------------------------
app.get('/api/players', async (req, res) => {
    try {
        const collection = database.collection('player');

        // You can specify a query/filter here
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};

        // Get all objects that match the query
        const result = await collection.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get a golf course by their id
//--------------------------------------------------------------------------------------------------
app.get('/api/player/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const collection = database.collection('player');
        const query = { id: parseInt(id) }; // filter by id
        const result = await collection.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No player with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get player for specific golf course
//--------------------------------------------------------------------------------------------------
app.get('/api/playersforcourse/:id', async (req, res) => {

    // read the path parameter :id
    let id = parseInt(req.params.id);

    try {
        const collection = database.collection('player');
        const query = {
            'golf_courses.golf_course_id': id
          };
        const result = await collection.find(query).toArray();


        if (!result) {
            let responseBody = {
                status: "No players for golf course with id: " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Create a new golf course
//--------------------------------------------------------------------------------------------------
app.post('/api/players', async (req, res) => {

    try {
        const collection = database.collection('player');

        var course = {
            id: req.body.id,
            name: req.body.name,
            handicap: req.body.handicap,
            golf_courses: req.body.golf_courses
        };
        const result = await collection.insertOne(course);

        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Update an existing golf course
//--------------------------------------------------------------------------------------------------
app.put('/api/players/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;
    let player = req.body;
    delete player._id; // delete the _id from the object, because the _id cannot be updated

    try {
        const collection = database.collection('player');
        const query = { id: parseInt(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: player });

        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No player with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Player with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Delete an existing golf course
//--------------------------------------------------------------------------------------------------
app.delete('/api/players/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const collection = database.collection('player');
        const query = { id: parseInt(id) }; // filter by id
        const result = await collection.deleteOne(query);

        if (result.deletedCount === 0) {
            let responseBody = {
                status: "No player with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            let responseBody = {
                status: "Player with id " + id + " has been successfully deleted."
            }
            res.send(responseBody);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Get player for specific golf course
//--------------------------------------------------------------------------------------------------
app.get('/api/holes/:id', async (req, res) => {

    // read the path parameter :id
    let id = parseInt(req.params.id);

    try {
        const collection = database.collection('holes');
        const query = {
            'golf_course_fk': id
          };
        const result = await collection.find(query).toArray();


        if (!result) {
            let responseBody = {
                status: "No holes for golf course with id: " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Start the server
//--------------------------------------------------------------------------------------------------
server.listen(port, () => console.log("app listening on port " + port));
