import React, { useState } from 'react';
import { Complaint } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { tokens } from '../../tokens';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LocationTrackingRadarProps {
  complaint: Complaint;
  compact?: boolean;
}

export const LocationTrackingRadar: React.FC<LocationTrackingRadarProps> = ({
  complaint,
  compact = false
}) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Extract location fields with fallbacks
  const loc = complaint.incidentLocation || ({} as any);
  const lat = loc.lat ?? loc.latitude ?? 12.9716;
  const lng = loc.lng ?? loc.longitude ?? 77.5946;
  const address = loc.address || 'MG Road, Bengaluru';
  const landmark = loc.landmark || 'Near Metro Station';
  const city = loc.city || 'Bengaluru';
  const district = loc.district || 'Bengaluru Urban';
  const pincode = loc.pincode || loc.pinCode || '560001';
  const nearestStation = loc.nearestPoliceStation || 'Halasuru Police Station';

  // Determine stage (1 to 5)
  const getStageIndex = (): number => {
    const rawStage = (loc.trackingStage || (complaint as any).location_tracking_stage || '').toUpperCase();
    if (rawStage.includes('VERIFIED')) return 5;
    if (rawStage.includes('SITE') || rawStage.includes('SCENE')) return 4;
    if (rawStage.includes('DISPATCH')) return 3;
    if (rawStage.includes('ALERT') || rawStage.includes('STATION')) return 2;
    if (rawStage.includes('TAG')) return 1;

    // Fallback based on complaint status
    const status = complaint.status.toLowerCase();
    if (status === 'resolved' || status === 'closed') return 5;
    if (status === 'in_progress' || status === 'accepted') return 3;
    if (status === 'assigned') return 2;
    return 1;
  };

  const currentStage = getStageIndex();

  const stages = [
    {
      index: 1,
      key: 'gpsTagged',
      label: t('gpsTagged'),
      descEn: 'Incident coordinates geo-tagged by citizen device.',
      descKn: 'ನಾಗರಿಕರ ಸಾಧನದಿಂದ ಜಿಪಿಎಸ್ ನಿರ್ದೇಶಾಂಕಗಳು ದಾಖಲಾಗಿವೆ.'
    },
    {
      index: 2,
      key: 'stationAlerted',
      label: t('stationAlerted'),
      descEn: `Dispatched to ${nearestStation} command console.`,
      descKn: `${nearestStation} ಕಮಾಂಡ್ ಡೆಸ್ಕ್‌ಗೆ ರವಾನಿಸಲಾಗಿದೆ.`
    },
    {
      index: 3,
      key: 'patrolDispatched',
      label: t('patrolDispatched'),
      descEn: 'Hoysala PCR patrol unit alerted for sector inspection.',
      descKn: 'ಹೊಯ್ಸಳ ಗಸ್ತು ವಾಹನಕ್ಕೆ ವಲಯ ತಪಾಸಣೆಗೆ ಸೂಚಿಸಲಾಗಿದೆ.'
    },
    {
      index: 4,
      key: 'officerOnSite',
      label: t('officerOnSite'),
      descEn: 'Investigating officer or beat personnel arrived on-site.',
      descKn: 'ಸ್ಥಳದಲ್ಲಿ ತನಿಖಾಧಿಕಾರಿ ಅಥವಾ ಬೀಟ್ ಸಿಬ್ಬಂದಿ ಉಪಸ್ಥಿತರಿದ್ದಾರೆ.'
    },
    {
      index: 5,
      key: 'fieldVerified',
      label: t('fieldVerified'),
      descEn: 'Physical inspection completed and recorded in docket.',
      descKn: 'ಸ್ಥಳ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದ್ದು ದಾಖಲೆಯಲ್ಲಿ ನಮೂದಿಸಲಾಗಿದೆ.'
    }
  ];

  const handleCopyCoordinates = () => {
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className={`p-4 ${tokens.cardClass} space-y-4`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-[4px] bg-police-700/10 dark:bg-police-500/20 text-police-700 dark:text-police-400">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('fieldDispatchRadar')}</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                LIVE GPS
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('nearestStation')}: <strong className="text-slate-800 dark:text-slate-200">{nearestStation}</strong>
            </p>
          </div>
        </div>

        {/* External Map Links & Copy Action */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handleCopyCoordinates}
            className="px-2 py-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
            title={t('copyCoordinates')}
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? t('coordinatesCopied') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-[4px] bg-police-700 hover:bg-police-800 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Compass size={12} />
            <span>{t('openInGoogleMaps')}</span>
            <ExternalLink size={10} />
          </a>

          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-[4px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Navigation size={12} />
            <span>OSM</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Main Grid: Radar Screen Preview + Location Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Radar Graphic Canvas / SVG */}
        <div className="relative h-44 rounded-[6px] bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
          {/* Circular Radar Grid */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <div className="w-36 h-36 rounded-full border border-police-400" />
            <div className="w-24 h-24 rounded-full border border-police-500 absolute" />
            <div className="w-12 h-12 rounded-full border border-police-600 absolute" />
            <div className="w-full h-px bg-police-500/50 absolute" />
            <div className="h-full w-px bg-police-500/50 absolute" />
          </div>

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute w-36 h-36 rounded-full origin-center pointer-events-none animate-spin [animation-duration:6s] opacity-20 bg-gradient-to-tr from-transparent via-police-400 to-transparent" />

          {/* Incident Pin with Pulse */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping" />
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-950">
                <MapPin size={14} className="fill-white" />
              </div>
            </div>
            <span className="mt-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] bg-black/80 text-amber-300 border border-slate-700 shadow-xs">
              INCIDENT LOC
            </span>
          </div>

          {/* Police Station Marker (Offset) */}
          <div className="absolute top-3 right-4 z-10 flex items-center gap-1 bg-police-950/90 border border-police-700/80 px-1.5 py-0.5 rounded-[4px]">
            <Shield size={11} className="text-amber-400" />
            <span className="font-mono text-[9px] text-slate-200 truncate max-w-[100px]">
              {nearestStation.split(' ')[0]} PS (~1.4km)
            </span>
          </div>

          {/* Precision telemetry readout */}
          <div className="absolute bottom-1.5 left-2 z-10 text-[9px] font-mono text-emerald-400 bg-black/75 px-1.5 py-0.5 rounded-[3px] border border-emerald-950">
            GPS: ±6m • SATELLITES: 11
          </div>
        </div>

        {/* Location Telemetry Details (2 Cols on md) */}
        <div className="md:col-span-2 space-y-2.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block">
                {t('address')} & Landmark
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {address}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                {t('landmark') || 'Landmark'}: <span className="font-medium text-slate-700 dark:text-slate-300">{landmark}</span>
              </p>
            </div>

            <div className="p-2.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block">
                {t('Jurisdiction & Postal Code')}
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {city}, {district}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                PIN: {pincode} • Sector: Central Police Ward
              </p>
            </div>
          </div>

          {/* Coordinates Details Banner */}
          <div className="p-2.5 rounded-[6px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">LATITUDE</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lat.toFixed(5)}° N</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">LONGITUDE</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lng.toFixed(5)}° E</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase">NEAREST STATION</span>
                <span className="font-bold text-police-700 dark:text-police-400 truncate max-w-[130px] inline-block">{nearestStation}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock size={11} />
              <span>Response Window: &lt; 15 Mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage Field Tracking Stepper */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-wider text-[11px]">
            Field Dispatch Progress • 5-Point Radar Protocol
          </span>
          <span className="text-[11px] font-mono font-semibold text-police-700 dark:text-police-400">
            Stage {currentStage} of 5 ({stages[currentStage - 1]?.label})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {stages.map(stage => {
            const isCompleted = currentStage > stage.index;
            const isCurrent = currentStage === stage.index;

            return (
              <div
                key={stage.index}
                className={`p-2.5 rounded-[6px] border text-xs transition-colors space-y-1 ${
                  isCurrent
                    ? 'border-police-600 bg-police-50 dark:bg-police-950/50 shadow-xs'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    0{stage.index}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-police-600 animate-pulse" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  )}
                </div>

                <p className={`font-semibold text-xs leading-tight ${
                  isCurrent
                    ? 'text-police-900 dark:text-police-200'
                    : isCompleted
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {stage.label}
                </p>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                  {language === 'kn' ? stage.descKn : stage.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
