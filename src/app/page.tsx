"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#00ffcc] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
