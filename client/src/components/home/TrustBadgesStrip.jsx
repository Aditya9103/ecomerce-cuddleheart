import { Truck, RotateCcw, Banknote, ShieldCheck, HeadphonesIcon } from 'lucide-react';

const TrustBadgesStrip = () => {
  const badges = [
    { icon: <Truck size={24} />, title: 'Free Shipping', sub: 'On orders above ₹999' },
    { icon: <RotateCcw size={24} />, title: '7 Days Returns', sub: 'Easy return & refund' },
    { icon: <Banknote size={24} />, title: 'COD Available', sub: 'Pay on delivery' },
    { icon: <ShieldCheck size={24} />, title: 'Secure Payments', sub: '100% safe & secure' },
    { icon: <HeadphonesIcon size={24} />, title: '24/7 Support', sub: 'We are here to help' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border border-border rounded-2xl py-8 px-4 flex flex-wrap md:flex-nowrap justify-center gap-6 md:gap-4 lg:gap-10">
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center gap-3 w-[45%] md:w-auto">
            <div className="text-orange-400">
              {badge.icon}
            </div>
            <div>
              <h5 className="font-bold text-gray-800 text-sm leading-tight">{badge.title}</h5>
              <p className="text-[10px] text-gray-500">{badge.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadgesStrip;
