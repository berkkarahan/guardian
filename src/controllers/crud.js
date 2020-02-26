import express from "express";

export function initBase(Collection) {
  // ======
  // Create
  // ======
  const create = async (req, res) => {
    const newEntry = req.body;
    await Collection.create(newEntry, (e, newEntry) => {
      if (e) {
        console.log(e);
        res.sendStatus(500);
      } else {
        res.send(newEntry);
      }
    });
  };

  // =========
  // Read many
  // =========
  const readMany = async (req, res) => {
    const query = req.body.query || {};

    await Collection.find(query, (e, result) => {
      if (e) {
        res.status(500).send(e);
        console.log(e.message);
      } else {
        res.send(result);
      }
    });
  };

  // ========
  // Read one
  // ========
  const readOne = async (req, res) => {
    const { id } = req.body;

    await Collection.findById(id, (e, result) => {
      if (e) {
        res.status(500).send(e);
        console.log(e.message);
      } else {
        res.send(result);
      }
    });
  };

  // ======
  // Update
  // ======
  const update = async (req, res) => {
    const changedEntry = req.body;
    await Collection.update({ _id: req.body.id }, { $set: changedEntry }, e => {
      if (e) res.sendStatus(500);
      else res.sendStatus(200);
    });
  };

  // ======
  // Remove
  // ======
  const remove = async (req, res) => {
    Collection.remove({ _id: req.body.id }, e => {
      if (e) res.status(500).send(e);
      else res.sendStatus(200);
    });
  };

  // ======
  // Routes
  // ======

  const router = express.Router();

  router.post("/create", create);
  router.post("/all", readMany);
  router.post("/", readOne);
  router.post("/update", update);
  router.post("/delete", remove);

  return {
    router: router,
    controllers: {
      create: create,
      select: readMany,
      selectOne: readOne,
      update: update,
      delete: remove
    }
  };
}
