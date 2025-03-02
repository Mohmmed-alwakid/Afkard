"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ServiceCardProps = {
  icon: string;
  title: string;
  description: string;
};

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-10 bg-[#212280] rounded-[30px] text-white h-full">
      <div className="flex-shrink-0 w-[85px] h-[85px] relative">
        <Image 
          src={icon}
          alt={title}
          width={85}
          height={85}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col gap-6">
        <h3 className="text-lg font-bold tracking-wide">{title}</h3>
        <p className="text-sm text-gray-300 mb-8">{description}</p>
        <Link href="/services" className="text-white font-semibold flex items-center gap-2 mt-auto text-base">
          Learn More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const services = [
    {
      icon: "/icons/target.svg",
      title: "Target Your Customers",
      description: "Define the characteristics of the target audience by defining general characteristics"
    },
    {
      icon: "/icons/testing.svg",
      title: "User Testing",
      description: "Conduct comprehensive user testing sessions with real users from your target audience.",
      link: "/services/user-testing"
    },
    {
      icon: "/icons/ai.svg",
      title: "Artificial Intelligence",
      description: "Quality control of participants to analyze sentiments and behaviors, embedding machine science models"
    },
    {
      icon: "/icons/prototype.svg",
      title: "Prototype Management",
      description: "The Afakar platform provides you with a library of test templates that you can use to build your own test."
    },
    {
      icon: "/icons/analysis.svg",
      title: "Analysis of Results",
      description: "Create a test plan to ask any question or perform specific tasks - anything from UI, UX design, CX."
    },
    {
      icon: "/icons/consultation.svg",
      title: "Consultation Session",
      description: "A team of research experts is with you every step of the way."
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#212280]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-12">
          <div className="space-y-4">
            <p className="text-[#6A55FF] text-xl">Our Services</p>
            <h2 className="text-white text-3xl md:text-4xl font-bold max-w-[700px]">
              Comprehensive research and user testing platform for your product
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 