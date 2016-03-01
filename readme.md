## koa-router-schema

koa-router-schema is a schema validate middleware for [koa-router](https://github.com/alexmingoia/koa-router).

### Install

    npm i koa-router-schema --save

### Usage

```
schema(schemaName, schemaObj)
```

see [another-json-schema](https://github.com/nswbmw/another-json-schema).

### Example

```
'use strict';

var app = require('koa')();
var request = require('supertest');
var router = require('koa-router')();
var schema = require('./');
var bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(router.routes());

router.post('/', schema('indexSchema', {
  request: {
    body: {
      user: {
        name: { type: 'string', pattern: /^[0-9a-zA-Z_]{6,}$/ },
        age: { type: 'number', range: [18, 100] },
        gender: { type: 'string', enum: ['male', 'female'] }
      },
      content: { type: 'string', validate: function validateContent(content) {
        return !content.match(/fuck/);
      } }
    }
  }
}), function *() {
  this.body = 'Hello, world';
});

request(app.callback())
  .post('/')
  .send({
    user: {
      name: 'nswbmw',
      age: 1
    }
  })
  .expect(400)
  .end(function (err, res) {
    if (err) return done(err);
    assert.equal(res.text, '($.request.body.user.age: 1) ✖ (range: 18,100)');
    done();
  });
```

More examples see [test](./test.js).

### Test

```
npm test
```

### License

MIT
