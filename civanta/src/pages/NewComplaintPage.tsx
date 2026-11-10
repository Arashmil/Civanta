import React, { useState, useEffect } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AIClassifierService } from '../services/aiClassifier';
import { TranslationService } from '../services/translator';
import { VoiceInputButton } from '../components/voice/VoiceInputButton';
import { ComplaintCategory, PriorityLevel, Complaint } from '../types';
import { tokens } from '../tokens';
import {
  FilePlus2,
  Sparkles,
  Paperclip,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  Languages,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface NewComplaintPageProps {
  onNavigate: (page: string) => void;
  onSelectComplaint: (complaintId: string) => void;
}

export const NewComplaintPage: React.FC<NewComplaintPageProps> = ({
  onNavigate,
  onSelectComplaint
}) => {
  const { submitComplaint } = useGrievance();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredLang, setPreferredLang] = useState<'kn' | 'en'>('en');
  const [category, setCategory] = useState<ComplaintCategory>('Financial Fraud');
  const [priority, setPriority] = useState<PriorityLevel>('High');

  // AI Classification Feedback
  const [aiSuggestedCat, setAiSuggestedCat] = useState<ComplaintCategory>('Financial Fraud');
  const [aiSuggestedPri, setAiSuggestedPri] = useState<PriorityLevel>('High');
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiRationale, setAiRationale] = useState<string>('');
  const [uploadedRealFile, setUploadedRealFile] = useState<File | null>(null);

  // Location & Contact
  const [incidentDate, setIncidentDate] = useState('2026-11-09T18:00');
  const [address, setAddress] = useState('Jayanagar 4th Block, Bengaluru');
  const [city, setCity] = useState('Bengaluru');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [pinCode, setPinCode] = useState('560011');

  const [citizenName, setCitizenName] = useState(currentUser?.name || 'Ramesh Gowda');
  const [citizenPhone, setCitizenPhone] = useState(currentUser?.phone || '+91 98450 12345');
  const [citizenEmail, setCitizenEmail] = useState(currentUser?.email || 'citizen@demo.com');
  const [aadhaarLast4, setAadhaarLast4] = useState('8841');

  // Uploaded docs simulation
  const [documents, setDocuments] = useState<
    { name: string; type: 'image' | 'pdf' | 'document'; url: string; size: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  // Run AI classification as user inputs text
  useEffect(() => {
    if (title.length > 5 || description.length > 10) {
      const result = AIClassifierService.classifyComplaint(title, description);
      setAiSuggestedCat(result.suggestedCategory);
      setAiSuggestedPri(result.suggestedPriority);
      setAiConfidence(result.confidence);
      setAiRationale(result.rationale);
      setCategory(result.suggestedCategory);
      setPriority(result.suggestedPriority);
    }
  }, [title, description]);

  const handleAddSampleDocument = () => {
    const sampleDocs = [
      { name: 'Bank_Statement_ICICI.pdf', type: 'pdf' as const, url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600', size: '1.2 MB' },
      { name: 'Fraud_SMS_Screenshot.png', type: 'image' as const, url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600', size: '420 KB' },
      { name: 'CCTV_Video_Clip.mp4', type: 'document' as const, url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600', size: '5.8 MB' }
    ];
    const pick = sampleDocs[documents.length % sampleDocs.length];
    setDocuments(prev => [...prev, pick]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out complaint title and detailed incident description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const complaint = await submitComplaint({
        title: title.trim(),
        description: description.trim(),
        originalLanguage: preferredLang,
        category,
        priority,
        incidentDate: new Date(incidentDate).toISOString(),
        incidentLocation: {
          address,
          city,
          district,
          pinCode
        },
        citizenName,
        citizenPhone,
        citizenEmail,
        file: uploadedRealFile || undefined
      });

      setCreatedComplaint(complaint);
    } catch (err) {
      console.error(err);
      alert('Failed to register complaint. Please check fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-6 space-y-4">
        <div className={`p-6 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4`}>
          <div className="w-12 h-12 rounded-[6px] bg-police-800 text-white flex items-center justify-center mx-auto border border-police-700">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Registration Recorded
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Grievance Dossier Generated
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Karnataka State Police • Smart Grievance Management System
            </p>
          </div>

          <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto text-center space-y-1">
            <span className="text-xs text-slate-500 font-medium">Complaint Reference ID</span>
            <p className="text-xl font-mono font-bold text-police-700 dark:text-police-400 tracking-wider">
              {createdComplaint.id}
            </p>
            <span className="text-[10px] text-slate-400 block font-mono">
              Save this reference ID for online and kiosk tracking.
            </span>
          </div>

          {createdComplaint.assignedOfficerName && (
            <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-left text-xs space-y-1">
              <span className="font-semibold text-police-900 dark:text-police-200 flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-700">
                <Shield size={13} className="text-police-600 dark:text-police-400" />
                Automated Officer Assignment
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                Assigned to <strong>{createdComplaint.assignedOfficerName}</strong> ({createdComplaint.assignedOfficerBadge})
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                {createdComplaint.unit} • {createdComplaint.jurisdiction}
              </p>
              <div className="pt-1 flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                <Clock size={12} className="text-police-600" />
                <span>Statutory SLA: {createdComplaint.deadlineHours} Hours</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onSelectComplaint(createdComplaint.id)}
              className="px-4 py-2 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Case File Dossier</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={() => {
                setCreatedComplaint(null);
                setTitle('');
                setDescription('');
                setDocuments([]);
              }}
              className="px-4 py-2 rounded-[6px] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Register Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className={tokens.headerCardClass}>
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
          Module 1 & 2 • Bilingual Grievance Registration
        </span>
        <h1 className="text-lg font-bold text-white tracking-tight">
          Register Police Grievance
        </h1>
        <p className="text-xs text-slate-200 dark:text-slate-300">
          Supports Kannada and English. Kannada submissions undergo real-time bilingual translation with AI-suggested category and priority ratings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preferred Language & Voice Toolbar */}
        <div className={`p-3 ${tokens.cardClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
          <div className="flex items-center gap-2">
            <Languages size={15} className="text-police-600 dark:text-police-400" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Drafting Language:
            </span>
            <div className="inline-flex rounded-[6px] border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPreferredLang('kn')}
                className={`px-2.5 py-1 rounded-[4px] font-medium font-kannada transition-colors cursor-pointer ${
                  preferredLang === 'kn'
                    ? 'bg-police-700 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ಕನ್ನಡ (Kannada)
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  preferredLang === 'en'
                    ? 'bg-police-700 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VoiceInputButton
              language={preferredLang}
              onTranscript={text => {
                if (!title) setTitle(text.slice(0, 60));
                setDescription(prev => (prev ? `${prev} ${text}` : text));
              }}
            />
          </div>
        </div>

        {/* Main Incident Details */}
        <div className={`p-4 ${tokens.cardClass} space-y-3`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            Incident Description and Particulars
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Complaint Subject / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={preferredLang === 'kn' ? 'ಉದಾ: ನಕಲಿ ವಿದ್ಯುತ್ ಬಿಲ್ ಲಿಂಕ್ ಮೂಲಕ ಹಣ ಕಡಿತ...' : 'e.g., Unauthorized UPI deduction of ₹45,000 via fake link...'}
              className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white placeholder:text-slate-400 font-kannada"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description of the Incident <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={preferredLang === 'kn' ? 'ಘಟನೆ ನಡೆದ ಸ್ಥಳ, ಸಮಯ, ವ್ಯಕ್ತಿಗಳು ಮತ್ತು ಹಣಕಾಸು ವಿವರಗಳನ್ನು ಪೂರ್ಣವಾಗಿ ಬರೆಯಿರಿ...' : 'Provide complete chronological details, transaction IDs, phone numbers, vehicle numbers or suspect details...'}
              className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white placeholder:text-slate-400 font-kannada leading-relaxed"
            />
          </div>

          {/* Real-time AI Classification Preview Box */}
          {aiConfidence > 0 && (
            <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-police-600 dark:text-police-400" />
                  AI Classification Assessment
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Suggested. Officer must confirm.
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {aiRationale}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                <span>
                  Category: <strong>{aiSuggestedCat}</strong>
                </span>
                <span>•</span>
                <span>
                  Priority: <strong>{aiSuggestedPri}</strong>
                </span>
                <span className="text-slate-400">({aiConfidence}% confidence)</span>
              </div>
            </div>
          )}

          {/* Category & Priority Manual Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('categoryPriority')}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ComplaintCategory)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 font-medium text-slate-900 dark:text-white"
              >
                <option value="Cybercrime">{t('Cybercrime')}</option>
                <option value="Financial Fraud">{t('Financial Fraud')}</option>
                <option value="Lost Property">{t('Lost Property')}</option>
                <option value="Traffic & Public Safety">{t('Traffic & Public Safety')}</option>
                <option value="Complaints Involving Individuals">{t('Complaints Involving Individuals')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('filterByPriority')}
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 font-medium text-slate-900 dark:text-white"
              >
                <option value="Urgent">{t('Urgent Priority')}</option>
                <option value="High">{t('High Priority')}</option>
                <option value="Medium">{t('Medium Priority')}</option>
                <option value="Low">{t('Low Priority')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Incident Time & Location */}
        <div className={`p-4 ${tokens.cardClass} space-y-3`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            Time and Jurisdiction Particulars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Incident Date and Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Police Division / District
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              >
                <option value="Bengaluru Urban">Bengaluru Urban (City Limits)</option>
                <option value="Bengaluru Rural">Bengaluru Rural</option>
                <option value="Mysuru City">Mysuru City</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exact Incident Address / Landmark <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g., Near Bus Stand, Jayanagar 4th Block, Main Road..."
              className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Evidence & Supporting Documents */}
        <div className={`p-4 ${tokens.cardClass} space-y-3`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 gap-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Supporting Proofs and Digital Evidence
            </h3>
            <div className="flex items-center gap-2">
              <label className="px-2.5 py-1 rounded-[6px] bg-police-700 hover:bg-police-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <Paperclip size={12} />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.txt"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadedRealFile(f);
                      setDocuments(prev => [
                        ...prev,
                        {
                          name: f.name,
                          type: f.type.includes('image') ? 'image' : 'pdf',
                          url: URL.createObjectURL(f),
                          size: `${(f.size / 1024).toFixed(1)} KB`
                        }
                      ]);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleAddSampleDocument}
                className="px-2.5 py-1 rounded-[6px] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Sample Proof</span>
              </button>
            </div>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">
              No files attached yet. Attach bank statements, screenshots or CCTV images if applicable.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-[6px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip size={13} className="text-police-600 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {doc.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {doc.size}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citizen Contact Information */}
        <div className={`p-4 ${tokens.cardClass} space-y-3`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            Complainant Contact Particulars
          </h3>

          {currentUser?.govVerification && (
            <div className="p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Verified Citizen Identity: {currentUser.govVerification.idType} Card
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">
                    ID: {currentUser.govVerification.idNumber} • e-KYC Certified
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 shrink-0">
                Identity Linked
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={citizenName}
                onChange={e => setCitizenName(e.target.value)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={citizenPhone}
                onChange={e => setCitizenPhone(e.target.value)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={citizenEmail}
                onChange={e => setCitizenEmail(e.target.value)}
                className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className={`p-3 rounded-[6px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between`}>
          <button
            type="button"
            onClick={() => onNavigate('citizen-dash')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-[6px] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Translating and Assigning Case...</span>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Submit Grievance Dossier</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
