import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import './LoginSignup.css'; // Import the CSS file if using an external stylesheet
import { useNavigate } from 'react-router-dom';

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading,   setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const toggleForm = () => {
        setFormData({ email: '', password: '', username: '' });
        setIsLogin(!isLogin);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const url = isLogin ? '/auth/login' : '/auth/register';

        try {

            const response = await axios.post(url, formData, { withCredentials: true });
            alert(response.data.message);

            if (!isLogin) {
                navigate(`/verify/${response.data.data}`);
            }
            else {
                const v = response.data.data;

                if (!v.isVerified) {
                    try {
                        await axios.post(`/auth/resend-otp/${v.id}`);
                        alert("OTP has been resent to your email");
                        navigate(`/verify/${v.id}`)
                    } catch (err) {
                        alert("Resend OTP failed");
                    }

                }

                else {

                    localStorage.setItem('token', v._id);
                    navigate('/');
                }

            }
        } catch (error) {
            console.error(error);
            alert(error.response.data.message);
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center w-screen h-screen bg-gray-200">
            <div className="flex justify-center items-center container">
                <div className={`card ${isLogin ? '' : 'rotate'}`}>

                    {/* Login Form */}
                    <div className="front face bg-white rounded-lg p-6 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Login</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username"
                                required
                                className="w-full p-2 mb-4 border rounded "
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                className="w-full p-2 mb-4 border rounded "
                            />
                            <button type="submit" disabled={isLoading} className={`w-full text-white py-2 rounded ${isLoading ? "bg-green-300" : " bg-icongreen"} `}>{
                                isLoading ? "Processing..." : "Login"}
                            </button>
                        </form>
                        <p className="text-sm mt-4 text-center">
                            Don't have an account? <span onClick={toggleForm} className="text-icongreen cursor-pointer hover:text-[#39bd3c]">Sign Up</span>
                        </p>
                        <p className="text-sm mt-4 text-center">
                            Forgotten Password? <span onClick={() => navigate('/forgot')} className="text-icongreen cursor-pointer hover:text-[#39bd3c] ">Reset</span>
                        </p>
                    </div>

                    {/* Signup Form */}
                    <div className="back face bg-white rounded-lg p-6 shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="username"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Username"
                                required
                                className="w-full p-2 mb-4 border rounded "
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                                className="w-full p-2 mb-4 border rounded "
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                                className="w-full p-2 mb-4 border rounded "
                            />
                            <button type="submit" disabled={isLoading} className={`w-full  text-white py-2 rounded ${isLoading ? "bg-green-300" : "bg-icongreen"} `}>{
                                isLoading ? "Processing..." : "Sign Up"
                            }</button>
                        </form>
                        <p className="text-sm mt-4 text-center">
                            Already have an account? <span onClick={toggleForm} className="text-icongreen cursor-pointer hover:text-[#39bd3c] ">Login</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
