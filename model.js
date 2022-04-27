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


exports.create = function(activity) {
  var id = db.prepare('INSERT INTO activity (name, img, city) VALUES (@name, @img, @city)').run(activity).lastInsertRowid;

  var insert1 = db.prepare('INSERT INTO regions VALUES (@activity, @rank, @name)');
  //var insert2 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

  var transaction = db.transaction((activity) => {
    for(let j = 0; j < activity.region.length; j++) {
      insert1.run({activity: id, rank: j, name: activity.region[j].name});
    }
    // for(var j = 0; j < recipe.stages.length; j++) {
    //   insert2.run({recipe: id, rank: j, description: recipe.stages[j].description});
    // }
  });

  transaction(activity);
  return id;
}


exports.search = (query, page) => {
  const num_per_page = 32;
  query = query || "";
  page = parseInt(page || 1);
  var previous_page;
  var next_page;

  var num_found = db.prepare('SELECT count(*) FROM activity WHERE name LIKE ? OR city LIKE ?').get('%' + query + '%','%' + query + '%')['count(*)'];
  var results = db.prepare('SELECT id_activity as entry, name, img FROM activity WHERE name LIKE ? OR city LIKE ? ORDER BY id_activity LIMIT ? OFFSET ?').all('%' + query + '%', '%' + query + '%', num_per_page, (page - 1) * num_per_page);
  var num_pages = parseInt(num_found / num_per_page) + 1;
  if (page==num_pages){
    next_page = page;
  }
  else {
    next_page = page+1;
  }
  if (page==0){
    previous_page = page;
  }
  else {
    previous_page = page-1;
  }

  return {
    results: results,
    num_found: num_found,
    query: query,
    previous_page: previous_page,
    next_page: next_page,
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
};

exports.suggestion = function suggestion(page){
  const num_per_page = 4;
  var random = db.prepare('SELECT * FROM monument ORDER BY RANDOM() LIMIT ?').all(num_per_page);

  return {
    random: random,
    page: page
  };
}
