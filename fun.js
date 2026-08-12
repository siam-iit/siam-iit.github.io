console.log("NEW SURFACE JS LOADED — VERSION 3");
(() => {
  const canvas = document.getElementById("moire-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let width = 0;
  let height = 0;

  let targetMouseX = 0;
  let targetMouseY = 0;

  let mouseX = 0;
  let mouseY = 0;

  let mouseInside = false;
  let ripples = [];
  let lastRippleTime = 0;

  let scrollKick = 0;
  let lastScrollY = window.scrollY;


  /* -----------------------------------------
     RESIZE
  ----------------------------------------- */

  function resize() {
    const rect = wrap.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }


  /* -----------------------------------------
     MATHEMATICAL SURFACE

     x, y range roughly from -1 to 1.
     z is the height of the surface.
  ----------------------------------------- */

 function surface(x, y, time) {
    let z = 0;

    /*
      Cursor position in surface coordinates:
      -1 ≤ x,y ≤ 1
    */

    const cx = mouseX * 2;
    const cy = mouseY * 2;

    const dx = x - cx;
    const dy = y - cy;

    const distance =
      Math.sqrt(dx * dx + dy * dy);


    /*
      Soft local lift directly beneath cursor.
    */

    if (mouseInside) {
      const cursorBump =
        0.16 *
        Math.exp(
          -(distance * distance) * 12
        );

      z += cursorBump;
    }


    /*
      Traveling circular ripples.

      Each stored ripple expands outward
      from the cursor position where it began.
    */

    for (const ripple of ripples) {

      const rdx =
        x - ripple.x;

      const rdy =
        y - ripple.y;

      const r =
        Math.sqrt(
          rdx * rdx +
          rdy * rdy
        );

      const age =
        (time - ripple.start) /
        1000;

      /*
        Radius increases with time.
      */

      const radius =
        age * 0.75;

      /*
        Thin ring around the traveling wavefront.
      */

      const ring =
        Math.exp(
          -Math.pow(
            (r - radius) / 0.075,
            2
          )
        );

      /*
        Oscillation inside the ring gives it
        a real ripple instead of one smooth hump.
      */

      const oscillation =
        Math.sin(
          (r - radius) * 42
        );

      /*
        Gradually fade as the ripple expands.
      */

      const decay =
        Math.exp(-age * 0.9);

      z +=
        ring *
        oscillation *
        decay *
        0.12;
    }


    /*
      Scroll deformation.
    */

    const scrollWave =
      scrollKick *
      0.003 *
      Math.sin(x * Math.PI) *
      Math.cos(y * Math.PI);

    z += scrollWave;


    return z;
  }


  /* -----------------------------------------
     3D → 2D PROJECTION
  ----------------------------------------- */

  function project(x, y, z) {

  /*
    No margin.

    x = -1 maps exactly to the left edge.
    x =  1 maps exactly to the right edge.

    Same for y.
  */

  const screenX =
    ((x + 1) / 2) * width;

  const screenY =
    ((y + 1) / 2) * height;


  /*
    Deformation.

    Vertical displacement makes the surface
    appear to lift out of the flat grid.

    A small horizontal component makes the
    mesh feel elastic rather than painted.
  */

  return {
    x:
      screenX +
      z * x * 35,

    y:
      screenY -
      z * 95
  };
}


  /* -----------------------------------------
     DRAW ONE SURFACE POINT
  ----------------------------------------- */

function point(x, y, time) {
  const z =
    surface(x, y, time);

  return project(
    x,
    y,
    z
  );
}

  /* -----------------------------------------
     DRAW GRID
  ----------------------------------------- */

  function drawGrid(time) {

    ctx.fillStyle = "#173a78";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    ctx.strokeStyle = "#78d0c7";
    ctx.lineWidth = 0.75;
    ctx.globalAlpha = 0.9;


    /*
      Number of actual grid lines.

      MUCH fewer than before.

      This is what gives us the mathematical
      wireframe look instead of the optical
      wallpaper look.
    */

    const xLines = 32;
    const yLines = 24;

    const resolution = 100;


    /* -------------------------------------
       Lines running front → back
    ------------------------------------- */

    for (let i = 0; i <= xLines; i++) {

      const x =
        -1 +
        (i / xLines) * 2;

      ctx.beginPath();

      for (
        let j = 0;
        j <= resolution;
        j++
      ) {

        const y =
          -1 +
          (j / resolution) * 2;

        const p = point(x, y, time);

        if (j === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      ctx.stroke();
    }


    /* -------------------------------------
       Lines running left → right
    ------------------------------------- */

    for (let j = 0; j <= yLines; j++) {

      const y =
        -1 +
        (j / yLines) * 2;

      ctx.beginPath();

      for (
        let i = 0;
        i <= resolution;
        i++
      ) {

        const x =
          -1 +
          (i / resolution) * 2;

        const p = point(x, y, time);

        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      ctx.stroke();
    }
  }


  /* -----------------------------------------
     ANIMATION
  ----------------------------------------- */

  function animate(time) {
    ripples =
      ripples.filter(
        ripple =>
          time - ripple.start < 3200
      );
      
    mouseX +=
      (targetMouseX - mouseX) * 0.09;

    mouseY +=
      (targetMouseY - mouseY) * 0.09;


    // slowly relax after scrolling
    scrollKick *= 0.90;


    drawGrid(time);

    requestAnimationFrame(animate);
  }


  /* -----------------------------------------
     CURSOR
  ----------------------------------------- */

  wrap.addEventListener(
    "pointerenter",
    () => {
      mouseInside = true;
    }
  );


  wrap.addEventListener(
    "pointermove",
    (event) => {

      const rect =
        wrap.getBoundingClientRect();

      targetMouseX =
        (
          (event.clientX - rect.left) /
          rect.width -
          0.5
        );

      targetMouseY =
        (
          (event.clientY - rect.top) /
          rect.height -
          0.5
        );
        const now =
          performance.now();

        if (
          now - lastRippleTime > 110
        ) {
          ripples.push({
            x: targetMouseX * 2,
            y: targetMouseY * 2,
            start: now
          });

          lastRippleTime = now;
        }
            }
          );


          wrap.addEventListener(
            "pointerleave",
            () => {
              mouseInside = false;
            }
          );


  /* -----------------------------------------
     SCROLL
  ----------------------------------------- */

  window.addEventListener(
    "scroll",
    () => {

      const current =
        window.scrollY;

      const delta =
        current - lastScrollY;

      scrollKick +=
        Math.max(
          -100,
          Math.min(100, delta * 2)
        );

      lastScrollY =
        current;
    },
    { passive: true }
  );


  /* -----------------------------------------
     START
  ----------------------------------------- */

  window.addEventListener(
    "resize",
    resize
  );

  resize();

  requestAnimationFrame(animate);

})()