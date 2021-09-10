import 'dotenv/config'
import app from './app'
import {appConfig} from './config'


async function initApp( app, appConfig ){
    try {
        await app.listen(
            appConfig.port, 
            () => console.log(`async listen at: ${appConfig.port}`)
        )
    }
    catch(e){
        throw new Error(e.message)
    }
}

initApp( app, appConfig )