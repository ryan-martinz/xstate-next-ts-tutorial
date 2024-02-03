import { useMachine } from "@xstate/react";
import type { NextPage } from "next";
import React, { useEffect } from "react";
import { todoMachine } from "../machines/todoAppMachine";
import { useTodosApi } from "../hooks/useTodosApi";

const Home: NextPage = () => {
  const [state, send] = useMachine(todoMachine);
  const { fetchTodos, addTodo, deleteTodo } = useTodosApi(send);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.context.createNewTodoFormInput) {
      await addTodo(state.context.createNewTodoFormInput);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a new todo"
          value={state.context.createNewTodoFormInput}
          onChange={(e) =>
            send({ type: "UPDATE_INPUT", value: e.target.value })
          }
        />
        <button type="submit">Add Todo</button>
      </form>
      {state.context.error && <p>Error: {state.context.error}</p>}
      <ul>
        {state.context.todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => deleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
