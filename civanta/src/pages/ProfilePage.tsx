import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { tokens } from '../tokens';
import { Mail, Phone, MapPin, LogOut, Check } from 'lucide-react';

interface ProfilePageProps {
  onOpenRoleModal: () => void;
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenRoleModal, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={`p-4 ${tokens.cardClass} space-y-4`}>
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-[6px] bg-police-800 text-white flex items-center justify-center font-bold text-base border border-police-700">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-[4px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {currentUser.badgeNumber ? `Badge: ${currentUser.badgeNumber}` : t('Citizen Account')}
            </p>
            <p className="text-xs text-slate-400">
              {currentUser.designation || currentUser.jurisdiction}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Government Document Verification Certificate */}
          {currentUser.govVerification && (
            <div className="p-3 rounded-[6px] bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600" />
                  {t('Government Verified Identity (e-KYC)')}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                  {currentUser.govVerification.verificationMethod}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                <p>
                  Document Type: <strong>{currentUser.govVerification.idType} Card</strong>
                </p>
                <p>
                  Document ID: <strong className="font-mono">{currentUser.govVerification.idNumber}</strong>
                </p>
                <p className="col-span-full">
                  Verified Document: <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{currentUser.govVerification.documentName || 'National_ID_Verified.pdf'}</span>
                </p>
                <p className="col-span-full text-[10px] text-slate-400 font-mono">
                  Timestamp: {new Date(currentUser.govVerification.verifiedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <Mail size={14} className="text-police-700 dark:text-police-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Email Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <Phone size={14} className="text-police-700 dark:text-police-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Phone Contact</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentUser.phone || '+91 98450 12345'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-[6px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <MapPin size={14} className="text-police-700 dark:text-police-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Police Jurisdiction / District</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentUser.jurisdiction || 'Bengaluru Central'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenRoleModal}
            className="px-3 py-1.5 rounded-[6px] bg-police-700 hover:bg-police-800 text-white font-semibold text-xs cursor-pointer"
          >
            {t('Switch Demonstration Role')}
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="px-3 py-1.5 rounded-[6px] text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>{t('Sign Out')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
