// Vercel Serverless Function for CIVANTA Police AI Desk
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const message = (body.message || '').trim();
    const history = body.history || [];
    const language = body.language || 'en';

    if (!message) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const isKn = language === 'kn' || /[\u0C80-\u0CFF]/.test(message);

    // If Gemini API Key is available on Vercel Environment Variables
    if (apiKey && apiKey.trim() !== '') {
      try {
        const systemInstruction = `You are 'CIVANTA Sahāyaka' (ಸಿವಾಂತ ಸಹಾಯಕ), the official AI Grievance Assistant for Karnataka State Police (KSP).
Your mission is to assist citizens, complainants, and police personnel politely, factually, and accurately.

KNOWLEDGE BASE & POLICE PROCEDURES:
1. 5 STATUTORY GRIEVANCE CATEGORIES:
   - Cybercrime: UPI fraud, SIM swap, phishing, social media hacking, ransomware, fake accounts.
   - Financial Fraud: bogus trading groups, loan app harassment, Ponzi schemes, counterfeit currency.
   - Lost Property: lost mobile phones (CEIR tracking), laptops, bags, original certificates, passports.
   - Traffic & Public Safety: dangerous overspeeding, hit-and-run, road encroachments, signal defects.
   - Complaints Involving Individuals: landlord/tenant disputes, workplace harassment (POSH), neighbor disputes, stalking.
2. STATUTORY RESOLUTION SLA RULES:
   - 24 Hours: Investigating officer must acknowledge and log mandatory next action.
   - 3 Days Overdue: Automated escalation to Supervisory Command (DySP console).
   - 7 Days Overdue: Critical Red Flag alert elevated on Supervisory Command console.
3. EMERGENCY & HELPLINE NUMBERS:
   - All Emergency Services (Police / Fire / Ambulance): Dial 112
   - National Cyber Crime Helpline: Dial 1930 (or visit cybercrime.gov.in)
   - Women Helpline: 1091 / 112
   - Child Helpline: 1098
4. CORE STATUTORY PILOT DIRECTIVE:
   - Strictly informational assistant for grievance tracking and procedural navigation.
   - NEVER determine criminal guilt, judge allegations, register offences, or issue FIRs.
   - Always ensure every response carries the statutory reminder: '[Suggested. Officer must confirm.]'.
5. BILINGUAL SUPPORT:
   - If user interacts in Kannada, respond in natural, polite Kannada.
   - If user interacts in English, respond in professional administrative English.`;

        const contents = [];
        for (const h of history.slice(-6)) {
          contents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        // Verified working models for user's key:
        const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        let geminiReply = null;

        for (const model of models) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents,
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 600
                }
              })
            });

            if (response.ok) {
              const data = await response.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                geminiReply = text.trim();
                if (!geminiReply.includes('[Suggested. Officer must confirm.]') && !geminiReply.includes('[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]')) {
                  geminiReply += isKn ? '\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]' : '\n\n[Suggested. Officer must confirm.]';
                }
                break;
              }
            } else {
              const errBody = await response.text();
              console.warn(`Model ${model} returned ${response.status}:`, errBody);
            }
          } catch (modelErr) {
            console.warn(`Model ${model} fetch failed:`, modelErr);
          }
        }

        if (geminiReply) {
          return res.status(200).json({
            reply: geminiReply,
            disclaimer: 'Suggested. Officer must confirm.'
          });
        }
      } catch (geminiErr) {
        console.error('Gemini error on Vercel:', geminiErr);
      }
    }

    // Dynamic Rule-Based Fallback
    const m = message.toLowerCase();
    let fallbackReply = '';

    if (m.includes('1930') || m.includes('cyber') || m.includes('upi') || m.includes('fraud') || m.includes('phish') || m.includes('otp') || m.includes('hack') || m.includes('ಸೈಬರ್') || m.includes('ವಂಚನೆ')) {
      fallbackReply = isKn
        ? "ಆನ್‌ಲೈನ್ ಹಣಕಾಸು ಅಥವಾ ಸೈಬರ್ ವಂಚನೆ ನಡೆದ ತಕ್ಷಣ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು ಮತ್ತು ವಹಿವಾಟು ಐಡಿಗಳನ್ನು ಒದಗಿಸಿ. ಸಿವಾಂತ (CIVANTA) ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಸೈಬರ್ ಅಪರಾಧ' ವರ್ಗದಲ್ಲಿ ತಕ್ಷಣ ದೂರು ದಾಖಲಿಸಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "If you have experienced financial fraud or cybercrime, immediately dial 1930 (National Cybercrime Reporting Helpline). Provide your transaction ID and bank account details, and file a formal grievance under 'Cybercrime' on this portal.\n\n[Suggested. Officer must confirm.]";
    } else if (m.includes('112') || m.includes('emergency') || m.includes('urgent') || m.includes('ತುರ್ತು')) {
      fallbackReply = isKn
        ? "ಯಾವುದೇ ತಕ್ಷಣದ ಪೊಲೀಸ್, ಅಗ್ನಿಶಾಮಕ ಅಥವಾ ಆಂಬ್ಯುಲೆನ್ಸ್ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ ತಕ್ಷಣ 112 ಗೆ ಕರೆ ಮಾಡಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "For immediate police, medical, or fire emergency in Karnataka, dial 112 directly.\n\n[Suggested. Officer must confirm.]";
    } else if (m.includes('category') || m.includes('categories') || m.includes('ವರ್ಗ')) {
      fallbackReply = isKn
        ? "ಸಿವಾಂತ (CIVANTA) ೫ ಶಾಸನಬದ್ಧ ದೂರು ವರ್ಗಗಳು:\n1. ಸೈಬರ್ ಅಪರಾಧ (Cybercrime)\n2. ಹಣಕಾಸು ವಂಚನೆ (Financial Fraud)\n3. ಕಳೆದುಹೋದ ವಸ್ತುಗಳು (Lost Property)\n4. ಸಂಚಾರ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ (Traffic & Public Safety)\n5. ವ್ಯಕ್ತಿಗಳ ನಡುವಿನ ದೂರುಗಳು (Complaints Involving Individuals)\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "The 5 Statutory Grievance Categories:\n1. Cybercrime (UPI/SIM/Phishing)\n2. Financial Fraud (Investment scams, loan apps)\n3. Lost Property (CEIR mobile tracking, laptops)\n4. Traffic & Public Safety (Accidents, road hazards)\n5. Complaints Involving Individuals (Landlord/tenant, harassment)\n\n[Suggested. Officer must confirm.]";
    } else if (m.includes('file') || m.includes('register') || m.includes('lodge') || m.includes('ದಾಖಲಿಸು') || m.includes('ದೂರು ನೀಡು')) {
      fallbackReply = isKn
        ? "ದೂರು ದಾಖಲಿಸಲು:\n1. ಮೇಲಿನ 'ದೂರು ದಾಖಲಿಸಿ' (File Complaint) ಬಟನ್ ಒತ್ತಿರಿ.\n2. ನಿಮ್ಮ ದೂರಿನ ಶೀರ್ಷಿಕೆ ಮತ್ತು ವಿವರಗಳನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ನಮೂದಿಸಿ.\n3. ಪುರಾವೆ ದಾಖಲೆಗಳನ್ನು (ಫೋಟೋ/ಪಿಡಿಎಫ್) ಲಗತ್ತಿಸಿ.\n4. AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವರ್ಗ ಮತ್ತು ಆದ್ಯತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಸಲ್ಲಿಸಿದ ನಂತರ ನಿಮಗೆ ವಿಶಿಷ್ಟ ದೂರು ಸಂಖ್ಯೆ (Complaint ID) ಲಭಿಸುತ್ತದೆ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "To file a grievance:\n1. Click 'File Complaint' on the top navigation bar.\n2. Enter the incident title and description in English or Kannada.\n3. Upload supporting evidence files (photos, receipts, or PDF).\n4. Our AI triage system will automatically classify category and priority. After submission, you will receive a unique Complaint ID for tracking.\n\n[Suggested. Officer must confirm.]";
    } else if (m.includes('sla') || m.includes('deadline') || m.includes('time') || m.includes('escalat') || m.includes('ಗಡುವು') || m.includes('ಮೇಲ್ದರ್ಜೆ')) {
      fallbackReply = isKn
        ? "ಶಾಸನಬದ್ಧ ಎಸ್‌ಎಲ್‌ಎ (SLA) ನಿಯಮಗಳು:\n• ೨೪ ಗಂಟೆಗಳು: ನಿಯೋಜಿತ ತನಿಖಾಧಿಕಾರಿ ದೂರನ್ನು ಒಪ್ಪಿಕೊಂಡು ಕಡ್ಡಾಯ ಮುಂದಿನ ಕ್ರಮವನ್ನು ದಾಖಲಿಸಬೇಕು.\n• ೩ ದಿನಗಳ ಗಡುವು ಮೀರಿದರೆ: ಡಿವೈಎಸ್‌ಪಿ (DySP) ಮೇಲ್ವಿಚಾರಣಾ ಕಮಾಂಡ್ ಕನ್ಸೋಲ್‌ಗೆ ಸ್ವಯಂಚಾಲಿತ ಮೇಲ್ದರ್ಜೆಗೇರಿಸಲಾಗುತ್ತದೆ.\n• ೭ ದಿನಗಳ ಗಡುವು ಮೀರಿದರೆ: ಗಂಭೀರ ಕೆಂಪು ಎಚ್ಚರಿಕೆ (Red Flag) ಘಟನೆಯಾಗಿ ದಾಖಲಾಗುತ್ತದೆ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "Statutory SLA Rules:\n• 24 Hours: Investigating officer must acknowledge and log mandatory next action note.\n• 3 Days Overdue: Automatic escalation to Senior Supervisor (DySP command desk).\n• 7 Days Overdue: Critical Red Flag alert elevated across supervisory monitors.\n\n[Suggested. Officer must confirm.]";
    } else {
      fallbackReply = isKn
        ? `ನಮಸ್ಕಾರ! ನಾನು ಸಿವಾಂತ ಸಹಾಯಕ (CIVANTA Sahāyaka), ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಕುಂದುಕೊರತೆ ಮಾರ್ಗದರ್ಶಿ.\n\nನಿಮ್ಮ ಪ್ರಶ್ನೆ: "${message}"\n\nಪೊಲೀಸ್ ಇಲಾಖೆಯ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ, ಯಾವುದೇ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ 112 ಕರೆ ಮಾಡಿ, ಅಥವಾ ಸೈಬರ್ ವಂಚನೆಗಾಗಿ 1930 ಡಯಲ್ ಮಾಡಿ. ನೀವು ಹೊಸ ದೂರು ದಾಖಲಿಸಲು ಮೇಲಿನ 'ದೂರು ದಾಖಲಿಸಿ' ಬಟನ್ ಬಳಸಬಹುದು.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
        : `Greetings! I am CIVANTA Sahāyaka, your AI Police Desk Guide for Karnataka State Police.\n\nRegarding your inquiry: "${message}"\n\nUnder Karnataka Police guidelines, for immediate emergencies dial 112, or for cyber financial fraud call 1930. To register an official grievance with mandatory SLA tracking, click 'File Complaint' on the top navigation bar.\n\n[Suggested. Officer must confirm.]`;
    }

    return res.status(200).json({
      reply: fallbackReply,
      disclaimer: 'Suggested. Officer must confirm.'
    });

  } catch (err) {
    console.error('Serverless fatal error:', err);
    return res.status(200).json({
      reply: "Greetings from CIVANTA Police Desk. Please state your grievance reference or procedural query.\n\n[Suggested. Officer must confirm.]",
      disclaimer: 'Suggested. Officer must confirm.'
    });
  }
}
