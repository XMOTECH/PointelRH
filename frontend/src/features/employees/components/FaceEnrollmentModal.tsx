/**
 * Component: FaceEnrollmentModal
 * Modal d'enregistrement facial moderne, guidé & automatique (Apple Face ID Style) pour PointelRH
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CheckCircle2, Loader2, RotateCcw, ScanFace, Trash2, Check } from 'lucide-react';
import { useFaceDetection } from '../../clockin/hooks/useFaceDetection';
import { useFaceEnrollmentStatus, useEnrollFace, useDeleteFaceData } from '../hooks/useFaceEnrollment';
import type { FaceDescriptorEntry } from '../api/face.api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

type Step = { label: string; direction: string; key: string; hint: string };

const STEPS: Step[] = [
  { label: 'Face avant', direction: 'front', key: 'front', hint: 'Regardez directement l\'objectif' },
  { label: 'Profil gauche', direction: 'left', key: 'left', hint: 'Tournez légèrement la tête vers la gauche' },
  { label: 'Profil droit', direction: 'right', key: 'right', hint: 'Tournez légèrement la tête vers la droite' },
];

export function FaceEnrollmentModal({ open, onClose, employeeId, employeeName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const autoSnapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef<boolean>(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [captured, setCaptured] = useState<FaceDescriptorEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [enrollmentDone, setEnrollmentDone] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [autoSnapCountdown, setAutoSnapCountdown] = useState<number | null>(null);

  const { modelsLoaded, isLoading: modelsLoading, detectFace } = useFaceDetection();
  const { data: enrollmentStatus, isLoading: statusLoading } = useFaceEnrollmentStatus(employeeId);
  const { mutateAsync: enrollFace, isPending: enrolling } = useEnrollFace(employeeId);
  const { mutateAsync: deleteFaceData, isPending: deleting } = useDeleteFaceData(employeeId);

  // Démarrer la webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (autoSnapTimeoutRef.current) clearTimeout(autoSnapTimeoutRef.current);
    setCameraReady(false);
    setAutoSnapCountdown(null);
  }, []);

  // Cycle de démarrage / arrêt caméra
  useEffect(() => {
    if (open && modelsLoaded && !enrollmentDone) {
      startCamera();
    }
    return () => {
      if (!open) stopCamera();
    };
  }, [open, modelsLoaded, enrollmentDone, startCamera, stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Capture manuelle ou automatique
  const triggerCapture = useCallback(async (descriptor: number[]) => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;
    setIsCapturing(true);
    setAutoSnapCountdown(null);

    // Effet de flash doux
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const entry: FaceDescriptorEntry = {
      descriptor,
      label: STEPS[currentStep]?.key || 'front',
    };

    const newCaptured = [...captured.slice(0, currentStep), entry];
    setCaptured(newCaptured);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      setTimeout(() => {
        isCapturingRef.current = false;
        setIsCapturing(false);
      }, 700);
    } else {
      // Toutes les 3 étapes complétées, enregistrement backend
      try {
        await enrollFace(newCaptured.slice(0, 3));
        setEnrollmentDone(true);
        stopCamera();
      } catch (err: any) {
        console.error('Face enrollment error:', err);
        const errMsg = err?.response?.data?.message || 'Erreur lors de l\'enregistrement facial.';
        toast.error(errMsg);
      } finally {
        isCapturingRef.current = false;
        setIsCapturing(false);
      }
    }
  }, [currentStep, captured, enrollFace, stopCamera]);

  // Boucle de détection et d'auto-capture intelligente
  useEffect(() => {
    if (!open || !cameraReady || !modelsLoaded || !videoRef.current || enrollmentDone) return;

    let running = true;
    let stableFrames = 0;

    const detect = async () => {
      if (!running || !videoRef.current) return;
      if (videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const result = await detectFace(videoRef.current);

      if (!running) return;

      if (result && !isCapturingRef.current) {
        setFaceDetected(true);
        stableFrames++;

        // Si le visage est stable pendant 8 frames (~600ms), démarrer l'auto-snap
        if (stableFrames >= 6 && !autoSnapTimeoutRef.current) {
          setAutoSnapCountdown(1);
          autoSnapTimeoutRef.current = setTimeout(() => {
            autoSnapTimeoutRef.current = null;
            if (running && !isCapturingRef.current) {
              triggerCapture(result.descriptor);
            }
          }, 800);
        }
      } else {
        setFaceDetected(false);
        stableFrames = 0;
        if (autoSnapTimeoutRef.current) {
          clearTimeout(autoSnapTimeoutRef.current);
          autoSnapTimeoutRef.current = null;
          setAutoSnapCountdown(null);
        }
      }

      setTimeout(() => {
        if (running) animFrameRef.current = requestAnimationFrame(detect);
      }, 70);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      running = false;
      if (autoSnapTimeoutRef.current) {
        clearTimeout(autoSnapTimeoutRef.current);
        autoSnapTimeoutRef.current = null;
      }
    };
  }, [open, cameraReady, modelsLoaded, detectFace, enrollmentDone, triggerCapture]);

  // Capture manuelle de secours
  const handleManualCapture = async () => {
    if (!videoRef.current || !modelsLoaded || isCapturing) return;
    const result = await detectFace(videoRef.current);
    if (result) {
      triggerCapture(result.descriptor);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCaptured([]);
    setEnrollmentDone(false);
    isCapturingRef.current = false;
    startCamera();
  };

  const handleDelete = async () => {
    await deleteFaceData();
    handleReset();
  };

  const handleClose = () => {
    stopCamera();
    setCurrentStep(0);
    setCaptured([]);
    setEnrollmentDone(false);
    isCapturingRef.current = false;
    onClose();
  };

  if (!open) return null;

  const isAlreadyEnrolled = enrollmentStatus?.enrolled && !enrollmentDone && captured.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={handleClose}>
      <div
        className="bg-surface-container-lowest border border-on-surface/15 rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/10">
          <div className="flex items-center gap-2.5">
            <ScanFace size={20} className="text-primary" />
            <div>
              <h2 className="text-base font-extrabold text-on-surface tracking-tight">Enrôlement Biométrique</h2>
              <p className="text-xs text-on-surface-variant font-medium">{employeeName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center gap-5">
          
          {/* Cas: Déjà enregistré */}
          {isAlreadyEnrolled && !statusLoading && (
            <div className="w-full flex flex-col items-center gap-4 py-4">
              <CheckCircle2 size={42} className="text-emerald-500 stroke-[2]" />
              <div className="text-center">
                <p className="text-base font-extrabold text-on-surface">Visage Enregistré avec Succès</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {enrollmentStatus.count} signature(s) biométrique(s) active(s) en mémoire vive.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-on-surface/15 text-xs font-bold text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Réenregistrer
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Cas: Enrollment Terminé */}
          {enrollmentDone && (
            <div className="w-full flex flex-col items-center gap-4 py-6">
              <CheckCircle2 size={52} className="text-emerald-500 stroke-[2]" />
              <div className="text-center">
                <p className="text-lg font-extrabold text-on-surface">Enregistrement Terminé !</p>
                <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs">
                  Les 3 angles ont été validés et chargés dans le cache IA. Le pointage sans contact est désormais actif.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full bg-primary text-on-primary text-xs font-extrabold tracking-wide uppercase shadow-none hover:bg-primary/90 transition-all cursor-pointer mt-2"
              >
                Terminer
              </button>
            </div>
          )}

          {/* Cas: En cours de capture guidée */}
          {!isAlreadyEnrolled && !enrollmentDone && (
            <>
              {/* Segmented Step Indicator Capsules */}
              <div className="w-full grid grid-cols-3 gap-2">
                {STEPS.map((step, i) => {
                  const isDone = i < captured.length;
                  const isCurrent = i === currentStep;
                  return (
                    <div
                      key={step.key}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full border text-[11px] font-extrabold transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                          : isCurrent
                          ? 'bg-primary text-on-primary border-primary shadow-sm'
                          : 'bg-surface-container-low border-on-surface/10 text-on-surface-variant'
                      }`}
                    >
                      {isDone ? (
                        <Check size={12} className="stroke-[3]" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] bg-black/20 text-current">
                          {i + 1}
                        </span>
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Step Instruction Hint */}
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface uppercase tracking-wide">
                  {STEPS[currentStep]?.hint}
                </p>
              </div>

              {/* Studio Viewfinder Frame (Aspect 4/3) */}
              <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border transition-all duration-300 shadow-sm ${
                faceDetected
                  ? 'border-emerald-400 ring-4 ring-emerald-400/20'
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

                {/* Soft Flash Effect upon Capture */}
                <AnimatePresence>
                  {flashActive && (
                    <motion.div
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Floating Studio Reticle Corners */}
                <div className="absolute inset-6 pointer-events-none flex items-center justify-center">
                  <div
                    className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg transition-colors duration-300 ${
                      faceDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
                    }`}
                  />
                  <div
                    className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg transition-colors duration-300 ${
                      faceDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
                    }`}
                  />
                  <div
                    className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg transition-colors duration-300 ${
                      faceDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
                    }`}
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg transition-colors duration-300 ${
                      faceDetected ? 'border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'border-white/40'
                    }`}
                  />

                  {/* Scanning Laser Line when searching for face */}
                  {!faceDetected && cameraReady && !isCapturing && (
                    <motion.div
                      animate={{ y: ['-90%', '90%'] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] opacity-75"
                    />
                  )}
                </div>

                {/* Floating Status Pill in Viewfinder */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none px-4">
                  <div className={`backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-md transition-all ${
                    faceDetected
                      ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-950/70 border border-white/10 text-white'
                  }`}>
                    {(!cameraReady || modelsLoading) && (
                      <>
                        <Loader2 size={13} className="animate-spin text-white/70" />
                        <span>Initialisation du capteur...</span>
                      </>
                    )}
                    {cameraReady && !modelsLoading && !faceDetected && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Alignez votre visage</span>
                      </>
                    )}
                    {faceDetected && !isCapturing && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-emerald-300">
                          {autoSnapCountdown ? 'Maintien détecté • Capture...' : 'Visage aligné'}
                        </span>
                      </>
                    )}
                    {isCapturing && (
                      <>
                        <Loader2 size={13} className="animate-spin text-emerald-400" />
                        <span className="text-emerald-300">Enregistrement angle...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={handleManualCapture}
                disabled={!cameraReady || !modelsLoaded || isCapturing || enrolling}
                className="w-full py-3 rounded-full bg-primary text-on-primary text-xs font-extrabold tracking-wide uppercase shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isCapturing || enrolling ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>{enrolling ? 'Synchronisation IA...' : 'Capture en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Camera size={15} />
                    <span>Capturer manuellement ({Math.min(currentStep + 1, 3)}/3)</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
