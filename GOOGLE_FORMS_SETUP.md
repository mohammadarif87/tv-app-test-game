# Google Forms Integration Setup Guide

This guide will help you set up Google Forms integration for collecting leaderboard data from your QA game.

## Step 1: Create a Google Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form with the title "QA Game Leaderboard Data"
3. Add the following fields in this exact order:

### Required Fields:
- **Name** (Short answer, required)
- **Email** (Short answer, required) 
- **Issues Found** (Short answer, required)
- **Time Remaining** (Short answer, required)
- **Total Score** (Short answer, required)

## Step 2: Get Form Submission URL

1. In your Google Form, click the **Send** button (top right)
2. Click the **</>** (embed) icon
3. Copy the form URL from the embed code - it will look like:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSfXXXXXXXXXXXXX/formResponse
   ```

## Step 3: Get Field Entry IDs

1. Open your form in edit mode
2. Right-click on each field and select "Inspect Element"
3. Look for the `name` attribute in the input field - it will be like `entry.1234567890`
4. Note down the entry IDs for each field:
   - Name: `entry.XXXXXXXXXX`
   - Email: `entry.XXXXXXXXXX`
   - Issues Found: `entry.XXXXXXXXXX`
   - Time Remaining: `entry.XXXXXXXXXX`
   - Total Score: `entry.XXXXXXXXXX`

## Step 4: Update the Code

In your `app.js` file, find the `submitToGoogleForms` function (around line 355) and update:

```javascript
function submitToGoogleForms(entry) {
  // Replace with your actual form URL
  const formUrl = 'https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/formResponse';
  const formData = new FormData();
  
  // Replace with your actual field IDs
  formData.append('entry.YOUR_NAME_FIELD_ID', entry.name);
  formData.append('entry.YOUR_EMAIL_FIELD_ID', entry.email);
  formData.append('entry.YOUR_ISSUES_FIELD_ID', entry.score);
  formData.append('entry.YOUR_TIME_FIELD_ID', entry.timeRemaining);
  formData.append('entry.YOUR_SCORE_FIELD_ID', entry.totalScore);
  
  // Submit to Google Forms
  fetch(formUrl, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  }).catch(() => {
    console.log('Google Forms submission failed (this is normal)');
  });
}
```

## Step 5: Test the Integration

1. Play the game and complete it
2. Check your Google Form responses to see if data is being submitted
3. The data will appear in your Google Form's "Responses" tab

## Alternative: Embedded Form Approach

If you prefer to use an embedded form instead of API submission:

1. In your Google Form, click **Send** → **</>** (embed)
2. Copy the embed code
3. Replace the user registration form in `renderLanding()` with the embedded form
4. Remove the `submitToGoogleForms` function calls

## Data Storage

The leaderboard also stores data locally in the browser's localStorage, so it will work even if Google Forms submission fails. The local leaderboard shows the top 50 scores and is sorted by total score (issues found + time remaining).

## Scoring System

- **Issues Found**: 0-10 points (based on correct identifications)
- **Time Remaining**: 0-60 points (seconds left when game ends)
- **Total Score**: Issues Found + Time Remaining (0-70 points maximum)

Higher scores indicate better performance (more issues found + more time remaining).

## Google Sheets URL

https://docs.google.com/spreadsheets/d/1msOoBfh_P-Z2_Pm6I8nVZGwfTvvscQF5SUgcft2h2GI/edit?usp=sharing