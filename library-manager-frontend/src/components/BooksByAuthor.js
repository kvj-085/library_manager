import React, { useEffect, useState } from 'react';
import api from '../api';

const BooksByAuthor = () => {
  const [authors, setAuthors] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get('/authors/')
      .then(res => setAuthors(res.data))
      .catch(() => setError('Failed to load authors'));
  }, []);

  const handleFetch = () => {
    if (!selectedId) return;

    const author = authors.find(a => a.id == selectedId);
    setSelectedName(author?.name || '');

    api.get(`/books/by_author/${selectedId}`)
      .then(res => {
        setBooks(res.data);
        setVisible(true);
        setError('');
      })
      .catch(err => {
        setBooks([]);
        setVisible(true);
        setError(err.response?.data?.detail || 'Error fetching books');
      });
  };

  const handleClear = () => {
    setVisible(false);
    setSelectedId('');
    setBooks([]);
    setError('');
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      <h3>Books by Selected Author</h3>

      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
        <option value="">Select Author</option>
        {authors.map(author => (
          <option key={author.id} value={author.id}>{author.name}</option>
        ))}
      </select>

      <button onClick={handleFetch} style={{ marginLeft: '10px' }}>
        Get Books
      </button>
      <button onClick={handleClear} style={{ marginLeft: '10px', background: '#ccc' }}>
        Clear
      </button>

      {error && <p className="error">{error}</p>}

      {visible && (
        <>
          <h4>Books by {selectedName}:</h4>
          {books.length === 0 ? (
            <p>No books found for this author.</p>
          ) : (
            <ul>
              {books.map(book => (
                <li key={book.id}>
                  <strong>{book.title}</strong> ({book.year}) — {book.is_read ? '✅' : '📖'}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default BooksByAuthor;
