import express from 'express';
import passport from 'passport';
import { Strategy } from 'passport-saml';
import fs from 'fs';
import path from 'path';

export const samlPassport = passport;

passport.serializeUser<any>((user, done) => {
    done(null, user);
});

passport.deserializeUser<any>((user, done) => {
    done(null, user);
});

const samlStrategy = new Strategy(
    {
        callbackUrl: 'http://localhost:3000/login/callback',
        entryPoint: 'http://localhost:7000/saml/sso',

        issuer: 'saml_test_issuer',
        identifierFormat: undefined,

        cert: fs.readFileSync('idp-public-cert.pem', 'utf8'),
        validateInResponseTo: false,
        disableRequestedAuthnContext: true,
    },
    (profile, done) => done(null, profile)
);

const router = express.Router();
const authModule = passport.authenticate('saml', {
    failureRedirect: '/login/fail',
    keepSessionInfo: true,
});

console.log(JSON.stringify(samlStrategy, null, '  '));
passport.use(samlStrategy);

router.get('/login', authModule, (req, res) => {
    res.redirect('/');
});

router.post('/login/callback', authModule, (req, res) => {
    console.log('/login/callback', req.user);
    if ((req as any).session?.requestUrl) {
        res.redirect((req as any).session.requestUrl);
        delete (req as any).session.requestUrl;
    } else {
        res.redirect('/');
    }
});

router.get('/login/fail', (req, res) => {
    res.status(401).send('Login failed');
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

const allowPaths = ['/stylesheets', '/images', '/javascript', '/favicon.ico'];

router.all(['/*'], (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log(`Authenticated:${JSON.stringify(req.user)}`);
        return next();
    }

    if (req.url === '/') {
        return next();
    }

    if (allowPaths.some((path) => req.url.startsWith(path))) {
        return next();
    }

    console.log(`${req.url} Not authenticated. Redirect to /login`);
    (req as any).session.requestUrl = req.url;
    return authModule(req, res, next);
});

export default router;