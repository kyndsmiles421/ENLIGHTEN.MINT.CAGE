/**
 * ENLIGHTEN.MINT.CAFE - APEX CREATOR MODE PAGE
 * ApexCreatorPage.js
 * 
 * Full-screen entry point for the Apex Creator Console V28.0
 * This page immediately launches the QU-32 Hybrid mixing board.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApexCreatorConsole from '../components/ApexCreatorConsole';
import { Loader2 } from 'lucide-react';

export default function ApexCreatorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Brief loading state for dramatic effect
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
        style={{ background: '#000000' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white tracking-wider mb-2">
            INITIALIZING CREATOR MODE
          </h1>
          <p className="text-sm text-white/40">
            QU-32 HARDWARE SYNC • V28.0
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      </div>
    );
  }
  
  return <ApexCreatorConsole onClose={handleClose} />;
}
