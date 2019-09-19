(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{"./docs/concepts.mdx":function(e,t,s){"use strict";s.r(t),s.d(t,"default",function(){return c});var n=s("./node_modules/@babel/runtime/helpers/esm/objectWithoutProperties.js"),a=(s("./node_modules/react/index.js"),s("./node_modules/@mdx-js/react/dist/index.es.js")),r={},o="wrapper";function c(e){var t=e.components,s=Object(n.a)(e,["components"]);return Object(a.b)(o,Object.assign({},r,s,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h2",{id:"model"},"Model"),Object(a.b)("p",null,"Models are the most basic data structure/abstraction in this library. They require a set of options to be provided\nwhen initializing them."),Object(a.b)("h4",{id:"example"},"Example:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{className:"language-javascript"}),"import {Model} from 'react-resux';\nimport _ from 'lodash';\n\nasync function fetchApi(url) {\n  return await fetch(url).then(response => response.json());\n}\n\nexport const userModel = new Model({\n    // Mandatory options\n    namespace: 'users',\n    state: {\n        loading: {},\n        data: {},\n    },\n\n    // Optional options\n    selectors: {\n        loadingByUser: (state, userId) => _.get(state, `users.loading[${userId}]`, true),\n        userById: (state, userId) => _.get(state, `users.data[${userId}]`),\n    },\n    reducers: {\n        saveUser(state, { data, userId }) {\n          state.loading[userId] = false;\n          state.data[userId] = data;\n        },\n    },\n    effects: {\n        *fetchUser({ userId }, { call, put }) {\n            try {\n                const data = yield call(fetchApi, `http://jsonplaceholder.typicode.com/users/${userId}`);\n                yield put({type: \"users.saveUser\", data, userId});\n             } catch (error) {\n                console.log(error)\n             }\n        },\n    },\n});\n")),Object(a.b)("p",null,"The model will be used to generate the action types, actions, reducers, sagas and dispatchers for this particular\nentity (i.e. users). Below you can find a more in depth description on the many options that can be used during a\nmodel instantiation."),Object(a.b)("h3",{id:"model-options"},"Model Options"),Object(a.b)("p",null,"An object with a few key-value pairs. Being ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"#namespace"}),"namespace")," and ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"#namespace"}),"state")," mandatory, while\n",Object(a.b)("a",Object.assign({parentName:"p"},{href:"#selectors"}),"selectors"),", ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"#reducers"}),"reducers"),", ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"#effects"}),"effects")," are optional. For more info see\n",Object(a.b)("a",Object.assign({parentName:"p"},{href:"/react-resux/interfaces/modeloptions.md"}),"this"),"."),Object(a.b)("h3",{id:"modelss-api"},"Models's API"),Object(a.b)("p",null,"For more info see ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"/react-resux/classes/model.md"}),"this"),"."),Object(a.b)("h2",{id:"subscriber"},"Subscriber"),Object(a.b)("p",null,"Subscribers provide a way to link models' effects/reducers, so that they get triggered by the same non-namespaced\naction type, on a leading, latest, or every action basis. That is, they provide the means for generating redux sagas\nemploying takeLeading, takeLatest, or takeEvery effects. Those models' action creators will be available within the\nsubscriber's effects."),Object(a.b)("h4",{id:"example-1"},"Example:"),Object(a.b)("pre",null,Object(a.b)("code",Object.assign({parentName:"pre"},{className:"language-javascript"}),"import {Subscriber} from 'react-resux';\nimport {userModel} from './models';\n\nexport const pageSubscriber = new Subscriber([userModel]).takeLatest(\n  'fetchPage', [\n    (action, {users}) => users.fetchUser(action),\n  ]\n);\n")),Object(a.b)("h3",{id:"subscribers-api"},"Subscriber's API"),Object(a.b)("p",null,"For more info see ",Object(a.b)("a",Object.assign({parentName:"p"},{href:"/react-resux/classes/subscriber.md"}),"this"),"."))}c&&c===Object(c)&&Object.isExtensible(c)&&Object.defineProperty(c,"__filemeta",{enumerable:!0,configurable:!0,value:{name:"MDXContent",filename:"docs/concepts.mdx"}}),c.isMDXComponent=!0}}]);
//# sourceMappingURL=docs-concepts.14e62889f18003fcb778.js.map