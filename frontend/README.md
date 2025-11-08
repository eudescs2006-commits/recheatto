# Recheatto Frontend (React + Vite)

## Setup
- Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend URL (ex: https://recheatto.up.railway.app)
- Install dependencies:
  ```
  npm install
  npm run dev
  ```

## Features
- Cardápio, checkout, order tracking (Socket.IO) and admin interface.
- Admin can upload product images (multipart/form-data) — backend must accept it.
- Floating WhatsApp button: edit phone in `src/App.jsx` or pass as env var.

## Notes
- The frontend expects endpoints under `/api/*` (same as backend package provided earlier).
- To enable image upload, backend needs a file handler (e.g., multer) to receive `multipart/form-data` at `/api/admin/products` and store images (local or cloud).
