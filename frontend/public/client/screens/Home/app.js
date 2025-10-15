 // Actualizar hora
    function updateTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      document.getElementById('current-time').textContent = `${hours}:${minutes}`;
    }
    updateTime();
    setInterval(updateTime, 60000);

    // Animar progreso circular
    const circumference = 2 * Math.PI * 30;
    const progressCircle = document.getElementById('progressCircle');
    const percent = 87;
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;

    // Navigation handlers
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        console.log('Navigation clicked:', this.id);
      });
    });

    // Adopt button
    document.getElementById('adoptBtn').addEventListener('click', () => {
      console.log('Adopt a new plant clicked');
      alert('Opening plant adoption page...');
    });

    // Actualizar estadísticas aleatoriamente
    function updateStats() {
      const randomPlants = Math.floor(Math.random() * 1000) + 3000;
      document.getElementById('statsText').textContent = 
        `${randomPlants.toLocaleString()} plants adopted this week!`;
    }
    
    // Actualizar cada 10 segundos
    setInterval(updateStats, 10000);