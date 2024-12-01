import { z } from "zod";

export enum StopByType {
  User = "user",
  Csms = "csms",
  Backend = "backend",
}

export const ChargingSessionSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  started_at: z.string().nullable(),
  stopped_at: z.string().nullable(),
  sync_at: z.string(),
  external_id: z.string(),
  status: z.string(),
  connector_status: z.string().nullable(),
  status_changed_at: z.string(),
  connector_status_changed_at: z.string().nullable(),
  consumption: z.number().nullable(),
  output_power: z.number().nullable(),
  battery_level: z.number().nullable(),
  license_plate_number: z.string().nullable(),
  car_model: z.string().nullable(),
  stop_by: z.nativeEnum(StopByType).nullable(),
  stop_reason: z.string().nullable(),
  has_started_charging: z.boolean(),
  inbox_battery_high_sent: z.boolean(),
  inbox_battery_full_sent: z.boolean(),
  inbox_overstay_sent_time: z.number(),
  overstay_seconds: z.number(),
  integration_id: z.string(),
  connector_id: z.string(),
  user_id: z.string(),
  order_id: z.string().nullable(),
  overstay_order_id: z.string().nullable(),
  carpark_id: z.string().nullable(),
  service_plan_id: z.string().nullable(),
  api_connector_id: z.string(),
  api_charging_session_id: z.string(),
  duration: z.number(),
});

export const ChargingSessionLogSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  started_at: z.string().nullable(),
  stopped_at: z.string().nullable(),
  sync_at: z.string(),
  external_id: z.string(),
  status: z.string(),
  raw_status: z.string().nullable(),
  connector_status: z.string().nullable(),
  raw_connector_status: z.string().nullable(),
  consumption: z.number().nullable(),
  output_power: z.number().nullable(),
  battery_level: z.number().nullable(),
  license_plate_number: z.string().nullable(),
  car_model: z.string().nullable(),
  session_id: z.string(),
});

export type CsmsChargingSession = z.infer<typeof ChargingSessionSchema>;
export type CsmsChargingSessionLog = z.infer<typeof ChargingSessionLogSchema>;