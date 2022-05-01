"use strict"

const Sqlite = require('better-sqlite3');
let db = new Sqlite('db.sqlite');

exports.read = (id) => {
  let found = db.prepare('SELECT * FROM activity WHERE id_activity = ?').get(id);
  if(found !== undefined) {
    return found;
  } else {
    return null;
  }
};

exports.search = (query, page) => {
  const num_per_page = 32;
  query = query || "";
  page = parseInt(page || 1);
  let previous_page;
  let next_page;

  let num_found = db.prepare('SELECT count(*) FROM activity WHERE name LIKE ? OR city LIKE ?').get('%' + query + '%','%' + query + '%')['count(*)'];
  let results = db.prepare('SELECT id_activity as entry, name, img, latitude, longitude FROM activity WHERE name LIKE ? OR city LIKE ? ORDER BY id_activity LIMIT ? OFFSET ?').all('%' + query + '%', '%' + query + '%', num_per_page, (page - 1) * num_per_page);
  let num_pages = parseInt(num_found / num_per_page) + 1;
  if (page==num_pages){
    next_page = page;
  }
  if (page == num_pages){
    next_page = null;
  } else {
    next_page = page+1;
  }
  if (page==0){
    previous_page = page;
  } else {
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

}


exports.login = function login(name, password){
 const user = db.prepare('SELECT id_user FROM user WHERE name=? and password=?').get(name, password);
 return user ? user.id_user : -1;
}

exports.new_user = function new_user(name, password){
  const user = db.prepare("INSERT INTO user(name, password) VALUES (@name, @password)").run({name, password});
  return user.id_user;
}

exports.suggestion = function suggestion(){
  const num_per_page = 4;
  let random = db.prepare('SELECT id_activity as entry, name, img, latitude, longitude FROM activity ORDER BY RANDOM() LIMIT ?').all(num_per_page);

  return {
    random: random
  };
}

exports.add_favorite = function add_favorite(id_user, id_activity){
  db.prepare('INSERT INTO favorite(id_user, id_activity) VALUES (?, ?)').run(id_user, id_activity);
  // let button ="</3";
  // return {
  //   button: button
  // };
}

exports.delete_favorite = function delete_favorite(id_user, id_activity){
  db.prepare('DELETE FROM favorite WHERE id_user=? and id_activity=?').run(id_user, id_activity);
}

// exports.is_favorite = function is_favorite(id_user, id_activity) {
//   const act = db.prepare('SELECT id_activity FROM favorite WHERE id_user=? and id_activity=?').all(id_user, id_activity);
//   if(act !== undefined){
//     let button ="</3";
//   } else {
//     let button = "<3";
//   }
//   return {
//     button: button
//   };
// }

exports.favorites = (id_user, page) => {
  const num_per_page = 32;
  page = parseInt(page || 1);
  let previous_page;
  let next_page;

  let num_fav = db.prepare('SELECT count(id_activity) FROM favorite WHERE id_user=?').get(id_user)['count(id_activity)'];
  let fav = db.prepare('SELECT activity.id_activity as entry, name, img, latitude, longitude FROM activity INNER JOIN favorite WHERE activity.id_activity=favorite.id_activity and favorite.id_user=? ORDER BY activity.id_activity LIMIT ? OFFSET ?').all(id_user, num_per_page, (page - 1) * num_per_page);
  let num_pages = parseInt(num_fav / num_per_page) + 1;
  if (page==num_pages){
    next_page = null;
  } else {
    next_page = page+1;
  }
  if (page==0){
    previous_page = page;
  } else {
    previous_page = page-1;
  }
  
  return {
    fav: fav,
    num_fav: num_fav,
    previous_page: previous_page,
    next_page: next_page,
    page: page,
    num_pages: parseInt(num_fav / num_per_page) + 1,
  };
}
