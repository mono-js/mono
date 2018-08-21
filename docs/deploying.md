# Deploying

Since we use NPM scripts to run, deploying on known platforms is pretty straightforward.

Make sure to follow these checks before deploying to production:

1. `conf/production.js`
    -  `mono.jwt.secret` is set.
    - `mono.http.logLevel` is set (default to `'combined'` if not defined in `conf/application.js`).
    - `mono.log.level` is set (default to `'verbose'` if not defined in `conf/application.js`), you can also use `MONO_LOG_LEVEL` environment variable.
    - Make sure to configure also `mono.log`, we recommend to use the HTTP service in production to centralize logs.
2. You can run `npm start` without issue on your local machine.
3. Make sure your routes for testing or development have the `env` key set.


## Heroku

When deploying to [Heroku](https://www.heroku.com), you need to set up `HOST` and `NODE_ENV` environments to the following:

- `HOST`: `0.0.0.0`
- `NODE_ENV`: `production`
