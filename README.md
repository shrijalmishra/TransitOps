# 🚍 TransitOps – Smart Transport Operations Platform

TransitOps is a full-stack fleet and transport management platform built to help transport organizations efficiently manage vehicles, drivers, trips, maintenance schedules, fuel expenses, and operational reports from a centralized dashboard.

Designed as a hackathon project, TransitOps focuses on improving operational efficiency through role-based access, real-time management, and insightful analytics.

---

## ✨ Features

### 📊 Dashboard
- Fleet overview
- Operational KPIs
- Vehicle and driver statistics
- Trip summaries
- Quick insights for administrators

### 🚐 Vehicle Management
- Add, edit, and delete vehicles
- Vehicle status tracking
- Vehicle type and regional filtering
- Availability monitoring

### 👨‍✈️ Driver Management
- Driver registration
- Driver status management
- Driver assignment
- Driver records

### 🛣 Trip Management
- Create and assign trips
- Track trip status
- Driver and vehicle assignment
- Trip history

### 🔧 Maintenance Management
- Schedule maintenance
- Track maintenance records
- Vehicle maintenance history
- Service status monitoring

### ⛽ Fuel & Expense Management
- Record fuel usage
- Track operational expenses
- Cost monitoring
- Expense reports

### 📈 Reports & Analytics
- Operational reports
- Fleet statistics
- Fuel consumption analysis
- Performance metrics

### 🔐 Authentication & Authorization
- Secure Login & Registration
- JWT Authentication
- Role-Based Access Control (RBAC)

Supported Roles:
- Admin
- Fleet Manager
- Safety Officer
- Financial Analyst
- Driver

---

# 🛠 Tech Stack

## Frontend
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts
- Lucide React

## Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite
- JWT Authentication
- Zod Validation
- bcryptjs

---

# 📂 Project Structure

```
TransitOps/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── context/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── validations/
│   ├── database.sqlite
│   └── server.js
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/yourusername/TransitOps.git

cd TransitOps
```

---

## Backend Setup

```bash
cd backend

npm install

npm run seed

npm start
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🔑 Authentication

The system uses:

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Authorization

---

# 📌 Core Modules

- Dashboard
- Vehicle Management
- Driver Management
- Trip Management
- Maintenance Management
- Fuel Expense Tracking
- Reports & Analytics
- User Authentication

---

# 📈 Future Enhancements

- Live GPS vehicle tracking
- Predictive maintenance using AI
- Driver behavior analytics
- Route optimization
- Push notifications
- Mobile application
- Cloud database integration
- Real-time fleet monitoring

---

# 🎯 Problem Solved

TransitOps streamlines transport operations by providing a centralized digital platform to manage fleets, drivers, maintenance, trips, and operational expenses. It replaces manual workflows with an efficient, role-based management system that improves visibility, decision-making, and operational efficiency.

---

# 👥 Team

Developed as a Hackathon Project.

Contributors:
- Shrijal Mishra
- Deepa Kumari

---

# 📄 License

This project is developed for educational and hackathon purposes.

---

## ⭐ If you like this project, don't forget to star the repository!
