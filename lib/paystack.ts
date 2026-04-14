const PAYSTACK_API = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key?.trim()) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return key.trim();
}

async function parsePaystackJson(res: Response): Promise<{
  status: boolean;
  message?: string;
  data?: Record<string, unknown>;
}> {
  const text = await res.text();
  try {
    return JSON.parse(text) as {
      status: boolean;
      message?: string;
      data?: Record<string, unknown>;
    };
  } catch {
    throw new Error(`Paystack returned invalid JSON (HTTP ${res.status})`);
  }
}

export interface InitializePaymentParams {
  email: string;
  amount: number; // amount in Naira (converted to kobo for the API)
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializePayment(
  params: InitializePaymentParams,
): Promise<InitializePaymentResponse> {
  const amountKobo = Math.round(params.amount * 100);
  if (!Number.isFinite(amountKobo) || amountKobo < 100) {
    throw new Error("Invalid payment amount");
  }

  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: amountKobo,
      currency: "NGN",
      reference: params.reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/booking/confirmation`,
      metadata: params.metadata ?? {},
    }),
  });

  const json = await parsePaystackJson(res);

  if (!json.status || !json.data) {
    throw new Error(json.message || "Paystack could not start this payment");
  }

  const data = json.data as {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };

  if (!data.authorization_url || !data.access_code || !data.reference) {
    throw new Error(
      json.message || "Paystack response was missing payment fields",
    );
  }

  return {
    authorization_url: data.authorization_url,
    access_code: data.access_code,
    reference: data.reference,
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  amount: number;
  reference: string;
  customer: {
    email: string;
  };
  metadata?: Record<string, unknown>;
}

export async function verifyPayment(
  reference: string,
): Promise<VerifyPaymentResponse> {
  const encoded = encodeURIComponent(reference);
  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encoded}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
  });

  const json = await parsePaystackJson(res);

  if (!json.status || !json.data) {
    throw new Error(json.message || "Failed to verify payment");
  }

  const data = json.data as {
    status?: string;
    amount?: number;
    reference?: string;
    customer?: { email?: string };
    metadata?: Record<string, unknown>;
  };

  return {
    status: data.status === "success",
    amount: typeof data.amount === "number" ? data.amount / 100 : 0,
    reference: data.reference || reference,
    customer: {
      email: data.customer?.email || "",
    },
    metadata: data.metadata,
  };
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET || "")
    .update(payload)
    .digest("hex");

  return hash === signature;
}
