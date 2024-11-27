import Navbar from '../components/navbar';
import { useRecoilState } from "recoil"
import { signupuser } from "../store/atoms/signupUser"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useState } from "react"

function SignupLab() {
    const [signUpData, setSignUpData] = useRecoilState(signupuser)
    const [isLoading, setIsLoading] = useState(false)
    const [err,setErr] = useState("")

    const navigate = useNavigate()

    function handleChange(event) {
        const { name, value } = event.target
        setSignUpData(prevSignUpData => ({
            ...prevSignUpData,
            [name]: value
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if(signUpData.Password === signUpData.ConfirmPassword){
            setIsLoading(true)
            try {
                await axios({
                    url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/signuplab`,
                    method: "POST",
                    data: JSON.stringify({
                        lab_name: signUpData.LabName,
                        owner_name: signUpData.OwnerName,
                        email: signUpData.Email,
                        phone: signUpData.Phone,
                        password: signUpData.Password,
                        license_no: signUpData.LicenseNo,
                        gst_no: signUpData.GSTNo,
                        address: signUpData.Address,
                        state: signUpData.State,
                        city: signUpData.City,
                        pincode: signUpData.Pincode
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                navigate('/signinlab')
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        } else {
            console.log("Password and Confirm Password doesn't match")
            setErr("Password and Confirm Password doesn't match")
        }
    }

    return (
        <div className="signup flex justify-center items-center min-h-screen bg-black mt-16">
            <Navbar />
            <form
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
                onSubmit={handleSubmit}
            >
                <label
                    htmlFor="name"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    LAB NAME
                </label>
                <input
                    type="text"
                    id="name"
                    placeholder="Enter Lab Name"
                    name="LabName"
                    value={signUpData.LabName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="owner_name"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    OWNER NAME
                </label>
                <input
                    type="text"
                    id="owner_name"
                    placeholder="Enter Owner Name"
                    name="OwnerName"
                    value={signUpData.OwnerName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="email"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    EMAIL
                </label>
                <input
                    type="text"
                    id="email"
                    placeholder="Enter Email"
                    name="Email"
                    value={signUpData.Email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="phone"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    PHONE
                </label>
                <input
                    type="text"
                    id="phone"
                    placeholder="Enter Phone Number"
                    name="Phone"
                    value={signUpData.Phone || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="License"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    LICENSE NO
                </label>
                <input
                    type="text"
                    id="License"
                    placeholder="Enter License Number"
                    name="LicenseNo"
                    value={signUpData.LicenseNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="gst"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    GST NO
                </label>
                <input
                    type="text"
                    id="gst"
                    placeholder="Enter GST Number"
                    name="GSTNo"
                    value={signUpData.GSTNo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="Address"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    ADDRESS
                </label>
                <input
                    type="text"
                    id="Address"
                    placeholder="Enter Address"
                    name="Address"
                    value={signUpData.Address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="State"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    STATE
                </label>
                <input
                    type="text"
                    id="State"
                    placeholder="Enter State"
                    name="State"
                    value={signUpData.State}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="City"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    CITY
                </label>
                <input
                    type="text"
                    id="City"
                    placeholder="Enter City"
                    name="City"
                    value={signUpData.City}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="pincode"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    PINCODE
                </label>
                <input
                    type="text"
                    id="pincode"
                    placeholder="Enter Pincode"
                    name="Pincode"
                    value={signUpData.Pincode || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="password"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    PASSWORD
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    name="Password"
                    value={signUpData.Password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="cnfpswd"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    CONFIRM PASSWORD
                </label>
                <input
                    type="password"
                    id="cnfpswd"
                    placeholder="Confirm password"
                    name="ConfirmPassword"
                    value={signUpData.ConfirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                {err && <p className="text-red-500 mb-4">{err}</p>}
                <button
                    type="submit"
                    className={`w-full py-2 rounded-lg text-white transition duration-200 ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg
                                className="animate-spin h-5 w-5 mr-3 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zM12 16a4 4 0 010-8V4a8 8 0 100 16v-4z"
                                ></path>
                            </svg>
                            Signing Up...
                        </div>
                    ) : (
                        'Sign Up as Lab'
                    )}
                </button>
            </form>
        </div>
    )
}

export default SignupLab