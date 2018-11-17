'use strict';
// const Promise = require('bluebird');

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
          // next();
        })
    }
  });
};
