const express = require('express');
const artistRouter = express.Router();

const sqlite3 = require('sqlite3');

// const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database in artists');
  });

artistRouter.get('/', (req, res, next) => {
    const query = `SELECT * FROM Artist WHERE is_currently_employed = 1;`;
    
    db.all(query, (err, artists) => {
        if (err) next(err);
        // console.log('GET /api/artists >>>', artists, err);
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
                
                db.all(`SELECT * FROM Artist;`, (error, artists) => { //  WHERE id=${this.lastID}
                    if (error) next(error);
                    // console.log('artists>>>>', artists[artists.length-1]);
                    res.status(201).json({artist:artists[artists.length-1]});
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



//The extension "React Developer Tools" is not allowed to access about:neterror?e=connectionFailure&u=http%3A//localhost%3A400/&c=UTF-8&f=regular&d=Firefox%20can%E2%80%99t%20establish%20a%20connection%20to%20the%20server%20at%20localhost%3A400.