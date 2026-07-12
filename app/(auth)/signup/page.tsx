import { SignupForm } from "@/components/auth/signup-form";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Left Form Section */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* <div className="mb-10">
            <Link href="/" className="flex items-center gap-2 w-max">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <span className="text-2xl font-bold tracking-tight font-heading">AssetFlow</span>
            </Link>
          </div> */}
          <SignupForm />
        </div>
      </div>

      {/* Right Image Section */}
      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden">
        <div className="absolute inset-0 h-full w-full object-cover">
          <Image
            src="/authhh.png"
            alt="AssetFlow Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          <h2 className="text-3xl font-bold font-heading mb-4">Complete Visibility. Absolute Control.</h2>
          <p className="text-lg text-white/90">
            Join thousands of organizations using AssetFlow to bring clarity to their physical infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
