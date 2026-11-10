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
    if (apiKey) {
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

        // Try gemini-2.5-flash and gemini-1.5-flash
        const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
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
            }
          } catch (modelErr) {
            console.warn(`Model ${model} failed:`, modelErr);
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

    // Rule-Based Fallback if key missing or model unavailable
    const m = message.toLowerCase();
    let fallbackReply = '';

    if (m.includes('1930') || m.includes('cyber') || m.includes('upi') || m.includes('fraud') || m.includes('ಸೈಬರ್') || m.includes('ವಂಚನೆ')) {
      fallbackReply = isKn
        ? "ಆನ್‌ಲೈನ್ ಹಣಕಾಸು ಅಥವಾ ಸೈಬರ್ ವಂಚನೆ ನಡೆದ ತಕ್ಷಣ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ 1930 ಗೆ ಕರೆ ಮಾಡಿ. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು ಮತ್ತು ವಹಿವಾಟು ಐಡಿಗಳನ್ನು ಒದಗಿಸಿ. ಸಿವಾಂತ (CIVANTA) ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಸೈಬರ್ ಅಪರಾಧ' ವರ್ಗದಲ್ಲಿ ತಕ್ಷಣ ದೂರು ದಾಖಲಿಸಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "If you have experienced financial fraud or cybercrime, immediately dial 1930 (National Cybercrime Reporting Helpline). Provide your transaction ID and bank account details, and file a formal grievance under 'Cybercrime' on this portal.\n\n[Suggested. Officer must confirm.]";
    } else if (m.includes('112') || m.includes('emergency') || m.includes('ತುರ್ತು')) {
      fallbackReply = isKn
        ? "ಯಾವುದೇ ತಕ್ಷಣದ ಪೊಲೀಸ್, ಅಗ್ನಿಶಾಮಕ ಅಥವಾ ಆಂಬ್ಯುಲೆನ್ಸ್ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ ತಕ್ಷಣ 112 ಗೆ ಕರೆ ಮಾಡಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "For immediate police, medical, or fire emergency in Karnataka, dial 112 directly.\n\n[Suggested. Officer must confirm.]";
    } else if (m.includes('category') || m.includes('categories') || m.includes('ವರ್ಗ')) {
      fallbackReply = isKn
        ? "ಸಿವಾಂತ (CIVANTA) ೫ ಶಾಸನಬದ್ಧ ದೂರು ವರ್ಗಗಳು:\n1. ಸೈಬರ್ ಅಪರಾಧ (Cybercrime)\n2. ಹಣಕಾಸು ವಂಚನೆ (Financial Fraud)\n3. ಕಳೆದುಹೋದ ವಸ್ತುಗಳು (Lost Property)\n4. ಸಂಚಾರ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ (Traffic & Public Safety)\n5. ವ್ಯಕ್ತಿಗಳ ನಡುವಿನ ದೂರುಗಳು (Complaints Involving Individuals)\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "The 5 Statutory Grievance Categories:\n1. Cybercrime (UPI/SIM/Phishing)\n2. Financial Fraud (Investment scams, loan apps)\n3. Lost Property (CEIR mobile tracking, laptops)\n4. Traffic & Public Safety (Accidents, road hazards)\n5. Complaints Involving Individuals (Landlord/tenant, harassment)\n\n[Suggested. Officer must confirm.]";
    } else {
      fallbackReply = isKn
        ? "ನಮಸ್ಕಾರ! ನಾನು ಸಿವಾಂತ ಸಹಾಯಕ (CIVANTA Sahāyaka), ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಕುಂದುಕೊರತೆ ಮಾರ್ಗದರ್ಶಿ. ದೂರು ದಾಖಲಿಸುವುದು, 1930 ಸೈಬರ್ ಸಹಾಯವಾಣಿ ಅಥವಾ ಪ್ರಕರಣದ ಸ್ಥಿತಿ ತಿಳಿಯಲು ನೀವು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]"
        : "Greetings! I am CIVANTA Sahāyaka, your AI Police Desk Guide for Karnataka State Police. You can ask me how to file a grievance, report cyber fraud to 1930, understand statutory SLAs, or track existing cases.\n\n[Suggested. Officer must confirm.]";
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
