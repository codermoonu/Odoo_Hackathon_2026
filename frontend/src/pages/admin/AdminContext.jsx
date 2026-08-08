import { createContext, useContext, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [engagement, setEngagement] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrganization = async () => {
    const response = await api.get("/admin/organization");
    setOrganization(response.data);
    return response.data;
  };

  const fetchEmployees = async () => {
    const response = await api.get("/admin/employees");
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
    const response = await api.get("/admin/vehicles");
    const data = response.data;

    const list =
      data.vehicles ||
      data.data ||
      (Array.isArray(data) ? data : []);

    setVehicles(list);
    return list;
  };

  const fetchEmployeeEngagement = async () => {
    const response = await api.get("/admin/employees/engagement");
    setEngagement(response.data);
    return response.data;
  };

  const addEmployee = async (data) => {
    const response = await api.post("/admin/employees", data);
    await fetchEmployees();
    if (data.vehicle) await fetchVehicles();
    return response.data;
  };

  const setEmployeeAccess = async (employeeId, isActive) => {
    const response = await api.patch(
      `/admin/employees/${employeeId}/access`,
      { isActive }
    );

    await fetchEmployees();

    return response.data;
  };

  const updateEmployee = async (employeeId, data) => {
    const response = await api.put(`/admin/employees/${employeeId}`, data);

    await fetchEmployees();

    return response.data;
  };

  const setVehicleStatus = async (vehicleId, isActive) => {
    const response = await api.patch(`/admin/vehicles/${vehicleId}/status`, {
      isActive,
    });

    await fetchVehicles();

    return response.data;
  };

  const updateOrganization = async (data) => {
    const response = await api.put("/admin/organization", data);
    setOrganization(response.data);
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
      setError(err.message || "Failed to load admin dashboard");
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

    addEmployee,
    setEmployeeAccess,
    updateEmployee,
    setVehicleStatus,
    updateOrganization,

    loadDashboard,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-location matches AuthContext's pattern
export const useAdmin = () => {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }

  return context;
};

export default AdminContext;
