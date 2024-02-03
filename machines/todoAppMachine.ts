import { createMachine, assign } from "xstate";

interface TodoContext {
  todos: string[];
  createNewTodoFormInput: string;
  error: string | null;
}

export type TodoEvent =
  | { type: "ADD_TODO"; value: string }
  | { type: "DELETE_TODO"; index: number }
  | { type: "UPDATE_INPUT"; value: string }
  | { type: "LOAD_TODOS_SUCCESS"; todos: string[] }
  | { type: "ERROR"; message: string };

const todoMachine = createMachine<TodoContext, TodoEvent>({
  id: "todos",
  initial: "idle",
  context: {
    todos: [],
    createNewTodoFormInput: "",
    error: null,
  },
  states: {
    idle: {
      on: {
        ADD_TODO: {
          actions: assign((context, event) => {
            if (event.type === "ADD_TODO") {
              return {
                ...context,
                todos: [...context.todos, event.value],
                createNewTodoFormInput: "",
              };
            }
            return context;
          }),
        },
        DELETE_TODO: {
          actions: assign((context, event) => {
            if (event.type === "DELETE_TODO") {
              return {
                ...context,
                todos: context.todos.filter(
                  (_, index) => index !== event.index
                ),
              };
            }
            return context;
          }),
        },
        UPDATE_INPUT: {
          actions: assign({
            createNewTodoFormInput: (context, event) => {
              return event.type === "UPDATE_INPUT"
                ? event.value
                : context.createNewTodoFormInput;
            },
          }),
        },
        LOAD_TODOS_SUCCESS: {
          actions: assign({
            todos: (_, event) =>
              event.type === "LOAD_TODOS_SUCCESS" ? event.todos : [],
          }),
        },
        ERROR: {
          actions: assign({
            error: (_, event) =>
              event.type === "ERROR" ? event.message : null,
          }),
        },
      },
    },
  },
});

export { todoMachine };
