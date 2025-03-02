import Image from "next/image";

const SocialProofSection = () => {
  return (
    <section className="w-full py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8">
          <p className="text-gray-500 text-center text-lg">
            Trusted by leading companies in the region
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            <div className="relative h-12 w-24">
              <Image 
                src="/logos/client-1.svg" 
                alt="Client logo"
                fill
                className="object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="relative h-12 w-24">
              <Image 
                src="/logos/client-2.svg" 
                alt="Client logo"
                fill
                className="object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="relative h-12 w-24">
              <Image 
                src="/logos/client-3.svg" 
                alt="Client logo"
                fill
                className="object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="relative h-12 w-24">
              <Image 
                src="/logos/client-4.svg" 
                alt="Client logo"
                fill
                className="object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection; 