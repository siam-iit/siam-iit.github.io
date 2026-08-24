(() => {

  /* =========================================================
     SETUP
     ========================================================= */

  const canvas =
    document.getElementById("topology-canvas");

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  const wrap =
    canvas.parentElement;

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  let width = 0;
  let height = 0;

  let targetT = 0;
  let currentT = 0;

  let pointerInside = false;


  /* =========================================================
     CONSTANTS
     ========================================================= */

  const TWO_PI =
    Math.PI * 2;

  /*
    IMPORTANT:

    This same value is used by both the teacup and
    the torus parameter mapping.
  */

  const HANDLE_HALF_WIDTH =
    0.58;


  /* =========================================================
     RESIZE
     ========================================================= */

  function resize() {

    const rect =
      wrap.getBoundingClientRect();

    width =
      rect.width;

    height =
      rect.height;

    canvas.width =
      Math.floor(
        width * dpr
      );

    canvas.height =
      Math.floor(
        height * dpr
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }


  /* =========================================================
     HELPERS
     ========================================================= */

  function clamp(
    value,
    min = 0,
    max = 1
  ) {

    return Math.max(
      min,
      Math.min(
        max,
        value
      )
    );
  }


  function mix(
    a,
    b,
    t
  ) {

    return (
      a * (1 - t) +
      b * t
    );
  }


  function smoothstep(x) {

    x =
      clamp(x);

    return (
      x *
      x *
      (3 - 2 * x)
    );
  }


  function smootherstep(x) {

    x =
      clamp(x);

    return (
      x *
      x *
      x *
      (
        x *
        (
          x * 6 -
          15
        ) +
        10
      )
    );
  }


  function mixPoint(
    a,
    b,
    t
  ) {

    return {
      x:
        mix(
          a.x,
          b.x,
          t
        ),

      y:
        mix(
          a.y,
          b.y,
          t
        ),

      z:
        mix(
          a.z,
          b.z,
          t
        )
    };
  }


  /* =========================================================
     CUBIC BÉZIER
     ========================================================= */

  function cubicPoint(
    p0,
    p1,
    p2,
    p3,
    t
  ) {

    const a =
      1 - t;

    return {

      x:
        a * a * a * p0.x +
        3 * a * a * t * p1.x +
        3 * a * t * t * p2.x +
        t * t * t * p3.x,

      y:
        a * a * a * p0.y +
        3 * a * a * t * p1.y +
        3 * a * t * t * p2.y +
        t * t * t * p3.y
    };
  }


  function cubicTangent(
    p0,
    p1,
    p2,
    p3,
    t
  ) {

    const a =
      1 - t;

    return {

      x:
        3 * a * a *
        (p1.x - p0.x) +

        6 * a * t *
        (p2.x - p1.x) +

        3 * t * t *
        (p3.x - p2.x),

      y:
        3 * a * a *
        (p1.y - p0.y) +

        6 * a * t *
        (p2.y - p1.y) +

        3 * t * t *
        (p3.y - p2.y)
    };
  }


  /* =========================================================
     TEACUP -> TORUS CORRESPONDENCE

     The visible handle occupies most of the final
     torus circumference so its hole can be visually
     followed into the donut hole.
     ========================================================= */

  function torusAngleFromCup(u) {

    const signedU =
      Math.atan2(
        Math.sin(u),
        Math.cos(u)
      );


    const handleShare =
      0.60;

    const handleAngle =
      Math.PI *
      handleShare;


    /* handle */

    if (
      Math.abs(signedU) <=
      HANDLE_HALF_WIDTH
    ) {

      return (
        signedU /
        HANDLE_HALF_WIDTH
      ) *
      handleAngle;
    }


    /* positive body side */

    if (
      signedU >
      HANDLE_HALF_WIDTH
    ) {

      const q =
        (
          signedU -
          HANDLE_HALF_WIDTH
        ) /
        (
          Math.PI -
          HANDLE_HALF_WIDTH
        );

      return mix(
        handleAngle,
        Math.PI,
        q
      );
    }


    /* negative body side */

    const q =
      (
        signedU +
        Math.PI
      ) /
      (
        Math.PI -
        HANDLE_HALF_WIDTH
      );

    return mix(
      -Math.PI,
      -handleAngle,
      q
    );
  }


  /* =========================================================
     TORUS
     ========================================================= */

  function torus(
    u,
    v
  ) {

    const major =
      1.15;

    const minor =
      0.42;

    const theta =
      torusAngleFromCup(u);

    const ring =
      major +
      minor *
      Math.cos(v);


    return {

      x:
        ring *
        Math.cos(theta),

      y:
        minor *
        Math.sin(v),

      z:
        ring *
        Math.sin(theta)
    };
  }

/* =========================================================
   TEACUP
   ========================================================= */

function teacup(
  u,
  v,
  t = 0,
  sheet = null
) {
  const signedU =
    Math.atan2(
      Math.sin(u),
      Math.cos(u)
    );


  /* =======================================================
     HANDLE GEOMETRY
     ======================================================= */

  const handleRadius = 0.072;

  const upperAttach = {
    x: 0.84,
    y: 0.34
  };

  const lowerAttach = {
    x: 0.66,
    y: -0.29
  };


  /* -------------------------------------------------------
     HANDLE CENTERLINE

     Main loop stays rounded.
     Lower end bends inward only near the attachment.
     ------------------------------------------------------- */

  function handleCenter(s) {

    const centerY =
      (
        upperAttach.y +
        lowerAttach.y
      ) / 2;

    const verticalRadius =
      (
        upperAttach.y -
        lowerAttach.y
      ) / 2;


    const outward =
      0.76 *
      Math.sin(
        Math.PI * s
      );


    let x =
      upperAttach.x +
      outward;


    const y =
      centerY +
      verticalRadius *
      Math.cos(
        Math.PI * s
      );


    /*
      Pull only the final part of the lower handle
      inward toward the narrower cup wall.
    */

    const lowerRootStart = 0.82;

    if (s > lowerRootStart) {

      const q =
        smootherstep(
          (
            s -
            lowerRootStart
          ) /
          (
            1 -
            lowerRootStart
          )
        );

      x =
        mix(
          x,
          lowerAttach.x,
          q
        );
    }


    return {
      x,
      y
    };
  }


  /* -------------------------------------------------------
     HANDLE TANGENT
     ------------------------------------------------------- */

  function handleTangent(s) {

    const epsilon = 0.0015;

    const before =
      handleCenter(
        Math.max(
          0,
          s - epsilon
        )
      );

    const after =
      handleCenter(
        Math.min(
          1,
          s + epsilon
        )
      );


    return {
      x:
        after.x -
        before.x,

      y:
        after.y -
        before.y
    };
  }


  /* -------------------------------------------------------
     HANDLE SURFACE
     ------------------------------------------------------- */

  function handlePoint(
    s,
    angle
  ) {

    const center =
      handleCenter(s);

    const tangent =
      handleTangent(s);


    const tangentLength =
      Math.hypot(
        tangent.x,
        tangent.y
      ) || 1;


    const nx =
      -tangent.y /
      tangentLength;

    const ny =
      tangent.x /
      tangentLength;


    return {

      x:
        center.x +
        nx *
        Math.cos(angle) *
        handleRadius,

      y:
        center.y +
        ny *
        Math.cos(angle) *
        handleRadius,

      z:
        Math.sin(angle) *
        handleRadius *
        0.92
    };
  }


  /* =======================================================
     CUP BODY
     ======================================================= */

function cupBody(
    phi,
    meridian,
    sheet,
    u
  ) {

    let y =
      0.72 *
      Math.cos(
        meridian
      );

    const h =
      clamp(
        (
          y + 0.72
        ) / 1.44
      );


    /* -------------------------------------------------------
       MAIN PROFILE
       ------------------------------------------------------- */

    let radius =
      0.48 +
      0.40 *
      smootherstep(h);

    radius +=
      0.055 *
      Math.sin(
        Math.PI * h
      );


    /* -------------------------------------------------------
       SEALED BOTTOM
       ------------------------------------------------------- */

    const bottomDistance =
      Math.abs(
        meridian -
        Math.PI
      );

    const bottomClosure =
      smootherstep(
        Math.min(
          1,
          bottomDistance / 0.58
        )
      );

    radius *=
      bottomClosure;

    y =
      mix(
        -0.62,
        y,
        bottomClosure
      );


    /* -------------------------------------------------------
       INNER WALL

       Keep the inner sheet slightly inside the outer wall.
       The inset disappears at the sealed bottom seam.
       ------------------------------------------------------- */

    if (sheet === "inner") {

      const bottomSeam =
        1 -
        smootherstep(
          clamp(
            bottomDistance / 0.22
          )
        );

      const innerInset =
        0.045 *
        (
          1 -
          bottomSeam
        );

      radius *=
        1 -
        innerInset;
    }


    /* -------------------------------------------------------
       INNER SHEET -> FLAT SEAL

       Stage 1 only changes the inner sheet.

       IMPORTANT:
       use u as the disk angle, not phi.  phi collapses the
       handle interval onto the right wall, which creates a
       radial seam through the center of the seal.
       ------------------------------------------------------- */

    const FILL_END =
      0.38;

    const fillProgress =
      smootherstep(
        clamp(
          t / FILL_END
        )
      );

    if (sheet === "inner") {

      const innerS =
        clamp(
          (
            meridian -
            Math.PI
          ) /
          Math.PI
        );

      const sealY =
        0.695;

      const sealRadius =
        0.865;

      const diskRadius =
        sealRadius *
        Math.sqrt(
          innerS
        );


      /* original inner-wall point */

      const originalX =
        radius *
        Math.cos(phi);

      const originalY =
        y;

      const originalZ =
        radius *
        Math.sin(phi) *
        0.86;


      /* complete target disk */

      const diskX =
        diskRadius *
        Math.cos(u);

      const diskZ =
        diskRadius *
        Math.sin(u) *
        0.86;


      /*
        Only the outermost ring bends back toward the original
        inner rim.  Almost all of the filled surface is flat.
      */

      const collarStart =
        0.955;

      const collar =
        smootherstep(
          clamp(
            (
              innerS -
              collarStart
            ) /
            (
              1 -
              collarStart
            )
          )
        );

      const targetX =
        mix(
          diskX,
          originalX,
          collar
        );

      const targetY =
        mix(
          sealY,
          originalY,
          collar
        );

      const targetZ =
        mix(
          diskZ,
          originalZ,
          collar
        );


      /*
        Always return the inner sheet here.

        This prevents the handle-region code below from pulling
        the filled seal back into the handle geometry.
      */

      return {
        x:
          mix(
            originalX,
            targetX,
            fillProgress
          ),

        y:
          mix(
            originalY,
            targetY,
            fillProgress
          ),

        z:
          mix(
            originalZ,
            targetZ,
            fillProgress
          )
      };
    }


    /* -------------------------------------------------------
       FOOT — OUTER SHELL ONLY
       ------------------------------------------------------- */

    const foot =
      Math.exp(
        -Math.pow(
          (
            bottomDistance -
            0.58
          ) / 0.11,
          2
        )
      );

    radius +=
      0.075 *
      foot;

    y -=
      0.025 *
      foot;


    /* -------------------------------------------------------
       ROUNDED FLARED LIP — OUTER SHELL ONLY
       ------------------------------------------------------- */

    const rimDistance =
      Math.min(
        meridian,
        TWO_PI - meridian
      );

    const rimBand =
      Math.exp(
        -Math.pow(
          rimDistance / 0.18,
          2
        )
      );

    const rimTheta =
      clamp(
        rimDistance / 0.18,
        0,
        1
      ) *
      Math.PI *
      0.5;

    const lipOut =
      0.14 *
      Math.sin(
        rimTheta
      );

    const lipUp =
      0.055 *
      Math.cos(
        rimTheta
      );

    radius +=
      lipOut *
      rimBand;

    y +=
      lipUp *
      rimBand;


    return {
      x:
        radius *
        Math.cos(phi),

      y,

      z:
        radius *
        Math.sin(phi) *
        0.86
    };
  }


  /* =======================================================
     CUP CIRCUMFERENCE REMAPPING
     ======================================================= */

  let phi;

  if (
    signedU >=
    HANDLE_HALF_WIDTH
  ) {

    const q =
      (
        signedU -
        HANDLE_HALF_WIDTH
      ) /
      (
        Math.PI -
        HANDLE_HALF_WIDTH
      );

    phi =
      q *
      Math.PI;

  } else if (
    signedU <=
    -HANDLE_HALF_WIDTH
  ) {

    const q =
      (
        signedU +
        Math.PI
      ) /
      (
        Math.PI -
        HANDLE_HALF_WIDTH
      );

    phi =
      Math.PI +
      q *
      Math.PI;

  } else {

    /*
      The handle interval meets the right-hand side of the cup.
      This value is only used by the OUTER sheet; the INNER seal
      uses u directly as its disk angle.
    */

    phi = 0;
  }


  const body =
    cupBody(
      phi,
      v,
      sheet,
      u
    );


  /*
    The inner sheet is a complete vessel interior / seal.
    Never send it through the handle geometry.
  */

  if (sheet === "inner") {
    return body;
  }


  /* =======================================================
     HANDLE REGION — OUTER SHEET ONLY
     ======================================================= */

  if (
    signedU >
      -HANDLE_HALF_WIDTH &&
    signedU <
      HANDLE_HALF_WIDTH
  ) {

    const s =
      (
        signedU +
        HANDLE_HALF_WIDTH
      ) /
      (
        2 *
        HANDLE_HALF_WIDTH
      );

    const handle =
      handlePoint(
        s,
        v
      );

    const wall =
      cupBody(
        0,
        v,
        "outer",
        u
      );


    /*
      Keep a small root fused to the wall, then quickly become
      the clean rounded handle.
    */

    const rootWidth =
      0.10;

    const upperRelease =
      smootherstep(
        Math.min(
          1,
          s /
          rootWidth
        )
      );

    const lowerRelease =
      smootherstep(
        Math.min(
          1,
          (1 - s) /
          rootWidth
        )
      );

    const handleAmount =
      upperRelease *
      lowerRelease;

    const cleanHandleAmount =
      smootherstep(
        Math.min(
          1,
          handleAmount *
          2.4
        )
      );

    return mixPoint(
      wall,
      handle,
      cleanHandleAmount
    );
  }


  return body;
}


/* =========================================================
   TWO-STAGE MORPH

   Stage 1:
     The inner sheet rises and seals the cup.

   Stage 2:
     The EXISTING HANDLE HOLE expands inward across the seal.

   The center of the seal is deliberately reached late so the
   animation reads as one hole stretching, not a new hole being
   punched through the middle of the cup.
   ========================================================= */

function morphPoint(
  u,
  v,
  t,
  sheet = null
) {

  const FILL_END =
    0.38;

  const cup =
    teacup(
      u,
      v,
      t,
      sheet
    );

  const donut =
    torus(
      u,
      v
    );


  /* -------------------------------------------------------
     STAGE 1 — FILL ONLY
     ------------------------------------------------------- */

  if (t <= FILL_END) {
    return cup;
  }


  /* -------------------------------------------------------
     STAGE 2
     ------------------------------------------------------- */

  const stage2 =
    clamp(
      (
        t -
        FILL_END
      ) /
      (
        1 -
        FILL_END
      )
    );

  const signedU =
    Math.atan2(
      Math.sin(u),
      Math.cos(u)
    );

  const distanceFromHandle =
    Math.max(
      0,
      Math.abs(signedU) -
      HANDLE_HALF_WIDTH
    );

  const handleIdentity =
    1 -
    smootherstep(
      clamp(
        distanceFromHandle /
        0.72
      )
    );

  let localProgress;


  /* =====================================================
     INNER SEAL — OPEN FROM HANDLE SIDE
     ===================================================== */

  if (sheet === "inner") {

    const innerS =
      clamp(
        (
          v -
          Math.PI
        ) /
        Math.PI
      );

    const sealRadius =
      0.865;

    const r =
      sealRadius *
      Math.sqrt(
        innerS
      );

    const sealX =
      r *
      Math.cos(u);

    const sealZ =
      r *
      Math.sin(u) *
      0.86;


    /*
      Opening begins on the right side, just inside the handle
      roots.  Moving this slightly right makes the connection to
      the handle even more visually explicit.
    */

    const openingX =
      0.84;

    const openingZ =
      0;

    const distanceFromOpening =
      Math.hypot(
        sealX -
        openingX,

        (
          sealZ -
          openingZ
        ) / 0.86
      );


    /*
      Keep the first part of Stage 2 concentrated near the handle.
      The wave then sweeps across the seal.
    */

    const waveGrowth =
      smootherstep(
        stage2
      );

    const waveRadius =
      mix(
        0.015,
        1.95,
        waveGrowth
      );

    const feather =
      0.16;

    const reached =
      1 -
      smootherstep(
        clamp(
          (
            distanceFromOpening -
            waveRadius
          ) /
          feather
        )
      );


    /*
      A second center guard keeps the polar singularity of the
      disk pinned until the handle-side opening is already large.

      This is important: all u values coincide at innerS = 0.
      If they release too early, they visibly split into a new
      hole at the center.
    */

    const centerGuard =
      smootherstep(
        clamp(
          (
            stage2 -
            0.56 *
            (1 - innerS)
          ) /
          0.44
        )
      );

    const releasedT =
      smootherstep(
        stage2
      );

    localProgress =
      reached *
      centerGuard *
      releasedT;
  }


  /* =====================================================
     OUTER BODY + HANDLE
     ===================================================== */

  else {

    const bodyT =
      smootherstep(
        Math.pow(
          stage2,
          1.08
        )
      );

    const handleT =
      smootherstep(
        Math.pow(
          stage2,
          0.68
        )
      );

    localProgress =
      mix(
        bodyT,
        handleT,
        handleIdentity *
        0.76
      );
  }


  return mixPoint(
    cup,
    donut,
    localProgress
  );
}

  /* =========================================================
     CAMERA / PROJECTION
     ========================================================= */

  function project(
    point
  ) {

    let {
      x,
      y,
      z
    } = point;


    /*
      Current side-on-ish view.
    */

    const rotateY =
    -0.15;

    const rotateX =
      -0.45;


    /* Y rotation */

    const cosY =
      Math.cos(
        rotateY
      );

    const sinY =
      Math.sin(
        rotateY
      );


    const rx =
      x * cosY -
      z * sinY;

    const rz =
      x * sinY +
      z * cosY;


    x = rx;
    z = rz;


    /* X rotation */

    const cosX =
      Math.cos(
        rotateX
      );

    const sinX =
      Math.sin(
        rotateX
      );


    const ry =
      y * cosX -
      z * sinX;

    const rz2 =
      y * sinX +
      z * cosX;


    y = ry;
    z = rz2;


    /* perspective */

    const camera =
      5.5;


    const perspective =
      camera /
      (
        camera +
        z
      );


    const scale =
      Math.min(
        width,
        height
      ) *
      0.32;


    return {

      x:
        width / 2 +
        x *
        scale *
        perspective,

      y:
        height / 2 -
        y *
        scale *
        perspective,

      z
    };
  }


  /* =========================================================
     SHADING
     ========================================================= */

  const shadowBlue =
    [
      13,
      35,
      75
    ];

  const highlightBlue =
    [
      69,
      109,
      177
    ];


  const light = {
    x: -0.45,
    y: 0.75,
    z: 0.60
  };


  const lightLength =
    Math.hypot(
      light.x,
      light.y,
      light.z
    );


  light.x /=
    lightLength;

  light.y /=
    lightLength;

  light.z /=
    lightLength;


  function colorMix(
    dark,
    bright,
    amount
  ) {

    amount =
      clamp(amount);


    const r =
      Math.round(
        mix(
          dark[0],
          bright[0],
          amount
        )
      );

    const g =
      Math.round(
        mix(
          dark[1],
          bright[1],
          amount
        )
      );

    const b =
      Math.round(
        mix(
          dark[2],
          bright[2],
          amount
        )
      );


    return (
      `rgb(${r}, ${g}, ${b})`
    );
  }


  /* =========================================================
     RENDER SURFACE
     ========================================================= */

  function drawOpaqueSurface() {

    /*
      A little denser than before.

      The geometry itself matters more than resolution,
      but these values make the rounded handle cleaner.
    */

    const uFaces =
      108;

    const vFaces =
      72;


    const faces =
      [];


    for (
      let i = 0;
      i < uFaces;
      i++
    ) {

      const u0 =
        (
          i /
          uFaces
        ) *
        TWO_PI;

      const u1 =
        (
          (i + 1) /
          uFaces
        ) *
        TWO_PI;


      for (
        let j = 0;
        j < vFaces;
        j++
      ) {

        const v0 =
          (
            j /
            vFaces
          ) *
          TWO_PI;

        const v1 =
          (
            (j + 1) /
            vFaces
          ) *
          TWO_PI;

           /*
          First half of v = exterior cup sheet.
          Second half of v = interior cup sheet.

          Using the FACE midpoint lets us duplicate the shared
          v = PI seam logically:

            outer face gets an outer copy
            inner face gets an inner copy

          so the rising inner center no longer leaves a hole.
        */

        const vMid =
          (
            v0 +
            v1
          ) / 2;


        const sheet =
          vMid < Math.PI
            ? "outer"
            : "inner";

        const a =
          morphPoint(
            u0,
            v0,
            currentT,
            sheet
          );

        const b =
          morphPoint(
            u1,
            v0,
            currentT,
            sheet
          );

        const c =
          morphPoint(
            u1,
            v1,
            currentT,
            sheet
          );

        const d =
          morphPoint(
            u0,
            v1,
            currentT,
            sheet
          );


        const p00 =
          project(a);

        const p10 =
          project(b);

        const p11 =
          project(c);

        const p01 =
          project(d);


        /* face normal */

        const ab = {
          x:
            b.x - a.x,

          y:
            b.y - a.y,

          z:
            b.z - a.z
        };


        const ad = {
          x:
            d.x - a.x,

          y:
            d.y - a.y,

          z:
            d.z - a.z
        };


        let nx =
          ab.y * ad.z -
          ab.z * ad.y;

        let ny =
          ab.z * ad.x -
          ab.x * ad.z;

        let nz =
          ab.x * ad.y -
          ab.y * ad.x;


        const normalLength =
          Math.hypot(
            nx,
            ny,
            nz
          ) || 1;


        nx /=
          normalLength;

        ny /=
          normalLength;

        nz /=
          normalLength;


        const diffuse =
          Math.abs(
            nx * light.x +
            ny * light.y +
            nz * light.z
          );


        const brightness =
          0.22 +
          diffuse *
          0.78;


        const color =
          colorMix(
            shadowBlue,
            highlightBlue,
            brightness
          );


        const depth =
          (
            p00.z +
            p10.z +
            p11.z +
            p01.z
          ) /
          4;


        faces.push({
          p00,
          p10,
          p11,
          p01,
          depth,
          color
        });
      }
    }


    /*
      Back-to-front painter's algorithm.
    */

    faces.sort(
      (a, b) =>
        b.depth -
        a.depth
    );


    ctx.save();

    ctx.globalAlpha =
      1;


    for (
      const face
      of faces
    ) {

      ctx.beginPath();

      ctx.moveTo(
        face.p00.x,
        face.p00.y
      );

      ctx.lineTo(
        face.p10.x,
        face.p10.y
      );

      ctx.lineTo(
        face.p11.x,
        face.p11.y
      );

      ctx.lineTo(
        face.p01.x,
        face.p01.y
      );

      ctx.closePath();

      ctx.fillStyle =
        face.color;

      ctx.fill();
    }


    ctx.restore();
  }

  /* =========================================================
     DRAW
     ========================================================= */
function drawSurface() {

  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  /*
    Main topology surface.
  */

  drawOpaqueSurface();
}


  /* =========================================================
     ANIMATION
     ========================================================= */

  function animate() {

    currentT +=
      (
        targetT -
        currentT
      ) *
      0.055;


    drawSurface();


    requestAnimationFrame(
      animate
    );
  }


  /* =========================================================
     POINTER
     ========================================================= */

  function setMorphFromPointer(
    event
  ) {

    const rect =
      wrap.getBoundingClientRect();


    const x =
      (
        event.clientX -
        rect.left
      ) /
      rect.width;


    targetT =
      clamp(x);
  }


  wrap.addEventListener(
    "pointerenter",
    (event) => {

      pointerInside =
        true;

      setMorphFromPointer(
        event
      );
    }
  );


  wrap.addEventListener(
    "pointermove",
    (event) => {

      if (
        !pointerInside
      ) {
        return;
      }

      setMorphFromPointer(
        event
      );
    }
  );


  wrap.addEventListener(
    "pointerleave",
    () => {

      pointerInside =
        false;

      targetT =
        0;
    }
  );


  window.addEventListener(
    "resize",
    resize
  );


  /* =========================================================
     START
     ========================================================= */

  resize();

  requestAnimationFrame(
    animate
  );

})();