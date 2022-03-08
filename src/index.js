const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const {username}=request.headers;
  
  const user=users.find((user)=>user.username===username) 
  
  if(!user){
    return response.status(400).json({error: 'Mensagem do erro'})
  }

  request.user=user;

  return next()
}

app.post('/users', (request, response) => {
  const {name, username}=request.body

  const userExist=users.some(user=>user.username===username)
  const user = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }
  if(!userExist){
  users.push(user)
  return response.status(201).json(user)
  }else{
    return response.status(400).send({error: 'Mensagem do erro'})
  }

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user}=request;
  response.status(201).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user}=request;
  const {title,deadline}=request.body;
  const todo={
    id:uuidv4(),
    title,
    done:false,
    deadline:new Date(deadline),
    created_at:new Date(),
  }
  user.todos.push(todo)
  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id}=request.params;
  const {title,deadline}=request.body;
  const {user}=request;
  const index=user.todos.find(x=>x.id===id)
  console.log(index)
  if(index){
    index.title=title
    index.deadline=new Date(deadline)
    return response.json(index)
  }
  return response.status(404).json({error:"erro"})
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id}=request.params;
  const {user}=request;
  const index=user.todos.find(x=>x.id===id)
  console.log(index)

  if(index){
    index.done=true
    return response.status(201).json(index)
  }

  return response.status(404).json({error:"erro"})
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id}=request.params;
  const {user}=request;
  const index=user.todos.find(x=>x.id===id)
  
  if(index){
    user.todos.splice(index,1)
    return response.status(204).json(user)
  }

  return response.status(404).json({error:"erro"})
  
});

module.exports = app;