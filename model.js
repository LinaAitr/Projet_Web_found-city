"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

exports.read = (id) => {
  let found = db.prepare('SELECT * FROM recipe WHERE id = ?').get(id);
  if(found !== undefined) {
    found.ingredients = db.prepare('SELECT name FROM ingredient WHERE recipe = ? ORDER BY rank').all(id);
    found.stages = db.prepare('SELECT description FROM stage WHERE recipe = ? ORDER BY rank').all(id);
    return found;
  } else {
    return null;
  }
};

exports.create = function(recipe) {
  var id = db.prepare('INSERT INTO recipe (title, img, description, duration) VALUES (@title, @img, @description, @duration)').run(recipe).lastInsertRowid;

  var insert1 = db.prepare('INSERT INTO ingredient VALUES (@recipe, @rank, @name)');
  var insert2 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

  var transaction = db.transaction((recipe) => {
    for(let j = 0; j < recipe.ingredients.length; j++) {
      insert1.run({recipe: id, rank: j, name: recipe.ingredients[j].name});
    }
    for(var j = 0; j < recipe.stages.length; j++) {
      insert2.run({recipe: id, rank: j, description: recipe.stages[j].description});
    }
  });

  transaction(recipe);
  return id;
}

exports.update = function(id, recipe) {
  var result = db.prepare('UPDATE recipe SET title = @title, img = @img, description = @description WHERE id = ?').run(recipe, id);
  if(result.changes == 1) {
    var insert1 = db.prepare('INSERT INTO ingredient VALUES (@recipe, @rank, @name)');
    var insert2 = db.prepare('INSERT INTO stage VALUES (@recipe, @rank, @description)');

    var transaction = db.transaction((recipe) => {
      db.prepare('DELETE FROM ingredient WHERE recipe = ?').run(id);
      for(var j = 0; j < recipe.ingredients.length; j++) {
        insert1.run({recipe: id, rank: j, name: recipe.ingredients[j].name});
      }
      db.prepare('DELETE FROM stage WHERE recipe = ?').run(id);
      for(var j = 0; j < recipe.stages.length; j++) {
        insert2.run({recipe: id, rank: j, description: recipe.stages[j].description});
      }
    });

    transaction(recipe);
    return true;
  }
  return false;
}

exports.delete = function(id) {
  db.prepare('DELETE FROM recipe WHERE id = ?').run(id);
  db.prepare('DELETE FROM ingredient WHERE recipe = ?').run(id);
  db.prepare('DELETE FROM stage WHERE recipe = ?').run(id);
}

exports.search = (query, page) => {
  const num_per_page = 32;
  query = query || "";
  page = parseInt(page || 1);

  var num_found = db.prepare('SELECT count(*) FROM recipe WHERE title LIKE ?').get('%' + query + '%')['count(*)'];
  var results = db.prepare('SELECT id as entry, title, img FROM recipe WHERE title LIKE ? ORDER BY id LIMIT ? OFFSET ?').all('%' + query + '%', num_per_page, (page - 1) * num_per_page);

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
