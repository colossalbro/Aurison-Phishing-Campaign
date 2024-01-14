const express = require('express');
const port = 55000;

app = express();

// Serve static files from the "public" directory
app.use('/static', express.static('static'));

//Home
app.get('/', (req, res)=>{
    return res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
