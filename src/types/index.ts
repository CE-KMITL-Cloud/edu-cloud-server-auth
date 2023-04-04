import { type Dayjs } from 'dayjs'

export type CacheOption = {
  disablePrefix?: boolean
}

export type JwtResult = {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export type JwtPayload = {
  name: string
  email: string
}

export type User = {
  email: string
  name: string
  password: string
  salt: string
  status: boolean
  createTime: Dayjs
  expireTime: Dayjs
}
