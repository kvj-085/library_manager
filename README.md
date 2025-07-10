# Personal Library Manager API

This is a Python-based RESTful API for managing authors and their books, built with **FastAPI** and **SQLite**. It allows users to perform CRUD operations on both authors and books, with proper validation, duplicate checks, and relationship handling.

---

## Features

- Add, view, update, and delete authors
- Add, view, update, and delete books
- Prevent duplicate authors and books (case-insensitive)
- Prevent deleting an author who still has books
- View all books by a specific author
- Lightweight SQLite database
- Interactive API docs at `/docs`
- **Weather display for any city:** When logging in, users enter their city and see the current weather (with emoji) for that city, fetched live from OpenWeatherMap.

---

## Frontend Session Extension Feature

The Library Manager frontend includes a client-side session management and extension feature:

- **Session Timeout:** The app tracks user activity and sets a session timeout (30 minutes by default).
- **Warning Before Timeout:** 5 minutes before the session expires, a warning appears:  
  _"Your session will expire in X minutes. Click anywhere to extend your session."_
- **Extending the Session:**
  - If the user clicks anywhere (or the "Extend Session" button), the session timer is reset and the warning disappears.
  - This is handled by the `handleExtendSession` function in `App.js`, which updates the last activity timestamp in `localStorage`.
- **Session Expiry:** If the user does not interact, the session expires and the user is logged out with a message.

**Note:** This is a purely frontend feature and does not interact with the backend. It helps improve user experience by preventing accidental logouts due to inactivity.

---

## Tech Stack

- Python 3.10+
- FastAPI
- SQLite (via SQLAlchemy ORM)
- Pydantic
- Uvicorn

---

## Project Structure

```

library\_manager/
├── main.py          # FastAPI app & API routes
├── models.py        # SQLAlchemy models (Author, Book)
├── schemas.py       # Pydantic models (request/response)
├── database.py      # DB setup and session management
├── requirements.txt # Dependencies
└── library.db       # SQLite database (created after running)

```

---

## How to Run

```bash
# Clone the repo
git clone "repo link"
cd library-manager

# Set up virtual environment
python -m venv venv
venv\Scripts\activate  # on Windows

# Install dependencies
pip install -r requirements.txt

# Run the App
python -m uvicorn main:app --reload  (to run backend)
npm start (to run frontend) 
```
> PS: you should `npm install` the first time 


> NOTE: Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for Swagger UI.

---

## Example Endpoints

* `POST /authors/` — Add a new author
* `POST /books/` — Add a new book
* `GET /books/` — View all books
* `PUT /books/{id}` — Update book info
* `DELETE /authors/{id}` — Delete author (only if no books)
* `GET /books/by_author/{author_id}` — Get books by author

---

## To-Do (Future Enhancements)

* Bulk insert of authors/books
* Search and filter books
* User authentication with JWT
* CSV export of data

---

# How to login:
Log in with:
* admin / password123 or
* reader / booksrock

