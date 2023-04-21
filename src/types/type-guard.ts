import { Role } from 'src/types'

export const isUserRole = (user: string): user is Role => {
  return user === 'admin' || user === 'faculty' || user === 'student'
}
