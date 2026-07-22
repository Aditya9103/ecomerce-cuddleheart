import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import BestSellers from '../components/home/BestSellers';
import ComboDealsBanner from '../components/home/ComboDealsBanner';
import TrustBadgesStrip from '../components/home/TrustBadgesStrip';
import NewsletterSignup from '../components/home/NewsletterSignup';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col font-body bg-white text-gray-800">
      <main className="flex-grow">
        <HeroCarousel />
        <CategoryGrid />
        <BestSellers />
        <ComboDealsBanner />
        <TrustBadgesStrip />
        <NewsletterSignup />
      </main>
    </div>
  );
};

export default Home;
