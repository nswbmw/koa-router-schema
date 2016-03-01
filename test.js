'use strict';

var request = require('supertest');
var assert = require('assert');

var app = require('koa')();
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

describe('should throw user error', function () {
  it('user ✖ (type: object)', function (done) {
    request(app.callback())
      .post('/')
      .send({ user: 'asdf' })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, '($.request.body.user: "asdf") ✖ (type: object)');
        done();
      });
  });

  it('user.name ✖ (pattern: /^[0-9a-zA-Z_]{6,}$/)', function (done) {
    request(app.callback())
      .post('/')
      .send({ user: { name: 'a' } })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, '($.request.body.user.name: "a") ✖ (pattern: /^[0-9a-zA-Z_]{6,}$/)');
        done();
      });
  });

  it('user.age ✖ (range: 18,100)', function (done) {
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
  });

  it('user.gender ✖ (enum: male,female)', function (done) {
    request(app.callback())
      .post('/')
      .send({
        user: {
          name: 'nswbmw',
          age: 99,
          gender: 'man'
        }
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, '($.request.body.user.gender: "man") ✖ (enum: male,female)');
        done();
      });
  });
});

describe('should throw content error', function () {
  it('content ✖ (validate: validateContent)', function (done) {
    request(app.callback())
      .post('/')
      .send({
        user: {
          name: 'nswbmw',
          age: 99,
          gender: 'male'
        },
        content: 'fuck'
      })
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, '($.request.body.content: "fuck") ✖ (validate: validateContent)');
        done();
      });
  });
});

describe('should return 200', function () {
  it('user && content', function (done) {
    request(app.callback())
      .post('/')
      .send({
        user: {
          name: 'nswbmw',
          age: 99,
          gender: 'male'
        },
        content: 'aaa'
      })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        assert.equal(res.text, 'Hello, world');
        done();
      });
  });
});