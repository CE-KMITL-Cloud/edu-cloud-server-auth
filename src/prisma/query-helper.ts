import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'
import { AdminQuery } from 'src/prisma/query/admin.query'
import { FacultyQuery } from 'src/prisma/query/faculty.query'
import { StudentQuery } from 'src/prisma/query/student.query'

@Injectable()
export class QueryHelper {
  public student: StudentQuery
  public admin: AdminQuery
  public faculty: FacultyQuery

  constructor(private prisma: PrismaService) {
    this.student = new StudentQuery(this.prisma.student)
    this.admin = new AdminQuery(this.prisma.admin)
    this.faculty = new FacultyQuery(this.prisma.faculty)
  }
}
