import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const AssetStats = () => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/assets`);
        setAssets(res.data);
      } catch (err) {
        console.error("Failed to fetch assets", err);
      }
    };

    fetchAssets();
  }, []);

  const assetTypeCount = assets.reduce((acc, asset) => {
    const type = asset.assetType || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const assetData = Object.entries(assetTypeCount).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📦 Assets Summary</h2>

      <div className="card shadow-sm p-3">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetStats;
