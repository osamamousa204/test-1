//require
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

//main variable
const app = express();
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

//uses
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

//litening to port
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`i am listening ${PORT}`);

        })
    })


//===================(Routs)=====================\\
app.get('/', homeHandler)
app.get('/addToDb', addToDbHandler)
app.get('/selectData', selectDataHandler)
app.get('/details/:digi_id', detailsHandler)
app.put('/update/:update_id', updateHandler)
app.delete('/delete/:delete_id', deleteHanler)
//===============(Routs Handlers)=================\\

//***********(homeHandler)***********\\

function homeHandler(req, res) {
    let url = `https://digimon-api.herokuapp.com/api/digimon`;
    superagent.get(url)
        .then(data => {
            let digiArray = data.body.map(val => {
                return new Digimons(val)
            })
            res.render('index', { data: digiArray })
        })
}

function Digimons(val) {
    this.name = val.name || 'no name';
    this.image = val.img || 'no img';
    this.level = val.level || 'no level'
}

//***********(addToDbHandler)***********\\
function addToDbHandler(req, res) {
    //collect the data
    let { name, image, level } = req.query;
    //insert
    let sql = `INSERT INTO digi_test (name , image , level) VALUES ($1,$2,$3);`;
    let safeValues = [name, image, level];
    client.query(sql, safeValues)
        .then(() => {
            res.redirect('/selectData')
        })
}

//***********(selectDataHandler)***********\\
function selectDataHandler(req, res) {
    //select all and render to favorite page
    let sql = `SELECT * FROM digi_test;`;
    client.query(sql)
        .then(result => {
            res.render('pages/favorite', { data: result.rows })
        })
}

//***********(detailsHandler)***********\\
function detailsHandler(req, res) {
    //collect param value 
    let param = req.params.digi_id;
    //select element where id = param 
    let sql = `SELECT * FROM digi_test WHERE id = $1; `;
    let safeValue = [param];
    client.query(sql, safeValue)
        .then(result => {
            res.render('pages/details', { data: result.rows[0] })
        })
}


//***********(updateHandler)***********\\


function updateHandler(req, res) {
    //collect param value
    let param = req.params.update_id;
    //collect the updated data
    let { name, image, level } = req.body;
    //update where id = param value
    let sql = `UPDATE digi_test SET name=$1 , image=$2, level=$3 WHERE id = $4;`;
    let safeValues = [name, image, level, param];
    client.query(sql, safeValues)
        .then(() => {
            res.redirect(`/details/${param}`)
        })
}

//***********(deleteHanler)***********\\


function deleteHanler(req, res) {
    //collect param value 
    let param = req.params.delete_id;
    //delete where id = param value
    let sql = `DELETE FROM digi_test WHERE id = $1;`;
    let safeValue = [param];
    client.query(sql,safeValue)
    .then(()=>{
        res.redirect('/selectData')
    })
}

//error handlers
function notFoundHandler(req, res) {
    res.status(404).send('page not found')
}
function errorHandler(error, req, res) {
    res.status(500).send(error)
}