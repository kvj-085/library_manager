import React, { useState } from 'react';
import api from '../api';

const AddAuthorForm = ({ onAuthorAdded }) => {
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newAuthor = { name, nationality };

    api.post('/authors/', newAuthor)
      .then(() => {
        setName('');
        setNationality('');
        setSuccessMessage('Author added successfully!');
        if (onAuthorAdded) onAuthorAdded();

        setTimeout(() => setSuccessMessage(''), 3000);
      })
      .catch(err => {
        alert(err.response?.data?.detail || 'Error adding author');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Author</h3>
      <input
        type="text"
        placeholder="Author Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Nationality"
        value={nationality}
        onChange={(e) => setNationality(e.target.value)}
        required
      />
      <button type="submit">Add Author</button>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

    </form>
  );
};

export default AddAuthorForm;
