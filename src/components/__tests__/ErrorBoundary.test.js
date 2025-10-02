import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error");
};

const WorkingComponent = () => <div>Working Component</div>;

describe("ErrorBoundary", () => {
  // Suppress console.error for these tests
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Working Component")).toBeInTheDocument();
  });

  it("should render error UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i)).toBeInTheDocument();
  });

  it("should render custom fallback if provided", () => {
    const customFallback = (error) => <div>Custom Error: {error.message}</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Custom Error: Test error/i)).toBeInTheDocument();
  });

  it("should call onReset when Try Again is clicked", () => {
    const onReset = jest.fn();

    const { rerender } = render(
      <ErrorBoundary onReset={onReset}>
        <ThrowError />
      </ErrorBoundary>,
    );

    const tryAgainButton = screen.getByText(/Try Again/i);
    tryAgainButton.click();

    expect(onReset).toHaveBeenCalled();

    // After reset, render a working component
    rerender(
      <ErrorBoundary onReset={onReset}>
        <WorkingComponent />
      </ErrorBoundary>,
    );
  });
});
