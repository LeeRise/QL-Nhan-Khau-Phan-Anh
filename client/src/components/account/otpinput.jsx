import { useRef, useState } from "react";

const OtpInput = ({ length = 6, onOtpChange }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    const handleChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(value)) return; 

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const combinedOtp = newOtp.join("");
        onOtpChange(combinedOtp);

        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0" }}>
            {otp.map((data, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                        width: "40px",
                        height: "50px",
                        fontSize: "20px",
                        textAlign: "center",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        outline: "none",
                        backgroundColor: "#f8f9fa"
                    }}
                    onFocus={(e) => (e.target.style.border = "2px solid #3498db")}
                    onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
                />
            ))}
        </div>
    );
};

export default OtpInput;