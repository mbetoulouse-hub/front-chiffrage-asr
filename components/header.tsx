"use client"

import type React from "react"
import { Card, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { type AppZone, HOTEL_STEPS, MULTI_PURPOSE_STEPS, STEPS } from "@/app/page"
import { Progress } from "./ui/progress"
import type { EstimateData } from "@/types/estimate"
import { isHotelSector } from "@/lib/utils/sector-util"

type Props = {
  currentZone: AppZone
  tertiaryStep: number
  hotelStep: number
  multiPurposeStep: number
  estimateData: EstimateData
  handleBackToDashboard: () => void
}

const Header: React.FC<Props> = ({
  currentZone,
  tertiaryStep,
  hotelStep,
  multiPurposeStep,
  estimateData,
  handleBackToDashboard,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Chiffrage ASR Nettoyage</CardTitle>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
        {isHotelSector(estimateData) && tertiaryStep === 2 && currentZone === "hotel" ? (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              {HOTEL_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${index < HOTEL_STEPS.length - 1 ? "flex-1" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      hotelStep >= step.id ? "bg-green-600 text-white" : "bg-[#858EAD] text-white"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className="font-medium text-[#1d2f57]">{step.title}</div>
                    <div className="text-[#1d2f57]">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Progress value={(hotelStep / HOTEL_STEPS.length) * 100} className="w-full [&>div]:bg-green-600" />
          </div>
        ) : currentZone === "multi-purpose" ? (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              {MULTI_PURPOSE_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${index < MULTI_PURPOSE_STEPS.length - 1 ? "flex-1" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      multiPurposeStep >= step.id ? "bg-orange-600 text-white" : "bg-[#858EAD] text-white"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className="font-medium text-[#1d2f57]">{step.title}</div>
                    <div className="text-[#1d2f57]">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Progress
              value={(multiPurposeStep / MULTI_PURPOSE_STEPS.length) * 100}
              className="w-full [&>div]:bg-orange-600"
            />
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className={`flex flex-col items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      tertiaryStep >= step.id ? "bg-primary text-white" : "bg-[#858EAD] text-white"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className="font-medium text-[#264994]">{step.title}</div>
                    <div className="text-[#1d2f57]">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Progress value={(tertiaryStep / STEPS.length) * 100} className="w-full" />
          </div>
        )}
      </CardHeader>
    </Card>
  )
}

export default Header
