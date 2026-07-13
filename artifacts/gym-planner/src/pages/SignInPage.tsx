import { SignIn } from "@clerk/react";

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function SignInPage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10"></div>
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] z-10 mix-blend-screen opacity-30"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[150px] z-10 mix-blend-screen opacity-20"></div>
      </div>

      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">
          Tarik Islam <span className="text-primary text-glow">AI Gym Planner</span>
        </h1>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}