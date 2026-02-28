import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

const MANGA_IMAGES = [
  'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=800&q=80',
  'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=800&q=80',
  'https://images.unsplash.com/photo-1626595158845-04c5ae5661bf?w=800&q=80',
];

export default function Welcome() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('password'); // password, ready, arrow, images
  const [password, setPassword] = useState('');
  const [displayText, setDisplayText] = useState('YORIMU');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [visibleImageCount, setVisibleImageCount] = useState(0);

  // Yorimu deletion animation
  useEffect(() => {
    if (stage !== 'password' || !isDeleting) return;

    if (displayText.length === 0) {
      setTimeout(() => setStage('ready'), 500);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText(displayText.slice(0, -1));
    }, 200);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, stage]);

  // Show images one by one
  useEffect(() => {
    if (stage !== 'images') return;

    if (visibleImageCount < MANGA_IMAGES.length) {
      const timer = setTimeout(() => {
        setVisibleImageCount(prev => prev + 1);
      }, 10000); // 60 seconds / 6 images = 10 seconds each
      return () => clearTimeout(timer);
    } else {
      // After 1 minute, navigate to library
      setTimeout(() => {
        localStorage.setItem('yorimu_welcome_seen', 'true');
        navigate(createPageUrl('Home'));
      }, 2000);
    }
  }, [visibleImageCount, stage, navigate]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const validPasswords = ['hamster', 'flamingo', 'hams', 'flams', 'muna', 'nasra'];
    if (validPasswords.includes(password.toLowerCase())) {
      setIsDeleting(true);
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleArrowClick = () => {
    setStage('images');
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen bg-gradient-to-br from-[hsl(222,47%,4%)] via-[hsl(258,60%,6%)] to-[hsl(222,47%,4%)] flex items-center justify-center px-4 overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/20 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
              opacity: [0.1, 0.6, 0.1],
              scale: [0.5, 2, 0.5],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {stage === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8"
            >
              {/* Logo - deleting animation */}
              <div className="mb-12">
                <motion.div
                  className="text-7xl font-black text-violet-400 tracking-[0.3em] mb-4"
                  animate={{
                    textShadow: [
                      "0 0 30px rgba(139, 92, 246, 0.4)",
                      "0 0 60px rgba(139, 92, 246, 0.8)",
                      "0 0 30px rgba(139, 92, 246, 0.4)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {displayText}
                  {displayText.length > 0 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-16 bg-violet-400 ml-2"
                    />
                  )}
                </motion.div>
              </div>

              {!isDeleting && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 max-w-md mx-auto">
                    <Lock className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="bg-[hsl(222,47%,9%)] border-violet-500/30 text-white placeholder:text-[hsl(215,15%,40%)] text-lg py-6"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-12 py-6 text-lg rounded-2xl"
                  >
                    Enter
                  </Button>
                  <p className="text-xs text-[hsl(215,15%,40%)] mt-4">
                    Hint: Animals or special names
                  </p>
                </motion.form>
              )}
            </motion.div>
          )}

          {stage === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              onAnimationComplete={() => {
                setTimeout(() => setStage('arrow'), 2000);
              }}
              className="text-center space-y-6"
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-violet-300"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Get ready to start immersing yourselves
              </motion.h1>
              <motion.div
                className="flex items-center justify-center gap-3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-violet-400 rounded-full"
                    style={{
                      animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {stage === 'arrow' && (
            <motion.div
              key="arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center"
            >
              <motion.button
                onClick={handleArrowClick}
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    x: [0, 20, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-white"
                >
                  <ArrowRight className="w-32 h-32" strokeWidth={1.5} />
                </motion.div>
                
                {/* Whoosh effect */}
                <motion.div
                  className="absolute inset-0 blur-xl opacity-50"
                  animate={{
                    x: [0, 40, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-32 h-32 text-violet-400" strokeWidth={1.5} />
                </motion.div>
                
                <p className="text-violet-300 text-lg mt-6 group-hover:text-white transition-colors">
                  Click to continue
                </p>
              </motion.button>
            </motion.div>
          )}

          {stage === 'images' && (
            <motion.div
              key="images"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-center text-violet-300 mb-12"
              >
                Welcome to Your Manga Sanctuary
              </motion.h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MANGA_IMAGES.map((img, idx) => (
                  <AnimatePresence key={idx}>
                    {idx < visibleImageCount && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                        className="relative overflow-hidden rounded-2xl aspect-[3/4] shadow-2xl"
                      >
                        <img
                          src={img}
                          alt={`Manga ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-violet-900/60 to-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              {visibleImageCount === MANGA_IMAGES.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center pt-8"
                >
                  <p className="text-violet-300 text-lg">Entering Yorimu...</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

     <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
