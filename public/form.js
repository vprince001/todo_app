const form = {
  loginForm: `<header class="login-header">My Todo App</header>
  <section class="login-section">
    <div class="image"></div>
    <div class="login-box-container">
      <div class="login-box">
        <div class="form-title">LOGIN</div>
        <form class="form" method="POST" action="/login">
          <input type="text" placeholder="username" name="name" />
          <input type="password" placeholder="password" name="password" />
          <button>Login</button>
        </form>
        <div class="signUp-link">
        <a href="/signUp"> Create Account</a>
        </div>
      </div>
    </div>
  </section>`,

  signUpForm: `<header class="login-header">My Todo App</header>
  <section class="login-section">
    <div class="image"></div>
    <div class="login-box-container">
      <div class="login-box">
        <div class="form-title">SIGN UP</div>
        <form class="form" method="POST" action="/">
          <input type="text" placeholder="username" name="name" />
          <input type="password" placeholder="password" name="password" />
          <button>Sign Up</button>
        </form>
      </div>
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
