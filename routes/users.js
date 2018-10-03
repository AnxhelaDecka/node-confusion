'use strict';

var express = require('express');
var User = require('../models/user');

var router = express.Router();
router.use(express.json());

/* GET users listing. */
router.get('/', function(req, res) {
  User.find({})
    .then((users) => {
      res.status(200).json({
        users: users
      });
    })
});


router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
    .then((user) => {
      if (user) {
        let error = new Error(`User ${ req.body.username } already registered`);

        error.status = 403;
        next(error);
      } else {
        return User.create({
          username: req.body.username,
          password: req.body.password
        });
      }
    })
    .then((user) => {
      res.status(200).json({
        status: 'Registration successful',
        user: user
      });
    }, (error) => {
      next(error);
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/login', (req, res, next) => {
  if (req.session.user) {
    res.status(200).json({
      status: 'You are authenticated!'
    });
  } else {
    User.findOne({username: req.body.username})
      .then((user) => {
        if (user) {
          if (user.password === req.body.password) {
            req.session.user = 'authenticated';
            res.status(200).json({
              status: 'You are authenticated!'
            });
          } else if (user.password !== req.body.password) {
            let error = new Error('Your password is incorrect!');

            error.status = 403;
            return next(error);
          }
        } else {
          let error = new Error(`Username ${ req.body.username } does not exists!`);

          error.status = 403;
          return next(error);
        }
      })
      .catch((error) => {
        next(error);
      });
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    let error = new Error(`You are not logged in`);

    error.status = 403;
    next(error);
  }
});

module.exports = router;