/* El monton de modulos necesarios */

const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const user = require('./public/user');
const club = require('./public/club');
const admin = require('./public/admin');
const app = express();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const MongoStore = require('connect-mongo');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

//Conexion a BD (Cambiar en caso de ser necesario)

const mongoUri = 'mongodb+srv://admin:admin@proyectobases.nflkvwk.mongodb.net/?retryWrites=true&w=majority'; 

app.use(cookieParser());
app.use(session({
    secret  : 'HELLO',
    cookie  : {maxAge: 3600000},
    store   : MongoStore.create({mongoUrl: mongoUri})
}));

mongoose.connect(mongoUri, function(err) {
    if (err) {
        throw err;
    } else {
        console.log('Conectado a BD');
    }
})

// Funcion de Registrar
// Luego del slash va el nombre de la funcion, el cual debe de ser colocado ya sea en el form o en el codigo de client para ser llamada.

app.post('/register', (req, res) => {
    const {username, password, passwordConfirmation, fullname, seccion} = req.body; //Obteniendo los Datos
    const newUser = new user({fullname, username, password, seccion}) //Creando Documento User

    if (password != passwordConfirmation) {
        res.status(500).send('LAS CONTRASEÑAS NO COINCIDEN. REGRESE A LA PÁGINA ANTERIOR E INTENTE NUEVAMENTE');
    } else {
        newUser.save(err => {
            if (err) {
                res.status(500).send(err + 'ERROR AL REGISTRAR USUARIO. REGRESE A LA PÁGINA ANTERIOR E INTENTE NUEVAMENTE');
            } else {
                return res.redirect(301, 'index.html');
            }
        });
    }
});

app.post('/registerAdmin', (req, res) => {
    const {username, password} = req.body; //Obteniendo los Datos
    const newUser = new admin({username, password}) //Creando Documento User

    newUser.save(err => {
        if (err) {
            res.status(500).send('ERROR AL REGISTRAR USUARIO. REGRESE A LA PÁGINA ANTERIOR E INTENTE NUEVAMENTE');
        } else {
            return res.redirect(301, 'index.html');
        }
    });
});

//Funcion de Login

app.post('/authenticate', (req, res) => {
    const {username, password} = req.body;
    user.findOne({username}, (err, user) => {
        if(err) {
            res.status(500).send('ERROR AL AUTENTICAR USUARIO');
        } else if (!user) {
            res.status(500).send('EL USUARIO NO EXISTE. REGRESE A LA PÁGINA ANTERIOR E INTENTE NUEVAMENTE');
        } else {
            user.isCorrectPassword(password, (err, result) => {
                if (err) {
                    res.status(500).send('ERROR AL AUTENTICAR');
                } else if (result) {
                    req.session.username = username;
                    return res.redirect(301, 'clubsView.html');
                } else {
                    res.status(500).send('USUARIO O CONTRASEÑA INCORRECTA');
                }
            })
        }
    })
});

app.post('/authenticateAdmin', (req, res) => {
    const {username, password} = req.body;
    admin.findOne({username}, (err, admin) => {
        if(err) {
            res.status(500).send('ERROR AL AUTENTICAR USUARIO');
        } else if (!user) {
            res.status(500).send('EL USUARIO NO EXISTE. REGRESE A LA PÁGINA ANTERIOR E INTENTE NUEVAMENTE');
        } else {
            admin.isCorrectPassword(password, (err, result) => {
                if (err) {
                    res.status(500).send('ERROR AL AUTENTICAR');
                } else if (result) {
                    req.session.username = username;
                    return res.redirect(301, 'consultas.html');
                } else {
                    res.status(500).send('USUARIO O CONTRASEÑA INCORRECTA');
                }
            })
        }
    })
});

//Obtener el nombre del usuario que se encuentra logueado

app.post('/getUsername', (req, res) => {
    res.send(JSON.stringify(req.session.username));
});

//Registrar un nuevo club

app.post('/registerClub', async (req, res) => {
    var {clubName, category} = req.body; //Obteniendo los Datos
    const username = JSON.stringify(req.session.username);

    infoClub = await club.findOne({clubName: clubName}, 'clubName, clubCategory');

    if (infoClub) {
        category = infoClub['clubCategory'];
    }

    const newClub = new club({clubName, clubCategory: category, suggestedBy: username.replace(/[\[\]"]+/g,"")}) //Lo mismo 

    newClub.save(err => {
        if (err) {
            res.status(500).send(err);
        } else {
            return res.redirect(301, 'clubsView.html');
        }
    });

});

//Recoleccion de todos los clubes

app.post('/getClubs', async (req, res) => {
    const {category} = req.body;
    res.send(await club.find({clubCategory: category}).distinct('clubName'));
});

app.post('/getClubCategory', async (req, res) => {
    const {clubName} = req.body;
    res.send(await club.findOne({clubName: clubName}, {clubCategory: 1}));
})

app.post('/isInterested', async (req, res) => {
    const {clubName} = req.body;
    exist = await club.findOne({clubName: clubName, suggestedBy: req.session.username});
    if (exist != null) {
        res.send(true);
    } else {
        res.send(false);
    }
    
})

app.post('/getPopularCategories', async (req, res) => {
    res.send(await club.aggregate([{$group: {_id: "$clubName", clubCategory: {$addToSet: "$clubCategory"}}}, {$sortByCount: "$clubCategory"}]))
})

app.post('/usersWithMostClubs', async (req, res) => {
    res.send(await club.aggregate([{ $sortByCount: "$suggestedBy"}, {$limit : 3}, {$lookup: {from: "users", localField: "_id", foreignField: "username", as: "nombre"}}]))
})

app.post('/mostSuggestedClubs',  async (req, res) => {
    res.send(await club.aggregate([{$group: {_id: ["$clubName", "$clubCategory"], cantidad: {"$sum":1}}}, {$sort:{cantidad:-1}}, {$limit: 5}]))
})

app.post('/lessSuggestedClubs',  async (req, res) => {
    res.send(await club.aggregate([{$group: {_id: ["$clubName", "$clubCategory"], cantidad: {"$sum":1}}}, {$sort:{cantidad:1}}, {$limit: 3}]))
})

app.listen(3000, () =>{
    console.log('Servidor Iniciado');
});

module.exports = app;