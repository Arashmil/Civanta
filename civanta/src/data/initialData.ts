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

// 15 Rich preloaded Complaints covering all 15 scenarios and diverse lifecycle statuses
export const INITIAL_COMPLAINTS: Complaint[] = [
  // 1. Online payment fraud - OVERDUE & ESCALATED
  {
    id: 'CIV-2026-BLR-0101',
    title: 'Unauthorized UPI deduction of ₹45,000 via fake electricity bill link',
    titleKannada: 'ನಕಲಿ ವಿದ್ಯುತ್ ಬಿಲ್ ಲಿಂಕ್ ಮೂಲಕ ₹೪೫,೦೦೦ ಯುಪಿಐ ಅನಧಿಕೃತ ವರ್ಗಾವಣೆ',
    description: 'Received SMS stating electricity will be disconnected tonight. Clicked link and entered UPI PIN on simulated BESCOM portal. ₹45,000 deducted in 3 transactions to unknown VPA paytmqr2810@paytm.',
    descriptionKannada: 'ಇಂದು ರಾತ್ರಿ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಲಾಗುವುದು ಎಂದು ಎಸ್‌ಎಂಎಸ್ ಬಂದಿತ್ತು. ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ ನಕಲಿ ಬೆಸ್ಕಾಂ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಯುಪಿಐ ಪಿನ್ ನಮೂದಿಸಿದೆ. ಅಪರಿಚಿತ ಪೇಟಿಎಂ ವಿಪಿಎ ಖಾತೆಗೆ ಮೂರು ಕಂತುಗಳಲ್ಲಿ ₹೪೫,೦೦೦ ಕಡಿತಗೊಂಡಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Online Payment Fraud',
    aiSuggestedCategory: 'Online Payment Fraud',
    priority: 'Urgent',
    aiSuggestedPriority: 'Urgent',
    status: 'escalated',
    incidentDate: '2026-11-06T19:30:00Z',
    incidentLocation: {
      address: '7th Main, 4th Block, Jayanagar',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560011',
      lat: 12.9299,
      lng: 77.5833
    },
    citizen: {
      id: 'usr-citizen-01',
      name: 'Ramesh Gowda',
      phone: '+91 98450 12345',
      email: 'citizen@demo.com',
      aadhaarLast4: '8841'
    },
    assignedOfficerId: 'usr-officer-01',
    assignedOfficerName: 'PSI Anand Kumar',
    assignedOfficerBadge: 'KSP-PSI-2489',
    assignedAt: '2026-11-07T08:00:00Z',
    acknowledgedAt: '2026-11-07T08:15:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Digital Fraud Investigation Cell',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    createdAt: '2026-11-07T07:45:00Z',
    updatedAt: '2026-11-09T08:00:00Z',
    deadlineHours: 24,
    deadlineDate: '2026-11-08T08:00:00Z', // Past deadline
    isOverdue: true,
    overdueSince: '2026-11-08T08:00:00Z',
    isEscalated: true,
    escalatedAt: '2026-11-08T10:00:00Z',
    escalationReason: 'Statutory 24-hour urgent fraud freeze window breached without nodal bank notice dispatch.',
    remindersSentCount: 3,
    lastReminderSentAt: '2026-11-08T06:00:00Z',
    documents: [
      {
        id: 'doc-101-1',
        name: 'Bank_Statement_ICICI_Deduction.pdf',
        type: 'pdf',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        size: '1.2 MB',
        uploadedAt: '2026-11-07T07:45:00Z',
        uploadedBy: 'Ramesh Gowda'
      },
      {
        id: 'doc-101-2',
        name: 'Fake_SMS_Screenshot.png',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
        size: '640 KB',
        uploadedAt: '2026-11-07T07:45:00Z',
        uploadedBy: 'Ramesh Gowda'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-101-1',
        officerId: 'usr-officer-01',
        officerName: 'PSI Anand Kumar',
        timestamp: '2026-11-07T11:30:00Z',
        remark: 'Received complaint. Contacted Cyber Helpline 1930 to register transaction acknowledgement token.'
      },
      {
        id: 'rem-101-2',
        officerId: 'usr-supervisor-01',
        officerName: 'DySP Rajeshwari Hegde',
        timestamp: '2026-11-08T10:30:00Z',
        remark: 'Escalation Notice: Immediate requisition order served to Paytm Payments Bank Nodal officer for lien marker.'
      }
    ]
  },

  // 2. Suspicious cyber activity - IN PROGRESS
  {
    id: 'CIV-2026-BLR-0102',
    title: 'Phishing email campaign targeting apartment society residents with fake maintenance portal',
    titleKannada: 'ನಕಲಿ ನಿರ್ವಹಣಾ ಪೋರ್ಟಲ್ ಮೂಲಕ ಅಪಾರ್ಟ್‌ಮೆಂಟ್ ನಿವಾಸಿಗಳನ್ನು ಗುರಿಯಾಗಿಸಿದ ಫಿಶಿಂಗ್ ಇಮೇಲ್',
    description: 'Multiple residents of Brigade Meadows received spoofed emails requesting bank credential updates for society maintenance payments.',
    descriptionKannada: 'ಬ್ರಿಗೇಡ್ ಮೆಡೋಸ್ ಸೊಸೈಟಿ ನಿರ್ವಹಣಾ ಪಾವತಿಗಾಗಿ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಅಪ್‌ಡೇಟ್ ಮಾಡಲು ನಕಲಿ ಇಮೇಲ್‌ಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Suspicious Online Activity',
    aiSuggestedCategory: 'Suspicious Online Activity',
    priority: 'Medium',
    aiSuggestedPriority: 'Medium',
    status: 'in_progress',
    incidentDate: '2026-11-08T10:00:00Z',
    incidentLocation: {
      address: 'Brigade Meadows, Kanakapura Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560082',
      lat: 12.8344,
      lng: 77.5144
    },
    citizen: {
      id: 'usr-citizen-02',
      name: 'Sunitha Menon',
      phone: '+91 97401 22334',
      email: 's.menon@outlook.com'
    },
    assignedOfficerId: 'usr-officer-01',
    assignedOfficerName: 'PSI Anand Kumar',
    assignedOfficerBadge: 'KSP-PSI-2489',
    assignedAt: '2026-11-08T14:00:00Z',
    acknowledgedAt: '2026-11-08T14:20:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Digital Fraud Investigation Cell',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    createdAt: '2026-11-08T11:30:00Z',
    updatedAt: '2026-11-09T09:15:00Z',
    deadlineHours: 72,
    deadlineDate: '2026-11-11T14:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [
      {
        id: 'doc-102-1',
        name: 'Email_Header_Analysis.txt',
        type: 'document',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        size: '18 KB',
        uploadedAt: '2026-11-08T11:30:00Z',
        uploadedBy: 'Sunitha Menon'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-102-1',
        officerId: 'usr-officer-01',
        officerName: 'PSI Anand Kumar',
        timestamp: '2026-11-09T09:15:00Z',
        remark: 'Domain registrar identified as Namecheap. Issued CERT-In advisory and initiated DNS takedown request.'
      }
    ]
  },

  // 3. Lost mobile phone - RESOLVED (with citizen feedback)
  {
    id: 'CIV-2026-BLR-0103',
    title: 'Samsung Galaxy S23 Ultra misplaced at Kempegowda Majestic Metro Station',
    titleKannada: 'ಮೆಜೆಸ್ಟಿಕ್ ಮೆಟ್ರೋ ನಿಲ್ದಾಣದಲ್ಲಿ ಸ್ಯಾಮ್‌ಸಂಗ್ ಗ್ಯಾಲಕ್ಸಿ ಎಸ್೨೩ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದೆ',
    description: 'Black Samsung Galaxy S23 Ultra (IMEI: 356789123456789) dropped near security scanner gate 2 at Majestic interchange.',
    descriptionKannada: 'ಕಪ್ಪು ಬಣ್ಣದ ಸ್ಯಾಮ್‌ಸಂಗ್ ಗ್ಯಾಲಕ್ಸಿ ಎಸ್೨೩ ಅಲ್ಟ್ರಾ ಮೊಬೈಲ್ ಮೆಜೆಸ್ಟಿಕ್ ಇಂಟರ್‌ಚೇಂಜ್ ಸ್ಕ್ಯಾನರ್ ಗೇಟ್ ಬಳಿ ಕಳೆದುಹೋಗಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Lost Property',
    aiSuggestedCategory: 'Lost Property',
    priority: 'Medium',
    aiSuggestedPriority: 'Medium',
    status: 'resolved',
    incidentDate: '2026-11-05T17:15:00Z',
    incidentLocation: {
      address: 'Majestic Metro Station, Platform Concourse',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560009',
      lat: 12.9767,
      lng: 77.5713
    },
    citizen: {
      id: 'usr-citizen-01',
      name: 'Ramesh Gowda',
      phone: '+91 98450 12345',
      email: 'citizen@demo.com'
    },
    assignedOfficerId: 'usr-officer-04',
    assignedOfficerName: 'PSI Kavitha Reddy',
    assignedOfficerBadge: 'KSP-PSI-2940',
    assignedAt: '2026-11-05T18:00:00Z',
    acknowledgedAt: '2026-11-05T18:10:00Z',
    department: 'Lost & Found / Citizen Vigilance Wing',
    unit: 'Document & Gadget Tracing Squad',
    jurisdiction: 'Majestic & Railway Police Station Jurisdiction',
    createdAt: '2026-11-05T17:45:00Z',
    updatedAt: '2026-11-07T16:00:00Z',
    deadlineHours: 96,
    deadlineDate: '2026-11-09T18:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [
      {
        id: 'doc-103-1',
        name: 'Device_Purchase_Invoice.pdf',
        type: 'pdf',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
        size: '850 KB',
        uploadedAt: '2026-11-05T17:45:00Z',
        uploadedBy: 'Ramesh Gowda'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-103-1',
        officerId: 'usr-officer-04',
        officerName: 'PSI Kavitha Reddy',
        timestamp: '2026-11-06T10:00:00Z',
        remark: 'CEIR portal tracking enabled. Device was handed over by BMRCL security officer to Majestic Metro Outpost.'
      }
    ],
    resolution: {
      summary: 'Device recovered via CEIR database match with BMRCL Lost Property Depot. Verified physical serial and handed over to owner.',
      resolvedAt: '2026-11-07T16:00:00Z',
      resolvedByOfficerId: 'usr-officer-04',
      resolvedByOfficerName: 'PSI Kavitha Reddy',
      recoveryDetails: 'Samsung Galaxy S23 Ultra, S/N: R5CT30ABC, Handover Ack: BMRCL-LP-9821'
    },
    feedback: {
      rating: 5,
      comments: 'Extremely quick resolution! PSI Kavitha Reddy verified CCTV footage and recovered my phone within 48 hours. Heartfelt thanks to Karnataka Police!',
      submittedAt: '2026-11-07T17:30:00Z',
      satisfactionCategory: 'Very Satisfied'
    }
  },

  // 4. Lost identity documents - CLOSED
  {
    id: 'CIV-2026-BLR-0104',
    title: 'Loss of Original Passport, Aadhaar Card and Driving License in leather folder',
    titleKannada: 'ಮೂಲ ಪಾಸ್‌ಪೋರ್ಟ್, ಆಧಾರ್ ಮತ್ತು ಚಾಲನಾ ಪರವಾನಗಿ ಕಳೆದುಹೋಗಿದೆ',
    description: 'Black leather pouch containing Indian Passport (Z1298451), original Aadhaar Card and DL lost while traveling in BMTC Bus route 500D from Silk Board to Marathahalli.',
    descriptionKannada: 'ಸಿಲ್ಕ್ ಬೋರ್ಡ್‌ನಿಂದ ಮಾರತಹಳ್ಳಿಗೆ ಬಿಎಂಟಿಸಿ ೫೦೦ಡಿ ಬಸ್‌ನಲ್ಲಿ ಪ್ರಯಾಣಿಸುವಾಗ ಪಾಸ್‌ಪೋರ್ಟ್ ಮತ್ತು ಆಧಾರ್ ಕಾರ್ಡ್ ಒಳಗೊಂಡ ಪೌಚ್ ಕಳೆದುಹೋಗಿದೆ.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Lost Property',
    aiSuggestedCategory: 'Lost Property',
    priority: 'Low',
    aiSuggestedPriority: 'Low',
    status: 'closed',
    incidentDate: '2026-11-01T09:00:00Z',
    incidentLocation: {
      address: 'Outer Ring Road, Near Bellandur Junction',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560103',
      lat: 12.926,
      lng: 77.6762
    },
    citizen: {
      id: 'usr-citizen-03',
      name: 'Aditi Deshmukh',
      phone: '+91 99801 44556',
      email: 'aditi.d@techcorp.in'
    },
    assignedOfficerId: 'usr-officer-04',
    assignedOfficerName: 'PSI Kavitha Reddy',
    assignedOfficerBadge: 'KSP-PSI-2940',
    assignedAt: '2026-11-01T11:00:00Z',
    acknowledgedAt: '2026-11-01T11:20:00Z',
    department: 'Lost & Found / Citizen Vigilance Wing',
    unit: 'Document & Gadget Tracing Squad',
    jurisdiction: 'Majestic & Railway Police Station Jurisdiction',
    createdAt: '2026-11-01T10:15:00Z',
    updatedAt: '2026-11-04T12:00:00Z',
    deadlineHours: 120,
    deadlineDate: '2026-11-06T11:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [],
    investigationRemarks: [
      {
        id: 'rem-104-1',
        officerId: 'usr-officer-04',
        officerName: 'PSI Kavitha Reddy',
        timestamp: '2026-11-02T15:00:00Z',
        remark: 'Issued official digitally signed Non-Cognizable Lost Report (LDR No: BLR-LDR-2026-8819) for passport re-issuance.'
      }
    ],
    resolution: {
      summary: 'Non-Cognizable Lost Article Report (LDR) issued and communicated to Regional Passport Office (RPO Bengaluru).',
      resolvedAt: '2026-11-03T11:00:00Z',
      resolvedByOfficerId: 'usr-officer-04',
      resolvedByOfficerName: 'PSI Kavitha Reddy',
      firNumber: 'LDR-2026-8819'
    },
    feedback: {
      rating: 5,
      comments: 'Received my digital lost document certificate without having to visit the station physically.',
      submittedAt: '2026-11-04T10:00:00Z',
      satisfactionCategory: 'Very Satisfied'
    }
  },

  // 5. Online shopping fraud - ASSIGNED
  {
    id: 'CIV-2026-BLR-0105',
    title: 'Deceptive electronics marketplace scam via clone portal "buy-deals-karnataka.shop"',
    titleKannada: 'ನಕಲಿ ಶಾಪಿಂಗ್ ಜಾಲತಾಣದ ಮೂಲಕ ₹೨೮,೫೦೦ ರೂಪಾಯಿ ವಂಚನೆ',
    description: 'Ordered flagship camera lens for ₹28,500. Order confirmation received but seller contact disconnected. Domain hosted on foreign server.',
    descriptionKannada: 'ಕ್ಯಾಮೆರಾ ಲೆನ್ಸ್‌ಗಾಗಿ ₹೨೮,೫೦೦ ಪಾವತಿಸಲಾಗಿದೆ. ನಂತರ ವೆಬ್‌ಸೈಟ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Online Payment Fraud',
    aiSuggestedCategory: 'Online Payment Fraud',
    priority: 'High',
    aiSuggestedPriority: 'High',
    status: 'assigned',
    incidentDate: '2026-11-08T16:00:00Z',
    incidentLocation: {
      address: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560038',
      lat: 12.9719,
      lng: 77.6412
    },
    citizen: {
      id: 'usr-citizen-04',
      name: 'Kiran Varun',
      phone: '+91 99002 11988',
      email: 'kiran.varun@gmail.com'
    },
    assignedOfficerId: 'usr-officer-02',
    assignedOfficerName: 'PSI Deepa Nayak',
    assignedOfficerBadge: 'KSP-PSI-2612',
    assignedAt: '2026-11-09T09:00:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Social Media & Identity Theft Cell',
    jurisdiction: 'Bengaluru East Cyber Cell',
    createdAt: '2026-11-09T08:30:00Z',
    updatedAt: '2026-11-09T09:00:00Z',
    deadlineHours: 48,
    deadlineDate: '2026-11-11T09:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [
      {
        id: 'doc-105-1',
        name: 'Razorpay_Transaction_Challan.pdf',
        type: 'pdf',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        size: '420 KB',
        uploadedAt: '2026-11-09T08:30:00Z',
        uploadedBy: 'Kiran Varun'
      }
    ],
    investigationRemarks: []
  },

  // 6. Theft - OVERDUE (Approaching Escalation)
  {
    id: 'CIV-2026-BLR-0106',
    title: 'Two-wheeler theft of Royal Enfield Classic 350 from commercial complex parking',
    titleKannada: 'ವಾಣಿಜ್ಯ ಸಂಕೀರ್ಣದ ಪಾರ್ಕಿಂಗ್‌ನಿಂದ ರಾಯಲ್ ಎನ್‌ಫೀಲ್ಡ್ ಬೈಕ್ ಕಳ್ಳತನ',
    description: 'Black Royal Enfield Classic 350 (KA-04-EL-9902) stolen from basement parking between 2 PM and 6 PM. Security CCTV shows helmet-wearing individual unlocking ignition.',
    descriptionKannada: 'ಕಪ್ಪು ರಾಯಲ್ ಎನ್‌ಫೀಲ್ಡ್ ಕ್ಲಾಸಿಕ್ ಬೈಕ್ (KA-04-EL-9902) ಬೇಸ್‌ಮೆಂಟ್ ಪಾರ್ಕಿಂಗ್‌ನಿಂದ ಕಳವು ಮಾಡಲಾಗಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Theft',
    aiSuggestedCategory: 'Theft',
    priority: 'High',
    aiSuggestedPriority: 'High',
    status: 'overdue',
    incidentDate: '2026-11-05T14:30:00Z',
    incidentLocation: {
      address: 'Brigade Road, Commercial Area',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560001',
      lat: 12.9733,
      lng: 77.6074
    },
    citizen: {
      id: 'usr-citizen-05',
      name: 'Venkatesh Murthy',
      phone: '+91 94498 77123',
      email: 'venky.m@yahoo.com'
    },
    assignedOfficerId: 'usr-officer-03',
    assignedOfficerName: 'PI Vinayaka Murthy',
    assignedOfficerBadge: 'KSP-PI-1870',
    assignedAt: '2026-11-05T18:00:00Z',
    acknowledgedAt: '2026-11-05T18:30:00Z',
    department: 'Law & Order Police Station',
    unit: 'Property Crimes & Theft Squad',
    jurisdiction: 'Cubbon Park Police Station Limits',
    createdAt: '2026-11-05T17:00:00Z',
    updatedAt: '2026-11-09T10:00:00Z',
    deadlineHours: 72,
    deadlineDate: '2026-11-08T18:00:00Z', // 72 hours breached
    isOverdue: true,
    overdueSince: '2026-11-08T18:00:00Z',
    isEscalated: false,
    remindersSentCount: 2,
    lastReminderSentAt: '2026-11-08T12:00:00Z',
    documents: [
      {
        id: 'doc-106-1',
        name: 'RC_Smart_Card_Copy.pdf',
        type: 'pdf',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
        size: '1.1 MB',
        uploadedAt: '2026-11-05T17:00:00Z',
        uploadedBy: 'Venkatesh Murthy'
      },
      {
        id: 'doc-106-2',
        name: 'CCTV_Video_Frame.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
        size: '890 KB',
        uploadedAt: '2026-11-05T17:00:00Z',
        uploadedBy: 'Venkatesh Murthy'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-106-1',
        officerId: 'usr-officer-03',
        officerName: 'PI Vinayaka Murthy',
        timestamp: '2026-11-06T11:00:00Z',
        remark: 'FIR Registered (Crime No: 142/2026). Vehicle registration number broadcasted across toll plazas and ANPR camera network.'
      }
    ]
  },

  // 7. Missing property - PENDING INFORMATION
  {
    id: 'CIV-2026-BLR-0107',
    title: 'Disappearance of luggage trunk containing family ancestral silver ornaments during interstate transit',
    titleKannada: 'ಬೆಂಗಳೂರು-ಮೈಸೂರು ಬಸ್ ಪ್ರಯಾಣದ ವೇಳೆ ಬೆಳ್ಳಿ ಆಭರಣಗಳಿದ್ದ ಲಗೇಜ್ ಕಣ್ಮರೆ',
    description: 'During KSRTC Airavat journey from Mysuru to Bengaluru, metallic trunk with antique silver vessels and family heirloom went missing from lower boot.',
    descriptionKannada: 'ಮೈಸೂರಿನಿಂದ ಬೆಂಗಳೂರಿಗೆ ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ ಬಸ್ ಪ್ರಯಾಣದ ವೇಳೆ ಲಗೇಜ್ ಬೂಟ್‌ನಿಂದ ಬೆಳ್ಳಿ ಆಭರಣಗಳಿದ್ದ ಪೆಟ್ಟಿಗೆ ನಾಪತ್ತೆಯಾಗಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Lost Property',
    aiSuggestedCategory: 'Lost Property',
    priority: 'Medium',
    aiSuggestedPriority: 'Medium',
    status: 'pending',
    incidentDate: '2026-11-07T12:00:00Z',
    incidentLocation: {
      address: 'KSRTC Shantinagar Bus Station',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560027',
      lat: 12.9547,
      lng: 77.5954
    },
    citizen: {
      id: 'usr-citizen-06',
      name: 'Padmavathi Bhat',
      phone: '+91 98441 66554',
      email: 'padma.bhat@gmail.com'
    },
    assignedOfficerId: 'usr-officer-04',
    assignedOfficerName: 'PSI Kavitha Reddy',
    assignedOfficerBadge: 'KSP-PSI-2940',
    assignedAt: '2026-11-07T15:00:00Z',
    acknowledgedAt: '2026-11-07T15:30:00Z',
    department: 'Lost & Found / Citizen Vigilance Wing',
    unit: 'Document & Gadget Tracing Squad',
    jurisdiction: 'Majestic & Railway Police Station Jurisdiction',
    createdAt: '2026-11-07T14:15:00Z',
    updatedAt: '2026-11-08T16:00:00Z',
    deadlineHours: 96,
    deadlineDate: '2026-11-11T15:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [],
    investigationRemarks: [
      {
        id: 'rem-107-1',
        officerId: 'usr-officer-04',
        officerName: 'PSI Kavitha Reddy',
        timestamp: '2026-11-08T16:00:00Z',
        remark: 'Action pending: Citizen requested to provide KSRTC ticket PNR and baggage tag counterfoil to retrieve conductor logsheet.'
      }
    ]
  },

  // 8. Harassment - URGENT & IN PROGRESS
  {
    id: 'CIV-2026-BLR-0108',
    title: 'Repeated stalking and intimidation via abusive WhatsApp messages and calls from unknown numbers',
    titleKannada: 'ಅಪರಿಚಿತ ಸಂಖ್ಯೆಗಳಿಂದ ನಿರಂತರ ವಾಟ್ಸಾಪ್ ಬೆದರಿಕೆ ಸಂದೇಶಗಳು ಮತ್ತು ಕರೆಗಳು',
    description: 'Complainant receiving threatening voice notes and morphed picture messages from 4 disposable VoIP numbers demanding extortion money.',
    descriptionKannada: '೪ ವಿವಿಧ ಸಂಖ್ಯೆಗಳಿಂದ ನಿರಂತರವಾಗಿ ಬೆದರಿಕೆ ಧ್ವನಿ ಸಂದೇಶಗಳು ಮತ್ತು ತಿರುಚಿದ ಫೋಟೋಗಳನ್ನು ಕಳುಹಿಸಿ ಹಣಕ್ಕಾಗಿ ಪೀಡಿಸಲಾಗುತ್ತಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Harassment',
    aiSuggestedCategory: 'Harassment',
    priority: 'Urgent',
    aiSuggestedPriority: 'Urgent',
    status: 'in_progress',
    incidentDate: '2026-11-08T22:00:00Z',
    incidentLocation: {
      address: 'Koramangala 5th Block',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560095',
      lat: 12.9352,
      lng: 77.6245
    },
    citizen: {
      id: 'usr-citizen-07',
      name: 'Pooja Hegde',
      phone: '+91 97410 88991',
      email: 'pooja.h@enterprise.in'
    },
    assignedOfficerId: 'usr-officer-02',
    assignedOfficerName: 'PSI Deepa Nayak',
    assignedOfficerBadge: 'KSP-PSI-2612',
    assignedAt: '2026-11-09T01:00:00Z',
    acknowledgedAt: '2026-11-09T01:15:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Social Media & Identity Theft Cell',
    jurisdiction: 'Bengaluru East Cyber Cell',
    createdAt: '2026-11-09T00:30:00Z',
    updatedAt: '2026-11-09T07:00:00Z',
    deadlineHours: 24,
    deadlineDate: '2026-11-10T01:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [
      {
        id: 'doc-108-1',
        name: 'Chat_Transcripts_Screenshots.zip',
        type: 'document',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        size: '3.4 MB',
        uploadedAt: '2026-11-09T00:30:00Z',
        uploadedBy: 'Pooja Hegde'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-108-1',
        officerId: 'usr-officer-02',
        officerName: 'PSI Deepa Nayak',
        timestamp: '2026-11-09T07:00:00Z',
        remark: 'Section 354D IPC and 67A IT Act invoked. WhatsApp Nodal grievance served for CDR, IP logs and user device fingerprint.'
      }
    ]
  },

  // 9. Fake social media account - IN PROGRESS
  {
    id: 'CIV-2026-BLR-0109',
    title: 'Impersonation profile created on Instagram using complainant photos soliciting monetary donations',
    titleKannada: 'ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್‌ನಲ್ಲಿ ನಕಲಿ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ ಹಣ ಸಂಗ್ರಹಿಸುತ್ತಿರುವುದು',
    description: 'Fake handle @shwetha_bhat_official copied complainant photographs and is soliciting medical donation funds from mutual acquaintances.',
    descriptionKannada: 'ನನ್ನ ಛಾಯಾಚಿತ್ರಗಳನ್ನು ದುರ್ಬಳಕೆ ಮಾಡಿಕೊಂಡು ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್‌ನಲ್ಲಿ ನಕಲಿ ಖಾತೆ ತೆರೆದು ಸ್ನೇಹಿತರಿಂದ ಚಿಕಿತ್ಸೆ ನೆಪದಲ್ಲಿ ಹಣ ವಸೂಲಿ ಮಾಡಲಾಗುತ್ತಿದೆ.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Fake Social Media Account',
    aiSuggestedCategory: 'Fake Social Media Account',
    priority: 'Medium',
    aiSuggestedPriority: 'Medium',
    status: 'in_progress',
    incidentDate: '2026-11-07T18:00:00Z',
    incidentLocation: {
      address: 'Malleshwaram 18th Cross',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560055',
      lat: 13.0031,
      lng: 77.5643
    },
    citizen: {
      id: 'usr-citizen-08',
      name: 'Shwetha Bhat',
      phone: '+91 94800 33441',
      email: 'shwetha.b@gmail.com'
    },
    assignedOfficerId: 'usr-officer-02',
    assignedOfficerName: 'PSI Deepa Nayak',
    assignedOfficerBadge: 'KSP-PSI-2612',
    assignedAt: '2026-11-08T09:00:00Z',
    acknowledgedAt: '2026-11-08T09:30:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Social Media & Identity Theft Cell',
    jurisdiction: 'Bengaluru East Cyber Cell',
    createdAt: '2026-11-08T08:15:00Z',
    updatedAt: '2026-11-09T09:40:00Z',
    deadlineHours: 72,
    deadlineDate: '2026-11-11T09:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [
      {
        id: 'doc-109-1',
        name: 'Instagram_Fake_Profile_Screenshot.png',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
        size: '520 KB',
        uploadedAt: '2026-11-08T08:15:00Z',
        uploadedBy: 'Shwetha Bhat'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-109-1',
        officerId: 'usr-officer-02',
        officerName: 'PSI Deepa Nayak',
        timestamp: '2026-11-09T09:40:00Z',
        remark: 'Emergency Law Enforcement Request sent to Meta (Instagram) for preservation of IP logs and permanent profile suspension.'
      }
    ]
  },

  // 10. Suspicious financial transaction - NEWLY REGISTERED / SUBMITTED
  {
    id: 'CIV-2026-BLR-0110',
    title: 'Multiple rapid unauthorized overseas micro-debits on International Credit Card',
    titleKannada: 'ಅಂತಾರಾಷ್ಟ್ರೀಯ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಅನುಮಾನಾಸ್ಪದ ಸಾಗರೋತ್ತರ ವಹಿವಾಟುಗಳು',
    description: '14 rapid micro-transactions of $1.99 and $4.50 totaling ₹18,400 routed via foreign merchant "Dublin Services LLC" without OTP generation.',
    descriptionKannada: 'ಓಟಿಪಿ ಬಾರದೆ ವಿದೇಶಿ ವ್ಯಾಪಾರಿ ಹೆಸರಿನಲ್ಲಿ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ನಿಂದ ೧೪ ವಹಿವಾಟುಗಳಲ್ಲಿ ₹೧೮,೪೦೦ ಕಡಿತಗೊಂಡಿದೆ.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Online Payment Fraud',
    aiSuggestedCategory: 'Online Payment Fraud',
    priority: 'High',
    aiSuggestedPriority: 'High',
    status: 'submitted',
    incidentDate: '2026-11-09T14:00:00Z',
    incidentLocation: {
      address: 'Whitefield Main Road, ITPL Area',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560066',
      lat: 12.9866,
      lng: 77.7376
    },
    citizen: {
      id: 'usr-citizen-09',
      name: 'Naveen Somesh',
      phone: '+91 99450 99882',
      email: 'naveen.somesh@tech.com'
    },
    department: 'Cyber Crime Police Division',
    unit: 'Digital Fraud Investigation Cell',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    createdAt: '2026-11-09T15:00:00Z',
    updatedAt: '2026-11-09T15:00:00Z',
    deadlineHours: 48,
    deadlineDate: '2026-11-11T15:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [],
    investigationRemarks: []
  },

  // 11. Cyber impersonation - ESCALATED
  {
    id: 'CIV-2026-BLR-0111',
    title: 'CEO fraud / Spear-phishing email impersonating startup managing director instructing CFO to wire ₹12 Lakhs',
    titleKannada: 'ಸಿಇಒ ಹೆಸರಿನಲ್ಲಿ ನಕಲಿ ಇಮೇಲ್ ಕಳುಹಿಸಿ ₹೧೨ ಲಕ್ಷ ವರ್ಗಾವಣೆಗೆ ಯತ್ನ',
    description: 'CFO received urgent spoofed directive from lookalike domain ceo@fintech-ventures.co instructing vendor payment wire to a newly opened Yes Bank current account in Jaipur.',
    descriptionKannada: 'ಕಂಪನಿಯ ಸಿಇಒ ಅವರ ಅಧಿಕೃತ ಇಮೇಲ್ ಹೋಲುವ ನಕಲಿ ಖಾತೆಯಿಂದ ₹೧೨ ಲಕ್ಷ ವರ್ಗಾವಣೆಗೆ ಆದೇಶಿಸಲಾಗಿತ್ತು.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Cybercrime',
    aiSuggestedCategory: 'Cybercrime',
    priority: 'Urgent',
    aiSuggestedPriority: 'Urgent',
    status: 'escalated',
    incidentDate: '2026-11-07T11:00:00Z',
    incidentLocation: {
      address: 'HSR Layout Sector 2',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560102',
      lat: 12.9116,
      lng: 77.6389
    },
    citizen: {
      id: 'usr-citizen-10',
      name: 'Varun Singhania',
      phone: '+91 98860 11002',
      email: 'varun.s@fintech-ventures.com'
    },
    assignedOfficerId: 'usr-officer-01',
    assignedOfficerName: 'PSI Anand Kumar',
    assignedOfficerBadge: 'KSP-PSI-2489',
    assignedAt: '2026-11-07T13:00:00Z',
    acknowledgedAt: '2026-11-07T13:30:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Digital Fraud Investigation Cell',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    createdAt: '2026-11-07T12:00:00Z',
    updatedAt: '2026-11-09T11:00:00Z',
    deadlineHours: 24,
    deadlineDate: '2026-11-08T13:00:00Z',
    isOverdue: true,
    overdueSince: '2026-11-08T13:00:00Z',
    isEscalated: true,
    escalatedAt: '2026-11-08T15:30:00Z',
    escalationReason: 'High financial exposure (₹12 Lakhs) with unserved inter-state bank freeze warrant.',
    remindersSentCount: 3,
    lastReminderSentAt: '2026-11-08T11:00:00Z',
    documents: [
      {
        id: 'doc-111-1',
        name: 'Spoofed_Raw_Email_Headers.eml',
        type: 'document',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        size: '56 KB',
        uploadedAt: '2026-11-07T12:00:00Z',
        uploadedBy: 'Varun Singhania'
      }
    ],
    investigationRemarks: [
      {
        id: 'rem-111-1',
        officerId: 'usr-supervisor-01',
        officerName: 'DySP Rajeshwari Hegde',
        timestamp: '2026-11-08T16:00:00Z',
        remark: 'Supervisor Intervention: Directly contacted nodal desk at Yes Bank HQ to freeze beneficiary account and alerted Rajasthan Police cyber cell.'
      }
    ]
  },

  // 12. Lost wallet - RESOLVED
  {
    id: 'CIV-2026-BLR-0112',
    title: 'Brown leather wallet containing PAN card, cash ₹3,200 and Metro pass misplaced in Cubbon Park',
    titleKannada: 'ಕಬ್ಬನ್ ಪಾರ್ಕ್‌ನಲ್ಲಿ ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಮತ್ತು ₹೩,೨೦೦ ನಗದು ಇದ್ದ ವಾಲೆಟ್ ಕಳೆದುಹೋಗಿದೆ',
    description: 'Misplaced brown Tommy Hilfiger wallet near King Edward statue walking track during morning run.',
    descriptionKannada: 'ಬೆಳಗಿನ ವಾಕಿಂಗ್ ವೇಳೆ ಕಬ್ಬನ್ ಪಾರ್ಕ್‌ನಲ್ಲಿ ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಮತ್ತು ನಗದು ಇದ್ದ ವಾಲೆಟ್ ಕಳೆದುಹೋಗಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Lost Property',
    aiSuggestedCategory: 'Lost Property',
    priority: 'Low',
    aiSuggestedPriority: 'Low',
    status: 'resolved',
    incidentDate: '2026-11-06T07:00:00Z',
    incidentLocation: {
      address: 'Cubbon Park Walking Track, Kasturba Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560001',
      lat: 12.9757,
      lng: 77.5929
    },
    citizen: {
      id: 'usr-citizen-11',
      name: 'Gururaj Joshi',
      phone: '+91 97420 55667',
      email: 'guru.joshi@karnataka.gov.in'
    },
    assignedOfficerId: 'usr-officer-03',
    assignedOfficerName: 'PI Vinayaka Murthy',
    assignedOfficerBadge: 'KSP-PI-1870',
    assignedAt: '2026-11-06T09:00:00Z',
    acknowledgedAt: '2026-11-06T09:15:00Z',
    department: 'Law & Order Police Station',
    unit: 'Property Crimes & Theft Squad',
    jurisdiction: 'Cubbon Park Police Station Limits',
    createdAt: '2026-11-06T08:30:00Z',
    updatedAt: '2026-11-07T12:00:00Z',
    deadlineHours: 120,
    deadlineDate: '2026-11-11T09:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [],
    investigationRemarks: [
      {
        id: 'rem-112-1',
        officerId: 'usr-officer-03',
        officerName: 'PI Vinayaka Murthy',
        timestamp: '2026-11-06T15:00:00Z',
        remark: 'Park security guard deposited wallet at station reception. Contacted owner through identity card details.'
      }
    ],
    resolution: {
      summary: 'Wallet with intact PAN card, ₹3,200 cash and cards successfully returned to citizen upon biometric identity verification.',
      resolvedAt: '2026-11-07T11:00:00Z',
      resolvedByOfficerId: 'usr-officer-03',
      resolvedByOfficerName: 'PI Vinayaka Murthy',
      recoveryDetails: 'Items intact, verified by station duty officer.'
    },
    feedback: {
      rating: 5,
      comments: 'Horticulture guard and Cubbon Park police showed high integrity. Wallet returned with every rupee intact.',
      submittedAt: '2026-11-07T14:00:00Z',
      satisfactionCategory: 'Very Satisfied'
    }
  },

  // 13. Unauthorized account access - IN PROGRESS
  {
    id: 'CIV-2026-BLR-0113',
    title: 'Unauthorized takeover of cloud corporate email server via session token hijacking',
    titleKannada: 'ಕ್ಲೌಡ್ ಇಮೇಲ್ ಸರ್ವರ್ ಅನಧಿಕೃತ ಹ್ಯಾಕಿಂಗ್ ಮತ್ತು ನಿಯಂತ್ರಣ ಕಳೆದುಕೊಳ್ಳುವಿಕೆ',
    description: 'Admin credentials breached using infostealer malware; recovery phone and 2FA keys changed to an unknown Russian domain.',
    descriptionKannada: 'ಕ್ಲೌಡ್ ಅಡ್ಮಿನ್ ಇಮೇಲ್ ಖಾತೆಯನ್ನು ಹ್ಯಾಕ್ ಮಾಡಿ ೨ಎಫ್‌ಎ ಭದ್ರತಾ ಕೀಗಳನ್ನು ಬದಲಾಯಿಸಲಾಗಿದೆ.',
    originalLanguage: 'en',
    isTranslated: true,
    category: 'Cybercrime',
    aiSuggestedCategory: 'Cybercrime',
    priority: 'High',
    aiSuggestedPriority: 'High',
    status: 'in_progress',
    incidentDate: '2026-11-08T20:00:00Z',
    incidentLocation: {
      address: 'Kalyan Nagar 2nd Block',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560043',
      lat: 13.0238,
      lng: 77.6432
    },
    citizen: {
      id: 'usr-citizen-12',
      name: 'Pradeep Shenoy',
      phone: '+91 94488 22119',
      email: 'pshenoy@cloudsystems.co'
    },
    assignedOfficerId: 'usr-officer-01',
    assignedOfficerName: 'PSI Anand Kumar',
    assignedOfficerBadge: 'KSP-PSI-2489',
    assignedAt: '2026-11-09T08:00:00Z',
    acknowledgedAt: '2026-11-09T08:20:00Z',
    department: 'Cyber Crime Police Division',
    unit: 'Digital Fraud Investigation Cell',
    jurisdiction: 'Cyber Crime Police Station - South Division',
    createdAt: '2026-11-09T07:15:00Z',
    updatedAt: '2026-11-09T09:30:00Z',
    deadlineHours: 48,
    deadlineDate: '2026-11-11T08:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [],
    investigationRemarks: [
      {
        id: 'rem-113-1',
        officerId: 'usr-officer-01',
        officerName: 'PSI Anand Kumar',
        timestamp: '2026-11-09T09:30:00Z',
        remark: 'Issued statutory notice under Section 91 CrPC to Microsoft Security Incident Response team to isolate tenant.'
      }
    ]
  },

  // 14. Online marketplace fraud - AWAITING ASSIGNMENT
  {
    id: 'CIV-2026-BLR-0114',
    title: 'Advance token payment fraud of ₹15,000 on secondhand marketplace app OLX for motorcycle',
    titleKannada: 'ಸೆಕೆಂಡ್‌ಹ್ಯಾಂಡ್ ಬೈಕ್ ಹೆಸರಿನಲ್ಲಿ ಓಎಲ್‌ಎಕ್ಸ್‌ನಲ್ಲಿ ₹೧೫,೦೦೦ ಮುಂಗಡ ಪಡೆದು ವಂಚನೆ',
    description: 'Seller posed as defense personnel transferring out of town, insisted on ₹15,000 gate-pass clearance fee via QR code scan.',
    descriptionKannada: 'ಸೇನಾಧಿಕಾರಿ ಸೋಗಿನಲ್ಲಿ ಬೈಕ್ ಮಾರಾಟದ ನೆಪದಲ್ಲಿ ಕ್ಯೂಆರ್ ಕೋಡ್ ಮೂಲಕ ₹೧೫,೦೦೦ ಮುಂಗಡ ಪಡೆದು ವಂಚಿಸಲಾಗಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Online Payment Fraud',
    aiSuggestedCategory: 'Online Payment Fraud',
    priority: 'Medium',
    aiSuggestedPriority: 'Medium',
    status: 'awaiting_assignment',
    incidentDate: '2026-11-09T11:00:00Z',
    incidentLocation: {
      address: 'Yelahanka New Town',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560064',
      lat: 13.1007,
      lng: 77.5963
    },
    citizen: {
      id: 'usr-citizen-13',
      name: 'Chethan Gowda',
      phone: '+91 98801 77665',
      email: 'chethan.g@rediffmail.com'
    },
    department: 'Cyber Crime Police Division',
    unit: 'Social Media & Identity Theft Cell',
    jurisdiction: 'Bengaluru East Cyber Cell',
    createdAt: '2026-11-09T12:30:00Z',
    updatedAt: '2026-11-09T12:30:00Z',
    deadlineHours: 72,
    deadlineDate: '2026-11-12T12:30:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [
      {
        id: 'doc-114-1',
        name: 'Army_Canteen_Fake_ID_Card.png',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600',
        size: '340 KB',
        uploadedAt: '2026-11-09T12:30:00Z',
        uploadedBy: 'Chethan Gowda'
      }
    ],
    investigationRemarks: []
  },

  // 15. General police complaint - REOPENED BY CITIZEN
  {
    id: 'CIV-2026-BLR-0115',
    title: 'Persistent illegal sound amplifier blasting past 11 PM and public thoroughfare obstruction by unauthorized event shed',
    titleKannada: 'ರಾತ್ರಿ ೧೧ ಗಂಟೆಯ ನಂತರವೂ ಅಕ್ರಮ ಧ್ವನಿವರ್ಧಕಗಳ ಬಳಕೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ರಸ್ತೆ ತಡೆ',
    description: 'Local organizers erected temporary marquee blocking main residential street and blasting high-decibel amplifiers despite Supreme Court silence zone regulations.',
    descriptionKannada: 'ವಸತಿ ಪ್ರದೇಶದ ರಸ್ತೆಯನ್ನು ಅಕ್ರಮವಾಗಿ ಆಕ್ರಮಿಸಿಕೊಂಡು ಮಧ್ಯರಾತ್ರಿವರೆಗೆ ಅತಿಯಾದ ಸದ್ದು ಮಾಡುವ ಧ್ವನಿವರ್ಧಕಗಳನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.',
    originalLanguage: 'kn',
    isTranslated: true,
    category: 'Other Police Complaints',
    aiSuggestedCategory: 'Other Police Complaints',
    priority: 'Medium',
    aiSuggestedPriority: 'Medium',
    status: 'reopened',
    incidentDate: '2026-11-07T23:30:00Z',
    incidentLocation: {
      address: 'Basavanagudi Gandhi Bazaar Main Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pinCode: '560004',
      lat: 12.9421,
      lng: 77.5753
    },
    citizen: {
      id: 'usr-citizen-01',
      name: 'Ramesh Gowda',
      phone: '+91 98450 12345',
      email: 'citizen@demo.com'
    },
    assignedOfficerId: 'usr-officer-03',
    assignedOfficerName: 'PI Vinayaka Murthy',
    assignedOfficerBadge: 'KSP-PI-1870',
    assignedAt: '2026-11-08T09:00:00Z',
    acknowledgedAt: '2026-11-08T09:30:00Z',
    department: 'Law & Order Police Station',
    unit: 'Property Crimes & Theft Squad',
    jurisdiction: 'Cubbon Park Police Station Limits',
    createdAt: '2026-11-08T08:00:00Z',
    updatedAt: '2026-11-09T10:30:00Z',
    deadlineHours: 72,
    deadlineDate: '2026-11-11T09:00:00Z',
    isOverdue: false,
    isEscalated: false,
    remindersSentCount: 0,
    documents: [],
    investigationRemarks: [
      {
        id: 'rem-115-1',
        officerId: 'usr-officer-03',
        officerName: 'PI Vinayaka Murthy',
        timestamp: '2026-11-08T18:00:00Z',
        remark: 'Patrol vehicle Hoysala 12 dispatched. Advised organizers to lower volume.'
      }
    ],
    reopenReason: 'The music amplifier and generator continued blasting until 2:30 AM the very next night without any enforcement. Need strict equipment seizure.',
    reopenedAt: '2026-11-09T10:30:00Z'
  }
];

export const INITIAL_ACTION_HISTORY: ActionHistoryEntry[] = [
  {
    id: 'hist-001',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-07T07:45:00Z',
    userId: 'usr-citizen-01',
    userName: 'Ramesh Gowda',
    userRole: 'citizen',
    action: 'Complaint Submitted',
    newStatus: 'submitted',
    description: 'Complaint registered online in Kannada with bank transaction slip attached.'
  },
  {
    id: 'hist-002',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-07T07:46:00Z',
    userId: 'system',
    userName: 'CIVANTA AI Engine',
    userRole: 'admin',
    action: 'AI Classification & Translation',
    description: 'Translated from Kannada to English. Category identified as Online Payment Fraud, suggested Urgent Priority.',
    systemGenerated: true
  },
  {
    id: 'hist-003',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-07T08:00:00Z',
    userId: 'system',
    userName: 'CIVANTA Assignment Engine',
    userRole: 'admin',
    action: 'Automatic Officer Assignment',
    newStatus: 'assigned',
    description: 'Assigned to PSI Anand Kumar based on Cyber Crime South Division jurisdiction and lowest active case queue.',
    systemGenerated: true
  },
  {
    id: 'hist-004',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-07T08:15:00Z',
    userId: 'usr-officer-01',
    userName: 'PSI Anand Kumar',
    userRole: 'junior_officer',
    action: 'Assignment Acknowledged',
    newStatus: 'in_progress',
    description: 'Case file opened and investigation plan initiated.'
  },
  {
    id: 'hist-005',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-08T06:00:00Z',
    userId: 'system',
    userName: 'CIVANTA SLA Monitor',
    userRole: 'admin',
    action: 'Automated Reminder Dispatched',
    description: '2-hour pending deadline alert dispatched to PSI Anand Kumar.',
    systemGenerated: true
  },
  {
    id: 'hist-006',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-08T08:00:00Z',
    userId: 'system',
    userName: 'CIVANTA SLA Monitor',
    userRole: 'admin',
    action: 'Deadline Violation Detected',
    previousStatus: 'in_progress',
    newStatus: 'overdue',
    description: '24-hour statutory deadline elapsed without nodal bank freeze filing.',
    systemGenerated: true
  },
  {
    id: 'hist-007',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-08T10:00:00Z',
    userId: 'system',
    userName: 'CIVANTA Escalation Engine',
    userRole: 'admin',
    action: 'Automatic Escalation to Senior Supervisor',
    previousStatus: 'overdue',
    newStatus: 'escalated',
    description: 'Case escalated to DySP Rajeshwari Hegde. Overdue flag marked in high-priority supervisor queue.',
    systemGenerated: true
  },
  {
    id: 'hist-008',
    complaintId: 'CIV-2026-BLR-0101',
    timestamp: '2026-11-08T10:30:00Z',
    userId: 'usr-supervisor-01',
    userName: 'DySP Rajeshwari Hegde',
    userRole: 'senior_supervisor',
    action: 'Supervisor Review & Directive',
    description: 'Requisition order served to Paytm Payments Bank Nodal officer for immediate lien marker.'
  },
  {
    id: 'hist-009',
    complaintId: 'CIV-2026-BLR-0103',
    timestamp: '2026-11-05T17:45:00Z',
    userId: 'usr-citizen-01',
    userName: 'Ramesh Gowda',
    userRole: 'citizen',
    action: 'Complaint Submitted',
    newStatus: 'submitted',
    description: 'Mobile phone loss reported at Majestic Metro Station.'
  },
  {
    id: 'hist-010',
    complaintId: 'CIV-2026-BLR-0103',
    timestamp: '2026-11-07T16:00:00Z',
    userId: 'usr-officer-04',
    userName: 'PSI Kavitha Reddy',
    userRole: 'junior_officer',
    action: 'Resolution Submitted',
    previousStatus: 'in_progress',
    newStatus: 'resolved',
    description: 'Device traced through CEIR and recovered from BMRCL Depot.'
  },
  {
    id: 'hist-011',
    complaintId: 'CIV-2026-BLR-0103',
    timestamp: '2026-11-07T17:30:00Z',
    userId: 'usr-citizen-01',
    userName: 'Ramesh Gowda',
    userRole: 'citizen',
    action: 'Citizen Feedback Provided',
    description: 'Citizen rated service 5/5 stars with commendation.'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    recipientId: 'usr-supervisor-01',
    recipientRole: 'senior_supervisor',
    complaintId: 'CIV-2026-BLR-0101',
    category: 'Cybercrime',
    title: 'URGENT ESCALATION: Online Payment Fraud SLA Breached',
    message: 'Complaint CIV-2026-BLR-0101 (₹45,000 UPI fraud) exceeded 24-hr deadline. Assigned: PSI Anand Kumar.',
    messageKannada: 'ದೂರು CIV-2026-BLR-0101 (₹45,000 ಯುಪಿಐ ವಂಚನೆ) ೨೪ ಗಂಟೆಗಳ ಗಡುವನ್ನು ಮೀರಿದೆ. ನಿಯೋಜಿತರು: ಪಿಎಸ್‌ಐ ಆನಂದ್ ಕುಮಾರ್.',
    type: 'escalation',
    isRead: false,
    createdAt: '2026-11-08T10:00:00Z',
    priority: 'urgent'
  },
  {
    id: 'notif-002',
    recipientId: 'usr-supervisor-01',
    recipientRole: 'senior_supervisor',
    complaintId: 'CIV-2026-BLR-0111',
    category: 'Financial Fraud',
    title: 'CRITICAL ESCALATION: Spear-Phishing Wire Fraud (₹12 Lakhs)',
    message: 'Complaint CIV-2026-BLR-0111 exceeded investigation window. Inter-state bank warrant pending.',
    messageKannada: 'ದೂರು CIV-2026-BLR-0111 ತನಿಖಾ ಅವಧಿಯನ್ನು ಮೀರಿದೆ. ಅಂತರರಾಜ್ಯ ಬ್ಯಾಂಕ್ ವಾರಂಟ್ ಬಾಕಿ ಇದೆ.',
    type: 'escalation',
    isRead: false,
    createdAt: '2026-11-08T15:30:00Z',
    priority: 'urgent'
  },
  {
    id: 'notif-003',
    recipientId: 'usr-officer-01',
    recipientRole: 'junior_officer',
    complaintId: 'CIV-2026-BLR-0113',
    category: 'Cybercrime',
    title: 'New Case Assigned: Corporate Account Takeover',
    message: 'You have been assigned CIV-2026-BLR-0113 (High Priority). Deadline: 48 Hours.',
    messageKannada: 'ನಿಮಗೆ CIV-2026-BLR-0113 (ಹೆಚ್ಚಿನ ಆದ್ಯತೆ) ನಿಯೋಜಿಸಲಾಗಿದೆ. ಗಡುವು: ೪೮ ಗಂಟೆಗಳು.',
    type: 'assignment',
    isRead: false,
    createdAt: '2026-11-09T08:00:00Z',
    priority: 'high'
  },
  {
    id: 'notif-004',
    recipientId: 'usr-officer-03',
    recipientRole: 'junior_officer',
    complaintId: 'CIV-2026-BLR-0106',
    category: 'Lost Property',
    title: 'DEADLINE OVERDUE: Vehicle Theft Classic 350',
    message: 'Complaint CIV-2026-BLR-0106 has breached 72-hour deadline. Action or update required immediately.',
    messageKannada: 'ದೂರು CIV-2026-BLR-0106 ೭೨ ಗಂಟೆಗಳ ಗಡುವನ್ನು ಮೀರಿದೆ. ತಕ್ಷಣದ ಕ್ರಮ ಅಥವಾ ನವೀಕರಣ ಅಗತ್ಯವಿದೆ.',
    type: 'overdue',
    isRead: false,
    createdAt: '2026-11-08T18:00:00Z',
    priority: 'urgent'
  },
  {
    id: 'notif-005',
    recipientId: 'usr-citizen-01',
    recipientRole: 'citizen',
    complaintId: 'CIV-2026-BLR-0103',
    category: 'Lost Property',
    title: 'Complaint Resolved: Mobile Phone Recovered',
    message: 'Your lost phone (CIV-2026-BLR-0103) was recovered. Please review resolution and provide feedback.',
    messageKannada: 'ನಿಮ್ಮ ಕಳೆದುಹೋದ ಮೊಬೈಲ್ (CIV-2026-BLR-0103) ಪತ್ತೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಅಭಿಪ್ರಾಯ ನೀಡಿ.',
    type: 'resolution',
    isRead: false,
    createdAt: '2026-11-07T16:00:00Z',
    priority: 'normal'
  },
  {
    id: 'notif-006',
    recipientId: 'usr-citizen-01',
    recipientRole: 'citizen',
    complaintId: 'CIV-2026-BLR-0104',
    category: 'Traffic & Public Safety',
    title: 'Officer Dispatched: Outer Ring Road Signal Violation',
    message: 'Traffic police squad deployed to investigate CCTV footage for complaint CIV-2026-BLR-0104.',
    messageKannada: 'ದೂರು CIV-2026-BLR-0104 ಗಾಗಿ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಾವಳಿ ಪರಿಶೀಲಿಸಲು ಸಂಚಾರ ಪೊಲೀಸ್ ತಂಡ ನಿಯೋಜಿಸಲಾಗಿದೆ.',
    type: 'assignment',
    isRead: false,
    createdAt: '2026-11-09T11:20:00Z',
    priority: 'high'
  },
  {
    id: 'notif-007',
    recipientId: 'usr-citizen-01',
    recipientRole: 'citizen',
    complaintId: 'CIV-2026-BLR-0105',
    category: 'Complaints Involving Individuals',
    title: 'Conciliation Hearing Scheduled: Tenant Security Deposit Dispute',
    message: 'Assistant Sub-Inspector scheduled conciliation meeting at Koramangala PS on 12-Nov-2026.',
    messageKannada: 'ಕೋರಮಂಗಲ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ 12-ನವೆಂಬರ್-2026 ರಂದು ಸಂಧಾನ ಸಭೆಯನ್ನು ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.',
    type: 'case_scheduled',
    isRead: false,
    createdAt: '2026-11-09T14:45:00Z',
    priority: 'normal'
  },
  {
    id: 'notif-008',
    recipientId: 'usr-supervisor-01',
    recipientRole: 'senior_supervisor',
    complaintId: 'CIV-2026-BLR-0102',
    category: 'Financial Fraud',
    title: 'Red Flag Alert: WhatsApp Trading Ponzi Scheme',
    message: 'Complaint CIV-2026-BLR-0102 exceeded 7-day threshold. Escalated to CID Economic Offences Unit.',
    messageKannada: 'ದೂರು CIV-2026-BLR-0102 ೭ ದಿನಗಳ ಗಡುವನ್ನು ಮೀರಿದೆ. ಸಿಐಡಿ ಆರ್ಥಿಕ ಅಪರಾಧ ಘಟಕಕ್ಕೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.',
    type: 'highest_priority_breach',
    isRead: false,
    createdAt: '2026-11-10T09:15:00Z',
    priority: 'urgent'
  }
];
