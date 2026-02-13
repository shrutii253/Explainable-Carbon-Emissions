# Deployment Guide

## Backend (Render)

1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`
5. Add environment variable:
   - Key: `FRONTEND_URL`
   - Value: `https://your-app.vercel.app`
6. Click "Create Web Service"
7. Copy your backend URL (e.g., `https://carbon-emission-api.onrender.com`)

## Frontend (Vercel)

1. Update `frontend/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel --prod
   ```

3. Or connect GitHub repo at https://vercel.com/new

## Notes

- Backend: Free tier (spins down after 15min inactivity)
- Frontend: Free tier (always on)
- First backend request takes ~30s (model training)
