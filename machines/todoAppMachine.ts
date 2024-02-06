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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FWwHQEsB2OyOAhgDY4Be+UAxBnmLngG6oDWjAZmMgMYAWAFXSYA2gAYAuolAAHTIRyo8MkAA9EAZk0AOLAE4ATOICsAFjP6rZzWYCMAGhABPRDrtZNhw-rt39XjoAbOJBhgC+4U5oGNj4imSU1DRgAE6pqKlYsqTEyJyZALZY3HxCIrAS0kgg8rCKyqoaCNp6RqYWVvo29k6uCHYA7JpYJvpB2priOoND4raR0RVYqWDEEM40AIIAIjsA+oIA8jtHVap1DSo1zZqDhqP3OjrdmhN2ho4uiGMjL6EhEwme6fCJREAxTArNYbGg7ACiABl4YJ4YcTmcpBcFERGjctGZBgZBuJ5iELINhoMzH1EIYgiYsMF9INfM8TDozJzNIsIctVutNgBVAAKOy2qP2AEkAHIioWCc41S6466gZrmDwc-TuIyGSmGGnfBCGh52IJ2GziOYMuyafS8yHYCBgUg8ajCDB0ZSMfCsDhYF1u5BgT2oJVyHFKNXqLS6AzGcyWay2L79TR2RlBfQmQw6WwWHSGExBR3LIPuvBQMMpdKZbK5fJFQOunihkQR2pRvHquNtROdFO9Y1mcRE8YzcRmMa+TS50vgp1YdYQD0ib0MJj+xgrsOdlXRpp9hMdZOvYf9admLCsny2OdBBkmMuxZcQVdVmtpDJZHJ5AqpMUu4dliyrdjGtzxu0SZdD0aY-ISWAAvaGZApMdiROCeDoHAqhOti9SqkeCAALRBLSpGMl01E0VYPKLss8REIkVBVgRVzEWYhgUQEoz+OMpKToShovlCAobOxRH4ggwJ6KyD75l4oTiPoFG2A8NgWiYY4koMwQ6KJzqtkQn4iJJh7SVxFH0g8JL6vo0xcn40zPgxr4rmuGDmT2sYICSWAWiyMyWlOugqRRhKMrYVjmgEMxBHphlYN+mTeRBiAhTeY6PkY-gJaYOgURy4gBUE-xcdl9yuZEQA */
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
            isTestSet: ({ context, event }) => {
              return (
                context.todos.filter((todo: string) => todo === "test").length >
                  1 && event.output !== "test"
              );
            },
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
