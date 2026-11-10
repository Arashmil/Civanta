import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, GovIdType } from '../types';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  Cpu,
  FileCheck2,
  FileText,
  Paperclip,
  KeyRound,
  CheckCircle2,
  User,
  Phone,
  Sparkles,
  UploadCloud
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithCredentials, loginWithGovernmentId, loginAs } = useAuth();
  const [authMode, setAuthMode] = useState<'gov_id' | 'password'>('gov_id');

  // Traditional email/password state
  const [email, setEmail] = useState('citizen@demo.com');
  const [password, setPassword] = useState('Demo@123');

  // Government ID Verification login state - Empty by default so you can enter your own name and details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [idType, setIdType] = useState<GovIdType>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState<{
    name: string;
    url: string;
    size: string;
  } | null>(null);

  // OTP Simulation State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    const success = await loginWithCredentials(email, password);
    if (success) {
      if (email.includes('junior')) onNavigate('officer-dash');
      else if (email.includes('supervisor')) onNavigate('supervisor-dash');
      else if (email.includes('admin')) onNavigate('admin-dash');
      else onNavigate('citizen-dash');
    } else {
      setError('Invalid credentials. Use demo accounts below or Demo@123.');
    }
  };

  const handleGovIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full legal name as per government records.');
      return;
    }
    if (!idNumber.trim()) {
      setError(`Please provide your ${idType} identification number.`);
      return;
    }
    if (!uploadedDoc) {
      setError('Please upload or attach your government ID document for verification.');
      return;
    }
    if (otpSent && otpCode.length < 4) {
      setError('Please enter the 6-digit verification OTP.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const success = loginWithGovernmentId({
        name: fullName.trim(),
        phone: phone.trim(),
        email: citizenEmail.trim() || undefined,
        idType,
        idNumber: idNumber.trim(),
        documentFile: uploadedDoc,
        jurisdiction: 'Bengaluru Central'
      });

      if (success) {
        onNavigate('citizen-dash');
      } else {
        setError('Government ID verification could not be completed.');
      }
    }, 700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedDoc({
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${sizeMB} MB`
      });
      setError(null);
    }
  };

  const handleAttachSampleDoc = () => {
    const sampleDocs: Record<GovIdType, { name: string; size: string }> = {
      Aadhaar: { name: 'Aadhaar_Card_eKYC_Front_Back.pdf', size: '1.4 MB' },
      PAN: { name: 'PAN_Card_Verification_Copy.png', size: '820 KB' },
      'Voter ID': { name: 'Election_Voter_ID_EPIC.pdf', size: '1.1 MB' },
      'Driving License': { name: 'Karnataka_DL_Smart_Card.pdf', size: '1.3 MB' },
      Passport: { name: 'Indian_Passport_Bio_Page.pdf', size: '2.1 MB' }
    };
    const sample = sampleDocs[idType];
    setUploadedDoc({
      name: sample.name,
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      size: sample.size
    });
    setError(null);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpCode('849201'); // Auto-populate simulated OTP
    setError(null);
  };

  const handleQuickDemo = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    loginAs(role);
    if (role === 'junior_officer') onNavigate('officer-dash');
    else if (role === 'senior_supervisor') onNavigate('supervisor-dash');
    else if (role === 'admin') onNavigate('admin-dash');
    else onNavigate('citizen-dash');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 py-8">
      <div className="w-full max-w-xl space-y-4">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-[6px] bg-police-800 text-white flex items-center justify-center mx-auto border border-police-700">
            <Shield size={20} className="text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            CIVANTA Portal Sign In
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Smart Grievance Management & Accountability System • Karnataka State Police
          </p>
        </div>

        {/* Card */}
        <div className="p-4 sm:p-5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-[6px] bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('gov_id');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'gov_id'
                  ? 'bg-police-700 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileCheck2 size={13} />
              <span>Government ID & e-KYC</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password'
                  ? 'bg-police-700 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lock size={13} />
              <span>Staff / Password Sign In</span>
            </button>
          </div>

          {/* MODE 1: Government ID & Document Verification Login */}
          {authMode === 'gov_id' ? (
            <form onSubmit={handleGovIdSubmit} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-0.5">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-police-600 dark:text-police-400" />
                  Citizen Identity Verification
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Enter legal name and attach government identity document to sign in with verified citizen profile.
                </p>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (As per Gov Record) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g., Ramesh Gowda"
                      className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <User size={13} className="absolute left-2.5 top-2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (e-KYC Linked) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <Phone size={13} className="absolute left-2.5 top-2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Government ID Type & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Government Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={idType}
                    onChange={e => {
                      const newType = e.target.value as GovIdType;
                      setIdType(newType);
                      if (newType === 'Aadhaar') setIdNumber('5412-8841-9920');
                      else if (newType === 'PAN') setIdNumber('ABCDE1234F');
                      else if (newType === 'Voter ID') setIdNumber('KSP1234567');
                      else if (newType === 'Driving License') setIdNumber('KA-05-2022-009812');
                      else setIdNumber('Z1298451');
                    }}
                    className="w-full p-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Aadhaar">Aadhaar Card (UIDAI 12-Digit)</option>
                    <option value="PAN">PAN Card (Income Tax Dept)</option>
                    <option value="Voter ID">Voter ID / EPIC Card (ECI)</option>
                    <option value="Driving License">Driving License (Transport Dept)</option>
                    <option value="Passport">Indian Passport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {idType} Identification Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                    placeholder={
                      idType === 'Aadhaar'
                        ? '1234-5678-9012'
                        : idType === 'PAN'
                        ? 'ABCDE1234F'
                        : 'ID Card Reference'
                    }
                    className="w-full p-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Document File Upload / Attachment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Identity Document (PDF / Image) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAttachSampleDoc}
                    className="text-[11px] font-semibold text-police-700 dark:text-police-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Auto-Attach Sample {idType}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 p-2 rounded-[6px] border border-dashed border-slate-300 dark:border-slate-700 hover:border-police-500 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                    <UploadCloud size={14} className="text-police-600" />
                    <span>Choose file from device...</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadedDoc && (
                  <div className="p-2.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-police-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {uploadedDoc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {uploadedDoc.size} • Verified
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 shrink-0">
                      Attached
                    </span>
                  </div>
                )}
              </div>

              {/* Simulated OTP Section */}
              <div className="p-2.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-police-600" />
                    Identity OTP Verification
                  </span>
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-semibold text-police-700 dark:text-police-400 hover:underline cursor-pointer"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      OTP Dispatched
                    </span>
                  )}
                </div>

                {otpSent && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="6-digit OTP"
                      className="w-32 p-1.5 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-center tracking-widest text-xs"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Simulated: <code className="font-bold text-police-700 dark:text-police-400">849201</code> auto-filled)
                    </span>
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Verify ID and Access Citizen Portal</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* MODE 2: Staff / Password Login */
            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    placeholder="officer@ksp.gov.in or junior@demo.com"
                    required
                  />
                  <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    required
                  />
                  <Lock size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Demo password: <code className="text-police-700 dark:text-police-400 font-bold">Demo@123</code>
                </span>
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full py-2 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Sign In to Workstation</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}

          {/* Quick Demo 1-Click Access Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block text-center">
              One-Click Demonstration Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen', 'citizen@demo.com')}
                className="p-2 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <UserCheck size={13} className="shrink-0 text-police-700 dark:text-police-400" />
                <span className="truncate">Citizen (Ramesh)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('junior_officer', 'junior@demo.com')}
                className="p-2 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <Shield size={13} className="shrink-0 text-police-700 dark:text-police-400" />
                <span className="truncate">PSI Anand Kumar</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('senior_supervisor', 'supervisor@demo.com')}
                className="p-2 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <ShieldAlert size={13} className="shrink-0 text-amber-600" />
                <span className="truncate">DySP Rajeshwari</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'admin@demo.com')}
                className="p-2 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
              >
                <Cpu size={13} className="shrink-0 text-police-700 dark:text-police-400" />
                <span className="truncate">System Admin</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <span>Need a dedicated citizen registration? </span>
          <button
            onClick={() => onNavigate('register')}
            className="text-police-700 dark:text-police-400 font-semibold hover:underline cursor-pointer"
          >
            Create Citizen Profile with Government ID
          </button>
        </div>
      </div>
    </div>
  );
};
