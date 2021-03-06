const express = require('express')
const app = express()
const port = process.envPORT || 3000;

//you should use relative URLs everywhere, so that your app works regardless of where it runs.
//could make a new upload path variable and use below and on line 41
const path = './public'

const multer = require('multer'); //does the file uploading
const upload = multer({
  dest: path + `/uploads`
}).single('image');  // this needs to match index.pug input( type= file name='')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static(path))
app.set('view engine', 'pug')

// setup pug
const pug = require('pug')

const fs = require('fs'); // need this
// can use next to tell express we're done with this and you can pass it to the next function.
// middleware is just js functions between sending and receiving responses. 

//need to loop through items, that is the name of images in upload path
// networking issue right now.
// console.log() to see if images and timestamps look right
// do console.log() before res.send. since the res.send is sending an empty response.
// and thats whats giving console error now. 

app.post('/latest', (req, res) => {
  console.log('Request Received')
  console.log(req.body)
  const uploadPath = './public/uploads/'
  //fs readdir gives an array of strings for all the parameters 
  // should also check for error. not on rubric though. don't worry
  // if not sending an err object and theres error, window will timeout for users
  fs.readdir(uploadPath, function (err, items) {
    if(err) return res.status(500).send()

    let imagesArray = []
    let maxTimestamp = 0
    
    for (let i = 0; i < items.length; i++) {
      let timestamp = fs.statSync(uploadPath+items[i]).mtimeMs;
      if (timestamp > req.body.after) {
        imagesArray.push(items[i])
      }
      if (timestamp > maxTimestamp){
        maxTimestamp = timestamp
      }
    }
    res.send({imagesArray, maxTimestamp})     // have to send a js object.
  })
})

//only want images newer than the latest request

//new Template engine version
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('upload-confirmation', {
        msg: err
      })
    } else {
      res.render('upload-confirmation', {
        title: "Upload Confirmation",
        msg: 'File Uploaded Successfully!',
        file: `uploads/${req.file.filename}`
      })
    }
  })
})

//new Template engine version
app.get('/', (req, res) => {
  //fs.readdir is asynchronous
  fs.readdir(`./public/uploads`, function (err, images) {
    //items in an array of all of the image names
    // for (let i = 0; i < items.length; i++) {
    //   feed += `<img src = ${items[i]} height = 150px><br />`;
    // }
    res.render('index', {
      title: "Kenziegram",
      h1: "welcome to Kenziegram",
      images: images
    })
  })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
