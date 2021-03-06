import express from 'express';
import createError from "http-errors";
import query from "../../db/query";
import log from "../../tools/log";

export default (session_map : any, db : (sql : string, values : any) => Promise<any>) => {
    let router = express.Router();
    router.post('/', async(req, res, next) => {
        if (!req.session || !req.session.sign || !req.session.type) {
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (isNaN(Number(req.body.userID))) {
            next(createError(400, 'User ID Should Be A Number'));
            return;
        }
        const rs : any[] = await db(query.getUserById, [Number(req.body.userID)]);
        if (!rs[0]) {
            log(res.locals.config, db, req.session.userID, "User", Number(req.params.id), "Kick Out", false, "Error: Not Found");
            next(createError(404, 'User Not Found'));
            return;
        }
        if (req.session.type <= rs[0].type && req.session.userID !== rs[0].id) {
            log(res.locals.config, db, req.session.userID, "User", rs[0].id, "Kick Out", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (rs[0].type === 127) {
            log(res.locals.config, db, req.session.userID, "User", rs[0].id, "Kick Out", false, "Error: Unauthorized");
            next(createError(401, 'Unauthorized'));
            return;
        }
        if (res.locals.config.disable_admin_kick_user) {
            log(res.locals.config, db, req.session.userID, "User", rs[0].id, "Kick Out", false, "Error: Disabled");
            next(createError(401, 'Disabled'));
            return;
        }
        const userID = req.session.userID;
        await new Promise(async (resolve, reject) => {
            req.sessionStore!.destroy((await session_map[rs[0].id]), (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
        session_map[rs[0].id] = undefined;

        log(res.locals.config, db, userID, "User", rs[0].id, "Kick Out", true, null);

        res.status(200);
        if (rs[0].id === userID) {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Logout Successfully",
                inf: "Your are logout now",
                home: true
            });
        }
        else {
            res.status(200);
            res.render('notification', {
                code: 200,
                msg: "Logout Successfully",
            });
        }
    });
    return router;
};
