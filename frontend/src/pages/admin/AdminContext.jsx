import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const AdminContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [engagement, setEngagement] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchOrganization = async () => {
    const response = await axios.get(
      `${API_URL}/admin/organization`,
      getConfig()
    );

    setOrganization(response.data);
    return response.data;
  };

  const fetchEmployees = async () => {
    const response = await axios.get(
      `${API_URL}/admin/employees`,
      getConfig()
    );

    const data = response.data;

    const list =
      data.employees ||
      data.users ||
      data.data ||
      (Array.isArray(data) ? data : []);

    setEmployees(list);
    return list;
  };

  const fetchVehicles = async () => {
    const response = await axios.get(
      `${API_URL}/admin/vehicles`,
      getConfig()
    );

    const data = response.data;

    const list =
      data.vehicles ||
      data.data ||
      (Array.isArray(data) ? data : []);

    setVehicles(list);
    return list;
  };

  const fetchEmployeeEngagement = async () => {
    const response = await axios.get(
      `${API_URL}/admin/employees/engagement`,
      getConfig()
    );

    setEngagement(response.data);
    return response.data;
  };

  const setEmployeeAccess = async (employeeId, isActive) => {
    const response = await axios.patch(
      `${API_URL}/admin/employees/${employeeId}/access`,
      { isActive },
      getConfig()
    );

    await fetchEmployees();

    return response.data;
  };

  const updateEmployee = async (employeeId, data) => {
    const response = await axios.put(
      `${API_URL}/admin/employees/${employeeId}`,
      data,
      getConfig()
    );

    await fetchEmployees();

    return response.data;
  };

  const setVehicleStatus = async (vehicleId, status) => {
    const response = await axios.patch(
      `${API_URL}/admin/vehicles/${vehicleId}/status`,
      { status },
      getConfig()
    );

    await fetchVehicles();

    return response.data;
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchOrganization(),
        fetchEmployees(),
        fetchVehicles(),
        fetchEmployeeEngagement(),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,

    organization,
    employees,
    vehicles,
    engagement,

    loading,
    error,

    fetchOrganization,
    fetchEmployees,
    fetchVehicles,
    fetchEmployeeEngagement,

    setEmployeeAccess,
    updateEmployee,
    setVehicleStatus,

    loadDashboard,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error(
      "useAdmin must be used inside AdminProvider"
    );
  }

  return context;
};

export default AdminContext;