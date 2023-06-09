export type Config = {
  port: number
  jwtSecret: string

  proxmoxApiUrl: string

  redis: {
    host: string
    port: number
    ttl?: number
  }

  postgres: {
    host: string
    port: number
    user: string
    password: string
    db: string
  }
}
