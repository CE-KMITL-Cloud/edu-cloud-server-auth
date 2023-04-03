export type CacheOption = {
  disablePrefix?: boolean
}

export type JwtResult = {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export type JwtPayload = {
  username: string
  email: string
}

export type User = {
  id: string
  username: string
  email: string
  name: string
  password: string
  salt: string
}
