"use client";

import React, { useState } from 'react';
import Navbar from '../app/dashboard/components/Navbar';
import HeroSection from './dashboard/components/HeroSection';
import PropertyServices from './dashboard/components/PropertyServices';
import PopularLocalities from './dashboard/components/PopularLocalities';
import ExclusiveOwner from './dashboard/components/ExclusiveOwner';
import FreshProperties from './dashboard/components/FreshProperties';
import PropertyOptions from './dashboard/components/PropertyOptions';
import Footer from './dashboard/components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <PropertyServices />
      <PopularLocalities />
      <ExclusiveOwner />
      <FreshProperties />
      <PropertyOptions />
      <Footer />
    </div>
  );
};

export default LandingPage;
