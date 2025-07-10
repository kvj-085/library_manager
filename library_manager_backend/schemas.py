from pydantic import BaseModel
from typing import List, Optional

class BookBase(BaseModel):
    title: str
    year: int
    is_read: bool = False

class BookCreate(BookBase):
    author_id: int

class Book(BookBase):
    id: int
    author_id: int

    class Config:
        orm_mode = True

class AuthorBase(BaseModel):
    name: str
    nationality: Optional[str] = None

class AuthorCreate(AuthorBase):
    pass

class Author(AuthorBase):
    id: int
    books: List[Book] = []

    class Config:
        orm_mode = True

class ImageBase(BaseModel):
    name: str

class ImageCreate(ImageBase):
    pass

class ImageOut(ImageBase):
    id: int

    class Config:
        orm_mode = True

