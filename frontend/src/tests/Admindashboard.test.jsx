import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import AdminDashboard from "../pages/AdminDashboard";

// Mock react-router-dom navigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock API
vi.mock("../api", () => ({
  default: {
    get: vi.fn((url) => {
      if (url === "internships/applications/")
        return Promise.resolve({ data: [] });
      if (url === "internships/placements/")
        return Promise.resolve({ data: [] });
      if (url === "accounts/users/")
        return Promise.resolve({ data: [] });
      if (url === "internships/organizations/")
        return Promise.resolve({ data: [] });
      if (url === "supervision/criteria/")
        return Promise.resolve({ data: [] });
      if (url === "supervision/evaluations/")
        return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    }),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock DashboardHeader and Footer components
vi.mock("../components/DashboardHeader", () => ({
  default: ({ dashboardTitle }) => (
    <div>{dashboardTitle}</div>
  ),
}));

vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}));

// Mock recharts to avoid canvas/SVG rendering issues in jsdom
vi.mock("recharts", () => ({
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Legend: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

// Seed localStorage
beforeEach(() => {
  localStorage.setItem("first_name", "AdminUser");
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("Admin Dashboard", () => {

  test("renders dashboard title", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Admin Dashboard/i)
    ).toBeInTheDocument();
  });

  test("renders summary stat cards (Organizations, Applications, Placements)", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Use getAllByText since these words appear in multiple places (stat cards + menu items)
    await waitFor(() => {
      expect(screen.getAllByText(/Organizations/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Applications/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Placements/i).length).toBeGreaterThan(0);
    });
  });

  test("renders menu button", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Menu/i)
    ).toBeInTheDocument();
  });

  test("renders Add Organization form on home view", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Add Organization/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Location/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Create Organization/i)
    ).toBeInTheDocument();
  });

  test("renders Create Student form on home view", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // "Create Student" appears in both the <h2> heading and the submit <button>
    // so we target the heading specifically
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      const match = headings.find((el) =>
        /^create student$/i.test(el.textContent.trim())
      );
      expect(match).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText(/Registration Number/i)
    ).toBeInTheDocument();
  });

  test("renders Create Staff User form on home view", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // "Create Staff User" appears in both the <h2> heading and the submit <button>
    // so we target the heading specifically
    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      const match = headings.find((el) =>
        /^create staff user$/i.test(el.textContent.trim())
      );
      expect(match).toBeInTheDocument();
    });
  });

  test("renders Global Evaluation Criteria section", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      const match = headings.find((el) =>
        /global evaluation criteria/i.test(el.textContent)
      );
      expect(match).toBeInTheDocument();
    });
  });

  test("renders Applications Status chart section", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      const match = headings.find((el) =>
        /applications status/i.test(el.textContent)
      );
      expect(match).toBeInTheDocument();
    });
  });

  test("renders Placements By Organization chart section", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      const match = headings.find((el) =>
        /placements by organization/i.test(el.textContent)
      );
      expect(match).toBeInTheDocument();
    });
  });

  test("renders User Distribution chart section", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      const match = headings.find((el) =>
        /user distribution/i.test(el.textContent)
      );
      expect(match).toBeInTheDocument();
    });
  });

  test("renders footer", async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Footer/i)
    ).toBeInTheDocument();
  });

});