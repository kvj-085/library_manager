✅ Features in Your FastAPI API
📘 Books
Action	Route	Method	Input
Add Book	/books/	POST	title, year, is_read, author_id
View All Books	/books/	GET	—
View Books by Author	/books/by_author/{author_id}	GET	—
Update Book	/books/{book_id}	PUT	title, year, is_read, author_id
Delete Book	/books/{book_id}	DELETE	—

👤 Authors
Action	Route	Method	Input
Add Author	/authors/	POST	name, nationality
View All Authors	/authors/	GET	—
Delete Author	/authors/{author_id}	DELETE	— (error if books exist)

🖼️ Images
Action	Route	Method	Input
Upload Image	/upload_image/	POST	File
Get Image	/get_image/{image_id}	GET	—