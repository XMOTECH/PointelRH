/**
 * Component: FaceRecognitionCard
 * Studio Viewfinder Biométrique épuré pour PointelRH avec gestion fluide des erreurs & reprises
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useFaceDetection } from '../hooks/useFaceDetection';

type FaceState = 'loading_models' | 'requesting_camera' | 'no_camera' | 'scanning' | 'face_detected' | 'recognizing' | 'error';

interface FaceRecognitionCardProps {
  onFaceDetected: (descriptor: number[]) => void;
  isPending: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
}

export const FaceRecognitionCard: React.FC<FaceRecognitionCardProps> = ({
  onFaceDetected,
  isPending,
  isSuccess = false,
  isError = false,
  errorMessage = null,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const autoTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  const { modelsLoaded, isLoading: modelsLoading, error: modelsError, detectFace } = useFaceDetection();

  const [faceState, setFaceState] = useState<FaceState>('loading_models');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Démarrer la caméra
  const startCamera = useCallback(async () => {
    try {
      setFaceState('requesting_camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setFaceState('scanning');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Accès à la caméra refusé ou indisponible.');
      setFaceState('no_camera');
    }
  }, []);

  // Arrêter la caméra
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (autoTriggerTimeoutRef.current) {
      clearTimeout(autoTriggerTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
    return () => stopCamera();
  }, [modelsLoaded, startCamera, stopCamera]);

  useEffect(() => {
    if (modelsLoading) setFaceState('loading_models');
    if (modelsError) setFaceState('error');
  }, [modelsLoading, modelsError]);

  // Récupération automatique après une erreur
  useEffect(() => {
    if (isError) {
      setFaceState('error');
      const timer = setTimeout(() => {
        hasTriggeredRef.current = false;
        setFaceState('scanning');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isError]);

  // Boucle de détection temps réel fluide
  useEffect(() => {
    if (faceState !== 'scanning' && faceState !== 'face_detected') return;
    if (!videoRef.current || !modelsLoaded) return;

    let running = true;

    const detect = async () => {
      if (!running || !videoRef.current) return;
      if (videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const result = await detectFace(videoRef.current);

      if (!running) return;

      if (result && !disabled && !isPending && !isSuccess && !isError) {
        setFaceState('face_detected');

        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          setFaceState('recognizing');
          if (autoTriggerTimeoutRef.current) clearTimeout(autoTriggerTimeoutRef.current);
          autoTriggerTimeoutRef.current = setTimeout(() => {
            onFaceDetected(result.descriptor);
          }, 600);
        }
      } else {
        if (faceState === 'face_detected' && !hasTriggeredRef.current) {
          setFaceState('scanning');
        }
      }

      setTimeout(() => {
        if (running) animFrameRef.current = requestAnimationFrame(detect);
      }, 70);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => { running = false; };
  }, [faceState, modelsLoaded, detectFace, isPending, disabled, isSuccess, isError, onFaceDetected]);

  const isRecognizingOrPending = faceState === 'recognizing' || isPending;
  const isDetected = faceState === 'face_detected' || isRecognizingOrPending || isSuccess;

  return (
    <div className="bg-surface-container-lowest border border-on-surface/15 rounded-2xl p-6 shadow-none flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      
      {/* Studio Viewfinder Frame */}
      <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-300 shadow-sm ${
        isSuccess
          ? 'border-emerald-500 ring-4 ring-emerald-500/20'
          : faceState === 'error' || isError
          ? 'border-rose-500 ring-4 ring-rose-500/20'
          : isDetected
          ? 'border-emerald-400'
          : 'border-on-surface/15'
      }`}>
        
        {/* Live Camera Stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Floating Minimal HUD Target Reticle */}
        <div className="absolute inset-6 pointer-events-none flex items-center justify-center">
          
          {/* Top-Left Corner Bracket */}
          <div
            className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-300 ${
              isSuccess || isDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />
          {/* Top-Right Corner Bracket */}
          <div
            className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-300 ${
              isSuccess || isDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />
          {/* Bottom-Left Corner Bracket */}
          <div
            className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-300 ${
              isSuccess || isDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />
          {/* Bottom-Right Corner Bracket */}
          <div
            className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg transition-colors duration-300 ${
              isSuccess || isDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
            }`}
          />

          {/* Smooth Scanning Laser Line (only when searching) */}
          {faceState === 'scanning' && !isError && (
            <motion.div
              animate={{ y: ['-90%', '90%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] opacity-75"
            />
          )}
        </div>

        {/* Bottom Floating Status Pill in Viewfinder */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none px-4">
          <div className={`backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-md transition-all ${
            isSuccess
              ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
              : isError || faceState === 'error'
              ? 'bg-rose-950/80 border border-rose-500/30 text-rose-300'
              : 'bg-slate-950/70 border border-white/10 text-white'
          }`}>
            {faceState === 'scanning' && !isError && (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Positionnez votre visage face à la caméra</span>
              </>
            )}
            {faceState === 'face_detected' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-300">Visage détecté • Validation...</span>
              </>
            )}
            {isRecognizingOrPending && !isSuccess && !isError && (
              <>
                <Loader2 size={13} className="animate-spin text-emerald-400" />
                <span className="text-emerald-300">Pointage en cours...</span>
              </>
            )}
            {isSuccess && (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-emerald-300">Pointage Validé</span>
              </>
            )}
            {(faceState === 'error' || isError) && (
              <>
                <AlertCircle size={14} className="text-rose-400" />
                <span className="text-rose-300">{errorMessage || 'Visage non reconnu • Réessayez'}</span>
              </>
            )}
            {faceState === 'no_camera' && (
              <>
                <AlertCircle size={13} className="text-rose-400" />
                <span className="text-rose-300">Caméra introuvable</span>
              </>
            )}
            {(faceState === 'loading_models' || faceState === 'requesting_camera') && (
              <>
                <Loader2 size={13} className="animate-spin text-white/70" />
                <span>Initialisation du capteur...</span>
              </>
            )}
          </div>
        </div>

        {/* Success Splash Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white gap-2 pointer-events-none"
            >
              <CheckCircle2 size={44} className="text-emerald-400 stroke-[2]" />
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                Pointage Confirmé
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Camera State Screen */}
        {faceState === 'no_camera' && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-rose-400 gap-2 p-6 text-center">
            <AlertCircle size={32} />
            <span className="text-xs font-semibold text-rose-200">
              {cameraError || 'Accès à la caméra refusé.'}
            </span>
          </div>
        )}
      </div>

      {/* Subtitle / Retry button if error */}
      {(isError || faceState === 'error') ? (
        <button
          onClick={() => {
            hasTriggeredRef.current = false;
            setFaceState('scanning');
          }}
          className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer"
        >
          <RefreshCw size={13} />
          Cliquer pour réessayer immédiatement
        </button>
      ) : (
        <p className="text-xs text-on-surface-variant font-medium text-center">
          L'identification et l'horodatage s'enregistrent automatiquement sans contact.
        </p>
      )}
    </div>
  );
};
