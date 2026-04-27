import { randomUUID } from "node:crypto";

const H_JOURNEY = "x-journey-id";
const H_REQUEST = "x-request-id";

export type CorrelationIds = {
  journey_id: string;
  request_id: string;
};

/** Lê ou gera IDs de correlação a partir do pedido. */
export function getCorrelationIds(request: Request): CorrelationIds {
  const journey = request.headers.get(H_JOURNEY)?.trim() || "none";
  const req = request.headers.get(H_REQUEST)?.trim() || randomUUID();
  return { journey_id: journey, request_id: req };
}
