// Login/app.js
class LoginScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      
      <div class="container">
        <div class="header">
          <div class="time">12:42</div>
          <div class="status-icons">
            <div class="signal"></div>
            <div class="wifi"></div>
            <div class="battery"></div>
          </div>
        </div>
        
        <div class="logo-section">
          <svg class="flower-logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="60" rx="20" ry="35" fill="white"/>
            <ellipse cx="140" cy="100" rx="35" ry="20" fill="white"/>
            <ellipse cx="100" cy="140" rx="20" ry="35" fill="white"/>
            <ellipse cx="60" cy="100" rx="35" ry="20" fill="white"/>
            <ellipse cx="130" cy="70" rx="25" ry="25" fill="white"/>
            <ellipse cx="130" cy="130" rx="25" ry="25" fill="white"/>
            <ellipse cx="70" cy="130" rx="25" ry="25" fill="white"/>
            <ellipse cx="70" cy="70" rx="25" ry="25" fill="white"/>
            <circle cx="100" cy="100" r="30" fill="#7EB234"/>
            <ellipse cx="110" cy="40" rx="8" ry="18" fill="white" transform="rotate(-20 110 40)"/>
            <ellipse cx="125" cy="35" rx="10" ry="20" fill="white" transform="rotate(15 125 35)"/>
          </svg>
          
          <div class="plant left-plant">
            <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 150 Q30 100 20 80 Q15 70 10 65" stroke="#659437" stroke-width="4" fill="none"/>
              <ellipse cx="10" cy="65" rx="8" ry="15" fill="#659437" transform="rotate(-30 10 65)"/>
              <path d="M20 80 Q15 75 12 70" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="12" cy="68" rx="6" ry="12" fill="#659437" transform="rotate(-40 12 68)"/>
              <path d="M30 100 Q25 90 20 85" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="20" cy="83" rx="7" ry="13" fill="#659437" transform="rotate(-35 20 83)"/>
              <path d="M40 120 Q35 110 30 105" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="29" cy="103" rx="6" ry="12" fill="#659437" transform="rotate(-30 29 103)"/>
            </svg>
          </div>
          
          <div class="plant right-plant">
            <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 150 Q70 100 80 80 Q85 70 90 65" stroke="#659437" stroke-width="4" fill="none"/>
              <ellipse cx="90" cy="65" rx="8" ry="15" fill="#659437" transform="rotate(30 90 65)"/>
              <path d="M80 80 Q85 75 88 70" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="88" cy="68" rx="6" ry="12" fill="#659437" transform="rotate(40 88 68)"/>
              <path d="M70 100 Q75 90 80 85" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="80" cy="83" rx="7" ry="13" fill="#659437" transform="rotate(35 80 83)"/>
              <path d="M60 120 Q65 110 70 105" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="71" cy="103" rx="6" ry="12" fill="#659437" transform="rotate(30 71 103)"/>
              <path d="M52 140 Q58 130 62 125" stroke="#659437" stroke-width="3" fill="none"/>
              <ellipse cx="63" cy="123" rx="6" ry="11" fill="#659437" transform="rotate(25 63 123)"/>
            </svg>
          </div>
        </div>
        
        <div class="form-section">
          <h1 class="title">Connect with nature, one click at a time.</h1>
          
          <form class="login-form">
            <div class="input-group">
              <label for="username">Username</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#7EB234" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="#7EB234" stroke-width="2"/>
                </svg>
                <input type="text" id="username" placeholder="Username" />
              </div>
            </div>
            
            <div class="input-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#7EB234" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#7EB234" stroke-width="2"/>
                </svg>
                <input type="password" id="password" placeholder="••••••••••••••" />
                <button type="button" class="eye-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#7EB234" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="#7EB234" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="signup-text">
              Don't have an account? <a href="#" class="signup-link">Sing Up</a>
            </div>
            
            <button type="submit" class="signin-btn">Sing In</button>
          </form>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const eyeIcon = this.shadowRoot.querySelector(".eye-icon");
    const passwordInput = this.shadowRoot.querySelector("#password");

    eyeIcon.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
    });

    const form = this.shadowRoot.querySelector(".login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = this.shadowRoot.querySelector("#username").value;
      const password = this.shadowRoot.querySelector("#password").value;

      // Emitir evento personalizado para que lo capture el router
      this.dispatchEvent(
        new CustomEvent("login-submit", {
          detail: { username, password },
          bubbles: true,
          composed: true,
        })
      );
    });

    const signupLink = this.shadowRoot.querySelector(".signup-link");
    signupLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("navigate-signup", {
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  getStyles() {
    return `
      body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :host {
        display: block;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .container {
        width: 100%;
        height: 100vh;
        background: linear-gradient(180deg, #7EB234 0%, #7EB234 55%, #f5f5f0 55%, #f5f5f0 100%);
        position: relative;
        overflow: hidden;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 25px;
        color: white;
        font-size: 18px;
        font-weight: 600;
      }

      .status-icons {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .signal,
      .wifi,
      .battery {
        width: 20px;
        height: 12px;
        background: white;
        border-radius: 2px;
      }

      .signal {
        -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='1' y='16' width='3' height='8'/%3E%3Crect x='6' y='12' width='3' height='12'/%3E%3Crect x='11' y='8' width='3' height='16'/%3E%3Crect x='16' y='4' width='3' height='20'/%3E%3C/svg%3E") no-repeat center;
        mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='1' y='16' width='3' height='8'/%3E%3Crect x='6' y='12' width='3' height='12'/%3E%3Crect x='11' y='8' width='3' height='16'/%3E%3Crect x='16' y='4' width='3' height='20'/%3E%3C/svg%3E") no-repeat center;
      }

      .wifi {
        -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01'/%3E%3C/svg%3E") no-repeat center;
        mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01'/%3E%3C/svg%3E") no-repeat center;
      }

      .battery {
        width: 25px;
        position: relative;
        border: 2px solid white;
        border-radius: 3px;
      }

      .battery::after {
        content: '';
        position: absolute;
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 6px;
        background: white;
        border-radius: 0 2px 2px 0;
      }

      .logo-section {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        height: 300px;
        margin-top: 30px;
      }

      .flower-logo {
        width: 180px;
        height: 180px;
        position: relative;
        z-index: 2;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .plant {
        position: absolute;
        bottom: 0;
        width: 150px;
        height: 150px;
        z-index: 1;
      }

      .left-plant {
        left: 20px;
      }

      .right-plant {
        right: 20px;
      }

      .form-section {
        background: #f5f5f0;
        border-radius: 40px 40px 0 0;
        padding: 40px 30px;
        position: relative;
        z-index: 3;
        margin-top: -40px;
      }

      .title {
        font-family: 'Belanosima', cursive;
        font-size: 32px;
        font-weight: 500;
        color: #7EB234;
        margin-bottom: 35px;
        line-height: 1.2;
      }

      .login-form {
        display: flex;
        flex-direction: column;
      }

      .input-group {
        margin-bottom: 25px;
      }

      .input-group label {
        display: block;
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 8px;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        background: #d8e8c4;
        border-radius: 12px;
        padding: 0 15px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
      }

      .input-wrapper:hover {
        background:rgb(224, 234, 211);
        border-color: #7EB234;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(126, 178, 52, 0.15);
      }

      .input-wrapper:focus-within {
        background:rgb(224, 234, 211);
        border-color: #7EB234;
        box-shadow: 0 0 0 3px rgba(126, 178, 52, 0.1);
        transform: translateY(-1px);
      }

      .input-icon {
        width: 22px;
        height: 22px;
        margin-right: 10px;
        flex-shrink: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .input-wrapper:hover .input-icon {
        transform: scale(1.1);
        filter: brightness(1.0);
      }

      .input-wrapper input {
       font-family: 'Plus Jakarta Sans', sans-serif;
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        padding: 18px 5px;
        font-size: 16px;
        color: #7EB234;
        font-weight: 500;
      }

      .input-wrapper input::placeholder {
        color: #7EB234;
        opacity: 0.7;
      }

      .eye-icon {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }

      .eye-icon:hover {
        background: rgba(126, 178, 52, 0.1);
        transform: scale(1.1);
      }

      .eye-icon:active {
        transform: scale(0.95);
        background: rgba(126, 178, 52, 0.2);
      }

      .eye-icon svg {
        width: 22px;
        height: 22px;
        transition: all 0.3s ease;
      }

      .eye-icon:hover svg {
        transform: scale(1.1);
      }

      .signup-text {
        text-align: center;
        font-size: 15px;
        color: #666;
        margin: 20px 0 30px;
      }

      .signup-link {
        color: #333;
        font-weight: 700;
        text-decoration: none;
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-block;
      }

      .signup-link::after {
        content: '';
        position: absolute;
        width: 0;
        height: 2px;
        bottom: -2px;
        left: 50%;
        background: #7EB234;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(-50%);
      }

      .signup-link:hover {
        color: #7EB234;
        transform: translateY(-1px);
      }

      .signup-link:hover::after {
        width: 100%;
      }

      .signup-link:active {
        transform: translateY(0);
      }

      .signin-btn {
        font-family: 'Belanosima', cursive;
        background: #7EB234;
        color: white;
        border: none;
        border-radius: 32px;
        padding: 12px;
        font-size: 18px;
        font-weight: 300;
        cursor: pointer;
        transition: background 0.3s ease;
      }

      .signin-btn:hover {
        background: #6a9840;
        box-shadow: 0 4px 12px rgba(126, 178, 52, 0.3);
      }

      .signin-btn:active {
        transform: scale(0.98);
      }
    `;
  }
}

// Registrar el componente
customElements.define("login-screen", LoginScreen);
