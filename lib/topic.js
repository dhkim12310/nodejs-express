const { response } = require('express')
const express = require('express')
const app = express()

var db = require('./db');
var template = require('./template.js');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var bodyParser = require('body-parser');
var path = require('path');
var compression = require('compression');

app.use(bodyParser.urlencoded({extended:false}));
app.use(compression());

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `
          <h2>${title}</h2>${description}
          <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
          `,
          `<a href="/topic/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response){
    var pageId = path.parse(request.params.pageId).base;
    db.query(`SELECT * FROM topic`, function(error,topics){
        if(error){
          next(error);
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,[pageId],function(error2,topic){
          if(error2){
            next(error2);
          }
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `
            <h2>${sanitizeHtml(topic[0].title)}</h2>
            ${sanitizeHtml(description)}
            <p>by ${sanitizeHtml(topic[0].name)}</p>
            `,
            `<a href="/topic/create">create</a>
             <a href="/topic/update/${pageId}">update</a>
             <form action="delete_process" method="post">
               <input type="hidden" name="id" value="${pageId}">
               <input type="submit" value="delete">
             </form>`
            );
            response.writeHead(200);
            response.end(html);
            })
        });
    }

exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
      if(error){
        next(error);
      }
        db.query('SELECT * FROM author',function(error2,authors){
          if(error2){
            next(error2);
          }
          var title = 'Create';
          var list = template.list(topics);
          var html = template.HTML(sanitizeHtml(title), list,
            `<form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                ${template.authorSelect(authors)}
            </p>
            <p>
              <input type="submit">
            </p>
            </form>`,
            `<a href="/topic/create">create</a>`
            );
          response.send(html);
        });
      });
}

exports.create_process = function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
    });
  request.on('end', function(){
    var post = qs.parse(body);
    db.query(`
      INSERT INTO topic (title, description, created, author_id)
       VALUES(?,?, NOW(),?)`,
      [post.title, post.description, post.author],
      function(error, result){
          if(error){
            throw error;
          }
          console.log(result);
          response.writeHead(302, {Location: `/topic/${result.insertId}`});
          response.end();
      }
    )
  });
}

exports.update = function(request, response){
    var _url = request.url;
    var pageId = path.parse(request.params.pageId).base;
    db.query(`SELECT * FROM topic`,function(error,topics){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`,[pageId],function(error2,topic){
          if(error2){
            throw error2;
          }
          db.query('SELECT * FROM author',function(error2,authors){
          var list = template.list(topics);
          var html = template.HTML(sanitizeHtml(topic[0].title), list,
            `
            <form action="/topic/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
              <p>
                <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
              </p>
              <p>
                ${template.authorSelect(authors, topic[0].author_id)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="topic/update/${topic[0].id}">update</a>`
          );
          response.send(html);
          });
        });
    });
}

exports.update_process = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',[post.title,post.description,post.author,post.id],function(error,result){
          response.redirect(`/topic/${post.id}`);
        })
    });
}

exports.delete = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query('DELETE FROM topic WHERE id=?',[post.id],function(error,result){
          if(error){
            throw error;
          }
          response.redirect('/');
        });
    });
}

