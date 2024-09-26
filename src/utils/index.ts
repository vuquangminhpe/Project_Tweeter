const express = require('express')
const { query, validationResult } = require('express-validator')
const app = express()

app.use(express.json())
app.get(
  '/hello',
  query('person').notEmpty().withMessage('Hãy cung cấp thông số hợp lệ').escape(),
  (
    req: { query: { person: any } },
    res: {
      send: (arg0: string) => any
      status: (arg0: number) => { (): any; new (): any; json: { (arg0: { errors: any }): void; new (): any } }
    }
  ) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return res.send(`Hello, ${req.query.person}!`)
    }

    res.status(400).json({ errors: errors.array() })
  }
)

app.listen(5000, () => {
  console.log('Running on port 5000')
})
