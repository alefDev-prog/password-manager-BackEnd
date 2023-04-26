"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function corsMiddle(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
    next();
}
exports.default = corsMiddle;
