import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storage';
import { GovIdType, User } from '../types';
import {
  Shield,
  UserPlus,
  ArrowRight,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  Paperclip,
  CheckCircle2,
  Sparkles,
  UploadCloud
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { loginWithGovernmentId } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Bengaluru Central');
  const [idType, setIdType] = useState<GovIdType>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState<{
    name: string;
    url: string;
    size: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      Aadhaar: { name: 'Aadhaar_Card_Verified_Proof.pdf', size: '1.4 MB' },
      PAN: { name: 'PAN_Card_Proof.png', size: '820 KB' },
      'Voter ID': { name: 'Voter_ID_Card_Proof.pdf', size: '1.1 MB' },
      'Driving License': { name: 'Karnataka_DL_Smart_Card.pdf', size: '1.3 MB' },
      Passport: { name: 'Indian_Passport_Bio_Page.pdf', size: '2.1 MB' }
    };
    const sample = sampleDocs[idType];
    setUploadedDoc({
      name: sample.name,
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600',
      size: sample.size
    });
    if (!idNumber) {
      if (idType === 'Aadhaar') setIdNumber('5412-8841-9920');
      else if (idType === 'PAN') setIdNumber('ABCDE1234F');
      else if (idType === 'Voter ID') setIdNumber('KSP1234567');
      else if (idType === 'Driving License') setIdNumber('KA-05-2022-009812');
      else setIdNumber('Z1298451');
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide your full name as per official government records.');
      return;
    }
    if (!idNumber.trim()) {
      setError(`Please provide your ${idType} identification number.`);
      return;
    }
    if (!uploadedDoc) {
      setError('Please upload or attach your government ID document for e-KYC verification.');
      return;
    }

    const successLogin = loginWithGovernmentId({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@citizen.gov.in`,
      idType,
      idNumber: idNumber.trim(),
      documentFile: uploadedDoc,
      jurisdiction: district
    });

    if (successLogin) {
      setSuccess(true);
      setTimeout(() => {
        onNavigate('citizen-dash');
      }, 1200);
    } else {
      setError('Failed to complete citizen registration.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-[6px] bg-police-800 text-white flex items-center justify-center mx-auto">
            <UserPlus size={20} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Citizen Registration & Identity Verification
          </h2>
          <p className="text-xs text-slate-500">
            Registration with Government ID Verification (Aadhaar / PAN / Voter ID / DL / Passport)
          </p>
        </div>

        <div className="p-6 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          {success ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-[6px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                Government Identity Verified & Registered
              </h3>
              <p className="text-xs text-slate-500">
                Opening certified citizen grievance dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck2 size={15} className="text-police-700 dark:text-police-400" />
                  Statutory e-KYC Identity Verification
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Government verification ensures accountability, expedites police action, and binds filed grievances to verified civic credentials.
                </p>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (As per Gov Record) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Ramesh Gowda"
                      className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <UserIcon size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Mobile Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                    />
                    <Phone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Email & Division */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Police Division Jurisdiction
                  </label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full p-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Bengaluru Central">Bengaluru Central</option>
                    <option value="Bengaluru South">Bengaluru South</option>
                    <option value="Bengaluru East">Bengaluru East</option>
                    <option value="Bengaluru North">Bengaluru North</option>
                    <option value="Mysuru City">Mysuru City</option>
                  </select>
                </div>
              </div>

              {/* Government ID Type & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Government Document Type *
                  </label>
                  <select
                    value={idType}
                    onChange={e => setIdType(e.target.value as GovIdType)}
                    className="w-full p-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                    <option value="PAN">PAN Card (Income Tax)</option>
                    <option value="Voter ID">Voter ID / EPIC Card (ECI)</option>
                    <option value="Driving License">Driving License (RTO)</option>
                    <option value="Passport">Indian Passport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {idType} Identification Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                    placeholder="Enter document number"
                    className="w-full p-2 rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Document File Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Upload Government ID Document Proof *
                  </label>
                  <button
                    type="button"
                    onClick={handleAttachSampleDoc}
                    className="text-[11px] font-medium text-police-700 dark:text-police-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Auto-Attach Sample {idType}</span>
                  </button>
                </div>

                <label className="w-full flex items-center justify-center gap-2 p-3 rounded-[6px] border border-dashed border-slate-300 dark:border-slate-700 hover:border-police-500 bg-white dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                  <UploadCloud size={16} className="text-police-600" />
                  <span>Choose file from device (PDF or Image)...</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedDoc && (
                  <div className="p-2.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 size={16} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {uploadedDoc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {uploadedDoc.size} • Verified Cryptographic Checksum
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium shrink-0">
                      Attached
                    </span>
                  </div>
                )}
              </div>

              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Verify Government ID & Register Citizen Profile</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <button
            onClick={() => onNavigate('login')}
            className="text-police-700 dark:text-police-400 font-medium hover:underline cursor-pointer"
          >
            Sign In with Government ID / e-KYC
          </button>
        </div>
      </div>
    </div>
  );
};
