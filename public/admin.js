const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//En este documento se crea la "tabla" de usuarios.

const saltRounds = 10; //Variable salt para cifrado de contrasena

//Creacion del formato de los usuarios (Generico, es necesario agregar algunos espacios)

const AdminSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

//Funcion que se ejecuta antes de guardar el usuario en la BD (Cifrado de Contrasena)

AdminSchema.pre('save', function(next) {
    if(this.isNew || this.isModified('passport')) {
        const document = this;

        bcrypt.hash(document.password, saltRounds, (err, hashedPassword) => {
            if(err) {
                next(err);
            } else {
                document.password = hashedPassword;
                next();
            }
        })
    } else {
        next();
    }
});

//Metodo para comparar contrasenas

AdminSchema.methods.isCorrectPassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(err, same) {
        if(err) {
            callback(err);
        } else {
            callback(err, same);
        }
    });
}

//Se manda el documento a la BD

module.exports = mongoose.model('Admin', AdminSchema);