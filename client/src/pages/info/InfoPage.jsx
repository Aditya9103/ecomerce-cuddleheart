import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const pagesData = {
  '/about': { title: 'About Us', content: 'Welcome to Cuddle Hearts! We are passionate about bringing joy to children and adults alike with our premium collection of soft toys.' },
  '/contact': { title: 'Contact Us', content: 'Have a question? We would love to hear from you. Reach out to our customer support team and we will get back to you within 24 hours.' },
  '/faqs': { title: 'Frequently Asked Questions', content: 'Find answers to common questions about our products, sizing, materials, and care instructions here.' },
  '/track-order': { title: 'Track Your Order', content: 'Enter your order ID and email address below to check the current status of your delivery.' },
  '/returns': { title: 'Returns & Refunds', content: 'We want you to be 100% satisfied. If you are not happy with your purchase, learn about our easy 30-day return process here.' },
  '/shipping-policy': { title: 'Shipping Policy', content: 'We offer fast and reliable shipping across the country. View our shipping rates, delivery times, and international shipping options.' },
  '/return-policy': { title: 'Return Policy', content: 'Detailed information regarding our return conditions, process, and refund timelines.' },
  '/terms': { title: 'Terms & Conditions', content: 'Please read these terms and conditions carefully before using our website and placing orders.' },
  '/privacy': { title: 'Privacy Policy', content: 'Your privacy is important to us. Learn how we collect, use, and protect your personal information.' },
  '/help': { title: 'Help Center', content: 'Welcome to our Help Center. Browse through our articles or contact support for personalized assistance.' }
};

const InfoPage = () => {
  const location = useLocation();
  const pageInfo = pagesData[location.pathname] || { title: 'Information', content: 'Information page.' };

  return (
    <div className="font-body bg-gray-50 min-h-screen pb-20">
      <PageHeader 
        title={pageInfo.title} 
        breadcrumbs={<><Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">/</span> <span>{pageInfo.title}</span></>}
      />
      
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-4xl mx-auto prose prose-gray">
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {pageInfo.content}
          </p>
          <div className="h-64 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-medium">
            [ Detailed {pageInfo.title} Content ]
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
