import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import FixtureDetails from "./FixtureDetails";
import LeagueMatches from "./LeagueMatches";
import Leagues from "./Leagues";
import Login from "./Login";
import PlayerDetails from "./PlayerDetails";
import Predictions from "./Predictions";
import Register from "./Register";
import Analytics from "./Analytics";
import HeadToHead from "./HeadToHead";
import AdvancedLeagueTable from "./AdvancedLeagueTable";
import TransferNews from "./TransferNews";
import Dashboard from "./Dashboard";

function NavigationContent() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { user, signOut } = useAuth();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleLogout = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Navigation */}
			<nav className="bg-blue-800 text-white shadow-lg">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center">
							<Link to="/" className="text-2xl font-bold">
								SSport Analytics
							</Link>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex space-x-4">
							<Link to="/" className="text-gray-300 hover:text-white">
								Dashboard
							</Link>
							<Link to="/analytics" className="text-gray-300 hover:text-white">
								Analytics
							</Link>
							<Link to="/leagues" className="text-gray-300 hover:text-white">
								Leagues
							</Link>
							<Link to="/head-to-head" className="text-gray-300 hover:text-white">
								Head-to-Head
							</Link>
							<Link to="/advanced-league-table" className="text-gray-300 hover:text-white">
								Advanced League Table
							</Link>
							<Link to="/transfer-news" className="text-gray-300 hover:text-white">
								Transfer News
							</Link>
							{user ? (
								<>
									<span className="text-gray-300">
										{user.email}
									</span>
									<button
										onClick={handleLogout}
										className="text-gray-300 hover:text-white"
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link to="/login" className="text-gray-300 hover:text-white">
										Login
									</Link>
									<Link to="/register" className="text-gray-300 hover:text-white">
										Register
									</Link>
								</>
							)}
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<button
								onClick={toggleMenu}
								className="text-white focus:outline-none"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									{isMenuOpen ? (
										<path d="M6 18L18 6M6 6l12 12" />
									) : (
										<path d="M4 6h16M4 12h16M4 18h16" />
									)}
								</svg>
							</button>
						</div>
					</div>

					{/* Mobile Navigation */}
					{isMenuOpen && (
						<div className="md:hidden py-4">
							<div className="flex flex-col space-y-4">
								<Link
									to="/"
									className="hover:text-blue-200"
									onClick={() => setIsMenuOpen(false)}
								>
									Dashboard
								</Link>
								<Link
									to="/analytics"
									className="hover:text-blue-200"
									onClick={() => setIsMenuOpen(false)}
								>
									Analytics
								</Link>
								<Link
									to="/leagues"
									className="hover:text-blue-200"
									onClick={() => setIsMenuOpen(false)}
								>
									Leagues
								</Link>
								<Link
									to="/head-to-head"
									className="hover:text-blue-200"
									onClick={() => setIsMenuOpen(false)}
								>
									Head-to-Head
								</Link>
								<Link
									to="/advanced-league-table"
									className="hover:text-blue-200"
									onClick={() => setIsMenuOpen(false)}
								>
									Advanced League Table
								</Link>
								<Link
									to="/transfer-news"
									className="hover:text-blue-200"
									onClick={() => setIsMenuOpen(false)}
								>
									Transfer News
								</Link>
								{user ? (
									<>
										<span className="text-gray-300">
											{user.email}
										</span>
										<button
											onClick={handleLogout}
											className="text-left hover:text-blue-200"
										>
											Logout
										</button>
									</>
								) : (
									<>
										<Link
											to="/login"
											className="hover:text-blue-200"
											onClick={() => setIsMenuOpen(false)}
										>
											Login
										</Link>
										<Link
											to="/register"
											className="hover:text-blue-200"
											onClick={() => setIsMenuOpen(false)}
										>
											Register
										</Link>
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</nav>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/predictions" element={<Predictions />} />
					<Route path="/analytics" element={<Analytics />} />
					<Route path="/leagues" element={<Leagues />} />
					<Route path="/league/:id" element={<LeagueMatches />} />
					<Route path="/fixture/:id" element={<FixtureDetails />} />
					<Route path="/player/:id" element={<PlayerDetails />} />
					<Route path="/head-to-head" element={<HeadToHead />} />
					<Route path="/advanced-league-table" element={<AdvancedLeagueTable />} />
					<Route path="/transfer-news" element={<TransferNews />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			</main>
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<NavigationContent />
			</Router>
		</AuthProvider>
	);
}

export default App;
