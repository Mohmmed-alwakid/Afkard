import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Role - Afkar",
  description: "Choose your role to sign up for Afkar",
};

const ChooseRolePage = () => {
  return (
    <div className="min-h-screen bg-[#F6F6FA] flex flex-col">
      {/* Header */}
      <header className="bg-white h-[107px] border-b border-gray-100">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative h-[52px] w-[168px]">
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
          </Link>

          {/* Language selector */}
          <div className="flex items-center gap-2 text-gray-600 font-semibold">
            <span>EN</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#14142B] mb-4">Let&apos;s get that account created!</h1>
            <p className="text-xl text-gray-600">Choose Role</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Researcher Card */}
            <Link 
              href="/signup/researcher" 
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center"
            >
              <div className="w-48 h-48 mb-6">
                <Image 
                  src="/illustrations/researcher.svg" 
                  alt="Researcher role" 
                  width={200} 
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold text-[#14142B] mb-2">Researcher</h2>
              <p className="text-gray-600 text-center">
                Create studies, recruit participants, analyze results.
              </p>
            </Link>

            {/* Participant Card */}
            <Link 
              href="/signup/participant" 
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center"
            >
              <div className="w-48 h-48 mb-6">
                <Image 
                  src="/illustrations/participant.svg" 
                  alt="Participant role" 
                  width={200} 
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-semibold text-[#14142B] mb-2">Participant</h2>
              <p className="text-gray-600 text-center">
                Join studies, provide feedback, earn rewards.
              </p>
            </Link>
          </div>

          {/* Divider with OR */}
          <div className="flex items-center my-10">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Already have an account */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#212280] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChooseRolePage; 