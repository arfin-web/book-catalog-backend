const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

require('dotenv').config();

const app = express();
app.use(express.json());

const mongoURI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const collectionName = 'books';

let db;

MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        db = client.db(dbName);
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Define the root route
app.get('/', (req, res) => {
    res.send('Welcome to the Book Catalog API');
});

// Create a new book
app.post('/books', async (req, res) => {
    try {
        const book = req.body;
        const result = await db.collection(collectionName).insertOne(book);
        res.json(result.ops[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all books
app.get('/books', async (req, res) => {
    try {
        const books = await db.collection(collectionName).find().toArray();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific book
app.get('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await db.collection(collectionName).findOne({ _id: ObjectId(bookId) });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a book
app.put('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const updatedBook = req.body;
        const result = await db.collection(collectionName).updateOne({ _id: ObjectId(bookId) }, { $set: updatedBook });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a book
app.delete('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const result = await db.collection(collectionName).deleteOne({ _id: ObjectId(bookId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});