import React from "react";
import AuthForm from "../components/AuthForm";
import GlitchHeader from "../components/GlitchHeader";

const AuthPage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-0 min-h-screen flex flex-col items-center relative z-10 ">
      <div className="mb-10 text-center pointer-events-auto animate-in slide-in-from-top duration-700">
        <GlitchHeader text="دروازه ورود" subtext="AUTHENTICATION_GATEWAY" />
        <p className="text-gray-400 mt-4 font-mono text-xs tracking-wider">
          SECURE CONNECTION ESTABLISHED // HANDSHAKE_INIT
        </p>
      </div>

      <div className="w-full flex justify-center px-4 animate-in zoom-in-95 duration-500 delay-150">
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
