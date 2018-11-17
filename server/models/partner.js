'use strict';
// const Promise = require('bluebird');
const SALT_WORK_FACTOR = 10;
const crypto = require('crypto');
// bcrypt's max length is 72 bytes;
// See https://github.com/kelektiv/node.bcrypt.js/blob/45f498ef6dc6e8234e58e07834ce06a50ff16352/src/node_blf.h#L59
const MAX_PASSWORD_LENGTH = 72;
const bcrypt = require('bcryptjs');

module.exports = function(Partner) {
  Partner.afterRemote('find', (ctx, model, next) => {
    let { draw } = ctx.req.query;

    if (draw) {
      return Partner.count(ctx.args.filter.where)
        .then(totalCount => {
          ctx.result = {
            total: totalCount,
            data: model,
          };
        })
    }

    next();
  });

  Partner.register = (fields) => {
    let {
      username,
      password,
    } = fields;

    return Partner.create({
      partnerName: fields.partnerName,
      address: fields.address,
      location: fields.location,
      username: fields.username,
      passwd: hashPassword(fields.passwd),
    })
  }

  const hashPassword = function(plain) {
    let salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    return bcrypt.hashSync(plain, salt);
  };

  const checkPassword = (plain) => {
    return bcrypt.compare(plain, hash);
  };

  Partner.login = ({ username, password }) => {
    console.log(username, password);
    return Partner.find({ where: { username: username }})
      .then(partner => {
        //checkPassword(password, partner.passwd)
        console.log(partner[0].passwd === password, partner[0].passwd, password);
       if (partner[0].passwd === password) {
         return Promise.resolve(partner[0]);
       }

       return Promise.reject(false)
      })
  };
};
