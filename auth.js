const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');

function register(username, email, password, errorCallback, successCallback) {
    if(password.length < 8){
      const error = {message: "PASSWORD TOO SHORT"};
      errorCallback(error);
    }
    else{
      User.find({'username': username}, (err, result, count) => {
        if(result.length == 0){
          bcrypt.hash(password, 10, function(err, hash){
            const newUser = new User({
              'username': username,
              'email': email,
              'password': hash
            });
            
            newUser.save(function(err, user, count){
              if(err !== null){
                console.log(err);
                const error = {message: "DOCUMENT SAVE ERROR"};
                errorCallback(error);
              }
              else{
                successCallback(newUser);
              }
            });
          });
        }
        else{
          const error = {message: "USERNAME ALREADY EXISTS"};
          errorCallback(error);
        }
      });
    }
  }

  function login(username, password, errorCallback, successCallback) {
    User.findOne({username: username}, (err, user, count) => {
      if(!err && user){
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
          if(passwordMatch === true){
            successCallback(user);
          }
          else{
            const error = {message: "PASSWORDS DO NOT MATCH"};
            errorCallback(error);
          }
        });
      }
      else{
        const error = {message: "USER NOT FOUND"};
        errorCallback(error);
      }
    });
  }
  
  function startAuthenticatedSession(req, user, cb) {
    req.session.regenerate((err) => {
      if(!err){
        req.session.user = user;
      }
      cb(err);
    });
  }
  
  module.exports = {
    startAuthenticatedSession: startAuthenticatedSession,
    register: register,
    login: login
  };