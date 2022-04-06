"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

exports.read = (id) => {
  let found = db.prepare('SELECT * FROM monument WHERE id = ?').get(id);
  if(found !== undefined) {
    found.region = db.prepare('SELECT name FROM region WHERE monument = ? ORDER BY rank').all(id);
    //found.stages = db.prepare('SELECT description FROM stage WHERE recipe = ? ORDER BY rank').all(id);
    return found;
  } else {
    return null;
  }
};

exports.create = function(monument) {
  var id = db.prepare('INSERT INTO monument (name, img, city) VALUES (@name, @img, @city)').run(monument).lastInsertRowid;

  var insert1 = db.prepare('INSERT INTO regions VALUES (@monument, @rank, @name)');
  //var insert2 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

  var transaction = db.transaction((monument) => {
    for(let j = 0; j < monument.region.length; j++) {
      insert1.run({monument: id, rank: j, name: monument.region[j].name});
    }
    // for(var j = 0; j < recipe.stages.length; j++) {
    //   insert2.run({recipe: id, rank: j, description: recipe.stages[j].description});
    // }
  });

  transaction(monument);
  return id;
}


exports.search = (query, page) => {
  const num_per_page = 32;
  query = query || "";
  page = parseInt(page || 1);

  var num_found = db.prepare('SELECT count(*) FROM monument WHERE name LIKE ?').get('%' + query + '%')['count(*)'];
  var results = db.prepare('SELECT id as entry, name, img FROM monument WHERE name LIKE ? ORDER BY id LIMIT ? OFFSET ?').all('%' + query + '%', num_per_page, (page - 1) * num_per_page);

  return {
    results: results,
    num_found: num_found,
    query: query,
    next_page: page + 1,
    page: page,
    num_pages: parseInt(num_found / num_per_page) + 1,
  };
};

exports.login = function login(name, password){
 const user = db.prepare('SELECT id FROM user WHERE name=? and password=?').get(name, password);
 return user ? user.id : -1;
}

exports.new_user = function new_user(name, password){
  const newUser = db.prepare("INSERT INTO user(name, password) VALUES (@name, @password)").run({name, password});
  return newUser.id;
}
