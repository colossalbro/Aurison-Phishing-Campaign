const parseJson = require('body-parser').json;
const express = require('express');
const axios = require('axios');
const https = require('https');



const port = 55000;
const STAGING = 'https://test-backend.aurison.app';
const PROD = 'https://api.aurison.app';
const agent = new https.Agent({ rejectUnauthorized: false });


app = express();

app.use(parseJson());

// Serve static files from the "public" directory
app.use('/static', express.static('static'));


//Home
app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/index.html');
});


//catch any other path
app.get('/:anypath', (req, res)=>{
    return res.sendFile(__dirname + '/index.html');
});


//proxy api requests
app.all('/:path*', async (req, res) =>{
    const path = req.params.path;   //grab route

    try {
        const { method, headers, body} = req;    //grab relevant info from req
  
        // Make request to Aurison
        const response = await axios({
          method: method,
          headers: headers,
          data: body,
          url: `${STAGING}/${path}`,
          httpsAgent: agent
        });   
        
        const resHeaders = response.headers
        const keys = Object.keys(resHeaders);

        //set headers.
        keys.forEach(key => {
            res.setHeader(key, resHeaders[key]) 
        });
        
        return res.status(200).json(response.data);
        
    } catch (error) {
        if (error.response.data) {
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(400).json({
            error: true,
            error_log: 'Unknown Error'
        });
    }
});


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
