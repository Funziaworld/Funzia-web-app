declare module '@paystack/paystack-sdk' {
  interface InitializeTransactionParams {
    email: string
    amount: number
    reference: string
    metadata?: Record<string, any>
    callback_url?: string
  }

  interface InitializeTransactionResponse {
    status: boolean
    message: string
    data: {
      authorization_url: string
      access_code: string
      reference: string
    }
  }

  interface VerifyTransactionResponse {
    status: boolean
    message: string
    data: {
      status: string
      amount: number
      reference: string
      customer?: {
        email: string
      }
      metadata?: Record<string, any>
    }
  }

  interface Transaction {
    initialize(params: InitializeTransactionParams): Promise<InitializeTransactionResponse>
    verify(reference: string): Promise<VerifyTransactionResponse>
  }

  class Paystack {
    constructor(secretKey: string)
    transaction: Transaction
  }

  export default Paystack
}
