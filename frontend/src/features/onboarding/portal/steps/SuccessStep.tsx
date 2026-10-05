import React from 'react';
import { ConfirmationSuccessView } from '@/components/common/ConfirmationSuccessView';

interface Props {
  candidateFirstName: string;
  companyName: string;
  targetDate: string;
}

export const SuccessStep: React.FC<Props> = ({
  candidateFirstName,
  companyName,
  targetDate,
}) => {
  return (
    <ConfirmationSuccessView
      title={`Dossier validé, ${candidateFirstName || 'cher collaborateur'}`}
      subtitle={`Vos informations personnelles et justificatifs ont été enregistrés et transmis à la Direction des Ressources Humaines de ${companyName}.`}
      tag="DOSSIER TRANSMIS"
      nextStepsTitle="PROCHAINES ÉTAPES POUR VOTRE ARRIVÉE"
      nextSteps={[
        {
          title: 'Vérification administrative',
          description: 'Contrôle de conformité de vos pièces justificatives par votre gestionnaire RH.',
          badge: 'Étape 1',
        },
        {
          title: 'Affiliation légale & fiscale',
          description: 'Enregistrement auprès de l’IPRES et de la Caisse de Sécurité Sociale (CSS).',
          badge: 'Étape 2',
        },
        {
          title: 'Accueil & Dotation Jour J',
          description: `Remise de votre badge d'accès Kiosque et de votre paquetage EPI le ${targetDate}.`,
          badge: 'Jour J',
        },
      ]}
      securityNote="Dossier numérique certifié et conforme au Code du Travail de la République du Sénégal."
    />
  );
};
