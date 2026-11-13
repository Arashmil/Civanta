import {
  Complaint,
  Officer,
  Department,
  User,
  ActionHistoryEntry,
  AppNotification,
  SLARule
} from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-citizen-01',
    name: 'Ramesh Gowda',
    email: 'citizen@demo.com',
    role: 'citizen',
    phone: '+91 98450 12345',
    jurisdiction: 'Bengaluru Central',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'usr-officer-01',
    name: 'PSI Anand Kumar',
    email: 'junior@demo.com',
    role: 'junior_officer',
    phone: '+91 94480 87654',
    badgeNumber: 'KSP-PSI-2489',
    designation: 'Sub-Inspector of Police',
    departmentId: 'dept-cyber-crime',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'usr-supervisor-01',
    name: 'DySP Rajeshwari Hegde',
    email: 'supervisor@demo.com',
    role: 'senior_supervisor',
    phone: '+91 94481 99001',
    badgeNumber: 'KSP-DySP-1042',
    designation: 'Deputy Superintendent of Police (Supervision & Vigilance)',
    departmentId: 'dept-cyber-crime',
    jurisdiction: 'Bengaluru South & Central Police Commission',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'usr-admin-01',
    name: 'Prakash Rao',
    email: 'admin@demo.com',
    role: 'admin',
    phone: '+91 98800 55112',
    designation: 'Directorate of Police Computer Services (Administrator)',
    departmentId: 'dept-police-hq',
    jurisdiction: 'Karnataka State Police Headquarters',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  }
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-cyber-crime',
    name: 'Cyber Crime Police Division',
    nameKannada: 'ಸೈಬರ್ ಅಪರಾಧ ಪೊಲೀಸ್ ವಿಭಾಗ',
    code: 'CCPD-BLR',
    headOfDepartment: 'DySP Rajeshwari Hegde',
    activeOfficersCount: 4,
    jurisdiction: 'Greater Bengaluru Metropolitan Area',
    categories: [
      'Cybercrime',
      'Online Payment Fraud',
      'Fake Social Media Account',
      'Suspicious Online Activity'
    ]
  },
  {
    id: 'dept-law-order',
    name: 'Law & Order Police Station',
    nameKannada: 'ಕಾನೂನು ಮತ್ತು ಸುವ್ಯವಸ್ಥೆ ಪೊಲೀಸ್ ಠಾಣೆ',
    code: 'LO-BLR-CEN',
    headOfDepartment: 'ACP Manjunath Swamy',
    activeOfficersCount: 5,
    jurisdiction: 'Central Division, Bengaluru',
    categories: ['Theft', 'Harassment', 'Missing Person', 'Other Police Complaints']
  },
  {
    id: 'dept-traffic-lost',
    name: 'Lost & Found / Citizen Vigilance Wing',
    nameKannada: 'ಕಳೆದುಹೋದ ವಸ್ತುಗಳ ಮತ್ತು ನಾಗರಿಕ ಜಾಗೃತಿ ಶಾಖೆ',
    code: 'LF-BLR',
    headOfDepartment: 'Inspector Geetha Patil',
    activeOfficersCount: 3,
    jurisdiction: 'All Bengaluru Police Limits',
    categories: ['Lost Property', 'Other Police Complaints']
  }
];

export const OFFICERS: Officer[] = [
  {
    id: 'usr-officer-01',
    name: 'PSI Anand Kumar',
    badgeNumber: 'KSP-PSI-2489',
    email: 'junior@demo.com',
    phone: '+91 94480 87654',
    rank: 'Police Sub-Inspector (PSI)',
    departmentId: 'dept-cyber-crime',
    departmentName: 'Cyber Crime Police Division',
    unitName: 'Digital Fraud Investigation Cell',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    activeCasesCount: 4,
    maxCapacity: 8,
    status: 'available',
    solvedCasesCount: 42,
    avgResolutionDays: 3.4,
    rating: 4.8
  },
  {
    id: 'usr-officer-02',
    name: 'PSI Deepa Nayak',
    badgeNumber: 'KSP-PSI-2612',
    email: 'deepa.nayak@ksp.gov.in',
    phone: '+91 94480 88211',
    rank: 'Police Sub-Inspector (PSI)',
    departmentId: 'dept-cyber-crime',
    departmentName: 'Cyber Crime Police Division',
    unitName: 'Social Media & Identity Theft Cell',
    jurisdiction: 'Bengaluru East Cyber Cell',
    activeCasesCount: 3,
    maxCapacity: 8,
    status: 'available',
    solvedCasesCount: 38,
    avgResolutionDays: 2.8,
    rating: 4.9
  },
  {
    id: 'usr-officer-03',
    name: 'PI Vinayaka Murthy',
    badgeNumber: 'KSP-PI-1870',
    email: 'vinayaka.m@ksp.gov.in',
    phone: '+91 94480 77342',
    rank: 'Police Inspector (PI)',
    departmentId: 'dept-law-order',
    departmentName: 'Law & Order Police Station',
    unitName: 'Property Crimes & Theft Squad',
    jurisdiction: 'Cubbon Park Police Station Limits',
    activeCasesCount: 5,
    maxCapacity: 10,
    status: 'available',
    solvedCasesCount: 76,
    avgResolutionDays: 4.1,
    rating: 4.6
  },
  {
    id: 'usr-officer-04',
    name: 'PSI Kavitha Reddy',
    badgeNumber: 'KSP-PSI-2940',
    email: 'kavitha.reddy@ksp.gov.in',
    phone: '+91 94480 66209',
    rank: 'Police Sub-Inspector (PSI)',
    departmentId: 'dept-traffic-lost',
    departmentName: 'Lost & Found / Citizen Vigilance Wing',
    unitName: 'Document & Gadget Tracing Squad',
    jurisdiction: 'Majestic & Railway Police Station Jurisdiction',
    activeCasesCount: 3,
    maxCapacity: 8,
    status: 'available',
    solvedCasesCount: 54,
    avgResolutionDays: 1.9,
    rating: 4.7
  }
];

export const DEFAULT_SLA_RULES: SLARule[] = [
  {
    id: 'sla-1',
    category: 'Online Payment Fraud',
    priority: 'Urgent',
    deadlineHours: 24,
    reminderNoticeHours: 6,
    escalationGraceHours: 2
  },
  {
    id: 'sla-2',
    category: 'Cybercrime',
    priority: 'High',
    deadlineHours: 48,
    reminderNoticeHours: 12,
    escalationGraceHours: 4
  },
  {
    id: 'sla-3',
    category: 'Harassment',
    priority: 'Urgent',
    deadlineHours: 24,
    reminderNoticeHours: 6,
    escalationGraceHours: 2
  },
  {
    id: 'sla-4',
    category: 'Missing Person',
    priority: 'Urgent',
    deadlineHours: 12,
    reminderNoticeHours: 3,
    escalationGraceHours: 1
  },
  {
    id: 'sla-5',
    category: 'Theft',
    priority: 'High',
    deadlineHours: 72,
    reminderNoticeHours: 18,
    escalationGraceHours: 6
  },
  {
    id: 'sla-6',
    category: 'Lost Property',
    priority: 'Medium',
    deadlineHours: 96,
    reminderNoticeHours: 24,
    escalationGraceHours: 12
  },
  {
    id: 'sla-7',
    category: 'Fake Social Media Account',
    priority: 'Medium',
    deadlineHours: 72,
    reminderNoticeHours: 18,
    escalationGraceHours: 6
  },
  {
    id: 'sla-8',
    category: 'Suspicious Online Activity',
    priority: 'Medium',
    deadlineHours: 72,
    reminderNoticeHours: 18,
    escalationGraceHours: 6
  },
  {
    id: 'sla-9',
    category: 'Other Police Complaints',
    priority: 'Low',
    deadlineHours: 120,
    reminderNoticeHours: 24,
    escalationGraceHours: 12
  }
];

// Official Karnataka State Police Real-World Demonstration Cases
// Dynamically anchored relative to simulated time so SLA deadlines, countdown timers,
// and overdue states are always realistic and active.
export function generateCalibratedComplaints(baseDate: Date = new Date()): Complaint[] {
  const baseMs = baseDate.getTime();
  const iso = (hoursOffset: number) => new Date(baseMs + hoursOffset * 3600 * 1000).toISOString();

  return [
    {
      id: 'KSP-2026-CYB-001',
      firNumber: '0114/2026',
      title: "₹24 Crore 'Digital Arrest' Extortion Syndicate",
      titleKannada: "₹೨೪ ಕೋಟಿ 'ಡಿಜಿಟಲ್ ಅರೆಸ್ಟ್' ಸುಲಿಗೆ ಸಿಂಡಿಕೇಟ್ ವಂಚನೆ",
      description: "Inter-state gang impersonating CBI and ED officials coerced a 74-year-old Bengaluru woman into transferring ₹24 crore across 23 mule accounts. Cyber Command intervened via bank alerts and froze ₹4 crore.",
      descriptionKannada: "ಸಿಬಿಐ ಮತ್ತು ಇಡಿ ಅಧಿಕಾರಿಗಳಂತೆ ನಟಿಸಿ ೭೪ ವರ್ಷದ ಬೆಂಗಳೂರಿನ ಹಿರಿಯ ಮಹಿಳೆಯನ್ನು ಡಿಜಿಟಲ್ ಬಂಧನದ ಬೆದರಿಕೆಯೊಡ್ಡಿ ೨೩ ಮ್ಯೂಲ್ ಖಾತೆಗಳಿಗೆ ₹೨೪ ಕೋಟಿ ವರ್ಗಾಯಿಸಿಕೊಂಡ ಅಂತರರಾಜ್ಯ ಗ್ಯಾಂಗ್. ಬ್ಯಾಂಕ್ ಎಚ್ಚರಿಕೆಯ ಮೇರೆಗೆ ಸೈಬರ್ ಕಮಾಂಡ್ ಮಧ್ಯಪ್ರವೇಶಿಸಿ ₹೪ ಕೋಟಿ ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಂಡಿದೆ.",
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Cybercrime',
      subCategory: 'Digital Arrest / Impersonation',
      priority: 'Urgent',
      status: 'in_progress',
      severity: 'Critical',
      incidentDate: iso(-8),
      incidentLocation: {
        address: 'Bengaluru Cyber Command, Infantry Road',
        city: 'Bengaluru',
        district: 'Bengaluru City & Belagavi',
        pinCode: '560001',
        lat: 12.9815,
        lng: 77.5928,
        nearestPoliceStation: 'Bengaluru Cyber Crime PS / State Cyber Command'
      },
      citizen: {
        id: 'cit-ksp-001',
        name: 'Confidential Senior Citizen Complainant (74 yrs)',
        phone: '+91 98450 99881',
        email: 'citizen.cyber@ksp.karnataka.gov.in'
      },
      assignedOfficerId: '1',
      assignedOfficerName: 'Cyber Crime Investigation Team',
      assignedOfficerBadge: 'KSP-CYB-INSP',
      department: 'Karnataka State Cyber Command',
      unit: 'State Cyber Crime Division',
      jurisdiction: 'Bengaluru City & Belagavi',
      supervisingOfficerName: 'Pranab Mohanty, IPS',
      supervisingOfficerRank: 'Director General of Police (DGP)',
      supervisingOfficerUnit: 'Karnataka State Cyber Command',
      specializedUnit: 'Karnataka State Cyber Command',
      applicableLaws: [
        'BNS Section 318(4) (Cheating)',
        'BNS Section 319(2) (Cheating by Personation)',
        'BNS Section 308 (Extortion)',
        'IT Act Section 66D'
      ],
      financialLossInr: 240000000,
      amountFrozenInr: 40000000,
      evidenceItems: [
        '26 Bank UTR Transaction Receipts',
        '23 Mule Account Freeze Orders',
        'VoIP Video Call Metadata'
      ],
      deadlineHours: 24,
      deadlineDate: iso(18), // 18 hours left of 24h statutory window
      dueDate: iso(18),
      isOverdue: false,
      isEscalated: false,
      remindersSentCount: 0,
      createdAt: iso(-6),
      updatedAt: iso(-2),
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-001',
          officerId: '1',
          officerName: 'Cyber Crime Investigation Team',
          timestamp: iso(-3),
          remark: 'Emergency lien markers served under Section 106 BNSS to 23 nodal banks. ₹4 Crore frozen in first 3 hours.'
        }
      ]
    },
    {
      id: 'KSP-2026-CYB-002',
      firNumber: '0595/2026',
      title: '₹31.43 Crore Varthur Fintech Escrow Cyber Fraud',
      titleKannada: 'ವರ್ತೂರು ಫಿನ್‌ಟೆಕ್ ಎಸ್ಕ್ರೋ ಖಾತೆಯಿಂದ ₹೩೧.೪೩ ಕೋಟಿ ಸೈಬರ್ ವಂಚನೆ',
      description: "Hackers executed 301 unauthorized transactions draining ₹31.43 crore from a Varthur-based fintech firm's private bank escrow account.",
      descriptionKannada: 'ವರ್ತೂರು ಮೂಲದ ಫಿನ್‌ಟೆಕ್ ಸಂಸ್ಥೆಯ ಖಾಸಗಿ ಬ್ಯಾಂಕ್ ಎಸ್ಕ್ರೋ ಖಾತೆಯಿಂದ ಹ್ಯಾಕರ್‌ಗಳು ೩೦೧ ಅನಧಿಕೃತ ವಹಿವಾಟುಗಳನ್ನು ನಡೆಸಿ ₹೩೧.೪೩ ಕೋಟಿ ಹಣವನ್ನು ಲೂಟಿ ಮಾಡಿದ್ದಾರೆ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Cybercrime',
      subCategory: 'Unauthorized Corporate Escrow Transfer',
      priority: 'Urgent',
      status: 'overdue',
      severity: 'Critical',
      incidentDate: iso(-56),
      incidentLocation: {
        address: 'Varthur Main Road, Whitefield Tech Corridor',
        city: 'Bengaluru',
        district: 'Bengaluru City',
        pinCode: '560087',
        lat: 12.9392,
        lng: 77.7471,
        nearestPoliceStation: 'Whitefield CEN Police Station'
      },
      citizen: {
        id: 'cit-ksp-002',
        name: 'Fintech Corporate Legal Officer',
        phone: '+91 80 4123 4567',
        email: 'nodal@fintech-escrow.in'
      },
      assignedOfficerId: '2',
      assignedOfficerName: 'Whitefield CEN Investigation Team',
      assignedOfficerBadge: 'KSP-CEN-INSP',
      department: 'CEN (Cyber, Economics & Narcotics)',
      unit: 'Whitefield CEN Division',
      jurisdiction: 'Whitefield Division, Bengaluru',
      supervisingOfficerName: 'DCP Whitefield Division',
      supervisingOfficerRank: 'Deputy Commissioner of Police (IPS)',
      supervisingOfficerUnit: 'Whitefield Division, Bengaluru',
      specializedUnit: 'CEN (Cyber, Economics & Narcotics)',
      applicableLaws: [
        'BNS Section 318(4)',
        'IT Act Section 66',
        'IT Act Section 66C (Identity Theft)'
      ],
      financialLossInr: 314300000,
      amountFrozenInr: 0,
      evidenceItems: [
        '301 Transaction Audit Logs',
        'API Access & Server IP Logs',
        'Escrow Bank Statements'
      ],
      deadlineHours: 48,
      deadlineDate: iso(-4), // Breached SLA 4 hours ago -> triggers Overdue alert
      dueDate: iso(-4),
      isOverdue: true,
      isEscalated: true,
      remindersSentCount: 2,
      createdAt: iso(-52),
      updatedAt: iso(-4),
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-002',
          officerId: '2',
          officerName: 'Whitefield CEN Investigation Team',
          timestamp: iso(-20),
          remark: 'Cloud server logs analyzed; forensic requisition sent to CERT-In and targeted gateway servers.'
        }
      ]
    },
    {
      id: 'KSP-SIT-EOW-003',
      firNumber: '0073/2019',
      title: 'I Monetary Advisory (IMA) Multi-Crore Ponzi Scam',
      titleKannada: 'ಐ ಮೊನೆಟರಿ ಅಡ್ವೈಸರಿ (ಐಎಂಎ) ಬಹುಕೋಟಿ ಪೋಂಜಿ ವಂಚನೆ ಹಗರಣ',
      description: 'Over 1 lakh investors across Karnataka were duped of ₹2,500+ crore through fraudulent high-return Islamic investment schemes; properties attached under the KPID Act.',
      descriptionKannada: 'ಕರ್ನಾಟಕದಾದ್ಯಂತ ೧ ಲಕ್ಷಕ್ಕೂ ಅಧಿಕ ಹೂಡಿಕೆದಾರರಿಗೆ ಹೆಚ್ಚಿನ ಲಾಭಾಂಶದ ಆಮಿಷವೊಡ್ಡಿ ₹೨,೫೦೦+ ಕೋಟಿ ವಂಚಿಸಿದ ಐಎಂಎ ಹಗರಣ; ಕೆಪಿಐಡಿ ಕಾಯ್ದೆಯಡಿ ಆಸ್ತಿಗಳನ್ನು ಮುಟ್ಟುಗೋಲು ಹಾಕಿಕೊಳ್ಳಲಾಗಿದೆ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Financial Fraud & Scams',
      subCategory: 'Illegal Deposit Scheme',
      priority: 'Urgent',
      status: 'in_progress',
      severity: 'Critical',
      incidentDate: iso(-48),
      incidentLocation: {
        address: 'Lady Curzon Road, Shivajinagar',
        city: 'Bengaluru',
        district: 'Bengaluru City (Statewide Impact)',
        pinCode: '560001',
        lat: 12.9833,
        lng: 77.6000,
        nearestPoliceStation: 'Commercial Street PS / Karnataka SIT'
      },
      citizen: {
        id: 'cit-ksp-003',
        name: 'IMA Depositors Welfare Association (1 Lakh+ Victims)',
        phone: '+91 99000 12345',
        email: 'depositors.ima@ksp.gov.in'
      },
      assignedOfficerId: '3',
      assignedOfficerName: 'S. Girish, IPS',
      assignedOfficerBadge: 'KSP-IPS-EOW',
      department: 'Special Investigation Team (SIT)',
      unit: 'Economic Offences Wing SIT',
      jurisdiction: 'Karnataka Statewide Jurisdiction',
      supervisingOfficerName: 'B.R. Ravikanthe Gowda, IPS',
      supervisingOfficerRank: 'Deputy Inspector General of Police (DIG)',
      supervisingOfficerUnit: 'SIT Chief',
      specializedUnit: 'Special Investigation Team (SIT)',
      applicableLaws: [
        'KPID Act Section 9',
        'BNS Section 316(5) (Criminal Breach of Trust)',
        'BNS Section 318(4) (Cheating)'
      ],
      financialLossInr: 25000000000,
      amountFrozenInr: 3500000000,
      evidenceItems: [
        'Depositor Claim Affidavits',
        'Company Ledger & Shell Entity Records',
        'Attached Real Estate Deeds'
      ],
      deadlineHours: 72,
      deadlineDate: iso(48), // 48 hours remaining of 72h window
      dueDate: iso(48),
      isOverdue: false,
      isEscalated: true,
      remindersSentCount: 0,
      createdAt: iso(-24),
      updatedAt: iso(-6),
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-003',
          officerId: '3',
          officerName: 'S. Girish, IPS',
          timestamp: iso(-12),
          remark: 'Special Court under KPID Act monitoring auctioning of attached assets for public compensation disbursement.'
        }
      ]
    },
    {
      id: 'KSP-2025-WOM-004',
      firNumber: '0412/2025',
      title: 'Instagram Stalking & Assault Outside Ladies PG (Ullal)',
      titleKannada: 'ಉಳ್ಳಾಲ ಲೇಡೀಸ್ ಪಿಜಿ ಹೊರಗೆ ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಹಿಂಬಾಲಿಸುವಿಕೆ ಮತ್ತು ಹಲ್ಲೆ',
      description: 'Accused befriended a 21-year-old woman on Instagram, stalked her near her Ladies PG in Ullal, and physically assaulted her when she refused his advances.',
      descriptionKannada: '೨೧ ವರ್ಷದ ಯುವತಿಯನ್ನು ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್‌ನಲ್ಲಿ ಪರಿಚಯ ಮಾಡಿಕೊಂಡು, ಉಳ್ಳಾಲದ ಲೇಡೀಸ್ ಪಿಜಿ ಬಳಿ ನಿರಂತರವಾಗಿ ಹಿಂಬಾಲಿಸಿ ಆಕೆ ನಿರಾಕರಿಸಿದಾಗ ದೈಹಿಕ ಹಲ್ಲೆ ನಡೆಸಿದ ಆರೋಪಿ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Women & Child Safety',
      subCategory: 'Online-to-Offline Stalking',
      priority: 'High',
      status: 'resolved',
      severity: 'High',
      incidentDate: iso(-78),
      incidentLocation: {
        address: 'Near Ullal Main Road Ladies PG, Jnanabharathi Area',
        city: 'Bengaluru',
        district: 'Bengaluru City',
        pinCode: '560056',
        lat: 12.9467,
        lng: 77.5083,
        nearestPoliceStation: 'Jnanabharathi Police Station'
      },
      citizen: {
        id: 'cit-ksp-004',
        name: 'Complainant Student (21 yrs, Confidential)',
        phone: '+91 97410 44321',
        email: 'student.safety@bangalore.edu'
      },
      assignedOfficerId: '4',
      assignedOfficerName: 'Jnanabharathi PS Investigation Team',
      assignedOfficerBadge: 'KSP-PSI-JNB',
      department: 'Law & Order / Women Safety',
      unit: 'West Division',
      jurisdiction: 'West Division, Bengaluru',
      supervisingOfficerName: 'C. Vamsi Krishna, IPS',
      supervisingOfficerRank: 'Joint Commissioner of Police (West)',
      supervisingOfficerUnit: 'West Division, Bengaluru',
      specializedUnit: 'Law & Order / Women Safety',
      applicableLaws: [
        'BNS Section 78 (Stalking)',
        'BNS Section 75 (Sexual Harassment)',
        'BNS Section 115(2) (Voluntarily Causing Hurt)',
        'BNS Section 351 (Criminal Intimidation)'
      ],
      financialLossInr: 0,
      amountFrozenInr: 0,
      evidenceItems: [
        'Street CCTV Footage',
        'Instagram Chat & Call Logs',
        'Medico-Legal Certificate (MLC)'
      ],
      deadlineHours: 48,
      deadlineDate: iso(-24),
      dueDate: iso(-24),
      isOverdue: false,
      isEscalated: false,
      remindersSentCount: 0,
      createdAt: iso(-72),
      updatedAt: iso(-36),
      resolution: {
        summary: 'Accused traced via digital footprint and CCTV triangulation; arrested and remanded under BNS 78, 75, 115(2).',
        resolvedAt: iso(-36),
        resolvedByOfficerId: '4',
        resolvedByOfficerName: 'Jnanabharathi PS Investigation Team'
      },
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-004',
          officerId: '4',
          officerName: 'Jnanabharathi PS Investigation Team',
          timestamp: iso(-48),
          remark: 'Accused traced via digital footprint and CCTV triangulation; arrested within 12 hours of complaint.'
        }
      ]
    },
    {
      id: 'KSP-2026-WOM-005',
      firNumber: '0089/2026',
      title: 'Public Road Stalking & Harassment in Kuriya',
      titleKannada: 'ಪುತ್ತೂರಿನ ಕುರಿಯಾದಲ್ಲಿ ಸಾರ್ವಜನಿಕ ರಸ್ತೆಯಲ್ಲಿ ಹಿಂಬಾಲಿಸಿ ಕಿರುಕುಳ',
      description: 'Youth followed and verbally harassed a woman walking along a public road in Kuriya, Puttur; arrested following prompt local police response.',
      descriptionKannada: 'ಪುತ್ತೂರಿನ ಕುರಿಯಾದಲ್ಲಿ ಸಾರ್ವಜನಿಕ ರಸ್ತೆಯಲ್ಲಿ ನಡೆದುಕೊಂಡು ಹೋಗುತ್ತಿದ್ದ ಮಹಿಳೆಯನ್ನು ಬೈಕ್‌ನಲ್ಲಿ ಹಿಂಬಾಲಿಸಿ ಅವಾಚ್ಯ ಶಬ್ದಗಳಿಂದ ಕಿರುಕುಳ ನೀಡಿದ ಯುವಕನನ್ನು ಸ್ಥಳೀಯ ಪೊಲೀಸರು ಬಂಧಿಸಿದ್ದಾರೆ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Women & Child Safety',
      subCategory: 'Street Harassment',
      priority: 'Medium',
      status: 'in_progress',
      severity: 'Medium',
      incidentDate: iso(-44),
      incidentLocation: {
        address: 'Kuriya Junction, Main Road',
        city: 'Puttur',
        district: 'Dakshina Kannada District',
        pinCode: '574210',
        lat: 12.7667,
        lng: 75.2000,
        nearestPoliceStation: 'Puttur Town Police Station'
      },
      citizen: {
        id: 'cit-ksp-005',
        name: 'Complainant Resident, Kuriya',
        phone: '+91 94801 55678',
        email: 'citizen.puttur@dkpolice.gov.in'
      },
      assignedOfficerId: '5',
      assignedOfficerName: 'Puttur Town PS Officer',
      assignedOfficerBadge: 'KSP-PSI-PTR',
      department: 'Law & Order',
      unit: 'Puttur Town Division',
      jurisdiction: 'Dakshina Kannada District Police',
      supervisingOfficerName: 'DySP Puttur Sub-Division',
      supervisingOfficerRank: 'Deputy Superintendent of Police',
      supervisingOfficerUnit: 'Dakshina Kannada District Police',
      specializedUnit: 'Law & Order',
      applicableLaws: [
        'BNS Section 78 (Stalking)',
        'BNS Section 79 (Insulting Modesty of a Woman)'
      ],
      financialLossInr: 0,
      amountFrozenInr: 0,
      evidenceItems: [
        'Complainant Statement',
        'Eyewitness Statements',
        'Vehicle Registration Trace'
      ],
      deadlineHours: 48,
      deadlineDate: iso(6), // 6 hours remaining: in Pending-Work reminder territory!
      dueDate: iso(6),
      isOverdue: false,
      isEscalated: false,
      remindersSentCount: 1,
      createdAt: iso(-42),
      updatedAt: iso(-10),
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-005',
          officerId: '5',
          officerName: 'Puttur Town PS Officer',
          timestamp: iso(-18),
          remark: 'Motorcycle seized; statement recorded before magistrate under Section 183 BNSS.'
        }
      ]
    },
    {
      id: 'KSP-2026-POC-006',
      firNumber: '0034/2026',
      title: 'Institutional Sexual Harassment of Minors',
      titleKannada: 'ಸಂಸ್ಥೆಯ ಅಪ್ರಾಪ್ತ ಬಾಲಕರ ಮೇಲಿನ ಲೈಂಗಿಕ ಕಿರುಕುಳ ಪ್ರಕರಣ',
      description: 'Back-to-back cases registered against an institutional figure accused of sexually harassing two minor boys; handled under strict confidentiality protocols.',
      descriptionKannada: 'ಇಬ್ಬರು ಅಪ್ರಾಪ್ತ ಬಾಲಕರಿಗೆ ಲೈಂಗಿಕ ಕಿರುಕುಳ ನೀಡಿದ ಆರೋಪದಡಿ ಸಂಸ್ಥೆಯ ಮುಖಂಡನ ವಿರುದ್ಧ ಪೊಕ್ಸೊ (POCSO) ಕಾಯ್ದೆಯಡಿ ಕಠಿಣ ಗೌಪ್ಯತೆಯೊಂದಿಗೆ ದಾಖಲಾದ ಪ್ರಕರಣ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Women & Child Safety',
      subCategory: 'Institutional Abuse',
      priority: 'Urgent',
      status: 'escalated',
      severity: 'Critical',
      incidentDate: iso(-100),
      incidentLocation: {
        address: 'Institutional Premises, Mangaluru',
        city: 'Mangaluru',
        district: 'Mangaluru City',
        pinCode: '575001',
        lat: 12.8700,
        lng: 74.8800,
        nearestPoliceStation: "Mangaluru Women's Police Station"
      },
      citizen: {
        id: 'cit-ksp-006',
        name: 'Protected Minor Guardians & CWC Representative',
        phone: '+91 824 222 0000',
        email: 'cwc.mangaluru@karnataka.gov.in'
      },
      assignedOfficerId: '6',
      assignedOfficerName: "Confidential (Women's PS IO)",
      assignedOfficerBadge: 'KSP-WPI-MNG',
      department: "Women & Child Protection Desk",
      unit: 'Mangaluru City Police',
      jurisdiction: 'Mangaluru City Police',
      supervisingOfficerName: 'ACP Crime & Women Cell',
      supervisingOfficerRank: 'Assistant Commissioner of Police',
      supervisingOfficerUnit: 'Mangaluru City Police',
      specializedUnit: "Women & Child Protection Desk",
      applicableLaws: [
        'POCSO Act Sections 8 & 12',
        'BNS Section 75(2) (Sexual Harassment)'
      ],
      financialLossInr: 0,
      amountFrozenInr: 0,
      evidenceItems: [
        'Section 183 BNSS Magistrate Statement',
        'CWC Counseling Report',
        'Institutional Attendance Logs'
      ],
      deadlineHours: 24,
      deadlineDate: iso(-72), // Breached deadline by 72 hours -> Critical Escalation
      dueDate: iso(-72),
      isOverdue: true,
      isEscalated: true,
      remindersSentCount: 2,
      createdAt: iso(-96),
      updatedAt: iso(-20),
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-006',
          officerId: '6',
          officerName: "Confidential (Women's PS IO)",
          timestamp: iso(-48),
          remark: 'Mandatory CWC counseling completed; identity protected under Section 74 Juvenile Justice Act & POCSO guidelines.'
        }
      ]
    },
    {
      id: 'KSP-2026-MIS-007',
      firNumber: '0198/2026',
      title: 'Extortion & Verbal Abuse by Police Personnel',
      titleKannada: 'ಪೊಲೀಸ್ ಸಿಬ್ಬಂದಿಯಿಂದ ನಾಗರಿಕರ ಸುಲಿಗೆ ಮತ್ತು ಅವಾಚ್ಯ ನಿಂದನೆ',
      description: 'Criminal FIR registered and three police personnel (Hiranna Benni, Shivraj, and Umanath) arrested on charges of citizen extortion and verbal abuse.',
      descriptionKannada: 'ನಾಗರಿಕರಿಂದ ಅಕ್ರಮವಾಗಿ ಹಣ ಸುಲಿಗೆ ಮಾಡಿ ನಿಂದಿಸಿದ ಆರೋಪದಡಿ ಮಂಗಳೂರು ದಕ್ಷಿಣ ಠಾಣೆಯ ಮೂವರು ಪೊಲೀಸ್ ಸಿಬ್ಬಂದಿ (ಹಿರಣ್ಣ ಬೆಣ್ಣಿ, ಶಿವರಾಜ್, ಉಮಾನಾಥ್) ವಿರುದ್ಧ ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಿ ಅಮಾನತುಗೊಳಿಸಲಾಗಿದೆ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Corruption & Police Misconduct',
      subCategory: 'Extortion by Public Servants',
      priority: 'High',
      status: 'in_progress',
      severity: 'High',
      incidentDate: iso(-16),
      incidentLocation: {
        address: 'Pandeshwar Circle, Mangaluru South',
        city: 'Mangaluru',
        district: 'Mangaluru City',
        pinCode: '575001',
        lat: 12.8615,
        lng: 74.8398,
        nearestPoliceStation: 'Mangaluru South (Pandeshwar) Police Station'
      },
      citizen: {
        id: 'cit-ksp-007',
        name: 'Complainant Citizen (Extortion Victim)',
        phone: '+91 98800 77665',
        email: 'citizen.vigilance@mangaluru.gov.in'
      },
      assignedOfficerId: '7',
      assignedOfficerName: 'Mangaluru South PS Investigating Team',
      assignedOfficerBadge: 'KSP-INSP-MNGS',
      department: 'Internal Accountability / Law & Order',
      unit: 'Mangaluru South Division',
      jurisdiction: 'Mangaluru City',
      supervisingOfficerName: 'DCP Law & Order',
      supervisingOfficerRank: 'Deputy Commissioner of Police (IPS)',
      supervisingOfficerUnit: 'Mangaluru City',
      specializedUnit: 'Internal Accountability / Law & Order',
      applicableLaws: [
        'BNS Section 308(2) (Extortion)',
        'BNS Section 352 (Intentional Insult)',
        'BNS Section 3(5) (Common Intention)'
      ],
      financialLossInr: 50000,
      amountFrozenInr: 0,
      evidenceItems: [
        'Audio Recording of Threats',
        'UPI/Cash Transfer Proof',
        'Duty Roster Verification'
      ],
      deadlineHours: 24,
      deadlineDate: iso(12), // 12 hours remaining of 24h limit
      dueDate: iso(12),
      isOverdue: false,
      isEscalated: false,
      remindersSentCount: 0,
      createdAt: iso(-12),
      updatedAt: iso(-4),
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-007',
          officerId: '7',
          officerName: 'Mangaluru South PS Investigating Team',
          timestamp: iso(-6),
          remark: 'Zero-tolerance departmental action executed; accused police personnel placed under immediate suspension and remanded to judicial custody.'
        }
      ]
    },
    {
      id: 'LOK-2026-COR-008',
      firNumber: '0006/2026',
      title: '₹4 Lakh Bribery Trap in Chit Fund Fraud Probe',
      titleKannada: 'ಚಿಟ್‌ಫಂಡ್ ವಂಚನೆ ತನಿಖೆಯಲ್ಲಿ ₹೪ ಲಕ್ಷ ಲಂಚ ಸ್ವೀಕರಿಸುತ್ತಿದ್ದಾಗ ಲೋಕಾಯುಕ್ತ ಬಲೆ',
      description: 'Karnataka Lokayukta police trapped and arrested an official demanding and accepting a ₹4 lakh bribe to water down charges in a chit fund fraud probe.',
      descriptionKannada: 'ಚಿಟ್‌ಫಂಡ್ ವಂಚನೆ ಪ್ರಕರಣದ ಆರೋಪಿಗಳಿಗೆ ಅನುಕೂಲ ಮಾಡಿಕೊಡಲು ₹೪ ಲಕ್ಷ ಲಂಚದ ಹಣವನ್ನು ಪಡೆಯುತ್ತಿದ್ದ ಅಧಿಕಾರಿಯನ್ನು ಕರ್ನಾಟಕ ಲೋಕಾಯುಕ್ತ ಪೊಲೀಸರು ರೆಡ್‌ಹ್ಯಾಂಡಾಗಿ ಬಂಧಿಸಿದ್ದಾರೆ.',
      originalLanguage: 'en',
      isTranslated: true,
      isIrlCase: true,
      category: 'Corruption & Police Misconduct',
      subCategory: 'Lokayukta Trap',
      priority: 'High',
      status: 'closed',
      severity: 'High',
      incidentDate: iso(-84),
      incidentLocation: {
        address: 'Lokayukta Bhavan, Dr. B.R. Ambedkar Veedhi',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        pinCode: '560001',
        lat: 12.9792,
        lng: 77.5913,
        nearestPoliceStation: 'Karnataka Lokayukta Police Station (Bengaluru)'
      },
      citizen: {
        id: 'cit-lok-008',
        name: 'Complainant (Whistleblower in Chit Fund Case)',
        phone: '+91 94480 33221',
        email: 'whistleblower@lokayukta.kar.nic.in'
      },
      assignedOfficerId: '8',
      assignedOfficerName: 'Lokayukta Trap Team IO',
      assignedOfficerBadge: 'LOK-DySP-BLR',
      department: 'Karnataka Lokayukta Anti-Corruption Wing',
      unit: 'Bengaluru Urban Lokayukta Police',
      jurisdiction: 'Karnataka Lokayukta Command',
      supervisingOfficerName: 'Superintendent of Police (SP Lokayukta)',
      supervisingOfficerRank: 'Superintendent of Police (SP)',
      supervisingOfficerUnit: 'Karnataka Lokayukta Bengaluru City',
      specializedUnit: 'Karnataka Lokayukta Anti-Corruption Wing',
      applicableLaws: [
        'Prevention of Corruption Act Section 7',
        'BNS Section 61(2) (Criminal Conspiracy)'
      ],
      financialLossInr: 400000,
      amountFrozenInr: 400000,
      evidenceItems: [
        'Phenolphthalein Powder Trap Test',
        'Tainted Currency Note Numbers',
        'Call Audio Recording'
      ],
      deadlineHours: 48,
      deadlineDate: iso(-32),
      dueDate: iso(-32),
      isOverdue: false,
      isEscalated: false,
      remindersSentCount: 0,
      createdAt: iso(-80),
      updatedAt: iso(-40),
      resolution: {
        summary: 'Phenolphthalein trap test executed; official caught red-handed accepting ₹4,00,000 bribe. Arrested and produced before Special Court.',
        resolvedAt: iso(-40),
        resolvedByOfficerId: '8',
        resolvedByOfficerName: 'Lokayukta Trap Team IO'
      },
      documents: [],
      investigationRemarks: [
        {
          id: 'rem-008',
          officerId: '8',
          officerName: 'Lokayukta Trap Team IO',
          timestamp: iso(-45),
          remark: 'Successful phenolphthalein sodium carbonate trap test executed; tainted currency recovered and official remanded.'
        }
      ]
    }
  ];
}

export function generateCalibratedActionHistory(baseDate: Date = new Date()): ActionHistoryEntry[] {
  const baseMs = baseDate.getTime();
  const iso = (hoursOffset: number) => new Date(baseMs + hoursOffset * 3600 * 1000).toISOString();

  return [
    {
      id: 'hist-001',
      complaintId: 'KSP-2026-CYB-001',
      timestamp: iso(-6),
      userId: 'cit-ksp-001',
      userName: 'Confidential Senior Citizen Complainant (74 yrs)',
      userRole: 'citizen',
      action: 'Complaint Submitted',
      newStatus: 'submitted',
      description: 'Complaint registered online via National Cyber Crime Reporting Portal (1930 / CIVANTA) with 26 bank transaction receipts.'
    },
    {
      id: 'hist-002',
      complaintId: 'KSP-2026-CYB-001',
      timestamp: iso(-5.8),
      userId: 'system',
      userName: 'CIVANTA AI Engine',
      userRole: 'admin',
      action: 'AI Classification & Statutory Section Mapping',
      description: 'Offence identified as Digital Arrest Impersonation Extortion syndicate. Applicable laws invoked: BNS 318(4), 319(2), 308, IT Act 66D.',
      systemGenerated: true
    },
    {
      id: 'hist-003',
      complaintId: 'KSP-2026-CYB-001',
      timestamp: iso(-5.5),
      userId: 'system',
      userName: 'CIVANTA Assignment Engine',
      userRole: 'admin',
      action: 'Jurisdiction Assignment to State Command',
      newStatus: 'assigned',
      description: 'Assigned to Cyber Crime Investigation Team under Karnataka State Cyber Command.',
      systemGenerated: true
    },
    {
      id: 'hist-004',
      complaintId: 'KSP-2026-CYB-001',
      timestamp: iso(-3),
      userId: 'usr-officer-01',
      userName: 'Cyber Crime Investigation Team',
      userRole: 'junior_officer',
      action: 'Emergency Bank Freeze Directive',
      newStatus: 'in_progress',
      description: 'Lien markers issued to 23 mule accounts across 6 nodal banks. ₹4 Crore frozen successfully within first 3 hours.'
    },
    {
      id: 'hist-005',
      complaintId: 'KSP-2026-CYB-001',
      timestamp: iso(-2),
      userId: 'system',
      userName: 'CIVANTA Escalation Engine',
      userRole: 'admin',
      action: 'Automatic Escalation to State Command DGP',
      newStatus: 'in_progress',
      description: '₹24 Crore financial threshold triggers mandatory escalation to Director General of Police (DGP) Pranab Mohanty, IPS.',
      systemGenerated: true
    },
    {
      id: 'hist-006',
      complaintId: 'KSP-2026-CYB-002',
      timestamp: iso(-52),
      userId: 'cit-ksp-002',
      userName: 'Fintech Corporate Legal Officer',
      userRole: 'citizen',
      action: 'Complaint Submitted',
      newStatus: 'submitted',
      description: 'Corporate escrow hack reported: 301 unauthorized transactions draining ₹31.43 Crore from Varthur fintech firm.'
    },
    {
      id: 'hist-007',
      complaintId: 'KSP-2026-CYB-002',
      timestamp: iso(-4),
      userId: 'system',
      userName: 'CIVANTA SLA Monitor',
      userRole: 'admin',
      action: 'Deadline Violation Detected',
      previousStatus: 'in_progress',
      newStatus: 'overdue',
      description: '48-hour statutory recovery window elapsed; flagged as overdue on DCP Whitefield Division command dashboard.',
      systemGenerated: true
    },
    {
      id: 'hist-008',
      complaintId: 'KSP-SIT-EOW-003',
      timestamp: iso(-24),
      userId: 'cit-ksp-003',
      userName: 'Depositor Investor Association',
      userRole: 'citizen',
      action: 'SIT Consolidation & Filing',
      newStatus: 'in_progress',
      description: 'Over 1 lakh victims consolidated under KPID Act Section 9. Special Investigation Team (SIT) chief B.R. Ravikanthe Gowda, IPS taking charge.'
    },
    {
      id: 'hist-009',
      complaintId: 'KSP-2025-WOM-004',
      timestamp: iso(-72),
      userId: 'cit-ksp-004',
      userName: 'Complainant Student (21 yrs)',
      userRole: 'citizen',
      action: 'Distress Grievance Registered',
      newStatus: 'submitted',
      description: 'Stalking and physical assault reported outside Ladies PG in Ullal, Bengaluru.'
    },
    {
      id: 'hist-010',
      complaintId: 'KSP-2025-WOM-004',
      timestamp: iso(-36),
      userId: 'usr-officer-01',
      userName: 'Jnanabharathi PS Investigation Team',
      userRole: 'junior_officer',
      action: 'Accused Arrested & Case Resolved',
      previousStatus: 'in_progress',
      newStatus: 'resolved',
      description: 'CCTV footage confirmed suspect identity. Accused apprehended near Ullal and remanded under BNS Sections 78, 75, 115(2).'
    },
    {
      id: 'hist-011',
      complaintId: 'LOK-2026-COR-008',
      timestamp: iso(-40),
      userId: 'usr-officer-02',
      userName: 'Lokayukta Anti-Corruption Wing',
      userRole: 'junior_officer',
      action: 'Successful Anti-Corruption Trap Executed',
      previousStatus: 'in_progress',
      newStatus: 'closed',
      description: 'Phenolphthalein trap test executed; official caught red-handed accepting ₹4,00,000 bribe. Arrested and produced before Special Court.'
    }
  ];
}

export function generateCalibratedNotifications(baseDate: Date = new Date()): AppNotification[] {
  const baseMs = baseDate.getTime();
  const iso = (hoursOffset: number) => new Date(baseMs + hoursOffset * 3600 * 1000).toISOString();

  return [
    {
      id: 'notif-001',
      recipientId: 'usr-supervisor-01',
      recipientRole: 'senior_supervisor',
      complaintId: 'KSP-2026-CYB-001',
      category: 'Cybercrime',
      title: 'CRITICAL STATE ESCALATION: ₹24 Crore Digital Arrest Syndicate',
      message: 'Complaint KSP-2026-CYB-001 (FIR 0114/2026) active under State Cyber Command. ₹4 Crore frozen; Belagavi raid active.',
      messageKannada: 'ದೂರು KSP-2026-CYB-001 (ಎಫ್‌ಐಆರ್ ೦೧೧೪/೨೦೨೬) ರಾಜ್ಯ ಸೈಬರ್ ಕಮಾಂಡ್ ಅಡಿಯಲ್ಲಿ ಮೇಲ್ದರ್ಜೆಗೆ ಏರಿಸಲಾಗಿದೆ. ₹೪ ಕೋಟಿ ಮುಟ್ಟುಗೋಲು.',
      type: 'escalation',
      isRead: false,
      createdAt: iso(-2),
      priority: 'urgent'
    },
    {
      id: 'notif-002',
      recipientId: 'usr-supervisor-01',
      recipientRole: 'senior_supervisor',
      complaintId: 'KSP-2026-CYB-002',
      category: 'Cybercrime',
      title: 'SLA BREACH OVERDUE: ₹31.43 Crore Varthur Escrow Fraud',
      message: 'Complaint KSP-2026-CYB-002 (FIR 0595/2026) has exceeded 48-hr recovery SLA window. Whitefield CEN PS responding.',
      messageKannada: 'ದೂರು KSP-2026-CYB-002 ಗಡುವು ಮೀರಿದೆ. ವೈಟ್‌ಫೀಲ್ಡ್ ಸಿಇಎನ್ ಠಾಣೆ ತನಿಖೆ ನಡೆಸುತ್ತಿದೆ.',
      type: 'overdue',
      isRead: false,
      createdAt: iso(-4),
      priority: 'urgent'
    },
    {
      id: 'notif-003',
      recipientId: 'usr-supervisor-01',
      recipientRole: 'senior_supervisor',
      complaintId: 'KSP-SIT-EOW-003',
      category: 'Financial Fraud',
      title: 'SIT SPECIAL PROBE: IMA Multi-Crore Ponzi Scam Update',
      message: 'Case KSP-SIT-EOW-003 under SIT Chief B.R. Ravikanthe Gowda, IPS: ₹3,500 Crore assets attached under KPID Act.',
      messageKannada: 'ಪ್ರಕರಣ KSP-SIT-EOW-003: ಎಸ್‌ಐಟಿ ಮುಖ್ಯಸ್ಥ ಬಿ.ಆರ್. ರವಿಕಾಂತೇಗೌಡ, ಐಪಿಎಸ್ - ಕೆಪಿಐಡಿ ಕಾಯ್ದೆಯಡಿ ₹೩,೫೦೦ ಕೋಟಿ ಆಸ್ತಿ ಜಪ್ತಿ.',
      type: 'escalation',
      isRead: false,
      createdAt: iso(-12),
      priority: 'urgent'
    },
    {
      id: 'notif-004',
      recipientId: 'usr-citizen-01',
      recipientRole: 'citizen',
      complaintId: 'KSP-2025-WOM-004',
      category: 'Complaints Involving Individuals',
      title: 'Case Resolved: Stalking Suspect Apprehended in Ullal',
      message: 'Grievance KSP-2025-WOM-004 resolved. Accused arrested by Jnanabharathi PS and remanded to judicial custody.',
      messageKannada: 'ದೂರು KSP-2025-WOM-004 ಇತ್ಯರ್ಥಗೊಂಡಿದೆ. ಆರೋಪಿಯನ್ನು ಜ್ಞಾನಭಾರತಿ ಠಾಣೆ ಪೊಲೀಸರು ಬಂಧಿಸಿದ್ದಾರೆ.',
      type: 'resolution',
      isRead: false,
      createdAt: iso(-36),
      priority: 'high'
    },
    {
      id: 'notif-005',
      recipientId: 'usr-officer-01',
      recipientRole: 'junior_officer',
      complaintId: 'KSP-2026-POC-006',
      category: 'Complaints Involving Individuals',
      title: 'Sensitive Assignment: Institutional Abuse Complaint (POCSO)',
      message: 'KSP-2026-POC-006 assigned under strict confidentiality protocol. Mandatory Sec 183 BNSS Magistrate statement.',
      messageKannada: 'KSP-2026-POC-006 ರಹಸ್ಯ ಪ್ರೋಟೋಕಾಲ್ ಅಡಿಯಲ್ಲಿ ನಿಯೋಜಿಸಲಾಗಿದೆ. ಪೋಕ್ಸೋ ಕಾಯ್ದೆಯಡಿ ತನಿಖೆ.',
      type: 'assignment',
      isRead: false,
      createdAt: iso(-72),
      priority: 'urgent'
    },
    {
      id: 'notif-006',
      recipientId: 'usr-supervisor-01',
      recipientRole: 'senior_supervisor',
      complaintId: 'LOK-2026-COR-008',
      category: 'Financial Fraud',
      title: 'LOKAYUKTA TRAP SUCCESS: ₹4 Lakh Tainted Cash Seized',
      message: 'LOK-2026-COR-008 trap operation executed successfully. Accused remanded under Prevention of Corruption Act.',
      messageKannada: 'LOK-2026-COR-008 ಲೋಕಾಯುಕ್ತ ಬಲೆ ಯಶಸ್ವಿ: ₹೪ ಲಕ್ಷ ಲಂಚದ ಹಣ ವಶಕ್ಕೆ, ಭ್ರಷ್ಟಾಚಾರ ನಿಯಂತ್ರಣ ಕಾಯ್ದೆಯಡಿ ಪ್ರಕರಣ ದಾಖಲು.',
      type: 'resolution',
      isRead: false,
      createdAt: iso(-40),
      priority: 'urgent'
    }
  ];
}

// Canonical real-world demonstration data initialized with calibrated clock
export const IRL_DEMO_CASES: Complaint[] = generateCalibratedComplaints();
export const INITIAL_COMPLAINTS: Complaint[] = IRL_DEMO_CASES;
export const INITIAL_ACTION_HISTORY: ActionHistoryEntry[] = generateCalibratedActionHistory();
export const INITIAL_NOTIFICATIONS: AppNotification[] = generateCalibratedNotifications();
