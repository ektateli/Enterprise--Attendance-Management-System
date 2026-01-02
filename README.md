
# ChronoFlow Enterprise Setup Guide

This project is a React-based Enterprise Attendance Management System.

## Local Deployment Instructions

### 1. Simple Run (No Setup)
If you have Node.js installed, simply run this in the project root:
```bash
npx serve
```
Then visit `http://localhost:3000` in your browser.

### 2. Deployment to Real MySQL
To move from `LocalStorage` to a real MySQL database:
1.  **Database Setup**: Execute the provided `schema.sql` in your MySQL instance.
2.  **API Integration**: Update `services/db.ts` to use `fetch()` calls instead of `localStorage`.
3.  **Server**: Create a Node.js Express server using `mysql2` and `jsonwebtoken` to handle the backend routes.

## Project Structure
- `index.html`: Entry point with Tailwind CSS and ESM imports.
- `index.tsx`: React mounting logic.
- `App.tsx`: Routing and Authentication flow.
- `services/db.ts`: Data access layer (currently simulated via LocalStorage).
- `pages/`: Contains Dashboard, Attendance, Admin, Reports, and Leave modules.
