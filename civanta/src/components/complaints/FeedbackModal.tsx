import React, { useState } from 'react';
import { Complaint } from '../../types';
import { useGrievance } from '../../context/GrievanceContext';
import { Star, X, Check, HeartHandshake } from 'lucide-react';

interface FeedbackModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  complaint,
  isOpen,
  onClose
}) => {
  const { submitFeedback } = useGrievance();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      setError('Please provide a brief comment on the police action and service.');
      return;
    }

    submitFeedback(complaint.id, rating, comments.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-[6px] bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-[6px] bg-amber-600 text-white flex items-center justify-center">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Citizen Feedback & Service Rating
            </h3>
            <p className="text-xs text-slate-500">
              Grievance Reference: <span className="font-mono font-medium text-police-700 dark:text-police-400">{complaint.id}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star selector */}
          <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Investigation and resolution evaluation
            </span>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-colors focus:outline-hidden"
                >
                  <Star
                    size={24}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-amber-600">
              {rating === 5
                ? '5/5 — Very Satisfied'
                : rating === 4
                ? '4/5 — Satisfied'
                : rating === 3
                ? '3/5 — Neutral'
                : rating === 2
                ? '2/5 — Unsatisfied'
                : '1/5 — Extremely Dissatisfied'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your Feedback Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={e => {
                setComments(e.target.value);
                setError(null);
              }}
              placeholder="Record remarks regarding officer responsiveness, transparency and resolution..."
              className="w-full text-xs rounded-[6px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-police-500"
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[6px] border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-police-700 hover:bg-police-800 rounded-[6px] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>Submit Rating & Close Grievance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
