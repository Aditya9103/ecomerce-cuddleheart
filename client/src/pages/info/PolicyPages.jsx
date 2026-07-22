import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';

const policyContent = {
  '/shipping-policy': {
    title: 'Shipping Policy',
    content: (
      <>
        <h3>1. Processing Time</h3>
        <p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
        
        <h3>2. Domestic Shipping Rates and Estimates</h3>
        <p>Shipping charges for your order will be calculated and displayed at checkout. We offer Free Standard Shipping on all orders over ₹999.</p>
        
        <h3>3. International Shipping</h3>
        <p>We currently do not offer international shipping outside of India. We are looking into expanding our shipping zones in the future.</p>
        
        <h3>4. How do I check the status of my order?</h3>
        <p>When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
      </>
    )
  },
  '/return-policy': {
    title: 'Return Policy',
    content: (
      <>
        <h3>1. Return Window</h3>
        <p>We accept returns up to 30 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.</p>
        
        <h3>2. Damaged Items</h3>
        <p>In the event that your order arrives damaged in any way, please email us as soon as possible at support@cuddlehearts.com with your order number and a photo of the item’s condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.</p>
        
        <h3>3. Non-Returnable Items</h3>
        <p>Gift cards and personalized plushies are exempt from being returned.</p>
      </>
    )
  },
  '/returns': { // Same as return policy essentially, or combined. We'll map it to the same content.
    title: 'Returns & Refunds',
    content: (
      <>
        <h3>1. Refunds</h3>
        <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
        <p>If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within 5-7 business days.</p>
        
        <h3>2. Late or missing refunds</h3>
        <p>If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted.</p>
      </>
    )
  },
  '/terms': {
    title: 'Terms & Conditions',
    content: (
      <>
        <h3>1. Introduction</h3>
        <p>Welcome to Cuddle Hearts. By accessing our website, you agree to be bound by these terms and conditions, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
        
        <h3>2. Use License</h3>
        <p>Permission is granted to temporarily download one copy of the materials (information or software) on Cuddle Hearts' website for personal, non-commercial transitory viewing only.</p>
        
        <h3>3. Disclaimer</h3>
        <p>The materials on Cuddle Hearts' website are provided on an 'as is' basis. Cuddle Hearts makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      </>
    )
  },
  '/privacy': {
    title: 'Privacy Policy',
    content: (
      <>
        <h3>1. Information Collection</h3>
        <p>We collect information from you when you register on our site, place an order, subscribe to our newsletter or fill out a form. When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, phone number or credit card information.</p>
        
        <h3>2. Information Usage</h3>
        <p>Any of the information we collect from you may be used in one of the following ways: To personalize your experience, to improve our website, to improve customer service, or to process transactions.</p>
        
        <h3>3. Information Protection</h3>
        <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
      </>
    )
  }
};

const links = [
  { path: '/shipping-policy', label: 'Shipping Policy' },
  { path: '/return-policy', label: 'Return Policy' },
  { path: '/returns', label: 'Refunds' },
  { path: '/terms', label: 'Terms & Conditions' },
  { path: '/privacy', label: 'Privacy Policy' }
];

const PolicyPages = () => {
  const location = useLocation();
  const policy = policyContent[location.pathname] || policyContent['/terms'];

  return (
    <div className="font-body bg-gray-50 min-h-screen pb-20">
      <PageHeader 
        title={policy.title} 
        breadcrumbs={<><Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">/</span> <span>{policy.title}</span></>}
      />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4 px-4">Legal Directory</h3>
              <ul className="flex flex-col gap-1">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      to={link.path}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.path ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-primary prose-headings:font-heading prose-headings:font-bold prose-p:text-gray-600 max-w-none">
            {policy.content}
            <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PolicyPages;
