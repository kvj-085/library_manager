from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi import Path
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import SessionLocal, engine, get_db
from typing import List
from sqlalchemy.orm import Session
import models, schemas
from fastapi.responses import Response

import xml.etree.ElementTree as ET
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi import Request

from fastapi.middleware.cors import CORSMiddleware

from fastapi import Form

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

#add a new author
@app.post("/authors/", response_model=schemas.Author)
def create_author(author: schemas.AuthorCreate, db: Session = Depends(get_db)):
    # Case-insensitive check for existing author name
    existing_author = db.query(models.Author).filter(
        func.lower(models.Author.name) == author.name.lower()
    ).first()

    if existing_author:
        raise HTTPException(status_code=400, detail="Author already exists")

    db_author = models.Author(**author.dict())
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author

#get all the authors
@app.get("/authors/", response_model=List[schemas.Author])
def read_authors(db: Session = Depends(get_db)):
    return db.query(models.Author).all()

#add a book (with author ID)
@app.post("/books/", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    # Check if the author exists
    author = db.query(models.Author).filter(models.Author.id == book.author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    # Case-insensitive duplicate check (normalize both to lowercase)
    existing_book = db.query(models.Book).filter(
        func.lower(models.Book.title) == book.title.lower(),
        models.Book.author_id == book.author_id
    ).first()

    if existing_book:
        raise HTTPException(status_code=400, detail="Book already exists for this author")

    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

#get all books
@app.get("/books/", response_model=List[schemas.Book])
def read_books(request: Request, db: Session = Depends(get_db)):
    books = db.query(models.Book).all()
    accept = request.headers.get("accept", "application/json")
    if "application/xml" in accept:
        # Build XML manually
        root = ET.Element("books")
        for book in books:
            book_el = ET.SubElement(root, "book")
            ET.SubElement(book_el, "id").text = str(book.id)
            ET.SubElement(book_el, "title").text = book.title
            ET.SubElement(book_el, "year").text = str(book.year)
            ET.SubElement(book_el, "is_read").text = str(book.is_read)
            ET.SubElement(book_el, "author_id").text = str(book.author_id)

        xml_string = ET.tostring(root, encoding="utf-8")
        return Response(content=xml_string, media_type="application/xml")

    elif "text/html" in accept:
        # Render HTML manually
        html = "<html><body><h2>Books List</h2><ul>"
        for book in books:
            html += (
                f"<li><strong>{book.title}</strong> "
                f"(Year: {book.year}) - "
                f"{'Read' if book.is_read else 'Unread'}"
                f"</li>"
            )
        html += "</ul></body></html>"

        return HTMLResponse(content=html)

    else:
        # Default: JSON
        return books

#update a book
@app.put("/books/{book_id}", response_model=schemas.Book)
def update_book(book_id: int, updated_book: schemas.BookCreate, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Ensure author exists
    author = db.query(models.Author).filter(models.Author.id == updated_book.author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    # Update fields
    book.title = updated_book.title
    book.year = updated_book.year
    book.is_read = updated_book.is_read
    book.author_id = updated_book.author_id

    db.commit()
    db.refresh(book)
    return book

#delete a book
@app.delete("/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    db.delete(book)
    db.commit()
    return {"detail": f"Book with ID {book_id} has been deleted"}

#get books by a specific author 
@app.get("/books/by_author/{author_id}", response_model=List[schemas.Book])
def get_books_by_author(author_id: int, db: Session = Depends(get_db)):
    author = db.query(models.Author).filter(models.Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    return db.query(models.Book).filter(models.Book.author_id == author_id).all()

#delete an author (throwing an error message if the author has books or deleting otherwise)
@app.delete("/authors/{author_id}")
def delete_author(author_id: int, db: Session = Depends(get_db)):
    author = db.query(models.Author).filter(models.Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    # Check if the author has any books
    books = db.query(models.Book).filter(models.Book.author_id == author_id).all()
    if books:
        book_titles = [book.title for book in books]
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Cannot delete author with existing books.",
                "books": book_titles
            }
        )

    db.delete(author)
    db.commit()
    return {"detail": f"Author with ID {author_id} has been deleted"}

# upload an image
@app.post("/upload_image/", response_model=schemas.ImageOut)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    existing = db.query(models.Image).filter(models.Image.name.ilike(file.filename)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Image with that name already exists.")

    contents = await file.read()
    new_image = models.Image(name=file.filename, data=contents)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    return new_image

# retrieve image with an id
@app.get("/get_image/{image_id}")
def get_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return Response(content=image.data, media_type="image/jpeg")

#connection to frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Very basic fake user
fake_users = {
    "admin": "password123",
    "reader": "booksrock"
}

@app.post("/login/")
def login(username: str = Form(...), password: str = Form(...)):
    if username in fake_users and fake_users[username] == password:
        return {"message": "Login successful", "username": username}
    raise HTTPException(status_code=401, detail="Invalid credentials")
