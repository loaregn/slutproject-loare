//skript för att lägga till ett - över den aktiva sidan i navbaren och laddar hemsidan innan koden körs
document.addEventListener("DOMContentLoaded", function () {
  //letar efter <a> inom topnav och sparar dem med variabeln navLänkar. Sedan tar reda på nuvarande html-filen
  const navLänkar = document.querySelectorAll(".topnav a");
  const sida = window.location.pathname.split("/").pop();

  navLänkar.forEach((link) => {
    //en loop som går igenom länkar, tar bort active klassen, nollställer länken för css. Länkar nav baren till sidan man är inne på
    link.classList.remove("active");
    const nyaSida = link.getAttribute("href");

    //jämför sidan och tittar ifall man är på rätt sida och //lägger till active klassen på den aktuella sidan så css blir aktivt
    if (sida === nyaSida) {
      link.classList.add("active");
    }
  });
});
