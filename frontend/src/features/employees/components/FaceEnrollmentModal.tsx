/**
 * Component: FaceEnrollmentModal
 * Modal d'enregistrement facial guidé pour les employés
 *
 * Flow:
 * 1. Activer la webcam
 * 2. Guider l'utilisateur ("Regardez devant", "Tournez à gauche", "Tournez à droite")
 * 3. Capturer 3 descripteurs
 * 4. Envoyer au backend
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, CheckCircle2, Loader2, RotateCcw, ScanFace, Trash2 } from 'lucide-react';
import { useFaceDetection } from '../../clockin/hooks/useFaceDetection';
import { useFaceEnrollmentStatus, useEnrollFace, useDeleteFaceData } from '../hooks/useFaceEnrollment';
import type { FaceDescriptorEntry } from '../api/face.api';

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

type Step = { label: string; direction: string; key: string };

const STEPS: Step[] = [
  { label: 'Regardez droit devant', direction: 'front', key: 'front' },
  { label: 'Tournez légèrement à gauche', direction: 'left', key: 'left' },
  { label: 'Tournez légèrement à droite', direction: 'right', key: 'right' },
];

export function FaceEnrollmentModal({ open, onClose, employeeId, employeeName }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [captured, setCaptured] = useState<FaceDescriptorEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [enrollmentDone, setEnrollmentDone] = useState(false);

  const { modelsLoaded, isLoading: modelsLoading, detectFace } = useFaceDetection();
  const { data: enrollmentStatus, isLoading: statusLoading } = useFaceEnrollmentStatus(employeeId);
  const { mutateAsync: enrollFace, isPending: enrolling } = useEnrollFace(employeeId);
  const { mutateAsync: deleteFaceData, isPending: deleting } = useDeleteFaceData(employeeId);

  // Démarrer la caméra
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
    } catch {
      setCameraReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  // Démarrer la caméra quand le modal s'ouvre et les modèles sont chargés
  useEffect(() => {
    if (open && modelsLoaded && !enrollmentDone) {
      startCamera();
    }
    return () => {
      if (!open) stopCamera();
    };
  }, [open, modelsLoaded, enrollmentDone, startCamera, stopCamera]);

  // Cleanup au démontage
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Capturer le visage pour l'étape courante
  const handleCapture = async () => {
    if (!videoRef.current || !modelsLoaded || isCapturing) return;

    setIsCapturing(true);
    try {
      const result = await detectFace(videoRef.current);
      if (!result) {
        setIsCapturing(false);
        return;
      }

      const entry: FaceDescriptorEntry = {
        descriptor: result.descriptor,
        label: STEPS[currentStep].key,
      };

      const newCaptured = [...captured, entry];
      setCaptured(newCaptured);

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Toutes les captures terminées, envoyer au backend
        await enrollFace(newCaptured);
        setEnrollmentDone(true);
        stopCamera();
      }
    } catch (err) {
      console.error('Face capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCaptured([]);
    setEnrollmentDone(false);
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
    onClose();
  };

  if (!open) return null;

  const isAlreadyEnrolled = enrollmentStatus?.enrolled && !enrollmentDone && captured.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-on-surface/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/5">
          <div className="flex items-center gap-3">
            <ScanFace size={20} className="text-primary" />
            <div>
              <h2 className="text-lg font-display font-bold text-on-surface">Reconnaissance Faciale</h2>
              <p className="text-xs text-on-surface-variant">{employeeName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {/* Cas: Déjà enregistré */}
          {isAlreadyEnrolled && !statusLoading && (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-on-surface">Visage enregistré</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {enrollmentStatus.count} capture(s) enregistrée(s)
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-on-surface/10 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <RotateCcw size={16} />
                  Recommencer
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {/* Cas: Enrollment terminé */}
          {enrollmentDone && (
            <div className="w-full flex flex-col items-center gap-4 py-4">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-on-surface">Enregistrement réussi !</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {captured.length} captures enregistrées. L'employé peut maintenant pointer par reconnaissance faciale.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="btn btn-primary w-full py-2.5"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Cas: En cours de capture */}
          {!isAlreadyEnrolled && !enrollmentDone && (
            <>
              {/* Progression */}
              <div className="w-full flex items-center gap-2">
                {STEPS.map((step, i) => (
                  <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-1.5 rounded-full transition-all ${
                        i < captured.length
                          ? 'bg-green-500'
                          : i === currentStep
                            ? 'bg-primary'
                            : 'bg-surface-container-highest'
                      }`}
                    />
                    <span className={`text-[10px] font-medium ${
                      i === currentStep ? 'text-primary' : 'text-on-surface-variant'
                    }`}>
                      {step.direction === 'front' ? 'Devant' : step.direction === 'left' ? 'Gauche' : 'Droite'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Instruction */}
              <p className="text-sm font-medium text-on-surface">
                {modelsLoading
                  ? 'Chargement des modèles IA...'
                  : !cameraReady
                    ? 'Activation de la caméra...'
                    : STEPS[currentStep]?.label}
              </p>

              {/* Video */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '360px',
                  aspectRatio: '4/3',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: '#1a1a2e',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                  }}
                />
                {/* Guide oval */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '50%',
                      aspectRatio: '3/4',
                      border: `3px dashed ${cameraReady ? 'rgba(0, 181, 173, 0.6)' : 'rgba(255,255,255,0.3)'}`,
                      borderRadius: '50%',
                      transition: 'border-color 0.3s',
                    }}
                  />
                </div>

                {/* Loading overlay */}
                {(modelsLoading || !cameraReady) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                    }}
                  >
                    <Loader2 size={36} className="animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Capture Button */}
              <button
                onClick={handleCapture}
                disabled={!cameraReady || !modelsLoaded || isCapturing || enrolling}
                className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                style={{ opacity: cameraReady && modelsLoaded && !isCapturing ? 1 : 0.5 }}
              >
                {isCapturing || enrolling ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {enrolling ? 'Enregistrement...' : 'Capture...'}
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    Capturer ({captured.length + 1}/{STEPS.length})
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
