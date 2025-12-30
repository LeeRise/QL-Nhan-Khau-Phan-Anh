import { useState, useEffect } from "react";
import {FaUser, FaKey} from 'react-icons/fa'
import {useDispatch} from "react-redux";
import { loginUser } from "../redux/auth_redux";
import Header from "../Header";
import { useNavigate,Link } from "react-router-dom";
import TextInput from "../input";
const Login=()=>{
    const dispatch = useDispatch();
    const [errorMessage, setErrorMessage] = useState("");
    const [inputs, setInputs] = useState({cccd:"",matkhau:""});
    const [status, setSatus]= useState("idle");
    const [error,setError] = useState(null);

    const navigate = useNavigate();
    const handleSubmit = (e)=>{
        e.preventDefault();
        dispatch(loginUser(inputs.cccd, inputs.matkhau,setSatus,setError));

    }
    const handleChange = (e)=>{
        const {name, value}= e.target;
        setInputs(prev=>({...prev,[name]: value}));
        if(error){
            setSatus("idle");
            setError(null);
        }
    }
    useEffect(()=>{
        if(status==="success"){
            navigate('/');
        }
    },[status,navigate])
    useEffect(()=>{
        if(error===null){
            setErrorMessage("");
            return;
        }
        setErrorMessage(error.message);
    },[error]);
    return(
        <div className="logina">
            
            <div className="login-content">
            <div className="login1">
            <h1>Đăng nhập</h1>
            <form onSubmit={handleSubmit} 
        >
            <TextInput 
          labelText="ten_dn"
          id="form2"
          name="cccd"
          placeholder="Mã CCCD"
          value={inputs.cccd}
          onChange={handleChange}
          icon={<FaUser/>}
        />
        <TextInput 
          labelText="Password"
          id="form3"
          name="matkhau"
          type="password"
          placeholder="Mật khẩu"
          value={inputs.matkhau}
          onChange={handleChange}
          icon={<FaKey/>}
        />
        
        <button 
          className="btn-primary"
          disabled={ inputs.password === "" || inputs.email === ""}>
            Đăng nhập
        </button >
        <br/>
        {errorMessage !=="" && <p className="error-message">{errorMessage}</p>}

        <Link to="/forgotPassword" className="forgotPass"> Quên mật khẩu</Link>
        </form>
        </div>
       </div>
        </div>
    )
}
export default Login