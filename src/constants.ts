export const APP_NAME = "Hartmann Hub";
export const APP_VERSION = "2.5.1";
export const APP_AUTHOR = "Elina Hartmann";
export const APP_CONTACT = "elina.hartmann.pro@gmail.com";
export const APP_DESCRIPTION = "Solution complète de gestion HACCP, traçabilité et pilotage opérationnel professionnel.";
export const APP_LAST_UPDATE = "28 Avril 2026";

export const APP_CHANGELOG = [
  {
    version: "2.5.1",
    date: "28 Avril 2026",
    changes: [
      "Correction d'un bug où la fenêtre TPM ne s'affichait pas après la prise de photo sur certains téléphones (fallback pour formats d'images non supportés)."
    ]
  },
  {
    version: "2.5.0",
    date: "28 Avril 2026",
    changes: [
      "Optimisation majeure des photos : compression accrue pour réduire la taille des fichiers avant envoi depuis les téléphones et iPads, tout en conservant la DLC lisible.",
      "Correction d'un bug critique lors de la prévisualisation des collectes mobiles sur iPad ('Corrupted zip').",
      "Ajout de la prise en charge des données mobiles hors ligne consolidées."
    ]
  },
  {
    version: "2.4.6",
    date: "28 Avril 2026",
    changes: [
      "Correction des plantages du bouton Prévisualiser.",
      "Amélioration de la sérialisation des exportations ZIP."
    ]
  }
];
