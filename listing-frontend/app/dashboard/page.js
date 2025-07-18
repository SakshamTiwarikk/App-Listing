"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImages, setEditImages] = useState([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ Fetch user listings
  const fetchListings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      console.error("Failed to fetch listings", err);
      router.push("/login");
    }
  };

  // ✅ Handle new listing submit
  const handleAddListing = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      await axios.post("http://localhost:5000/api/listings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowModal(false);
      setName("");
      setPrice("");
      setImages([]);
      fetchListings();
    } catch (err) {
      console.error("Error adding listing", err);
    }
  };

  // ✅ Handle edit listing submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("price", editPrice);
    for (let i = 0; i < editImages.length; i++) {
      formData.append("images", editImages[i]);
    }

    try {
      await axios.put(
        `http://localhost:5000/api/listings/${editListing.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setEditModal(false);
      fetchListings();
    } catch (err) {
      console.error("Error editing listing", err);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    if (!token) router.push("/login");
    else fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Listing
      </button>

      {/* Add Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Listing</h2>
            <form onSubmit={handleAddListing}>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 mb-4 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full px-4 py-2 mb-4 border rounded"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <input
                type="file"
                multiple
                className="w-full mb-4"
                onChange={(e) => setImages(e.target.files)}
                accept="image/*"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Listing</h2>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 mb-4 border rounded"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full px-4 py-2 mb-4 border rounded"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
              <input
                type="file"
                multiple
                className="w-full mb-4"
                onChange={(e) => setEditImages(e.target.files)}
                accept="image/*"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Listings */}
      <h2 className="text-2xl font-semibold mb-4">My Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listings.map((item) => (
          <div key={item.id} className="bg-white shadow p-4 rounded">
            <h3 className="text-lg font-bold mb-2">{item.name}</h3>
            <p className="text-gray-700 mb-2">₹{item.price}</p>
            <div className="flex gap-2 overflow-x-auto mb-2">
              {item.images.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/uploads/${img}`}
                  alt="Listing"
                  className="w-20 h-20 object-cover rounded"
                />
              ))}
            </div>
            <button
              onClick={() => {
                setEditListing(item);
                setEditName(item.name);
                setEditPrice(item.price);
                setEditImages([]);
                setEditModal(true);
              }}
              className="text-sm text-yellow-600 underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
