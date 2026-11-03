import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import type { FatalError } from "@/types/error";

type Props = {
  fatalError: FatalError;
  onRetry: () => void;
  onBackToDashboard: () => void;
};

const FatalErrorAlert: React.FC<Props> = ({ onRetry, onBackToDashboard, fatalError }) => {

  let message = "Une erreur inconnue s'est produite";

  if(fatalError.type === "SECTOR_TYPE") {
    message = "Erreur lors du chargement des secteurs d'activité";
  } else if(fatalError.type === "PREFILL_ROOM_TYPE") {
    message = "Erreur lors du chargement des types de chambre pré-remplis";
  } else if(fatalError.type === "TECHNICAL_CADENCE") {
    message = "Erreur lors du chargement des cadences techniques";
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
                <p className="text-[#858EAD]">
                  Impossible de charger les informations nécessaires pour créer un chiffrage.
                </p>
              </div>

              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {message} : {fatalError.error}
                  <br />
                  Veuillez réessayer ou contacter le support technique.
                </AlertDescription>
              </Alert>

              <div className="flex justify-center gap-4">
                <Button onClick={onRetry} variant="outline">
                  Réessayer
                </Button>
                <Button onClick={onBackToDashboard}>Retour au tableau de bord</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
};

export default FatalErrorAlert;
