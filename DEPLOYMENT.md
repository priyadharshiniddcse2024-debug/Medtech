# Deployment Guide - Maternal Health Monitoring System

## Quick Start (Development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run setup script:**
   ```bash
   python setup.py
   ```

4. **Start the Flask server:**
   ```bash
   python app.py
   ```
   
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Production Deployment

### Backend (Flask API)

#### Option 1: Using Gunicorn (Recommended)

1. **Install Gunicorn:**
   ```bash
   pip install gunicorn
   ```

2. **Create Gunicorn configuration:**
   ```bash
   # gunicorn.conf.py
   bind = "0.0.0.0:5000"
   workers = 4
   worker_class = "sync"
   timeout = 120
   keepalive = 2
   max_requests = 1000
   max_requests_jitter = 100
   ```

3. **Start with Gunicorn:**
   ```bash
   gunicorn --config gunicorn.conf.py app:app
   ```

#### Option 2: Using Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   
   COPY . .
   RUN python setup.py
   
   EXPOSE 5000
   CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
   ```

2. **Build and run:**
   ```bash
   docker build -t maternal-health-backend .
   docker run -p 5000:5000 maternal-health-backend
   ```

### Frontend (React App)

#### Option 1: Static Hosting (Netlify, Vercel)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to your hosting service**

3. **Configure environment variables:**
   - Set `VITE_API_URL` to your backend URL

#### Option 2: Using Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine as build
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf:**
   ```nginx
   events {
       worker_connections 1024;
   }
   
   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;
       
       server {
           listen 80;
           server_name localhost;
           
           location / {
               root /usr/share/nginx/html;
               index index.html index.htm;
               try_files $uri $uri/ /index.html;
           }
           
           location /api {
               proxy_pass http://backend:5000;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
           }
       }
   }
   ```

## Cloud Deployment Options

### AWS Deployment

#### Backend (Elastic Beanstalk)

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize and deploy:**
   ```bash
   eb init
   eb create maternal-health-api
   eb deploy
   ```

#### Frontend (S3 + CloudFront)

1. **Build and upload to S3:**
   ```bash
   npm run build
   aws s3 sync dist/ s3://your-bucket-name
   ```

2. **Configure CloudFront distribution**

### Google Cloud Platform

#### Backend (Cloud Run)

1. **Create cloudbuild.yaml:**
   ```yaml
   steps:
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-t', 'gcr.io/$PROJECT_ID/maternal-health-backend', '.']
   - name: 'gcr.io/cloud-builders/docker'
     args: ['push', 'gcr.io/$PROJECT_ID/maternal-health-backend']
   - name: 'gcr.io/cloud-builders/gcloud'
     args: ['run', 'deploy', 'maternal-health-api', '--image', 'gcr.io/$PROJECT_ID/maternal-health-backend', '--region', 'us-central1', '--allow-unauthenticated']
   ```

2. **Deploy:**
   ```bash
   gcloud builds submit
   ```

#### Frontend (Firebase Hosting)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize and deploy:**
   ```bash
   firebase init hosting
   npm run build
   firebase deploy
   ```

### Heroku Deployment

#### Backend

1. **Create Procfile:**
   ```
   web: gunicorn app:app
   ```

2. **Deploy:**
   ```bash
   heroku create maternal-health-api
   git push heroku main
   ```

#### Frontend

1. **Create static.json:**
   ```json
   {
     "root": "dist/",
     "routes": {
       "/**": "index.html"
     }
   }
   ```

2. **Add buildpack and deploy:**
   ```bash
   heroku create maternal-health-app
   heroku buildpacks:set heroku/nodejs
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static
   git push heroku main
   ```

## Environment Configuration

### Backend Environment Variables

```bash
# .env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///maternal_health.db
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend Environment Variables

```bash
# .env
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=MaternalCare AI
```

## Database Setup

### SQLite (Development)
- Automatically created by the application
- File: `maternal_health.db`

### PostgreSQL (Production)

1. **Install psycopg2:**
   ```bash
   pip install psycopg2-binary
   ```

2. **Update database configuration in app.py:**
   ```python
   import os
   DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///maternal_health.db')
   ```

### Firebase (Alternative)

1. **Install Firebase Admin SDK:**
   ```bash
   pip install firebase-admin
   ```

2. **Configure Firebase in app.py**

## Security Considerations

### Backend Security

1. **Use HTTPS in production**
2. **Set secure JWT secret key**
3. **Configure CORS properly**
4. **Use environment variables for secrets**
5. **Implement rate limiting**
6. **Add input validation and sanitization**

### Frontend Security

1. **Use HTTPS**
2. **Implement Content Security Policy**
3. **Sanitize user inputs**
4. **Store tokens securely**

## Monitoring and Logging

### Backend Monitoring

1. **Add logging configuration:**
   ```python
   import logging
   logging.basicConfig(level=logging.INFO)
   ```

2. **Use monitoring services:**
   - AWS CloudWatch
   - Google Cloud Monitoring
   - Heroku Metrics

### Frontend Monitoring

1. **Add error tracking:**
   - Sentry
   - LogRocket
   - Bugsnag

## Performance Optimization

### Backend

1. **Database indexing**
2. **Caching with Redis**
3. **API response compression**
4. **Connection pooling**

### Frontend

1. **Code splitting**
2. **Image optimization**
3. **CDN for static assets**
4. **Service worker for caching**

## Backup and Recovery

### Database Backup

```bash
# SQLite backup
cp maternal_health.db backup_$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Automated Backups

Set up automated backups using:
- AWS RDS automated backups
- Google Cloud SQL backups
- Heroku Postgres backups

## Troubleshooting

### Common Issues

1. **CORS errors:** Check backend CORS configuration
2. **Database connection:** Verify database URL and credentials
3. **ML model loading:** Ensure model files are present
4. **Build failures:** Check Node.js and Python versions

### Debug Mode

Enable debug mode for development:

```python
# Backend
app.run(debug=True)
```

```bash
# Frontend
npm run dev
```

## Support and Maintenance

### Regular Updates

1. **Update dependencies monthly**
2. **Monitor security vulnerabilities**
3. **Update ML model with new data**
4. **Review and update medical guidelines**

### Health Checks

Implement health check endpoints:

```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow()}
```