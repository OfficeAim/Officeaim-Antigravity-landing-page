# 📋 Google Form Setup Guide - OfficeAim Waiting List

**Form URL:** https://docs.google.com/forms/d/e/1FAIpQLSfU9WOXw1BOpMwE9HO-rtSiIjju0nZrtlu_m-1dQICDH2IceQ/viewform

---

## 🎯 Quick Setup (3 Questions - Recommended)

Copy and paste the exact text below into your Google Form editor.

---

### **QUESTION 1: Email Address**

**Question Title (copy this):**
```
What's your email address?
```

**Settings:**
- ✅ Required
- Field Type: **Short answer**
- **Add Response Validation:**
  1. Click the three dots (⋮) in bottom right of question
  2. Select "Response validation"
  3. Choose: **Text** → **Email**
  4. Error message: `Please enter a valid email address`

---

### **QUESTION 2: First Name**

**Question Title (copy this):**
```
What's your first name?
```

**Settings:**
- ✅ Required
- Field Type: **Short answer**
- No validation needed

---

### **QUESTION 3: Role/Audience Type**

**Question Title (copy this):**
```
What best describes you?
```

**Settings:**
- ✅ Required
- Field Type: **Multiple choice**

**Options (copy each line):**
```
Office Professional
Small Business Owner
Freelancer / Consultant
Student
Team Manager / Leader
Other
```

---

## 📝 Step-by-Step Instructions

### **Step 1: Open Form in Edit Mode**
1. Go to https://docs.google.com/forms/
2. Find "Join the OfficeAIM waitlist" in your forms list
3. Click on it to open in edit mode

### **Step 2: Update Question 1 (Email)**
1. Click on the first question (currently shows only `*`)
2. In the question field at the top, paste: `What's your email address?`
3. Make sure "Short answer" is selected
4. Check the "Required" toggle (should already be on)
5. Click the three dots (⋮) in the bottom right corner
6. Select "Response validation"
7. Set to: **Text** → **Email**
8. Optional: Add error text: `Please enter a valid email address`

### **Step 3: Update Question 2 (Name)**
1. Click on the second question (currently shows only `*`)
2. In the question field, paste: `What's your first name?`
3. Make sure "Short answer" is selected
4. Check the "Required" toggle

### **Step 4: Update Question 3 (Role)**
1. Click on the third question (currently shows only `*`)
2. In the question field, paste: `What best describes you?`
3. Make sure "Multiple choice" is selected
4. Replace the current options (Optie 1-5) with:
   - Click on "Optie 1" and replace with: `Office Professional`
   - Click on "Optie 2" and replace with: `Small Business Owner`
   - Click on "Optie 3" and replace with: `Freelancer / Consultant`
   - Click on "Optie 4" and replace with: `Student`
   - Click on "Optie 5" and replace with: `Team Manager / Leader`
   - Click "Add option" and add: `Other`
5. Check the "Required" toggle

### **Step 5: Update Form Settings**
1. Click the **Settings** gear icon (⚙️) at the top
2. Under **General**:
   - ✅ Collect email addresses (if you want backup email collection)
   - ✅ Limit to 1 response (prevents duplicate submissions)
3. Under **Presentation**:
   - Confirmation message: `Thank you for joining the OfficeAim waiting list! Check your email for next steps.`
   - ✅ Show progress bar (optional, good for user experience)

### **Step 6: Customize Confirmation Message**
1. Click **Settings** (⚙️)
2. Go to **Presentation** tab
3. In "Confirmation message" field, paste:
```
🎉 You're on the list!

Thank you for joining the OfficeAim waiting list. We'll send you the free AI Starter Kit and notify you when we launch.

Check your email (including spam folder) for your welcome message.

— The OfficeAim Team
```

### **Step 7: Test Your Form**
1. Click the **Preview** button (eye icon 👁️) at the top right
2. Fill out the form with test data
3. Submit and verify:
   - All questions display correctly
   - Email validation works
   - Confirmation message appears
4. Check your Google Sheets (if connected) to see the response

---

## 🎨 Optional: Customize Form Appearance

### **Add a Header Image**
1. Click **Customize theme** (palette icon 🎨) at the top
2. Click **Header** → **Choose image**
3. Upload a branded image (recommended size: 1600 x 400 px)
4. Use a dark-themed image to match your landing page aesthetic

### **Change Theme Colors**
1. Click **Customize theme** (🎨)
2. **Theme color**: Choose `#FF7A18` (OfficeAim orange) or `#22D3EE` (teal)
3. **Background color**: Keep default or choose a subtle dark gray
4. **Font style**: Choose "Modern" or "Formal"

---

## 📊 Optional: Connect to Google Sheets

1. Click the **Responses** tab at the top
2. Click the green Sheets icon
3. Choose "Create a new spreadsheet" or select existing
4. Name it: `OfficeAim Waiting List Responses`
5. Click **Create**

This will automatically log all responses to a spreadsheet for easy management.

---

## 🚀 After Setup: Next Steps

### **1. Test the Complete Flow**
- Open your landing page: `index.html`
- Click "Join the waiting list" button
- Verify it opens the Google Form
- Submit a test response
- Check confirmation message

### **2. Set Up Email Automation (Optional)**
Use a tool like:
- **Zapier** - Connect Google Forms → Email service (Mailchimp, ConvertKit)
- **Google Apps Script** - Auto-send welcome email on form submission
- **Make (Integromat)** - Automate workflows

### **3. Monitor Responses**
- Check Google Sheets daily for new signups
- Export data weekly for backup
- Segment by "What best describes you?" for targeted communications

---

## ✅ Final Checklist

Before going live, verify:
- [ ] All 3 questions have proper titles (no more `*` only)
- [ ] Email validation is enabled on Question 1
- [ ] All questions are marked as "Required"
- [ ] Multiple choice options are meaningful (no "Optie 1-5")
- [ ] Confirmation message is customized
- [ ] Form is set to "Limit to 1 response"
- [ ] Test submission works correctly
- [ ] Landing page link opens the form correctly

---

## 🎯 Why These Questions?

### **Email** (Question 1)
- Primary contact method
- Required for waiting list notifications
- Validated to prevent typos

### **First Name** (Question 2)
- Enables personalized emails ("Hi Sarah,")
- Builds connection with subscribers
- Short and easy to answer

### **Role** (Question 3)
- Segments your audience
- Helps tailor course content
- Identifies primary user personas
- Informs marketing messaging

**Data you'll collect:**
- Contact info (email + name)
- Audience composition (who's interested?)
- Market validation (are you reaching the right people?)

---

## 📈 Advanced: Optional Questions to Add Later

If you want deeper insights, add these **after** the first 3 questions:

### **Question 4: AI Experience Level** (Multiple choice, Optional)
```
How would you describe your experience with AI tools?
```
Options:
- Complete beginner (never used AI)
- Curious explorer (tried a few times)
- Regular user (use AI weekly)
- Power user (use AI daily)

### **Question 5: Biggest Challenge** (Paragraph, Optional)
```
What's your biggest challenge with using AI at work? (Optional)
```
- Helps identify pain points
- Shapes course content
- Provides testimonial material

### **Question 6: Referral Source** (Multiple choice, Optional)
```
How did you hear about OfficeAim?
```
Options:
- Instagram
- YouTube
- LinkedIn
- Facebook
- Friend/Colleague
- Google Search
- Other

---

## 🛠️ Troubleshooting

**Problem:** "I can't find the edit mode"
- **Solution:** Make sure you're logged into the Google account that created the form. The edit link is different from the public link.

**Problem:** "Email validation isn't working"
- **Solution:** Make sure you selected "Text" → "Email" (not "Regular expression")

**Problem:** "Form shows in Dutch"
- **Solution:** This is based on your Google account language. The form questions you enter will display in the language you type them.

**Problem:** "Responses aren't showing up"
- **Solution:** Click the "Responses" tab in the form editor. If you connected to Sheets, check the spreadsheet.

---

## 📞 Need Help?

If you run into issues:
1. Check Google Forms Help Center: https://support.google.com/docs/topic/9055404
2. Test in an incognito window to see the public view
3. Ask a colleague to test submit the form

---

**Last Updated:** February 12, 2026
**Form Link:** https://docs.google.com/forms/d/e/1FAIpQLSfU9WOXw1BOpMwE9HO-rtSiIjju0nZrtlu_m-1dQICDH2IceQ/viewform

---

✨ **Once you've updated the form, your OfficeAim landing page will be 100% ready to launch!**
