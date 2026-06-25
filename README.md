# 📚 Library Management System

A full-stack **Library Management System** built with **Node.js, Express.js, and MongoDB** on the backend, and **React.js** on the frontend. The system manages books, members, and borrow/return transactions with secure authentication, role-based authorization, OTP email verification, and automated fine calculation.

---

## 📖 Table of Contents

- [About the App](#about-the-app)
- [Tech Stack](#tech-stack)
- [Entities (Database Models)](#entities-database-models)
- [Entity Relationships](#entity-relationships)
- [CRUD Implementation Overview](#crud-implementation-overview)
- [API Routes](#api-routes)
- [Validation & Security](#validation--security)
- [Automation Services](#automation-services)
- [Project Folder Structure](#project-folder-structure)
- [Setup & Installation](#setup--installation)
- [Authors](#authors)
- [License](#license)

---

## About the App

The **Library Management System** is a console/API-based backend application designed to digitize and automate core library operations. It allows registered members to browse available books, borrow them, and return them within a due period, while administrators manage the book inventory, monitor all borrow activity, and oversee registered users.

The application demonstrates a complete **CRUD (Create, Read, Update, Delete)** workflow on a real-world, multi-entity system, along with practical implementation of **authentication, authorization, relationships between collections, and backend automation** — all built using MongoDB as the primary data store.

Key functional highlights include:

- Member registration with **OTP-based email verification**
- Secure **JWT authentication** stored in HTTP-only cookies
- **Role-based access control** (Admin vs User)
- Book inventory management with **Cloudinary-based cover image uploads**
- Borrow & return workflow with **automatic fine calculation** for overdue books
- **Automated cron jobs** for due-date reminders and unverified account cleanup
- All APIs tested and verified using **Postman**

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | v20.x LTS |
| Backend Framework | Express.js | ^4.18.x |
| Database | MongoDB (Atlas / Local) | ^7.x |
| ODM | Mongoose | ^8.x |
| Authentication | JSON Web Token (jsonwebtoken) | ^9.x |
| Password Hashing | bcrypt | ^5.x |
| Email Service | Brevo API | ^6.x |
| Media Upload | Cloudinary + express-fileupload | ^1.x |
| Task Scheduling | node-cron | ^3.x |
| Environment Config | dotenv | ^16.x |
| Cookie Handling | cookie-parser | ^1.x |
| Cross-Origin Handling | cors | ^2.x |
| Frontend Library | React.js (Vite) | ^18.x |
| Frontend Routing | React Router DOM | ^6.x |
| HTTP Client | Axios | ^1.x |
| API Testing | Postman | Latest |
| Code Editor | VS Code | Latest |
| Version Control | Git & GitHub | Latest |

---

## Entities (Database Models)

The system is built around **four core collections** that represent the real-world entities of a library.

### 1. User
Represents both regular members and administrators of the library.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String | Full name of the user |
| `email` | String | Unique email address (used for login) |
| `password` | String | Hashed password (bcrypt) |
| `role` | String | `User` or `Admin` |
| `isVerified` | Boolean | Whether the email has been OTP-verified |
| `verificationCode` | String | OTP code sent during registration |
| `verificationCodeExpire` | Date | OTP expiry timestamp |
| `resetPasswordToken` | String | Hashed token for password reset |
| `resetPasswordExpire` | Date | Reset token expiry timestamp |
| `createdAt` | Date | Account creation timestamp |

### 2. Book
Represents each book title available in the library's inventory.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `title` | String | Title of the book |
| `author` | String | Author's name |
| `category` | String | Genre/category (Fiction, Science, etc.) |
| `quantity` | Number | Number of copies currently in stock |
| `availability` | Boolean | Auto-calculated based on quantity |
| `coverImage` | Object | Cloudinary `public_id` and `url` |
| `isbn` | String | Unique ISBN number |
| `publishedYear` | Number | Year of publication |
| `createdAt` | Date | Record creation timestamp |

### 3. BorrowRecord
Acts as the **linking/junction entity** that records every borrow transaction between a User and a Book.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId (ref: User) | The member who borrowed the book |
| `bookId` | ObjectId (ref: Book) | The book that was borrowed |
| `borrowedDate` | Date | Date the book was issued |
| `dueDate` | Date | Date by which the book must be returned (borrow date + 14 days) |
| `returnDate` | Date | Actual date the book was returned (null if not yet returned) |
| `fine` | Number | Auto-calculated fine (Rs. 5/day for overdue returns) |
| `status` | String | `borrowed`, `returned`, or `overdue` |

### 4. Admin (Role Extension)
There is no separate `Admin` collection. Instead, **Admin is a role value within the `User` model** (`role: "Admin"`). This avoids data duplication and keeps authentication centralized in a single collection while still allowing role-based permission checks throughout the app.

---

## Entity Relationships

| Relationship | Entities Involved | Type | How It's Implemented |
|---|---|---|---|
| A user can borrow many books over time | `User` → `BorrowRecord` | **One-to-Many** | Each `BorrowRecord` stores a single `userId` reference |
| A book can be borrowed by many users over time | `Book` → `BorrowRecord` | **One-to-Many** | Each `BorrowRecord` stores a single `bookId` reference |
| Users and Books are connected through borrow history | `User` ↔ `Book` (via `BorrowRecord`) | **Many-to-Many** | `BorrowRecord` acts as the junction collection linking both sides |
| Admin is a specialized type of User | `User` (role = Admin) | **One-to-One (Role Extension)** | No separate collection; differentiated using the `role` field on the same document |

This mirrors a classic relational many-to-many pattern (like a join table in SQL), implemented in MongoDB using reference fields (`ObjectId`) and the Mongoose `populate()` method instead of foreign keys.

---

## CRUD Implementation Overview

CRUD operations are implemented across all major entities through dedicated controllers and routes:

| Entity | Create | Read | Update | Delete |
|---|---|---|---|---|
| **User** | Register (OTP verify) / Admin creation | Get logged-in user / Get all users | Update password / Reset password | Delete user account |
| **Book** | Add new book (with cover image upload) | Get all books (with filters) / Get single book | Update book details / cover image | Delete book |
| **BorrowRecord** | Borrow a book (creates record) | Get my records / Get all records (Admin) | Return a book (updates record + calculates fine) | — (records are preserved for history, not deleted) |

Each operation flows through: **Route → Middleware (Auth/Role check) → Controller → Mongoose Model → MongoDB**, with centralized error handling via a global error middleware.

---

## API Routes

Base URL: `http://localhost:5000/api/v1`

### Auth Routes — `/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new user, sends OTP to email | Public |
| POST | `/auth/otp-verify` | Verify OTP and activate account | Public |
| POST | `/auth/login` | Login with email & password | Public |
| GET | `/auth/logout` | Logout and clear auth cookie | 🔒 User |
| GET | `/auth/me` | Get currently logged-in user details | 🔒 User |
| POST | `/auth/forgot-password` | Send password reset link via email | Public |
| PUT | `/auth/reset-password/:token` | Reset password using reset token | Public |
| PUT | `/auth/update-password` | Update password while logged in | 🔒 User |

### Book Routes — `/book`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/book/add` | Add a new book (supports cover image upload) | 🔒 Admin |
| GET | `/book/all` | Get all books (supports search/category/availability filters) | 🔒 User |
| GET | `/book/:id` | Get a single book by ID | 🔒 User |
| PUT | `/book/update/:id` | Update book details / cover image | 🔒 Admin |
| DELETE | `/book/delete/:id` | Delete a book from the collection | 🔒 Admin |

### Borrow Routes — `/borrow`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/borrow/record/:bookId` | Borrow a book (creates a BorrowRecord) | 🔒 User |
| PUT | `/borrow/return/:bookId` | Return a borrowed book, calculates fine if overdue | 🔒 User |
| GET | `/borrow/my` | Get the logged-in user's borrow history | 🔒 User |
| GET | `/borrow/all` | Get all borrow records across all users | 🔒 Admin |

### User Routes — `/user`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/user/all` | Get all registered users | 🔒 Admin |
| POST | `/user/add/new-admin` | Register a new admin account | 🔒 Admin |
| DELETE | `/user/delete/:id` | Delete a user account | 🔒 Admin |

---

## API Testing & Application Screenshots
 
### 1. Auth APIs
 
#### Register
![Register](./assets/register.png)
 
#### OTP Verify
![OTP Verify](./assets/otpVerify.png)
 
#### Login
![Login](./assets/login.png)
 
#### Get Logged-in User (Me)
![Get Logged-in User (Me)](./assets/getLoggedInUser.png)
 
#### Logout
![Logout](./assets/logout.png)
 
#### Forgot Password
![Forgot Password](./assets/forgotPassword.png)
 
#### Reset Password
![Reset Password](./assets/resetPassword.png)
 
#### Update Password
![Update Password](./assets/updatePassword.png)
 
### 2. Book APIs
 
#### Add Book
![Add Book](./assets/addBook.png)
 
#### Get All Books
![Get All Books](./assets/getAllBooks.png)
 
#### Get Single Book
![Get Single Book](./assets/getSingleBook.png)
 
#### Update Book
![Update Book](./assets/updateBook.png)
 
#### Book Updated (Result)
![Book Updated](./assets/bookUpdated.png)
 
#### Delete Book
![Delete Book](./assets/deleteBook.png)
 
#### Book Deleted (Result)
![Book Deleted](./assets/bookDeleted.png)
 
### 3. Borrow APIs
 
#### Borrow a Book
![Borrow a Book](./assets/borrowBook.png)
 
#### Return a Book
![Return a Book](./assets/returnBook.png)
 
#### My Borrow Records
![My Borrow Records](./assets/myBorrowRecords.png)
 
#### All Borrow Records (Admin)
![All Borrow Records](./assets/allBorrowRecords.png)
 
### 4. User APIs
 
#### Get All Users
![Get All Users](./assets/getAllUsers.png)
 
#### Add New Admin
![Add New Admin](./assets/addNewAdmin.png)
 
#### Delete User
![Delete User](./assets/deleteUser.png)
 
#### Deleted User (Result)
![Deleted User](./assets/deletedUser.png)
 
### 5. MongoDB Database — Screenshots
 
The following screenshots show the actual collections and stored documents in MongoDB (via Compass or Atlas), confirming that data created through the APIs is correctly persisted with proper relationships.
 
#### Users Collection
![Users Collection](./assets/usersCollection.png)
 
#### Books Collection
![Books Collection](./assets/booksCollection.png)
 
#### BorrowRecords Collection
![BorrowRecords Collection](./assets/borrowRecordsCollection.png)
 
#### Database Overview
![Database Overview](./assets/databaseOverview.png)
 
### 6. Frontend Application — Screenshots
 
The following screenshots demonstrate the working frontend interface, showing how each backend feature is reflected in the user experience.
 
#### Login Page
![Login Page](./assets/loginPage.png)
 
#### Register Page
![Register Page](./assets/registerPage.png)
 
#### Home / Dashboard
![Home / Dashboard](./assets/homeDashboard.png)
 
#### Browse Books Page
![Browse Books Page](./assets/browseBooksPage.png)
 
#### My Borrows Page
![My Borrows Page](./assets/myBorrowsPage.png)
 
#### Admin — Manage Books
![Admin Manage Books](./assets/adminManageBooks.png)
 
#### Admin — All Borrow Records
![Admin All Borrow Records](./assets/adminAllBorrowRecords.png)
 
#### Admin — Manage Users
![Admin Manage Users](./assets/adminManageUsers.png)
 
---
 
## Validation & Security

- **JWT Authentication** — tokens are signed with a secret key and stored in HTTP-only cookies to prevent client-side script access
- **Password Hashing** — all passwords are hashed using `bcrypt` before being saved to the database
- **OTP Email Verification** — new accounts must verify a 6-digit OTP sent to their email before logging in
- **Role-Based Authorization** — `isAuthenticated` and `isAuthorized("Admin")` middleware restrict access to sensitive routes
- **Centralized Error Handling** — a `catchAsyncErrors` wrapper and global `errorMiddleware` handle Mongoose, JWT, and validation errors consistently
- **Secure Password Reset** — reset tokens are hashed before storage and expire after 15 minutes

---

## Automation Services

Two background **cron jobs** run independently of user requests:

| Service | Schedule | Purpose |
|---|---|---|
| `notifyUsers.js` | Daily, 8:00 AM | Emails members whose books are due the next day; marks overdue records |
| `removeUnverifiedAccounts.js` | Every hour | Deletes accounts that registered but never completed OTP verification within 1 hour |

---

## Project Folder Structure

```
library-management-system/
├── config/              → MongoDB & Cloudinary configuration
├── controllers/         → Business logic for each entity
├── middleware/          → Authentication & global error handling
├── models/               → Mongoose schemas (User, Book, BorrowRecord)
├── routes/               → Express route definitions
├── services/             → Cron job automation scripts
├── utils/                 → Helper functions (email, token, error class)
├── .env                   → Environment variables (not committed)
└── server.js              → Application entry point

client/
├── src/
│   ├── api/               → Axios instance & API call functions
│   ├── components/        → Reusable UI components (Navbar, BookCard)
│   ├── context/           → Global authentication context
│   ├── pages/              → Route-level pages (Login, Books, Admin views)
│   └── App.jsx              → Routing configuration
└── .env                    → Frontend environment variables
```

---

## Setup & Installation

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser. The backend runs on `http://localhost:5000` and must be started first.

---

## Authors

**App Development and Documentation** — Sanyogita Singh

---

## License

This project is developed strictly for **educational purposes** as part of the **MongoDB Administration course offered through FACEprep**. It is submitted in partial fulfillment of course requirements, where successful completion contributes toward a **certification and performance-based score/cards**, evaluated by the course instructor.

This project is not intended for commercial use or distribution. All rights to the course curriculum and evaluation criteria belong to FCePrep. The application code itself may be reused or extended for personal learning purposes.
