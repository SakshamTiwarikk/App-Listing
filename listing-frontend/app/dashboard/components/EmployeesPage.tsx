"use client";

import React, { useEffect, useState } from "react";

type Employee = {
  id: number;
  name: string;
  dob: string;
  address: string;
  joining_date: string;
  status: string;
  email_id: string;
  photo_url?: string;
  aadhaar_url?: string;
  pan_url?: string;
};

const EmployeePage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    dob: "",
    address: "",
    joining_date: "",
    status: "active",
    email_id: "",
    photo: null as File | null,
    aadhaar_card: null as File | null,
    pan_card: null as File | null,
  });

  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setEmployees(data.employees || data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = [...employees];
    if (filterName.trim()) {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    if (filterStatus) {
      filtered = filtered.filter(
        (emp) => emp.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    setFilteredEmployees(filtered);
  }, [employees, filterName, filterStatus]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newEmployee.name);
      formData.append("dob", newEmployee.dob);
      formData.append("address", newEmployee.address);
      formData.append("joining_date", newEmployee.joining_date);
      formData.append("status", newEmployee.status);
      formData.append("email_id", newEmployee.email_id);

      if (newEmployee.photo) formData.append("photo", newEmployee.photo);
      if (newEmployee.aadhaar_card)
        formData.append("aadhaar_card", newEmployee.aadhaar_card);
      if (newEmployee.pan_card)
        formData.append("pan_card", newEmployee.pan_card);

      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setEmployees((prev) => [...prev, data.employee]);

      setNewEmployee({
        name: "",
        dob: "",
        address: "",
        joining_date: "",
        status: "active",
        email_id: "",
        photo: null,
        aadhaar_card: null,
        pan_card: null,
      });
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>

      <form onSubmit={handleAddEmployee} className="space-y-2 mb-8">
        <h2 className="text-lg font-semibold">Add New Employee</h2>
        <input
          type="text"
          placeholder="Name"
          value={newEmployee.name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, name: e.target.value })
          }
          required
          className="border p-2 w-full"
        />
        <input
          type="email"
          placeholder="Email ID"
          value={newEmployee.email_id}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, email_id: e.target.value })
          }
          required
          className="border p-2 w-full"
        />
        <input
          type="date"
          value={newEmployee.dob}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, dob: e.target.value })
          }
          required
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Address"
          value={newEmployee.address}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, address: e.target.value })
          }
          required
          className="border p-2 w-full"
        />
        <input
          type="date"
          value={newEmployee.joining_date}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, joining_date: e.target.value })
          }
          required
          className="border p-2 w-full"
        />
        <select
          value={newEmployee.status}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, status: e.target.value })
          }
          className="border p-2 w-full"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* File Uploads */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              photo: e.target.files?.[0] || null,
            })
          }
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              aadhaar_card: e.target.files?.[0] || null,
            })
          }
          className="border p-2 w-full"
        />
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              pan_card: e.target.files?.[0] || null,
            })
          }
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Employee
        </button>
      </form>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border p-2"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading employees...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredEmployees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="w-full border border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">DOB</th>
              <th className="border px-4 py-2">Address</th>
              <th className="border px-4 py-2">Joining Date</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Photo</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td className="border px-4 py-2">{emp.id}</td>
                <td className="border px-4 py-2">{emp.name}</td>
                <td className="border px-4 py-2">{emp.email_id}</td>
                <td className="border px-4 py-2">{emp.dob}</td>
                <td className="border px-4 py-2">{emp.address}</td>
                <td className="border px-4 py-2">{emp.joining_date}</td>
                <td className="border px-4 py-2 capitalize">{emp.status}</td>
                <td className="border px-4 py-2">
                  {emp.photo_url ? (
                    <img
                      src={emp.photo_url}
                      alt="Photo"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeePage;
