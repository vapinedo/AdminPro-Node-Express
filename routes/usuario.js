const express = require('express');
const bcrypt = require('bcryptjs');

const middlewareAuth = require('../middlewares/auth');

const app = express();
const Usuario = require('../models/usuario');

/*-----------------------------------
    READ Usuarios: GET
-----------------------------------*/ 
app.get('/', (req, res, next) => {

    var paginateFrom = req.query.paginateFrom || 0;
    paginateFrom = Number( paginateFrom );

    Usuario.find({}, 'nombre email img role')
        .skip( paginateFrom )
        .limit( 5 )
        .exec(    
            ( err, usuarios ) => {
                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar usuarios de la DB',
                        errors: err
                    });
                }

                Usuario.count({}, ( err, counting ) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: counting
                    });
                });
            }
        )

});

/*-----------------------------------
    CREATE Usuario: POST
-----------------------------------*/ 
app.post('/', middlewareAuth.checkTokenJWT, (req, res) => {

    var body = req.body;
    
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password:bcrypt.hashSync( body.password, 10 ),
        img: body.img,
        role: body.role
    });

    usuario.save( ( err, usuarioGuardado ) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });    
    });

});

/*-----------------------------------
    UPDATE Usuario: PUT
-----------------------------------*/ 
app.put('/:id', middlewareAuth.checkTokenJWT, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, ( err, usuario ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }      
        
        if ( !Usuario ) {
            return res.status(400).json({
                ok: false,
                message: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( err, usuarioGuardado ) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }         
            
            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });                
        });
    });

});

/*-----------------------------------
    DELETE Usuario: DELETE
-----------------------------------*/ 
app.delete('/:id', middlewareAuth.checkTokenJWT, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove( id, ( err, usuarioBorrado ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar usuario',
                errors: err
            });
        }

        if ( !usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });    
    });
});

module.exports = app;