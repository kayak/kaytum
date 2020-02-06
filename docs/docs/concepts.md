---
title: Concepts
id: concepts
---

Redux-data-model has only a few core concepts.

## Model

Models are the most basic data structure/abstraction in redux-data-model. They require a set of options to be provided
when initializing them.

#### Example:
```javascript
import {Model} from 'redux-data-model';
import _ from 'lodash';

async function fetchApi(url) {
  return await fetch(url).then(response => response.json());
}

export const userModel = new Model({
    // Mandatory options
    namespace: 'users',
    state: {
        loading: {},
        data: {},
    },

    // Optional options
    selectors: {
        loadingByUser: (state, userId) => _.get(state, `loading[${userId}]`, true),
        userById: (state, userId) => _.get(state, `data[${userId}]`),
    },
    reducers: {
        saveUser(state, {data, userId}) {
          state.loading[userId] = false;
          state.data[userId] = data;
        },
    },
    effects: {
        *fetchUser({userId}, {call, put}, {saveUser}) {
            try {
                const data = yield call(fetchApi, `http://jsonplaceholder.typicode.com/users/${userId}`);
                yield put(saveUser({data, userId}));
             } catch (error) {
                console.log(error)
             }
        },
    },
});
```

A model consists of the set of state, selectors, actions, reducers and asynchrounous workflows (i.e. effects) that
are related to a given entity (e.g.. users). Below you can find a more in depth description on the many options
that can be used during a model instantiation.

### Model Options

An object with a few key-value pairs. Being [namespace](api/interfaces/modeloptions.md#namespace) and
[state](api/interfaces/modeloptions.md#state) mandatory, while
[selectors](api/interfaces/modeloptions.md#optional-selectors),
[reducers](api/interfaces/modeloptions.md#optional-reducers),
[effects](api/interfaces/modeloptions.md#optional-effects) are optional. For more info see
[this](api/interfaces/modeloptions.md).

### Models's API

For more info see [this](api/classes/model.md).
