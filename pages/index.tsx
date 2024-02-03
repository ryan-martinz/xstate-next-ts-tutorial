import { useMachine } from "@xstate/react";
import type { NextPage } from "next";
import React from "react";
import { todoMachine } from "../machines/todoAppMachine";

const Home: NextPage = () => {
  const [state, send] = useMachine(todoMachine);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.context.createNewTodoFormInput.trim()) {
      send({ type: "ADD_TODO", value: state.context.createNewTodoFormInput });
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
            <button onClick={() => send({ type: "DELETE_TODO", index })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
