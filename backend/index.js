const path = require('path')
const express = require('express')

const app = express()
const port = process.env.PORT || 3000

const basepath = path.join(__dirname, '../frontend')
app.use(express.static(basepath))
app.listen(port, ()=>{
    console.log('Server started on port '+port)

})