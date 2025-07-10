import React, { useEffect, useState } from 'react';
import api from '../api';

const UpdateBookForm = ({ book, onUpdated, onCancel }) => {
  const [title, setTitle] = useState(book.title);
  const [year, setYear] = useState(book.year);
  const [isRead, setIsRead] = useState(book.is_read);
  const [authorId, setAuthorId] = useState(book.author_id);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    api.get('/authors/')
      .then(res => setAuthors(res.data))
      .catch(err => console.error('Author fetch error:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedBook = {
      title,
      year: parseInt(year),
      is_read: isRead,
      author_id: parseInt(authorId),
    };
    api.put(`/books/${book.id}`, updatedBook)
      .then(() => onUpdated())
      .catch(err => alert('Update failed'));
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px', marginBottom: '20px' }}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Year" required />
      <label>
        <input type="checkbox" checked={isRead} onChange={e => setIsRead(e.target.checked)} />
        Read
      </label>
      <select value={authorId} onChange={e => setAuthorId(e.target.value)} required>
        {authors.map(author => (
          <option key={author.id} value={author.id}>{author.name}</option>
        ))}
      </select>
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default UpdateBookForm;
