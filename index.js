const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
  res.send('SaaD Dentistry server is running...')
})

app.listen(port, ()=>{
  console.log('SaaD Dentistry is listening on', port);
})