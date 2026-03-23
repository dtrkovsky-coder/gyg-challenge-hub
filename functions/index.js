const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// Runs every Monday at 7:00 AM AEST (Sunday 8:00 PM UTC)
exports.sendWeeklyReminders = functions.pubsub
  .schedule("0 20 * * 0")  // 8PM UTC Sunday = 7AM AEST Monday
  .timeZone("Australia/Sydney")
  .onRun(async (context) => {
    try {
      const usersSnap = await db.collection("users").get();
      const compsSnap = await db.collection("completions").get();
      
      const completions = [];
      compsSnap.forEach(d => completions.push(d.data()));
      
      const users = [];
      usersSnap.forEach(d => users.push(d.data()));
      
      // Get Resend API key from environment
      const resendKey = functions.config().resend?.key;
      if (!resendKey) {
        console.log("No Resend API key configured. Run: firebase functions:config:set resend.key=YOUR_KEY");
        return null;
      }
      
      for (const user of users) {
        if (user.isAdmin || !user.email || user.email.length < 3) continue;
        
        // Calculate user's current week
        const created = new Date(user.createdAt);
        const now = new Date();
        const daysSince = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        const currentWeek = Math.min(Math.floor(daysSince / 7) + 1, 4);
        
        // Count their completions
        const userComps = completions.filter(c => c.userId === user.id);
        const doneCount = userComps.length;
        
        // Only send if they have incomplete challenges
        if (doneCount >= 4) continue; // All done
        if (doneCount >= currentWeek) continue; // Up to date
        
        const weekLabel = currentWeek > doneCount ? `Week ${doneCount + 1}` : `Week ${currentWeek}`;
        
        // Send email via Resend
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: "GYG Challenge Hub <challenges@gyg.com.au>",
            to: user.email,
            subject: `${weekLabel} Challenge is waiting for you!`,
            html: `
              <div style="font-family:Helvetica,Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
                <div style="background:#000;padding:20px;border-radius:12px;text-align:center">
                  <h1 style="color:#FFD300;margin:0;font-size:24px;letter-spacing:2px">CHALLENGE HUB</h1>
                  <p style="color:#fff;margin:8px 0 0">GUZMAN Y GOMEZ</p>
                </div>
                <div style="padding:20px 0">
                  <h2>Hola, ${user.name.split(" ")[0]}!</h2>
                  <p>Your <strong>${weekLabel} challenge</strong> is ready and waiting.</p>
                  <p>You've completed <strong>${doneCount} of ${currentWeek}</strong> available challenges so far.</p>
                  <div style="text-align:center;margin:24px 0">
                    <a href="https://gyg-challenge-hub.web.app" style="background:#FFD300;color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;letter-spacing:1px">OPEN CHALLENGE HUB</a>
                  </div>
                  <p style="color:#888;font-size:12px">Keep pushing - your team is counting on you!</p>
                </div>
              </div>
            `
          })
        });
        
        console.log(`Email sent to ${user.email} (Week ${currentWeek}, ${doneCount} done)`);
      }
      
      console.log(`Weekly reminders sent to ${users.length} users`);
      return null;
    } catch (error) {
      console.error("Error sending reminders:", error);
      return null;
    }
  });

// Send push notification to all users (callable by admin)
exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  const { title, body } = data;
  
  const tokensSnap = await db.collection("pushTokens").get();
  const tokens = [];
  tokensSnap.forEach(d => tokens.push(d.data().token));
  
  if (tokens.length === 0) return { sent: 0 };
  
  const message = {
    notification: { title, body },
    tokens
  };
  
  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed`);
    return { sent: response.successCount };
  } catch (error) {
    console.error("Push error:", error);
    return { sent: 0, error: error.message };
  }
});
