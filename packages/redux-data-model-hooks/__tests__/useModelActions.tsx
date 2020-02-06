import {mount} from 'enzyme';
import * as React from 'react';
import {Provider} from 'react-redux';
import configureMockStore from 'redux-mock-store';
import {Model} from 'redux-data-model';
import {useModelActions} from '../src';

const mockStore = configureMockStore([]);

function Counter({model, actionCaller}) {
  const actions = useModelActions(model);
  React.useEffect(() => {
    actionCaller(actions);
  }, [actions]);
  return null;
}

describe('useModelActions', () => {
  let modelOptions;
  let counterModel;
  let actionCreators;
  let store;

  beforeAll(() => {
    modelOptions = {
      namespace: 'counter',
      state: {
        count: 666,
      },
      reducers: {
        increase(state) {
          state.count += 1;
        }
      },
      effects: {
        *tryToIncrease(_action, effects, actionCreators) {
          yield effects.put(actionCreators.increase());
        }
      },
    };
    counterModel = new Model(modelOptions);
    counterModel.markAsLoaded();
    actionCreators = counterModel.actionCreators();
  });

  beforeEach(() => {
    store = mockStore({
      [modelOptions.namespace]: modelOptions.state,
    });
  });

  it('calls actionCreators', () => {
     const actionCreatorsSpy = jest.spyOn(counterModel, 'actionCreators');
     mount(
      <Provider store={store}>
        <Counter model={counterModel} actionCaller={(actions) => actions.increase()}/>
      </Provider>
    );

    expect(actionCreatorsSpy).toHaveBeenCalled();
  });

  it('will dispatch the respective reducer action when reducer callback is called', () => {
     mount(
      <Provider store={store}>
        <Counter model={counterModel} actionCaller={(actions) => actions.increase()}/>
      </Provider>
    );

    const action = actionCreators.increase();
    expect(store.getActions()[0]).toEqual({
      type: action.type,
      payload: action.payload,
      __actionInternals: {
        resolve: expect.anything(),
        reject: expect.anything(),
      }
    });
  });

  it('will dispatch the respective effect action when effect callback is called', () => {
     mount(
      <Provider store={store}>
        <Counter model={counterModel} actionCaller={(actions) => actions.tryToIncrease()}/>
      </Provider>
    );

    const action = actionCreators.tryToIncrease();
    expect(store.getActions()[0]).toEqual({
      type: action.type,
      payload: action.payload,
      __actionInternals: {
        resolve: expect.anything(),
        reject: expect.anything(),
      }
    });
  });
});
