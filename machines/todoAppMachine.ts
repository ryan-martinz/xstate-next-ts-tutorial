import { setup, assign, fromPromise } from "xstate";

interface TodoContext {
  todos: string[];
  error: string | null;
  createNewTodoFormInput: string;
}

const fetchTodos = fromPromise(async () => {
  const response = await fetch("http://localhost:3000/api/getTodos");
  const data = await response.json();
  return data.todos;
});
const deleteTodo = fromPromise(async (event: any) => {
  await fetch("http://localhost:3000/api/deleteTodo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index: event.input.event.index }),
  });
  return event.input.event.index;
});
const addTodo = fromPromise(async (event: any) => {
  await fetch("http://localhost:3000/api/addTodo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ todo: event.input.event.value }),
  });
  return event.input.event.value;
});

export const todosMachine = setup({
  actors: {
    fetchTodos,
    addTodo,
    deleteTodo,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FWwHQEsB2OyOAhgDY4Be+UAxBnmLngG6oDWjAZmMgMYAWAFXSYA2gAYAuolAAHTIRyo8MkAA9EAZk0AOLAE4ATOICsAdkM6dZs-p0mANCACeiHQEYsmw4f3v3NuYALEH6AL5hTmgY2PiKZJTUNGAATimoKViypMTInBkAtljcfEIisBLSSCDysIrKqhoI2npGphZWNnaOLogBmlgm+gBsmibihiFBHiERUeW4EKRgNACCACLrAPqCAPLru5WqtfUq1U2aFoMW+uI6+kHD7kGTmk6uCEMD9+LDJoZPWzjExzEDRTCLZY0dYAUQAMjDBDCdvtDlJjgoiA1zlogmYDGZxOJdKYdMNhiF3ogASYsGS7O5xO5zITDJpQeDYksVgBVAAK61WSK2AEkAHJ8nmCI7VE5Ys6gJomIKeEz3MnuTS3TTDHRUhCTQxYdxPUKTEKTfRmDkLCBgZZEPBQYQYOjKRj4VgcLB2h1gF2oGVyTFKBXqLS6AzGcyWay2ez6zTMrDDfQmTQvUxMnS6EGRMG2+08agB5JpDJZHJ5Qo+ovIf0iIM1EPYxUR1rRjpx7r6oLifEjawUoJjEzmZk2mJYYgQCAlkRuhhML2MGcQANNuWhxrtqPtWNdBO9BBBZVYWy+J7PCn6OzDScQtfz12pdKZbK5fIpIprjfo2UtmGFyRm0MadPGPQfMq+K-KMObpu41jaBE+Z4OgcCqJyGJ1PKO4IAAtMM+qEQ+sQEEQCRUE62GnHhLz6voAwmO4t6jBMdwaqRkJgDRuE4p8OhBIMuoqiE7g+DoviJi8WAjsMhjMiauhmHiebzFOvrFk6Aa8du-H0ceAJGqyHhWuMtwBFxT7aSIumtuGCCEimLFmEhTxau5vZmLSGa3syd7PMx94oUAA */
  id: "todos",
  context: {
    todos: [],
    error: null,
    createNewTodoFormInput: "",
  } as TodoContext,
  initial: "initializing",
  states: {
    initializing: {
      invoke: {
        id: "fetchTodos",
        src: "fetchTodos",
        onDone: {
          target: "idle",
          actions: assign({
            todos: (context: any, _: any) => context.event.output,
          }),
        },
        onError: {
          target: "idle",
          actions: assign({
            todos: (context: any, _: any) => context.event.output,
          }),
        },
      },
    },
    idle: {
      on: {
        ADD_TODO: "addingTodo",
        DELETE_TODO: "deletingTodo",
        UPDATE_INPUT: {
          actions: assign({
            createNewTodoFormInput: (context: any, _: any) => {
              if (context.event.type === "UPDATE_INPUT") {
                return context.event.value;
              }
              return context.context.createNewTodoFormInput;
            },
          }),
        },
      },
    },
    deletingTodo: {
      invoke: {
        id: "deleteTodo",
        src: "deleteTodo",
        input: ({ event }) => ({ event }),
        onDone: {
          target: "idle",
          actions: assign({
            todos: ({ context, event }) =>
              context.todos.filter(
                (_: any, index: any) => index !== event.output
              ),
          }),
        },
        onError: {
          target: "idle",
        },
      },
    },
    addingTodo: {
      invoke: {
        id: "addTodo",
        src: "addTodo",
        input: ({ event }) => ({ event }),
        onDone: {
          target: "idle",
          actions: assign({
            todos: ({ context, event }) => [...context.todos, event.output],
            createNewTodoFormInput: "",
          }),
        },
        onError: {
          target: "idle",
        },
      },
    },
  },
});
