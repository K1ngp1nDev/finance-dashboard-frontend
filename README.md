# Finance Dashboard

AI-powered personal finance tracker built with Angular 21. Add transactions, visualize spending by category and month, and ask questions about your finances in plain English.

## Stack

- **Angular 21** — standalone components, Signals, functional guards and interceptors
- **Tailwind CSS**
- **ApexCharts** via `ng-apexcharts` — donut and bar charts
- **Anthropic Claude** — AI assistant powered by NestJS backend

## Features

- Add transactions — description, amount, date, category
- AI auto-categorization: focus leaves the description field → Claude suggests a category
- Dashboard with donut chart (by category) and bar chart (monthly trends)
- AI chat sidebar — ask "how much on food this month?" and get a direct answer
- JWT auth with token stored in localStorage and injected via HTTP interceptor
- Lazy-loaded routes — each feature is a separate chunk

## Angular patterns

- `signal()` / `computed()` / `effect()` for reactive state — no BehaviorSubject
- Standalone components, no NgModules
- `inject()` over constructor injection in services
- `CanActivateFn` functional guard
- `HttpInterceptorFn` functional interceptor

## Getting started

```bash
npm install
# Edit src/environments/environment.ts — set apiUrl to your NestJS backend
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Backend

Pairs with [finance-dashboard-api](https://github.com/K1ngp1nDev/finance-dashboard-api) (NestJS 11).
