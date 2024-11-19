import axios, { AxiosInstance } from 'axios'
import configBase from '../constants/config'
class Http {
  instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: configBase.baseURL,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
   
     
    
  }
}
const http = new Http().instance
export default http
