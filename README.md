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

## Dashboard Features and System Architecture

The application is architected around six core modules, designed to operate sequentially or independently depending on the organizational requirements. Below is a detailed technical overview of each module within the dashboard.

### 1. Organization Management
The foundation of the asset management system relies on establishing an organizational hierarchy.
- **Departments**: Hierarchical units representing teams or divisions. Departments can be nested (parent-child relationships).
- **Categories**: Enforces data integrity by classifying assets into strict types (e.g., Electronics, Vehicles, Furniture). Categories serve as the primary grouping mechanism for analytics.
- **Employees**: User profiles that are bound to specific departments. Assets and maintenance requests are directly tied to these employee records.

### 2. Asset Inventory (Procurement and Tracking)
The centralized registry for all physical hardware and resources.
- **Asset Creation**: When new hardware is procured, it is registered into the system. Required fields include the Asset Name, unique Asset Tag, Serial Number, Cost, and Category.
- **Lifecycle Status**: Newly created assets are automatically assigned the `AVAILABLE` status. The system utilizes Prisma Enums (`AssetStatus`) to strictly control state transitions (e.g., `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED`).
- **Data Integrity**: Duplicate serial numbers or asset tags are prevented at the database level.

### 3. Asset Allocation (Assignments and History)
Manages the distribution of hardware to the workforce.
- **Assignment**: Assets with the `AVAILABLE` status can be allocated to specific employees. Upon successful allocation, a record is generated in the `AssetAllocation` table, and the asset's state transitions to `IN_USE`.
- **Return Processing**: When an employee no longer requires the hardware, the allocation can be terminated. The asset is transitioned back to `AVAILABLE`, and a historical timestamp (`returnDate`) is recorded. This ensures a complete chain of custody for high-value items.

### 4. Maintenance and Ticketing
Handles the repair and service lifecycles of damaged or degraded assets.
- **Issue Reporting**: Employees or managers can submit maintenance requests against specific assets, detailing the issue and assigning a priority (`LOW`, `MEDIUM`, `HIGH`).
- **State Locking**: Creating a maintenance request instantly flips the asset's status to `MAINTENANCE`. This acts as a database-level lock, preventing the asset from being allocated to another user while it is broken.
- **Resolution**: IT technicians or administrators can resolve the ticket. Resolving a ticket unlocks the asset, reverting its status to `AVAILABLE` for future allocation.

### 5. Physical Auditing (Inventory Verification)
Facilitates periodic physical inventory checks (e.g., end-of-year audits).
- **Cycle Initialization**: Creating a new Audit Cycle takes a point-in-time snapshot of the entire asset inventory, generating a pending `AuditRecord` for every active asset.
- **Verification Workflow**: Designated auditors physically locate the hardware and update the corresponding record status (`VERIFIED`, `MISSING`, `DAMAGED`).
- **Data Preservation**: Once an audit cycle is closed, it is locked. The records become read-only, serving as immutable historical compliance data.

### 6. Analytics and Reporting
Aggregates operational data into actionable visualizations using Recharts.
- **Key Performance Indicators**: The primary dashboard surfaces real-time metrics including total asset count, maintenance volume, and active allocations.
- **Activity Feed**: A chronologically ordered log of recent system events (allocations, ticket creations, audit closures).
- **Categorical Breakdown**: Visual reports aggregate asset value and maintenance frequency by category, identifying cost centers and high-failure hardware types.

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
n
##  Known Quirks
- **Hydration Warnings:** If you use Chrome extensions like ColorZilla or Grammarly, Next.js may log a hydration warning (`cz-shortcut-listen`). This is suppressed in `app/layout.tsx` but may still appear in strict dev mode.
- **Database Sleep (Neon Free Tier):** If you are using Neon's free tier, the database sleeps after 5 minutes of inactivity. When you wake it up, you might see a "Waking up Database..." screen. This is normal and handled safely by `error.tsx`. Just click "Retry Connection". Local databases do not have this issue.