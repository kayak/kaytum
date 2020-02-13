---
title: API - Interfaces - ModelOptions
sidebar_label: ModelOptions
id: api-interfaces-model-options
---

# Redux-Data-Model API Reference Guide

This reference guide lists all methods exposed by redux-data-model. Contributions like linguistic improvements, adding
more details to the descriptions or additional examples are highly appreciated! Please note that the docs are
generated from source.

[redux-data-model](../README.md) › [ModelOptions](modeloptions.md)

# Interface: ModelOptions

Model options are used for initialising a [Model](../classes/model.md) instance.

## Hierarchy

* **ModelOptions**

## Index

### Properties

* [effects](modeloptions.md#optional-effects)
* [namespace](modeloptions.md#namespace)
* [reducers](modeloptions.md#optional-reducers)
* [selectors](modeloptions.md#optional-selectors)
* [state](modeloptions.md#state)

## Properties

### `Optional` effects

• **effects**? : *EffectMap*

*Defined in [packages/redux-data-model/src/model.ts:170](https://github.com/kayak/redux-data-model/blob/2a860dd/packages/redux-data-model/src/model.ts#L170)*

Effects are functions used for performing asynchronous state changes. An effect will be triggered whenever
an action is dispatched, which contains an actionType equal to modelNamespace.effectName. They are wrapped
by a [takeEvery](https://redux-saga.js.org/docs/api/#takeeverypattern-saga-args) effect, from redux-saga.
An effect function receives an action, an object with saga's effects, and the action creators as arguments
respectively. For a list of saga's effects available to you see
[this](https://redux-saga.js.org/docs/api/#effect-creators).
The saga effects won't include takeLeading, takeLatest, and takeEvery blocking effects.

**`example`** 
*fetchPostsByUser({ userId }, sagaEffects, actionCreators) {
  try {
    const data = yield sagaEffects.call(fetchApi, `http://jsonplaceholder.typicode.com/posts/?user=${userId}`);
    yield sagaEffects.put(actionCreators.saveUser({data, userId}));
  } catch (error) {
    console.log(error)
  }
},

___

###  namespace

• **namespace**: *string*

*Defined in [packages/redux-data-model/src/model.ts:103](https://github.com/kayak/redux-data-model/blob/2a860dd/packages/redux-data-model/src/model.ts#L103)*

The namespace of a model will prefix all its reducers and effects' action types. This value must be unique
and, as a matter of fact, redux-data-model will enforce it. The namespace is effectively an object's path
in which the state will be stored, which can introduce new nesting levels in the store. This might be
useful if you need to put redux-data-model's data somewhere else that not on the root level of the store.

**`example`** namespace: 'pageA'

**`example`** namespace: 'pageB'

**`example`** namespace: 'projectA.pageA'

**`example`** namespace: 'projectA.pageB'

___

### `Optional` reducers

• **reducers**? : *ReducerMap*

*Defined in [packages/redux-data-model/src/model.ts:150](https://github.com/kayak/redux-data-model/blob/2a860dd/packages/redux-data-model/src/model.ts#L150)*

Reducers are functions used for synchronously changing the current state of a given model. A reducer will
be triggered whenever an action is dispatched, which contains a type equal to modelNamespace.reducerName.
A reducer function receives the entire state and the action as arguments respectively. It shouldn't return
data, like vanilla reducers. Instead it should change the state argument in place. Redux-data-model uses
[immer](https://github.com/immerjs/immer) under the hood, which means that the state is made immutable
by tracking property access.

**`example`** 
increment(state, action) {
  state.count += 1;
}

**`example`** 
decrement: (state, action) => {
  state.count -= 1;
}

**`example`** 
saveData(state, { data, userId }) {
  state.isLoading[userId] = false;
  state.data[userId] = data;
}

___

### `Optional` selectors

• **selectors**? : *SelectorMap*

*Defined in [packages/redux-data-model/src/model.ts:127](https://github.com/kayak/redux-data-model/blob/2a860dd/packages/redux-data-model/src/model.ts#L127)*

Selectors are functions that receive the entire state and returns a piece of it or, perhaps transform it.
Selectors will memoize the returned data, in order to avoid any re-renders caused by shallow
comparing its variables. The first argument of a selector function is the namespaced state, following
by any other positional arguments passed in an eventual call within a mapStateToProps. Last but not least,
the last argument is the entire redux state.

**`example`** count: (state) => state,

**`example`** userIds: (state, allState) => allState.modelNamespace.data.map(user => user.id),

**`example`** user: (state, userId) => state.data[userId],

**`example`** isLoading: (state, userId, allState) => allState.modelNamespace.isLoading[userId],

___

###  state

• **state**: *State*

*Defined in [packages/redux-data-model/src/model.ts:114](https://github.com/kayak/redux-data-model/blob/2a860dd/packages/redux-data-model/src/model.ts#L114)*

State represents the initial state of the model's reducer.

**`example`** state: 0

**`example`** state: []

**`example`** state: {
    isLoading: {},
    data: {},
}
