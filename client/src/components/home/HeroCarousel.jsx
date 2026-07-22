import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetBannersQuery } from '../../store/slices/productApiSlice';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: banners, isLoading } = useGetBannersQuery();

  if (isLoading) return <div className="container mx-auto px-4 py-6"><div className="bg-cream rounded-2xl h-[400px]"></div></div>;
  if (!banners || banners.length === 0) return null;

  const handlePrev = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const handleNext = () => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));

  const banner = banners[currentSlide];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-cream rounded-2xl overflow-hidden relative min-h-[400px] flex items-center">
        {/* Left/Right Buttons */}
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 z-10">
          <ChevronLeft className="text-gray-600" />
        </button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 z-10">
          <ChevronRight className="text-gray-600" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-12 md:px-20 py-12 w-full items-center relative">

          {/* Content */}
          <div className="z-10 relative">
            <p className="text-sm font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2 mb-4">
              {banner.eyebrow} <HeartIcon />
            </p>
            <h2 className="text-5xl md:text-6xl font-heading font-extrabold text-heading leading-tight mb-6">
              {banner.heading} <br />
              <span className="text-primary">{banner.highlightWord}</span>
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              {banner.subtext}
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link to={banner.ctaPrimaryLink || "/shop"} className="btn-primary">
                {banner.ctaPrimaryText || "Shop Now"} &rarr;
              </Link>
              {banner.ctaSecondaryText && (
                <Link to={banner.ctaSecondaryLink || "/categories"} className="btn-secondary">
                  {banner.ctaSecondaryText}
                </Link>
              )}
            </div>

            {/* Trust icons row under CTA */}
            <div className="flex items-center gap-6 text-[10px] text-gray-500 font-semibold uppercase">
              <div className="flex items-center gap-1"><BadgeIcon /> Premium Quality</div>
              <div className="flex items-center gap-1"><SafeIcon /> Kid Friendly</div>
              <div className="flex items-center gap-1"><ReturnIcon /> Easy Returns</div>
              <div className="flex items-center gap-1"><ShieldIcon /> Secure Payment</div>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex justify-center items-center">
            {/* Discount Badge */}
            {banner.discountBadgeText && (
              <div className="absolute top-50 right-10 z-20 badge-discount w-24 h-24 rotate-[-25deg] shadow-lg">
                <div className="flex flex-col items-center">
                  <span className="text-center font-bold text-lg leading-tight mt-4">{banner.discountBadgeText}</span>
                </div>
              </div>
            )}

            <img
              src={banner.image}
              alt={banner.heading}
              className="h-96 object-contain rounded-2xl drop-shadow-xl mix-blend-multiply"
            />
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2">
          {banners.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 rounded-full cursor-pointer ${index === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-gray-300'}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;

// Placeholder micro-icons for trust row inside hero
const HeartIcon = () => <span className="text-primary text-lg">♥</span>;
const BadgeIcon = () => <span className="text-primary text-sm">☆</span>;
const SafeIcon = () => <span className="text-primary text-sm">☺</span>;
const ReturnIcon = () => <span className="text-primary text-sm">↺</span>;
const ShieldIcon = () => <span className="text-primary text-sm">🛡</span>;
