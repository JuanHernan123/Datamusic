const {request, response} = require('express');
const bcrypt = require('bcrypt');
const cancionesModel = require('../models/canciones');
const pool = require('../db');

const listCanciones = async (req = request, res = response) => {
    let conn;

    try {
        conn = await pool.getConnection();

        const canciones = await conn.query(cancionesModel.getAll, (err) =>{
            if(err){
                throw err;
            }

        })
        res.json(canciones);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);     
    }finally{
        if(conn){
            conn.end();
        }
    }
}

const listCancionesByID = async (req = request, res = response) =>{
    const {id} = req.params;
    let conn;

    if(isNaN(id)){
        res.status(400).json({msg: `The ID ${id} is invalid`});
        return;
    }

    try {
        conn = await pool.getConnection();

        const [canciones] = await conn.query(cancionesModel.getByID, [id], (err) => {
            if(err){
                throw err;
            }
        })

        if(!canciones){
            res.status(404).json({msg: `music with ID ${id} not found`});
            return;
        }
        res.json(canciones);

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        
    }finally{
        if(conn){
            conn.end();
        }
    }
}

const addMusic =async (req = request, res = response) => {
    const {
        password,
        cancion,
        minutos,
        artista,
        genero,
        fechadelanzamiento,
        is_active = 1
    }= req.body

    if(!password || !cancion || !minutos || !artista || !genero || !fechadelanzamiento){
        res.status(400).json({msg: 'Missing iformation'});
        return;

    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const canciones = [passwordHash, cancion, minutos, artista, genero, fechadelanzamiento, is_active]
    let conn;

    try {
        conn = await pool.getConnection();

        const [cancionesExist] = await conn.query(cancionesModel.getBycanciones, [cancion], (err) => {
            if(err) throw err;
        })
        if (cancionesExist){
            res.status(409).json({msg: `music ${cancion} already exists`});
            return;
        }

        const cancionesAdd = await conn.query(cancionesModel.addRow, [...canciones], (err) =>{
            if(err) throw err;
        })
        if(cancionesAdd.affectedRows === 0){
            throw new Error('music not added');
        }
        res.json({msg: 'music added succesfully'});

        
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
        
    }finally{
        if(conn) conn.end();
    }
}

const updateCanciones = async (req = request, res = response) =>{
    let conn;

    const{
        password,
        cancion,
        minutos,
        artista,
        genero,
        fechadelanzamiento,
        is_active

    } = req.body;

    const {id} =req.params;

    let passwordHash;
    if(password){
        const saltRounds = 10;
        passwordHash = await bcrypt.hash(password, saltRounds);
    }

    let cancionesNewData = [
        passwordHash,
        cancion,
        minutos,
        artista,
        genero,
        fechadelanzamiento,
        is_active
    ];
    
    try{
        conn = await pool.getConnection();

        const [cancionesExists] = await conn.query(cancionesModel.getByID, [id], (err) =>{
            if(err) throw err;
        }
        );
        if(!cancionesExists || cancionesExists.is_active === 0){
            res.status(400).json({msg: `music with ID ${id} not found`});
            return
        }
        const [cancionesExist] = await conn.query(cancionesModel.getBycanciones, [cancion], (err) => {
            if(err) throw err;
        })
        if (cancionesExist){
            res.status(409).json({msg: `music ${cancion} already exists`});
            return;
        }

        const cancionesOldData = [
            cancionesExists.password,
            cancionesExists.cancion,
            cancionesExists.minutos,   
            cancionesExists.artista,
            cancionesExists.genero,
            cancionesExists.fechadelanzamiento,
            cancionesExists.is_active,
        ];

        cancionesNewData.forEach((cancionesData, index) =>{
            if(!cancionesData){
                cancionesNewData[index] = cancionesOldData[index];
            }
        })
        const cancionesUpdated = await conn.query(
            cancionesModel.updateRow,[...cancionesNewData, id],
            (err) => {
                if (err) throw err;
            }
        )
        if (cancionesUpdated.affectedRows === 0){
            throw new Error('music not updated');
        }
        res.json({msg: 'music updated succesfully'});
    }catch (error){
        console.log(error);
        res.status(500).json(error);
    }finally{
        if(conn) conn.end();
    }
}

const deleteCanciones = async (req = request, res = response)=>{
    let conn;
    const {id} = req.params;

    try {
        conn = await pool.getConnection();

        const [cancionesExists] = await conn.query(cancionesModel.getByID, [id], (err) =>{
            if(err) throw err;
        }
        );
        if(!cancionesExists || cancionesExists.is_active === 0){
            res.status(400).json({msg: `music with ID ${id} not found`});
            return
        }
        const cancionesDeleted = await conn.query(
            cancionesModel.deleteRow, [id], (err) =>{
                if(err) throw err;
            }
        );
        if(cancionesDeleted.affectedRows === 0){
            throw new Error('music not deleted');
        }
        res.json({msg: 'music deleted succesfully'});

    } catch (error) {
        console.log(error);
        res.status(500).json(error);  
    }finally{
        if(conn) conn.end();
    }
}

const signInUser = async (req = request, res = response) =>{
    let conn;

    const {cancion, password} = req.body;

    try{
        conn = await pool.getConnection();

        if(!cancion || !password){
            res.status(400).json({msg: 'You must send music and password'});
            return;
        }

        const [canciones] = await conn.query(cancionesModel.getBycanciones,
            [cancion],
            (err) =>{
                if(err)throw err;
            }
            );
            if (!canciones){
                res.status(400).json({msg: `Wrong music or password`});
                return;
            }

            const passwordOK = await bcrypt.compare(password, canciones.password);

            if(!passwordOK){
                res.status(404).json({msg: `Wrong music or password`});
                return;
            }

            delete(canciones.password);

            res.json(canciones);
    }catch (error){
        console.log(error);
        res.status(500).json(error);
    }finally{
        if(conn) conn.end();
    }
}




module.exports = {listCanciones, listCancionesByID, addMusic, updateCanciones, deleteCanciones, signInUser}