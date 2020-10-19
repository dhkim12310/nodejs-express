const { response } = require('express')
const express = require('express')
const app = express()
var topic = require('./lib/topic')
var author = require('./lib/author')

app.use(express.static('public'));
app.use(helmet());

app.get('/',(request, response) => topic.home(request,response))
app.get(`/topic/create`, (request, response) => topic.create(request,response))
app.post(`/topic/create_process`, (request, response) => topic.create_process(request,response))
app.get('/topic/update/:pageId',(request,response)=>topic.update(request,response))
app.post('/topic/update_process',(request,response) => topic.update_process(request,response))
app.post('/topic/delete_process', (request,response) =>topic.delete(request,response))
app.get('/topic/:pageId',(request, response) => {topic.page(request,response)})

app.get('/author',(request,response) =>author.home(request,response))
app.post('/author/create_process',(request,response) => author.create_author_process(request,response))
app.get('/author/update',(request,response)=> author.update(request,response))
app.post('/author/update_process',(request,response)=>author.update_process(request,response))
app.post('/author/delete_process',(request,response)=> author.delete_process(request,response))
app.use(function(req, res, next) {res.status(404).send('페이지를 찾을 수 없습니다');});
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(3000, () => console.log())