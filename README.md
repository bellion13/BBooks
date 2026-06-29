# BBooks

BBooks là dự án web bán sách full-stack gồm React + Vite + TypeScript ở frontend và Node.js + Express + Prisma + PostgreSQL ở backend.

## Cấu trúc

- `frontend/`: giao diện người dùng React.
- `backend/`: REST API Express và Prisma schema.
- `docker-compose.yml`: PostgreSQL local cho phát triển.
- `ke-hoach-web-ban-sach.txt`: tài liệu kế hoạch/UI/API/schema chi tiết.

## Chạy local

```bash
npm install
npm run db:up
npm run dev:backend
npm run dev:frontend
```

Frontend mặc định chạy ở `http://localhost:5173`.
Backend mặc định chạy ở `http://localhost:4000`.

## Database

File cấu hình local nằm ở `backend/.env`.
Sau khi PostgreSQL chạy, dùng:

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```
