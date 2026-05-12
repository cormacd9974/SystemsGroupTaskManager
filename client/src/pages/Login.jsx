import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import { MdOutlineAddTask } from "react-icons/md";
import { toast } from "sonner";
import { Loading } from "../components";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";

const Login = () => {
  const {user} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      // Simulate an API call for login
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
 
  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (
    <div className="w-full min-h-screen flex bg-white">
        <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#0068B5"}}
        >
            <div className="flex items-center gap-3">
                
                <div>
                    <span className="text-white font-bold text-xl leading-none">Systems Group</span>
                    <p className="text-blue-300 text-xs mt-0.5">Production Department</p>
                </div>
            </div>

            <div>
                <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                    Real time task <br />Tracking for your<br />
                    <span className="text-blue-300">whole team.</span>
                </h2>
                <p className="text-base leading-relaxed" style={{ color: "rgba(191,219,254,0.65)"}}>
                    Create traceability and stay on top of your tasks.
                </p>
            </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8 lg:hidden">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                        <MdOutlineAddTask className="text-white text-lg"/>
                    </div>
                    <span className="text-gray-900 font-bold text-lg">Systems Group</span>
                </div>
                <div
                  className="bg-white rounded-2xl p-8 border border-gray-100"
                  style={{ boxShadow: "0 8px 40px rgba(15,35,71,0.10)"}}
                >
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
                        <p className="text-gray-500 text-sm">Continue</p>
                    </div>

                    <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input 
                              type="email"
                              placeholder="you@company.com"
                              className="input-field"
                              {...register("email", {required: "Email Address is required"})}
                            />
                            {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label>
                                Password
                            </label>
                            <input 
                              type="password"
                              placeholder="password"
                              className="input-field"
                              {...register("password", {required: "Password is required"})}
                            />
                            {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                                Forgot Password?
                            </span>
                        </div>

                        {isLoading ? (
                            <Loading />
                        ) : (
                            <button type="submit" className="btn-primary w-full text-center" style={{ backgroundColor: "#0068B5" }}>
                                Sign In
                            </button>
                        )}
                    </form>
                </div>
                <p className="text-center text-gray-400 text-xs mt-6">
                    Authorised personnel only - Systems Group
                </p>
            </div>
        </div>
    </div>
  );
};

export default Login;
