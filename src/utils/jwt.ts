import * as jwt from 'jsonwebtoken'

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  optional = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  privateKey?: string
  optional?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) =>
    jwt.sign(payload, privateKey, optional, (error, token) => {
      if (error) reject(error)
      resolve(token as string)
    })
  )
}
