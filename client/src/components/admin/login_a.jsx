import { useState, useEffect } from "react";
import {FaUser, FaKey} from 'react-icons/fa'
import {useDispatch} from "react-redux";
import { login } from "../redux/auth_admin_redux";
import Header from "../Header";
import { useNavigate } from "react-router-dom";
import TextInput from "../input";
const LoginA = () => {
    const dispatch = useDispatch();
    const [inputs, setInputs] = useState({ ten_dn: "", mat_khau: "" });
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const errorMessage = error ?.message || "";

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login(inputs.ten_dn, inputs.mat_khau, setStatus, setError));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
        
        if (error) {
            setStatus("idle");
            setError(null);
        }
    };

    useEffect(() => {
        if (status === "success") {
            navigate('/admin/cap-quyen');
        }
    }, [status, navigate]);

    return (
        <div className="logina">
            <div className="login-content">
            <div className="login1">
                <h1>Đăng nhập</h1>
                <form onSubmit={handleSubmit}>
                    <TextInput
                        labelText="Tên đăng nhập"
                        id="form2"
                        name="ten_dn"
                        placeholder="Tên đăng nhập"
                        value={inputs.ten_dn}
                        onChange={handleChange}
                        icon={<FaUser />}
                    />
                    <TextInput
                        labelText="Password"
                        id="form3"
                        name="mat_khau" 
                        type="password"
                        placeholder="Mật khẩu"
                        value={inputs.mat_khau}
                        onChange={handleChange}
                        icon={<FaKey />}
                    />

                    <button
                        className="btn-primary"
                        disabled={inputs.mat_khau === "" || inputs.ten_dn === "" || status === "loading"}
                    >
                        {status === "loading" ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>
                {errorMessage && <p className="err-mes">{errorMessage}</p>}
            </div>
            </div>
        </div>
    );
};

export default LoginA;