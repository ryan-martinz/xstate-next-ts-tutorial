import { createMachine, assign, DoneInvokeEvent } from "xstate";

interface TodoContext {
  todos: string[];
  createNewTodoFormInput: string;
  error: string | null;
}

type TodoEvent =
  | { type: "ADD_TODO"; value: string }
  | { type: "DELETE_TODO"; index: number }
  | { type: "UPDATE_INPUT"; value: string }
  | { type: "LOAD_TODOS_SUCCESS"; todos: string[] }
  | { type: "ERROR"; message: string };

interface FetchTodosSuccessEvent extends DoneInvokeEvent<string[]> {}
interface AddTodoSuccessEvent extends DoneInvokeEvent<string> {}
interface DeleteTodoSuccessEvent extends DoneInvokeEvent<number> {}

const todoMachine = createMachine<TodoContext, TodoEvent>(
  {
    id: "todos",
    initial: "initializing",
    context: {
      todos: [],
      createNewTodoFormInput: "",
      error: null,
    },
    states: {
      initializing: {
        invoke: {
          id: "fetchTodos",
          src: "fetchTodos",
          onDone: {
            target: "idle",
            actions: assign<TodoContext, FetchTodosSuccessEvent>({
              todos: (_, event) => event.data,
            }),
          },
          onError: {
            target: "idle",
            actions: assign<TodoContext, DoneInvokeEvent<string>>({
              error: (_, event) => event.data,
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
              createNewTodoFormInput: (context, event) => {
                if (event.type === "UPDATE_INPUT") {
                  return event.value;
                }
                return context.createNewTodoFormInput;
              },
            }),
          },
        },
      },
      addingTodo: {
        invoke: {
          id: "addTodo",
          src: "addTodo",
          onDone: {
            target: "idle",
            actions: assign<TodoContext, AddTodoSuccessEvent>({
              todos: (context, event) => [...context.todos, event.data],
              createNewTodoFormInput: () => "",
            }),
          },
          onError: {
            target: "idle",
            actions: assign<TodoContext, DoneInvokeEvent<string>>({
              error: (_, event) => event.data,
            }),
          },
        },
      },
      deletingTodo: {
        invoke: {
          id: "deleteTodo",
          src: "deleteTodo",
          onDone: {
            target: "idle",
            actions: assign<TodoContext, DeleteTodoSuccessEvent>({
              todos: (context, event) =>
                context.todos.filter((_, index) => index !== event.data),
            }),
          },
          onError: {
            target: "idle",
            actions: assign<TodoContext, DoneInvokeEvent<string>>({
              error: (_, event) => event.data,
            }),
          },
        },
      },
    },
  },
  {
    services: {
      fetchTodos: async () => {
        const response = await fetch("/api/getTodos");
        const data = await response.json();
        return data.todos;
      },
      addTodo: async (_, event) => {
        if (event.type !== "ADD_TODO") return;
        await fetch("/api/addTodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todo: event.value }),
        });
        return event.value;
      },
      deleteTodo: async (_, event) => {
        if (event.type !== "DELETE_TODO") return;
        await fetch("/api/deleteTodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: event.index }),
        });
        return event.index;
      },
    },
  }
);

export { todoMachine };
