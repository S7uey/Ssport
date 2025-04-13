import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

function Register() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();

	const handleRegister = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) throw error;
			setSuccess(true);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold text-gray-900 mb-4">
							Check your email
						</h2>
						<div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
							<p>
								We've sent a confirmation email to{" "}
								<strong>{email}</strong>
							</p>
							<p className="mt-2">
								Please check your email and click the
								confirmation link to activate your account.
							</p>
						</div>
						<Link
							to="/login"
							className="text-blue-600 hover:text-blue-500 font-medium">
							Return to login
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleRegister}>
					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
							{error}
						</div>
					)}
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<input
								type="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<input
								type="password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							{loading ? "Creating account..." : "Create account"}
						</button>
					</div>
				</form>

				<div className="text-center">
					<p className="text-sm text-gray-600">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-blue-600 hover:text-blue-500">
							Sign in here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Register;
