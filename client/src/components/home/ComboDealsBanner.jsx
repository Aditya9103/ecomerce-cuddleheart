import { Link } from 'react-router-dom';
import { useGetOffersQuery } from '../../store/slices/offerApiSlice';

const ComboDealsBanner = () => {
  const { data: offers, isLoading } = useGetOffersQuery();

  if (isLoading) return null;

  // Find the first active combo offer to display in the banner
  const comboOffer = offers?.find(o => o.type === 'Combo' && o.isActive);

  if (!comboOffer) return null; // Don't show if no combo offer is active

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-primary-light rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        
        {/* Content */}
        <div className="z-10 md:w-1/2 mb-8 md:mb-0">
          <p className="text-sm font-bold text-gray-600 uppercase flex items-center gap-2 mb-2">
            Bundle Of <span className="text-primary">Happiness</span> ♥
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-heading leading-tight mb-6">
            {comboOffer.title}
          </h2>
          <p className="text-gray-600 mb-6 font-medium">
            {comboOffer.description}
          </p>
          <Link to={`/offers`} className="btn-primary inline-block">
            View Combo Deals &rarr;
          </Link>
        </div>

        {/* Image / Graphics */}
        <div className="z-10 md:w-1/2 relative flex justify-end items-center">
          {/* Badge */}
          <div className="absolute top-0 right-0 md:-right-10 badge-discount w-24 h-24 shadow-lg z-20">
            <div className="flex flex-col items-center">
              <span className="text-center font-bold text-lg leading-tight mt-4">Save<br/>Big!</span>
            </div>
          </div>

          <img 
            src={comboOffer.bannerImage || "https://images.unsplash.com/photo-1518976662495-97693fb57a05?w=500&h=300&fit=crop"} 
            alt="Combo Deals" 
            className="rounded-2xl shadow-sm object-cover max-h-[250px] rotate-2"
          />
        </div>
      </div>
    </section>
  );
};

export default ComboDealsBanner;
