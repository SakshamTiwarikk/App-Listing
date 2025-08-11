"use client";

import React, { useEffect, useState } from "react";
import AppointmentForm from "./components/AppointmentForm";
import { useDebounce } from "../../hooks/useDebounce"; // Adjust path as needed
import Image from "next/image";

const BookAppointment = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Search
  const [searchName, setSearchName] = useState("");
  const [searchMobile, setSearchMobile] = useState("");

  const debouncedSearchName = useDebounce(searchName, 500);
  const debouncedSearchMobile = useDebounce(searchMobile, 500);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const rowsPerPage = 5;

  const fetchAppointments = async (page = 1, name = "", mobile = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...(name && { searchName: name }),
        ...(mobile && { searchMobile: mobile }),
      });

      const res = await fetch(
        `http://localhost:5000/api/appointments?searchName=${searchName}&searchMobile=${searchMobile}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        const totalRecords = data.length;
        const totalPages = Math.ceil(totalRecords / rowsPerPage);
        setAppointments(data);
        setPagination({
          currentPage: page,
          totalPages,
          totalRecords,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        });
      } else if (data.appointments) {
        setAppointments(data.appointments);
        setPagination(data.pagination);
      } else {
        setAppointments([]);
        console.error("Unexpected response format", data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1, "", "");
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchAppointments(1, debouncedSearchName, debouncedSearchMobile);
  }, [debouncedSearchName, debouncedSearchMobile]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchAppointments(
        currentPage,
        debouncedSearchName,
        debouncedSearchMobile
      );
    }
  }, [currentPage]);

  const handleSubmit = async (form: any) => {
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:5000/api/appointments/${editing.id}`
      : `http://localhost:5000/api/appointments`;

    const formData = new FormData();
    formData.append("customer_name", form.customer_name);
    formData.append("mobile_number", form.mobile_number);
    formData.append("property_requirement", form.property_requirement);
    formData.append("assigned_employee_id", form.assigned_to);

    if (form.customer_photo instanceof File) {
      formData.append("customer_photo", form.customer_photo);
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to submit form:", res.status, errorText);
      return;
    }

    setEditing(null);
    fetchAppointments(currentPage, debouncedSearchName, debouncedSearchMobile);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this appointment?")) {
      await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchAppointments(
        currentPage,
        debouncedSearchName,
        debouncedSearchMobile
      );
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Book Appointment</h1>

      <AppointmentForm
        initialData={editing}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
      />

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">All Appointments</h2>

      {/* Search */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-2 py-1"
        />
        <input
          type="text"
          placeholder="Search by mobile"
          value={searchMobile}
          onChange={(e) => setSearchMobile(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full inline-block"></div>
          <span className="ml-2">Loading appointments...</span>
        </div>
      )}

      {/* Table */}
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Customer</th>
            <th className="border px-2">Mobile</th>
            <th className="border px-2">Requirement</th>
            <th className="border px-2">Assigned To</th>
            <th className="border px-2">Photo</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 && !loading ? (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                No appointments found
              </td>
            </tr>
          ) : (
            appointments.map((a) => (
              <tr key={a.id}>
                <td className="border px-2">{a.customer_name}</td>
                <td className="border px-2">{a.mobile_number}</td>
                <td className="border px-2">{a.property_requirement}</td>
                <td className="border px-2">{a.employee_name || "-"}</td>
                <td className="border px-2">
                  {a.customer_photo ? (
                    <img
                      src={`http://localhost:5000/uploads/${a.customer_photo}`}
                      alt="Customer"
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border px-2 space-x-2">
                  <button
                    onClick={() => setEditing(a)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {appointments.length} of {pagination.totalRecords}{" "}
          appointments
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={!pagination.hasPrevPage || loading}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!pagination.hasNextPage || loading}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
