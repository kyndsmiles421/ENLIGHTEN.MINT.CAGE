import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Certifications() {
  const { token, authHeaders } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/certifications/my`, { headers: authHeaders })
      .then(r => setCerts(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error('Failed to load certifications'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#D4AF37' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto" data-testid="certifications-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#D4AF37' }}>
            <Award size={12} className="inline mr-1" /> Your Achievements
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
            Certifications
          </h1>
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
            Earned through dedication to your practice
          </p>
        </div>

        {!token ? (
          <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>Sign in to view your certifications</p>
        ) : certs.length === 0 ? (
          <div className="text-center py-16">
            <Award size={48} className="mx-auto mb-4" style={{ color: 'rgba(248,250,252,0.15)' }} />
            <p className="text-sm mb-2" style={{ color: 'rgba(248,250,252,0.5)' }}>No certifications yet</p>
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>Complete all lessons in a class to earn your certificate</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {certs.map((cert, i) => (
              <motion.div key={cert.id || i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 relative overflow-hidden"
                data-testid={`cert-${cert.id || i}`}
                style={{ background: 'rgba(15,17,28,0.7)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(16px)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5"
                  style={{ background: 'radial-gradient(circle, #D4AF37, transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.1)', border: '2px solid rgba(212,175,55,0.25)' }}>
                      <Award size={24} style={{ color: '#D4AF37' }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#F8FAFC' }}>{cert.class_name || 'Course Completed'}</p>
                      <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.4)' }}>
                        <CheckCircle size={10} style={{ color: '#22C55E' }} /> Certified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>
                      <Calendar size={10} />
                      {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString() : 'Completed'}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}>
                      ID: {(cert.id || '').slice(0, 8)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
