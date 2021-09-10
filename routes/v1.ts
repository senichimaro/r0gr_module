import * as express from 'express'
import { getIndex, radar_sensor } from '../controllers/controllers'
const endpoint = express.Router()

endpoint.get('/', getIndex)
endpoint.post('/radar', radar_sensor)



export default endpoint