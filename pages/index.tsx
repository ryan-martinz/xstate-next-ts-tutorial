import React from "react";
import type { NextPage } from "next";
import { useMachine } from "@xstate/react";
import { todosMachine } from "../machines/todoAppMachine";

const Home: NextPage = () => {
  const [state, send] = useMachine(todosMachine);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.context.createNewTodoFormInput.trim()) {
      send({ type: "ADD_TODO", value: state.context.createNewTodoFormInput });
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      {state.matches("initializing") && <p>Loading...</p>}
      {state.matches("idle") && (
        <>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Add a new todo"
              value={state.context.createNewTodoFormInput || ""}
              onChange={(e) =>
                send({ type: "UPDATE_INPUT", value: e.target.value })
              }
            />
            <button type="submit">Add Todo</button>
          </form>
          {state.context.todos.length === 0 && <p>No todos yet</p>}
          <ul>
            {state.context.todos.map((todo: any, index: any) => (
              <li key={index}>
                {todo}
                <button onClick={() => send({ type: "DELETE_TODO", index })}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {state.matches("error") && <p>Error: {state.context.error}</p>}
    </div>
  );
};

export default Home;
