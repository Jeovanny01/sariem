// Dashboard.js
import React from 'react';
import Sidebar from "./components/Sidebar";
import Widget from "./components/Widget";
import LineChart from "./components/LineChart";
import PieChart from "./components/PieChart";
import { FaCheck, FaTimes, FaClock, FaBoxOpen } from 'react-icons/fa';

function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Dashboard</h1>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Widget title="Total" value="4848" icon={<FaBoxOpen />} color="#007bff" />
          <Widget title="Con error" value="0" icon={<FaTimes />} color="#dc3545" />
          <Widget title="Procesados" value="4848" icon={<FaCheck />} color="#28a745" />
          <Widget title="Pendientes" value="0" icon={<FaClock />} color="#ffc107" />
        </div>
        <div>
          <h2>Resumen Mensual</h2>
          <LineChart />
        </div>
        <div>
          <h2>Composición por tipo de documento</h2>
          <PieChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
