import { setup, assign, fromPromise } from "xstate";

interface TodoContext {
  todos: string[];
  error: string | null;
  createNewTodoFormInput: string;
  isTestSet: boolean;
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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FWwHQEsB2OyOAhgDY4Be+UAxBnmLngG6oDWjAZmMgMYAWAFXSYA2gAYAuolAAHTIRyo8MkAA9EAZk0AOLAE4ATOICsO8foDsJgIyaAbOM0AaEAE9EOm1k2HD+m0N7ABYnEMt9AF9I1zQMbHxFMkpqGjAAJ3TUdKxZUmJkTmyAWyxuPiERWAlpJBB5WEVlVQ0EbT0jU3MrWwcnVw8EG0tNLBN9e01gywjzE0tDaNiqrHSwYgg3GgBBABFdgH1BAHld45rVBqaVOtbNBbGF-Qt7Kxtg5+CBxHHRnWf7I5xDNtDYojEQHFMKt1psaLsAKIAGQRggRR1O5yklwURGaty00wMlnEplCOlsNjM9m+CCCJiwOlelns72sNlMkyWkJWaw2WwAqgAFXbbNEHACSADkhQLBBc6lc8TdQK0TMFvGZ9BTpu9DDNDLTDMFDFgbKzQsaSfoJuDlvEsBAwKQeNRhBg6MpGPhWBxHc6eGB3agFXJcUoVeotLoDMYzBZ2X0XO4tFSsK8TPqFsNNM9jdyodgnS6iHgoMG0plsrl8oUSv6S0GRKH6uH8arox0491E45k4NQpYDPYdAsdMEKSZ7PMCysNhA3SJPQwmL7GPPgy2lRGWp3Y10E70+7TguqsBF-NpLBrNO97LOHfPFx6MlkcnkCkV0qUN83sYq20jO4Y06eMejsY8UwQdUh3EQFdBMUl9A+aIITwdA4FUQscUaZVdwQABaGkoKIrBSXIijKMsB9oUSIhkioMscOufCTVpfRRlsG17EMHQHBHcwdBo7A+U2Zi8IJaDLD0CIHEQ8xXg1GxaSmU1ggcc1Xg5aSKU0YSG1dMtg3EndJLYqCglNEl9XGJT5mCfSnyMkQTPbKMEBJdMwXMcQJ00XyvENKDpgZKYbXNf57lsEJ9NfbJXKAxB3nEc9gQE-VNBMW8AlpeN0wEpkdGMTLggc1CgA */
  id: "todos",
  context: {
    todos: [],
    error: null,
    createNewTodoFormInput: "",
    isTestSet: false,
  } as TodoContext,
  initial: "initializing",
  states: {
    initializing: {
      invoke: {
        id: "fetchTodos",
        src: "fetchTodos",
        onDone: {
          target: "ready",
          actions: assign({
            todos: (context: any, _: any) => context.event.output,
            isTestSet: (context: any, _: any) =>
              context.event.output.includes("test"),
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            todos: (context: any, _: any) => context.event.output,
          }),
        },
      },
    },
    ready: {
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
          target: "ready",
          actions: assign({
            todos: ({ context, event }) =>
              context.todos.filter(
                (_: any, index: any) => index !== event.output
              ),
            isTestSet: ({ context, event }) =>
              event.output === "test" && context.event.output.includes("test"),
          }),
        },
        onError: {
          target: "ready",
        },
      },
    },
    addingTodo: {
      invoke: {
        id: "addTodo",
        src: "addTodo",
        input: ({ event }) => ({ event }),
        onDone: {
          target: "ready",
          actions: assign({
            todos: ({ context, event }) => [...context.todos, event.output],
            createNewTodoFormInput: "",
            isTestSet: ({ context, event }) =>
              context.isTestSet === true || event.output === "test",
          }),
        },
        onError: {
          target: "ready",
        },
      },
    },
    error: {
      on: {},
    },
  },
});
