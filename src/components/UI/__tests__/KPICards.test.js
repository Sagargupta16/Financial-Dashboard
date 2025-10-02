import React from "react";
import { render, screen } from "@testing-library/react";
import { KPICard, SmallKPICard } from "../KPICards";
import { TrendingUp } from "lucide-react";

describe("KPICards", () => {
  describe("KPICard", () => {
    it("should render with required props", () => {
      render(
        <KPICard
          title="Test Title"
          value={1000}
          icon={<TrendingUp />}
          color="green"
        />
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("₹1,000.00")).toBeInTheDocument();
    });

    it("should format currency correctly", () => {
      render(
        <KPICard
          title="Total"
          value={123456.78}
          icon={<TrendingUp />}
          color="blue"
        />
      );

      expect(screen.getByText("₹1,23,456.78")).toBeInTheDocument();
    });
  });

  describe("SmallKPICard", () => {
    it("should render with currency value", () => {
      render(
        <SmallKPICard title="Average" value={500} icon={<TrendingUp />} />
      );

      expect(screen.getByText("Average")).toBeInTheDocument();
      expect(screen.getByText("₹500.00")).toBeInTheDocument();
    });

    it("should render count value when isCount is true", () => {
      render(
        <SmallKPICard
          title="Total Items"
          value={1234}
          icon={<TrendingUp />}
          isCount={true}
        />
      );

      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("should render with unit", () => {
      render(
        <SmallKPICard
          title="Days"
          value={7}
          icon={<TrendingUp />}
          unit="days"
        />
      );

      expect(screen.getByText("days")).toBeInTheDocument();
    });

    it("should render string value", () => {
      render(
        <SmallKPICard title="Status" value="Monday" icon={<TrendingUp />} />
      );

      expect(screen.getByText("Monday")).toBeInTheDocument();
    });
  });
});
