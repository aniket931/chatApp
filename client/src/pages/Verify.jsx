import { useState, useEffect } from "react";
import axios from "../components/axiosConfig";
import { useNavigate, useParams } from "react-router-dom";

function Verify() {
    const [otp, setOtp] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(59); // Initialize the timer with 59 seconds
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        let countdown;
        if (isResending || timer > 0) {
            // Start the countdown only if the timer is above 0
            countdown = setInterval(() => {
                setTimer((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(countdown); // Cleanup the interval on component unmount
    }, [isResending, timer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/auth/verify/${id}`, { otp });
            alert(response.data.message);
            localStorage.setItem('token', id);
            navigate("/");
        } catch (err) {
            if (err) {
                console.log(err);
                alert(err.response.data.message);
            }
            else {
                alert("Verification failed");
            }
        }
    };

    const handleResendOtp = async () => {

        setIsResending(true);
        setTimer(59); // Reset the timer to 59 seconds when "Resend OTP" is clicked
        try {
            const response = await axios.post(`/auth/resend-otp/${id}`);
            alert("OTP has been resent to your email");
        } catch (err) {
            alert("Resend OTP failed");
        }
        setIsResending(false);
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-200 rounded shadow ">
            <form onSubmit={handleVerify} className="bg-white p-6 rounded shadow-md w-1/3 ">
                <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
                 
                <input
                    className="w-full mb-4 rounded p-2 border"
                    type="text"
                    name="otp"
                    required
                    placeholder="OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                <button type="submit" className="w-full bg-green-500 rounded text-white py-2 mb-4">
                    Verify
                </button>
                <button
                    type="button"
                    onClick={handleResendOtp}
                    className={`w-full bg-blue-500 rounded text-white py-2 ${timer ? "bg-blue-300" : ""}`}
                    disabled={isResending || timer > 0} // Disable button while timer is running
                >
                    {isResending || timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
            </form>
        </div>
    );
}

export default Verify;
