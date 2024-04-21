const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let token = '';
let authors = [];
let blogs = [];

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.split(' ')[1];
    if (bearerToken == null || bearerToken !== token) return res.sendStatus(403);
    next();
}

app.post('/login', (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    if (username === 'admin' && password === '123456') {
        token = 'axvascxcawrcasrqwfas';
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/author', authenticateToken, (req, res) => {
    const { name, id, description } = req.body;
    if (typeof id !== 'number' || name.length > 50 || description.length > 100) {
        return res.status(400).json({ message: 'Invalid data' });
    }
    const existingAuthor = authors.find(a => a.id === id);
    if (existingAuthor) {
        return res.status(400).json({ message: 'Author already exists' });
    }
    authors.push({ name, id, description });
    res.json({ message: 'Author created' });
});

app.get('/author', authenticateToken, (req, res) => {
    res.json(authors);
});

app.put('/author/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const author = authors.find(a => a.id === Number(id));
    if (!author) {
        return res.status(404).json({ message: 'Author not found' });
    }
    author.name = name;
    author.description = description;
    res.json({ message: 'Author updated' });
});

app.post('/blog', authenticateToken, (req, res) => {
    const { title, authorId, content } = req.body;
    const author = authors.find(a => a.id === authorId);
    if (!author) {
        return res.status(400).json({ message: 'Author not found' });
    }
    blogs.push({ title, authorId, content });
    res.json({ message: 'Blog created' });
});

app.get('/blog', authenticateToken, (req, res) => {
    const blogsWithAuthors = blogs.map(blog => {
        const author = authors.find(a => a.id === blog.authorId);
        return { ...blog, author };
    });
    res.json(blogsWithAuthors);
});

app.post('/clear', authenticateToken, (req, res) => {
    authors = [];
    blogs = [];
    res.json({ message: 'Data cleared' });
});

app.listen(3000, () => console.log('Server started on port 3000'));