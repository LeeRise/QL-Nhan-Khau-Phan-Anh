
const TextInput =({
    icon= null,
    type="text",
    id="",
    placeholder="",
    value,name,
    onChange,
    autoComplete="on",
    disabled = false
}
) =>{
  
    
    return(
        <div className="input-block">
            <div className="input-row">
                {icon}
                <input
                className='input-1'
                  type ={type}
                  name={name}
                  id={id}
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  disabled= {disabled}
                  required></input>
            </div>
        </div>
    )

}
export default TextInput