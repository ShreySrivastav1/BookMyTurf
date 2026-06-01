# ⚽ BookMyTurf Backend

Backend APIs for the BookMyTurf platform built using Node.js, Express.js, MongoDB, JWT Authentication, and Razorpay Payment Gateway.

## 📌 Frontend Repository

🔗 https://github.com/ShreySrivastav1/BookMyTurf-web

## 🚀 Live Application

🔗 http://13.127.251.76/

---

## ✨ Features

### Authentication

- Signup
- Login
- Logout
- JWT Authentication
- HttpOnly Cookies

### User Management

- View Profile
- Edit Profile
- Change Password
- Become Turf Owner

### Turf Management

- Create Turf
- Edit Turf
- Delete Turf
- View Owner Turfs
- Public Turf Listing

### Booking System

- Check Availability
- Create Booking
- View User Bookings
- View Owner Bookings
- Cancel Booking

### Payments

- Razorpay Order Creation
- Payment Verification
- Booking Confirmation

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Bcrypt.js
- Cookie Parser
- CORS

### Payment

- Razorpay

### Deployment

- AWS EC2
- PM2
- Nginx

---

## 📂 Project Structure

```bash
src
│
├── config
├── middlewares
├── models
├── routes
├── utils
└── app.js
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/ShreySrivastav1/BookMyTurf.git
```

### Install Dependencies

```bash
npm install
```

### Create Environment Variables

```env
PORT=7777

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key_id

RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLIENT_URL=http://localhost:5173
```

### Start Server

```bash
npm run dev
```

---

## 📌 API Endpoints

### Authentication

```http
POST /signup
POST /login
POST /logout
```

### Profile

```http
GET /profile/view
PATCH /profile/edit
PATCH /profile/password
PATCH /profile/become-owner
```

### Turf

```http
GET /public/turfs
GET /public/turf/:turfId

POST /turf/create
PATCH /turf/edit/:turfId
DELETE /turf/delete/:turfId

GET /owner/turfs
```

### Booking

```http
POST /booking

GET /booking/my

GET /owner/bookings

PATCH /booking/cancel/:bookingId
```

### Payment

```http
POST /payment/create-order

POST /payment/verify
```

---

## 🔒 Security Features

- JWT Authentication
- HttpOnly Cookies
- Password Hashing using Bcrypt
- Role Based Authorization
- Input Validation
- MongoDB Schema Validation

---

## 🏗 Database Models

### User

```js
{
  firstName,
  lastName,
  emailId,
  password,
  role
}
```

### Turf

```js
{
  ownerId,
  name,
  sportsSupported,
  address,
  city,
  pricePerHour,
  openingTime,
  closingTime,
  amenities,
  photos,
  isActive
}
```

### Booking

```js
{
  userId,
  turfId,
  bookingDate,
  startTime,
  endTime,
  totalAmount,
  bookingStatus,
  paymentStatus
}
```

---

## 🌐 Deployment Architecture

```text
Client
  │
  ▼
Nginx
  │
  ▼
Express Server (PM2)
  │
  ▼
MongoDB Atlas
  │
  ▼
Razorpay
```

---

## 📚 What I Learned

- REST API Design
- MongoDB Data Modeling
- Authentication & Authorization
- Razorpay Integration
- Middleware Design
- AWS EC2 Deployment
- PM2 Process Management
- Nginx Reverse Proxy Setup

---

## 👨‍💻 Author

### Shrey Srivastav

GitHub: https://github.com/ShreySrivastav1

LinkedIn: https://www.linkedin.com/in/shrey-srivastav-b3873031b

---

⭐ If you found this project useful, consider giving it a star.
