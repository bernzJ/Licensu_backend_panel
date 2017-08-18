import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import ip from 'ip';
import mysql from 'promise-mysql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import validator from 'validator';

import config from './db_config';
import * as helpers from './helpers/index';


const panel = express();
const panelPort = 4210;

panel.use(bodyParser.json());
panel.use(bodyParser.urlencoded({
    extended: false
}));
panel.use(session({
    genid: (req) => {
        return helpers.UIID.genSingleUseToken() // use UUIDs for session IDs 
    },
    secret: 'nLeQqdmBb8WXX0',
    resave: false,
    saveUninitialized: true,
    //if this is set to true, it require https to save the session.
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
panel.use(express.static(__dirname + '/assets'));


panel.set('views', path.join(__dirname, 'views'));
panel.set('view engine', 'ejs');
panel.engine('html', require('ejs').renderFile);


panel.get('/', (req, res) => {
    /*if (!req.session || !req.session.authenticated) {
        res.sendStatus(404);
        return;
    }*/

    let queryParam = req.query.pid;
    let CRUD = req.query.CRUD;

    if ((queryParam != null && !validator.isNumeric(queryParam)) && CRUD != 'c') {
        res.sendStatus(404);
        return;
    }

    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query((CRUD == null) ? 'SELECT p.*, t.* FROM programs p LEFT JOIN tokens t on p.pid = t.id WHERE p.pid = ?' : 'SELECT * FROM programs WHERE pid = ?', [queryParam]);
    }).then((rows) => {
        let longToIP = (lo) => {
            return ip.fromLong(lo);
        };
        if (rows[0] == null && CRUD != 'c')
            return res.sendStatus(404);
        return connection.query('SELECT pid,name FROM programs').then((rows2) => {
            if (connection && connection.end) connection.end();
            res.render('product', {
                clients: rows,
                jwt: jwt,
                sidebarIDS: rows2,
                selectedID: queryParam,
                longToIP: longToIP,
                CRUD: CRUD,
            });
        });
    });
});

panel.get('/login', (req, res) => {
    /*bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash("stronk123", salt, function(err, hash) {
            console.log(hash);
        });
    });*/
    res.render('login');
});

panel.post('/login', (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) return res.sendStatus(400)
    let connection;
    let password = req.body.password;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('SELECT * FROM panel_users WHERE email = ?', [req.body.email]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        if (rows[0] != null) {
            if (bcrypt.compareSync(password, rows[0].password)) {
                req.session.authenticated = true;
                res.redirect('/?pid=1');
                return;
            }
        }
        res.sendStatus(400);
    });
});

// crud for create program
panel.post('/createproduct', (req, res) => {
    //if (!req.body || !req.session || !req.session.authenticated) return res.sendStatus(404)
    let daysPlans = new Buffer(req.body.dayPlans).toString('base64');
    let hwidPlans = new Buffer(req.body.hwidPlans).toString('base64');

    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('INSERT INTO programs (name, version, md5, days_plans, hwid_plans) VALUES (? , ? , ? , ? , ?)', [req.body.name, req.body.version, req.body.md5, daysPlans, hwidPlans]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        res.json({
            success: rows.message
        });
    });
});

panel.post('/updateproduct', (req, res) => {
    //if (!req.body || !req.session || !req.session.authenticated) return res.sendStatus(404)
    let daysPlans = new Buffer(req.body.dayPlans).toString('base64');
    let hwidPlans = new Buffer(req.body.hwidPlans).toString('base64');

    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('UPDATE programs SET name = ?, version = ?, md5 = ?, days_plans = ?, hwid_plans = ? WHERE id = ?', [req.body.name, req.body.version, req.body.md5, daysPlans, hwidPlans, req.body.id]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        res.json({
            success: rows.message
        });
    });
});

panel.post('/deleteproduct', (req, res) => {
    //if (!req.body || !req.session || !req.session.authenticated) return res.sendStatus(404)
    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('DELETE FROM programs WHERE pid = ?', [req.body.id]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        res.json({
            success: rows.message
        });
    });
});

/* No longer needed
panel.post('/readprograminfo', (req, res) => {
    if (!req.body || !req.session || !req.session.authenticated) return res.sendStatus(404)
    let connection;
    mysql.createConnection(config).then(() => {
        return connection.query('SELECT * FROM program');
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        if (rows[0] != null) {
            res.json({
                program: rows[0]
            });
        }
    });
});

panel.post('/updateprograminfo', (req, res) => {
    if (!req.body || !req.body.md5 || !req.body.appversion || !req.body.updatepath || !req.session || !req.session.authenticated) return res.sendStatus(404)

    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.changeUser({ database: 'xbrute_admin' });
    }).then(() => {
        return connection.query('UPDATE program SET md5 = ?, program_version = ?, update_path = ?', [req.body.md5, req.body.appversion, req.body.updatepath]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        if (rows.insertId != null) {
            res.json({
                success: 'Successfully udpated the program information.'
            });
            return;
        }
        res.sendStatus(400);
    });

});
*/

panel.post('/createlicense', (req, res) => {
    //if (!req.body || !req.body.plan || !req.body.access || !req.body.ipPlan || !req.session || !req.session.authenticated || req.body.app_id) return res.sendStatus(404)
    let connection;
    let expiration = (req.body.plan == '-1') ? null : {
        expiresIn: req.body.plan + ' days' /*lib will calc for us.*/
    };
    let shh = helpers.UIID.genSingleUseToken();
    let token = jwt.sign({
        data: {
            acces: req.body.app_id, // single app
            daysLeft: req.body.plan, //days left, -1 unlimited
            banned: { reason: false }, //format isbanned:reason
            MD5: { md5: 'keyboardcat', app_version: '0.0.0.1' }, // file integrity check format : md5:appversion
            IPBAN: req.body.ipPlan, // How many ips/connection, format ip:conn
            IPS: [], //contains ip2long joined by dots .
            HWID: [], //gen when first ran, then set. this cannot be changed.(at least from them) format : hwid.hwid.hwid
        }
    }, shh, expiration);

    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('INSERT INTO tokens (id, data, shh) VALUES ?', [[[req.body.app_id, token, shh]]]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        if (rows.insertId != null) {
            res.json({
                Token: token
            });
            return;
        }
        res.sendStatus(400);
    });
});

panel.post('/readlicense', (req, res) => {
    //if (!req.body || !req.body.id || !req.session || !req.session.authenticated) return res.sendStatus(404)
    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('SELECT data FROM tokens WHERE shh = ?', [req.body.id]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        if (rows[0] != null) {
            res.json({
                key: rows[0].data
            });
            return;
        }
        res.sendStatus(400);
    });
});


panel.post('/updatelicense', (req, res) => {
    //if (!req.body || !req.body.old_token || !req.body.value || !req.body.OG || !req.body.pk || !req.session || !req.session.authenticated) return res.sendStatus(404)

    let old_token = JSON.parse(req.body.old_token);
    let currentDaysLeft = old_token.data.daysLeft;
    
    //delete the expire shit
    delete old_token.exp;
    delete old_token.iat;
    //switch case over name to determine data type
   
    switch (req.body.name) {
        case 'daysleft':
            if (!validator.isNumeric(req.body.value)) {
                res.sendStatus(404);
                return;
            }
            old_token.data.daysLeft = req.body.value;
            currentDaysLeft = req.body.value;
            break;
        case 'banned':
            if (req.body.value == 'false') {
                old_token.data.banned =  {'reason': false};
            } else {
                old_token.data.banned = {'Admin Ban.': true};
            }
            break;
        case 'ipban':
            old_token.data.IPBAN = req.body.value;
            break;
        case 'resetips':
            old_token.data.IPS = [];
            break;
        case 'hwid':
            old_token.data.HWID = req.body.value;
            break;
        default:
            res.sendStatus(404);
            break

    }

    let shh = helpers.UIID.genSingleUseToken();
    let token = jwt.sign(old_token, shh, {
        expiresIn: currentDaysLeft + ' days' /*lib will calc for us.*/
    });

    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('SELECT old_data FROM tokens WHERE shh = ?', [req.body.pk]);
    }).then((rows) => {
        if (rows[0] == null) {
            if (connection && connection.end) connection.end();
            res.sendStatus(404);
            return;
        }
        let params = [{
            old_data: req.body.OG,
            data: token,
            shh: shh
        }, {
            shh: req.body.pk
        }];
        if (rows[0].old_token != null) delete params[0].old_token;

        return connection.query('UPDATE tokens SET ? WHERE ?', params).then((rows2) => {
            if (connection && connection.end) connection.end();
            if (rows2.affectedRows != null) {
                res.json({
                    success: 'Successfully updated key !',
                    Token: token
                });
                return;
            }
            res.sendStatus(400);
        });
    });
});

panel.post('/deletelicense', (req, res) => {
    //if (!req.body || !req.body.id || !req.session || !req.session.authenticated) return res.sendStatus(404)

    let connection;
    mysql.createConnection(config).then((conn) => {
        connection = conn;
        return connection.query('DELETE FROM tokens WHERE shh = ?', [req.body.id]);
    }).then((rows) => {
        if (connection && connection.end) connection.end();
        if (rows.affectedRows != null) {
            res.json({
                success: 'Successfully deleted !'
            });
            return;
        }
        res.sendStatus(400);
    });
});

let panelServer = panel.listen(panelPort, '0.0.0.0', function () {
    let host = panelServer.address().address
    let port = panelServer.address().port

    console.log('Panel app listening at http://%s:%s', host, port)
});