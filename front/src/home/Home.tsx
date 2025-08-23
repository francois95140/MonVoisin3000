import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ActionButtons from './components/ActionButtons';
import CommunityStats from './components/CommunityStats';
import FeaturesSection from './components/FeaturesSection';
import Testimonial from './components/Testimonial';
import Footer from './components/Footer';

const HomePage = () => {
  return (
    <>
      <Header />
      
      <main className="px-6 pb-8">
        <HeroSection />
        <ActionButtons />
        <CommunityStats />
        <FeaturesSection />
        <Testimonial />
        <Footer />
      </main>
    </>
  );
};

export default HomePage;