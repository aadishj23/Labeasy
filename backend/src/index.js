const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const userAuthRoutes = require('./userauth');
const labAuthRoutes = require('./labauth');
const test=require('./tests');
const labtest=require('./labtests');
const testData = require('./testData.js');

app.use(cors());
app.use(express.json());
app.use((err,req,res,next)=>{
  res.json({
      'msg': 'something went wrong '
  })
})
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from Labeasy team');
});

app.use('/api/v1/auth', [userAuthRoutes,labAuthRoutes]);
app.use('/api/v1/tests', [test, labtest, testData]);
app.use('/api/v1/testData', [testData]);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});