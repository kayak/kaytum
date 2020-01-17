---
title: Integrating with Redux/Redux Saga
id: redux-integration
---

Before you can use a model in your components, you have to hook its model's reducers into redux. The same applies for
hooking the model's effects into redux-saga. For such do:

```javascript
import {
  combineModelReducers,
  resuxRootSaga,
} from 'react-resux';
import createSagaMiddleware from 'redux-saga';
import {
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';

import {modelA, modelB} from './models';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(combineReducers({
  ...combineModelReducers([modelA, modelB]),
}), applyMiddleware(sagaMiddleware));

sagaMiddleware.run(() => resuxRootSaga([modelA, modelB]));
```

For more info on the API required for setting redux and saga up, see
[combineModelReducers](api/README.md#combinemodelreducers) and
[resuxRootSaga](api/README.md#resuxrootsaga).
