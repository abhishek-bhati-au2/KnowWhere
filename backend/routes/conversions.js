var express = require("express");
var videoQueue = require ("../queues/videoQueue");
var router = express.Router();
const models = require("../models");
var multer = require("multer");
const fs = require("fs").promises;
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    cb(null, `${+new Date()}_${file.originalname}`);
  }
});
const upload = multer({ storage });
router.get("/", async (req, res, next) => {
  const conversions = await models.VideoConversion.findAll();
  res.json(conversions);
});
router.post("/", upload.single("video"), async (req, res, next) => {
  const data = { ...req.body, filePath: req.file.path };
  const conversion = await models.VideoConversion.create(data);
  res.json(conversion);
});
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const conversions = await models.VideoConversion.findAll({ where: { id } });
  const conversion = conversions[0];
  try {
    await fs.unlink(`${__dirname}/../${conversion.filePath}`);
    if (conversion.convertedFilePath) {
      await fs.unlink(`${__dirname}/../files/${conversion.convertedFilePath}`);
    }
  } catch (error) {
  } finally {
    await models.VideoConversion.destroy({ where: { id } });
    res.json({});
  }
});
router.put("/cancel/:id", async (req, res, next) => {
  const id = req.params.id;
  const conversion = await models.VideoConversion.update(
    { status: "cancelled" },
    {
      where: { id }
    }
  );
  res.json(conversion);
});
router.get("/start/:id", async (req, res, next) => {
  const id = req.params.id;
  const conversions = await models.VideoConversion.findAll({ where: { id } });
  const conversion = conversions[0];
  const outputFormat = conversion.outputFormat;
  const filePath = path.basename(conversion.filePath);
  await videoQueue.add({ id, path: filePath, outputFormat });
  res.json({});
});
module.exports = router;