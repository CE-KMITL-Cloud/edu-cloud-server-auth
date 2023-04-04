import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'
import { StudentQuery } from 'src/prisma/query/student.query'

@Injectable()
export class QueryHelper {
  public student: StudentQuery

  constructor(private prisma: PrismaService) {
    this.student = new StudentQuery(this.prisma.student)
  }
}
