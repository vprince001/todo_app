const form = {
  loginForm: `<h3 style = "text-align: center"> Login </h3>
  <form method="POST" action="/homepage.html">
    <label>Name </label>
    <input
      class="input"
      type="text"
      placeholder="Enter Your Name Here"
      name="name"
    />
    <br />
    <label>Password </label>
    <input
      class="input"
      type="text"
      placeholder="Enter Your Password Here"
      name="password"
    />
    <br />
    <button>Login</button>
  </form>
  <a href="/signUp"> Click here to Sign Up</a>`,
  signUpForm: `<h3 style = "text-align: center"> Sign up </h3>
      <form method="POST" action="/">
        <label>User ID </label>
        <input
          type="text"
          placeholder="User ID"
          name="UserId"
        />
        <br />
        <label>Password </label>
        <input
          type="password"
          placeholder="Enter Your Password Here"
          name="password"
        />
        <br />
        <button type="submit">Submit</button>    
  </form>`,
  userNameError: `<h3 style = "text-align: center"> Sign up </h3>
  <p> Sorry, Username already exists. Try a new one. </P>
      <form method="POST" action="/">
        <label>User ID </label>
        <input
          type="text"
          placeholder="User ID"
          name="UserId"
        />
        <br />
        <label>Password </label>
        <input
          type="password"
          placeholder="Enter Your Password Here"
          name="password"
        />
        <br />
        <button type="submit">Submit</button>    
  </form>`
};

module.exports = form;
