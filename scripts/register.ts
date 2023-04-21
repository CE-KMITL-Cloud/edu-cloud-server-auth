import { PrismaClient, student as StudentModel } from '@prisma/client'
import dayjs from 'dayjs'

import { generateSalt, getHashedPassword } from '../src/utils/getHash'

const prisma = new PrismaClient()

type UserData = {
  name: string
  email: string
  password: string
}

// * From GPT
const users: UserData[] = [
  {
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    password: 'letmein456',
  },
  {
    name: 'Bob Johnson',
    email: 'bjohnson@example.com',
    password: 'ilovecoding789',
  },
  {
    name: 'Alice Lee',
    email: 'alee@example.com',
    password: 'mypasswordissecure1',
  },
  {
    name: 'Samuel Chen',
    email: 'samuelc@example.com',
    password: 's3cr3tp@ssw0rd',
  },
  // * Test account
  {
    name: 'bot lee',
    email: '62555555@kmitl.ac.th',
    password: 'Botlee007',
  },
]

const convert = ({
  name,
  email,
  password,
}: UserData): Pick<StudentModel, 'username' | 'name' | 'password' | 'salt'> => {
  const salt = generateSalt()
  const hashedPassword = getHashedPassword(password, salt)

  return { name, salt, username: email, password: hashedPassword }
}

async function main() {
  for (const user of users) {
    const restData = convert(user)
    try {
      await prisma.student.create({
        data: {
          ...restData,
          status: true,
          create_time: dayjs().unix().toFixed(),
          expire_time: dayjs().add(4, 'year').unix().toFixed(),
        },
      })
    } catch (error) {
      console.error('mee laew')
      break
    }
  }

  const usersToLog = await prisma.student.findMany({
    orderBy: {
      create_time: 'desc',
    },
    take: 5,
  })
  console.log(usersToLog)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
