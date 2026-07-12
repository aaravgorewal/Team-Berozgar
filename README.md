# Enterprise Asset & Facility Management System

 **[Watch the Full Video Demo Here](https://www.youtube.com/watch?v=mheCoAdcDKg)** 🎥

A modern, full-stack, Odoo-inspired Asset and Facility Management application built with Next.js 15. This system allows organizations to track physical assets, manage employee allocations, conduct physical audit cycles, and handle maintenance requests in a centralized, beautiful dashboard.

##  Key Features

- **Role-Based Authentication:** Secure login using NextAuth. The *first* user to register automatically becomes the `ADMIN`. Subsequent users are registered as standard `USER`s.
- **Asset Inventory:** Create, view, and manage physical assets (Laptops, Furniture, Vehicles) with asset tags, serial numbers, and lifecycle tracking.
- **Employee & Organization Management:** Manage hierarchical company departments and add employees.
- **Asset Allocations:** Assign assets to specific employees or departments. Keep a historical log of who had what, and when.
- **Maintenance Ticketing:** Report broken or damaged assets, track repair statuses, and resolve tickets.
- **Audit Cycles:** Schedule regular physical inventory checks (e.g., "Q1 Full Audit"). Assign auditors to verify the physical presence of assets. Missing or damaged assets are flagged instantly.
- **Real-Time Analytics Dashboard:** Interactive data visualizations (built with Recharts) displaying asset distribution, maintenance resolution rates, and system activity feeds.
- **Dynamic Graceful Error Handling:** Custom error boundaries to gracefully handle database cold starts (Serverless Postgres latency).

##  Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Database:** PostgreSQL (Compatible with both local instances and Serverless [Neon](https://neon.tech))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) + [@base-ui/react](https://base-ui.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

##  Dashboard Workflows & Application Flow

The system is designed to mimic a real-world enterprise workflow. To properly test or use the application, it is recommended to follow this sequence of operations:

### Step 1: Organizational Setup (Organization Page)
Before creating assets, you need an organizational structure.
1. **Departments:** Go to the Organization page and create departments (e.g., "Engineering", "HR"). Departments can have hierarchical relationships (e.g., "Frontend" is a child of "Engineering").
2. **Employees:** Once departments exist, create Employee (User) profiles and assign them to specific departments. This establishes who can be assigned assets.
3. **Categories:** Create Asset Categories (e.g., "Electronics", "Vehicles") to enforce classification rules.

### Step 2: Asset Procurement (Assets Page)
Now that your organization exists, you can register physical inventory.
1. Navigate to the **Assets** page and click "Add Asset".
2. You will be prompted to enter a Name, Serial Number, Cost, and assign it to one of the Categories you created in Step 1.
3. Upon creation, the asset will default to the `AVAILABLE` status.

### Step 3: Asset Assignment (Allocations Page)
Assets don't just sit in a warehouse; they are given to employees.
1. Navigate to the **Allocations** page.
2. Select an `AVAILABLE` asset from Step 2, and assign it to an Employee from Step 1.
3. The asset's status automatically shifts to `IN_USE`.
4. If an employee leaves the company, you can "Return" the asset, logging the return date and resetting its status back to `AVAILABLE`.

### Step 4: Ticketing & Repairs (Maintenance Page)
When an `IN_USE` asset breaks down, users can log a ticket.
1. Navigate to the **Maintenance** page and click "Raise Request".
2. Select the broken asset and describe the issue (e.g., "Screen flickering").
3. The asset status immediately flips to `MAINTENANCE`, preventing it from being assigned to anyone else.
4. An Admin or IT technician can review the ticket and mark it as `RESOLVED`, putting the asset back into circulation.

### Step 5: Physical Verification (Audit Page)
Once a quarter, companies must physically verify their inventory.
1. Navigate to the **Audit** page and click "New Audit Cycle".
2. The system takes a "snapshot" of all current assets and creates a checklist.
3. An assigned Auditor walks the floor and updates each asset's dropdown status: `VERIFIED`, `MISSING`, or `DAMAGED`.
4. Once the cycle is "Locked/Closed", the results become a permanent historical record.

### Step 6: Real-Time Analytics (Dashboard Home & Reports)
As you execute Steps 1-5, all data is aggregated in real-time.
- The **Dashboard** provides at-a-glance KPIs (Total Assets, Assets in Maintenance, Recent Activity Feed).
- The **Reports** page uses Recharts to visually break down asset distribution by category and maintenance frequency, allowing management to see where money is being spent.

##  Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (Local installation or a Cloud provider like Neon/Supabase)

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd odoo2
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the project. You must configure your Database URL and NextAuth secret.

```env
# Database Connection
# If using Local Postgres:
DATABASE_URL="postgresql://postgres:your_password@127.0.0.1:5432/odoo2"

# If using Neon Serverless Postgres (Add connect_timeout to prevent cold-start crashes):
# DATABASE_URL="postgresql://user:password@ep-your-db.neon.tech/neondb?sslmode=require&connect_timeout=30"

# NextAuth Configuration
# Generate a secret by running `npx auth secret` in your terminal
AUTH_SECRET="your_generated_secret_here"
```

*Note: If your local Postgres password contains special characters (like `@`), you must URL-encode them (e.g., `%40`).*

### 4. Initialize the Database
Push the Prisma schema to your database to create the necessary tables.
```bash
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. 

### 6. First Login
Click **Sign Up** and create an account. Because the database is empty, the system will automatically grant your new account full `ADMIN` privileges.

##  Database Management
To view your data directly via a web UI without needing pgAdmin, run Prisma Studio:
```bash
npx prisma studio
```
This will open `http://localhost:5555` where you can manually inspect, edit, or delete any record in the database.

##  Known Quirks
- **Hydration Warnings:** If you use Chrome extensions like ColorZilla or Grammarly, Next.js may log a hydration warning (`cz-shortcut-listen`). This is suppressed in `app/layout.tsx` but may still appear in strict dev mode.
- **Database Sleep (Neon Free Tier):** If you are using Neon's free tier, the database sleeps after 5 minutes of inactivity. When you wake it up, you might see a "Waking up Database..." screen. This is normal and handled safely by `error.tsx`. Just click "Retry Connection". Local databases do not have this issue.
