import Image from "next/image";
import { StarIcon } from "lucide-react";

const TestimonialSection = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden bg-[#F9FAFB]">
          <div className="p-6 md:p-16 flex flex-col justify-center space-y-8 flex-1">
            <div className="space-y-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon 
                    key={star} 
                    className="h-5 w-5 fill-[#FEC84B] text-[#FEC84B]" 
                  />
                ))}
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-medium text-[#27273C] leading-relaxed">
                &ldquo;Afkar&apos;s platform has been instrumental in helping us understand our Saudi customers. The insights we&apos;ve gained have directly impacted our product decisions.&rdquo;
              </blockquote>
            </div>
            
            <div className="space-y-1">
              <div className="font-semibold text-lg">Mohammed Al-Harbi</div>
              <div className="text-gray-500">Product Director, TechArabia</div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            </div>
          </div>
          
          <div className="relative lg:w-[480px] h-[300px] lg:h-auto">
            <Image
              src="/testimonials/customer.svg"
              alt="Testimonial customer"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute left-[50%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[88px] h-[88px] rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
              <div className="w-5 h-5 border-l-[10px] border-l-white border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection; 