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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FWwHQEsB2OyOAhgDY4Be+UAxBnmLngG6oDWjAZmMgMYAWAFXSYA2gAYAuolAAHTIRyo8MkAA9EAZk0AOLAE4ATOICsJ8Yc36A7LpOaANCACeiHQEYsmw4f3uzACzu2gBs2gC+4U5oGNj4imSU1DRgAE6pqKlYsqTEyJyZALZY3HxCIrAS0kgg8rCKyqoaCNp6RqbmljZ2ji6I7rZYJvph5jriYZoBEVEgMZi4EKRgNACCACLrAPqCAPLru1WqdQ0qNc2a1oZDV-riAQG2OgETJk6uCMOaWDp3If-uR5BHyRaIVRbLGjrACiABloYJoTt9ocpMcFERGuctI8DNZxKZLv9hqZ3ohDCETD8QjYdCFxNZgt4AqC5uCcEsVgBVAAK61WiK2AEkAHI8rmCI41E6Ys6gZomIJDX46QwmaxhfSK-RkhCGALXdwhfziTQ0wwaswhVnzbAQMDLIh4KDCDB0ZSMfCsDhYe2OsCu1BSuQYpRy9RaXQGYxmCxWJ72XWafxYGn2XwDHSqkLWG3gv08aiBlLpTLZXL5Iq+h08AMiYO1UNY+WRtoxzrxnq6l7WAwhHQah7TVWPPOxLDECAQIsid0MJjexiTiCBhsysNNVvRjpx7o6RN9BABRVYaxGEYW9UM-R0scLZczt1pDJZHJ5AqpYrL1do6VN8MXFG7Sxl0Ca9B8iq9hMmrjD4DJnpEsx4OgcCqLa6L1LKm4IAAtCEup4XecQEEQiRUM6GGnNhBq6vo3wmO4+g2IC9JMSY-ZERCYCUVh2KfM8Qz9t4jHTCYA7gTi1zTCEhjBHRTGWNasy2tWjqPqgPEbnxNGHhS1z4oY4wiRSNL6JxD7OoGmnNhGCD4qmjFno81jWMedjdtYVJTExBpGuI7i-Jxz6ZNZAH9C8p4MjmN5TKYPjWLqYniKm-a-OYLmuc8iHhEAA */
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
    error: {
      on: {},
    },
  },
});
