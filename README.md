# Laundry Slot – Hostel Laundry Booking System

**INT252 – Modern Web Application Development | CA3 Project**

## 1. Project Overview

Laundry Slot is a web-based Hostel Laundry Booking System developed to simplify the process of using shared washing machines in a hostel.

The application provides separate interfaces for students and caretakers. Students can view machine availability, explore machines by floor and status, manage their bookings, and report machine-related problems. Caretakers can access the caretaker interface to manage and monitor the laundry system through the available application features.

This project focuses on the frontend implementation using React and Vite. It operates in Demo Mode with predefined demo login credentials and simulated application data. A production backend and database are not connected in this version.

## 2. Objectives

- Provide a simple interface for hostel laundry management.
- Display washing machine availability and status.
- Allow students to access booking-related features.
- Provide a facility to report machine faults.
- Display booking history and relevant information.
- Provide separate student and caretaker interfaces.
- Make the application easy to navigate and use.

## 3. Technologies Used

- React.js
- JavaScript
- Vite
- HTML5
- CSS3
- Git and GitHub
- Vercel for deployment

## 4. Main Features

### Student Module

- Student demo login.
- Dashboard displaying laundry machine statistics.
- View all 12 washing machines.
- Filter machines by floor.
- Filter machines by availability status.
- View machine details and status.
- Access machine booking options.
- View personal bookings.
- Submit machine fault reports.
- View booking history.

### Caretaker Module

- Separate caretaker demo login.
- Access the caretaker interface.
- View laundry machine information and available management features.

### Machine Management

The application displays 12 washing machines distributed across four hostel floors:

- Ground Floor: Washer 01–03
- First Floor: Washer 04–06
- Second Floor: Washer 07–09
- Third Floor: Washer 10–12

Machine statuses include:

- Available
- Running
- Faulty

The application displays a 40-minute laundry cycle.

### Fault Reporting

Students can report machine-related problems using the available problem categories:

- Machine not starting
- Water problem
- Excessive noise
- Door problem
- Other

Users can also provide a description of the reported problem.

### Booking and History

The application provides booking-related screens and a booking history interface for viewing relevant records.

## 5. Demo Login Credentials

**Student Login**

- Email: `student@laundryslot.com`
- Password: `student123`

**Caretaker Login**

- Email: `caretaker@laundryslot.com`
- Password: `care123`

These are demonstration credentials for the frontend application.

## 6. Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm
- Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/Laundry-Slot.git
```

### Step 2: Open the Project Folder

```bash
cd Laundry-Slot
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173/
```

### Step 5: Create a Production Build

```bash
npm run build
```

The production build is generated in the `dist` directory.

## 7. Application Mode and Limitations

This submission contains the frontend implementation of Laundry Slot and operates in Demo Mode.

- Demo authentication is implemented on the frontend.
- Application information is demonstrated using frontend data.
- No production backend or database is connected.
- No physical washing machines or IoT devices are connected.
- Data is not synchronized between different users or devices.

The project demonstrates the frontend design, navigation, and functionality of a hostel laundry booking application.

## 8. Deployment

The frontend application is intended to be deployed using Vercel.

**Live Application:** https://laundry-slot-pearl.vercel.app/ 
<img width="327" height="39" alt="image" src="https://github.com/user-attachments/assets/1fc93d27-ffa7-4749-b0e7-c967d7a77f51" />


## 9. GitHub Repository

**Source Code:** https://github.com/anurag-k-jha/Laundry-Slot
<img width="390" height="39" alt="image" src="https://github.com/user-attachments/assets/62e3903c-4cfe-4d39-85c3-387151cf8e96" />


## 10. Academic Information

- **Project Name:** Laundry Slot – Hostel Laundry Booking System
- **Course Code:** INT252
- **Course Name:** Modern Web Application Development
- **Project Type:** Individual CA3 Project
- **Student Name:** Anurag Kumar Jha

---

**Laundry Slot – Making Hostel Laundry Management Simpler.**
