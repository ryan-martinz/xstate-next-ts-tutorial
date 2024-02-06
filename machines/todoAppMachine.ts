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
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2FWwHQEsB2OyOAhgDY4Be+UAxBnmLngG6oDWjAZmMgMYAWAFXSYA2gAYAuolAAHTIRyo8MkAA9EAZk0AOLAE4ATOICsOzQBZDJgIwB2TaYA0IAJ6IdNrJsOH9Nyyt9HTtDAF8wlzQMbHxFMkpqGjAAJxTUFKxZUmJkTgyAWyxuPiERWAlpJBB5WEVlVQ0EbT0jU3MrWwdnN0R7TSwTfQA2QItbEItgiKjyrBSwYghXGgBBABF1gH1BAHl13crVWvqVaqbNUMHQ-Qc7G31xe5sXdwQhgZ1Hk2HDGxM7OJLDMQNFMPNFssaOsAKIAGRhghhO32hykxwURAa5y0FjsBkBNiBtk0t0M2leiEMwxMWB0w1uQz+NmphgsILB2AWSxWAFUAArrVZIrYASQAcvzeYIjtUTlizqAmiYLF4zPpHhZNA8LFNNJSEGzDFgbMMbLrVZoAdoTOFIqC5hAwKQeNRhBg6MpGPhWBwsE6XcgwO7ULK5JilIr1FpdAZjGZLNZ+j03traQzbd0GWb9JoOY7na68FAQ8k0hksjk8oV-YWgyGwzUI9ilTHWvGOknuiYDRYngZhiFxH27DoTE8AvmYlglhA3SJPQwmL7GLOG+i5c2oxdY20E51kz3eghxhYsHYjI9xNfbuIWXYp+DZ-OPal0plsrl8ikimuRI35UjRo2zjdpEy6RwjzeFV8XEYZRm1O8xx0L4IntPB0DgVROQxOoFWAhAAFphgNYisGvCjqX+DVhgcExH1iAgiASKhi1w04CKsA1c0GB59CZGwHgBfiGIhHl2PwnF3lHc9c0HW0iR0ckoNxY0tTNAF6XGbRRIDIsSxECSgKkrjj1Zc9xEMOx7hGK16TtWZp2fYsQyMltowQQEsBzC9r0ceCUIsXs7FpSxghMS5tHg8d2XtTksDfDI3O3Po+wsux5Pgq0hluA0zHEbzByvMcTDMCK0LCIA */
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
          target: "ready",
          actions: assign({
            todos: (context: any, _: any) => context.event.output,
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
