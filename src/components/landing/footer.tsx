"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type FooterColumnProps = {
  title: string;
  links: {
    label: string;
    href: string;
    badge?: string;
  }[];
};

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
    <div className="flex flex-col gap-3">
      {links.map((link, index) => (
        <Link 
          key={index} 
          href={link.href}
          className="text-gray-200 font-semibold flex items-center gap-2"
        >
          {link.label}
          {link.badge && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs">
              {link.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  </div>
);

const Footer = () => {
  return (
    <footer className="w-full bg-[#14142B] py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Logo and About */}
          <div className="space-y-6">
            <div className="relative h-[56px] w-[168px]">
              <div className="relative h-full w-full">
                <div className="absolute bg-gradient-to-tr from-[#00A6FF] to-[#80DDFF]" 
                     style={{left: '3.7%', right: '77.31%', top: '19.56%', bottom: '7.14%'}} />
                <div className="absolute bg-gradient-to-tr from-[#1244FF] to-[#8AA7FF]" 
                     style={{left: '3.7%', right: '83.17%', top: '22.5%', bottom: '28.85%'}} />
                <div className="absolute bg-gradient-to-tr from-[#6A55FF] to-[#C3B4FF]"
                     style={{left: '0%', right: '83.17%', top: '7.14%', bottom: '45.83%'}} />
                <div className="absolute text-white" style={{left: '29.56%', right: '57.68%', top: '29.72%', bottom: '28.93%'}}>A</div>
                <div className="absolute text-white" style={{left: '43.31%', right: '50.65%', top: '28.94%', bottom: '28.94%'}}>F</div>
                <div className="absolute text-white" style={{left: '52.34%', right: '39.04%', top: '29.72%', bottom: '28.93%'}}>K</div>
                <div className="absolute text-white" style={{left: '62.11%', right: '27.33%', top: '39.71%', bottom: '28.92%'}}>A</div>
                <div className="absolute text-white" style={{left: '76.02%', right: '18.15%', top: '40.51%', bottom: '28.94%'}}>R</div>
              </div>
            </div>
            
            <p className="text-gray-200 max-w-[360px]">
              Afkar provides user research and testing tools to help companies make better product decisions based on real user feedback.
            </p>
          </div>
          
          {/* Product Links */}
          <FooterColumn
            title="Product"
            links={[
              { label: "Overview", href: "/product" },
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Updates", href: "/updates", badge: "New" },
              { label: "Beta", href: "/beta" },
            ]}
          />
          
          {/* Company Links */}
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "/about" },
              { label: "Customers", href: "/customers" },
              { label: "Blog", href: "/blog" },
              { label: "Careers", href: "/careers" },
              { label: "Contact", href: "/contact" },
            ]}
          />
          
          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Stay up to date</h3>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white rounded-lg border-none" 
              />
              <Button className="bg-[#3C3D8F] hover:bg-[#32338A] text-white rounded-lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-300 text-center md:text-left">
            © 2024 Afkar. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-gray-300 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-300 hover:text-white">
              Privacy
            </Link>
            <Link href="/cookies" className="text-gray-300 hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 