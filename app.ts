import * as express from 'express'
import * as bodyParser from 'body-parser'
import endpoint from './routes/v1'
const app = express()

app.use( bodyParser.urlencoded({extended:false}) )
app.use( bodyParser.json() )

app.use( '/', endpoint )

export default app