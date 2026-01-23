import Paystack from '@paystack/paystack-sdk'
import { BookingFormData } from '@/types/booking'

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY || '')

export interface InitializePaymentParams {
  email: string
  amount: number // amount in Naira (will be converted to kobo)
  reference: string
  metadata?: Record<string, any>
}

export interface InitializePaymentResponse {
  authorization_url: string
  access_code: string
  reference: string
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    const response = await paystack.transaction.initialize({
      email: params.email,
      amount: params.amount * 100, // Convert to kobo
      reference: params.reference,
      metadata: params.metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/confirmation`,
    })

    if (!response.status || !response.data) {
      throw new Error('Failed to initialize payment')
    }

    return {
      authorization_url: response.data.authorization_url,
      access_code: response.data.access_code,
      reference: response.data.reference,
    }
  } catch (error: any) {
    console.error('Paystack initialization error:', error)
    throw new Error(error.message || 'Failed to initialize payment')
  }
}

export interface VerifyPaymentResponse {
  status: boolean
  amount: number
  reference: string
  customer: {
    email: string
  }
  metadata?: Record<string, any>
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  try {
    const response = await paystack.transaction.verify(reference)

    if (!response.status || !response.data) {
      throw new Error('Failed to verify payment')
    }

    const data = response.data

    return {
      status: data.status === 'success',
      amount: data.amount / 100, // Convert from kobo to naira
      reference: data.reference,
      customer: {
        email: data.customer?.email || '',
      },
      metadata: data.metadata,
    }
  } catch (error: any) {
    console.error('Paystack verification error:', error)
    throw new Error(error.message || 'Failed to verify payment')
  }
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): boolean {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
    .update(payload)
    .digest('hex')
  
  return hash === signature
}
