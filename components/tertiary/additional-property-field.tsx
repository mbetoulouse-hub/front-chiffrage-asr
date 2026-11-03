"use client"

import React from "react";
import { Checkbox } from "@/components/ui/checkbox"; // adapte selon ton arborescence
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AdditionalProperty = {
  key: string;
  value: string | boolean;
};

type Props = {
  prop: AdditionalProperty;
  update: (key: string, value: any) => void;
};

const AdditionalPropertyField: React.FC<Props> = ({ prop, update }) => {
  switch (prop.key) {
    case "CUSTOM_WEEK_NUMBER":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Nombre de semaines / an</Label>
          <Input
            type="number"
            id={prop.key}
            value={prop.value as string}
            onChange={(e) => update(prop.key, e.target.value)}
            placeholder="Nombre de semaines / an"
          />
        </div>
      );

    case "INT_INPUT_CONTAINERS":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Nombre de containers</Label>
          <Input
            type="number"
            id={prop.key}
            value={prop.value as string}
            onChange={(e) => update(prop.key, e.target.value)}
            placeholder="Nombre de containers"
          />
        </div>
      );

    case "CUSTOM_CADENCE":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Cadence</Label>
          <Input
            type="number"
            id={prop.key}
            value={prop.value as string}
            onChange={(e) => update(prop.key, e.target.value)}
            placeholder="Cadence"
          />
        </div>
      );

    case "CLEANING_X_TIMES":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Méthode de nettoyage</Label>
          <Select
            value={prop.value as string}
            onValueChange={(value) => update(prop.key, value)}
          >
            <SelectTrigger id={prop.key}>
              <SelectValue placeholder="Sélectionnez un nettoyage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Nettoyage en 3 temps</SelectItem>
              <SelectItem value="5">Nettoyage en 5 temps</SelectItem>
              <SelectItem value="7">Nettoyage en 7 temps</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    case "CHECK_BOX_ARMCHAIR":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={prop.key}
            checked={prop.value as boolean}
            onCheckedChange={(checked) => update(prop.key, checked)}
          />
          <Label htmlFor={prop.key}>Paillasses et fauteuils/tables de soin inclus ?</Label>
        </div>
      );

    case "CHECK_BOX_ACTIVITY":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={prop.key}
            checked={prop.value as boolean}
            onCheckedChange={(checked) => update(prop.key, checked)}
          />
          <Label htmlFor={prop.key}>Avec désinfection ?</Label>
        </div>
      );

    case "CHECK_BOX_PARTIAL":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={prop.key}
            checked={prop.value as boolean}
            onCheckedChange={(checked) => update(prop.key, checked)}
          />
          <Label htmlFor={prop.key}>Partiel ?</Label>
        </div>
      );

    case "CHECK_BOX_PARKING":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={prop.key}
            checked={prop.value as boolean}
            onCheckedChange={(checked) => update(prop.key, checked)}
          />
          <Label htmlFor={prop.key}>Picking + poubelles ?</Label>
        </div>
      );


    case "SELECT_WEIGHTS_SPECIFIC":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Type de prestation</Label>
          <Select
            value={prop.value as string}
            onValueChange={(value) => update(prop.key, value)}
          >
            <SelectTrigger id={prop.key}>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VACUUM">MUSCU GUIDEE OU HALTERE ASPIRATION SOLS</SelectItem>
              <SelectItem value="CLEAN">MUSCU GUIDEE OU HALTERE LAVAGE SOLS</SelectItem>
              <SelectItem value="DUST">MUSCU GUIDEE OU HALTERE DEPOUSSIERAGE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );


    case "SELECT_CARDIO_SPECIFIC":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Type de prestation</Label>
          <Select
            value={prop.value as string}
            onValueChange={(value) => update(prop.key, value)}
          >
            <SelectTrigger id={prop.key}>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DUST">CARDIO bike DEPOUSSIERAGE</SelectItem>
              <SelectItem value="FLOOR">CARDIO bike SOLS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    
    case "SELECT_RESTROOM_CLEAN_TYPE":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Type de prestation</Label>
          <Select
            value={prop.value as string}
            onValueChange={(value) => update(prop.key, value)}
          >
            <SelectTrigger id={prop.key}>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASPIRATION">ASPIRATION LAVAGE</SelectItem>
              <SelectItem value="CARPET">ASPIRATION MOQUETTE</SelectItem>
              <SelectItem value="COMPLETE">COMPLET</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    
    
    case "SELECT_KITCHEN_CLEAN_TYPE":
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>Type de prestation</Label>
          <Select
            value={prop.value as string}
            onValueChange={(value) => update(prop.key, value)}
          >
            <SelectTrigger id={prop.key}>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FLOOR">SOLS</SelectItem>
              <SelectItem value="COMPLETE">COMPLET (HORS APPAREIL ET USTENSILES)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={prop.key}>{prop.key}</Label>
          <Input
            id={prop.key}
            value={prop.value as string}
            onChange={(e) => update(prop.key, e.target.value)}
            placeholder={`Valeur pour ${prop.key}`}
          />
        </div>
      );
  }
};

export default AdditionalPropertyField;
