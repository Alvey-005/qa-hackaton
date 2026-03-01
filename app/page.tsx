"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  const [isTimeReached, setIsTimeReached] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(8, 0, 0, 0); // 8:00 AM today

      if (now >= targetTime) {
        setIsTimeReached(true);
      } else {
        const diff = targetTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isTimeReached) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          Our site will be available at 8:00 AM today
        </p>
        <div className="text-5xl font-mono font-bold text-indigo-600 mb-4">
          {timeRemaining}
        </div>
        <p className="text-sm text-gray-500">
          Please check back shortly
        </p>
      </div>
    </div>
  );
}
