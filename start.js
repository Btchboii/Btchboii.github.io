const enterButton = document.getElementById('enter-button');
    const flashScreen = document.getElementById('flash-screen');
  
    enterButton.addEventListener('click', () => {
      flashScreen.style.opacity = '1';
      setTimeout(() => {
        window.location.href = './pokedex.html'; 
      }, 1000);
    });

document.getElementById("enter-btn").addEventListener("click", function () {
    this.classList.add("flash");
  
    setTimeout(() => {
      window.location.href = "pokedex.html"; 
    }, 500);
  });
  




