import React, { useEffect, useState } from 'react';
import api from '../api';

const AddBookForm = ({ onBookAdded }) => {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [isRead, setIsRead] = useState(false);
  const [authorId, setAuthorId] = useState('');
  const [authors, setAuthors] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    api.get('/authors/')
      .then(res => setAuthors(res.data))
      .catch(err => console.error('Error loading authors:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newBook = {
      title,
      year: parseInt(year),
      is_read: isRead,
      author_id: parseInt(authorId),
    };

    api.post('/books/', newBook)
      .then(() => {
        setTitle('');
        setYear('');
        setIsRead(false);
        setAuthorId('');
        setSuccessMessage('✅ Book added successfully!');
        if (onBookAdded) onBookAdded();
        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch((err) => {
        alert(err.response?.data?.detail || 'Error adding book');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Book</h3>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={e => setYear(e.target.value)}
        required
      />

      <label>
        <input
          type="checkbox"
          checked={isRead}
          onChange={e => setIsRead(e.target.checked)}
        />
        I have read this book
      </label>

      <select value={authorId} onChange={e => setAuthorId(e.target.value)} required>
        <option value="">Select Author</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.name}
          </option>
        ))}
      </select>

      <button type="submit">Add Book</button>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </form>
  );
};

export default AddBookForm;
