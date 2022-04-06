"use strict"

const express = require('express');
const mustache = require('mustache-express');
const randomstring = require('randomstring');
const cookieSession = require('cookie-session');

const model = require('./model');
const app = express();


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


function is_authenticated(req, res, next) {
  if (req.session.user != undefined){
    next();}
  else {
    res.send(401);
  }
}

function paramMustache(req, res, next) {
  if (req.session.user !== undefined){
    res.locals.authenticated = true;
    res.locals.name = req.session.user.name;
  }else {
    res.locals.authenticated = false;
    res.locals.name = null;
  }
  next();
}

app.use(cookieSession({
secret: randomstring.generate(),
}));

app.use(paramMustache);

///........................................................................////

/**** Routes pour voir les pages du site ****/

/* Retourne une page principale avec le nombre de recettes */
app.get('/', (req, res) => {
  res.render('index');
});

/* Retourne les résultats de la recherche à partir de la requête "query" */
app.get('/search', (req, res) => {
  let found = model.search(req.query.query, req.query.page);
  res.render('search', found);
});

/* Retourne le contenu d'une recette d'identifiant "id" */
app.get('/read/:id', (req, res) => {
  let entry = model.read(req.params.id);
  res.render('read', entry);
});

app.get('/create', is_authenticated, (req, res) => {
  res.render('create');
});

app.get('/update/:id', is_authenticated,(req, res) => {
  let entry = model.read(req.params.id);
  res.render('update', entry);
});

app.get('/delete/:id', is_authenticated, (req, res) => {
  let entry = model.read(req.params.id);
  res.render('delete', {id: req.params.id, title: entry.title});
});

app.get('/login',(req,res)=>{
  res.render('login');
});

app.get('/new_user',(req,res)=>{
  res.render('new_user');
});

/**** Routes pour modifier les données ****/

// Fonction qui facilite la création d'une recette
function post_data_to_recipe(req) {
  return {
    title: req.body.title,
    description: req.body.description,
    img: req.body.img,
    duration: req.body.duration,
    ingredients: req.body.ingredients.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({name: e.trim()})),
    stages: req.body.stages.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({description: e.trim()})),
  };
}

app.post('/create', (req, res) => {
  let id = model.create(post_data_to_recipe(req));
  res.redirect('/read/' + id);
});

app.post('/update/:id', (req, res) => {
  let id = req.params.id;
  model.update(id, post_data_to_recipe(req));
  res.redirect('/read/' + id);
});

app.post('/delete/:id', (req, res) => {
  model.delete(req.params.id);
  res.redirect('/');
});

app.post('/login', (req, res)=>{
    const id = model.login(req.body.name, req.body.password);
    if (id >-1){
      req.session.user = {id, name : req.body.name};
      res.redirect('/');
    }
    else {
      res.redirect('/login');
    }
});

app.post('/logout',(req, res)=> {
  req.session = null;
  res.redirect('/');
});

app.post('/new_user', (req, res)=>{
  const id = model.new_user(req.body.name, req.body.password);
  req.session.user = {id, name : req.body.name};
  res.redirect('/');
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));
