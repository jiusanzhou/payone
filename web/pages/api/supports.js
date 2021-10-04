import Server from "../../lib/server";

const svr = new Server();

export default function handler(req, res) {
    res.status(200).json(svr.listSupported());
}