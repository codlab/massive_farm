import express from "express";
import { IncomingHttpHeaders } from "http";

const router = express.Router();
interface Req {
  headers: IncomingHttpHeaders
}


router.get("/devices.json", (req, res) => {
  res.json(result)
})

export default router;
