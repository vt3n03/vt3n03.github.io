
function opentab(tabname) {
  const tablinks = document.getElementsByClassName("tab-links");
  const tabcontents = document.getElementsByClassName("tab-contents");

  for (const tablink of tablinks) {
    tablink.classList.remove("active-link");
  }
  for (const tabcontent of tabcontents) {
    tabcontent.classList.remove("active-tab");
  }

  event.currentTarget.classList.add("active-link");
  document.getElementById(tabname).classList.add("active-tab");
}


let sidemenu;

function openmenu() {
  if (!sidemenu) {
    sidemenu = document.getElementById("sidemenu");
  }
  sidemenu.style.right = "0";
}

function closemenu() {
  if (!sidemenu) {
    sidemenu = document.getElementById("sidemenu");
  }
  sidemenu.style.right = "-200px";
}

window.addEventListener("load", function () {

  const scrollArea = document.getElementById("scrollArea");
  const leftBtn = document.querySelector(".left-btn");
  const rightBtn = document.querySelector(".right-btn");

  if (scrollArea && leftBtn && rightBtn) {
    const scrollAmount = scrollArea.clientWidth * 0.8;

    leftBtn.addEventListener("click", function () {
      scrollArea.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
      });
    });

    rightBtn.addEventListener("click", function () {
      scrollArea.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    });
  }


  const canvases = Array.from(document.querySelectorAll(".spin-canvas"));
  if (canvases.length === 0) {
    console.warn("No .spin-canvas elements found");
    return;
  }


  const states = canvases.map((canvas) => {
    const folder = canvas.dataset.folder || "images";
    const frameCount = parseInt(canvas.dataset.frames, 10) ||70;

    const frames = [];
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const n = i.toString().padStart(4, "0");
      img.src = `${folder}/${n}.png`;
      frames.push(img);
    }

    return {
      canvas,
      ctx: canvas.getContext("2d"),
      folder,
      frameCount,
      frames,
      frame: 1
    };
  });

 
  function drawFrameForState(state, frameNumber) {
    const img = state.frames[frameNumber - 1];
    if (!img) return;


    if (!img.complete || img.naturalWidth === 0) {
      img.onload = () => drawFrameForState(state, frameNumber);
      return;
    }

    const canvas = state.canvas;
    const ctx = state.ctx;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const hRatio = canvasWidth / img.width;
    const vRatio = canvasHeight / img.height;
    const ratio = Math.min(hRatio, vRatio);

    const x = (canvasWidth - img.width * ratio) / 2;
    const y = (canvasHeight - img.height * ratio) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      x,
      y,
      img.width * ratio,
      img.height * ratio
    );
  }

  states.forEach((state) => {
    const first = state.frames[0];
    first.onload = () => {
      drawFrameForState(state, state.frame);
    };
  
    if (first.complete && first.naturalWidth !== 0) {
      drawFrameForState(state, state.frame);
    }
  });


  const scrollSpeed = 8; 

  states.forEach((state) => {
    const card = state.canvas.closest(".card-container");
    if (!card) return;

    card.addEventListener(
      "wheel",
      function (event) {
        event.preventDefault(); 

        const direction = event.deltaY > 0 ? scrollSpeed : -scrollSpeed;
        let next = state.frame + direction;

        if (next < 1) next = state.frameCount;
        if (next > state.frameCount) next = 1;

        state.frame = next;
        drawFrameForState(state, state.frame);
      },
      { passive: false }
    );
  });
});
