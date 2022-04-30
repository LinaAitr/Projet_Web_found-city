"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

let entries = JSON.parse(fs.readFileSync('data.json').toString());

let load = function(filename) {
  const activities = JSON.parse(fs.readFileSync(filename));

  db.prepare('DROP TABLE IF EXISTS favorite').run()

  db.prepare('DROP TABLE IF EXISTS user').run();
  db.prepare('CREATE TABLE user (id_user INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();

  db.prepare('DROP TABLE IF EXISTS activity').run();
  db.prepare('CREATE TABLE activity (id_activity INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, img TEXT, city TEXT, type TEXT)').run();

  db.prepare('CREATE TABLE favorite (id_user INTEGER, id_activity INTEGER, PRIMARY KEY(id_user, id_activity),'
            + 'FOREIGN KEY(id_user) REFERENCES user(id_user) ON DELETE CASCADE , '
            + 'FOREIGN KEY(id_activity) REFERENCES user(id_activity) ON DELETE CASCADE)').run()

  // db.prepare('DROP TABLE IF EXISTS location').run();
  // db.prepare('CREATE TABLE location (id_location INT, rank INT, name TEXT, city TEXT, latitude FLOAT, longitude FLOAT)').run();
  let insert1 = db.prepare('INSERT INTO activity VALUES (@id_activity, @name, @img, @city, @type)');
  //let insert2 = db.prepare('INSERT INTO location VALUES (@id_location, @rank, @city, @latitude, @longitude)');
  //let insert3 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

  let transaction = db.transaction((activities) => {
    for(let id_activity = 0;id_activity < activities.length; id_activity++) {
      let activity = activities[id_activity];
      activity.id_activity = id_activity;
      //console.log(activity);
      insert1.run(activity);
      // for(let j = 0; j < activities.location.length; j++) {
      //   insert2.run({activity: id_activity, rank: j, name: activities.location[j].name});
      // }
      /*for(let j = 0; j < monument.stages.length; j++) {
        insert3.run({recipe: id, rank: j, description: recipe.stages[j].description});
      }*/
    }
  });
  transaction(activities);
}

load('data.json');
