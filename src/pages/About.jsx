import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useToast } from '../lib/ToastContext';
import { ArrowLeft, Send, Heart, Shield, Award, Mail, Stethoscope } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    credentials: '',
    organization: '',
    nmc_number: '',
    credential_link: '',
    message: '',
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitReviewerApplication(formData);
      showToast('Your application has been submitted successfully!', 'success');
      setFormData({
        name: '',
        email: '',
        credentials: '',
        organization: '',
        nmc_number: '',
        credential_link: '',
        message: '',
      });
    } catch (err) {
      console.error('Submission error:', err);
      showToast(err.message || 'Failed to submit application. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back to Home link */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition"
        >
          <ArrowLeft size={16} />
          {t('remedy.back', 'Back to Home')}
        </Link>
      </div>

      <div className="space-y-8">
        {/* Intro Mission Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -z-10"></div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">About SafeMed Nepal</h1>
          <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
            Traditional home remedies have been passed down through generations in Nepal, offering accessible, cost-effective relief. However, in the digital age, self-medication carries risks of misinformation. 
          </p>
          <p className="text-slate-600 leading-relaxed text-base sm:text-lg mt-3">
            <strong>SafeMed Nepal</strong> bridges traditional knowledge and clinical safety by providing a bilingual repository of remedies reviewed and verified by licensed medical professionals. Every published remedy features the name and credentials of the verifying doctor, ensuring reliability.
          </p>
          
          {/* Core Pillars */}
          <div className="grid gap-4 mt-8 sm:grid-cols-3">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col items-center text-center">
              <Shield className="w-8 h-8 text-amber-600 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Clinical Safety</h3>
              <p className="text-xs text-slate-500 mt-1">Vetted steps, ingredients, precautions, and doctor-verified warnings.</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
              <Heart className="w-8 h-8 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Bilingual Access</h3>
              <p className="text-xs text-slate-500 mt-1">Equal availability in English and Nepali (नेपाली) for all citizens.</p>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col items-center text-center">
              <Award className="w-8 h-8 text-teal-600 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Transparent Trust</h3>
              <p className="text-xs text-slate-500 mt-1">Review badges showing verification dates and doctor qualifications.</p>
            </div>
          </div>
        </div>

        {/* Application Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-amber-600" />
              <span>Join as a Medical Reviewer</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Are you a licensed doctor, Ayurvedic practitioner, or medical institution representative? Fill in the form below to request reviewer access. Our administration will contact you shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                  placeholder="e.g., Dr. Ram Prasad"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                  placeholder="e.g., doctor@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Credentials */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Medical Credentials</label>
                <input
                  type="text"
                  value={formData.credentials}
                  onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                  placeholder="e.g., MD (Cardiology), MBBS, Ayurveda Practitioner"
                  required
                />
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Clinic / Organization (Optional)</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                  placeholder="e.g., Kathmandu Clinic"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* NMC Registration Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  NMC Registration Number <span className="text-slate-400 font-normal text-xs">(or any certificate registration number)</span>
                </label>
                <input
                  type="text"
                  value={formData.nmc_number}
                  onChange={(e) => setFormData({ ...formData, nmc_number: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                  placeholder="e.g., 12345 (Optional)"
                />
              </div>

              {/* Credential Link */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Credential Link / Document URL</label>
                <input
                  type="url"
                  value={formData.credential_link}
                  onChange={(e) => setFormData({ ...formData, credential_link: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                  placeholder="e.g., https://drive.google.com/your-certificate"
                  required
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Why do you want to join SafeMed?</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all"
                placeholder="Share your interest or clinical background details..."
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
