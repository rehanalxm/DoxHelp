import React, { useEffect, useMemo, useState } from 'react';
import { X, Send, ShieldCheck, Check } from 'lucide-react';
import { ServiceItem, ServiceCategory } from '../types/service';
import { WHATSAPP_RAW_NUMBER } from '../data/services';

interface EnquiryModalProps {
  service: ServiceItem | null;
  category: ServiceCategory | null;
  categories: ServiceCategory[];
  selectedServiceIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onClose: () => void;
  onSuccessPrompt: (whatsappUrl: string) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  service,
  category,
  categories,
  selectedServiceIds: selectedIdsFromParent,
  onSelectionChange,
  onClose,
  onSuccessPrompt,
}) => {
  const activeCategories = categories.filter((c) => c.status === 'active');

  const availableServices = useMemo(
    () =>
      activeCategories.flatMap((cat) =>
        cat.services.map((item) => ({
          category: cat,
          service: item,
        }))
      ),
    [activeCategories]
  );

  const initialSelected = useMemo(() => {
    if (selectedIdsFromParent && selectedIdsFromParent.length > 0) return selectedIdsFromParent;
    if (service?.id) return [service.id];
    return [];
  }, [selectedIdsFromParent, service]);

  const [customerName, setCustomerName] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialSelected);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setSelectedServiceIds(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const selectedServices = availableServices.filter(({ service }) =>
    selectedServiceIds.includes(service.id)
  );

  const validate = () => {
    const nextErrors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      nextErrors.customerName = 'Please enter your name.';
    }

    if (selectedServiceIds.length === 0) {
      nextErrors.services = 'Please select at least one service.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const toggleService = (serviceId: string) => {
    const nextIds = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId];

    setSelectedServiceIds(nextIds);
    if (onSelectionChange) onSelectionChange(nextIds);

    if (errors.services) {
      setErrors((prev) => ({ ...prev, services: '' }));
    }
  };

  const generateWhatsAppMessage = () => {
    const serviceList = selectedServices
      .map(({ category, service }) => `• ${service.name}${category ? ` (${category.title})` : ''}`)
      .join('\n');

    return [
      'Hello Dox Help,',
      '',
      `My name is ${customerName.trim()}.`,
      '',
      'I am interested in the following services:',
      serviceList,
      '',
      'Please share the details and pricing for these services.',
      'Thank you.',
    ].join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_RAW_NUMBER}?text=${encodeURIComponent(message)}`;
    onSuccessPrompt(whatsappUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
        className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-zinc-900 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] sm:shadow-[6px_6px_0px_#18181b] max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
        </div>

        <div className="px-5 sm:px-6 pt-3 pb-4 border-b-2 border-zinc-900 flex items-center justify-between bg-[#FFFDF9]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-900 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WhatsApp Enquiry</span>
            </div>
            <h2 id="enquiry-modal-title" className="text-xl sm:text-2xl font-black text-zinc-950 leading-tight">
              Selected Services
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-zinc-900 bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200 shadow-[2px_2px_0px_#18181b] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            aria-label="Close enquiry form"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-4 overflow-y-auto space-y-4 text-left text-xs sm:text-sm flex-1">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] flex items-start gap-2.5 text-xs text-zinc-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[2.5]" />
            <p className="font-semibold leading-relaxed">
              <strong>Safe & Secure:</strong> Just add your name and the services you want, then we open WhatsApp with your enquiry.
            </p>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-zinc-900 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
              }}
              placeholder="e.g., Rohit Sharma"
              className={`w-full px-4 py-2.5 rounded-2xl border-2 border-zinc-900 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#18181b] focus:outline-none transition-all ${
                errors.customerName ? 'bg-red-50 border-red-500' : 'bg-white'
              }`}
            />
            {errors.customerName && (
              <p className="text-xs text-red-600 font-bold mt-1">{errors.customerName}</p>
            )}
          </div>

          {selectedServices.length > 0 && (
            <div className="rounded-2xl border-2 border-zinc-900 bg-zinc-50 p-3 shadow-[2px_2px_0px_#18181b]">
              <p className="text-[11px] font-black uppercase tracking-wider text-zinc-700 mb-2">Selected Services</p>
              <div className="flex flex-wrap gap-2">
                {selectedServices.map(({ category, service }) => (
                  <div
                    key={service.id}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-zinc-900 bg-white px-2.5 py-1.5 text-[11px] font-bold text-zinc-900 shadow-[1px_1px_0px_#18181b]"
                  >
                    <span>{service.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-white hover:bg-red-600 transition-colors"
                      aria-label={`Remove ${service.name}`}
                    >
                      <X className="h-2.5 w-2.5 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.services && (
            <p className="text-xs text-red-600 font-bold mt-1">{errors.services}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-zinc-950 text-white font-black text-sm sm:text-base border-2 border-zinc-900 shadow-[3px_3px_0px_#FACC15] hover:bg-zinc-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Send to WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
