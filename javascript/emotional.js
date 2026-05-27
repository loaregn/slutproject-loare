//en funktion där användaren kan välja en bild men även skapar en tillfällig lokal länk till bilden som gör den synlig
function previewImage(input) {
  //preview visar vart bilden ska placeras
  //file hämtar bildfilen och säger till om vad som ska visas
  //Hämtar elelment från HTML men även nollställer eventuella felmeddelanden
  const preview = input.parentNode.querySelector(".bild-CT");
  const videoPreview = input.parentNode.querySelector(".video-CT"); //är samma princip som för bilden, men för videos
  const audioPlayer = document.getElementById("custom-audio-player");
  const [file] = input.files;

  const errorText = document.getElementById("error-meddelande");

  //hämtar element från HTML för knappar o filhanteringen, men även bilder
  const fileButton = document.querySelector(".knapp-CT");
  const filterButton = document.querySelector(".filter-CT");
  const image = document.querySelector("#footerBild");

  //hämtar element från HTML och nollställer eventuella felmeddel
  if (errorText) {
    errorText.style.display = "none";
    errorText.textContent = "";
  }

  //återstäler och döljer alla förhandsvisningar innan validering
  if (preview) preview.style.display = "none";
  if (videoPreview) {
    videoPreview.style.display = "none";
    videoPreview.src = "";
  }

  //Checkar så att filens egenskaper är korrekta så man vet att det är en riktig bild, man kontrollerar typerna för olika filformat
  if (file) {
    const godkänt = ["image/gif", "image/jpeg", "image/png", "video/mp4"];
    const tillåtnaFormat = /(\.jpg|\.jpeg|\.png|\.gif|\.mp4)$/i;

    if (!godkänt.includes(file.type) || !tillåtnaFormat.test(file.name)) {
      visaFelmeddelande(errorText, input, preview);
      return;
    }

    //Hära skapar jag en FileReader som läser av de första 4 bytesen i filen. Alltså läser av filernas "signatur" som är unikt för varje filformat
    //Detta gör även så att man inte kan skicka in en .html fil osv.. Då loopen hjälper till. Även så nollställs filen som skickas in, vilket motverkar chanser för en attack eller manipulativ kod att användas
    const filLäsare = new FileReader();

    filLäsare.onloadend = function (e) {
      const bytes = new Uint8Array(e.target.result).subarray(0, 8);
      let signatur = "";

      for (let i = 0; i < bytes.length; i++) {
        signatur += bytes[i].toString(16); //måste vara 16 för att matcha o hitta filformatet
      }

      //Checkar signaturen från filerna och matchar den för godkänta format som filerna får vara i, det stoppar okända filer eller filer med annan kod att skickas in
      //Men även så blir preview (bilden) ett block element, vilket gör bilden synlig och filterButton för att ändra färg blir också synlig
      const kollaPNG = signatur.startsWith("89504e47");
      const kollaGIF = signatur.startsWith("47494638");
      const kollaJPEG =
        signatur.startsWith("ffd8ffe0") ||
        signatur.startsWith("ffd8ffe1") ||
        signatur.startsWith("ffd8ffe2") ||
        signatur.startsWith("ffd8ffdb");
      //det är annourlunda för MP4 filer där det är en helt annan "signatur"
      const kollaMP4 = signatur.includes("66747970");

      //kollar alla format och ser ifall de är korrekta
      if (kollaPNG || kollaGIF || kollaJPEG || kollaMP4) {
        fileButton.style.display = "none";
        if (filterButton) filterButton.style.display = "block";
        if (image) image.style.display = "none";

        //om fil typen är video eller videopreview så körs samma princip som för bilderna, videon visas o filen görs synlig
        if (file.type === "video/mp4" && videoPreview) {
          videoPreview.src = URL.createObjectURL(file);
          videoPreview.style.display = "block";

          if (audioPlayer) {
            audioPlayer.style.display = "flex";
            setupAudioControls(videoPreview); // Startar ljudkontrollerna if (om) det är en video, så att ljudet kan styras av användaren
          }
        } else if (preview) {
          preview.src = URL.createObjectURL(file);
          preview.style.display = "block"; //Annars görs bilden synlig som vanligt ifall det inte är en video
        }
      } else {
        visaFelmeddelande(errorText, input, preview); //visar felmedelandet ifall det inte var rätt format,
      }
    };

    filLäsare.readAsArrayBuffer(file); //läser av de förasta 8 bytesen i filen för att kolla "signaturen" för att se att det är rätt format
  }
}

function setupAudioControls(video) {
  //en funktion för att kontrollera ljudet i videon men även för en panel där man kan pausa videon, med hjälp av exempelvis audio-time
  const playBtn = document.getElementById("audio-play-btn");
  const progressBar = document.getElementById("audio-progress");
  const timeDisplay = document.getElementById("audio-time");
  const volumeSlider = document.getElementById("audio-volume");

  // Play/Paus-logik, ifall videon körs ändras textContent osv..
  playBtn.onclick = function () {
    if (video.paused) {
      video.play();
      playBtn.textContent = "⏸ Paus";
    } else {
      video.pause();
      playBtn.textContent = "▶ Spela";
    }
  };

  // Uppdaterar laddningsmätaren och text-tiden i realtid med hjälp av matte. Det räknas i procent o anrundningar ner minuter o sekunder
  video.ontimeupdate = function () {
    const procent = (video.currentTime / video.duration) * 100;
    if (progressBar) progressBar.style.width = procent + "%";

    const minuter = Math.floor(video.currentTime / 60);
    const sekunder = Math.floor(video.currentTime % 60);
    if (timeDisplay) {
      timeDisplay.textContent = `${minuter}:${sekunder < 10 ? "0" : ""}${sekunder}`; //ändrar textContent i realtid
    }
  };

  //här kan användaren ändra på volymen för videon
  if (volumeSlider) {
    // Sätter videons startvolym till samma värde som reglaget (t.ex. 1 för max)
    video.volume = volumeSlider.value;

    volumeSlider.addEventListener("input", function () {
      video.volume = volumeSlider.value; // Ändrar videons volym live (0.0 till 1.0)
    });
  }
}

//en funktion för ett felmedelande, det gör så att en text visas på sidan att formatet är fel
//errorText elementet som vi gjorde över, visas istället för att vara dolt
function visaFelmeddelande(errorText, input, preview) {
  const image = document.querySelector("#footerBild");
  if (errorText) {
    errorText.textContent =
      "Fel format! Filen är trasig eller är inte en riktig bild."; //säger inte till vilka format som funkar, vilket motverkar att "hackarna" vet om vad som ska användas
    errorText.style.display = "block";
  }
  if (input) input.value = ""; //tömmer filväljaren så att användaren kan välja en annan fil (en som är tillåten)
  if (preview) {
    preview.src = "images/greenguy.png";
    preview.style.display = "block";
    image.style.display = "none";
  }
}

let färgRäkning = 0;
const filterBtn = document.querySelector(".filter-CT");

filterBtn.addEventListener("click", function () {
  const previewImg = document.querySelector(".bild-CT");
  const previewVid = document.querySelector(".video-CT");

  if (previewImg || previewVid) {
    färgRäkning += 1;
  }

  if (färgRäkning === 1) {
    filterBtn.textContent = "Inverterad";
    if (previewImg) previewImg.classList.toggle("inverted");
    if (previewVid) previewVid.classList.toggle("inverted");
  }

  if (färgRäkning === 2) {
    filterBtn.textContent = "Grå";
    // Tar bort inverterat-klassen och slår på gråskala
    if (previewImg) {
      previewImg.classList.remove("inverted");
      previewImg.classList.toggle("grayScale");
    }
    if (previewVid) {
      previewVid.classList.remove("inverted");
      previewVid.classList.toggle("grayScale");
    }
  }
});
