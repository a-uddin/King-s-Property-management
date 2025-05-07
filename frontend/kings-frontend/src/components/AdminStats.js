import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./AdminStats.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const AdminStats = () => {
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`);
        setUsers(usersRes.data);

        const assetsRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assets`);
        setAssets(assetsRes.data);

        const [upcomingRes, ongoingRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/maintenance/upcoming-maintenance`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/maintenance/ongoing-maintenance`)
        ]);

        // Combine both sets into a single array and mark their type
        const combined = [
          ...upcomingRes.data.map((item) => ({
            ...item,
            maintenanceStatus: "upcoming",
          })),
          ...ongoingRes.data.map((item) => ({
            ...item,
            maintenanceStatus: "ongoing",
          })),
        ];

        setMaintenance(combined);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchData();
  }, []);

  const roleData = [
    { name: "Admin", value: users.filter((u) => u.role === "admin").length },
    { name: "Staff", value: users.filter((u) => u.role === "staff").length },
    {
      name: "External Company",
      value: users.filter((u) => u.role === "external_company").length,
    },
  ];

  const assetData = [
    {
      name: "Computer",
      count: assets.filter((a) => a.assetType === "Computer").length,
    },
    {
      name: "Furniture",
      count: assets.filter((a) => a.assetType === "Furniture").length,
    },
    {
      name: "Vehicle",
      count: assets.filter((a) => a.assetType === "Vehicle").length,
    },
    {
      name: "Building",
      count: assets.filter((a) => a.assetType === "Building").length,
    },
    {
      name: "Other",
      count: assets.filter((a) => a.assetType === "Other").length,
    },
  ];

  const maintenanceData = [
    {
      name: "Upcoming",
      count: maintenance.filter((m) => m.maintenanceStatus === "upcoming")
        .length,
    },
    {
      name: "Ongoing",
      count: maintenance.filter((m) => m.maintenanceStatus === "ongoing")
        .length,
    },
  ];

  const approvedUsers = users.filter((u) => u.approved === true);
  const totalUsers = approvedUsers.length;


  return (
    <div className="container admin-stats-font">
      <h2 className="text-center mb-5 mt-4">📊 Admin Dashboard Summary</h2>

      {/* Row 1: 3 cards */}
      <div className="row">
        {/* Total Members + Pie Chart */}
        <div className="col-md-4 mb-4 dashboard-card">
          <div className="card shadow-sm p-3 text-center">
            <h5 className="mb-2">👥 Total Members</h5>
            <h2 className="display-4">{totalUsers}</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ name, x, y, textAnchor, fill }) => (
                    <text
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      fill={fill}
                      fontSize={10} // 📏 smaller font size for smoother fitting
                      fontWeight="bold" // (optional) make it a bit bold for clarity
                    >
                      {name === "External Company" ? (
                        <>
                          <tspan x={x} dy="0em">
                            External
                          </tspan>
                          <tspan x={x} dy="1.2em">
                            Company
                          </tspan>
                        </>
                      ) : (
                        name
                      )}
                    </text>
                  )}
                >
                  {roleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets Summary */}
        <div className="col-md-4 mb-4 dashboard-card">
          <div className="card shadow-sm p-3 text-center">
            <h5 className="mb-2">📦 Assets Summary</h5>
            <ResponsiveContainer width="102%" height={200}>
              <BarChart
                data={assetData}
                margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />

                <Tooltip
                  labelFormatter={() => ""}
                  formatter={(value, name, props) => {
                    if (props && props.payload && props.payload.name) {
                      return [`${props.payload.name}: ${value}`];
                    }
                    return [value];
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    color: "#333",
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  activeBar={{
                    fill: "lightgreen",
                    stroke: "#4c5abf",
                    strokeWidth: 2,
                    radius: [8, 8, 0, 0],
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Summary */}
        <div className="col-md-4 mb-4 dashboard-card">
          <div className="card shadow-sm p-3 text-center">
            <h5 className="mb-2">🛠️ Maintenance Summary</h5>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={maintenanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={() => ""}
                  formatter={(value, name, props) => {
                    if (props && props.payload && props.payload.name) {
                      return [`${props.payload.name}: ${value}`];
                    }
                    return [value];
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    border: "none",
                    color: "#333",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#82ca9d"
                  activeBar={{
                    fill: "navy",
                    stroke: "#4c5abf",
                    strokeWidth: 2,
                    radius: [8, 8, 0, 0],
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
