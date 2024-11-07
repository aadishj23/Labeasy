const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./authentication');

app.use(cors());
app.use(express.json());
app.use((err,req,res,next)=>{
  res.json({
      'msg': 'something went wrong '
  })
})

app.use('api/v1/auth', authRoutes);

dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});