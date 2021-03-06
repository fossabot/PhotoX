import express from 'express';
import query from "../../db/query";
import createError from "http-errors";
import {create as ps_create} from "../../tools/password";
import {AllHtmlEntities} from 'html-entities';
import log from "../../tools/log";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        if (res.locals.config.disable_admin_send_message) {
            next(createError(401, 'Disabled'));
            return;
        }
        res.render('new_message', { pre: req.query.id });
    });

    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (!req.body.content) {
            next(createError(400, 'Content Required'));
            return;
        }
        if (!req.body.send_button || (req.body.send_button !== "Send" && req.body.send_button !== "Send Html")) {
            next(createError(400, 'Bad Request'));
            return;
        }
        if (req.body.send_button === "Send Html" && req.session.type !== 127) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        const rs : any[] = await db(query.getUserById, [Number(req.body.id)]);
        if (!rs[0]) {
            log(res.locals.config, db, req.session.userID, "User", Number(req.body.id), "Send Message", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (res.locals.config.disable_admin_send_message) {
            next(createError(401, 'Disabled'));
            return;
        }
        const id : number = (await db(query.addMessage, [req.session.userID, req.body.id ? req.body.id : null, req.body.send_button === "Send" ? new AllHtmlEntities().encode(req.body.content).replace(/\n/g, "<br>") : req.body.content])).insertId;
        log(res.locals.config, db, req.session.userID, "Message", id, "Create", true, "Content: " + req.body.content + ", Html: " + (req.body.send_button === "Send" ? "False" : "True"));
        log(res.locals.config, db, req.session.userID, "User", req.body.id ? Number(req.body.id) : null, "Send Message", true, "Message ID: " + id.toString());
        res.render('notification', {
            code: 200,
            msg: "Send Successfully",
            bk2: true
        });
    });

    return router;
};
