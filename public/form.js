const form = {
  loginForm: `<header>My Todo App</header>
  <section>
    <div class="login-box">
      <div class="form-title">Login</div>
      <form method="POST" action="/login">
        <input type="text" placeholder="UserId" name="name" />
        <input type="password" placeholder="Password" name="password" />
        <button>Login </button>
      </form>
      <div class="signUp-link">
       <a href="/signUp"> Create Account</a>
      </div>
    </div>
  </section>`,
  signUpForm: `<header>My Todo App</header>
  <section>
    <div class="login-box">
      <div class="form-title">Sign Up</div>
      <form method="POST" action="/">
        <input type="text" placeholder="UserId" name="name" />
        <input type="password" placeholder="Password" name="password" />
        <button>Sign Up</button>
      </form>
    </div>
  </section>`,
  userNameError: `<header>My Todo App</header>
  <section>
    <div class="login-box">
      <div class="form-title">Sign Up</div>
      <form method="POST" action="/">
        <input type="text" placeholder="UserId" name="name" />
        <input type="password" placeholder="Password" name="password" />
        <button>Sign Up</button>
      </form>
      <span class = "errorMsg"> Sorry, UserName already exists </span>
    </div>
  </section>`
};

module.exports = form;
