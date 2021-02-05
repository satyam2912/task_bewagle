const express = require("express");
const path = require("path");
const bodyparser = require("body-parser")
const app = express();
const fs = require('fs')
const FILE_PATH = 'stats.json'
// getting-started.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/process', { useNewUrlParser: true });

const port = 8000;
// //schema for mongoose
const processSchema = new mongoose.Schema({
    date: String,
    method: String,
    headers: {
        host: String,
        connection: String,
        origin: String,
        accept: String,

    },
    path: String,
    body: {
        name: String,
        phone: Number,
        email: String,
        address: String,
        desc: String,
    },
    duration: String

});
const Process = mongoose.model('process', processSchema);

//Express specific stuff
app.use('/static', express.static('static')) //for serving static files
app.use(express.urlencoded());
const getRoute = (req) =>  {
    const route = req.route ? req.route.path : '' 
    const baseUrl = req.baseUrl ? req.baseUrl : '' 
 
    return route ? `${baseUrl === '/' ? '' : baseUrl}${route}` : 'unknown route'
  }
app.use((req, res, next) => {
    res.on('finish', () => {
        const stats = readStats()
        const event = `${req.method} ${getRoute(req)} ${res.statusCode}`
        stats[event] = stats[event] ? stats[event] + 1 : 1
        dumpStats(stats)
    })
    next()
})

//pug specific stuff
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//endpoints
app.get('/', (req, res) => {
    res.status(200).render('contact.pug');
})

// //for process
app.post('/process', (req, res) => {
    var date = new Date()
    var n = date.toISOString();
    var myData = new Process({
        date: n,
        method: 'post',
        headers: {
            host: 'localhost:8000', connection: 'keep-alive', origin: 'http://localhost:8000', accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        },
        path: '/process',
        body: {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            desc: req.body.desc,
        },
        duration: '15000'
    });
    console.log(myData);
    myData.save().then(() => {
        setTimeout(function () {
            res.json({
                date: n,
                method: 'post',
                headers: {
                    host: 'localhost:8000', connection: 'keep-alive', origin: 'http://localhost:8000', accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
                },
                path: '/process',
                body: {
                    name: req.body.name,
                    phone: req.body.phone,
                    email: req.body.email,
                    address: req.body.address,
                    desc: req.body.desc,
                },
                duration: '15000'
            });
        }, 15000);
    }).catch(() => {
        res.status(400).send("Not saved")
    });
})

// read json object from file
const readStats = () => {
    let result = {}
    try {
        result = JSON.parse(fs.readFileSync(FILE_PATH))
    } catch (err) {
        console.error(err)
    }
    return result
}
// dump json object to file
const dumpStats = (stats) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(stats), { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }
}
//stats
app.get('/stats/', (req, res) => {
    res.json(readStats())
})



//server
app.listen(port, () => {
    console.log(`the application is running on port ${port}`)
})


