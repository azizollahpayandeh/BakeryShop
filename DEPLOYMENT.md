# Vercel Deployment Guide

## Changes Made for Vercel Compatibility

### 1. Database Migration
- **Removed**: SQLite3 database dependency
- **Added**: In-memory storage for serverless environment
- **Note**: Data will be lost on each deployment. For production, consider using:
  - Vercel Postgres
  - MongoDB Atlas
  - PlanetScale
  - Supabase

### 2. Session Management
- **Removed**: Express-session with memory store
- **Added**: JWT-like token authentication
- **Benefit**: Stateless authentication works in serverless

### 3. CORS Configuration
- **Updated**: Dynamic CORS origins for production
- **Supports**: Vercel domains and localhost for development

### 4. Server Configuration
- **Added**: `vercel.json` configuration file
- **Updated**: Server export for Vercel serverless functions

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new one
   - Confirm settings

4. **Update CORS** (if needed):
   - After deployment, update the CORS origins in `server.js` with your actual Vercel domain

## Environment Variables

Set these in your Vercel dashboard:
- `NODE_ENV=production`

## Important Notes

⚠️ **Data Persistence**: The current setup uses in-memory storage, which means:
- User registrations and orders will be lost when the serverless function restarts
- This is suitable for testing/demo purposes only

🔧 **For Production**: Consider implementing:
- Database integration (PostgreSQL, MongoDB, etc.)
- Proper session management
- Error monitoring (Sentry, etc.)
- Rate limiting

## Testing the Deployment

1. Visit your Vercel URL
2. Check that CSS styles are loading properly
3. Try registering a new user
4. Test login functionality
5. Create a test order
6. Navigate between different pages

## Static Files Fix

The CSS and JavaScript files should now load properly because:
- Added specific routes for static files in `server.js`
- Updated `vercel.json` to handle static file routing
- Added proper Content-Type headers for CSS, JS, and image files
- Added cache headers for better performance

## Troubleshooting

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify CORS settings match your domain
3. Ensure all dependencies are in `package.json`
4. Check that `vercel.json` is properly configured
