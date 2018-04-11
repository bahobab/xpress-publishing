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

artistRouter.param('id', (req,res, next, id) => {
    const query = `SELECT *
                        FROM Artist
                            WHERE id = ${Number(id)};`

    db.get(query, (err, artist) => {
        if (err) next(err);
        if (artist) {
            req.artist = artist;
            next();
        }
        res.status(404).send(); // or res.sendStatus(404)
    });
});

artistRouter.get('/:id', (req, res, next) => {
    res.status(200).json({artist: req.artist});
});

artistRouter.post('/', (req, res, next) => {
    const newArtist = req.body.artist;
    if (!(newArtist.name && newArtist.dateOfBirth && newArtist.biography)) {
        res.sendStatus(400);
    } else {
        if (newArtist.isCurrentlyEmployed === undefined) newArtist.isCurrentlyEmployed = 1;
        const {name, dateOfBirth, biography, isCurrentlyEmployed} = newArtist;
        // try {

        const query = `INSERT INTO Artist
                           (name, date_of_birth, biography, is_currently_employed)
                               VALUES ($name, $dob, $bio, $ice);`;
        const values = {
            $name: name,
            $dob: dateOfBirth,
            $bio: biography,
            $ice: isCurrentlyEmployed
        };

        // const query = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ('${name}', '${dateOfBirth}', '${biography}', ${isCurrentlyEmployed});`;

        db.run(query, values, err => {
        // db.run(query, err => {
            if (err) {
                next(err);
            } else {
                // newArtist.id = lastID;
                console.log('>>>>', lastID);
                db.get(`SELECT * FROM Artist WHERE id=${lastID}`, (error, artist) => {
                    if (error) next(error);
                    res.status(201).json({artist});
                })
            }
        });
        // }
        // catch(e) {
        //     console.log(e);
        // }
    };
});

module.exports = artistRouter;