1. Initialize the Project
bash
# Navigate to backend folder
cd "d:\Employee-monitoring  24-02-2026\employeeMonitoringbackend"
# Initialize npm with TypeScript support
npm init -y
npm install express prisma @prisma/client
npm install bcryptjs jsonwebtoken zod cors helmet morgan winston express-rate-limit multer socket.io nodemailer
npm install cloudinary speakeasy qrcode csv-writer exceljs
# Dev dependencies
npm install -D typescript ts-node tsx nodemon @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/multer @types/nodemailer @types/morgan
2. TypeScript Configuration
Create tsconfig.json:

json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
3. Package Scripts
Add to 
package.json
:

json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  }
}
4. Database Setup
4.1 Create MySQL Database
sql
CREATE DATABASE ems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ems_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ems_db.* TO 'ems_user'@'localhost';
FLUSH PRIVILEGES;
4.2 Initialize Prisma
bash
npx prisma init
This creates prisma/schema.prisma. Copy the full schema from 
schema.prisma
 artifact.

4.3 Run Migrations
bash
npm run db:migrate
# Prompt: enter migration name, e.g. "init"
npm run db:generate
4.4 Seed Initial Data
bash
npm run db:seed
The seed script creates:

1 Company: Shoppeal Tech Private Limited
1 Admin user: jane@shoppeal.tech / Admin@123
3 Departments: Engineering, Sales, Operations
5 Sample employees
Default CompanySettings
Sample AlertConfig for all 5 alert types
5. Environment Setup
Create .env file in the backend root:

env
DATABASE_URL="mysql://ems_user:your_password@localhost:3306/ems_db"
JWT_SECRET="super-secret-min-32-chars-here-abc"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="refresh-secret-min-32-chars-here"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="EMS System <noreply@ems.app>"
ENCRYPTION_KEY="32-char-key-for-aes-abc123456789"
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
6. Frontend Connection
Update the frontend's API base URL. In employeeMonitoringfrontend, verify or create a config:

js
// src/config/api.js  (or wherever axios is configured)
export const API_BASE_URL = 'http://localhost:5000/api/v1';
The frontend currently uses mock data only (src/data/mockData.js + 
RealTimeContext.jsx
). The integration strategy is:

Keep RealTimeContext as the state manager
Replace InitialData imports with useEffect API calls using fetch/axios
Replace action handlers (addEmployee, deleteEmployee, etc.) with API mutations
A suggested API client setup in the frontend:

js
// src/utils/apiClient.js
const BASE = 'http://localhost:5000/api/v1';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`
});
export const api = {
  get: (path) => fetch(BASE + path, { headers: getHeaders() }).then(r => r.json()),
  post: (path, data) => fetch(BASE + path, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  patch: (path, data) => fetch(BASE + path, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
  delete: (path) => fetch(BASE + path, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
};
7. Running the Application
Development
bash
# Terminal 1 — Backend
cd "d:\Employee-monitoring  24-02-2026\employeeMonitoringbackend"
npm run dev
# → Server starts at http://localhost:5000
# Terminal 2 — Frontend (already running)
cd "d:\Employee-monitoring  24-02-2026\employeeMonitoringfrontend"
npm run dev
# → Vite starts at http://localhost:5173
Testing the API
Use Bruno, Postman, or httpie:

bash
# Health check
curl http://localhost:5000/health
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@shoppeal.tech","password":"Admin@123"}'
# Get employees (with token)
curl http://localhost:5000/api/v1/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
8. Production Deployment
8.1 Build
bash
npm run build
# Output: dist/ folder
8.2 Environment
Set NODE_ENV=production
Use a secrets manager (AWS Secrets Manager, Railway env vars, etc.)
Never commit .env to version control
8.3 Database
Use a managed MySQL (PlanetScale, AWS RDS, Railway)
Run npx prisma migrate deploy (not migrate dev) in production
8.4 Process Management
bash
npm install -g pm2
pm2 start dist/server.js --name ems-api
pm2 save
pm2 startup
8.5 CORS in Production
Update FRONTEND_URL env var to your production frontend domain.

8.6 File Storage
Screenshots must go to Cloudinary or S3 in production
Local disk storage is only acceptable in development
8.7 GDPR Data Purge (Cron Job)
Add a cron job (or use a scheduler like node-cron) to run nightly:

ts
// Purge screenshots and location logs older than dataRetentionDays
cron.schedule('0 2 * * *', async () => {
  const settings = await prisma.companySettings.findMany();
  for (const s of settings) {
    const cutoff = new Date(Date.now() - s.dataRetentionDays * 86400000);
    await prisma.screenshot.updateMany({
      where: { employee: { companyId: s.companyId }, createdAt: { lt: cutoff } },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    await prisma.locationLog.deleteMany({
      where: { employee: { companyId: s.companyId }, createdAt: { lt: cutoff } }
    });
  }
});
9. Quick Reference
Task	Command
Start dev server	npm run dev
Create new migration	npm run db:migrate
Open DB GUI	npm run db:studio
Seed database	npm run db:seed
Build production	npm run build
Reset database	npm run db:reset ⚠️ Destroys all data
