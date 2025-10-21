# Google Apps Script Webhook for Leaderboard

Use this if Google Forms submissions are unreliable from GitHub Pages. This creates a simple webhook that writes to a Google Sheet.

## 1) Create Sheet
- Create a new Google Sheet named "QA Game Leaderboard".
- Add a header row: Name, Email, Issues Found, Time Remaining, Total Score, Completion Time (ms), Timestamp, User Agent, IP (optional)

## 2) Create Apps Script
- In the Sheet: Extensions -> Apps Script
- Replace code with:
```javascript
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName('Sheet1') || SpreadsheetApp.getActiveSheet();
    sheet.appendRow([
      e.parameter.name || '',
      e.parameter.email || '',
      e.parameter.phone || '',
      e.parameter.issuesFound || '',
      e.parameter.timeRemaining || '',
      e.parameter.totalScore || '',
      e.parameter.completionTimeMs || '',
      e.parameter.timestamp || '',
      e.parameter.ua || '',
      e.parameter.ip || '',
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3) Deploy as Web App
- Deploy -> New deployment -> Type: Web app
- Description: Leaderboard webhook
- Execute as: Me
- Who has access: Anyone
- Copy the Web app URL (ends with /exec)

## 4) Configure the game
- Open `index.html` and add before your scripts:
```html
<script>
  window.LEADERBOARD_WEBAPP_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';
</script>
```

## 5) Test
- Play once, finish game, then check the Sheet for a new row.
- If you don’t see data, check: Deployment access set to Anyone, URL copied is the /exec URL, no adblock/cors issues in console.

## Notes
- This does not expose your sheet ID publicly; only the web app URL.
- You can add basic origin checks in Apps Script if desired.
