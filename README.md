# SHAKS LMS

SHAKS LMS is a learning management system designed to manage courses, lessons, assignments, and student submissions.  
The platform allows teachers to create courses and lessons, while students can enroll in courses, complete assignments, and submit their work for review.

This project is developed as a university team project using Django REST Framework for the backend. The frontend will be developed using React.

---

## Features

### Authentication
- User registration and login
- Role-based access (Student / Teacher)
- JWT authentication

### Student Features
- View profile
- Enroll in courses
- View course modules and lessons
- Submit assignments
- Track submissions

### Teacher Features
- Manage courses
- Create modules and lessons
- Review student submissions
- Provide feedback

### Course Structure
Each course contains:
- Modules
- Lessons
- Quizzes
- Assignments

---

## Tech Stack

Backend:
- Python
- Django
- Django REST Framework

Frontend:
- React (planned)

Database:
- PostgreSQL / SQLite (development)

Authentication:
- JWT (SimpleJWT)

---

## Project Structure


Shaks/
│
├── apps/
│ ├── users
│ ├── courses
│ └── submissions
│
├── settings/
│ ├── base.py
│ ├── dev.py
│ └── prod.py
│
├── requirements
├── logs
├── manage.py
└── README.md


---

## Installation

Clone the repository


git clone https://github.com/amgyvae/Shaks.git

cd Shaks


Create virtual environment


python -m venv venv
source venv/bin/activate


Install dependencies


pip install -r requirements.txt


Apply migrations


python manage.py migrate


Run the server


python manage.py runserver


---

## API Endpoints

Authentication


POST /api/auth/login
POST /api/auth/register


Courses


GET /api/courses
GET /api/courses/{id}


Lessons


GET /api/lessons
GET /api/lessons/{id}


Submissions


POST /api/submissions
GET /api/submissions


---

## Team Members

- Nuray Aitbazar
- Margulan Sharipzhan
- Askarova Akbota

---

## Future Improvements

- React frontend
- Course progress tracking
- Notifications
- Quiz system
- File submissions

---

## License

Educational project developed for university coursework.
