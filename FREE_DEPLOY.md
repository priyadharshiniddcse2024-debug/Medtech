# 🚀 Free Deployment Guide

Deploy your app completely FREE in 10 minutes!

## Step 1: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `cd backend && pip install -r requirements.txt && python setup.py`
   - Start Command: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
   - Plan: Free
5. Add Environment Variables:
   - `SECRET_KEY`: (auto-generate)
   - `FLASK_ENV`: production
6. Deploy and copy your backend URL

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Vite
   - Root Directory: frontend
5. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL
6. Deploy

## Done! 🎉

Your app is now live and free!

**Keep Backend Awake (Optional):**
Use [uptimerobot.com](https://uptimerobot.com) to ping your backend every 5 minutes.
