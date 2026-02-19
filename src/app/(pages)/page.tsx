import React from 'react';

import ScrollToTop from '@/components/common/ScrollToTop';
import Seperator from '@/components/common/Seperator';
import CTASection from '@/components/pages/home/sections/CTASection';
import DropZoneSection from '@/components/pages/home/sections/DropZoneSection';
import ExtensionSection from '@/components/pages/home/sections/ExtensionSection';
import FAQSection from '@/components/pages/home/sections/FAQSection';
import HeroSection from '@/components/pages/home/sections/HeroSection';
import HowItWorksSection from '@/components/pages/home/sections/HowItWorksSection';
import TemplatesSection from '@/components/pages/home/sections/TemplatesSection';
import TestimonialsSection from '@/components/pages/home/sections/TestimonialsSection';

function LandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <HeroSection />
      <TestimonialsSection />

      <section className='relative'>
        {/* DropZoneSection */}
        <div className='relative'>
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(135deg, rgba(248, 250, 252, 0.6) 0%, rgba(255, 255, 255, 0.8) 100%)',
              backdropFilter: 'blur(12px) saturate(110%)',
              WebkitBackdropFilter: 'blur(12px) saturate(110%)',
            }}
          ></div>
          <div className='relative z-10'>
            <DropZoneSection />
          </div>
        </div>

        <Seperator />

        {/* HowItWorksSection */}
        <div className='relative'>
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(135deg, rgba(243, 244, 246, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(18px) saturate(120%)',
              WebkitBackdropFilter: 'blur(18px) saturate(120%)',
            }}
          ></div>
          <div className='relative z-10'>
            <HowItWorksSection />
          </div>
        </div>

        <Seperator />

        {/* TemplatesSection */}
        <div className='relative'>
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(135deg, rgba(249, 250, 251, 0.5) 0%, rgba(248, 250, 252, 0.8) 100%)',
              backdropFilter: 'blur(20px) saturate(125%)',
              WebkitBackdropFilter: 'blur(20px) saturate(125%)',
            }}
          ></div>
          <div className='relative z-10'>
            <TemplatesSection />
          </div>
        </div>

        <Seperator />

        {/* BeforeAfterSection */}
        {/* <BeforeAfterSection /> */}

        <Seperator />

        {/* ExtensionSection */}
        <div className='relative'>
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(135deg, rgba(240, 249, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(20px) saturate(125%)',
              WebkitBackdropFilter: 'blur(20px) saturate(125%)',
            }}
          ></div>
          <div className='relative z-10'>
            <ExtensionSection />
          </div>
        </div>

        <Seperator />

        {/* FeaturesSection */}
        <div className='relative'>
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(135deg, rgba(236, 242, 250, 0.6) 0%, rgba(255, 255, 255, 0.85) 100%)',
              backdropFilter: 'blur(22px) saturate(130%)',
              WebkitBackdropFilter: 'blur(22px) saturate(130%)',
            }}
          ></div>
          <div className='relative z-10'>
            <FAQSection />
          </div>
        </div>

        <Seperator />
      </section>
      <CTASection />
      <ScrollToTop />
    </div>
  );
}

export default LandingPage;
