"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative w-full">
      {/* Navigation */}
      <header className="w-full border-b border-gray-100">
        <div className="container mx-auto flex h-[107px] items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <div className="relative h-[52px] w-[168px]">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00A6FF] to-[#80DDFF]" 
                   style={{left: '3.94%', right: '75.48%', top: '14.49%', bottom: '0.01%'}} />
              <div className="absolute bg-gradient-to-tr from-[#1244FF] to-[#8AA7FF]" 
                   style={{left: '3.94%', right: '81.83%', top: '17.92%', bottom: '25.34%'}} />
              <div className="absolute bg-gradient-to-tr from-[#6A55FF] to-[#C3B4FF]"
                   style={{left: '-0.06%', right: '81.83%', top: '0%', bottom: '45.14%'}} />
              <div className="absolute text-[#212280]" style={{left: '31.95%', right: '54.22%', top: '26.33%', bottom: '25.43%'}}>A</div>
              <div className="absolute text-[#212280]" style={{left: '46.85%', right: '46.6%', top: '25.43%', bottom: '25.43%'}}>F</div>
              <div className="absolute text-[#212280]" style={{left: '56.34%', right: '34.33%', top: '26.33%', bottom: '25.43%'}}>K</div>
              <div className="absolute text-[#212280]" style={{left: '66.92%', right: '21.65%', top: '37.99%', bottom: '25.42%'}}>A</div>
              <div className="absolute text-[#212280]" style={{left: '80.7%', right: '12.99%', top: '38.92%', bottom: '25.43%'}}>R</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#products" className="text-[16px] font-semibold text-gray-600 hover:text-gray-900">
              Products
            </Link>
            <Link href="#solutions" className="text-[16px] font-semibold text-gray-600 hover:text-gray-900">
              Solutions
            </Link>
            <Link href="#resources" className="text-[16px] font-semibold text-gray-600 hover:text-gray-900">
              Resources
            </Link>
            <Link href="#pricing" className="text-[16px] font-semibold text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              asChild
              variant="ghost" 
              className="hidden md:flex items-center gap-2 text-[16px] font-semibold text-gray-600"
            >
              <Link href="/login">
                <span className="flex items-center gap-2">
                  <span className="text-gray-600">EN</span>
                </span>
              </Link>
            </Button>
            <Button 
              asChild
              variant="ghost" 
              className="hidden md:flex items-center gap-2 text-[16px] font-semibold text-gray-600"
            >
              <Link href="/login">
                <span className="flex items-center gap-2">
                  <span className="text-gray-600">Login</span>
                </span>
              </Link>
            </Button>
            <Button 
              asChild
              className="bg-[#D9F2FF] text-[#14142B] hover:bg-[#C3E8FF] rounded-[40px] py-4 px-7"
            >
              <Link href="/signup">
                Sign up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-[739px]">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-tight tracking-tighter text-[#14142B]">
              Understand your customers through real research insights
            </h1>
            <p className="text-xl text-gray-600 max-w-[560px]">
              Create smarter products with direct user feedback. Test, learn, and perfect your digital experiences.
            </p>
            <div className="mt-4">
              <Button 
                asChild
                className="bg-[#212280] hover:bg-[#181870] text-white rounded-[40px] py-4 px-7 h-[64px] text-[16px]"
              >
                <Link href="/get-started">
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>
          
          <div className={`relative w-full h-[540px] transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute w-[292px] h-[292px] right-[60px] top-[calc(50%-292px/2-70px)]">
              <Image
                src="/illustrations/hive.svg"
                alt="Hive illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute h-[312px] left-0 right-[252px] top-[calc(50%-312px/2)]">
              <Image
                src="/illustrations/data.svg"
                alt="Data visualization"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute w-[496px] h-[364px] right-[68px] top-[calc(50%-364px/2+70px)]">
              <Image
                src="/illustrations/ecommerce.svg"
                alt="E-commerce performance"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute w-[96px] h-[148px] right-[60px] top-[calc(50%-148px/2-150px)]">
              <Image
                src="/illustrations/performance.svg"
                alt="Performance metrics"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection; 