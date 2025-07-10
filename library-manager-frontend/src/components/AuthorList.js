import React, { useState } from 'react';
import api from '../api';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [showAuthors, setShowAuthors] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAuthors = () => {
    setLoading(true);
    api.get('/authors/')
      .then(res => {
        setAuthors(res.data);
        setShowAuthors(true);
      })
      .catch(err => alert('Failed to load authors'))
      .finally(() => setLoading(false));
  };

  const handleToggle = () => {
    if (showAuthors) {
      setShowAuthors(false);
    } else {
      fetchAuthors();
    }
  };

  const deleteAuthor = (id) => {
  if (window.confirm('Delete this author?')) {
    api.delete(`/authors/${id}`)
      .then(() => fetchAuthors())
      .catch(err => {
        const detail = err.response?.data?.detail;

        if (typeof detail === 'object') {
            const bookList = detail.books?.join(', ') || 'unknown books';
            alert(`${detail.message}\nBooks: ${bookList}`);
        } else {
            alert(detail || 'Could not delete author');
        }
    });
  }
};

  return (
    <div>
      <button onClick={handleToggle}>
        {showAuthors ? 'Hide Authors' : 'Show All Authors'}
      </button>

      {loading && <p>Loading authors...</p>}

      {showAuthors && !loading && (
        <ul>
        {authors.map(author => (
            <li key={author.id}>
            <strong>{author.name}</strong> ({author.nationality})
            <button onClick={() => deleteAuthor(author.id)} style={{ marginLeft: '10px' }}>🗑️</button>
            </li>
        ))}
        </ul>
      )}
    </div>
  );
};

export default AuthorList;
