import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.' },
      { q: 'Do you ship internationally?', a: 'Yes, we ship to over 50 countries worldwide. International shipping usually takes 7-14 business days.' },
      { q: 'How can I track my order?', a: 'Once your order ships, you will receive an email with a tracking number. You can also use our Track Order page.' }
    ]
  },
  {
    category: 'Products & Quality',
    questions: [
      { q: 'Are your toys safe for newborns?', a: 'Yes! All our toys undergo rigorous safety testing and are certified safe for all ages, including newborns. They are made from hypoallergenic materials and have no small, detachable parts.' },
      { q: 'How do I wash my plushie?', a: 'We recommend spot cleaning with a damp cloth and mild soap. For deeper cleans, you can machine wash on a delicate cycle in a mesh bag.' },
      { q: 'What materials do you use?', a: 'Our plushies are made from premium ultra-soft polyester fibers and filled with high-grade PP cotton.' }
    ]
  },
  {
    category: 'Returns & Refunds',
    questions: [
      { q: 'What is your return policy?', a: 'We offer a 30-day money-back guarantee. If you are not completely satisfied, you can return your item in its original condition for a full refund.' },
      { q: 'Do I have to pay for return shipping?', a: 'If the return is due to our error (defective or wrong item), we cover the return shipping. Otherwise, the customer is responsible for return shipping costs.' }
    ]
  }
];

const FaqItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-gray-100 rounded-2xl mb-4 bg-white overflow-hidden transition-all shadow-sm">
      <button 
        className="w-full p-6 text-left flex items-center justify-between focus:outline-none hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-gray-900 pr-8">{q}</span>
        {isOpen ? <ChevronUp className="text-primary flex-shrink-0" /> : <ChevronDown className="text-gray-400 flex-shrink-0" />}
      </button>
      <div 
        className={`px-6 text-gray-600 text-sm leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? 'pb-6 max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        {a}
      </div>
    </div>
  );
};

const Faq = () => {
  return (
    <div className="font-body bg-gray-50 min-h-screen pb-20">
      <PageHeader 
        title="Frequently Asked Questions" 
        breadcrumbs={<><Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">/</span> <span>FAQs</span></>}
      />
      
      <div className="container mx-auto px-4 max-w-3xl">
        {faqs.map((group, idx) => (
          <div key={idx} className="mb-10">
            <h2 className="text-2xl font-heading font-extrabold text-gray-900 mb-6 pl-2 border-l-4 border-primary">
              {group.category}
            </h2>
            <div>
              {group.questions.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-12 bg-primary/10 rounded-3xl p-8 text-center border border-primary/20">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">We're here to help you out.</p>
          <Link to="/contact" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all shadow-md">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Faq;
