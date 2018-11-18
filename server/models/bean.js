'use strict';

module.exports = function(Bean) {
  Bean.afterRemote('find', (ctx, model, next) => {
    let { draw } = ctx.req.query;

    if (draw) {
      return Bean.count(ctx.args.filter.where)
        .then(totalCount => {
          ctx.result = {
            total: totalCount,
            data: model,
          };
        })
    }

    next();
  });
};
