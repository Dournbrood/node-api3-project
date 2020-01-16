// code away!
const server = require("./server");

const port = process.env.PORT || 4004;
server.listen(port, () => {
    console.log(`\n*** ~ Server listening at http://localhost:${port} ~ ***\n`);
})