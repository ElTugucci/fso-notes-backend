require('dotenv').config()
const express = require('express')
const app = express()

const Note = require('./models/note')


// Middleware
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  }else if (error.name ==="Validation Error"){
      return response.status(400).json({error: error.message})
  }
  next(error)
}


app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.get('/api/notes', (request, response) => {
	Note.find({}).then(notes=>{
  response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next)=> {
  Note.findById(request.params.id)
  .then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})


app.post('/api/notes', (request, response)=>{
  const body = request.body
 
  // if(body.content ===undefined) {
  //   return response.status(400).json({
  //   error: 'content missing'
  //   })
  // }

  const note = new Note( {
    content:body.content,
    important: Boolean(body.important) || false,
  })  

  note.save().then(savedNote =>{
    response.json(savedNote)
  })

})

app.put('/api/notes/:id', (request, response, next) => {
  const {content, important} = request.body

  Note.findByIdAndUpdate(request.params.id, {content, important}, { new: true, runValidators:true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next)=>{
  Note.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
  })


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
