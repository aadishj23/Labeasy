import Navbar from '../components/navbar';
import { useRecoilState, useSetRecoilState } from 'recoil'
import { signin } from '../store/atoms/signin'
import { loggedin } from '../store/atoms/loggedin'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'

const SigninLab = () => {
  const [signInData, setSignInData] = useRecoilState(signin)
    const setLoggedIn = useSetRecoilState(loggedin)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    function handleChangeSignIn(event) {
        const { name, value } = event.target
        setSignInData(prevSignInData => ({
            ...prevSignInData,
            [name]: value
        }))
    }

    async function handleSubmitSignIn(event) {
        event.preventDefault()
        setIsLoading(true)
        try {
            const response = await axios({
                url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/signinlab`,
                method: "POST",
                data: JSON.stringify({
                    email: signInData.Email,
                    password: signInData.Password
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            localStorage.setItem('token', JSON.stringify(response.data.token))
            localStorage.setItem('type', JSON.stringify(response.data.type))
            localStorage.setItem('lab_name', JSON.stringify(response.data.labName))
            setLoggedIn(true)
            navigate('/labsdashboard')
        } catch (error) {
            console.error(error)
            setError('Invalid Credentials')
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <div>
      <Navbar />
      <div className="signin flex justify-center items-center min-h-screen bg-black">
            <form
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
                onSubmit={handleSubmitSignIn}
            >
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
                    value={signInData.Email}
                    onChange={handleChangeSignIn}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <label
                    htmlFor="pswd"
                    className="block text-gray-700 text-sm font-bold mb-2"
                >
                    PASSWORD
                </label>
                <input
                    type="password"
                    id="pswd"
                    placeholder="Enter Password"
                    name="Password"
                    value={signInData.Password}
                    onChange={handleChangeSignIn}
                    className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                {error && (
                    <p className="text-red-500 mb-4">{error}</p>
                )}
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
                            Signing In...
                        </div>
                    ) : (
                        'Sign In as Lab'
                    )}
                </button>
                <p className="mt-4 text-center text-gray-600"> Don't have an account? <a href="/signuplab" className="text-blue-500">Sign Up</a></p>
            </form>
        </div>
    </div>
  )
}

export default SigninLab;