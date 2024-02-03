import { useCallback } from "react";
import { Sender } from "xstate";
import { TodoEvent } from "../machines/todoAppMachine";

export const useTodosApi = (
  send: Sender<TodoEvent>
): {
  fetchTodos: () => Promise<void>;
  addTodo: (todo: string) => Promise<void>;
  deleteTodo: (index: number) => Promise<void>;
} => {
  const fetchTodos = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/getTodos");
      const { todos } = await response.json();
      send({ type: "LOAD_TODOS_SUCCESS", todos });
    } catch (error: any) {
      send({ type: "ERROR", message: error.message });
    }
  }, [send]);

  const addTodo = useCallback(
    async (todo: string): Promise<void> => {
      try {
        await fetch("/api/addTodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todo }),
        });
        send({ type: "ADD_TODO", value: todo });
      } catch (error: any) {
        send({ type: "ERROR", message: error.message });
      }
    },
    [send]
  );

  const deleteTodo = useCallback(
    async (index: number): Promise<void> => {
      try {
        await fetch("/api/deleteTodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
        });
        send({ type: "DELETE_TODO", index });
      } catch (error: any) {
        send({ type: "ERROR", message: error.message });
      }
    },
    [send]
  );

  return { fetchTodos, addTodo, deleteTodo };
};
