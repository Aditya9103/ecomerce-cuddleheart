
import { Link } from 'react-router-dom';
const Facebook = () => <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Youtube = () => <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
const Instagram = () => <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const LinkedinIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const WhatsappIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
const Footer = () => {

  return (
    <footer className="bg-cream pt-16 pb-8 border-t border-border mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Block */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-xl">🐻</div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-heading leading-none">Cuddle Hearts</span>
                <span className="text-[10px] text-textMuted uppercase font-semibold tracking-wider">Bringing Smiles, Everytime!</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm mb-6 max-w-sm">
              Premium soft toys for kids and loved ones. Because every hug matters!
            </p>
            <div className="flex items-center gap-4 text-primary">
              <a href="#" className="hover:text-primary-dark transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-primary-dark transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-primary-dark transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-heading mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading font-bold text-heading mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-primary transition-colors">Return Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-bold text-heading mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/shop/teddy-bears" className="hover:text-primary transition-colors">Teddy Bears</Link></li>
              <li><Link to="/shop/bunnies" className="hover:text-primary transition-colors">Bunnies</Link></li>
              <li><Link to="/shop/unicorns" className="hover:text-primary transition-colors">Unicorns</Link></li>
              <li><Link to="/shop/animals" className="hover:text-primary transition-colors">Animals</Link></li>
              <li><Link to="/shop/cartoon-characters" className="hover:text-primary transition-colors">Cartoon Characters</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; 2025 Cuddle Hearts. All Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-white border border-border rounded text-blue-800 font-bold italic">VISA</div>
            <div className="px-2 py-1 bg-white border border-border rounded text-red-500 font-bold">Mastercard</div>
            <div className="px-2 py-1 bg-white border border-border rounded text-gray-700 font-bold">UPI</div>
            <div className="px-2 py-1 bg-white border border-border rounded text-blue-500 font-bold">Paytm</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
