import { admin as AdminModel, student as StudentModel, faculty as facultyModel } from '@prisma/client'
import dayjs from 'dayjs'

import { User } from 'src/types'

type UserModel = AdminModel | StudentModel | facultyModel

export const getUserFromUserModel = (userModel: UserModel): User => {
  return {
    email: userModel.username,
    name: userModel.name,
    password: userModel.password,
    salt: userModel.salt,
    status: userModel.status,
    createTime: dayjs(userModel.create_time),
    expireTime: dayjs(userModel.expire_time),
  }
}

export const parseUserModelToUser = (user: User): UserModel => {
  return {
    username: user.email,
    name: user.name,
    password: user.password,
    salt: user.salt,
    status: user.status,
    create_time: user.createTime.unix().toFixed(),
    expire_time: user.expireTime.unix().toFixed(),
  }
}
