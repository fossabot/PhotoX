import express from 'express';
import query from "../../../db/query";
import createError from "http-errors";
import {AllHtmlEntities} from 'html-entities';
import log from "../../../tools/log";

export default (db : (sql : string, values : any) => Promise<any>) => {
    const router = express.Router();
    router.get('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            res.redirect('/');
            return;
        }
        if (isNaN(Number(req.params.id)) || Number(req.params.id) === 0) {
            next(createError(400, 'Category ID Should Be A Nonzero Number'));
            return;
        }
        let rs = await db(query.getCategoryById, [req.params.id]);
        if (!rs[0]) {
            log(res.locals.config, db, req.session.userID, "Category", Number(req.params.id), "Edit", false, "Error: Not Found");
            next(createError(404, 'Category Not Found'));
            return;
        }
        if (req.session.type <= rs[0].owner_type && req.session.userID !== Number(rs[0].owner)) {
            log(res.locals.config, db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_edit_category) {
            log(res.locals.config, db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Disabled");
            next(createError(400, 'Disabled'));
            return;
        }
        res.render('edit_category', {c: rs[0]});
    });

    router.post('/:id', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.params.id)) || Number(req.params.id) === 0) {
            next(createError(400, 'Category ID Should Be A Nonzero Number'));
            return;
        }
        if (!req.body.name) {
            log(res.locals.config, db, req.session.userID, "Category", Number(req.params.id), "Edit", false, "Error: Bad Request");
            next(createError(400, 'Name Required'));
            return;
        }
        let rs = await db(query.getCategoryById, [Number(req.params.id)]);
        if (!rs[0]) {
            log(res.locals.config, db, req.session.userID, "Category", Number(req.params.id), "Edit", false, "Error: Not Found");
            next(createError(404, 'Category Not Found'));
            return;
        }
        if (req.session.type <= rs[0].owner_type && req.session.userID !== Number(rs[0].owner)) {
            log(res.locals.config, db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_edit_category) {
            log(res.locals.config, db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Disabled");
            next(createError(400, 'Disabled'));
            return;
        }
        try {
            await db(query.updateCategory, [req.body.name, rs[0].id]);
            log(res.locals.config, db, req.session.userID, "Category", rs[0].id, "Edit", true, null);
        } catch(e) {
            if (e.code === 'ER_DUP_ENTRY') {
                log(res.locals.config, db, req.session.userID, "Category", rs[0].id, "Edit", false, "Error: Exists");
                next(createError(400, 'Category Name ' + req.body.name + ' Exists'));
            } else throw e;
            return
        }
        res.render('notification', {
            code: 200,
            msg: "Update Successfully",
            bk2: true
        });
    });

    return router;
};
