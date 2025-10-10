// Home/home.js
class HomeScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.userName = "Cris";
    this.temperature = "10";
    this.lastPlant = "Elian";
    this.plantHealth = "87";
    this.plantsAdopted = "3,452";
  }

  connectedCallback() {
    this.render();
    this.loadIconify();
    this.attachEventListeners();
    
    // Esperar a que el DOM esté listo antes de actualizar iconos
    requestAnimationFrame(() => {
      this.updateIcons();
    });

    this.iconCheckInterval = setInterval(() => {
      this.updateIcons();
    }, 2000);
  }

  disconnectedCallback() {
    if (this.iconCheckInterval) {
      clearInterval(this.iconCheckInterval);
    }
  }

  loadIconify() {
    if (!document.querySelector('script[src*="iconify"]')) {
      const script = document.createElement("script");
      script.src = "https://code.iconify.design/3/3.1.0/iconify.min.js";
      script.onload = () => {
        setTimeout(() => {
          if (window.Iconify && window.Iconify.scan) {
            window.Iconify.scan(this.shadowRoot);
          }
        }, 100);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(() => {
        if (window.Iconify && window.Iconify.scan) {
          window.Iconify.scan(this.shadowRoot);
        }
      }, 100);
    }
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
        
        <div class="hero-section">
          <div class="hero-content">
            <div class="temperature">${this.temperature}°C</div>
            <div class="greeting">
              <h1>Good Morning, ${this.userName}</h1>
              <p>Your plants missed you!</p>
            </div>
          </div>
        </div>
        
        <div class="main-content">
          <div class="last-plant-card">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3CradialGradient id='pot' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23f5f5f0'/%3E%3Cstop offset='100%25' style='stop-color:%23e8e8e0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Cellipse cx='100' cy='160' rx='45' ry='15' fill='%23d0d0c0'/%3E%3Crect x='65' y='120' width='70' height='50' rx='8' fill='url(%23pot)'/%3E%3Cpath d='M70 120 L65 160 L135 160 L130 120 Z' fill='%23e8e8e0'/%3E%3Cellipse cx='100' cy='120' rx='35' ry='8' fill='%23a89f8f'/%3E%3Ccircle cx='100' cy='70' r='35' fill='%2398b884'/%3E%3Cellipse cx='80' cy='60' rx='20' ry='28' fill='%2398b884' transform='rotate(-20 80 60)'/%3E%3Cellipse cx='120' cy='60' rx='20' ry='28' fill='%2398b884' transform='rotate(20 120 60)'/%3E%3Cellipse cx='90' cy='45' rx='18' ry='25' fill='%2398b884' transform='rotate(-10 90 45)'/%3E%3Cellipse cx='110' cy='45' rx='18' ry='25' fill='%2398b884' transform='rotate(10 110 45)'/%3E%3Cellipse cx='85' cy='75' rx='22' ry='30' fill='%2398b884' transform='rotate(-25 85 75)'/%3E%3Cellipse cx='115' cy='75' rx='22' ry='30' fill='%2398b884' transform='rotate(25 115 75)'/%3E%3Ccircle cx='100' cy='70' r='25' fill='%238ba876'/%3E%3C/svg%3E" alt="Plant" class="plant-image" />
            <div class="plant-info">
              <div class="plant-label">Your last cared plant:</div>
              <div class="plant-name">${this.lastPlant}</div>
            </div>
            <div class="plant-health">
              <svg class="health-circle" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="8"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="8" 
                  stroke-dasharray="283" stroke-dashoffset="${283 - (283 * this.plantHealth) / 100}" 
                  transform="rotate(-90 50 50)" stroke-linecap="round"/>
                <text x="50" y="58" text-anchor="middle" fill="white" font-size="24" font-weight="600">${this.plantHealth}%</text>
              </svg>
            </div>
          </div>
          
          <div class="garden-card">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 300'%3E%3Crect width='600' height='300' fill='%23f0e8dc'/%3E%3Cdefs%3E%3ClinearGradient id='pot1' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e8e8e8'/%3E%3Cstop offset='100%25' style='stop-color:%23d0d0d0'/%3E%3C/linearGradient%3E%3ClinearGradient id='pot2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234a4a4a'/%3E%3Cstop offset='100%25' style='stop-color:%232a2a2a'/%3E%3C/linearGradient%3E%3ClinearGradient id='wood' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23a67c52'/%3E%3Cstop offset='100%25' style='stop-color:%238b6542'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='150' cy='270' rx='60' ry='12' fill='%23d0c8b8' opacity='0.5'/%3E%3Cellipse cx='300' cy='270' rx='65' ry='13' fill='%23d0c8b8' opacity='0.5'/%3E%3Cellipse cx='450' cy='270' rx='60' ry='12' fill='%23d0c8b8' opacity='0.5'/%3E%3Cg%3E%3Crect x='100' y='200' width='100' height='70' rx='10' fill='url(%23pot1)'/%3E%3Crect x='100' y='240' width='100' height='30' fill='url(%23wood)'/%3E%3Cellipse cx='150' cy='200' rx='50' ry='10' fill='%23a89f8f'/%3E%3Cpath d='M130 180 Q125 140 120 120 Q118 110 115 100' stroke='%23547c3a' stroke-width='4' fill='none'/%3E%3Cellipse cx='115' cy='100' rx='12' ry='20' fill='%23547c3a' transform='rotate(-25 115 100)'/%3E%3Cpath d='M135 170 Q130 145 128 130' stroke='%23547c3a' stroke-width='3' fill='none'/%3E%3Cellipse cx='128' cy='128' rx='10' ry='16' fill='%23547c3a' transform='rotate(-15 128 128)'/%3E%3Cpath d='M145 185 Q148 160 150 145' stroke='%23547c3a' stroke-width='4' fill='none'/%3E%3Cellipse cx='150' cy='143' rx='11' ry='18' fill='%23547c3a'/%3E%3Cpath d='M160 175 Q165 150 168 135' stroke='%23547c3a' stroke-width='3' fill='none'/%3E%3Cellipse cx='168' cy='133' rx='10' ry='16' fill='%23547c3a' transform='rotate(15 168 133)'/%3E%3Cpath d='M170 185 Q178 155 182 140' stroke='%23547c3a' stroke-width='4' fill='none'/%3E%3Cellipse cx='182' cy='138' rx='12' ry='19' fill='%23547c3a' transform='rotate(20 182 138)'/%3E%3C/g%3E%3Cg%3E%3Crect x='250' y='190' width='100' height='80' rx='10' fill='url(%23pot2)'/%3E%3Crect x='250' y='240' width='100' height='30' fill='url(%23wood)'/%3E%3Cellipse cx='300' cy='190' rx='50' ry='10' fill='%23a89f8f'/%3E%3Cpath d='M285 175 Q280 145 278 125 Q276 115 274 105 Q272 95 270 88' stroke='%234a6638' stroke-width='3' fill='none'/%3E%3Cellipse cx='270' cy='86' rx='8' ry='14' fill='%234a6638' transform='rotate(-20 270 86)'/%3E%3Cpath d='M290 165 Q288 140 286 125' stroke='%234a6638' stroke-width='3' fill='none'/%3E%3Cellipse cx='286' cy='123' rx='7' ry='13' fill='%234a6638' transform='rotate(-10 286 123)'/%3E%3Cpath d='M298 170 Q300 145 302 125 Q303 115 304 105' stroke='%234a6638' stroke-width='3' fill='none'/%3E%3Cellipse cx='304' cy='103' rx='8' ry='14' fill='%234a6638' transform='rotate(5 304 103)'/%3E%3Cpath d='M308 165 Q312 140 315 120' stroke='%234a6638' stroke-width='3' fill='none'/%3E%3Cellipse cx='315' cy='118' rx='7' ry='13' fill='%234a6638' transform='rotate(10 315 118)'/%3E%3Cpath d='M315 175 Q322 150 328 130 Q330 120 332 110' stroke='%234a6638' stroke-width='3' fill='none'/%3E%3Cellipse cx='332' cy='108' rx='8' ry='14' fill='%234a6638' transform='rotate(20 332 108)'/%3E%3C/g%3E%3Cg%3E%3Crect x='400' y='200' width='100' height='70' rx='10' fill='url(%23pot1)'/%3E%3Crect x='400' y='240' width='100' height='30' fill='url(%23wood)'/%3E%3Cellipse cx='450' cy='200' rx='50' ry='10' fill='%23a89f8f'/%3E%3Cpath d='M440 185 Q438 155 435 135 Q433 125 430 115' stroke='%235a7c42' stroke-width='4' fill='none'/%3E%3Cellipse cx='430' cy='113' rx='10' ry='18' fill='%235a7c42' transform='rotate(-15 430 113)'/%3E%3Cpath d='M445 180 Q443 155 440 138' stroke='%235a7c42' stroke-width='3' fill='none'/%3E%3Cellipse cx='440' cy='136' rx='9' ry='16' fill='%235a7c42' transform='rotate(-8 440 136)'/%3E%3Cpath d='M450 185 Q450 160 450 140 Q450 130 450 120' stroke='%235a7c42' stroke-width='5' fill='none'/%3E%3Cellipse cx='450' cy='116' rx='11' ry='20' fill='%235a7c42'/%3E%3Cpath d='M455 180 Q457 155 460 138' stroke='%235a7c42' stroke-width='3' fill='none'/%3E%3Cellipse cx='460' cy='136' rx='9' ry='16' fill='%235a7c42' transform='rotate(8 460 136)'/%3E%3Cpath d='M460 185 Q465 160 470 140 Q472 130 475 120' stroke='%235a7c42' stroke-width='4' fill='none'/%3E%3Cellipse cx='475' cy='118' rx='10' ry='18' fill='%235a7c42' transform='rotate(15 475 118)'/%3E%3Cpath d='M465 175 Q468 155 472 140' stroke='%235a7c42' stroke-width='3' fill='none'/%3E%3Cellipse cx='472' cy='138' rx='8' ry='15' fill='%235a7c42' transform='rotate(12 472 138)'/%3E%3C/g%3E%3C/svg%3E" alt="Garden" class="garden-image" />
            <div class="garden-info">
              <h2>Your Garden</h2>
              <p>Take care of your plants daily</p>
            </div>
          </div>
          
          <button class="adopt-btn">
            <span class="plus-icon">+</span>
            Adopt a new plant
          </button>
          
          <div class="stats-text">
            <p>Thank you for your support</p>
            <p class="stats-number">${this.plantsAdopted} plants adopted this week!</p>
          </div>
        </div>
        
        <nav class="bottom-nav">
          <button class="nav-btn active" data-page="home">
            <span class="iconify nav-icon" data-icon="material-symbols:home-rounded"></span>
          </button>
          <button class="nav-btn" data-page="plants">
            <span class="iconify nav-icon" data-icon="mdi:sprout"></span>
          </button>
          <button class="nav-btn" data-page="community">
            <span class="iconify nav-icon" data-icon="tabler:world"></span>
          </button>
          <button class="nav-btn" data-page="profile">
            <span class="iconify nav-icon" data-icon="tdesign:user-filled"></span>
          </button>
        </nav>
      </div>
    `;
  }

  updateIcons() {
    if (window.Iconify && window.Iconify.scan) {
      window.Iconify.scan(this.shadowRoot);
    }
  }

  setActiveNav(page) {
    const navBtns = this.shadowRoot.querySelectorAll(".nav-btn");
    navBtns.forEach((btn) => {
      if (btn.getAttribute("data-page") === page) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  attachEventListeners() {
    const adoptBtn = this.shadowRoot.querySelector(".adopt-btn");
    adoptBtn.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("adopt-plant", {
          bubbles: true,
          composed: true,
        })
      );
    });

    const gardenCard = this.shadowRoot.querySelector(".garden-card");
    gardenCard.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("view-garden", {
          bubbles: true,
          composed: true,
        })
      );
    });

    const navBtns = this.shadowRoot.querySelectorAll(".nav-btn");
    navBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const page = btn.getAttribute("data-page");

        // Remover active de todos inmediatamente
        navBtns.forEach((b) => b.classList.remove("active"));
        
        // Agregar active al botón clickeado inmediatamente
        btn.classList.add("active");

        // Disparar el evento después de actualizar la UI
        requestAnimationFrame(() => {
          this.dispatchEvent(
            new CustomEvent("navigate", {
              detail: { page },
              bubbles: true,
              composed: true,
            })
          );
        });
      });
    });
  }

  getStyles() {
    return `
      * {
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
        min-height: 100vh;
        background: #f5f5f0;
        position: relative;
        padding-bottom: 120px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 25px;
        color: white;
        font-size: 18px;
        font-weight: 600;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
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

      .hero-section {
        height: 320px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 800'%3E%3Cdefs%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='1000' height='800' fill='%231a1a1a'/%3E%3Cg opacity='0.4'%3E%3Cellipse cx='200' cy='300' rx='180' ry='200' fill='%232d4a2a' opacity='0.6'/%3E%3Cellipse cx='350' cy='150' rx='150' ry='180' fill='%23365c33' opacity='0.5'/%3E%3Cellipse cx='500' cy='250' rx='200' ry='220' fill='%232d4a2a' opacity='0.6'/%3E%3Cellipse cx='650' cy='180' rx='160' ry='190' fill='%233d6339' opacity='0.5'/%3E%3Cellipse cx='800' cy='320' rx='170' ry='200' fill='%232d4a2a' opacity='0.6'/%3E%3Cellipse cx='100' cy='150' rx='140' ry='160' fill='%23365c33' opacity='0.5'/%3E%3Cellipse cx='900' cy='200' rx='130' ry='170' fill='%233d6339' opacity='0.5'/%3E%3C/g%3E%3Cg opacity='0.6'%3E%3Cpath d='M150 400 Q140 350 130 320 Q125 300 118 280 Q115 270 110 255' stroke='%2345704a' stroke-width='5' fill='none' opacity='0.4'/%3E%3Cellipse cx='110' cy='250' rx='18' ry='35' fill='%2345704a' transform='rotate(-25 110 250)' opacity='0.5'/%3E%3Cpath d='M160 380 Q155 340 150 310' stroke='%2345704a' stroke-width='4' fill='none' opacity='0.4'/%3E%3Cellipse cx='150' cy='305' rx='15' ry='28' fill='%2345704a' transform='rotate(-15 150 305)' opacity='0.5'/%3E%3Cpath d='M280 420 Q290 370 295 340 Q298 320 302 300' stroke='%23527d4f' stroke-width='6' fill='none' opacity='0.4'/%3E%3Cellipse cx='302' cy='295' rx='20' ry='38' fill='%23527d4f' transform='rotate(15 302 295)' opacity='0.5'/%3E%3Cpath d='M420 400 Q415 360 408 330 Q405 315 400 295' stroke='%2345704a' stroke-width='5' fill='none' opacity='0.4'/%3E%3Cellipse cx='400' cy='290' rx='17' ry='33' fill='%2345704a' transform='rotate(-10 400 290)' opacity='0.5'/%3E%3Cpath d='M550 430 Q560 380 568 350 Q572 330 578 310' stroke='%23527d4f' stroke-width='6' fill='none' opacity='0.4'/%3E%3Cellipse cx='578' cy='305' rx='19' ry='36' fill='%23527d4f' transform='rotate(20 578 305)' opacity='0.5'/%3E%3Cpath d='M700 410 Q695 370 688 340 Q685 325 680 305' stroke='%2345704a' stroke-width='5' fill='none' opacity='0.4'/%3E%3Cellipse cx='680' cy='300' rx='18' ry='34' fill='%2345704a' transform='rotate(-12 680 300)' opacity='0.5'/%3E%3Cpath d='M850 420 Q860 375 870 345 Q875 325 882 305' stroke='%23527d4f' stroke-width='6' fill='none' opacity='0.4'/%3E%3Cellipse cx='882' cy='300' rx='20' ry='37' fill='%23527d4f' transform='rotate(18 882 300)' opacity='0.5'/%3E%3C/g%3E%3Crect width='1000' height='800' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E") center/cover no-repeat;
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 30px;
        padding-top: 60px;
      }

      .hero-content {
        color: white;
        width: 100%;
      }

      .temperature {
        font-family: 'Belanosima', cursive;
        font-size: 64px;
        font-weight: 400;
        margin-bottom: 10px;
        line-height: 1;
      }

      .greeting h1 {
        font-family: 'Belanosima', cursive;
        font-size: 36px;
        font-weight: 500;
        margin-bottom: 5px;
        line-height: 1.2;
      }

      .greeting p {
        font-size: 18px;
        font-weight: 400;
        opacity: 0.95;
      }

      .main-content {
        padding: 0 20px;
        margin-top: -40px;
        position: relative;
        z-index: 5;
      }

      .last-plant-card {
        background: linear-gradient(135deg, #7EB234 0%, #6a9e2d 100%);
        border-radius: 24px;
        padding: 25px;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 8px 24px rgba(126, 178, 52, 0.3);
        margin-bottom: 20px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        cursor: pointer;
      }

      .last-plant-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(126, 178, 52, 0.4);
      }

      .plant-image {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
      }

      .plant-info {
        flex: 1;
        color: white;
      }

      .plant-label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 5px;
      }

      .plant-name {
        font-family: 'Belanosima', cursive;
        font-size: 36px;
        font-weight: 500;
        line-height: 1;
      }

      .plant-health {
        flex-shrink: 0;
      }

      .health-circle {
        width: 80px;
        height: 80px;
      }

      .garden-card {
        background: #f0e8dc;
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 20px;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .garden-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }

      .garden-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
      }

      .garden-info {
        padding: 25px;
        background: #7EB234;
        color: white;
      }

      .garden-info h2 {
        font-family: 'Belanosima', cursive;
        font-size: 32px;
        font-weight: 500;
        margin-bottom: 5px;
        line-height: 1.2;
      }

      .garden-info p {
        font-size: 16px;
        opacity: 0.95;
      }

      .adopt-btn {
        width: 100%;
        background: #7EB234;
        color: white;
        border: none;
        border-radius: 20px;
        padding: 18px;
        font-family: 'Belanosima', cursive;
        font-size: 20px;
        font-weight: 400;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(126, 178, 52, 0.2);
      }

      .adopt-btn:hover {
        background: #6a9e2d;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(126, 178, 52, 0.3);
      }

      .adopt-btn:active {
        transform: scale(0.98);
      }

      .plus-icon {
        font-size: 28px;
        font-weight: 300;
        line-height: 1;
      }

      .stats-text {
        text-align: center;
        padding: 0 20px 20px;
      }

      .stats-text p {
        font-size: 15px;
        color: #666;
        margin-bottom: 5px;
        font-style: italic;
      }

      .stats-number {
        font-size: 15px;
        color: #333;
        font-weight: 500;
        font-style: italic;
      }

      .bottom-nav {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 400px;
        height: 70px;
        background-color: #7EB234;
        border-radius: 50px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        box-shadow: 0 8px 24px rgba(126, 178, 52, 0.4);
        z-index: 100;
        padding: 0 10px;
      }

      .nav-btn {
        flex: 1;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        position: relative;
        border-radius: 50px;
      }

      .nav-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: 80%;
        height: 70%;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50px;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .nav-btn.active::before {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }

      .nav-btn:hover:not(.active) {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .nav-btn:active {
        transform: scale(0.95);
      }

      .nav-icon {
        font-size: 28px;
        color: white;
        position: relative;
        z-index: 2;
        display: inline-block;
        width: 28px;
        height: 28px;
        transition: all 0.3s ease;
      }

      .nav-btn.active .nav-icon {
        transform: scale(1.1);
      }

      .nav-btn:hover .nav-icon {
        transform: scale(1.05);
      }

      @media (max-width: 480px) {
        .container {
          padding-bottom: 100px;
        }

        .hero-section {
          height: 280px;
          padding: 0 20px;
          padding-top: 50px;
        }

        .temperature {
          font-size: 56px;
        }

        .greeting h1 {
          font-size: 30px;
        }

        .greeting p {
          font-size: 16px;
        }

        .main-content {
          padding: 0 15px;
        }

        .last-plant-card {
          padding: 20px;
          gap: 15px;
        }

        .plant-image {
          width: 80px;
          height: 80px;
        }

        .plant-name {
          font-size: 30px;
        }

        .health-circle {
          width: 70px;
          height: 70px;
        }

        .garden-info h2 {
          font-size: 28px;
        }

        .adopt-btn {
          font-size: 18px;
          padding: 16px;
        }

        .bottom-nav {
          height: 65px;
          width: 85%;
          bottom: 15px;
        }

        .nav-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      @media (max-width: 360px) {
        .temperature {
          font-size: 48px;
        }

        .greeting h1 {
          font-size: 26px;
        }

        .plant-name {
          font-size: 26px;
        }

        .garden-info h2 {
          font-size: 24px;
        }

        .bottom-nav {
          height: 60px;
        }

        .nav-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
      }
    `;
  }
}

customElements.define("home-screen", HomeScreen);