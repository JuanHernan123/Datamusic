const express = require('express');
const router = express.Router();
const { listCanciones, listCancionesByID, addMusic, updateCanciones, deleteCanciones, signInUser } = require('../controllers/canciones');

router.get('/', listCanciones); // http://localhost:3000/api/v1/canciones
router.get('/:id', listCancionesByID); // http://localhost:3000/api/v1/canciones/?
router.post('/', signInUser); 
router.put('/', addMusic); 
router.patch('/:id', updateCanciones); 
router.delete('/:id', deleteCanciones);

module.exports = router;