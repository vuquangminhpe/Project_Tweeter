/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import axios from 'axios'
import { useState } from 'react'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm_password, setConfirm_Password] = useState('')
  const [messages, setMessage] = useState('')
  const handleResetPassword = () => {
    try {
      const controller = new AbortController()
      if (
        password &&
        localStorage.getItem('forgot_password_token') &&
        confirm_password &&
        password === confirm_password
      ) {
        axios
          .post(
            '/users/reset-password',
            {
              password,
              confirm_password,
              forgot_password_token: localStorage.getItem('forgot_password_token')
            },
            {
              baseURL: 'http://localhost:5000',
              signal: controller.signal
            }
          )

          .then(() => {
            localStorage.setItem('forgot_password_token', '')
          })
          .catch(() => {})
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <input type='text' placeholder='password' onChange={(e) => setPassword(e.target.value)} />
      <input type='text' placeholder='Confirm Password' onChange={(e) => setConfirm_Password(e.target.value)} />
      <div onClick={handleResetPassword}>Reset Password</div>
      <div>{messages}</div>
    </div>
  )
}

export default ResetPassword
