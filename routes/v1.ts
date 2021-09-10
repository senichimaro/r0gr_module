import * as express from 'express'
import { first, radar_sensor } from '../controllers/controllers'
const endpoint = express.Router()

endpoint.get('/', first)
endpoint.post('/radar', radar_sensor)



export default endpoint