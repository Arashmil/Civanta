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
      'social media', 'photos misused', 'dark web'
    ],
    keywordsKn: [
      'ಹ್ಯಾಕಿಂಗ್', 'ಸರ್ವರ್', 'ಸೈಬರ್', 'ಅನಧಿಕೃತ ಪ್ರವೇಶ', 'ನಕಲಿ ಖಾತೆ', 'ಸಾಮಾಜಿಕ ಜಾಲತಾಣ'
    ]
  },
  {
    category: 'Financial Fraud',
    defaultPriority: 'High',
    keywordsEn: [
      'upi', 'paytm', 'gpay', 'phonepe', 'bank', 'deducted', 'deduction', 'otp',
      'fraud', 'qr code', 'debited', 'credit card', 'debit card', 'phishing link',
      'electricity bill', 'unauthorized transaction', 'wire', 'scam', 'crypto scheme',
      'lottery', 'investment fraud', 'lakh', 'rupees'
    ],
    keywordsKn: [
      'ಯುಪಿಐ', 'ಪಾವತಿ', 'ವಂಚನೆ', 'ಹಣ ಕಡಿತ', 'ಬ್ಯಾಂಕ್', 'ಖಾತೆ', 'ಓಟಿಪಿ', 'ಕ್ಯೂಆರ್ ಕೋಡ್', 'ಹಣ'
    ]
  },
  {
    category: 'Lost Property',
    defaultPriority: 'Medium',
    keywordsEn: [
      'lost', 'misplaced', 'dropped', 'wallet', 'purse', 'passport', 'aadhaar',
      'driving license', 'phone misplaced', 'metro station', 'luggage', 'keys', 'certificates'
    ],
    keywordsKn: [
      'ಕಳೆದುಹೋಗಿದೆ', 'ವಾಲೆಟ್', 'ಪಾಸ್‌ಪೋರ್ಟ್', 'ಆಧಾರ್', 'ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದೆ', 'ಬ್ಯಾಗ್'
    ]
  },
  {
    category: 'Traffic & Public Safety',
    defaultPriority: 'Medium',
    keywordsEn: [
      'traffic', 'accident', 'hit and run', 'signal jumping', 'rash driving', 'road rage',
      'pothole', 'street light', 'public nuisance', 'loudspeaker', 'drunk driving', 'speeding'
    ],
    keywordsKn: [
      'ಸಂಚಾರ', 'ಅಪಘಾತ', 'ರಸ್ತೆ', 'ಸಿಗ್ನಲ್', 'ಅತಿವೇಗ'
    ]
  },
  {
    category: 'Complaints Involving Individuals',
    defaultPriority: 'High',
    keywordsEn: [
      'harass', 'stalking', 'threat', 'blackmail', 'extortion', 'abusive', 'voip',
      'morphed', 'intimidation', 'lewd', 'obscene', 'stalker', 'missing', 'disappeared',
      'lost child', 'kidnap', 'not returned', 'untraceable', 'vanished', 'runaway', 'neighbor dispute',
      'assault', 'fight'
    ],
    keywordsKn: [
      'ಕಿರುಕುಳ', 'ಬೆದರಿಕೆ', 'ಹಣಕ್ಕಾಗಿ ಪೀಡಿಸುವುದು', 'ಅಶ್ಲೀಲ', 'ಹಿಂಬಾಲಿಸುವುದು', 'ಕಾಣೆಯಾದ', 'ನಾಪತ್ತೆ', 'ಮಗು', 'ಜಗಳ'
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
