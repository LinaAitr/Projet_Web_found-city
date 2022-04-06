"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

let entries = JSON.parse(fs.readFileSync('data.json').toString());
let load = function(filename) {
  const recipes = JSON.parse(fs.readFileSync(filename));


  //........................................
  db.prepare('DROP TABLE IF EXISTS user').run();
  db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();
  //........................................

  db.prepare('DROP TABLE IF EXISTS monument').run();
  db.prepare('DROP TABLE IF EXISTS region').run();
  //db.prepare('DROP TABLE IF EXISTS stage').run();

  db.prepare('CREATE TABLE monument (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, img TEXT, city TEXT)').run();
  db.prepare('CREATE TABLE region (monument INT, rank INT, name TEXT)').run();
  //db.prepare('CREATE TABLE stage (recipe INT, rank INT, description TEXT)').run();

  let insert1 = db.prepare('INSERT INTO monument VALUES (@id, @title, @img, @region, @city)');
  let insert2 = db.prepare('INSERT INTO region VALUES (@recipe, @rank, @name)');
  //let insert3 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

  let transaction = db.transaction((monuments) => {

    for(let id = 0;id < monuments.length; id++) {
      let monument = monuments[id];
      monument.id = id;
      insert1.run(monument);
      for(let j = 0; j < monument.region.length; j++) {
        insert2.run({recipe: id, rank: j, name: monument.region[j].name});
      }
      /*for(let j = 0; j < monument.stages.length; j++) {
        insert3.run({recipe: id, rank: j, description: recipe.stages[j].description});
      }*/
    }
  });

  transaction(recipes);
}

load('data.json');
