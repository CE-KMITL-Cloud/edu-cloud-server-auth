export type ValidateResult =
  | {
      success: true
      data: string
    }
  | {
      success: false
    }
