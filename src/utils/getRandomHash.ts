import Web3 from 'web3'

export const getRandomHash = (salt?: string): string => {
  const hrTime = process.hrtime()
  const microSecond = hrTime[0] * 1000000 + hrTime[1] / 1000
  const web3 = new Web3()
  return web3.utils.keccak256(`${microSecond.toString()}${salt ?? ''}`)
}
