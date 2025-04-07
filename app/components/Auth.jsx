'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Github, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

function Auth() {
  const [gitLoading, setGitLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
   console.log(session)
    if (status === "authenticated" && session?.user) {
      toast.success(`Welcome ${session.user.name || 'back'}!`);
    }
  }, [session]);

  // const handleGitHubLogin = async () => {
  //   try {
  //     setGitLoading(true);
  //     await signIn('github', { callbackUrl: '/' });
  //   } catch (error) {
  //     toast.error("Authentication failed");
  //     setGitLoading(false);
  //   }
  // };
  const handleGoogleLogin = async () => {
    try {
      setGitLoading(true);
      await signIn('google', { callbackUrl: '/catalog' });
    } catch (error) {
      toast.error("Authentication failed");
      setGitLoading(false);
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen flex items-center justify-center  text-white">
      <motion.div
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4 shadow-xl w-[90%] max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
        <p className="text-gray-400">Access MovieVault using your favorite provider</p>

        {status === "authenticated" ? (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg text-white transition"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </button>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={gitLoading}
            className="flex items-center justify-center w-full bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg text-white transition"
          >
            {gitLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Signing in...
              </>
            ) : (
              <>
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default Auth;
