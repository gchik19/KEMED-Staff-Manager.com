# KEMED Staff Data Management System

A full-stack staff data management application built for the Krachi East Municipal Education Directorate.

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, better-sqlite3
- **Authentication:** JWT & bcrypt
- **Visualizations:** Recharts

## Setup Instructions

1. **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

2. **Run the Development Server:**
    \`\`\`bash
    npm run dev
    \`\`\`
    This will start the Express backend on port `3000` (which seamlessly serves the Vite proxy frontend).

3. **Log in:**
    The system automatically seeds an initial Super Admin user during database creation:
    - **Staff ID:** \`ADMIN-001\`
    - **Password:** \`admin123\`

4. **Production Build:**
    \`\`\`bash
    npm run build
    npm run start
    \`\`\`

## System Architecture

The application runs a unified process environment where Express serves both API data and the Vue/React applications static output when in production mode.

### Database

The current development footprint utilizes \`better-sqlite3\` for zero-config persistence because it's highly robust and requires minimal setup on deployment platforms. To migrate to PostgreSQL natively for scale out, replace \`src/server/db.ts\` with a native `pg` client and mirror the schema structure provided in the initial raw SQL dump inside \`db.ts\`.

## Features
- **Role-Based Access Control** (Super Admin, Statistics Officer Admin, Head Teacher)
- **Analytics Dashboard**: Live charts, Age distribution, Nearing retirement records
- **Data Collections**: Enforces strict format validations (e.g. UPPERCASE constraints on backend)
- **Export To CSV**: Ready-to-go reporting format for Excel manipulation.
