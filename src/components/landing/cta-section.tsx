import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const CtaSection = () => {
  return (
    <div className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative rounded-[50px] bg-[#F1E300] py-16 px-4 md:px-20 overflow-hidden">
          {/* Background shapes */}
          <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
            <div className="absolute -left-[68px] top-0 h-full">
              <Image
                src="/decorations/shapes-2.svg"
                alt="Decorative shapes"
                width={448}
                height={387}
              />
            </div>
            <div className="absolute right-[150px] top-[20%]">
              <Image
                src="/decorations/shapes-3.svg"
                alt="Decorative shapes"
                width={266}
                height={196}
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative flex flex-col items-center text-center z-10 max-w-[602px] mx-auto space-y-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#14142B] leading-tight">
              Talk to users today. Seriously, we&apos;re fast.
            </h2>
            <Button 
              asChild
              className="bg-[#14142B] hover:bg-[#0A0A1B] text-white rounded-full py-4 px-7 h-[64px] text-lg font-semibold"
            >
              <Link href="/get-started">
                Start Research Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CtaSection; 