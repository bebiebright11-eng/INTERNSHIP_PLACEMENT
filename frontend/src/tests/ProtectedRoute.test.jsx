import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

describe("ProtectedRoute", () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test("allows access when token and role are correct", () => {

    localStorage.setItem("access", "fake-token");
    localStorage.setItem("role", "student");

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="student">
          <h1>Student Dashboard</h1>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Student Dashboard")
    ).toBeTruthy();
  });

});