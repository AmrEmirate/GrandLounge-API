"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = void 0;
const isUser = (req, res, next) => {
    const user = req.user;
    if (!user) {
        res.status(403).send({
            success: false,
            message: "No user found in token"
        });
        return;
    }
    if (user.role !== "USER") {
        res.status(403).send({
            success: false,
            message: `Access denied: Role is ${user.role}, expected CUSTOMER`
        });
        return;
    }
    next();
};
exports.isUser = isUser;
