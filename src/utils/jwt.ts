import jwt from 'jsonwebtoken'

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

export const verifyToken = ({
  token,
  secretOnPublicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOnPublicKey?: string
}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOnPublicKey, (error, decoded) => {
      if (error) throw reject(error)
      resolve(decoded as jwt.JwtPayload)
    })
  })
}
