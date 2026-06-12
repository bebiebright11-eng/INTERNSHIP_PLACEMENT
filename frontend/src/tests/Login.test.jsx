import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";

describe("Login Page", () => {

  test("renders login form", () => {

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(
      screen.getByPlaceholderText(
        /Registration Number \/ Email/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Password/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /SIGN IN/i
      })
    ).toBeInTheDocument();

  });

});