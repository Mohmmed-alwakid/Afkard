"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    title: "Research",
    description: "Launch surveys and test prototypes and concepts from our intuitive drag-and-drop builder."
  },
  {
    title: "Integrate",
    description: "Seamlessly connect with design and productivity tools like Figma, Amplitude, or Zoom."
  },
  {
    title: "Recruit",
    description: "Reach participants directly from our Panel or from a custom database of your own users."
  },
  {
    title: "Analyze",
    description: "Remove the silos of product research and bring in your whole team."
  }
];

const FeaturesSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Amplify your customer voice with continuous product discovery
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feature Image */}
          <div className="flex-grow relative">
            <div className="relative w-full h-[580px] rounded-md overflow-hidden">
              <Image
                src="/features/platform-overview.svg"
                alt="Platform overview"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                priority
              />
              <div className="absolute left-[5%] top-[10%] bg-white p-2 rounded-sm shadow-md">
                <div className="w-4 h-4 bg-blue-500 rounded-sm" />
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-1 mt-4 w-full">
              {[0, 1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className="flex-1 h-1 rounded-full overflow-hidden bg-[#DAD5FF]"
                >
                  {step === activeStep && (
                    <div className="h-full w-[40%] bg-[#6A55FF] rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="w-full lg:w-[320px] flex-shrink-0">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`p-6 mb-px cursor-pointer transition-colors ${
                  index === activeStep 
                    ? 'bg-[#F3F9FF]' 
                    : 'bg-white'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
            
            <Button 
              asChild
              className="ml-6 mt-6 bg-[#D4E6FF] text-[#0568FD] hover:bg-[#0568FD] hover:text-white border-none rounded-full"
            >
              <Link href="/get-started-free">
                Get started free
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 