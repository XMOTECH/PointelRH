/**
 * Component: FaceRecognitionCard
 * Affiche le flux webcam avec détection faciale en temps réel pour le pointage
 *
 * Responsabilités:
 * - Accéder à la webcam via getUserMedia
 * - Détecter un visage en continu via face-api.js
 * - Afficher un overlay de détection
 * - Capturer le descripteur et déclencher le clock-in
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Loader2, AlertCircle, UserCheck, ScanFace } from 'lucide-react';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { SPACING, COLORS } from '../constants';

type FaceState = 'loading_models' | 'requesting_camera' | 'no_camera' | 'scanning' | 'face_detected' | 'recognizing' | 'error';

interface FaceRecognitionCardProps {
  onFaceDetected: (descriptor: number[]) => void;
  isPending: boolean;
  disabled?: boolean;
}

export const FaceRecognitionCard: React.FC<FaceRecognitionCardProps> = ({
  onFaceDetected,
  isPending,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastDescriptorRef = useRef<number[] | null>(null);

  const { modelsLoaded, isLoading: modelsLoading, error: modelsError, detectFace } = useFaceDetection();

  const [faceState, setFaceState] = useState<FaceState>('loading_models');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Démarrer la webcam
  const startCamera = useCallback(async () => {
    try {
      setFaceState('requesting_camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setFaceState('scanning');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setFaceState('no_camera');
    }
  }, []);

  // Arrêter la webcam
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, []);

  // Initialiser quand les modèles sont chargés
  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
    return () => stopCamera();
  }, [modelsLoaded, startCamera, stopCamera]);

  // Mettre à jour l'état en fonction du chargement des modèles
  useEffect(() => {
    if (modelsLoading) setFaceState('loading_models');
    if (modelsError) setFaceState('error');
  }, [modelsLoading, modelsError]);

  // Boucle de détection
  useEffect(() => {
    if (faceState !== 'scanning' && faceState !== 'face_detected') return;
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    let running = true;

    const detect = async () => {
      if (!running || !videoRef.current || !canvasRef.current) return;
      if (videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const result = await detectFace(videoRef.current);

      if (!running) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Synchroniser les dimensions du canvas avec la vidéo
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (result) {
        setFaceState('face_detected');
        lastDescriptorRef.current = result.descriptor;

        // Dessiner le rectangle de détection
        const { x, y, width, height } = result.detection.box;
        ctx.strokeStyle = '#00B5AD';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        // Coin décoratifs
        const cornerLen = 20;
        ctx.strokeStyle = '#00B5AD';
        ctx.lineWidth = 4;
        // Top-left
        ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(x + width - cornerLen, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + cornerLen); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(x, y + height - cornerLen); ctx.lineTo(x, y + height); ctx.lineTo(x + cornerLen, y + height); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(x + width - cornerLen, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - cornerLen); ctx.stroke();
      } else {
        setFaceState('scanning');
        lastDescriptorRef.current = null;
      }

      // Continuer la boucle (~5 FPS pour ne pas surcharger)
      setTimeout(() => {
        if (running) animFrameRef.current = requestAnimationFrame(detect);
      }, 200);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => { running = false; };
  }, [faceState, modelsLoaded, detectFace]);

  const handleClockIn = () => {
    if (lastDescriptorRef.current && !isPending && !disabled) {
      setFaceState('recognizing');
      onFaceDetected(lastDescriptorRef.current);
    }
  };

  const stateConfig: Record<FaceState, { label: string; sublabel: string; color: string; icon: React.ReactNode }> = {
    loading_models: {
      label: 'Chargement',
      sublabel: 'Initialisation des modèles IA...',
      color: COLORS.primary,
      icon: <Loader2 size={20} className="animate-spin" />,
    },
    requesting_camera: {
      label: 'Caméra',
      sublabel: 'Autorisation en cours...',
      color: COLORS.primary,
      icon: <Camera size={20} />,
    },
    no_camera: {
      label: 'Erreur',
      sublabel: cameraError || 'Caméra non disponible',
      color: COLORS.error,
      icon: <AlertCircle size={20} />,
    },
    scanning: {
      label: 'Recherche',
      sublabel: 'Positionnez votre visage face à la caméra',
      color: COLORS.warning,
      icon: <ScanFace size={20} />,
    },
    face_detected: {
      label: 'Visage détecté',
      sublabel: 'Cliquez pour pointer',
      color: COLORS.success,
      icon: <UserCheck size={20} />,
    },
    recognizing: {
      label: 'Reconnaissance',
      sublabel: 'Identification en cours...',
      color: COLORS.primary,
      icon: <Loader2 size={20} className="animate-spin" />,
    },
    error: {
      label: 'Erreur',
      sublabel: modelsError || 'Erreur technique',
      color: COLORS.error,
      icon: <AlertCircle size={20} />,
    },
  };

  const config = stateConfig[faceState];

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: SPACING.lg,
        gap: SPACING.md,
      }}
    >
      {/* Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          backgroundColor: `${config.color}15`,
          color: config.color,
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {config.icon}
        {config.label}
      </div>

      {/* Video Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
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
            transform: 'scaleX(-1)', // Effet miroir
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)',
            pointerEvents: 'none',
          }}
        />

        {/* Overlay loading */}
        {(faceState === 'loading_models' || faceState === 'requesting_camera') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              gap: '12px',
            }}
          >
            <Loader2 size={40} className="animate-spin" style={{ opacity: 0.8 }} />
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{config.sublabel}</p>
          </div>
        )}

        {/* Scanning overlay guide */}
        {faceState === 'scanning' && (
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
                width: '55%',
                aspectRatio: '3/4',
                border: '2px dashed rgba(255,255,255,0.4)',
                borderRadius: '50%',
              }}
            />
          </div>
        )}
      </div>

      {/* Sublabel */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
        {config.sublabel}
      </p>

      {/* Action Button */}
      <button
        onClick={handleClockIn}
        disabled={faceState !== 'face_detected' || isPending || disabled}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: SPACING.base,
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: faceState === 'face_detected' && !isPending ? 1 : 0.5,
        }}
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Reconnaissance...
          </>
        ) : (
          <>
            <ScanFace size={18} />
            Pointer par Visage
          </>
        )}
      </button>
    </div>
  );
};
