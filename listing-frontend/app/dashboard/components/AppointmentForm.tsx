"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface AppointmentData {
  customer_name?: string;
  mobile_number?: string;
  property_requirement?: string;
  assigned_employee_id?: number | string;
}

interface AppointmentFormProps {
  initialData?: AppointmentData;
  onSubmit: (form: AppointmentData) => Promise<void>;
  onCancel: () => void;
}

interface Employee {
  id: number;
  name: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState({
    customer_name: initialData?.customer_name || "",
    mobile_number: initialData?.mobile_number || "",
    property_requirement: initialData?.property_requirement || "1BHK",
    assigned_to: initialData?.assigned_employee_id || "",
    customer_photo: null as File | null,
  });

  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employees/active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or wherever you store your token
        },
      })
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Failed to fetch employees", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, customer_photo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white shadow rounded"
    >
      <input
        name="customer_name"
        value={form.customer_name}
        onChange={handleChange}
        placeholder="Customer Name"
        className="border p-2 w-full"
        required
      />
      <input
        name="mobile_number"
        value={form.mobile_number}
        onChange={handleChange}
        placeholder="Mobile Number"
        className="border p-2 w-full"
        required
      />

      <select
        name="property_requirement"
        value={form.property_requirement}
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="1RK">1RK</option>
        <option value="1BHK">1BHK</option>
        <option value="2BHK">2BHK</option>
        <option value="3BHK">3BHK</option>
      </select>

      <select
        name="assigned_to"
        value={form.assigned_to}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      >
        <option value="">Select Employee</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="border p-2 w-full"
      />

      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {initialData ? "Update" : "Book"} Appointment
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
