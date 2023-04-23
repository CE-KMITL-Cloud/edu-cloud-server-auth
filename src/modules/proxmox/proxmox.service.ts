import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

import { AccessTicket, AccessTicketResponse, CreateUser, ProxmoxResponse } from './proxmox.interface'

import { ProxmoxErrorException } from 'src/exception'
import { AccessTicketCookie, Role } from 'src/types'

@Injectable()
export class ProxmoxService {
  private readonly logger = new Logger(ProxmoxService.name)
  private readonly axiosInstance: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    this.axiosInstance = axios.create({ baseURL: this.configService.get<string>('proxmoxApiUrl') })
  }

  /**
   *
   * @param email
   * @param password
   * @param groups
   * @returns message
   */
  public async createUser(email: string, password: string, groups: Exclude<Role, 'admin'>): Promise<string> {
    const data: CreateUser = {
      userid: email,
      password: password,
      groups: groups,
    }

    try {
      const response = await this.axiosInstance.post<ProxmoxResponse>('access/user/create', data)
      if (response.status === 200) {
        return response.data.message
      }

      this.logger.error(`[ProxmoxService - createUser] ERROR: Proxmox response not 200`)
      throw new ProxmoxErrorException()
    } catch (error) {
      this.logger.error(`[ProxmoxService - createUser] ERROR:`, error)
      throw error
    }
  }

  public async accessTicket(email: string, password: string): Promise<AccessTicketCookie> {
    const data: AccessTicket = {
      username: email,
      password: password,
    }

    try {
      const response = await this.axiosInstance.post<AccessTicketResponse>('access/ticket', data)
      if (response.status === 200) {
        return {
          CSRFPreventionToken: response.data.message.CSRFPreventionToken,
          PVEAuthCookie: response.data.message.PVEAuthToken,
        }
      }

      this.logger.error(`[ProxmoxService - accessTicket] ERROR: Proxmox response not 200`)
      throw new ProxmoxErrorException()
    } catch (error) {
      this.logger.error(`[ProxmoxService - accessTicket] ERROR:`, error)
      throw error
    }
  }
}
