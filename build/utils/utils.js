"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAccount = void 0;
function findAccount(accounts, accountId) {
    const response = accounts.filter(a => a._id == accountId);
    return response;
}
exports.findAccount = findAccount;
