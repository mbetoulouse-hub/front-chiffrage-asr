"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Company } from "@/types/estimate"
import type { SectorType } from "@/types/sector"

interface CompanyInfoStepProps {
  data: Company
  onUpdate: (data: Company) => void
  sectors: SectorType[]
}

export default function CompanyInfoStep({ data, onUpdate, sectors }: CompanyInfoStepProps) {
  const handleInputChange = (field: keyof Company, value: string) => {
    onUpdate({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Informations sur l'entreprise</h2>
        <p className="text-[#858EAD] mt-2">Veuillez renseigner les informations de base de votre entreprise</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de l'entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nom de l'entreprise *</Label>
            <Input
              id="company-name"
              value={data.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Entrez le nom de votre entreprise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-sector">Secteur d'activité *</Label>
            <Select value={data.businessSector} onValueChange={(value) => handleInputChange("businessSector", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner votre secteur d'activité" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.sector} value={sector.sector}>
                    {sector.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
