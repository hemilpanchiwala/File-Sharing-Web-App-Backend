const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname)
  }
})

const upload = multer({storage: storage})

const db = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

const app = express();

app.use('/uploads', express.static('uploads')) 
app.use(bodyParser.json())
app.use(cors())


app.post('/files', upload.single('avatar'), (req, res) => {

  const {to_person} = req.body
  console.log(to_person)

  db("uploads")
  .insert({
    to_person: to_person,
    file: req.file.path,
    filename: req.file.filename
  })
  .returning('*')
  .then((response) => {
    res.json(response),
    console.log("File uploaded")
  })
  .catch(err => {console.log("ERROR Found!!!")})

})

app.get('/uploadedfiles', (req,res) => {

  return db.select('*')
  .from('uploads')
  .then((response) => {
    res.json(response)
  })
  .catch(err => console.log("Error in getting files"))

})

app.post('/register', (req, res) => {

  const {email, password, name} = req.body;

  var hash = bcrypt.hashSync(password); 

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      console.log(loginEmail)
      return db('users')
      .returning('*')
      .insert({
        name: name,
        email: email
      })
      .then(user => {
        res.json(user[0]);
      })
    })
    .then(trx.commit)
    .then(trx.rollback)
  })
  .catch(err => res.status(400).json('Unable to register'))
})

app.post('/receivedfiles', (req, res) => {

  return db.select('*').from('uploads')
    .where('to_person', '=', req.body.to_person)
    .then(user => {
      res.json(user)
    })
    .catch(err => res.status(400).json("Error in loading user"))

})

app.post('/signin', (req, res) => {

  db.select('email', 'hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
    if(isValid) {
      return db.select('*').from('users')
      .where('email', '=', req.body.email)
      .then(user => {
        res.json(user);
      })
      .catch(err => res.status(400).json("Unable to signin"))
    }else{
      res.status(400).json("Wrong credentials")
    }
  })
  .catch(err => res.status(400).json("Wrong info"))
})

app.get('/', (req, res) => {
  res.send('It is working')
})

app.listen(process.env.PORT, () => {
  console.log('Server is running')
})
