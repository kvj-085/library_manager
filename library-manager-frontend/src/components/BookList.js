import React, { useState } from 'react';
import api from '../api';
import UpdateBookForm from './UpdateBookForm';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [showBooks, setShowBooks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [authorMap, setAuthorMap] = useState({});

  const fetchBooks = async () => {
  setLoading(true);
  try {
    const [bookRes, authorRes] = await Promise.all([
      api.get('/books/'),
      api.get('/authors/')
    ]);

    const authors = authorRes.data;
    const map = {};
    authors.forEach(a => { map[a.id] = a.name });
    setAuthorMap(map);
    setBooks(bookRes.data);
    setShowBooks(true);
  } catch (err) {
    alert('Failed to load books or authors');
  } finally {
    setLoading(false);
  }
};


  const handleToggle = () => {
    if (showBooks) {
      setShowBooks(false);
    } else {
      fetchBooks();
    }
  };

  const deleteBook = (bookId) => {
    if (window.confirm('Delete this book?')) {
      api.delete(`/books/${bookId}`)
        .then(() => fetchBooks())
        .catch(() => alert('Delete failed'));
    }
  };

  return (
    <div>
      <button onClick={handleToggle}>
        {showBooks ? 'Hide Books' : 'Show All Books'}
      </button>

      {loading && <p>Loading books...</p>}

      {showBooks && !loading && (
        <ul>
          {books.map(book => (
            <li key={book.id}>
            {editingId === book.id ? (
                <UpdateBookForm
                book={book}
                onUpdated={() => {
                    fetchBooks();
                    setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
                />
            ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                    <strong>{book.title}</strong> ({book.year}) —{' '}
                    {book.is_read ? '📖 Read' : '📕 Not Read'} —{' '}
                    Author: {authorMap[book.author_id] || `ID ${book.author_id}`}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => deleteBook(book.id)}>🗑️</button>
                    <button onClick={() => setEditingId(book.id)}>✏️</button>
                </div>
                </div>
            )}
            </li>
        ))}        
        </ul>
      )}
    </div>
  );
};

export default BookList;
