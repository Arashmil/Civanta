import { ComplaintCategory, PriorityLevel } from '../types';

export interface ClassificationResult {
  suggestedCategory: ComplaintCategory;
  suggestedPriority: PriorityLevel;
  confidence: number; // 0 to 100
  rationale: string;
  matchedKeywords: string[];
}

interface CategoryRule {
  category: ComplaintCategory;
  defaultPriority: PriorityLevel;
  keywordsEn: string[];
  keywordsKn: string[];
}

const RULES: CategoryRule[] = [
  {
    category: 'Cybercrime',
    defaultPriority: 'High',
    keywordsEn: [
      'hacked', 'malware', 'ransomware', 'cyber', 'server breached', 'credential leak',
      'token hijacking', 'unauthorized access', 'data breach', 'spear phishing', 'ceo fraud',
      'instagram', 'facebook', 'twitter', 'fake account', 'impersonat', 'profile clone',
      'social media', 'photos misused', 'dark web', 'deepfake', 'apk virus'
    ],
    keywordsKn: [
      'ಹ್ಯಾಕಿಂಗ್', 'ಸರ್ವರ್', 'ಸೈಬರ್', 'ಅನಧಿಕೃತ ಪ್ರವೇಶ', 'ನಕಲಿ ಖಾತೆ', 'ಸಾಮಾಜಿಕ ಜಾಲತಾಣ', 'ಖಾತೆ ಹ್ಯಾಕ್'
    ]
  },
  {
    category: 'Financial Fraud & Scams',
    defaultPriority: 'High',
    keywordsEn: [
      'upi', 'paytm', 'gpay', 'phonepe', 'bank', 'deducted', 'deduction', 'otp',
      'fraud', 'qr code', 'debited', 'credit card', 'debit card', 'phishing link',
      'electricity bill', 'unauthorized transaction', 'wire', 'scam', 'crypto scheme',
      'lottery', 'investment fraud', 'lakh', 'rupees', 'loan app', 'ponzi', 'trading fraud'
    ],
    keywordsKn: [
      'ಯುಪಿಐ', 'ಪಾವತಿ', 'ವಂಚನೆ', 'ಹಣ ಕಡಿತ', 'ಬ್ಯಾಂಕ್', 'ಖಾತೆ', 'ಓಟಿಪಿ', 'ಕ್ಯೂಆರ್ ಕೋಡ್', 'ಹಣ', 'ಮೋಸ'
    ]
  },
  {
    category: 'Women & Child Safety',
    defaultPriority: 'Urgent',
    keywordsEn: [
      'woman', 'women', 'girl', 'child', 'posh', 'pocso', 'stalking', 'harassment',
      'domestic violence', 'dowry', 'eve teasing', 'acid', 'inappropriate touch', 'molestation',
      'stalker', 'lewd messages', 'abuse'
    ],
    keywordsKn: [
      'ಮಹಿಳೆ', 'ಮಕ್ಕಳು', 'ಕಿರುಕುಳ', 'ಕೌಟುಂಬಿಕ ಹಿಂಸೆ', 'ವರದಕ್ಷಿಣೆ', 'ಹಿಂಸೆ', 'ಪೀಡೆ', 'ಅಶ್ಲೀಲ'
    ]
  },
  {
    category: 'Theft & Burglary',
    defaultPriority: 'High',
    keywordsEn: [
      'theft', 'stolen', 'robbery', 'burglary', 'house breaking', 'chain snatching', 'pickpocket',
      'loot', 'break-in', 'stole', 'bike theft', 'car theft', 'jewelry stolen'
    ],
    keywordsKn: [
      'ಕಳ್ಳತನ', 'ದರೋಡೆ', 'ಕಳ್ಳ', 'ಸರಗಳ್ಳತನ', 'ಬೈಕ್ ಕಳ್ಳತನ', 'ಚಿನ್ನಾಭರಣ ಕಳ್ಳತನ'
    ]
  },
  {
    category: 'Lost & Found Property',
    defaultPriority: 'Medium',
    keywordsEn: [
      'lost', 'misplaced', 'dropped', 'wallet', 'purse', 'passport', 'aadhaar',
      'driving license', 'phone misplaced', 'metro station', 'luggage', 'keys', 'certificates',
      'ceir', 'rc book', 'marks card'
    ],
    keywordsKn: [
      'ಕಳೆದುಹೋಗಿದೆ', 'ವಾಲೆಟ್', 'ಪಾಸ್‌ಪೋರ್ಟ್', 'ಆಧಾರ್', 'ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದೆ', 'ಬ್ಯಾಗ್', 'ದಾಖಲೆ', 'ಕಾಣೆಯಾದ'
    ]
  },
  {
    category: 'Traffic & Road Safety',
    defaultPriority: 'Medium',
    keywordsEn: [
      'traffic', 'accident', 'hit and run', 'signal jumping', 'rash driving', 'road rage',
      'pothole', 'street light', 'drunk driving', 'speeding', 'parking obstruction'
    ],
    keywordsKn: [
      'ಸಂಚಾರ', 'ಅಪಘಾತ', 'ರಸ್ತೆ', 'ಸಿಗ್ನಲ್', 'ಅತಿವೇಗ', 'ಪಾರ್ಕಿಂಗ್', 'ಮದ್ಯಪಾನ ಚಾಲನೆ'
    ]
  },
  {
    category: 'Assault & Violent Crimes',
    defaultPriority: 'Urgent',
    keywordsEn: [
      'assault', 'fight', 'threat', 'threatening', 'beating', 'attack', 'murder threat',
      'grievous hurt', 'gang', 'weapon', 'knife', 'injury', 'physical abuse', 'extortion'
    ],
    keywordsKn: [
      'ಹಲ್ಲೆ', 'ಜಗಳ', 'ಮಾರಾಮಾರಿ', 'ಬೆದರಿಕೆ', 'ಹೊಡೆದಾಟ', 'ಗಾಯ', 'ಮಾರಕಾಸ್ತ್ರ', 'ದೌರ್ಜನ್ಯ'
    ]
  },
  {
    category: 'Narcotics & Illegal Substances',
    defaultPriority: 'High',
    keywordsEn: [
      'drugs', 'narcotics', 'weed', 'ganja', 'cocaine', 'heroin', 'meth', 'substance',
      'peddling', 'contraband', 'illegal alcohol', 'rave party', 'mdma'
    ],
    keywordsKn: [
      'ಮಾದಕ ದ್ರವ್ಯ', 'ಗಾಂಜಾ', 'ಡ್ರಗ್ಸ್', 'ಅಕ್ರಮ ಮದ್ಯ', 'ಸಾಗಾಣಿಕೆ'
    ]
  },
  {
    category: 'Missing Persons & Runaways',
    defaultPriority: 'Urgent',
    keywordsEn: [
      'missing person', 'missing child', 'disappeared', 'runaway', 'untraceable',
      'not returned home', 'kidnapped', 'abducted'
    ],
    keywordsKn: [
      'ಕಾಣೆಯಾಗಿದ್ದಾರೆ', 'ನಾಪತ್ತೆ', 'ಮನೆಗೆ ಬಂದಿಲ್ಲ', 'ಅಪಹರಣ'
    ]
  },
  {
    category: 'Property & Land Disputes',
    defaultPriority: 'Medium',
    keywordsEn: [
      'land dispute', 'property', 'encroachment', 'fake agreement', 'illegal possession',
      'tenant', 'landlord eviction', 'boundary dispute', 'forged deed', 'khata fraud'
    ],
    keywordsKn: [
      'ಆಸ್ತಿ', 'ಜಮೀನು ವಿವಾದ', 'ಒತ್ತುವರಿ', 'ಖಾಲಿ ಮಾಡಿಸುವುದು', 'ಬಾಡಿಗೆದಾರ', 'ನಕಲಿ ದಾಖಲೆ'
    ]
  },
  {
    category: 'Public Nuisance & Civic Grievances',
    defaultPriority: 'Low',
    keywordsEn: [
      'nuisance', 'loudspeaker', 'noise', 'illegal dumping', 'garbage', 'public drinking',
      'gambling', 'illegal construction', 'street harassment'
    ],
    keywordsKn: [
      'ಸಾರ್ವಜನಿಕ ಕಿರುಕುಳ', 'ಶಬ್ದ ಮಾಲಿನ್ಯ', 'ಕಸ ಸುರಿಯುವುದು', 'ಅಕ್ರಮ ಜೂಜು', 'ಕಿರಿಕಿರಿ'
    ]
  },
  {
    category: 'Corruption & Police Misconduct',
    defaultPriority: 'High',
    keywordsEn: [
      'corruption', 'bribe', 'bribery', 'extortion by official', 'police harassment',
      'illegal detention', 'refusal to register', 'misconduct'
    ],
    keywordsKn: [
      'ಲಂಚ', 'ಭ್ರಷ್ಟಾಚಾರ', 'ಅಧಿಕಾರ ದುರುಪಯೋಗ', 'ಅನಗತ್ಯ ಕಿರುಕುಳ'
    ]
  }
];

export class AIClassifierService {
  static classifyComplaint(title: string, description: string): ClassificationResult {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    let bestMatch: CategoryRule | null = null;
    let highestScore = 0;
    let matchedWords: string[] = [];

    for (const rule of RULES) {
      let score = 0;
      const currentMatched: string[] = [];

      for (const kw of rule.keywordsEn) {
        if (combinedText.includes(kw.toLowerCase())) {
          score += 15;
          currentMatched.push(kw);
        }
      }

      for (const kw of rule.keywordsKn) {
        if (combinedText.includes(kw)) {
          score += 25; // boost for Kannada keyword match
          currentMatched.push(kw);
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = rule;
        matchedWords = currentMatched;
      }
    }

    if (!bestMatch || highestScore < 10) {
      return {
        suggestedCategory: 'Complaints Involving Individuals',
        suggestedPriority: 'Low',
        confidence: 65,
        rationale: 'Generic grievance context. Categorized under Complaints Involving Individuals with Low priority.',
        matchedKeywords: []
      };
    }

    // Determine priority based on severity keywords
    let priority: PriorityLevel = bestMatch.defaultPriority;
    const isUrgent =
      combinedText.includes('threat') ||
      combinedText.includes('urgent') ||
      combinedText.includes('blackmail') ||
      combinedText.includes('missing') ||
      combinedText.includes('extortion') ||
      combinedText.includes('lakh') ||
      combinedText.includes('kidnap') ||
      combinedText.includes('ಬೆದರಿಕೆ');

    if (isUrgent) {
      priority = 'Urgent';
    } else if (
      combinedText.includes('lost') ||
      combinedText.includes('misplaced') ||
      combinedText.includes('ಕಳೆದುಹೋಗಿದೆ')
    ) {
      priority = priority === 'Urgent' ? 'High' : 'Medium';
    }

    const confidence = Math.min(98, Math.max(72, 60 + highestScore));

    return {
      suggestedCategory: bestMatch.category,
      suggestedPriority: priority,
      confidence,
      rationale: `Matched ${matchedWords.length} semantic triggers (${matchedWords.slice(0, 4).join(', ')}) corresponding to ${bestMatch.category} with suggested ${priority} priority.`,
      matchedKeywords: matchedWords
    };
  }
}
