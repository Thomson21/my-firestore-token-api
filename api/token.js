import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
  const clientEmail = process.env.CLIENT_EMAIL;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  try {
    const jwtToken = jwt.sign(payload, privateKey, { algorithm: "RS256" });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      res.status(200).json({ access_token: data.access_token });
    } else {
      res.status(500).json({ error: data });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
