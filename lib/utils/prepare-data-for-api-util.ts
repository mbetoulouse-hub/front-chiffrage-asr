import { CalculateRequest } from "@/types/calculate";
import { EstimateData } from "@/types/estimate";
import { HotelZoneData } from "@/types/hotel";

export function prepareDataForCalculation(isHotelSector: boolean, estimateData: EstimateData, hotelZoneData: HotelZoneData): CalculateRequest {
  return {
        id: estimateData.id,
        sector: estimateData.company.businessSector,
        buildings: estimateData.buildings.map((building) => ({
          name: building.name,
          buildingType: building.buildingType,
          rooms: (estimateData.rooms[building.id] || []).map((room) => ({
            name: room.name,
            type: room.type,
            surface: room.surface,
            floorType: room.floorType,
            frequency: room.frequency,
            remarks: room.remarks || "",
            additionalProperties: room.additionalProperties || [],
          })),
        })),
        multiPurposeData: {
          multiPurposes: estimateData.multiPurposeData.multiPurposes.map((multiPurpose) => ({
            id: multiPurpose.id,
            name: multiPurpose.name,
            type: multiPurpose.type,
            surface: multiPurpose.surface,
            serviceType: multiPurpose.serviceType,
            frequency: multiPurpose.frequency,
            travelCosts: multiPurpose.travelCosts || 0,
            remarks: multiPurpose.remarks || "",
            customCadence: multiPurpose.customCadence || 0,
          })),
          multiPurposeRates: estimateData.multiPurposeData.multiPurposeRates.map((rate) => ({
            type: rate.type,
            hourlyRate: rate.hourlyRate || 0,
          })),
        },
        hourlyRate: estimateData.hourlyRate || 0,
        hotelZoneData: isHotelSector ? {
          classification: hotelZoneData.classification,
          globalRate: hotelZoneData.globalRate,
          occupancyRate: hotelZoneData.occupancyRate,
          openingDaysPerWeek: hotelZoneData.openingDaysPerWeek,
          roomTypes: hotelZoneData.roomTypes.map((roomType) => ({
            id: roomType.id,
            name: roomType.name,
            clearanceRate: roomType.clearanceRate,
            recoucheRate: roomType.recoucheRate,
            isCustom: roomType.isCustom || false,
          })),
          roomCounts: Object.fromEntries(
            Object.entries(hotelZoneData.roomCounts).map(([key, value]) => [
              key,
              { count: value.count, hasKitchen: value.hasKitchen || false, kitchenTime: value.kitchenTime },
            ])
          ),
          managementPackage: {
            statutEncadrant: hotelZoneData.managementPackage?.statutEncadrant || false,
            premiereFemmeDeChambre: hotelZoneData.managementPackage?.premiereFemmeDeChambre || false,
            hourlyRate: hotelZoneData.managementPackage?.hourlyRate || 0,
            daysPerWeek: hotelZoneData.managementPackage?.daysPerWeek || 0,
            controlPercentage: hotelZoneData.managementPackage?.controlPercentage || 0,
            laundryManagementHours: hotelZoneData.managementPackage?.laundryManagementHours,
            laundryDaysPerWeek: hotelZoneData.managementPackage?.laundryDaysPerWeek,
          }
        } : undefined,
      }
}

export function prepareEstimateForUpdate(estimateData: EstimateData): EstimateData {
  return estimateData;
}

export function prepareHotelZoneForUpdate(hotelZoneData: HotelZoneData): HotelZoneData {
  return {
          classification: hotelZoneData.classification,
          globalRate: hotelZoneData.globalRate,
          occupancyRate: hotelZoneData.occupancyRate,
          openingDaysPerWeek: hotelZoneData.openingDaysPerWeek,
          roomTypes: hotelZoneData.roomTypes.map((roomType) => ({
            id: roomType.id,
            name: roomType.name,
            clearanceRate: roomType.clearanceRate,
            recoucheRate: roomType.recoucheRate,
            isCustom: roomType.isCustom || false,
          })),
          roomCounts: Object.fromEntries(
            Object.entries(hotelZoneData.roomCounts).map(([key, value]) => [
              key,
              { count: value.count, hasKitchen: value.hasKitchen || false, kitchenTime: value.kitchenTime },
            ])
          ),
          managementPackage: hotelZoneData.managementPackage ? {
            statutEncadrant: hotelZoneData.managementPackage?.statutEncadrant || false,
            premiereFemmeDeChambre: hotelZoneData.managementPackage?.premiereFemmeDeChambre || false,
            hourlyRate: hotelZoneData.managementPackage?.hourlyRate || 0,
            daysPerWeek: hotelZoneData.managementPackage?.daysPerWeek || 0,
            controlPercentage: hotelZoneData.managementPackage?.controlPercentage || 0,
            laundryManagementHours: hotelZoneData.managementPackage?.laundryManagementHours || 0,
            laundryDaysPerWeek: hotelZoneData.managementPackage?.laundryDaysPerWeek || 0,
          } : undefined
        };
}
