import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Shield, Users } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';

const About = () => {
  return (
    <div className="font-body bg-gray-50 min-h-screen pb-20">
      <PageHeader
        title="About Cuddle Hearts"
        breadcrumbs={<><Link to="/" className="hover:text-primary">Home</Link> <span className="mx-2">/</span> <span>About Us</span></>}
      />

      <div className="container mx-auto px-4">

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12 mb-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-6">Spreading Joy, One Hug at a Time.</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At Cuddle Hearts, we believe in the magic of a warm embrace. Founded in 2025, our mission has been simple: to create the world's most huggable, premium soft toys that bring smiles to children and comfort to adults.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every plushie we design is crafted with love, using only the safest, ultra-soft materials. Whether it's a giant teddy bear for a special anniversary or a magical unicorn for a child's birthday, we ensure every product is filled with joy.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="aspect-square bg-primary/10 rounded-[3rem] overflow-hidden relative shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center text-9xl">🧸</div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">1M+</div>
              <div>
                <p className="font-bold text-gray-900">Smiles Delivered</p>
                <p className="text-xs text-gray-500">Across the globe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-extrabold text-center text-gray-900 mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crafted with Love</h3>
              <p className="text-gray-600 text-sm">Every stitch is made with care to ensure the highest quality and durability.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Materials</h3>
              <p className="text-gray-600 text-sm">We use only ultra-soft, hypoallergenic fabrics that are gentle on the skin.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Safe</h3>
              <p className="text-gray-600 text-sm">Rigorously tested to meet and exceed global child safety standards.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600 text-sm">A portion of every sale goes to charities supporting children in need.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
