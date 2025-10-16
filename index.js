// Import Express
const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// --- Sample Data ---
let books = [
  { id: 1, title: "1984", author: "George Orwell", available: true },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", available: false },
  { id: 3, title: "The Great Gatsby", author: "F. Scott Fitzgerald", available: true }
];

let users = [
  { id: 1, name: "Allitha", membership: "premium", borrowHistory: [] },
  { id: 2, name: "John Doe", membership: "basic", borrowHistory: [] }
];

// --- ROUTES ---

// ✅ PART A: ROUTING BASICS

// 1️⃣ View all books
app.get('/api/books', (req, res) => {
  res.json(books);
});

// 2️⃣ Manage user subscriptions
// View all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add new user
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    membership: req.body.membership || "basic",
    borrowHistory: []
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user subscription
app.put('/api/users/:userId', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.membership = req.body.membership || user.membership;
  res.json(user);
});

// Delete user
app.delete('/api/users/:userId', (req, res) => {
  users = users.filter(u => u.id != req.params.userId);
  res.json({ message: "User deleted successfully" });
});

// 3️⃣ Borrow and return books
// Borrow
app.post('/api/borrow', (req, res) => {
  const { userId, bookId } = req.body;
  const user = users.find(u => u.id == userId);
  const book = books.find(b => b.id == bookId);

  if (!user || !book) return res.status(404).json({ message: "User or Book not found" });
  if (!book.available) return res.status(400).json({ message: "Book already borrowed" });

  book.available = false;
  user.borrowHistory.push({ bookId, borrowDate: new Date(), returned: false });

  res.json({ message: `${user.name} borrowed "${book.title}"` });
});

// Return
app.post('/api/return', (req, res) => {
  const { userId, bookId } = req.body;
  const user = users.find(u => u.id == userId);
  const book = books.find(b => b.id == bookId);

  if (!user || !book) return res.status(404).json({ message: "User or Book not found" });

  const record = user.borrowHistory.find(r => r.bookId == bookId && !r.returned);
  if (!record) return res.status(400).json({ message: "No active borrow record found" });

  book.available = true;
  record.returned = true;
  record.returnDate = new Date();

  res.json({ message: `${user.name} returned "${book.title}"` });
});

// ✅ PART B: PATH PARAMETERS

// Fetch details about a specific book
app.get('/api/books/:bookId', (req, res) => {
  const book = books.find(b => b.id == req.params.bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

// Retrieve a specific user's borrowing history
app.get('/api/users/:userId/borrow-history', (req, res) => {
  const user = users.find(u => u.id == req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    userId: user.id,
    name: user.name,
    borrowHistory: user.borrowHistory
  });
});

// --- Start Server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Library API running on http://localhost:${PORT}`);
});
