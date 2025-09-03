function Login(){
    


    return (
        <>
            <div className="login-container">
                <div className="login-title">LOGIN</div>
                <div className="login-input-container">
                    <h6>Username</h6>
                    <input type="text" placeholder="Username" />
                    <h6>Password</h6>
                    <input type="password" placeholder="Password"/><br />
                    <a href="#">Forgot Password</a>
                </div>
                <div className="login-signup">
                    <a href="#">Signup</a>
                </div>
            </div>
        </>
    )
}

export default Login