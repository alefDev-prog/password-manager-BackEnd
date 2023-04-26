"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        res.json("Not authenticated");
    }
    else {
        console.log("authenticated");
        next();
    }
}
exports.default = isAuthenticated;
