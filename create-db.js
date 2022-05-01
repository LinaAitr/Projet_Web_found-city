"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

let entries = JSON.parse(fs.readFileSync('data.json').toString());

let create_tables = function() {
  db.prepare('DROP TABLE IF EXISTS favorite').run()

  db.prepare('DROP TABLE IF EXISTS user').run();
  db.prepare('CREATE TABLE user (id_user INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();

  db.prepare('DROP TABLE IF EXISTS activity').run();
  db.prepare('CREATE TABLE activity (id_activity INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, img TEXT, city TEXT, type TEXT, latitude FLOAT, longitude FLOAT)').run();

  db.prepare('CREATE TABLE favorite (id_user INTEGER, id_activity INTEGER, PRIMARY KEY(id_user, id_activity),'
            + 'FOREIGN KEY(id_user) REFERENCES user(id_user) ON DELETE CASCADE , '
            + 'FOREIGN KEY(id_activity) REFERENCES activity(id_activity) ON DELETE CASCADE)').run()
}

let load = function(filename) {
  const monuments = JSON.parse(fs.readFileSync(filename));
  let insert1 = db.prepare('INSERT INTO activity VALUES (@id_activity, @name, @img, @city, @type, @latitude, @longitude)');
  let transaction = db.transaction((monuments) => {
    for(let id = 0; id < monuments.length; id++) {
      let monument = monuments[id];
      insert1.run({id_activity: id, name: monument.name, img: monument.img, city: monument.city, type: "monument", latitude: monument.latitude, longitude: monument.longitude});
    }
  });
  transaction(monuments);
}

create_tables();
load('data.json');
