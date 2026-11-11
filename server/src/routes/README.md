# Routes

One file per module. Each file exports `{ path, createRouter }`; `src/app.js` mounts every file automatically.

```js
const express = require('express');

module.exports = {
  path: '/api/children/:childId/events',
  createRouter(db) {
    const router = express.Router({ mergeParams: true }); // mergeParams gives access to :childId
    router.get('/', (req, res) => { /* ... */ });
    return router;
  },
};
```
