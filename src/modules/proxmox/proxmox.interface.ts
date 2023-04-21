import { Role } from 'src/types'

export interface ProxmoxResponse<T = string> {
  message: T
  status: string
}

export interface CreateUser {
  userid: string
  password: string
  groups: Exclude<Role, 'admin'>
}

export interface AccessTicket {
  username: string
  password: string
}

export type AccessTicketResponse = ProxmoxResponse<{
  PVEAuthToken: string
  CSRFPreventionToken: string
}>
