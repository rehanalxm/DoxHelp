/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServiceCatalogue } from './components/ServiceCatalogue';
import { PaymentSection } from './components/PaymentSection';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { EnquiryModal } from './components/EnquiryModal';
import { WhatsAppSuccessModal } from './components/WhatsAppSuccessModal';
import { FloatingActions } from './components/FloatingActions';
import { Footer } from './components/Footer';
import { SERVICE_CATEGORIES } from './data/services';
import { ServiceCategory, ServiceItem } from './types/service';

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const [enquiryService, setEnquiryService] = useState<ServiceItem | null>(null);
  const [enquiryCategory, setEnquiryCategory] = useState<ServiceCategory | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState<string | null>(null);

  const handleSelectService = (service: ServiceItem, category: ServiceCategory) => {
    setSelectedService(service);
    setSelectedCategory(category);
  };

  const clearSelectedServices = () => {
    setSelectedServiceIds([]);
  };

  const toggleSelectedService = (serviceId: string) => {
    const isActiveService = SERVICE_CATEGORIES.some(
      (category) =>
        category.status === 'active' && category.services.some((service) => service.id === serviceId)
    );

    if (!isActiveService) return;

    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleProceedToEnquiry = (service: ServiceItem, category: ServiceCategory) => {
    if (category.status !== 'active') return;
    setSelectedService(null);
    setSelectedCategory(null);
    setSelectedServiceIds([service.id]);
    setEnquiryService(service);
    setEnquiryCategory(category);
    setIsEnquiryModalOpen(true);
  };

  const handleOpenBulkEnquiry = () => {
    const validSelectedIds = selectedServiceIds.filter((id) =>
      SERVICE_CATEGORIES.some(
        (category) =>
          category.status === 'active' && category.services.some((service) => service.id === id)
      )
    );

    if (validSelectedIds.length === 0) return;
    setSelectedServiceIds(validSelectedIds);
    setSelectedService(null);
    setSelectedCategory(null);
    setEnquiryService(null);
    setEnquiryCategory(null);
    setIsEnquiryModalOpen(true);
  };

  const handleEnquirySuccess = (whatsappUrl: string) => {
    setIsEnquiryModalOpen(false);
    setPendingWhatsAppUrl(whatsappUrl);
    setSelectedServiceIds([]);
  };

  const scrollToServices = () => {
    const el = document.getElementById('services-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPayment = () => {
    const el = document.getElementById('payment-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-zinc-900 selection:text-white">
      <Header onNavigateToServices={scrollToServices} onNavigateToPayment={scrollToPayment} />

      <main className="flex-1">
        <Hero onExploreClick={scrollToServices} />

        <ServiceCatalogue
          categories={SERVICE_CATEGORIES}
          selectedServiceIds={selectedServiceIds}
          onSelectService={handleSelectService}
          onToggleService={toggleSelectedService}
          onEnquireSelected={handleOpenBulkEnquiry}
          onClearSelected={clearSelectedServices}
        />

        <PaymentSection />
      </main>

      <Footer />
      <FloatingActions />

      <ServiceDetailModal
        service={selectedService}
        category={selectedCategory}
        onClose={() => {
          setSelectedService(null);
          setSelectedCategory(null);
        }}
        onProceedToEnquiry={handleProceedToEnquiry}
      />

      {isEnquiryModalOpen && (
        <EnquiryModal
          service={enquiryService}
          category={enquiryCategory}
          categories={SERVICE_CATEGORIES}
          selectedServiceIds={selectedServiceIds.filter((id) =>
            SERVICE_CATEGORIES.some(
              (category) =>
                category.status === 'active' && category.services.some((service) => service.id === id)
            )
          )}
          onSelectionChange={setSelectedServiceIds}
          onClose={() => {
            setIsEnquiryModalOpen(false);
            setEnquiryService(null);
            setEnquiryCategory(null);
          }}
          onSuccessPrompt={handleEnquirySuccess}
        />
      )}

      <WhatsAppSuccessModal
        whatsappUrl={pendingWhatsAppUrl}
        onClose={() => setPendingWhatsAppUrl(null)}
      />
    </div>
  );
}
