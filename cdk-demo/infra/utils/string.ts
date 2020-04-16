import * as crypto from "crypto"

export const randomString = (length = 21) => {  
  return crypto
    .randomBytes(length)
    .toString('base64')
    .slice(0, length)
}