---
description: How to set up and run the OfficeAIM LMS project locally
---

# 🚀 Getting Started with OfficeAIM LMS

This guide will walk you through setting up and running the OfficeAIM Learning Management System locally.

## 📋 Prerequisites

Before you begin, make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **Supabase Account** (free tier is fine) - [Sign up here](https://supabase.com/)

## 🏗️ Project Structure

```
OfficeAIM Antigravity landing page/
├── hub/                    # React + Vite SaaS Application
│   ├── src/
│   │   ├── pages/         # Dashboard, Classroom, Login, etc.
│   │   ├── lib/           # Supabase client
│   │   └── App.jsx        # Main app component
│   ├── package.json
│   └── .env               # Environment variables (Supabase keys)
├── Module 1 for antigravity/  # Course content
├── N8N workflows/         # Automation workflows
├── index.html             # Landing page
└── README.md
```

## 🔧 Step 1: Install Dependencies

Navigate to the hub directory and install all required packages:

```bash
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/hub"
npm install
```

This will install:
- React 19
- Vite (build tool)
- Supabase JS client
- TailwindCSS
- React Router
- Framer Motion (animations)
- Lucide React (icons)

## 🔑 Step 2: Configure Supabase

### 2.1 Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com/) and log in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2.2 Create Environment File

Create a `.env` file in the `hub/` directory:

```bash
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/hub"
touch .env
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important:** Never commit the `.env` file to Git! It's already in `.gitignore`.

## 🗄️ Step 3: Set Up Database Schema

You'll need to create the following tables in Supabase:

### Tables to Create:
1. **users** - Student/admin profiles (extends Supabase auth)
2. **modules** - Course modules (e.g., Module 1: Demystifying AI)
3. **lessons** - Individual lessons within modules
4. **quiz_questions** - Multiple choice questions
5. **student_progress** - Track lesson completion
6. **quiz_attempts** - Store quiz results

**Note:** We'll create SQL migration scripts for this in the implementation phase.

## 🚀 Step 4: Run the Development Server

// turbo
Start the Vite development server:

```bash
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/hub"
npm run dev
```

The app will be available at: **http://localhost:5173**

## 🌐 Step 5: View the Landing Page

The static landing page can be opened directly:

```bash
open "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/index.html"
```

Or serve it with a simple HTTP server:

```bash
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page"
python3 -m http.server 8000
```

Then visit: **http://localhost:8000**

## 🔄 Step 6: Set Up n8n (Optional - For Automation)

### 6.1 Install n8n

You can run n8n locally or use their cloud version:

**Option A: Local Installation (Docker)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: npm Installation**
```bash
npm install -g n8n
n8n start
```

**Option C: Use n8n Cloud**
Sign up at [n8n.io](https://n8n.io/)

### 6.2 Access n8n

Once running, access n8n at: **http://localhost:5678**

### 6.3 Import Workflows

We have 98 pre-built workflows in the `N8N workflows/` folder. To import:

1. Open n8n interface
2. Click **"Workflows"** → **"Import from File"**
3. Select a workflow JSON file from `/N8N workflows/`
4. Configure credentials (Supabase, email, etc.)
5. Activate the workflow

## 🧪 Step 7: Test the Application

### Test Login
1. Go to http://localhost:5173
2. Click "Login"
3. Create a test account via Supabase Auth

### Test Dashboard
1. After login, you should see the Student Dashboard
2. Check that your profile loads correctly

### Test Course Access
1. Navigate to "Classroom" or "Courses"
2. Verify Module 1 content displays

## 📝 Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection fails
**Solution:** 
1. Check your `.env` file has correct credentials
2. Verify Supabase project is active
3. Check browser console for specific errors

### Issue: Port 5173 already in use
**Solution:** Kill the process or use a different port:
```bash
npm run dev -- --port 3000
```

### Issue: Hot reload not working
**Solution:** Restart the dev server:
```bash
# Press Ctrl+C to stop, then:
npm run dev
```

## 📚 Next Steps

Once your local environment is running:

1. ✅ **Review the Module 1 content** in `/Module 1 for antigravity/`
2. ✅ **Set up database schema** for courses and progress tracking
3. ✅ **Build the Lesson Viewer** component
4. ✅ **Implement quiz functionality** with instant feedback
5. ✅ **Add progress tracking** system
6. ✅ **Configure n8n workflows** for automation

## 🔗 Useful Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [n8n Documentation](https://docs.n8n.io/)

---

**Need help?** Check the conversation history or ask Antigravity!
