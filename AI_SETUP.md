# AI Feature Setup Guide

## 🤖 Setting Up Anthropic Claude AI

The AI bullet rewrite feature requires an Anthropic API key. Here's how to set it up:

### Step 1: Get Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-...`)

### Step 2: Add to Your Project

1. **Create `.env.local` file** in the project root (same folder as `package.json`):
   ```bash
   touch .env.local
   ```

2. **Add your API key** to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. **Restart the development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Step 3: Test the Feature

1. Open the app at `http://localhost:3000`
2. Click **"AI: OFF"** to enable it (turns to **"✨ AI: ON"**)
3. Add some experience bullets
4. Click **"✨ Improve"** next to any bullet
5. You should see 2-3 AI-generated alternatives!

---

## 🚨 Troubleshooting

### Error: "API key not configured"

**Solution**: 
1. Make sure `.env.local` exists in the root folder
2. Check that the file contains: `ANTHROPIC_API_KEY=your_key_here`
3. **Restart the dev server** (`Ctrl+C`, then `npm run dev`)

### Error: "Invalid API key"

**Solution**:
1. Double-check your API key at [console.anthropic.com](https://console.anthropic.com/)
2. Make sure you copied the entire key (starts with `sk-ant-`)
3. No quotes needed around the key in `.env.local`

### Error: "Rate limit exceeded"

**Solution**:
- You've made too many requests too quickly
- Wait 1 minute and try again
- Check your usage at [console.anthropic.com](https://console.anthropic.com/)

### Still Getting 500 Error?

**Check the terminal/console** for detailed error messages:
```bash
# In your terminal where you ran `npm run dev`
# Look for error messages like:
AI rewrite error: [error details here]
```

**Common issues**:
- API key has no credits (add payment method)
- Network/firewall blocking the request
- API key was revoked or expired

---

## 💰 Pricing

Anthropic charges per API request:
- **Claude Sonnet 4**: ~$0.003 per bullet rewrite
- **Free tier**: $5 credit for new accounts
- **Example**: 1,000 rewrites ≈ $3

Check current pricing: [Anthropic Pricing](https://www.anthropic.com/pricing)

---

## 🔒 Security

- ✅ API key stored in `.env.local` (not committed to git)
- ✅ Only bullet text sent to Anthropic
- ✅ No personal data stored
- ✅ Requests go directly from your server to Anthropic

**Never commit `.env.local` to git!** It's already in `.gitignore`.

---

## 🌐 Deployment (Vercel)

When deploying to Vercel:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add: `ANTHROPIC_API_KEY` = `your_key_here`
4. Redeploy

**The app works without the API key!** AI features just won't be available.

---

## 📝 Using Without AI

The app is **fully functional without AI**:
- ✅ Resume editing works
- ✅ Import/Export works  
- ✅ DOCX/PDF export works
- ✅ ATS linting works
- ❌ Just no AI bullet rewriting

Simply leave **"AI: OFF"** and use the app offline!

---

## 🆘 Need Help?

1. Check the terminal for error messages
2. Verify `.env.local` file exists and has correct format
3. Restart the dev server after adding the key
4. Check [Anthropic Status](https://status.anthropic.com/) for outages

---

**Quick Reference**:
```bash
# .env.local file format
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# Restart server
Ctrl+C
npm run dev
```

