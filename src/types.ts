export type ServiceCategory = 'regular' | 'vip';

export type OrderStatus =
  | 'pending'        // Aguardando aceitação do estafeta
  | 'to_pickup'      // Estafeta a caminho do restaurante/recolha
  | 'at_pickup'      // No local de recolha (aguardando foto do lacre e inspeção)
  | 'in_transit'     // Lacre registado -> A caminho do destino final
  | 'delivered';     // Autenticado via PIN de 4 dígitos ou QR Code

export type RoleView = 'client' | 'driver' | 'dispatch';

export interface LatLngPoint {
  lat: number;
  lng: number;
  label: string;
  address: string;
}

export interface StorySlide {
  id: string;
  title: string;
  subtitle: string;
  durationSec: number;
  type: 'driver_profile' | 'vehicle_inspection' | 'thermal_sensor';
  metrics: {
    label: string;
    value: string;
  }[];
  inspectionNote: string;
}

export interface CourierProfile {
  id: string;
  name: string;
  category: ServiceCategory;
  rating: number;
  totalDeliveries: number;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleSpecs: string;
  cargoEquipment: string;
  uniformProtocol: string;
  thermalTempHot: number; // °C
  thermalTempCold: number; // °C
  avatarInitials: string;
  accentColor: string;
  currentLocation: { lat: number; lng: number };
  verifiedDate: string;
  stories: StorySlide[];
}

export interface SealInspectionRecord {
  capturedAt: string;
  sealCode: string;
  compartmentTempHot: number;
  compartmentTempCold: number;
  packagingIntegrity: 'Impecável · Duplo Lacre' | 'Selado · Padrão Higienizado';
  notes: string;
  dataUrl: string;
}

export interface DeliveryOrder {
  id: string;
  code: string;
  createdAt: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  itemType: string;
  itemDescription: string;
  category: ServiceCategory;
  status: OrderStatus;
  origin: LatLngPoint;
  destination: LatLngPoint;
  courierLocation: { lat: number; lng: number };
  routeProgress: number; // 0 to 100
  distanceKm: number;
  estimatedMinutes: number;
  slaTargetMinutes: number;
  basePrice: number;
  vipSupplement: number;
  totalPrice: number;
  pinCode: string; // 4-digit PIN
  qrPayload: string;
  assignedCourierId: string;
  sealInspection?: SealInspectionRecord;
  deliveredAt?: string;
  clientRating?: number;
  driverRating?: number;
  isBatchOrder?: boolean;
}
