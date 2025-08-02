// app/api/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "employees.json");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read employees from file
async function readEmployees() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default data
    const defaultEmployees = [
      {
        id: 1,
        name: "John Doe",
        dob: "1990-01-15",
        address: "123 Main St, City, State",
        photo: null,
        aadhaar_card: null,
        pan_card: null,
        joining_date: "2023-01-01",
        status: "Active",
        email_id: "john@example.com",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];
    await writeEmployees(defaultEmployees);
    return defaultEmployees;
  }
}

// Write employees to file
async function writeEmployees(employees: any[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(employees, null, 2));
}

// GET - Fetch all employees
export async function GET() {
  try {
    const employees = await readEmployees();
    console.log(
      "GET employees called, returning:",
      employees.length,
      "employees"
    );
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    console.log("POST request received");

    const formData = await request.formData();

    // Extract form data
    const name = formData.get("name") as string;
    const dob = formData.get("dob") as string;
    const address = formData.get("address") as string;
    const joiningDate = formData.get("joiningDate") as string;
    const status = formData.get("status") as string;
    const emailId = formData.get("emailId") as string;

    // Handle file uploads
    const photo = formData.get("photo") as File | null;
    const aadhaarCard = formData.get("aadhaarCard") as File | null;
    const panCard = formData.get("panCard") as File | null;

    console.log("Form data received:", {
      name,
      dob,
      address,
      joiningDate,
      status,
      emailId,
      photo: photo?.name,
      aadhaarCard: aadhaarCard?.name,
      panCard: panCard?.name,
    });

    // Validate required fields
    if (!name || !dob || !address || !joiningDate || !emailId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read existing employees
    const employees = await readEmployees();

    // Create new employee
    const newEmployee = {
      id: Date.now(), // Simple ID generation
      name,
      dob,
      address,
      photo: photo?.name || null,
      aadhaar_card: aadhaarCard?.name || null,
      pan_card: panCard?.name || null,
      joining_date: joiningDate,
      status,
      email_id: emailId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to employees array
    employees.push(newEmployee);

    // Save back to file
    await writeEmployees(employees);

    console.log("Employee created and saved:", newEmployee);
    console.log("Total employees now:", employees.length);

    // Return success response
    return NextResponse.json(
      {
        message: "Employee created successfully",
        employee: newEmployee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create employee",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
