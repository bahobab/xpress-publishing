const express = require('express');
const artistRouter = express.Router();

const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');

artistRouter.get('/', (req, res, next) => {
    const query = `SELECT *
                    FROM Artist
                        WHERE is_currently_employed = 1;`;
    
    db.all(query, (err, artists) => {
        if (err) next(err);
        // console.log('>>>', artists);
        res.status(200).json({artists});
    })
});


module.exports = artistRouter;