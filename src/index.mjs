import express from 'express';
import { LowSync, JSONFileSync } from 'lowdb';
import lodash from 'lodash';
import cors from 'cors';

const adapter = new JSONFileSync("db/database.json");
const db = new LowSync(adapter);
const app = express();

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}))

db.read();

db.chain = lodash.chain(db.data);

app.get("/items", function(_, response) {
  const items = db.data.items;
  response.send(items.map(item => ({
    id: item.id,
    mainPhoto: item.mainPhoto,
    shortDescription: item.shortDescription,
    address: db.chain.get('users').find({ id: item.userId }).value().address,
  })));
});

app.get("/items/:id", function(req, response) {
  const id = parseInt(req.params.id);
  const item = db.chain.get('items').find({ id }).value();
  const user = db.chain.get('users').find({ id: item.userId }).value();

  response.send({
    ...item,
    user: {
      name: user.name,
      phoneNumber: user.phoneNumber,
      address: user.address,
    }
  });
});

const listener = app.listen(8080, function() {
  console.log("Listening on port " + listener.address().port);
});
