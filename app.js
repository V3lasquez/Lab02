const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/contact_agenda', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión exitosa a la base de datos.');
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
  });

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

const Contact = mongoose.model('Contact', contactSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API Router
const apiRouter = express.Router();

apiRouter.post('/contacts', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    const contact = await newContact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).send(err);
  }
});

apiRouter.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find({}).exec();
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).send(err);
  }
});

apiRouter.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).exec();
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).send(err);
  }
});

apiRouter.put('/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
    res.status(200).json(contact);
  } catch (err) {
    res.status(500).send(err);
  }
});

apiRouter.delete('/contacts/:id', async (req, res) => {
  try {
    await Contact.findByIdAndRemove(req.params.id).exec();
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

app.use('/api', apiRouter);
// HTML view route
app.get('/contacts', (req, res) => {
  Contact.find({}, (err, contacts) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.render('contacts', { contacts: contacts });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

