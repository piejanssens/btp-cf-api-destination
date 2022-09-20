const express = require('express')
const xsenv = require('@sap/xsenv')
const httpClient = require('@sap-cloud-sdk/http-client')
const xssec = require('@sap/xssec')
const passport = require('passport')

xsenv.loadEnv()
const services = xsenv.getServices({
  uaa: { label: 'xsuaa' },
  dest: { label: 'destination' },
})

const app = express()

passport.use('JWT', new xssec.JWTStrategy(services.uaa))
app.use(passport.initialize())
app.use(
  passport.authenticate('JWT', {
    session: false,
  })
)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', async function (req, res) {
  try {
    let _res = await httpClient.executeHttpRequest(
      {
        destinationName: 'CFAPI',
      },
      {
        method: 'GET',
        url: '/v3/spaces',
      }
    )
    res.status(200).json(_res.data)
  } catch (error) {
    if (error.response) {
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else {
      console.log('Error', error.message)
    }
    console.log(error.config)
    res.status(500).send(error.message)
  }
})

const port = process.env.PORT || 5001
app.listen(port, function () {
  console.info('Listening on http://localhost:' + port)
})
