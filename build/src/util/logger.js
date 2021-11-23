"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logerror = exports.loginfo = void 0;
function prefixDate(message) {
    return `[${new Date().toISOString()}] ${message}`;
}
function loginfo(message, ...optionalParams) {
    message = prefixDate(message);
    console.log(message, ...optionalParams);
}
exports.loginfo = loginfo;
function logerror(message, ...optionalParams) {
    message = prefixDate(message);
    console.error(message, ...optionalParams);
}
exports.logerror = logerror;
//# sourceMappingURL=logger.js.map