# Guia de Deploy: Vercel (Frontend) + Railway (Backend)

## Backend (Railway)
1. Crie conta em https://railway.app e crie um novo projeto.
2. No Railway, conecte o repositório (suba este repo para o GitHub primeiro) ou faça upload do código.
3. Configure um PostgreSQL (Railway Addon) e copie a `DATABASE_URL`.
4. Nas variáveis do projeto, adicione:
   - DATABASE_URL
   - MP_ACCESS_TOKEN
   - JWT_SECRET
   - BACK_URL (ex: https://sua-front.vercel.app)
   - PORT (opcional, ex: 4000)
5. Em "Deploy > Build" assegure que o comando de start seja `npm install && npm run prisma:generate && npm start`
6. Após deploy, rode as migrations (Railway -> Console):
   ```
   npx prisma generate
   npx prisma migrate deploy
   ```
7. Configure o webhook do Mercado Pago apontando para `https://SEU_BACKEND_URL/api/webhook/mercadopago`.

## Frontend (Vercel)
1. Crie conta no https://vercel.com e conecte este repositório.
2. Nas Environment Variables do projeto Frontend, adicione:
   - VITE_API_URL = https://SEU_BACKEND_URL
3. Configure o build command: `npm install && npm run build` e o output `build` (Vite).
4. Faça deploy. O site ficará disponível em `https://SEU_FRONT.vercel.app`.

## Observações
- O botão flutuante de WhatsApp já está configurado com o número: +55 21 973549289 (edite em frontend/src/App.jsx se precisar).
- Para habilitar upload de imagens no backend, adicione `multer` e um handler em `backend/src` (já documentado).
- Se preferir, posso automatizar a criação do repositório GitHub e conectar ao Railway/Vercel para você.
