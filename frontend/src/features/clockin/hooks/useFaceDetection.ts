/**
 * Hook: useFaceDetection
 * Gère le chargement des modèles face-api.js et la détection/reconnaissance faciale
 *
 * Responsabilités:
 * - Charger les modèles TF.js une seule fois
 * - Détecter un visage dans un flux vidéo
 * - Extraire le descripteur 128-dim pour identification
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

export function useFaceDetection() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Charger les modèles une seule fois
  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const loadModels = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setError('Impossible de charger les modèles de reconnaissance faciale.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Options optimisées pour une exécution ultra-rapide
  const detectorOptions = useRef(new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5, maxResults: 1 }));

  /**
   * Détecter un visage et extraire le descripteur 128-dim de manière optimisée
   */
  const detectFace = useCallback(
    async (
      videoOrCanvas: HTMLVideoElement | HTMLCanvasElement
    ): Promise<{ descriptor: number[]; detection: faceapi.FaceDetection } | null> => {
      if (!modelsLoaded) return null;

      try {
        const result = await faceapi
          .detectSingleFace(videoOrCanvas, detectorOptions.current)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!result) return null;

        return {
          descriptor: Array.from(result.descriptor),
          detection: result.detection,
        };
      } catch (err) {
        console.warn('Face detection pass warning:', err);
        return null;
      }
    },
    [modelsLoaded]
  );

  /**
   * Détection de présence ultra-légère pour le suivi de cadrage (~20ms)
   */
  const detectFacePresence = useCallback(
    async (
      videoOrCanvas: HTMLVideoElement | HTMLCanvasElement
    ): Promise<faceapi.FaceDetection | null> => {
      if (!modelsLoaded) return null;

      try {
        const result = await faceapi.detectSingleFace(videoOrCanvas, detectorOptions.current);
        return result || null;
      } catch {
        return null;
      }
    },
    [modelsLoaded]
  );

  return {
    modelsLoaded,
    isLoading,
    error,
    detectFace,
    detectFacePresence,
  };
}
