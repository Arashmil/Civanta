import { StorageService } from './storage';

export const fallbackChatService = {
  async respond(
    message: string,
    history: Array<{ role: string; content: string }> = [],
    language: 'en' | 'kn' = 'en'
  ): Promise<{ reply: string; complaint_found?: any; disclaimer: string }> {
    const isKn = language === 'kn' || /[\u0C80-\u0CFF]/.test(message);
    const m = message.toLowerCase();

    // 1. Direct Gemini Call if VITE_GEMINI_API_KEY is present
    const clientApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (clientApiKey) {
      try {
        const geminiRes = await callGeminiClientSide(clientApiKey, message, history, isKn);
        if (geminiRes) {
          return {
            reply: geminiRes,
            disclaimer: 'Suggested. Officer must confirm.'
          };
        }
      } catch (err) {
        console.warn('Client-side Gemini call failed, falling back to rule engine:', err);
      }
    }

    // 2. Check if a Complaint ID is mentioned (e.g. KA-CYB-2026-0001, CIV-2026-BLR-0101)
    const caseMatch = message.match(/\b(KA-(?:CYB|FIN|LST|TRF|IND)-2026-\d{4}|CIV-2026-[A-Z]+-\d{4})\b/i);
    if (caseMatch) {
      const caseId = caseMatch[1].toUpperCase();
      const allComplaints = StorageService.getComplaints();
      const comp = allComplaints.find(c => c.id.toUpperCase() === caseId);

      if (comp) {
        const reply = isKn
          ? `ಪ್ರಕರಣ **${comp.id}** ವಿವರಗಳು:\n• ವಿಷಯ: ${comp.titleKannada || comp.title}\n• ವರ್ಗ: ${comp.category} (${comp.priority} ಆದ್ಯತೆ)\n• ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: ${comp.status.toUpperCase()}\n• ತನಿಖಾಧಿಕಾರಿ: ${comp.assignedOfficerName || 'ನಿಯೋಜಿಸಲಾಗುತ್ತಿದೆ'}\n• ಮುಂದಿನ ಕಡ್ಡಾಯ ಕ್ರಮ: ${comp.nextAction || 'ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆ'}\n• ಶಾಸನಬದ್ಧ ಗಡುವು: ${new Date(comp.dueDate || comp.deadlineDate).toLocaleString()}\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
          : `Official Record Summary for Complaint **${comp.id}**:\n• Subject: ${comp.title}\n• Category: ${comp.category} (${comp.priority} Priority)\n• Current Status: ${comp.status.toUpperCase()}\n• Investigating Officer: ${comp.assignedOfficerName || 'Awaiting Assignment'}\n• Mandatory Next Action: ${comp.nextAction || 'Preliminary verification'}\n• Resolution Due Date: ${new Date(comp.dueDate || comp.deadlineDate).toLocaleString()}\n\n[Suggested. Officer must confirm.]`;

        return {
          reply,
          complaint_found: comp,
          disclaimer: 'Suggested. Officer must confirm.'
        };
      } else {
        const notFoundReply = isKn
          ? `ದೂರು ಸಂಖ್ಯೆ **${caseId}** ದಾಖಲೆಗಳಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ಸರಿಯಾಗಿ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಹೊಸ ದೂರು ದಾಖಲಿಸಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
          : `Complaint reference **${caseId}** could not be found in active police registry. Please verify the ID format or file a new grievance.\n\n[Suggested. Officer must confirm.]`;

        return {
          reply: notFoundReply,
          disclaimer: 'Suggested. Officer must confirm.'
        };
      }
    }

    // 3. Cybercrime & Financial Fraud Helpline
    if (m.includes('1930') || m.includes('cyber') || m.includes('fraud') || m.includes('upi') || m.includes('otp') || m.includes('ಸೈಬರ್') || m.includes('ವಂಚನೆ')) {
      const reply = isKn
        ? `ಆನ್‌ಲೈನ್ ಹಣಕಾಸು ಅಥವಾ ಸೈಬರ್ ವಂಚನೆ ನಡೆದ ತಕ್ಷಣ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಸಹಾಯವಾಣಿ **1930** ಗೆ ಕರೆ ಮಾಡಿ. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು ಮತ್ತು ವಹಿವಾಟು ಐಡಿಗಳನ್ನು ಒದಗಿಸಿ. ಸಿವಾಂತ (CIVANTA) ಪೋರ್ಟಲ್‌ನಲ್ಲಿ 'ಸೈಬರ್ ಅಪರಾಧ' ವರ್ಗದಲ್ಲಿ ತಕ್ಷಣ ದೂರು ದಾಖಲಿಸಿ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
        : `If you have experienced online financial fraud, UPI scam, or cybercrime:\n1. Immediately dial **1930** (National Cybercrime Reporting Helpline) to freeze fraudulent transactions.\n2. Note your Bank Account, Transaction UTR/Reference number, and timestamp.\n3. Register an official grievance under 'Cybercrime' on this CIVANTA portal to begin officer investigation.\n\n[Suggested. Officer must confirm.]`;

      return { reply, disclaimer: 'Suggested. Officer must confirm.' };
    }

    // 4. Police Emergency 112
    if (m.includes('112') || m.includes('emergency') || m.includes('urgent') || m.includes('ತುರ್ತು')) {
      const reply = isKn
        ? `ಯಾವುದೇ ತಕ್ಷಣದ ಪೊಲೀಸ್, ಅಗ್ನಿಶಾಮಕ ಅಥವಾ ಆಂಬ್ಯುಲೆನ್ಸ್ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ ತಕ್ಷಣ **112** ಗೆ ಕರೆ ಮಾಡಿ. ಸಿವಾಂತ ಕುಂದುಕೊರತೆ ಪೋರ್ಟಲ್ ಆಡಳಿತಾತ್ಮಕ ತನಿಖೆಗಳಿಗಾಗಿ ಮೀಸಲಾಗಿದೆ, ನೇರ ತುರ್ತು ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಅಲ್ಲ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
        : `For immediate police, medical, or fire emergency in Karnataka, dial **112** directly. CIVANTA is an administrative grievance tracking system and does not replace emergency 112 dispatch.\n\n[Suggested. Officer must confirm.]`;

      return { reply, disclaimer: 'Suggested. Officer must confirm.' };
    }

    // 5. 5 Statutory Categories
    if (m.includes('category') || m.includes('categories') || m.includes('ವರ್ಗ') || m.includes('ದೂರು ವಿಭಾಗ')) {
      const reply = isKn
        ? `ಸಿವಾಂತ (CIVANTA) ವ್ಯವಸ್ಥೆಯ ೫ ಶಾಸನಬದ್ಧ ದೂರು ವರ್ಗಗಳು:\n1. **ಸೈಬರ್ ಅಪರಾಧ (Cybercrime)**: ಯುಪಿಐ ವಂಚನೆ, ಫಿಶಿಂಗ್, ನಕಲಿ ಖಾತೆ, ಸಾಮಾಜಿಕ ಜಾಲತಾಣ ಕಿರುಕುಳ.\n2. **ಹಣಕಾಸು ವಂಚನೆ (Financial Fraud)**: ಹೂಡಿಕೆ ವಂಚನೆ, ಸಾಲದ ಅಪ್ಲಿಕೇಶನ್ ದಂಧೆ, ನಕಲಿ ಕರೆಗಳು.\n3. **ಕಳೆದುಹೋದ ವಸ್ತುಗಳು (Lost Property)**: ಮೊಬೈಲ್ ಫೋನ್, ಲ್ಯಾಪ್‌ಟಾಪ್, ಪಾಸ್‌ಪೋರ್ಟ್, ದಾಖಲೆಗಳು.\n4. **ಸಂಚಾರ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸುರಕ್ಷತೆ (Traffic & Public Safety)**: ಅತಿವೇಗ, ಸಿಗ್ನಲ್ ಉಲ್ಲಂಘನೆ, ರಸ್ತೆ ಸುರಕ್ಷತೆ.\n5. **ವ್ಯಕ್ತಿಗಳ ನಡುವಿನ ದೂರುಗಳು (Complaints Involving Individuals)**: ಮನೆಮಾಲೀಕ/ಬಾಡಿಗೆದಾರರ ವಿವಾದ, ನೆರೆಹೊರೆಯವರ ಜಗಳ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
        : `The 5 Statutory Grievance Categories under Karnataka Police Protocol:\n1. **Cybercrime**: UPI fraud, SIM swap, phishing, social media harassment, hacking.\n2. **Financial Fraud**: Fake trading investment schemes, fraudulent loan apps, Ponzi operations.\n3. **Lost Property**: Mobile phones (CEIR tracking), laptops, ID cards, certificates.\n4. **Traffic & Public Safety**: Dangerous driving, hit-and-run, road encroachments, hazardous conditions.\n5. **Complaints Involving Individuals**: Landlord-tenant disputes, neighbor altercations, workplace harassment.\n\n[Suggested. Officer must confirm.]`;

      return { reply, disclaimer: 'Suggested. Officer must confirm.' };
    }

    // 6. SLA Timelines & Escalations
    if (m.includes('sla') || m.includes('timeline') || m.includes('deadline') || m.includes('escalat') || m.includes('ಗಡುವು') || m.includes('ಮೇಲ್ದರ್ಜೆ')) {
      const reply = isKn
        ? `ಶಾಸನಬದ್ಧ ಎಸ್‌ಎಲ್‌ಎ (SLA) ನಿಯಮಗಳು:\n• **೨೪ ಗಂಟೆಗಳು**: ನಿಯೋಜಿತ ತನಿಖಾಧಿಕಾರಿ ದೂರನ್ನು ಒಪ್ಪಿಕೊಂಡು ಕಡ್ಡಾಯ ಮುಂದಿನ ಕ್ರಮವನ್ನು ದಾಖಲಿಸಬೇಕು.\n• **೩ ದಿನಗಳ ಗಡುವು ಮೀರಿದರೆ**: ಡಿವೈಎಸ್‌ಪಿ (DySP) ಮೇಲ್ವಿಚಾರಣಾ ಕಮಾಂಡ್ ಕನ್ಸೋಲ್‌ಗೆ ಸ್ವಯಂಚಾಲಿತ ಮೇಲ್ದರ್ಜೆಗೇರಿಸಲಾಗುತ್ತದೆ.\n• **೭ ದಿನಗಳ ಗಡುವು ಮೀರಿದರೆ**: ಗಂಭೀರ ಕೆಂಪು ಎಚ್ಚರಿಕೆ (Red Flag) ಘಟನೆಯಾಗಿ ದಾಖಲಾಗುತ್ತದೆ.\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
        : `Statutory SLA & Escalation Ladder Rules:\n• **24 Hours**: Assigned officer must acknowledge the grievance and record a mandatory next action note.\n• **3 Days Overdue**: Automatic escalation to Senior Supervisor (DySP command desk).\n• **7 Days Overdue**: Critical Red Flag alert elevated across supervisory monitors.\n• Every status modification requires a mandatory follow-up action and target due date.\n\n[Suggested. Officer must confirm.]`;

      return { reply, disclaimer: 'Suggested. Officer must confirm.' };
    }

    // Default Greeting & Guidance
    const defaultReply = isKn
      ? `ನಮಸ್ಕಾರ! ನಾನು ಸಿವಾಂತ ಸಹಾಯಕ (CIVANTA Sahāyaka). ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಕುಂದುಕೊರತೆ ವ್ಯವಸ್ಥೆಯ ಅಧಿಕೃತ AI ಮಾರ್ಗದರ್ಶಿ.\n\nನಾನು ನಿಮಗೆ ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ದೂರಿನ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ (ಉದಾ: "KA-CYB-2026-0001 ಸ್ಥಿತಿ ತಿಳಿಸಿ")\n• ಸೈಬರ್ ವಂಚನೆ ಮತ್ತು 1930 ಸಹಾಯವಾಣಿ ಮಾರ್ಗದರ್ಶನ\n• 5 ಶಾಸನಬದ್ಧ ದೂರು ವರ್ಗಗಳ ಮಾಹಿತಿ\n• ಎಸ್‌ಎಲ್‌ಎ ನಿಯಮಗಳು ಮತ್ತು ಮೇಲ್ದರ್ಜೆ ಹಂತಗಳು\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]`
      : `Greetings! I am CIVANTA Sahāyaka, the official AI Police Desk Guide for Karnataka State Police.\n\nI can assist you with:\n• Tracking your grievance status (e.g. "Check status of KA-CYB-2026-0001")\n• Reporting cyber/financial fraud and calling 1930\n• Explaining the 5 statutory grievance categories\n• Understanding statutory SLA deadlines and supervisory escalations\n\nHow may I assist your inquiry today?\n\n[Suggested. Officer must confirm.]`;

    return { reply: defaultReply, disclaimer: 'Suggested. Officer must confirm.' };
  }
};

async function callGeminiClientSide(
  apiKey: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  isKn: boolean
): Promise<string | null> {
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];
  const contents = history.slice(-6).map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          reply = reply.trim();
          if (!reply.includes('[Suggested. Officer must confirm.]') && !reply.includes('[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]')) {
            reply += isKn ? '\n\n[ಸೂಚಿಸಲಾಗಿದೆ. ತನಿಖಾಧಿಕಾರಿ ದೃಢಪಡಿಸಬೇಕು.]' : '\n\n[Suggested. Officer must confirm.]';
          }
          return reply;
        }
      }
    } catch {
      // try next model
    }
  }
  return null;
}
