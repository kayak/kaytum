import produce from 'immer';
import {get, isString, keys, memoize, size, toPairs, uniq} from 'lodash';
import {AnyAction, Reducer} from 'redux';
import {Saga} from '@redux-saga/core';
import {
  actionChannel,
  all,
  apply,
  call,
  cancel,
  cancelled,
  cps,
  debounce,
  delay,
  flush,
  fork,
  getContext,
  join,
  put,
  putResolve,
  race,
  retry,
  select,
  setContext,
  spawn,
  take,
  takeEvery as blockingEffectTakeEvery,
  takeMaybe,
  throttle,
} from 'redux-saga/effects';
import {createSelector} from 'reselect';
import {modelBlockingGenerator} from './saga';
import {
  ActionCreatorsMapObject,
  ActionWithInternals,
  EffectMap,
  EffectModelMap,
  ReducerMap,
  SelectorMap,
  SelectorModelMap,
  State
} from './baseTypes';
import {actionCreator, ActionInternalsObject} from "./utils";

/**
 * @ignore
 */
export const sagaEffects = {
  actionChannel,
  all,
  apply,
  call,
  cancel,
  cancelled,
  cps,
  debounce,
  delay,
  flush,
  fork,
  getContext,
  join,
  put,
  putResolve,
  race,
  retry,
  select,
  setContext,
  spawn,
  take,
  takeMaybe,
  throttle,
};

/**
 * @ignore
 */
const defaultReducer = (
  state,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _action,
) => state;

/**
 * @ignore
 */
const namespaceRegex = new RegExp('^([A-Za-z0-9]+)([.][A-Za-z0-9]+)*$');

/**
 * Model options are used for initialising a [[Model]] instance.
 */
export interface ModelOptions {
  /**
   * The namespace of a model will prefix all its reducers and effects' action types. This value must be unique
   * and, as a matter of fact, redux-data-model will enforce it. The namespace is effectively an object's path
   * in which the state will be stored, which can introduce new nesting levels in the store. This might be
   * useful if you need to put redux-data-model's data somewhere else that not on the root level of the store.
   *
   * @example namespace: 'pageA'
   * @example namespace: 'pageB'
   * @example namespace: 'projectA.pageA'
   * @example namespace: 'projectA.pageB'
   */
  namespace: string;
  /**
   * State represents the initial state of the model's reducer.
   *
   * @example state: 0
   * @example state: []
   * @example state: {
   *     isLoading: {},
   *     data: {},
   * }
   */
  state: State;
  /**
   * Selectors are functions that receive the entire state and returns a piece of it or, perhaps transform it.
   * Selectors will memoize the returned data, in order to avoid any re-renders caused by shallow
   * comparing its variables. The first argument of a selector function is the namespaced state, following
   * by any other positional arguments passed in an eventual call within a mapStateToProps. Last but not least,
   * the last argument is the entire redux state.
   *
   * @example count: (state) => state,
   * @example userIds: (state, allState) => allState.modelNamespace.data.map(user => user.id),
   * @example user: (state, userId) => state.data[userId],
   * @example isLoading: (state, userId, allState) => allState.modelNamespace.isLoading[userId],
   */
  selectors?: SelectorMap;
  /**
   * Reducers are functions used for synchronously changing the current state of a given model. A reducer will
   * be triggered whenever an action is dispatched, which contains a type equal to modelNamespace.reducerName.
   * A reducer function receives the entire state and the action as arguments respectively. It shouldn't return
   * data, like vanilla reducers. Instead it should change the state argument in place. Redux-data-model uses
   * [immer](https://github.com/immerjs/immer) under the hood, which means that the state is made immutable
   * by tracking property access.
   *
   * @example
   * increment(state, action) {
   *   state.count += 1;
   * }
   * @example
   * decrement: (state, action) => {
   *   state.count -= 1;
   * }
   * @example
   * saveData(state, { data, userId }) {
   *   state.isLoading[userId] = false;
   *   state.data[userId] = data;
   * }
   */
  reducers?: ReducerMap;
  /**
   * Effects are functions used for performing asynchronous state changes. An effect will be triggered whenever
   * an action is dispatched, which contains an actionType equal to modelNamespace.effectName. They are wrapped
   * by a [takeEvery](https://redux-saga.js.org/docs/api/#takeeverypattern-saga-args) effect, from redux-saga.
   * An effect function receives an action, an object with saga's effects, and the action creators as arguments
   * respectively. For a list of saga's effects available to you see
   * [this](https://redux-saga.js.org/docs/api/#effect-creators).
   * The saga effects won't include takeLeading, takeLatest, and takeEvery blocking effects.
   *
   * @example
   * *fetchPostsByUser({ userId }, sagaEffects, actionCreators) {
   *   try {
   *     const data = yield sagaEffects.call(fetchApi, `http://jsonplaceholder.typicode.com/posts/?user=${userId}`);
   *     yield sagaEffects.put(actionCreators.saveUser({data, userId}));
   *   } catch (error) {
   *     console.log(error)
   *   }
   * },
   */
  effects?: EffectMap;
}

/**
 * Models are the most basic data structure/abstraction in this library. They require a set of options to be
 * provided when initializing them. The model will be used to generate the action types, actions, reducers,
 * dispatchers, and sagas, based on the model's options that were provided.
 */
export class Model {
  private _isLoaded: boolean;
  private readonly _namespace: string;
  private readonly _state: State;
  private readonly _selectors?: SelectorMap;
  private readonly _reducers?: ReducerMap;
  private readonly _effects?: EffectMap;

  /**
   * Creates a model instance.
   *
   * @example
   * const counterModel = new Model({
   *   namespace: 'counter',
   *   state: {
   *      count: 0,
   *   },
   *   selectors: {
   *       count: (state) => state.count,
   *   },
   *   reducers: {
   *      increment(state, action) {
   *        state.count += 1;
   *      },
   *      decrement(state, action) {
   *        state.count -= 1;
   *      },
   *   },
   *  // effects: {...}
   * });
   *
   * @param options A model's options.
   * @throws {NamespaceIsntAStringError} When namespace isn't a string.
   * @throws {EmptyNamespaceError} When namespace is an empty string.
   * @throws {DuplicatedActionTypesError} When reducer and/or effect action types are duplicated.
   */
  public constructor(options: ModelOptions) {
    this._isLoaded = false;
    this._namespace = options.namespace;
    this._state = options.state;
    this._selectors = options.selectors || {};
    this._reducers = options.reducers || {};
    this._effects = options.effects || {};

    const actionTypes = [].concat(...keys(this._reducers)).concat(...keys(this._effects));

    if (!isString(this._namespace)) {
      throw {
        name: 'NamespaceIsntAStringError',
        message: `Namespace must be a string. The provided namespace type was: ${typeof this._namespace}`,
      };
    }

    if (size(this._namespace) < 1) {
      throw {
        name: 'EmptyNamespaceError',
        message: `Namespace must be a non empty string.`,
      };
    }

    if (!namespaceRegex.test(this._namespace)) {
      throw {
        name: 'InvalidNamespaceError',
        message: `Namespace can only contain letters, numbers and/or dots, when nesting the data is needed. ` +
        `It was validated against the following regex: ${String(namespaceRegex)}`,
      };
    }

    if (uniq(actionTypes).length !== actionTypes.length) {
      throw {
        name: 'DuplicatedActionTypesError',
        message: `Reducer and effect action types must be unique in [${this._namespace}] model. The provided ` +
        `reducer/effect action types were: ${actionTypes.join(', ')}`,
      };
    }

    this.modelSelectors = memoize(this.modelSelectors.bind(this));
    this.modelReducers = memoize(this.modelReducers.bind(this));
    this.modelEffects = memoize(this.modelEffects.bind(this));
  }

  /**
   * @ignore
   */
  public actionType(actionName: string): string {
    return `${this._namespace}.${actionName}`;
  }

  /**
   * Returns an object with action creators, one for each of the declared reducers and effects. Only useful for
   * testing purposes, read the docs section on testing for more info. Also supports the inner workings of this
   * class.
   *
   * @returns an action creator's map object.
   */
  public actionCreators(): ActionCreatorsMapObject {
    const actions = {};

    const actionCreatorBuilder = actionName => (
      payload: object = {}, __actionInternals: ActionInternalsObject=undefined,
    ) => {
      if (!this.isLoaded) {
        throw {
          name: 'ModelNotCombinedError',
          message: `Models need to be combined with combineModelReducers prior to any usage. Now ` +
          `make this the case for: ${this._namespace}`,
        };
      }
      return actionCreator(this.actionType(actionName), payload, __actionInternals);
    };

    for (const reducerName in this._reducers) {
      actions[reducerName] = actionCreatorBuilder(reducerName);
      actions[reducerName].isEffect = false;
    }

    for (const effectName in this._effects) {
      actions[effectName] = actionCreatorBuilder(effectName);
      actions[effectName].isEffect = true;
    }

    return actions;
  }

  /**
   * @ignore
   */
  public modelSelectors(): SelectorModelMap {
    const selectors = {};

    for (const [selectorName, selectorFunc] of toPairs(this._selectors)) {
      const namespacedSelectorFunc = (allState, ...args) => {
        const namespacedState = get(allState, this._namespace);
        return selectorFunc(namespacedState, ...args, allState);
      };
      selectors[selectorName] = createSelector([namespacedSelectorFunc], data => {
        if (!this.isLoaded) {
          throw {
            name: 'ModelNotCombinedError',
            message: `Models need to be combined with combineModelReducers prior to any usage. Now ` +
            `make this the case for: ${this._namespace}`,
          };
        }

        return data;
      });
    }

    return selectors;
  }

  /**
   * @ignore
   */
  public modelReducers(): Reducer<unknown, AnyAction> {
    const reducers = {};

    for (const [reducerName, reducerFunc] of toPairs(this._reducers)) {
      const actionType = this.actionType(reducerName);
      reducers[actionType] = reducerFunc;
    }

    return produce((draft: object, action: ActionWithInternals) => {
      const reducerFunc = get(reducers, action.type, defaultReducer);
      reducerFunc(draft, action.payload);
    }, this._state);
  }

  /**
   * @ignore
   */
  public modelEffects(): EffectModelMap {
    const effects = {};
    const actionCreators = this.actionCreators();

    for (const [effectName, effectFunc] of toPairs(this._effects)) {
      effects[effectName] = (payload: object = {}) => effectFunc(payload, sagaEffects, actionCreators);
    }

    return effects;
  }

  /**
   * Returns an array of sagas, one for each of the declared effects. They will default to taking every action and
   * calling its respective effect.
   *
   * @throws {NonCompatibleActionError} When bindModelActionCreators was not used to bind the action creators.
   * @returns An array of sagas.
   */
  public get reduxSagas(): Saga[] {
    const reduxSagas = [];

    for (const [effectName, effectFunc] of toPairs(this.modelEffects())) {
      const actionType = this.actionType(effectName);
      reduxSagas.push(modelBlockingGenerator(blockingEffectTakeEvery, actionType, effectFunc));
    }

    return reduxSagas;
  }

  /**
   * Returns whether the model was loaded on a combineModelReducers call.
   *
   * @returns A boolean.
   */
  public get isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Returns the namespace.
   *
   * @returns A string.
   */
  public get namespace(): string {
    return this._namespace;
  }

  /**
   * Returns the initial state.
   *
   * @returns An initial state.
   */
  public get state(): State {
    return this._state;
  }

  /**
   * Returns the selectors.
   *
   * @returns A selectors map.
   */
  public get selectors(): SelectorMap {
    return this._selectors;
  }

  /**
   * Returns the reducers.
   *
   * @returns A reducer function.
   */
  public get reducers(): ReducerMap {
    return this._reducers;
  }

  /**
   * Returns the effects.
   *
   * @returns An effect map.
   */
  public get effects(): EffectMap {
    return this._effects;
  }

  /**
   * @ignore
   */
  public markAsLoaded() {
    this._isLoaded = true;
  }
}
