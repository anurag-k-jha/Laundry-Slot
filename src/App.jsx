
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  WashingMachine,
  CalendarDays,
  History,
  AlertTriangle,
  Settings,
  LogOut,
  Clock,
  CheckCircle,
  Search,
  Plus,
  X,
  Menu,
  User,
  Users,
  Activity,
  Bell,
  RefreshCw,
  Play,
} from "lucide-react";
import "./index.css";

const DEMO_USERS = [
  {
    name: "Laundry Student",
    email: "student@laundryslot.com",
    password: "student123",
    role: "student",
    room: "BH4-603",
  },
  {
    name: "Laundry Caretaker",
    email: "caretaker@laundryslot.com",
    password: "care123",
    role: "caretaker",
    room: "Staff",
  },
];

const INITIAL_MACHINES = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `Washer ${String(index + 1).padStart(2, "0")}`,
  floor: ["Ground Floor", "First Floor", "Second Floor", "Third Floor"][
    Math.floor(index / 3)
  ],
  status:
    index === 2 || index === 9
      ? "Faulty"
      : index === 1 || index === 4 || index === 7
      ? "Running"
      : "Available",
  duration: 40,
  remaining: 0,
}));

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [user, setUser] = useState(() => readStorage("ls_user", null));
  const [users, setUsers] = useState(() => readStorage("ls_users", DEMO_USERS));
  const [machines, setMachines] = useState(() =>
    readStorage("ls_machines", INITIAL_MACHINES)
  );
  const [bookings, setBookings] = useState(() =>
    readStorage("ls_bookings", [])
  );
  const [faults, setFaults] = useState(() =>
    readStorage("ls_faults", [])
  );

  const [page, setPage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [message, setMessage] = useState("");
  const [bookingMachine, setBookingMachine] = useState(null);
  const [faultMachine, setFaultMachine] = useState(null);

  useEffect(() => {
    localStorage.setItem("ls_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("ls_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("ls_machines", JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem("ls_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("ls_faults", JSON.stringify(faults));
  }, [faults]);

  // Machine countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setMachines((previous) =>
        previous.map((machine) => {
          if (machine.status !== "Running" || machine.remaining <= 0) {
            return machine;
          }

          const remaining = machine.remaining - 1;

          if (remaining <= 0) {
            return { ...machine, status: "Available", remaining: 0 };
          }

          return { ...machine, remaining };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Complete expired bookings
  useEffect(() => {
    setBookings((previous) =>
      previous.map((booking) => {
        if (booking.status !== "Running") return booking;

        const machine = machines.find((m) => m.id === booking.machineId);

        if (!machine || machine.remaining <= 0) {
          return { ...booking, status: "Completed" };
        }

        return booking;
      })
    );
  }, [machines]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  const login = (email, password) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (!found) {
      showMessage("Invalid email or password.");
      return false;
    }

    setUser(found);
    setPage("Dashboard");
    setMessage("");
    return true;
  };

  const register = (details) => {
    const exists = users.some(
      (u) => u.email.toLowerCase() === details.email.trim().toLowerCase()
    );

    if (exists) {
      return "This email is already registered.";
    }

    const newUser = { ...details, role: "student" };
    setUsers((previous) => [...previous, newUser]);
    showMessage("Registration successful. Please log in.");
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ls_user");
    setPage("Dashboard");
    setMenuOpen(false);
  };

  const createBooking = (machineId, date, time) => {
    const machine = machines.find((m) => m.id === machineId);

    if (!machine || machine.status !== "Available") {
      return "This machine is not available.";
    }

    if (!date || !time) return "Please select a date and time.";

    const selectedDate = new Date(`${date}T${time}`);
    if (selectedDate < new Date()) return "Please select a future time.";

    const conflict = bookings.some(
      (b) =>
        b.machineId === machineId &&
        b.date === date &&
        b.time === time &&
        ["Upcoming", "Running"].includes(b.status)
    );

    if (conflict) return "This time slot is already booked.";

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
   
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weeklyCount = bookings.filter((b) => {
      if (b.userEmail !== user.email || b.status === "Cancelled") return false;
      const bookingDate = new Date(`${b.date}T00:00:00`);
      return bookingDate >= weekStart;
    }).length;

    if (weeklyCount >= 3) {
      return "You have reached the weekly booking limit of 3.";
    }

    const newBooking = {
      id: Date.now(),
      userEmail: user.email,
      userName: user.name,
      machineId,
      machineName: machine.name,
      floor: machine.floor,
      date,
      time,
      status: "Upcoming",
    };

    setBookings((previous) => [newBooking, ...previous]);
    showMessage("Booking created successfully!");
    return null;
  };

  const cancelBooking = (bookingId) => {
    setBookings((previous) =>
      previous.map((b) =>
        b.id === bookingId ? { ...b, status: "Cancelled" } : b
      )
    );
    showMessage("Booking cancelled.");
  };

  const rescheduleBooking = (bookingId, date, time) => {
    if (!date || !time) return "Please select a date and time.";

    if (new Date(`${date}T${time}`) < new Date()) {
      return "Please select a future time.";
    }

    const booking = bookings.find((b) => b.id === bookingId);

    const conflict = bookings.some(
      (b) =>
        b.id !== bookingId &&
        b.machineId === booking.machineId &&
        b.date === date &&
        b.time === time &&
        ["Upcoming", "Running"].includes(b.status)
    );

    if (conflict) return "This time slot is already booked.";

    setBookings((previous) =>
      previous.map((b) =>
        b.id === bookingId ? { ...b, date, time } : b
      )
    );

    showMessage("Booking rescheduled.");
    return null;
  };

  const startCycle = (machineId) => {
    setMachines((previous) =>
      previous.map((m) =>
        m.id === machineId
          ? { ...m, status: "Running", remaining: m.duration * 60 }
          : m
      )
    );

    setBookings((previous) =>
      previous.map((b) =>
        b.machineId === machineId && b.status === "Upcoming"
          ? { ...b, status: "Running" }
          : b
      )
    );

    showMessage("Laundry cycle started.");
  };

  const updateMachine = (id, status) => {
    setMachines((previous) =>
      previous.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              remaining: status === "Running" ? m.duration * 60 : 0,
            }
          : m
      )
    );
    showMessage("Machine status updated.");
  };

  const reportFault = (machineId, type, description) => {
    const machine = machines.find((m) => m.id === machineId);

    const report = {
      id: Date.now(),
      machineId,
      machineName: machine?.name || "Unknown Machine",
      type,
      description,
      userEmail: user.email,
      userName: user.name,
      createdAt: new Date().toLocaleString(),
      status: "Reported",
    };

    setFaults((previous) => [report, ...previous]);
    updateMachine(machineId, "Faulty");
    showMessage("Fault reported successfully.");
  };

  const updateFault = (faultId, status) => {
    setFaults((previous) =>
      previous.map((f) => (f.id === faultId ? { ...f, status } : f))
    );

    if (status === "Resolved") {
      const fault = faults.find((f) => f.id === faultId);
      if (fault) updateMachine(fault.machineId, "Available");
    }

    showMessage("Fault report updated.");
  };

  if (!user) {
    return (
      <AuthPage
        users={users}
        onLogin={login}
        onRegister={register}
        message={message}
      />
    );
  }

  const isCaretaker = user.role === "caretaker";

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Machines", icon: WashingMachine },
    { name: "My Bookings", icon: CalendarDays },
    { name: "Fault Reports", icon: AlertTriangle },
    { name: "History", icon: History },
    ...(isCaretaker ? [{ name: "Manage Machines", icon: Settings }] : []),
  ];

  const visibleMachines = machines.filter((machine) => {
    return (
      (floorFilter === "All Floors" || machine.floor === floorFilter) &&
      (statusFilter === "All Statuses" || machine.status === statusFilter) &&
      machine.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const myBookings = isCaretaker
    ? bookings
    : bookings.filter((b) => b.userEmail === user.email);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <WashingMachine size={24} />
          </div>
          <div>
            <h2>Laundry Slot</h2>
            <span>Hostel Booking System</span>
          </div>
        </div>

        <div className="nav-label">MENU</div>

        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setPage(item.name);
              setMenuOpen(false);
            }}
            className={`nav-item ${page === item.name ? "active" : ""}`}
          >
            <item.icon size={19} />
            <span>{item.name}</span>
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-mini-text">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
          </div>

          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={22} />
          </button>

          <div>
            <span className="welcome-text">Welcome back,</span>
            <strong>{user.name}</strong>
          </div>

          <div className="topbar-right">
            <div className="demo-badge">DEMO MODE</div>
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {message && (
          <div className="toast">
            <CheckCircle size={18} />
            {message}
          </div>
        )}

        {page === "Dashboard" && (
          <Dashboard
            user={user}
            machines={machines}
            bookings={myBookings}
            faults={faults}
            onNavigate={setPage}
          />
        )}

        {page === "Machines" && (
          <MachinesPage
            machines={visibleMachines}
            search={search}
            setSearch={setSearch}
            floorFilter={floorFilter}
            setFloorFilter={setFloorFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onBook={setBookingMachine}
            onReport={setFaultMachine}
            onStart={startCycle}
            user={user}
          />
        )}

        {page === "My Bookings" && (
          <BookingsPage
            bookings={myBookings}
            onCancel={cancelBooking}
            onReschedule={rescheduleBooking}
            onStart={startCycle}
            user={user}
          />
        )}

        {page === "Fault Reports" && (
          <FaultsPage
            faults={faults.filter((f) =>
              isCaretaker ? true : f.userEmail === user.email
            )}
            machines={machines}
            onReport={reportFault}
            onUpdate={updateFault}
            isCaretaker={isCaretaker}
          />
        )}

        {page === "History" && (
          <HistoryPage bookings={myBookings} />
        )}

        {page === "Manage Machines" && isCaretaker && (
          <ManageMachinesPage
            machines={machines}
            faults={faults}
            onUpdateMachine={updateMachine}
            onUpdateFault={updateFault}
          />
        )}
      </main>

      {bookingMachine && (
        <BookingModal
          machine={bookingMachine}
          onClose={() => setBookingMachine(null)}
          onSubmit={(date, time) => {
            const error = createBooking(bookingMachine.id, date, time);
            if (!error) setBookingMachine(null);
            return error;
          }}
        />
      )}

      {faultMachine && (
        <FaultModal
          machine={faultMachine}
          onClose={() => setFaultMachine(null)}
          onSubmit={(type, description) => {
            reportFault(faultMachine.id, type, description);
            setFaultMachine(null);
          }}
        />
      )}
    </div>
  );
}

// LOGIN AND REGISTRATION

function AuthPage({ users, onLogin, onRegister, message }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    room: "",
    building: "",
    password: "",
    confirmPassword: "",
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!onLogin(email, password)) {
      setError("Incorrect email or password.");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const result = onRegister(form);
    if (result) {
      setError(result);
      return;
    }

    setMode("login");
    setEmail(form.email);
    setPassword("");
    setForm({
      name: "",
      email: "",
      phone: "",
      room: "",
      building: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <WashingMachine size={30} />
        </div>

        <h1>{mode === "login" ? "Laundry Slot" : "Create Account"}</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Hostel laundry booking made simple"
            : "Register as a hostel student"}
        </p>

        {(error || message) && (
          <div className="auth-error">{error || message}</div>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <label>Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="primary-btn full-btn" type="submit">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div>
                <label>Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <label>Room Number</label>
                <input
                  value={form.room}
                  onChange={(e) => update("room", e.target.value)}
                  placeholder="Room number"
                  required
                />
              </div>
              <div>
                <label>Building</label>
                <input
                  value={form.building}
                  onChange={(e) => update("building", e.target.value)}
                  placeholder="Hostel name"
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Create password"
                  required
                />
              </div>
              <div className="full-width">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
            <button className="primary-btn full-btn" type="submit">
              Create Account
            </button>
          </form>
        )}

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => { setMode("register"); setError(""); }}>
                Register
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button onClick={() => { setMode("login"); setError(""); }}>
                Sign in
              </button>
            </>
          )}
        </div>

        {mode === "login" && (
          <div className="demo-credentials">
            <strong>Demo Accounts</strong>
            <p>Student: student@laundryslot.com</p>
            <p>Password: student123</p>
            <hr />
            <p>Caretaker: caretaker@laundryslot.com</p>
            <p>Password: care123</p>
          </div>
        )}
      </div>
    </div>
  );
}

// DASHBOARD

function Dashboard({ user, machines, bookings, faults, onNavigate }) {
  const available = machines.filter((m) => m.status === "Available").length;
  const running = machines.filter((m) => m.status === "Running").length;
  const faulty = machines.filter((m) => m.status === "Faulty").length;
  const upcoming = bookings.find((b) => b.status === "Upcoming");

  return (
    <div className="page">
      <PageHeading
        title="Dashboard"
        subtitle="Overview of your hostel laundry facility"
      />

      <div className="stats-grid">
        <StatCard title="Total Machines" value={machines.length} icon={<WashingMachine />} color="blue" />
        <StatCard title="Available" value={available} icon={<CheckCircle />} color="green" />
        <StatCard title="Running" value={running} icon={<Activity />} color="orange" />
        <StatCard title="Faulty" value={faulty} icon={<AlertTriangle />} color="red" />
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Machine Status</h2>
            <button className="text-btn" onClick={() => onNavigate("Machines")}>
              View All
            </button>
          </div>

          <div className="status-list">
            {machines.slice(0, 6).map((machine) => (
              <div className="status-row" key={machine.id}>
                <div className="machine-icon"><WashingMachine size={20} /></div>
                <div className="status-info">
                  <strong>{machine.name}</strong>
                  <span>{machine.floor}</span>
                </div>
                <StatusBadge status={machine.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>My Upcoming Booking</h2>
          </div>

          {upcoming ? (
            <div className="upcoming-box">
              <div className="machine-icon large"><WashingMachine size={26} /></div>
              <h3>{upcoming.machineName}</h3>
              <p>{upcoming.floor}</p>
              <div className="upcoming-detail">
                <CalendarDays size={16} /> {upcoming.date}
              </div>
              <div className="upcoming-detail">
                <Clock size={16} /> {upcoming.time}
              </div>
              <StatusBadge status={upcoming.status} />
            </div>
          ) : (
            <div className="empty-state">
              <CalendarDays size={35} />
              <p>No upcoming booking</p>
              <button className="primary-btn" onClick={() => onNavigate("Machines")}>
                Book a Machine
              </button>
            </div>
          )}

          <div className="quick-actions">
            <button className="quick-action" onClick={() => onNavigate("Machines")}>
              <Plus size={18} /> New Booking
            </button>
            <button className="quick-action" onClick={() => onNavigate("My Bookings")}>
              <History size={18} /> My Bookings
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <h2>Welcome, {user.name}</h2>
        </div>
        <p className="muted">
          Use Laundry Slot to find an available washing machine, reserve a time,
          manage your laundry bookings and report machine problems.
        </p>
      </div>
    </div>
  );
}

// MACHINES

function MachinesPage({
  machines,
  search,
  setSearch,
  floorFilter,
  setFloorFilter,
  statusFilter,
  setStatusFilter,
  onBook,
  onReport,
  onStart,
  user,
}) {
  return (
    <div className="page">
      <PageHeading title="Machines" subtitle="Find and book a washing machine" />

      <div className="filter-panel">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search machines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
          <option>All Floors</option>
          <option>Ground Floor</option>
          <option>First Floor</option>
          <option>Second Floor</option>
          <option>Third Floor</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Statuses</option>
          <option>Available</option>
          <option>Running</option>
          <option>Faulty</option>
        </select>
      </div>

      <div className="machine-grid">
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onBook={() => onBook(machine)}
            onReport={() => onReport(machine)}
            onStart={() => onStart(machine.id)}
          />
        ))}
      </div>

      {machines.length === 0 && (
        <div className="empty-state">
          <Search size={35} />
          <p>No machines match your filters.</p>
        </div>
      )}
    </div>
  );
}

function MachineCard({ machine, onBook, onReport, onStart }) {
  return (
    <div className="machine-card">
      <div className="machine-card-top">
        <div className="machine-icon large"><WashingMachine size={25} /></div>
        <StatusBadge status={machine.status} />
      </div>

      <h3>{machine.name}</h3>
      <p className="muted">{machine.floor}</p>

      <div className="machine-details">
        <div><Clock size={16} /> {machine.duration} min cycle</div>
        {machine.status === "Running" && (
          <div className="timer-text">
            <Activity size={16} /> {formatTime(machine.remaining)}
          </div>
        )}
      </div>

      {machine.status === "Available" && (
        <button className="primary-btn full-btn" onClick={onBook}>
          <CalendarDays size={17} /> Book Slot
        </button>
      )}

      {machine.status === "Running" && (
        <button className="secondary-btn full-btn" onClick={onStart}>
          <Play size={16} /> Demo Start Cycle
        </button>
      )}

      {machine.status === "Faulty" && (
        <button className="danger-btn full-btn" disabled>
          <AlertTriangle size={16} /> Unavailable
        </button>
      )}

      <button className="outline-btn full-btn" onClick={onReport}>
        Report a Fault
      </button>
    </div>
  );
}

// BOOKING PAGE

function BookingsPage({ bookings, onCancel, onReschedule, onStart, user }) {
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="page">
      <PageHeading title="My Bookings" subtitle="Manage your laundry reservations" />

      <div className="panel">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={36} />
            <p>No bookings yet.</p>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <div className="machine-icon"><WashingMachine size={22} /></div>
                <div className="booking-info">
                  <h3>{booking.machineName}</h3>
                  <p>{booking.floor}</p>
                  <p><CalendarDays size={15} /> {booking.date}</p>
                  <p><Clock size={15} /> {booking.time}</p>
                  {user.role === "caretaker" && <p>Student: {booking.userName}</p>}
                </div>
                <div className="booking-actions">
                  <StatusBadge status={booking.status} />
                  {booking.status === "Upcoming" && (
                    <>
                      <button className="outline-btn" onClick={() => {
                        setRescheduleId(booking.id);
                        setNewDate(booking.date);
                        setNewTime(booking.time);
                        setError("");
                      }}>
                        Reschedule
                      </button>
                      <button className="danger-outline-btn" onClick={() => onCancel(booking.id)}>
                        Cancel
                      </button>
                      <button className="primary-btn" onClick={() => onStart(booking.machineId)}>
                        Start Cycle
                      </button>
                    </>
                  )}
                </div>

                {rescheduleId === booking.id && (
                  <div className="reschedule-form">
                    <label>New Date</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    <label>New Time</label>
                    <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    {error && <div className="auth-error">{error}</div>}
                    <button className="primary-btn" onClick={() => {
                      const result = onReschedule(booking.id, newDate, newTime);
                      if (result) setError(result);
                      else setRescheduleId(null);
                    }}>Save Changes</button>
                    <button className="outline-btn" onClick={() => setRescheduleId(null)}>Close</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// FAULTS

function FaultsPage({ faults, machines, onReport, onUpdate, isCaretaker }) {
  const [machineId, setMachineId] = useState("");
  const [type, setType] = useState("Machine not starting");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!machineId || !description.trim()) return;
    onReport(Number(machineId), type, description);
    setMachineId("");
    setDescription("");
  };

  return (
    <div className="page">
      <PageHeading title="Fault Reports" subtitle="Report and track laundry machine problems" />

      {!isCaretaker && (
        <div className="panel">
          <h2>Report a Machine Problem</h2>
          <form onSubmit={handleSubmit} className="fault-form">
            <label>Machine</label>
            <select value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
              <option value="">Select machine</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.floor}</option>
              ))}
            </select>

            <label>Problem Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Machine not starting</option>
              <option>Water problem</option>
              <option>Excessive noise</option>
              <option>Door problem</option>
              <option>Other</option>
            </select>

            <label>Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..."
              required
            />

            <button className="primary-btn" type="submit">Submit Fault Report</button>
          </form>
        </div>
      )}

      <div className="panel">
        <h2>{isCaretaker ? "All Fault Reports" : "My Reports"}</h2>
        {faults.length === 0 ? (
          <div className="empty-state"><AlertTriangle size={35} /><p>No fault reports available.</p></div>
        ) : (
          faults.map((fault) => (
            <div className="fault-card" key={fault.id}>
              <div>
                <h3>{fault.machineName}</h3>
                <p>{fault.type}</p>
                <p>{fault.description}</p>
                <small>{fault.createdAt} · {fault.userName}</small>
              </div>
              <StatusBadge status={fault.status} />
              {isCaretaker && fault.status !== "Resolved" && (
                <select value={fault.status} onChange={(e) => onUpdate(fault.id, e.target.value)}>
                  <option>Reported</option>
                  <option>Under Maintenance</option>
                  <option>Resolved</option>
                </select>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// CARETAKER

function ManageMachinesPage({ machines, faults, onUpdateMachine, onUpdateFault }) {
  return (
    <div className="page">
      <PageHeading title="Manage Machines" subtitle="Caretaker control panel" />

      <div className="stats-grid">
        <StatCard title="Machines" value={machines.length} icon={<WashingMachine />} color="blue" />
        <StatCard title="Available" value={machines.filter(m => m.status === "Available").length} icon={<CheckCircle />} color="green" />
        <StatCard title="Running" value={machines.filter(m => m.status === "Running").length} icon={<Activity />} color="orange" />
        <StatCard title="Faulty" value={machines.filter(m => m.status === "Faulty").length} icon={<AlertTriangle />} color="red" />
      </div>

      <div className="panel">
        <h2>Machine Controls</h2>
        <div className="manage-list">
          {machines.map((m) => (
            <div className="manage-row" key={m.id}>
              <div className="machine-icon"><WashingMachine size={20} /></div>
              <div className="status-info">
                <strong>{m.name}</strong>
                <span>{m.floor}</span>
              </div>
              <StatusBadge status={m.status} />
              <select value={m.status} onChange={(e) => onUpdateMachine(m.id, e.target.value)}>
                <option>Available</option>
                <option>Running</option>
                <option>Faulty</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Fault Management</h2>
        {faults.length === 0 ? (
          <p className="muted">No fault reports.</p>
        ) : (
          faults.map((f) => (
            <div className="fault-card" key={f.id}>
              <div>
                <h3>{f.machineName}</h3>
                <p>{f.type}</p>
                <p>{f.description}</p>
              </div>
              <StatusBadge status={f.status} />
              {f.status !== "Resolved" && (
                <button className="primary-btn" onClick={() => onUpdateFault(f.id, "Resolved")}>Resolve</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// HISTORY

function HistoryPage({ bookings }) {
  const historical = bookings.filter((b) =>
    ["Completed", "Cancelled"].includes(b.status)
  );

  return (
    <div className="page">
      <PageHeading title="Booking History" subtitle="Completed and cancelled bookings" />

      <div className="panel">
        {historical.length === 0 ? (
          <div className="empty-state"><History size={35} /><p>No booking history yet.</p></div>
        ) : (
          historical.map((booking) => (
            <div className="booking-card" key={booking.id}>
              <div className="machine-icon"><WashingMachine size={22} /></div>
              <div className="booking-info">
                <h3>{booking.machineName}</h3>
                <p>{booking.floor}</p>
                <p>{booking.date} · {booking.time}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// MODALS

function BookingModal({ machine, onClose, onSubmit }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const result = onSubmit(date, time);
    if (result) setError(result);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <h2>Book Machine</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="machine-preview">
          <WashingMachine size={24} />
          <div><strong>{machine.name}</strong><span>{machine.floor} · {machine.duration} minutes</span></div>
        </div>
        <form onSubmit={submit}>
          <label>Booking Date</label>
          <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} required />
          <label>Start Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-btn full-btn" type="submit">Confirm Booking</button>
          <button className="outline-btn full-btn" type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

function FaultModal({ machine, onClose, onSubmit }) {
  const [type, setType] = useState("Machine not starting");
  const [description, setDescription] = useState("");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <h2>Report Fault</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="machine-preview">
          <WashingMachine size={24} />
          <div><strong>{machine.name}</strong><span>{machine.floor}</span></div>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(type, description);
        }}>
          <label>Problem</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>Machine not starting</option>
            <option>Water problem</option>
            <option>Excessive noise</option>
            <option>Door problem</option>
            <option>Other</option>
          </select>
          <label>Description</label>
          <textarea rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <button className="primary-btn full-btn" type="submit">Submit Report</button>
          <button className="outline-btn full-btn" type="button" onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
}

// SHARED COMPONENTS

function PageHeading({ title, subtitle }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="date-chip">
        <CalendarDays size={16} />
        {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
      <div className={`stat-icon ${color}`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = {
    Available: "badge-available",
    Running: "badge-running",
    Faulty: "badge-faulty",
    Upcoming: "badge-upcoming",
    Completed: "badge-completed",
    Cancelled: "badge-cancelled",
    Reported: "badge-reported",
    "Under Maintenance": "badge-maintenance",
    Resolved: "badge-resolved",
  }[status] || "badge-default";

  return <span className={`status-badge ${className}`}>{status}</span>;
}

function formatTime(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default App;
