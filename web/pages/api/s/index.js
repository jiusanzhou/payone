const { pathToRegexp, compile } = require("path-to-regexp");


export default function handler(req, res) {    
    res.status(200).json({
        error: "API endpoint not found"
    });
}