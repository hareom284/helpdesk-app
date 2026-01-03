# 🖥️ IT CORE: Help Desk Management System

A modern IT help desk management system built with **Apple's Glass UI** design philosophy.

This read in Burmese language: [READMEmm.md](./READMEmm.md)

<img width="1470" height="922" alt="Screenshot 2569-01-03 at 17 01 14" src="https://github.com/user-attachments/assets/84209f28-802b-487d-ac21-d73130aa0376" />

---

### 📝 Overview

**IT CORE** is designed to systematically manage IT issues for companies, schools, and organizations. Using Apple's **Glassmorphism** design, it's not only beautiful but also incredibly intuitive to use.

---

### ⚙️ Setup Guide

Follow these steps to get started with the system:

#### 1. Requirements

* **Node.js:** Version 20 or higher
* **Database:** MySQL
* **Package Manager:** npm

#### 2. Installation Steps

| Step | Action | Command |
| --- | --- | --- |
| **Step 1** | Install dependencies | `npm install` |
| **Step 2** | Configure database connection | Add Database URL in `.env` file |
| **Step 3** | Setup database | `npm run prisma:generate` (and push/seed) |
| **Step 4** | Start the system | `npm run dev` |

> 💡 **For Testing:**
> * **URL:** `http://localhost:3000`
> * **Admin:** `admin@manzaneque.com` | **Password:** `password123`
>
>

---

### 👥 User Roles

1. **Admin:**
* Full system control
* Manage users and permissions


2. **Operator:**
* Log issues and assign them to specialists


3. **Specialist:**
* Resolve assigned technical problems


4. **End User:**
* Report issues and track their status



---

### ✨ Key Features

#### 🛠 Ticket Management

* **Priority Levels:** Low, Medium, High, Urgent
* **Status Tracking:** Open → Assigned → In Progress → Resolved → Closed
* **Easy Search:** Find tickets quickly by Ticket ID

#### 📦 Asset Management

* Track equipment with **Serial Numbers**
* Manage software license expiration dates

#### 📊 Additional Services

* **Real-time Dashboard:** Monitor current status in real-time
* **SLA Tracking:** Alerts to ensure resolution within deadlines
* **File Attachments:** Attach screenshots and relevant files to issues

---

### 🚀 Tech Stack

* **Frontend:** Next.js 14, React, Tailwind CSS
* **Backend:** Prisma ORM, MySQL
* **Security:** NextAuth v5
* **Language:** TypeScript

---

### 💻 Useful Commands

* `npm run dev` - Run the system in Development Mode
* `npm run build` - Build for production
* `npm run prisma:studio` - View database data with GUI

---

### 🌏 Language Support

This README is also available in Burmese: [READMEmm.md](./READMEmm.md)

---

**Note:** This system is specifically designed to make IT support workflows faster and more systematic in workplace environments.
