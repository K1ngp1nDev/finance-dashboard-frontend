# AI Finance Dashboard

Angular dashboard for a portfolio-ready finance reporting tool. It presents seeded cash-flow analytics, transaction operations, CSV import, responsive desktop/mobile reporting views, light/dark themes, charts, and an AI assistant backed by a NestJS API.

## Portfolio Value

This project demonstrates full-stack dashboard development: API-backed data flows, transaction analytics, charts, CSV import, JWT auth, AI-assisted categorization, and clean reporting UX.

## Stack

- **Angular 21** with standalone components, Signals, functional guards, and interceptors
- **Tailwind CSS** with class-based light/dark theme support
- **ApexCharts** via `ng-apexcharts` for category and monthly trend charts
- **NestJS API** for auth, transactions, analytics, CSV import, and AI demo mode

## Features

- Dashboard KPI cards for balance, income, expenses, and savings rate
- Monthly income vs expense trend chart
- Spending by category donut chart and category table
- Responsive dashboard layout for desktop, tablet, and mobile screenshots
- Recent transactions and largest expenses tables
- Transaction ledger with desktop table, mobile cards, category filter, and delete action
- Add transaction form with AI/demo category suggestion
- CSV import card for `date,description,amount` files
- AI assistant visible on the dashboard with sample prompts and keyless demo responses
- Persisted light/dark theme toggle for login, dashboard, AI assistant, and transactions
- JWT login flow with seeded demo credentials

## Screenshots

![Login light](docs/screenshots/login-light.png)

![Login dark](docs/screenshots/login-dark.png)

![Dashboard light](docs/screenshots/dashboard-light.png)

![Dashboard dark](docs/screenshots/dashboard-dark.png)

![Dashboard mobile light](docs/screenshots/dashboard-mobile-light.png)

![Dashboard mobile dark](docs/screenshots/dashboard-mobile-dark.png)

![AI assistant demo](docs/screenshots/ai-assistant-demo.png)

![Transactions light](docs/screenshots/transactions-light.png)

![Transactions dark](docs/screenshots/transactions-dark.png)

![Transactions mobile light](docs/screenshots/transactions-mobile-light.png)

![Transactions mobile dark](docs/screenshots/transactions-mobile-dark.png)

![CSV import and filters](docs/screenshots/csv-import-and-filters.png)

## Demo Credentials

- Email: `demo@example.com`
- Password: `demo12345`

## Setup

Start the backend first. It should be available at `http://localhost:3001/api`.

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

The frontend API URL is configured in `src/environments/environment.ts`:

```ts
apiUrl: 'http://localhost:3001/api'
```

## Backend

Pairs with [finance-dashboard-api](https://github.com/K1ngp1nDev/finance-dashboard-api) (NestJS 11, PostgreSQL, Prisma, JWT, Swagger, AI demo mode).

## Production Demo Run

For a future live demo, run the frontend as a static production build rather than the Angular dev server:

```bash
npm install
npm run build
npx serve dist/finance-dashboard-frontend/browser
```

Run the backend with `AI_DEMO_MODE=true`, apply migrations, seed the demo database, then start the production server:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
AI_DEMO_MODE=true npm run start:prod
```

The demo UI intentionally avoids contact details, external hire CTAs, Telegram, LinkedIn, or personal email links.
