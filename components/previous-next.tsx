"use client"

import React from "react";
import { canProceedHotel, canProceedMultiPurpose, canProceedTertiary } from "@/lib/utils/process-calculate-util";
import type { HotelZoneData } from "@/types/hotel";
import type { EstimateData } from "@/types/estimate";
import { isHotelSector } from "@/lib/utils/sector-util";
import { Button } from "./ui/button";
import { AppZone, HOTEL_STEPS, MULTI_PURPOSE_STEPS, STEPS } from "@/app/page";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type Props = {
  currentZone: AppZone;
  hotelStep: number;
  hotelZoneData: HotelZoneData;
  tertiaryStep: number;
  estimateData: EstimateData;
  multiPurposeStep: number;
  calculationLoading: boolean;
  saveLoading: boolean;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmitEstimate: () => void;
};

const PreviousNext: React.FC<Props> = ({ currentZone, hotelStep, hotelZoneData, tertiaryStep, estimateData, multiPurposeStep, calculationLoading, 
  saveLoading, handleNext, handlePrevious, handleSubmitEstimate }) => {

  const canProceed = () => {
    if (currentZone === "hotel") {
      return canProceedHotel(hotelStep, isHotelSector(estimateData), hotelZoneData, estimateData)
    }

    if (currentZone === "multi-purpose") {
      return canProceedMultiPurpose(multiPurposeStep, isHotelSector(estimateData), hotelZoneData, estimateData)
    }
    
    return canProceedTertiary(tertiaryStep, estimateData, isHotelSector(estimateData), hotelZoneData)
  }

  //TODO: rework this logic to avoid duplication
  if (currentZone === "hotel") {
      if(hotelStep == HOTEL_STEPS.length) {
        return (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          </div>
        )
      }

      if(hotelStep == 1) {
        return (
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || calculationLoading || saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : calculationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : "Suivant"}
              {!saveLoading && !calculationLoading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        )
      }

      return (
        <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            <Button
              onClick={hotelStep === 4 ? handleSubmitEstimate : handleNext}
              disabled={!canProceed() || calculationLoading || saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : calculationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : hotelStep === 4 ? (
                "Soumettre un chiffrage"
              ) : (
                "Suivant"
              )}
              {!saveLoading && !calculationLoading && hotelStep !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
      )
      
    } else if (currentZone === "multi-purpose") {
      if(multiPurposeStep == MULTI_PURPOSE_STEPS.length) {
        return (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          </div>
        )
      }

      if(multiPurposeStep == 1) {
        return (
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || calculationLoading || saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : calculationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : "Suivant"}
              {!saveLoading && !calculationLoading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        )
      }

      return (
        <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            <Button
              onClick={multiPurposeStep === 2 ? handleSubmitEstimate : handleNext}
              disabled={!canProceed() || calculationLoading || saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : calculationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : multiPurposeStep === 2 ? (
                "Soumettre un chiffrage"
              ) : (
                "Suivant"
              )}
              {!saveLoading && !calculationLoading && multiPurposeStep !== 2 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
      )
      
    } else if (currentZone === "tertiary") {
      if(tertiaryStep == STEPS.length) {
        return (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          </div>
        )
      }

      if(tertiaryStep == 1) {
        return (
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || calculationLoading || saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : calculationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : "Suivant"}
              {!saveLoading && !calculationLoading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        )
      }

      return (
        <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            <Button
              onClick={tertiaryStep === 5 ? handleSubmitEstimate : handleNext}
              disabled={!canProceed() || calculationLoading || saveLoading}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : calculationLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calcul en cours...
                </>
              ) : tertiaryStep === 5 ? (
                "Soumettre un chiffrage"
              ) : (
                "Suivant"
              )}
              {!saveLoading && !calculationLoading && tertiaryStep !== 5 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
      )
    }
};

export default PreviousNext;
