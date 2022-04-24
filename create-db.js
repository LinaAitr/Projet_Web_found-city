"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

let entries = JSON.parse(fs.readFileSync('data.json').toString());
let load = function(filename) {
  const monuments = JSON.parse(fs.readFileSync(filename));


  //........................................
  db.prepare('DROP TABLE IF EXISTS user').run();
  db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();

  db.prepare('DROP TABLE IF EXISTS monument').run();
  db.prepare('DROP TABLE IF EXISTS location').run();
  //db.prepare('DROP TABLE IF EXISTS stage').run();

  db.prepare('CREATE TABLE monument (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, img TEXT, city TEXT)').run();
  //db.prepare('CREATE TABLE location (monument INT, rank INT, city TEXT, latitude DOUBLE, longitude DOUBLE)').run();

  //db.prepare('CREATE TABLE stage (recipe INT, rank INT, description TEXT)').run();

  let insert1 = db.prepare('INSERT INTO monument VALUES (@id, @name, @img, @city)');
  //let insert2 = db.prepare('INSERT INTO location VALUES (@monument, @rank, @city, @latitude, @longitude)');

  //let insert3 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

  let transaction = db.transaction((monuments) => {

    for(let id = 0;id < monuments.length; id++) {
      let monument = monuments[id];
      monument.id = id;
      console.log(monument);
      insert1.run(monument);
      // for(let j = 0; j < monument.location.length; j++) {
      //   insert2.run({monument: id, rank: j, name: monument.location[j].name});
      // }

      /*for(let j = 0; j < monument.stages.length; j++) {
        insert3.run({recipe: id, rank: j, description: recipe.stages[j].description});
      }*/
    }
  });

  transaction(monuments);
}

load('data.json');
