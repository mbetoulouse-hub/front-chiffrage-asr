export const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  ENTITY_NOT_FOUND: "Le %type% %id% n'existe pas.",
  SECTOR_NOT_FOUND: "Le secteur d'activité %sector% n'existe pas.",

  CADENCE_NO_ROOM_TYPE: "Le type de pièce %roomType% n'existe pas. (batiment %buildingName%, pièce %roomName%)",
  CADENCE_NOT_FOUND: "Aucune cadence n'est définie pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_NO_FREQUENCY: "Aucune fréquence n'a pu être trouvée pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_INVALID_X_TIMES: "Option nétoyage en X temps invalide pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_INVALID_ROOM_TYPE_FOR_PARTIAL_STRATEGY: "Option de nettoyage partiel invalide pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_INVALID_WEIGHTS_SPECIFIC: "Option de poids spécifique invalide pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_INVALID_CARDIO_SPECIFIC: "Option de cardio spécifique invalide pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_INVALID_KITCHEN_CLEAN_TYPE: "Option de nettoyage de cuisine invalide pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CADENCE_INVALID_RESTROOM_CLEAN_TYPE: "Option de nettoyage de restaurant invalide pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",

  STRATEGY_ADDITIONAL_PROPERTY_NOT_FOUND: "L'option de la pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName% est mal remplis.",
  STRATEGY_NOT_FOUND: "Option non trouvée pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",

  CALCULATE_NO_CORRESPONDING_ROOM_TYPE: "Le type de pièce %roomType% n'existe pas dans le batiment %buildingName% (mauvais type de batiment).",
  CALCULATE_NO_CADENCE_FOR_TIME_HOURS: "Problème de cadence pour le type de pièce %roomType% - nom de la pièce : %roomName% - nom du batiment : %buildingName%.",
  CALCULATE_FAILED_TO_CALCULATE_H7: "Erreur technique lors du calcule de la cadence H7 pour le type de pièce %roomType% - nom de la pièce : %roomName%.",
  CALCULATE_NO_ROOMS_PROVIDED: "Aucune chambre d'hotel n'a été fournie.",
  CALCULATE_NO_ZONE_HOTEL_DATA_PROVIDED: "Données de zone d'hotel manquantes.",

  AUTH_EXPIRED_REFRESH_TOKEN: "Jeton d'authentification expiré.",
  AUTH_INVALID_REFRESH_TOKEN: "Jeton d'authentification invalide.",
  AUTH_INVALID_CREDENTIALS: "Identifiants invalides.",

  PROFILE_ALREADY_EXISTS: "Ce profil existe déjà.",
  PROFILE_NOT_EXISTS: "Ce profil n'existe pas.",
  PROFILE_MANAGER_DOES_NOT_EXISTS: "Le manageur n'existe pas.",

  HOTEL_ESTIMATE_ROOM_TYPES_LOAD_ERROR: "Erreur lors du chargement des données (BDD).",
  HOTEL_ESTIMATE_ROOM_COUNTS_LOAD_ERROR: "Erreur lors du chargement des données (BDD).",
  HOTEL_ESTIMATE_MANAGEMENT_PACKAGE_LOAD_ERROR: "Erreur lors du chargement des données (BDD).",

  MULTI_PURPOSE_INVALID_RATE_SEND: "Taux horaire invalide / manquant pour une prestation polyvalente.",
  MULTI_PURPOSE_INVALID_TECHNICAL_CADENCE: "La typologie de la prestation polyvalente %multiPurpose% n'est pas valide pour le type de cadence technique.",
  MULTI_PURPOSE_INVALID_CADENCE_SERVICE: "Le type de prestation polyvalente %multiPurpose% n'est pas valide.",
  MULTI_PURPOSE_INVALID_CUSTOM_CADENCE: "La cadence personnalisée pour la prestation polyvalente %multiPurpose% n'est pas valide.",

  ESTIMATE_ADDITIONAL_PROPERTIES_LOAD_ERROR: "Erreur lors du chargement des données (BDD).",
  ESTIMATE_PROFILE_CANT_INTERACT: "Permissions insuffisantes.",

  EXPORT_GENERATE_ERROR: "Erreur lors de la génération du fichier d'export.",

  CONSTRAINT_VIOLATION_ERROR: "Requête invalide. Veuillez vérifier les données fournies. Contactez le support si le problème persiste.",
}
