/**
 * Shared Socket.io instance — avoids circular deps between server.js and controllers.
 */
let _io = null;

const setIo = (io) => { _io = io; };
const getIo = () => _io;

module.exports = { setIo, getIo };
